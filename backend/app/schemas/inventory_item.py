from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class InventoryItemCreate(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None


class InventoryItemRead(BaseModel):
    id: int
    sku: str
    name: str
    description: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
