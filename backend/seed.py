"""Seed the database with sample data.

Run inside the backend container:
    docker-compose exec backend python seed.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.inventory_item import InventoryItem
from app.models.vendor import Vendor
from app.models.inventory_movement import InventoryMovement, MovementType


def seed() -> None:
    db = SessionLocal()
    try:
        users = [
            User(email="alice@example.com", name="Alice Chen"),
            User(email="bob@example.com", name="Bob Smith"),
        ]
        db.add_all(users)
        db.flush()

        warehouses = [
            Warehouse(name="Main Warehouse", location="New York, NY"),
            Warehouse(name="West Coast Hub", location="Los Angeles, CA"),
        ]
        db.add_all(warehouses)
        db.flush()

        items = [
            InventoryItem(sku="LAPTOP-001", name='MacBook Pro 14"', description="Apple M3 Pro laptop"),
            InventoryItem(sku="MONITOR-002", name='Dell 27" Monitor', description="4K USB-C display"),
            InventoryItem(sku="KEYBOARD-003", name="Mechanical Keyboard", description="Cherry MX Blue switches"),
        ]
        db.add_all(items)
        db.flush()

        vendors = [
            Vendor(name="Apple Inc.", contact_email="sales@apple.com"),
            Vendor(name="Dell Technologies", contact_email="enterprise@dell.com"),
        ]
        db.add_all(vendors)
        db.flush()

        movements = [
            InventoryMovement(
                inventory_item_id=items[0].id,
                warehouse_id=warehouses[0].id,
                user_id=users[0].id,
                vendor_id=vendors[0].id,
                movement_type=MovementType.INBOUND,
                quantity=10,
                notes="Initial stock receipt",
            ),
            InventoryMovement(
                inventory_item_id=items[0].id,
                warehouse_id=warehouses[0].id,
                user_id=users[1].id,
                movement_type=MovementType.OUTBOUND,
                quantity=3,
                notes="Shipped to marketing team",
            ),
            InventoryMovement(
                inventory_item_id=items[1].id,
                warehouse_id=warehouses[0].id,
                user_id=users[0].id,
                vendor_id=vendors[1].id,
                movement_type=MovementType.INBOUND,
                quantity=20,
            ),
            InventoryMovement(
                inventory_item_id=items[2].id,
                warehouse_id=warehouses[1].id,
                user_id=users[0].id,
                movement_type=MovementType.INBOUND,
                quantity=50,
                notes="Initial west-coast stock",
            ),
            InventoryMovement(
                inventory_item_id=items[2].id,
                warehouse_id=warehouses[1].id,
                user_id=users[1].id,
                movement_type=MovementType.OUTBOUND,
                quantity=5,
                notes="Distributed to west-coast team",
            ),
        ]
        db.add_all(movements)
        db.commit()
        print("Seed complete.")
    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
