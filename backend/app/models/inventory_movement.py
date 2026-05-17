import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, CheckConstraint, func
from app.models.base import Base


class MovementType(str, enum.Enum):
    INBOUND = "INBOUND"
    OUTBOUND = "OUTBOUND"
    ADJUSTMENT = "ADJUSTMENT"


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    movement_type = Column(Enum(MovementType), nullable=False)
    quantity = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
    )
