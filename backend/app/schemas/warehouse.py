from datetime import datetime
from pydantic import BaseModel


class WarehouseCreate(BaseModel):
    name: str
    location: str


class WarehouseRead(BaseModel):
    id: int
    name: str
    location: str
    created_at: datetime

    model_config = {"from_attributes": True}
