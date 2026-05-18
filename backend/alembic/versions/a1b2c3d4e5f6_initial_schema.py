"""Initial schema: users, warehouses, inventory_items, vendors, inventory_movements

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-05-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# postgresql.ENUM with create_type=False prevents auto-creation during op.create_table.
# sa.Enum resolves to a dialect-specific object internally and loses the flag;
# using the dialect type directly ensures _on_table_create respects create_type=False.
movement_type_enum = ENUM("INBOUND", "OUTBOUND", "ADJUSTMENT", name="movementtype", create_type=False)


def upgrade() -> None:
    movement_type_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "warehouses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("location", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "inventory_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sku", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku"),
    )

    op.create_table(
        "vendors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("contact_email", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "inventory_movements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("inventory_item_id", sa.Integer(), nullable=False),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("vendor_id", sa.Integer(), nullable=True),
        sa.Column("movement_type", movement_type_enum, nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("quantity > 0", name="check_quantity_positive"),
        sa.ForeignKeyConstraint(["inventory_item_id"], ["inventory_items.id"]),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["vendor_id"], ["vendors.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("ix_inventory_movements_item_id", "inventory_movements", ["inventory_item_id"])
    op.create_index("ix_inventory_movements_warehouse_id", "inventory_movements", ["warehouse_id"])
    op.create_index("ix_inventory_movements_user_id", "inventory_movements", ["user_id"])
    op.create_index("ix_inventory_movements_vendor_id", "inventory_movements", ["vendor_id"])
    op.create_index("ix_inventory_movements_created_at", "inventory_movements", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_inventory_movements_created_at", table_name="inventory_movements")
    op.drop_index("ix_inventory_movements_vendor_id", table_name="inventory_movements")
    op.drop_index("ix_inventory_movements_user_id", table_name="inventory_movements")
    op.drop_index("ix_inventory_movements_warehouse_id", table_name="inventory_movements")
    op.drop_index("ix_inventory_movements_item_id", table_name="inventory_movements")
    op.drop_table("inventory_movements")
    op.drop_table("vendors")
    op.drop_table("inventory_items")
    op.drop_table("warehouses")
    op.drop_table("users")
    movement_type_enum.drop(op.get_bind(), checkfirst=True)
