from sqlalchemy.orm import Session
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate


def get_warehouses(db: Session) -> list[Warehouse]:
    return db.query(Warehouse).all()


def create_warehouse(db: Session, data: WarehouseCreate) -> Warehouse:
    warehouse = Warehouse(**data.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse
