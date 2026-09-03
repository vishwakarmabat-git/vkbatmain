from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AdminDashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    pending_orders: int
    total_products: int
    low_stock_products: int = 0
    total_customers: int
    revenue_growth_percent: float = 12.5
    orders_growth_percent: float = 8.3
    
    # Chart Data
    revenue_chart: List[Dict[str, Any]]
    orders_by_status: List[Dict[str, Any]]
    top_selling_products: List[Dict[str, Any]]
    category_sales_distribution: List[Dict[str, Any]]

class InventoryAdjustment(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    adjustment_type: str = "set"  # "set", "add", "subtract"
    quantity: int
    reason: Optional[str] = None

class ActivityLogResponse(BaseModel):
    id: str
    admin_id: Optional[str] = None
    admin_name: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AdminUserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "admin"

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
