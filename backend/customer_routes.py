from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from customer_models import CustomerCreate, CustomerLogin, Customer, MercadoPagoConfig
from models import Order, OrderCreate
from auth import verify_password, get_password_hash, create_access_token, decode_access_token
from datetime import datetime
from bson import ObjectId
import uuid
import os
import secrets
import asyncio
import resend

router = APIRouter()

# Configure Resend
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://prazeres.preview.emergentagent.com')

async def send_password_reset_email(to_email: str, reset_token: str, customer_name: str):
    """Send password reset email using Resend"""
    reset_link = f"{FRONTEND_URL}/esqueci-senha?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recuperação de Senha</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2389a3; margin-bottom: 10px;">Acqua Park Prazeres da Serra</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2389a3; margin-top: 0;">Olá, {customer_name}!</h2>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="background: linear-gradient(135deg, #46bfec 0%, #2389a3 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold;
                          display: inline-block;">
                    Redefinir Minha Senha
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                Este link expira em <strong>1 hora</strong>.
            </p>
            
            <p style="color: #666; font-size: 14px;">
                Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá a mesma.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>© 2026 Acqua Park Prazeres da Serra. Todos os direitos reservados.</p>
            <p>Este é um email automático, por favor não responda.</p>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": "Recuperação de Senha - Acqua Park Prazeres da Serra",
        "html": html_content
    }
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {"success": True, "email_id": email.get("id")}
    except Exception as e:
        print(f"Error sending email: {e}")
        return {"success": False, "error": str(e)}

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.db

# ============= CUSTOMER AUTH ROUTES =============

@router.post('/api/customers/register')
async def register_customer(
    customer_data: CustomerCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if email already exists
    existing = await db.customers.find_one({'email': customer_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email já cadastrado'
        )
    
    # Check if document already exists
    existing_doc = await db.customers.find_one({'document': customer_data.document})
    if existing_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='CPF já cadastrado'
        )
    
    # Create customer
    customer_dict = customer_data.dict()
    customer_dict['hashed_password'] = get_password_hash(customer_data.password)
    del customer_dict['password']
    customer_dict['created_at'] = datetime.utcnow()
    
    result = await db.customers.insert_one(customer_dict)
    customer_dict['_id'] = str(result.inserted_id)
    
    # Create access token
    access_token = create_access_token(data={'sub': customer_data.email, 'type': 'customer'})
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'customer': {
            'id': str(result.inserted_id),
            'name': customer_data.name,
            'email': customer_data.email,
            'phone': customer_data.phone
        }
    }

@router.post('/api/customers/login')
async def login_customer(
    login_data: CustomerLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    customer = await db.customers.find_one({'email': login_data.email})
    if not customer or not verify_password(login_data.password, customer['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Email ou senha incorretos'
        )
    
    access_token = create_access_token(data={'sub': customer['email'], 'type': 'customer'})
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'customer': {
            'id': str(customer['_id']),
            'name': customer['name'],
            'email': customer['email'],
            'phone': customer['phone']
        }
    }

@router.get('/api/customers/me')
async def get_customer_info(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Token não fornecido')
    
    token = auth_header.split(' ')[1]
    from auth import decode_access_token
    payload = decode_access_token(token)
    
    if not payload or payload.get('type') != 'customer':
        raise HTTPException(status_code=401, detail='Token inválido')
    
    customer = await db.customers.find_one({'email': payload['sub']})
    if not customer:
        raise HTTPException(status_code=404, detail='Cliente não encontrado')
    
    return {
        'id': str(customer['_id']),
        'name': customer['name'],
        'email': customer['email'],
        'phone': customer['phone'],
        'document': customer['document']
    }

# ============= CUSTOMER PASSWORD MANAGEMENT =============

@router.post('/api/customers/change-password')
async def change_customer_password(
    password_data: dict,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Token não fornecido')
    
    token = auth_header.split(' ')[1]
    payload = decode_access_token(token)
    
    if not payload or payload.get('type') != 'customer':
        raise HTTPException(status_code=401, detail='Token inválido')
    
    current_password = password_data.get('current_password')
    new_password = password_data.get('new_password')
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail='Senha atual e nova senha são obrigatórias')
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail='A nova senha deve ter pelo menos 6 caracteres')
    
    customer = await db.customers.find_one({'email': payload['sub']})
    if not customer:
        raise HTTPException(status_code=404, detail='Cliente não encontrado')
    
    if not verify_password(current_password, customer['hashed_password']):
        raise HTTPException(status_code=400, detail='Senha atual incorreta')
    
    await db.customers.update_one(
        {'email': payload['sub']},
        {'$set': {'hashed_password': get_password_hash(new_password)}}
    )
    
    return {'message': 'Senha alterada com sucesso'}

@router.post('/api/customers/forgot-password')
async def forgot_password(
    data: dict,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    email = data.get('email')
    if not email:
        raise HTTPException(status_code=400, detail='Email é obrigatório')
    
    customer = await db.customers.find_one({'email': email})
    if not customer:
        # Return success even if email not found (security)
        return {'message': 'Se o email existir, você receberá instruções de recuperação'}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_expires = datetime.utcnow().timestamp() + 3600  # 1 hour
    
    await db.customers.update_one(
        {'email': email},
        {'$set': {
            'reset_token': reset_token,
            'reset_expires': reset_expires
        }}
    )
    
    # Send password reset email
    email_result = await send_password_reset_email(
        to_email=email,
        reset_token=reset_token,
        customer_name=customer.get('name', 'Cliente')
    )
    
    if email_result.get('success'):
        return {'message': 'Email de recuperação enviado! Verifique sua caixa de entrada.'}
    else:
        # Log error but don't expose to user
        print(f"Email sending failed: {email_result.get('error')}")
        return {'message': 'Se o email existir, você receberá instruções de recuperação'}

@router.post('/api/customers/reset-password')
async def reset_password(
    data: dict,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        raise HTTPException(status_code=400, detail='Token e nova senha são obrigatórios')
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail='A senha deve ter pelo menos 6 caracteres')
    
    customer = await db.customers.find_one({'reset_token': token})
    if not customer:
        raise HTTPException(status_code=400, detail='Token inválido ou expirado')
    
    if customer.get('reset_expires', 0) < datetime.utcnow().timestamp():
        raise HTTPException(status_code=400, detail='Token expirado')
    
    await db.customers.update_one(
        {'_id': customer['_id']},
        {
            '$set': {'hashed_password': get_password_hash(new_password)},
            '$unset': {'reset_token': '', 'reset_expires': ''}
        }
    )
    
    return {'message': 'Senha redefinida com sucesso'}

# ============= CUSTOMER ORDERS =============

@router.get('/api/customers/my-orders')
async def get_customer_orders(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Token não fornecido')
    
    token = auth_header.split(' ')[1]
    from auth import decode_access_token
    payload = decode_access_token(token)
    
    if not payload or payload.get('type') != 'customer':
        raise HTTPException(status_code=401, detail='Token inválido')
    
    # Get customer orders
    orders = await db.orders.find({'customer.email': payload['sub']}).sort('created_at', -1).to_list(100)
    for order in orders:
        order['_id'] = str(order['_id'])
    
    return orders

# ============= MERCADO PAGO CONFIG (ADMIN) =============

@router.post('/api/admin/mercadopago-config')
async def save_mercadopago_config(
    config: MercadoPagoConfig,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    config_dict = config.dict()
    config_dict['updated_at'] = datetime.utcnow()
    
    # Upsert config
    await db.mercadopago_config.update_one(
        {},
        {'$set': config_dict},
        upsert=True
    )
    
    return {'message': 'Configuração do Mercado Pago salva com sucesso'}

@router.get('/api/admin/mercadopago-config')
async def get_mercadopago_config(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    config = await db.mercadopago_config.find_one({})
    if not config:
        return {'access_token': '', 'public_key': '', 'webhook_secret': ''}
    
    config['_id'] = str(config['_id'])
    return config

@router.get('/api/mercadopago-public-key')
async def get_mercadopago_public_key(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    config = await db.mercadopago_config.find_one({})
    if not config:
        raise HTTPException(status_code=404, detail='Mercado Pago não configurado')
    
    return {'public_key': config.get('public_key', '')}

# ============= MERCADO PAGO PAYMENT =============

@router.post('/api/create-payment-preference')
async def create_payment_preference(
    order_data: OrderCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        # Check ticket availability for the date
        availability = await db.ticket_availability.find_one({
            'date': order_data.visit_date,
            'is_active': True
        })
        
        if availability:
            total_quantity = sum(item['quantity'] for item in order_data.items)
            available_tickets = availability['total_tickets'] - availability['tickets_sold']
            
            if available_tickets < total_quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f'Apenas {available_tickets} ingressos disponíveis para esta data'
                )
        
        # Get Mercado Pago config
        config = await db.mercadopago_config.find_one({})
        if not config:
            raise HTTPException(status_code=400, detail='Mercado Pago não configurado')
        
        # Install mercadopago if needed
        import importlib.util
        if importlib.util.find_spec('mercadopago') is None:
            import subprocess
            subprocess.run(['pip', 'install', 'mercadopago'], check=True)
        
        import mercadopago
        sdk = mercadopago.SDK(config['access_token'])
        
        # Create order in database with unique ticket code
        order_id = f"ORDER-{uuid.uuid4().hex[:8].upper()}"
        ticket_code = f"TKT-{uuid.uuid4().hex[:12].upper()}"
        
        order_dict = order_data.dict()
        order_dict['order_id'] = order_id
        order_dict['ticket_code'] = ticket_code
        order_dict['payment_status'] = 'pending'
        order_dict['validated'] = False
        order_dict['created_at'] = datetime.utcnow()
        order_dict['updated_at'] = datetime.utcnow()
        
        result = await db.orders.insert_one(order_dict)
        
        # Update ticket availability
        if availability:
            total_quantity = sum(item['quantity'] for item in order_data.items)
            await db.ticket_availability.update_one(
                {'date': order_data.visit_date},
                {'$inc': {'tickets_sold': total_quantity}}
            )
        
        # Get ticket names
        ticket_items = []
        for item in order_data.items:
            ticket = await db.tickets.find_one({'ticket_id': item['ticketId']})
            if ticket:
                ticket_items.append({
                    'title': ticket['name'],
                    'quantity': item['quantity'],
                    'unit_price': float(item['unitPrice'])
                })
        
        # Create Mercado Pago preference
        preference_data = {
            'items': ticket_items,
            'payer': {
                'name': order_data.customer['name'],
                'email': order_data.customer['email'],
                'phone': {
                    'area_code': order_data.customer.get('phone', '')[:2],
                    'number': order_data.customer.get('phone', '')[2:]
                }
            },
            'external_reference': order_id,
            'back_urls': {
                'success': f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/pagamento/sucesso",
                'failure': f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/pagamento/erro",
                'pending': f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/pagamento/pendente"
            },
            'auto_return': 'approved',
            'notification_url': f"{os.getenv('BACKEND_URL', 'http://localhost:8001')}/api/webhooks/mercadopago"
        }
        
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response['response']
        
        # Update order with preference ID
        await db.orders.update_one(
            {'_id': result.inserted_id},
            {'$set': {'mercado_pago_preference_id': preference['id']}}
        )
        
        return {
            'order_id': order_id,
            'preference_id': preference['id'],
            'init_point': preference['init_point'],
            'sandbox_init_point': preference.get('sandbox_init_point', preference['init_point'])
        }
        
    except Exception as e:
        print(f"Error creating payment preference: {str(e)}")
        raise HTTPException(status_code=500, detail=f'Erro ao criar preferência de pagamento: {str(e)}')

# ============= MERCADO PAGO WEBHOOK =============

@router.post('/api/webhooks/mercadopago')
async def mercadopago_webhook(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        data = await request.json()
        
        # Get payment info
        if data.get('type') == 'payment':
            payment_id = data['data']['id']
            
            # Get Mercado Pago config
            config = await db.mercadopago_config.find_one({})
            if not config:
                return {'status': 'error', 'message': 'Config not found'}
            
            import mercadopago
            sdk = mercadopago.SDK(config['access_token'])
            
            payment_info = sdk.payment().get(payment_id)
            payment = payment_info['response']
            
            # Update order status
            order_id = payment.get('external_reference')
            if order_id:
                status_map = {
                    'approved': 'approved',
                    'pending': 'pending',
                    'in_process': 'pending',
                    'rejected': 'rejected',
                    'cancelled': 'cancelled',
                    'refunded': 'refunded'
                }
                
                await db.orders.update_one(
                    {'order_id': order_id},
                    {
                        '$set': {
                            'payment_status': status_map.get(payment['status'], 'pending'),
                            'payment_id': str(payment_id),
                            'updated_at': datetime.utcnow()
                        }
                    }
                )
        
        return {'status': 'success'}
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {'status': 'error', 'message': str(e)}
