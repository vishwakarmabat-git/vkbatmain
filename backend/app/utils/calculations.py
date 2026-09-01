from decimal import Decimal, ROUND_HALF_UP
from typing import Tuple
from app.core.config import settings

def to_decimal(val: float | int | str | Decimal) -> Decimal:
    return Decimal(str(val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def calculate_order_totals(
    subtotal: float,
    discount_amount: float = 0.0,
    gst_percentage: float = 0.0,
    shipping_fee: float = 0.0,
    free_shipping_threshold: float = 0.0
) -> Tuple[float, float, float, float, float]:
    """
    Returns (subtotal, gst_amount, shipping_fee, discount_amount, grand_total) as rounded floats.
    Bat price is final — zero added taxes, zero added shipping fees.
    """
    d_subtotal = to_decimal(subtotal)
    d_discount = to_decimal(discount_amount)
    
    # Discount cannot exceed subtotal
    if d_discount > d_subtotal:
        d_discount = d_subtotal

    taxable_subtotal = d_subtotal - d_discount
    d_gst_amount = Decimal("0.00")
    d_shipping = Decimal("0.00")
    d_grand_total = taxable_subtotal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return (
        float(d_subtotal),
        float(d_gst_amount),
        float(d_shipping),
        float(d_discount),
        float(d_grand_total)
    )
