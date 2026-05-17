from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.inventory_item import InventoryItemCreate, InventoryItemRead
from app.services import item_service

router = APIRouter()


@router.get("/", response_model=list[InventoryItemRead])
def list_items(db: Session = Depends(get_db)):
    return item_service.get_items(db)


@router.get("/{item_id}", response_model=InventoryItemRead)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = item_service.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/", response_model=InventoryItemRead, status_code=status.HTTP_201_CREATED)
def create_item(data: InventoryItemCreate, db: Session = Depends(get_db)):
    try:
        return item_service.create_item(db, data)
    except Exception:
        raise HTTPException(status_code=400, detail="SKU already exists")
