from sqlalchemy import func, case
from sqlalchemy.orm import Session
from app.models.inventory_movement import InventoryMovement, MovementType
from app.models.inventory_item import InventoryItem
from app.models.warehouse import Warehouse
from app.schemas.inventory import (
    AnalyticsRead,
    CurrentInventoryRead,
    TopMovedItem,
    TopWarehouse,
    VolumeBreakdown,
)


def _qty_agg():
    """Signed-quantity aggregate: INBOUND/ADJUSTMENT add, OUTBOUND subtracts."""
    return func.sum(
        case(
            (InventoryMovement.movement_type == MovementType.INBOUND, InventoryMovement.quantity),
            (InventoryMovement.movement_type == MovementType.OUTBOUND, -InventoryMovement.quantity),
            (InventoryMovement.movement_type == MovementType.ADJUSTMENT, InventoryMovement.quantity),
            else_=0,
        )
    )


def _inventory_query(db: Session):
    return (
        db.query(
            InventoryMovement.inventory_item_id.label("item_id"),
            InventoryMovement.warehouse_id,
            InventoryItem.sku,
            InventoryItem.name,
            _qty_agg().label("quantity"),
        )
        .join(InventoryItem, InventoryItem.id == InventoryMovement.inventory_item_id)
        .group_by(
            InventoryMovement.inventory_item_id,
            InventoryMovement.warehouse_id,
            InventoryItem.sku,
            InventoryItem.name,
        )
    )


def get_current_inventory(db: Session) -> list[CurrentInventoryRead]:
    """Compute real-time stock per (item, warehouse) — never stored, always derived."""
    rows = _inventory_query(db).all()
    return [CurrentInventoryRead(**r._asdict()) for r in rows]


def get_low_stock(db: Session, threshold: int) -> list[CurrentInventoryRead]:
    """Same as current inventory but filtered to quantity <= threshold."""
    rows = _inventory_query(db).having(_qty_agg() <= threshold).all()
    return [CurrentInventoryRead(**r._asdict()) for r in rows]


def get_analytics(db: Session) -> AnalyticsRead:
    top_items = (
        db.query(
            InventoryMovement.inventory_item_id.label("item_id"),
            InventoryItem.sku,
            InventoryItem.name,
            func.count(InventoryMovement.id).label("movement_count"),
            func.sum(InventoryMovement.quantity).label("total_quantity"),
        )
        .join(InventoryItem, InventoryItem.id == InventoryMovement.inventory_item_id)
        .group_by(InventoryMovement.inventory_item_id, InventoryItem.sku, InventoryItem.name)
        .order_by(func.count(InventoryMovement.id).desc())
        .limit(5)
        .all()
    )

    top_warehouses = (
        db.query(
            InventoryMovement.warehouse_id,
            Warehouse.name.label("warehouse_name"),
            func.count(InventoryMovement.id).label("movement_count"),
            func.sum(InventoryMovement.quantity).label("total_quantity"),
        )
        .join(Warehouse, Warehouse.id == InventoryMovement.warehouse_id)
        .group_by(InventoryMovement.warehouse_id, Warehouse.name)
        .order_by(func.count(InventoryMovement.id).desc())
        .limit(5)
        .all()
    )

    volume = db.query(
        func.coalesce(func.sum(
            case((InventoryMovement.movement_type == MovementType.INBOUND, InventoryMovement.quantity), else_=0)
        ), 0).label("total_inbound"),
        func.coalesce(func.sum(
            case((InventoryMovement.movement_type == MovementType.OUTBOUND, InventoryMovement.quantity), else_=0)
        ), 0).label("total_outbound"),
        func.coalesce(func.sum(
            case((InventoryMovement.movement_type == MovementType.ADJUSTMENT, InventoryMovement.quantity), else_=0)
        ), 0).label("total_adjustment"),
    ).one()

    return AnalyticsRead(
        top_moved_items=[TopMovedItem(**r._asdict()) for r in top_items],
        top_warehouses=[TopWarehouse(**r._asdict()) for r in top_warehouses],
        volume=VolumeBreakdown(
            total_inbound=int(volume.total_inbound),
            total_outbound=int(volume.total_outbound),
            total_adjustment=int(volume.total_adjustment),
        ),
    )
