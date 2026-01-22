from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import (
    UserLogin, Token, Attraction, AttractionCreate, AttractionUpdate,
    Ticket, TicketCreate, TicketUpdate, ParkInfo, ParkInfoUpdate,
    Testimonial, TestimonialCreate, TestimonialUpdate,
    FAQ, FAQCreate, FAQUpdate, Contact, ContactCreate, Order, OrderCreate
)
from auth import verify_password, create_access_token, get_current_admin_user
from datetime import datetime, timedelta
from bson import ObjectId
import uuid
import os
import shutil
from pathlib import Path

router = APIRouter()

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.db

# ============= AUTH ROUTES =============

@router.post('/api/auth/login', response_model=Token)
async def login(user_data: UserLogin, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db.users.find_one({'email': user_data.email})
    if not user or not verify_password(user_data.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Email ou senha incorretos'
        )
    
    if not user.get('is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Acesso negado. Apenas administradores podem acessar.'
        )
    
    access_token = create_access_token(data={'sub': user['email']})
    return {'access_token': access_token, 'token_type': 'bearer'}

@router.get('/api/auth/me')
async def get_current_user_info(
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await db.users.find_one({'email': current_user['email']})
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')
    return {'email': user['email'], 'is_admin': user.get('is_admin', False)}

# ============= FILE UPLOAD =============

@router.post('/api/upload')
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_admin_user)
):
    # Create uploads directory if it doesn't exist
    upload_dir = Path('/app/frontend/public/uploads')
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    file_url = f"/uploads/{unique_filename}"
    return {'url': file_url, 'filename': unique_filename}

# ============= ATTRACTIONS ROUTES =============

@router.get('/api/attractions')
async def get_attractions(
    category: str = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {'is_active': True}
    if category and category != 'all':
        query['category'] = category
    
    attractions = await db.attractions.find(query).to_list(100)
    for attraction in attractions:
        attraction['_id'] = str(attraction['_id'])
    return attractions

@router.get('/api/attractions/{attraction_id}')
async def get_attraction(
    attraction_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    attraction = await db.attractions.find_one({'_id': ObjectId(attraction_id)})
    if not attraction:
        raise HTTPException(status_code=404, detail='Atração não encontrada')
    attraction['_id'] = str(attraction['_id'])
    return attraction

@router.post('/api/admin/attractions')
async def create_attraction(
    attraction: AttractionCreate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    attraction_dict = attraction.dict()
    attraction_dict['is_active'] = True
    attraction_dict['created_at'] = datetime.utcnow()
    attraction_dict['updated_at'] = datetime.utcnow()
    
    result = await db.attractions.insert_one(attraction_dict)
    return {'id': str(result.inserted_id), 'message': 'Atração criada com sucesso'}

@router.put('/api/admin/attractions/{attraction_id}')
async def update_attraction(
    attraction_id: str,
    attraction: AttractionUpdate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = {k: v for k, v in attraction.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.attractions.update_one(
        {'_id': ObjectId(attraction_id)},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Atração não encontrada')
    
    return {'message': 'Atração atualizada com sucesso'}

@router.delete('/api/admin/attractions/{attraction_id}')
async def delete_attraction(
    attraction_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db.attractions.update_one(
        {'_id': ObjectId(attraction_id)},
        {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Atração não encontrada')
    
    return {'message': 'Atração removida com sucesso'}

# ============= TICKETS ROUTES =============

@router.get('/api/tickets')
async def get_tickets(db: AsyncIOMotorDatabase = Depends(get_database)):
    tickets = await db.tickets.find({'is_active': True}).to_list(100)
    for ticket in tickets:
        ticket['_id'] = str(ticket['_id'])
    return tickets

@router.get('/api/tickets/{ticket_id}')
async def get_ticket(
    ticket_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    ticket = await db.tickets.find_one({'ticket_id': ticket_id, 'is_active': True})
    if not ticket:
        raise HTTPException(status_code=404, detail='Ingresso não encontrado')
    ticket['_id'] = str(ticket['_id'])
    return ticket

@router.post('/api/admin/tickets')
async def create_ticket(
    ticket: TicketCreate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if ticket_id already exists
    existing = await db.tickets.find_one({'ticket_id': ticket.ticket_id})
    if existing:
        raise HTTPException(status_code=400, detail='ID do ingresso já existe')
    
    ticket_dict = ticket.dict()
    ticket_dict['is_active'] = True
    ticket_dict['created_at'] = datetime.utcnow()
    ticket_dict['updated_at'] = datetime.utcnow()
    
    result = await db.tickets.insert_one(ticket_dict)
    return {'id': str(result.inserted_id), 'message': 'Ingresso criado com sucesso'}

@router.put('/api/admin/tickets/{ticket_id}')
async def update_ticket(
    ticket_id: str,
    ticket: TicketUpdate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = {k: v for k, v in ticket.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.tickets.update_one(
        {'ticket_id': ticket_id},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Ingresso não encontrado')
    
    return {'message': 'Ingresso atualizado com sucesso'}

@router.delete('/api/admin/tickets/{ticket_id}')
async def delete_ticket(
    ticket_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db.tickets.update_one(
        {'ticket_id': ticket_id},
        {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Ingresso não encontrado')
    
    return {'message': 'Ingresso removido com sucesso'}

# ============= PARK INFO ROUTES =============

@router.get('/api/park-info')
async def get_park_info(db: AsyncIOMotorDatabase = Depends(get_database)):
    park_info = await db.park_info.find_one({})
    if not park_info:
        raise HTTPException(status_code=404, detail='Informações do parque não encontradas')
    park_info['_id'] = str(park_info['_id'])
    return park_info

@router.put('/api/admin/park-info')
async def update_park_info(
    park_info: ParkInfoUpdate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = {k: v for k, v in park_info.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.park_info.update_one(
        {},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Informações do parque não encontradas')
    
    return {'message': 'Informações atualizadas com sucesso'}

# ============= TESTIMONIALS ROUTES =============

@router.get('/api/testimonials')
async def get_testimonials(db: AsyncIOMotorDatabase = Depends(get_database)):
    testimonials = await db.testimonials.find({'is_active': True}).to_list(100)
    for testimonial in testimonials:
        testimonial['_id'] = str(testimonial['_id'])
    return testimonials

@router.post('/api/admin/testimonials')
async def create_testimonial(
    testimonial: TestimonialCreate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    testimonial_dict = testimonial.dict()
    testimonial_dict['is_active'] = True
    testimonial_dict['created_at'] = datetime.utcnow()
    
    result = await db.testimonials.insert_one(testimonial_dict)
    return {'id': str(result.inserted_id), 'message': 'Depoimento criado com sucesso'}

@router.put('/api/admin/testimonials/{testimonial_id}')
async def update_testimonial(
    testimonial_id: str,
    testimonial: TestimonialUpdate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = {k: v for k, v in testimonial.dict().items() if v is not None}
    
    result = await db.testimonials.update_one(
        {'_id': ObjectId(testimonial_id)},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Depoimento não encontrado')
    
    return {'message': 'Depoimento atualizado com sucesso'}

@router.delete('/api/admin/testimonials/{testimonial_id}')
async def delete_testimonial(
    testimonial_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db.testimonials.update_one(
        {'_id': ObjectId(testimonial_id)},
        {'$set': {'is_active': False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Depoimento não encontrado')
    
    return {'message': 'Depoimento removido com sucesso'}

# ============= FAQ ROUTES =============

@router.get('/api/faqs')
async def get_faqs(db: AsyncIOMotorDatabase = Depends(get_database)):
    faqs = await db.faqs.find({'is_active': True}).sort('order', 1).to_list(100)
    for faq in faqs:
        faq['_id'] = str(faq['_id'])
    return faqs

@router.post('/api/admin/faqs')
async def create_faq(
    faq: FAQCreate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    faq_dict = faq.dict()
    faq_dict['is_active'] = True
    faq_dict['created_at'] = datetime.utcnow()
    
    result = await db.faqs.insert_one(faq_dict)
    return {'id': str(result.inserted_id), 'message': 'FAQ criada com sucesso'}

@router.put('/api/admin/faqs/{faq_id}')
async def update_faq(
    faq_id: str,
    faq: FAQUpdate,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = {k: v for k, v in faq.dict().items() if v is not None}
    
    result = await db.faqs.update_one(
        {'_id': ObjectId(faq_id)},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='FAQ não encontrada')
    
    return {'message': 'FAQ atualizada com sucesso'}

@router.delete('/api/admin/faqs/{faq_id}')
async def delete_faq(
    faq_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db.faqs.update_one(
        {'_id': ObjectId(faq_id)},
        {'$set': {'is_active': False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='FAQ não encontrada')
    
    return {'message': 'FAQ removida com sucesso'}

# ============= CONTACT ROUTES =============

@router.post('/api/contact')
async def create_contact(
    contact: ContactCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    contact_dict = contact.dict()
    contact_dict['status'] = 'new'
    contact_dict['created_at'] = datetime.utcnow()
    
    result = await db.contacts.insert_one(contact_dict)
    return {'id': str(result.inserted_id), 'message': 'Mensagem enviada com sucesso!'}

@router.get('/api/admin/contacts')
async def get_contacts(
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    contacts = await db.contacts.find({}).sort('created_at', -1).to_list(100)
    for contact in contacts:
        contact['_id'] = str(contact['_id'])
    return contacts

@router.patch('/api/admin/contacts/{contact_id}/status')
async def update_contact_status(
    contact_id: str,
    status: dict,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db.contacts.update_one(
        {'_id': ObjectId(contact_id)},
        {'$set': {'status': status['status']}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Mensagem não encontrada')
    
    return {'message': 'Status atualizado com sucesso'}

# ============= ORDERS ROUTES =============

@router.post('/api/orders')
async def create_order(
    order: OrderCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    order_id = f"ORDER-{uuid.uuid4().hex[:8].upper()}"
    order_dict = order.dict()
    order_dict['order_id'] = order_id
    order_dict['payment_status'] = 'pending'
    order_dict['created_at'] = datetime.utcnow()
    order_dict['updated_at'] = datetime.utcnow()
    
    result = await db.orders.insert_one(order_dict)
    return {'order_id': order_id, 'id': str(result.inserted_id), 'message': 'Pedido criado com sucesso'}

@router.get('/api/admin/orders')
async def get_orders(
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    orders = await db.orders.find({}).sort('created_at', -1).to_list(100)
    for order in orders:
        order['_id'] = str(order['_id'])
    return orders

@router.get('/api/orders/{order_id}')
async def get_order(
    order_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    order = await db.orders.find_one({'order_id': order_id})
    if not order:
        raise HTTPException(status_code=404, detail='Pedido não encontrado')
    order['_id'] = str(order['_id'])
    return order

# ============= DASHBOARD STATS =============

@router.get('/api/admin/dashboard-stats')
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    total_attractions = await db.attractions.count_documents({'is_active': True})
    total_tickets = await db.tickets.count_documents({'is_active': True})
    total_orders = await db.orders.count_documents({})
    total_contacts = await db.contacts.count_documents({})
    new_contacts = await db.contacts.count_documents({'status': 'new'})
    
    # Recent orders
    recent_orders = await db.orders.find({}).sort('created_at', -1).limit(5).to_list(5)
    for order in recent_orders:
        order['_id'] = str(order['_id'])
    
    return {
        'total_attractions': total_attractions,
        'total_tickets': total_tickets,
        'total_orders': total_orders,
        'total_contacts': total_contacts,
        'new_contacts': new_contacts,
        'recent_orders': recent_orders
    }

# ============= HERO SLIDES ROUTES =============

@router.get('/api/hero-slides')
async def get_hero_slides(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get all active hero slides ordered by position"""
    slides = await db.hero_slides.find({'is_active': True}).sort('position', 1).to_list(20)
    for slide in slides:
        slide['_id'] = str(slide['_id'])
    return slides

@router.get('/api/admin/hero-slides')
async def get_all_hero_slides(
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all hero slides for admin (including inactive)"""
    slides = await db.hero_slides.find({}).sort('position', 1).to_list(50)
    for slide in slides:
        slide['_id'] = str(slide['_id'])
    return slides

@router.post('/api/admin/hero-slides')
async def create_hero_slide(
    slide_data: dict,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new hero slide"""
    # Get max position
    max_pos_slide = await db.hero_slides.find_one({}, sort=[('position', -1)])
    next_position = (max_pos_slide['position'] + 1) if max_pos_slide else 0
    
    slide = {
        'image_url': slide_data.get('image_url', ''),
        'title': slide_data.get('title', ''),
        'subtitle': slide_data.get('subtitle', ''),
        'button_text': slide_data.get('button_text', 'Comprar Ingressos'),
        'button_link': slide_data.get('button_link', '/ingressos'),
        'position': next_position,
        'is_active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = await db.hero_slides.insert_one(slide)
    return {'id': str(result.inserted_id), 'message': 'Slide criado com sucesso'}

@router.put('/api/admin/hero-slides/{slide_id}')
async def update_hero_slide(
    slide_id: str,
    slide_data: dict,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a hero slide"""
    update_fields = {
        'updated_at': datetime.utcnow()
    }
    
    allowed_fields = ['image_url', 'title', 'subtitle', 'button_text', 'button_link', 'is_active', 'position']
    for field in allowed_fields:
        if field in slide_data:
            update_fields[field] = slide_data[field]
    
    result = await db.hero_slides.update_one(
        {'_id': ObjectId(slide_id)},
        {'$set': update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Slide não encontrado')
    
    return {'message': 'Slide atualizado com sucesso'}

@router.delete('/api/admin/hero-slides/{slide_id}')
async def delete_hero_slide(
    slide_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a hero slide"""
    result = await db.hero_slides.delete_one({'_id': ObjectId(slide_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Slide não encontrado')
    
    return {'message': 'Slide removido com sucesso'}

@router.put('/api/admin/hero-slides/reorder')
async def reorder_hero_slides(
    order_data: dict,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Reorder hero slides by updating positions"""
    positions = order_data.get('positions', [])  # List of {id: position}
    
    for item in positions:
        await db.hero_slides.update_one(
            {'_id': ObjectId(item['id'])},
            {'$set': {'position': item['position'], 'updated_at': datetime.utcnow()}}
        )
    
    return {'message': 'Ordem atualizada com sucesso'}

@router.post('/api/admin/upload-image')
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_admin_user)
):
    """Upload an image and return its URL"""
    # Create uploads directory if it doesn't exist
    upload_dir = Path('/app/frontend/public/uploads')
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = upload_dir / filename
    
    # Save file
    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {'url': f'/uploads/{filename}', 'filename': filename}

# ============= SITE STATS ROUTES =============

@router.get('/api/site-stats')
async def get_site_stats(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get site statistics for display on home page"""
    stats = await db.site_stats.find_one({})
    if not stats:
        # Return default stats if none configured
        return {
            'stats': [
                {'icon': 'waves', 'value': '15+', 'label': 'Atrações'},
                {'icon': 'sun', 'value': '365', 'label': 'Dias de Sol'},
                {'icon': 'users', 'value': '50k+', 'label': 'Visitantes/ano'},
                {'icon': 'shield', 'value': '100%', 'label': 'Segurança'}
            ]
        }
    stats['_id'] = str(stats['_id'])
    return stats

@router.get('/api/admin/site-stats')
async def get_admin_site_stats(
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get site statistics for admin editing"""
    stats = await db.site_stats.find_one({})
    if not stats:
        # Create default stats
        default_stats = {
            'stats': [
                {'icon': 'waves', 'value': '15+', 'label': 'Atrações'},
                {'icon': 'sun', 'value': '365', 'label': 'Dias de Sol'},
                {'icon': 'users', 'value': '50k+', 'label': 'Visitantes/ano'},
                {'icon': 'shield', 'value': '100%', 'label': 'Segurança'}
            ],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = await db.site_stats.insert_one(default_stats)
        default_stats['_id'] = str(result.inserted_id)
        return default_stats
    stats['_id'] = str(stats['_id'])
    return stats

@router.put('/api/admin/site-stats')
async def update_site_stats(
    stats_data: dict,
    current_user: dict = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update site statistics"""
    update_data = {
        'stats': stats_data.get('stats', []),
        'updated_at': datetime.utcnow()
    }
    
    # Check if stats exist
    existing = await db.site_stats.find_one({})
    if existing:
        await db.site_stats.update_one(
            {'_id': existing['_id']},
            {'$set': update_data}
        )
    else:
        update_data['created_at'] = datetime.utcnow()
        await db.site_stats.insert_one(update_data)
    
    return {'message': 'Estatísticas atualizadas com sucesso'}