from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.inventory import AnalyticsRead, CurrentInventoryRead
from app.services import inventory_service

router = APIRouter()


@router.get("/current", response_model=list[CurrentInventoryRead])
def current_inventory(db: Session = Depends(get_db)):
    return inventory_service.get_current_inventory(db)


@router.get("/low-stock", response_model=list[CurrentInventoryRead])
def low_stock(threshold: int = Query(10, ge=0), db: Session = Depends(get_db)):
    return inventory_service.get_low_stock(db, threshold=threshold)


@router.get("/analytics", response_model=AnalyticsRead)
def analytics(db: Session = Depends(get_db)):
    return inventory_service.get_analytics(db)
