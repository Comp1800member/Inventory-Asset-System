from datetime import date
from pydantic import BaseModel


class CurrentInventoryRead(BaseModel):
    item_id: int
    warehouse_id: int
    sku: str
    name: str
    current_quantity: int


class TopMovedItem(BaseModel):
    item_id: int
    sku: str
    name: str
    movement_count: int
    total_quantity: int


class TopWarehouse(BaseModel):
    warehouse_id: int
    warehouse_name: str
    movement_count: int
    total_quantity: int


class VolumeBreakdown(BaseModel):
    total_inbound: int
    total_outbound: int
    total_adjustment: int
    total_movements: int


class DailyActivity(BaseModel):
    date: date
    movement_count: int


class AnalyticsRead(BaseModel):
    top_moved_items: list[TopMovedItem]
    top_warehouses: list[TopWarehouse]
    volume: VolumeBreakdown
    daily_activity: list[DailyActivity]
