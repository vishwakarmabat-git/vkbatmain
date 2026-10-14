"""add_shipments_and_shipping_specs

Revision ID: e7f1b2c3d4e5
Revises: dcd01f1ed587
Create Date: 2026-10-13 13:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = 'e7f1b2c3d4e5'
down_revision: Union[str, None] = 'dcd01f1ed587'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()

    # 1. Create shipments table if not exists
    if 'shipments' not in existing_tables:
        op.create_table(
            'shipments',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('order_id', sa.String(36), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True),
            sa.Column('provider', sa.String(50), nullable=False, server_default='courier_uncle'),
            sa.Column('provider_order_id', sa.String(100), nullable=True),
            sa.Column('tracking_id', sa.String(100), unique=True, index=True, nullable=False),
            sa.Column('courier_name', sa.String(100), nullable=True),
            sa.Column('courier_code', sa.String(50), nullable=True),
            sa.Column('courier_service', sa.String(50), nullable=True),
            sa.Column('courier_awb', sa.String(100), nullable=True),
            sa.Column('shipping_charge', sa.Numeric(10, 2), nullable=False, server_default='0.00'),
            sa.Column('currency', sa.String(10), nullable=False, server_default='INR'),
            sa.Column('payment_mode', sa.String(20), nullable=False, server_default='PREPAID'),
            sa.Column('cod_amount', sa.Numeric(10, 2), nullable=False, server_default='0.00'),
            sa.Column('shipment_status', sa.String(50), nullable=False, server_default='CREATED', index=True),
            sa.Column('zone', sa.String(10), nullable=True),
            sa.Column('chargeable_weight_kg', sa.Float(), nullable=True),
            sa.Column('length_cm', sa.Float(), nullable=True),
            sa.Column('width_cm', sa.Float(), nullable=True),
            sa.Column('height_cm', sa.Float(), nullable=True),
            sa.Column('tracking_url', sa.String(1000), nullable=True),
            sa.Column('label_url', sa.String(1000), nullable=True),
            sa.Column('is_sandbox', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('failure_reason', sa.Text(), nullable=True),
            sa.Column('booked_at', sa.DateTime(), nullable=False),
            sa.Column('picked_up_at', sa.DateTime(), nullable=True),
            sa.Column('delivered_at', sa.DateTime(), nullable=True),
            sa.Column('cancelled_at', sa.DateTime(), nullable=True),
            sa.Column('timeline_data', sa.JSON(), nullable=True),
            sa.Column('scans_data', sa.JSON(), nullable=True),
            sa.Column('raw_response', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
        )

    # 2. Add shipping specification columns to products table if missing
    if 'products' in existing_tables:
        existing_cols = [c['name'] for c in inspector.get_columns('products')]
        
        if 'package_weight_kg' not in existing_cols:
            op.add_column('products', sa.Column('package_weight_kg', sa.Float(), nullable=False, server_default='1.5'))
        if 'package_length_cm' not in existing_cols:
            op.add_column('products', sa.Column('package_length_cm', sa.Float(), nullable=False, server_default='90.0'))
        if 'package_width_cm' not in existing_cols:
            op.add_column('products', sa.Column('package_width_cm', sa.Float(), nullable=False, server_default='14.0'))
        if 'package_height_cm' not in existing_cols:
            op.add_column('products', sa.Column('package_height_cm', sa.Float(), nullable=False, server_default='10.0'))
        if 'shipping_category' not in existing_cols:
            op.add_column('products', sa.Column('shipping_category', sa.String(50), nullable=False, server_default='cricket_bat'))
        if 'packaging_type' not in existing_cols:
            op.add_column('products', sa.Column('packaging_type', sa.String(50), nullable=False, server_default='heavy_duty_box'))

def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()

    if 'shipments' in existing_tables:
        op.drop_table('shipments')

    if 'products' in existing_tables:
        existing_cols = [c['name'] for c in inspector.get_columns('products')]
        cols_to_drop = [
            'package_weight_kg',
            'package_length_cm',
            'package_width_cm',
            'package_height_cm',
            'shipping_category',
            'packaging_type'
        ]
        for col in cols_to_drop:
            if col in existing_cols:
                op.drop_column('products', col)
