from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.inventory_movement import MovementCreate, MovementRead, StockRead
from app.services import movement_service

router = APIRouter()


@router.get("/", response_model=list[MovementRead])
def list_movements(
    item_id: Optional[int] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return movement_service.get_movements(db, item_id=item_id, warehouse_id=warehouse_id)


@router.post("/", response_model=MovementRead, status_code=status.HTTP_201_CREATED)
def create_movement(data: MovementCreate, db: Session = Depends(get_db)):
    return movement_service.create_movement(db, data)


@router.get("/stock", response_model=StockRead)
def get_stock(
    item_id: int = Query(...),
    warehouse_id: int = Query(...),
    db: Session = Depends(get_db),
):
    stock = movement_service.get_stock(db, item_id=item_id, warehouse_id=warehouse_id)
    return StockRead(inventory_item_id=item_id, warehouse_id=warehouse_id, stock=stock)
