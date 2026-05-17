from sqlalchemy.orm import Session
from app.models.inventory_item import InventoryItem
from app.schemas.inventory_item import InventoryItemCreate


def get_items(db: Session) -> list[InventoryItem]:
    return db.query(InventoryItem).all()


def get_item(db: Session, item_id: int) -> InventoryItem | None:
    return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()


def create_item(db: Session, data: InventoryItemCreate) -> InventoryItem:
    item = InventoryItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
