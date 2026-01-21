from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from customer_models import CustomerCreate, CustomerLogin, Customer, MercadoPagoConfig
from models import Order, OrderCreate
from auth import verify_password, get_password_hash, create_access_token
from datetime import datetime
from bson import ObjectId
import uuid
import os

router = APIRouter()

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
