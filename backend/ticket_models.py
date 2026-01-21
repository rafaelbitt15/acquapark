from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class TicketAvailability(BaseModel):
    date: str  # YYYY-MM-DD
    total_tickets: int
    tickets_sold: int = 0
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class TicketAvailabilityCreate(BaseModel):
    date: str
    total_tickets: int

class TicketAvailabilityUpdate(BaseModel):
    total_tickets: Optional[int] = None
    is_active: Optional[bool] = None

class TicketValidation(BaseModel):
    order_id: str
    ticket_code: str
    validated: bool = False
    validated_at: Optional[datetime] = None
    validated_by: Optional[str] = None

class StaffUser(BaseModel):
    email: str
    name: str
    hashed_password: str
    role: str = 'staff'  # staff, admin
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

class StaffUserCreate(BaseModel):
    email: str
    name: str
    password: str

class StaffLogin(BaseModel):
    email: str
    password: str