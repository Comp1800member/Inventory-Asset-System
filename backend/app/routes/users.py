from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserCreate, UserRead
from app.services import user_service

router = APIRouter()


@router.get("/", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return user_service.get_users(db)


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    try:
        return user_service.create_user(db, data)
    except Exception:
        raise HTTPException(status_code=400, detail="Email already registered")
