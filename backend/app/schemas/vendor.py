from datetime import datetime
from pydantic import BaseModel, EmailStr


class VendorCreate(BaseModel):
    name: str
    contact_email: EmailStr


class VendorRead(BaseModel):
    id: int
    name: str
    contact_email: str
    created_at: datetime

    model_config = {"from_attributes": True}
