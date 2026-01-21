from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from ticket_models import (
    TicketAvailability, TicketAvailabilityCreate, TicketAvailabilityUpdate,
    StaffUserCreate, StaffLogin, TicketValidation
)
from auth import verify_password, get_password_hash, create_access_token, decode_access_token
from datetime import datetime, timedelta
from bson import ObjectId
import uuid
import qrcode
import io
import base64

router = APIRouter()

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.db

# ============= TICKET AVAILABILITY (ADMIN) =============

@router.get('/api/admin/ticket-availability')
async def get_ticket_availability(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    availabilities = await db.ticket_availability.find({}).sort('date', 1).to_list(100)
    for item in availabilities:
        item['_id'] = str(item['_id'])
    return availabilities

@router.post('/api/admin/ticket-availability')
async def create_ticket_availability(
    availability: TicketAvailabilityCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if date already exists
    existing = await db.ticket_availability.find_one({'date': availability.date})
    if existing:
        raise HTTPException(status_code=400, detail='Disponibilidade já existe para esta data')
    
    availability_dict = availability.dict()
    availability_dict['tickets_sold'] = 0
    availability_dict['is_active'] = True
    availability_dict['created_at'] = datetime.utcnow()
    availability_dict['updated_at'] = datetime.utcnow()
    
    result = await db.ticket_availability.insert_one(availability_dict)
    return {'id': str(result.inserted_id), 'message': 'Disponibilidade criada com sucesso'}

@router.put('/api/admin/ticket-availability/{date}')
async def update_ticket_availability(
    date: str,
    availability: TicketAvailabilityUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = {k: v for k, v in availability.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.ticket_availability.update_one(
        {'date': date},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Disponibilidade não encontrada')
    
    return {'message': 'Disponibilidade atualizada com sucesso'}

@router.delete('/api/admin/ticket-availability/{date}')
async def delete_ticket_availability(
    date: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db.ticket_availability.delete_one({'date': date})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Disponibilidade não encontrada')
    
    return {'message': 'Disponibilidade removida com sucesso'}

# Check availability before creating order
@router.get('/api/check-availability/{date}')
async def check_availability(
    date: str,
    quantity: int,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    availability = await db.ticket_availability.find_one({'date': date, 'is_active': True})
    
    if not availability:
        return {'available': False, 'message': 'Não há disponibilidade configurada para esta data'}
    
    available_tickets = availability['total_tickets'] - availability['tickets_sold']
    
    if available_tickets >= quantity:
        return {'available': True, 'remaining': available_tickets}
    else:
        return {'available': False, 'remaining': available_tickets, 'message': f'Apenas {available_tickets} ingressos disponíveis'}

# ============= STAFF MANAGEMENT (ADMIN) =============

@router.post('/api/admin/staff')
async def create_staff(
    staff_data: StaffUserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if email already exists
    existing = await db.staff_users.find_one({'email': staff_data.email})
    if existing:
        raise HTTPException(status_code=400, detail='Email já cadastrado')
    
    staff_dict = staff_data.dict()
    staff_dict['hashed_password'] = get_password_hash(staff_data.password)
    del staff_dict['password']
    staff_dict['role'] = 'staff'
    staff_dict['is_active'] = True
    staff_dict['created_at'] = datetime.utcnow()
    
    result = await db.staff_users.insert_one(staff_dict)
    return {'id': str(result.inserted_id), 'message': 'Funcionário criado com sucesso'}

@router.get('/api/admin/staff')
async def get_staff(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    staff_list = await db.staff_users.find({}).to_list(100)
    for staff in staff_list:
        staff['_id'] = str(staff['_id'])
        del staff['hashed_password']
    return staff_list

@router.delete('/api/admin/staff/{staff_id}')
async def delete_staff(
    staff_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db.staff_users.delete_one({'_id': ObjectId(staff_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Funcionário não encontrado')
    
    return {'message': 'Funcionário removido com sucesso'}

# ============= STAFF LOGIN =============

@router.post('/api/staff/login')
async def staff_login(
    login_data: StaffLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    staff = await db.staff_users.find_one({'email': login_data.email})
    if not staff or not verify_password(login_data.password, staff['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Email ou senha incorretos'
        )
    
    if not staff.get('is_active', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Conta desativada'
        )
    
    access_token = create_access_token(data={'sub': staff['email'], 'type': 'staff'})
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'staff': {
            'id': str(staff['_id']),
            'name': staff['name'],
            'email': staff['email'],
            'role': staff.get('role', 'staff')
        }
    }

@router.get('/api/staff/me')
async def get_staff_info(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Token não fornecido')
    
    token = auth_header.split(' ')[1]
    payload = decode_access_token(token)
    
    if not payload or payload.get('type') != 'staff':
        raise HTTPException(status_code=401, detail='Token inválido')
    
    staff = await db.staff_users.find_one({'email': payload['sub']})
    if not staff:
        raise HTTPException(status_code=404, detail='Funcionário não encontrado')
    
    return {
        'id': str(staff['_id']),
        'name': staff['name'],
        'email': staff['email'],
        'role': staff.get('role', 'staff')
    }

# ============= TICKET VALIDATION =============

@router.post('/api/staff/validate-ticket')
async def validate_ticket(
    validation_data: dict,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Get staff info
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Token não fornecido')
    
    token = auth_header.split(' ')[1]
    payload = decode_access_token(token)
    
    if not payload or payload.get('type') != 'staff':
        raise HTTPException(status_code=401, detail='Token inválido')
    
    staff = await db.staff_users.find_one({'email': payload['sub']})
    if not staff:
        raise HTTPException(status_code=404, detail='Funcionário não encontrado')
    
    # Find order by ticket code
    ticket_code = validation_data.get('ticket_code')
    order = await db.orders.find_one({'ticket_code': ticket_code})
    
    if not order:
        raise HTTPException(status_code=404, detail='Ingresso não encontrado')
    
    # Check if already validated
    if order.get('validated', False):
        return {
            'valid': False,
            'message': 'Ingresso já foi utilizado',
            'validated_at': order.get('validated_at'),
            'validated_by': order.get('validated_by_name')
        }
    
    # Check payment status
    if order.get('payment_status') != 'approved':
        return {
            'valid': False,
            'message': f'Pagamento não aprovado. Status: {order.get("payment_status")}'
        }
    
    # Validate ticket
    await db.orders.update_one(
        {'_id': order['_id']},
        {
            '$set': {
                'validated': True,
                'validated_at': datetime.utcnow(),
                'validated_by': str(staff['_id']),
                'validated_by_name': staff['name']
            }
        }
    )
    
    return {
        'valid': True,
        'message': 'Ingresso validado com sucesso!',
        'order': {
            'order_id': order['order_id'],
            'customer_name': order['customer']['name'],
            'visit_date': order['visit_date'],
            'total_amount': order['total_amount'],
            'items': order['items']
        }
    }

@router.get('/api/staff/ticket-info/{ticket_code}')
async def get_ticket_info(
    ticket_code: str,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Verify staff token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Token não fornecido')
    
    token = auth_header.split(' ')[1]
    payload = decode_access_token(token)
    
    if not payload or payload.get('type') != 'staff':
        raise HTTPException(status_code=401, detail='Token inválido')
    
    # Find order
    order = await db.orders.find_one({'ticket_code': ticket_code})
    
    if not order:
        raise HTTPException(status_code=404, detail='Ingresso não encontrado')
    
    return {
        'order_id': order['order_id'],
        'ticket_code': order['ticket_code'],
        'customer_name': order['customer']['name'],
        'visit_date': order['visit_date'],
        'total_amount': order['total_amount'],
        'payment_status': order['payment_status'],
        'validated': order.get('validated', False),
        'validated_at': order.get('validated_at'),
        'validated_by_name': order.get('validated_by_name'),
        'items': order['items']
    }