from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Customer(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    phone: str
    document: str  # CPF
    hashed_password: str
    created_at: datetime
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    document: str
    password: str

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class MercadoPagoConfig(BaseModel):
    access_token: str
    public_key: str
    webhook_secret: Optional[str] = None