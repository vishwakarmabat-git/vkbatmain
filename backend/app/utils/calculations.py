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
    free_shipping_threshold: float = 0.0,
    calculated_gst_amount: float = None
) -> Tuple[float, float, float, float, float]:
    """
    Returns (subtotal, gst_amount, shipping_fee, discount_amount, grand_total) as rounded floats.
    Calculates GST cleanly based on calculated_gst_amount or gst_percentage.
    Defaults to 0.00 if gst_rate is 0%.
    """
    d_subtotal = to_decimal(subtotal)
    d_discount = to_decimal(discount_amount)
    
    # Discount cannot exceed subtotal
    if d_discount > d_subtotal:
        d_discount = d_subtotal

    taxable_subtotal = d_subtotal - d_discount
    
    if calculated_gst_amount is not None:
        d_gst_amount = to_decimal(calculated_gst_amount)
    elif gst_percentage > 0:
        d_gst_amount = (taxable_subtotal * to_decimal(gst_percentage) / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    else:
        d_gst_amount = Decimal("0.00")

    d_shipping = to_decimal(shipping_fee)
    d_grand_total = (taxable_subtotal + d_gst_amount + d_shipping).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return (
        float(d_subtotal),
        float(d_gst_amount),
        float(d_shipping),
        float(d_discount),
        float(d_grand_total)
    )
