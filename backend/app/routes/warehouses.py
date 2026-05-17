from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.warehouse import WarehouseCreate, WarehouseRead
from app.services import warehouse_service

router = APIRouter()


@router.get("/", response_model=list[WarehouseRead])
def list_warehouses(db: Session = Depends(get_db)):
    return warehouse_service.get_warehouses(db)


@router.post("/", response_model=WarehouseRead, status_code=status.HTTP_201_CREATED)
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db)):
    try:
        return warehouse_service.create_warehouse(db, data)
    except Exception:
        raise HTTPException(status_code=400, detail="Warehouse name already exists")
