from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid ObjectId')
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {'type': 'string'}

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    email: EmailStr
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Attraction(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: str
    description: str
    image: str
    category: str
    min_height: str
    age_restriction: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AttractionCreate(BaseModel):
    name: str
    description: str
    image: str
    category: str
    min_height: str
    age_restriction: str

class AttractionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    min_height: Optional[str] = None
    age_restriction: Optional[str] = None
    is_active: Optional[bool] = None

class Ticket(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    ticket_id: str
    name: str
    price: float
    description: str
    features: List[str]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TicketCreate(BaseModel):
    ticket_id: str
    name: str
    price: float
    description: str
    features: List[str]

class TicketUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None

class ParkInfo(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: str
    tagline: str
    description: str
    highlights: List[str]
    history: str
    mission: str
    contact: dict
    hours: List[dict]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ParkInfoUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = None
    history: Optional[str] = None
    mission: Optional[str] = None
    contact: Optional[dict] = None
    hours: Optional[List[dict]] = None

class Testimonial(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: str
    rating: int
    comment: str
    date: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TestimonialCreate(BaseModel):
    name: str
    rating: int
    comment: str
    date: str

class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    rating: Optional[int] = None
    comment: Optional[str] = None
    date: Optional[str] = None
    is_active: Optional[bool] = None

class FAQ(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    question: str
    answer: str
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class FAQCreate(BaseModel):
    question: str
    answer: str
    order: int = 0

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

class Contact(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    status: str = 'new'
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class Order(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    order_id: str
    customer: dict
    items: List[dict]
    total_amount: float
    visit_date: str
    payment_status: str = 'pending'
    payment_id: Optional[str] = None
    mercado_pago_preference_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OrderCreate(BaseModel):
    customer: dict
    items: List[dict]
    total_amount: float
    visit_date: str