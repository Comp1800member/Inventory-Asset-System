from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.inventory_movement import MovementType


class MovementCreate(BaseModel):
    inventory_item_id: int
    warehouse_id: int
    user_id: int
    vendor_id: Optional[int] = None
    movement_type: MovementType
    quantity: int
    notes: Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v


class MovementRead(BaseModel):
    id: int
    inventory_item_id: int
    warehouse_id: int
    user_id: int
    vendor_id: Optional[int]
    movement_type: MovementType
    quantity: int
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class StockRead(BaseModel):
    inventory_item_id: int
    warehouse_id: int
    stock: int
