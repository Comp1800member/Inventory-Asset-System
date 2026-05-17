from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


def get_users(db: Session) -> list[User]:
    return db.query(User).all()


def create_user(db: Session, data: UserCreate) -> User:
    user = User(**data.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
