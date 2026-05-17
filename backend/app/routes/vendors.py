from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.vendor import VendorCreate, VendorRead
from app.services import vendor_service

router = APIRouter()


@router.get("/", response_model=list[VendorRead])
def list_vendors(db: Session = Depends(get_db)):
    return vendor_service.get_vendors(db)


@router.post("/", response_model=VendorRead, status_code=status.HTTP_201_CREATED)
def create_vendor(data: VendorCreate, db: Session = Depends(get_db)):
    return vendor_service.create_vendor(db, data)
