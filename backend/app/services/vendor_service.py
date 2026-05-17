from sqlalchemy.orm import Session
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate


def get_vendors(db: Session) -> list[Vendor]:
    return db.query(Vendor).all()


def create_vendor(db: Session, data: VendorCreate) -> Vendor:
    vendor = Vendor(**data.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor
