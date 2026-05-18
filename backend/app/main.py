from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import users, warehouses, items, vendors, movements

app = FastAPI(title="Inventory & Asset Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(warehouses.router, prefix="/warehouses", tags=["warehouses"])
app.include_router(items.router, prefix="/items", tags=["items"])
app.include_router(vendors.router, prefix="/vendors", tags=["vendors"])
app.include_router(movements.router, prefix="/movements", tags=["movements"])


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
