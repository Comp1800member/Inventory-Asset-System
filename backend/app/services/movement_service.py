from sqlalchemy import func, case
from sqlalchemy.orm import Session
from app.models.inventory_movement import InventoryMovement, MovementType
from app.schemas.inventory_movement import MovementCreate


def get_movements(
    db: Session,
    item_id: int | None = None,
    warehouse_id: int | None = None,
) -> list[InventoryMovement]:
    query = db.query(InventoryMovement)
    if item_id is not None:
        query = query.filter(InventoryMovement.inventory_item_id == item_id)
    if warehouse_id is not None:
        query = query.filter(InventoryMovement.warehouse_id == warehouse_id)
    return query.order_by(InventoryMovement.created_at.desc()).all()


def create_movement(db: Session, data: MovementCreate) -> InventoryMovement:
    movement = InventoryMovement(**data.model_dump())
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement


def get_stock(db: Session, item_id: int, warehouse_id: int) -> int:
    """
    Derive current stock by aggregating movement history.
    INBOUND adds, OUTBOUND subtracts, ADJUSTMENT adds (manual correction).
    Stock is never stored — it is always computed here.
    """
    result = db.query(
        func.coalesce(
            func.sum(
                case(
                    (InventoryMovement.movement_type == MovementType.INBOUND, InventoryMovement.quantity),
                    (InventoryMovement.movement_type == MovementType.OUTBOUND, -InventoryMovement.quantity),
                    (InventoryMovement.movement_type == MovementType.ADJUSTMENT, InventoryMovement.quantity),
                    else_=0,
                )
            ),
            0,
        )
    ).filter(
        InventoryMovement.inventory_item_id == item_id,
        InventoryMovement.warehouse_id == warehouse_id,
    ).scalar()

    return int(result)
