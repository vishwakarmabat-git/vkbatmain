import logging
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, List, Dict, Any
from app.core.config import settings

logger = logging.getLogger("app.email_service")

def _render_email_layout(title: str, preheader: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #09090B;
      color: #E4E4E7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }}
    table {{ border-collapse: collapse; }}
    a {{ color: #D4AF37; text-decoration: none; }}
    .btn-gold {{
      background: linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #AA7C11 100%);
      color: #09090B !important;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 14px 28px;
      border-radius: 4px;
      display: inline-block;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }}
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #09090B;">
  <div style="display: none; max-height: 0px; overflow: hidden;">{preheader}</div>
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090B;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #121216; border: 1px solid #1E1E28; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(180deg, #181822 0%, #121216 100%); border-bottom: 2px solid #D4AF37; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
                      VISHWAKARMA <span style="color: #D4AF37;">BAT HOUSE</span>
                    </div>
                    <div style="font-size: 11px; letter-spacing: 3px; color: #A1A1AA; text-transform: uppercase; margin-top: 4px;">
                      Mastercraft Cricket Bats • Handcrafted in India
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 36px 32px; background-color: #121216; color: #E4E4E7; font-size: 14px; line-height: 1.6;">
              {body_html}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #09090C; border-top: 1px solid #1E1E28; text-align: center; color: #71717A; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; color: #A1A1AA; font-weight: 600;">Vishwakarma Bat House Guild</p>
              <p style="margin: 0 0 12px 0;">Premium Grade 1 Kashmir & Kashmir Willow Cricket Bats</p>
              <p style="margin: 0 0 8px 0;">
                Need assistance? <a href="mailto:{settings.CONTACT_EMAIL}" style="color: #D4AF37;">{settings.CONTACT_EMAIL}</a> | WhatsApp: +{settings.WHATSAPP_NUMBER}
              </p>
              <p style="margin: 12px 0 0 0; font-size: 10px; color: #52525B;">
                © 2026 Vishwakarma Bat House. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

import httpx

class EmailService:
    @staticmethod
    def _send_worker(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None):
        """Internal synchronous worker running inside background thread (Brevo API -> SMTP -> Dev Mock)"""
        try:
            # 1. Brevo REST API (Fastest & 100% Reliable over HTTPS)
            if settings.BREVO_API_KEY and settings.BREVO_API_KEY.strip():
                sender_email = settings.BREVO_SENDER_EMAIL or settings.SMTP_FROM_EMAIL or "vishwakarmabat@gmail.com"
                sender_name = settings.BREVO_SENDER_NAME or settings.SMTP_FROM_NAME or "Vishwakarma Bat House"
                
                payload = {
                    "sender": {"name": sender_name, "email": sender_email},
                    "to": [{"email": to_email}],
                    "subject": subject,
                    "htmlContent": html_content
                }
                if text_content:
                    payload["textContent"] = text_content

                headers = {
                    "api-key": settings.BREVO_API_KEY.strip(),
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }

                with httpx.Client(timeout=15.0) as client:
                    resp = client.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers)
                    if resp.status_code in (200, 201, 202):
                        logger.info(f"[BREVO API] Email successfully delivered to {to_email} (Subject: {subject})")
                        return True
                    else:
                        logger.error(f"[BREVO API ERROR] Status {resp.status_code}: {resp.text}")

            # 2. Brevo / Custom SMTP Relay Fallback
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                from_name = settings.SMTP_FROM_NAME or settings.BREVO_SENDER_NAME or "Vishwakarma Bat House"
                from_email = settings.SMTP_FROM_EMAIL or settings.BREVO_SENDER_EMAIL or "vishwakarmabat@gmail.com"
                msg["From"] = f"{from_name} <{from_email}>"
                msg["To"] = to_email

                if text_content:
                    msg.attach(MIMEText(text_content, "plain", "utf-8"))
                msg.attach(MIMEText(html_content, "html", "utf-8"))

                if settings.SMTP_PORT == 465:
                    with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                        server.send_message(msg)
                else:
                    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                        if settings.SMTP_TLS:
                            server.starttls()
                        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                        server.send_message(msg)

                logger.info(f"[SMTP] Email successfully delivered to {to_email} (Subject: {subject})")
                return True

            # 3. Dev / Mock mode logging when no provider credentials are configured
            logger.info(
                f"[DEV/MOCK EMAIL] To: {to_email} | Subject: '{subject}'\n"
                f"Content preview: {text_content[:200] if text_content else 'HTML content rendered.'}"
            )
            return True

        except Exception as err:
            logger.error(f"Failed to send email to {to_email}: {err}")
            return False

    @classmethod
    def send_email_async(cls, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None):
        """Dispatches email in a background thread to never block HTTP request latency"""
        thread = threading.Thread(
            target=cls._send_worker,
            args=(to_email, subject, html_content, text_content),
            daemon=True
        )
        thread.start()


    # =========================================================================
    # 1. WELCOME EMAIL
    # =========================================================================
    @classmethod
    def send_welcome_email(cls, user_email: str, user_name: str):
        subject = "🏏 Welcome to Vishwakarma Bat House | Your Mastercraft Journey Begins"
        preheader = f"Welcome to Vishwakarma Bat House, {user_name}! Discover mastercraft cricket bats."
        
        body_html = f"""
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 50%; line-height: 48px; font-size: 24px;">
            🏏
          </div>
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 16px 0 8px 0; letter-spacing: 0.5px;">
            Welcome to the Guild, {user_name}!
          </h1>
          <p style="color: #D4AF37; font-size: 13px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
            Your account is ready for handcrafted excellence
          </p>
        </div>

        <p style="color: #D4D4D8; line-height: 1.7; margin-bottom: 16px;">
          Thank you for joining <strong>Vishwakarma Bat House</strong>. For generations, our master craftsmen have hand-shaped Grade 1 Reserve Kashmir and Kashmir Willow blades, tuned for sublime pickup, monstrous ping, and surgical power.
        </p>

        <div style="background-color: #181821; border: 1px solid #242436; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #D4AF37; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">
            ✨ What You Get As A Registered Member:
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #A1A1AA; font-size: 13px; line-height: 1.8;">
            <li><strong>Bespoke Customizations:</strong> Tailor bat weight, handle shape, grip count, and laser engraving.</li>
            <li><strong>Direct Workshop Tracking:</strong> Track real-time blade shaping, oiling, knocking, and dispatch.</li>
            <li><strong>Lifetime Authenticity Guarantee:</strong> Registered warranty certificates with every bat.</li>
            <li><strong>Exclusive Priority Drops:</strong> Early access to limited-edition Players Reserve clefts.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="{settings.FRONTEND_URL}/products" class="btn-gold" style="color: #09090B;">
            EXPLORE THE BAT COLLECTION →
          </a>
        </div>
        """

        text_content = f"Welcome to Vishwakarma Bat House, {user_name}! Explore our handcrafted cricket bat collection at {settings.FRONTEND_URL}/products"
        cls.send_email_async(user_email, subject, _render_email_layout(subject, preheader, body_html), text_content)

    # =========================================================================
    # 2. ORDER CONFIRMATION / ORDER RECEIVED EMAIL
    # =========================================================================
    @classmethod
    def send_order_confirmation_email(cls, order: Any, customer_email: str, customer_name: str):
        subject = f"🏏 Order Confirmed #{order.order_number} — Vishwakarma Bat House"
        preheader = f"Order #{order.order_number} has been received and is being prepared by our master batmakers."

        # Render items HTML table
        items_html = ""
        for item in order.items:
            custom_info = ""
            if item.customization:
                specs = []
                if item.customization.get("weight"):
                    specs.append(f"Weight: {item.customization['weight']}")
                if item.customization.get("handle_shape"):
                    specs.append(f"Handle: {item.customization['handle_shape']}")
                if item.customization.get("custom_engraving"):
                    specs.append(f"Engraving: \"{item.customization['custom_engraving']}\"")
                if specs:
                    custom_info = f"<div style='font-size: 11px; color: #D4AF37; margin-top: 4px;'>{ ' • '.join(specs) }</div>"

            items_html += f"""
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #1E1E28; color: #FFFFFF;">
                <div style="font-weight: 700;">{item.product_name}</div>
                <div style="font-size: 11px; color: #71717A;">SKU: {item.product_sku}</div>
                {custom_info}
              </td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #1E1E28; text-align: center; color: #E4E4E7;">
                {item.quantity}
              </td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #1E1E28; text-align: right; color: #D4AF37; font-weight: 700;">
                ₹{item.total_price:,.2f}
              </td>
            </tr>
            """

        shipping = order.shipping_address or {}
        address_str = f"{shipping.get('address_line1', '')}, {shipping.get('city', '')}, {shipping.get('state', '')} - {shipping.get('pincode', '')}"

        body_html = f"""
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 50%; line-height: 48px; font-size: 24px;">
            ✅
          </div>
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 16px 0 4px 0;">
            Order Received & Confirmed!
          </h1>
          <p style="color: #D4AF37; font-size: 14px; font-weight: 700; margin: 0; font-family: monospace;">
            ORDER #{order.order_number}
          </p>
        </div>

        <p style="color: #D4D4D8; line-height: 1.6;">
          Hello <strong>{customer_name}</strong>, thank you for your order. Our master craftsmen have received your specifications and are preparing your gear for precision hand-balancing and final dispatch.
        </p>

        <!-- Order Items Table -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #181822; border-bottom: 1px solid #2A2A3C;">
              <th align="left" style="padding: 10px 8px; color: #A1A1AA; font-size: 11px; text-transform: uppercase;">Product</th>
              <th align="center" style="padding: 10px 8px; color: #A1A1AA; font-size: 11px; text-transform: uppercase;">Qty</th>
              <th align="right" style="padding: 10px 8px; color: #A1A1AA; font-size: 11px; text-transform: uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>
            {items_html}
          </tbody>
        </table>

        <!-- Totals Breakdown -->
        <div style="background-color: #181821; border: 1px solid #242436; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #A1A1AA;">
            <tr>
              <td>Subtotal</td>
              <td align="right" style="color: #FFFFFF; font-weight: 600;">₹{order.subtotal:,.2f}</td>
            </tr>
            <tr>
              <td>Express Insured Shipping</td>
              <td align="right" style="color: #10B981; font-weight: 600;">FREE</td>
            </tr>
            {f'<tr><td>Coupon Discount ({order.applied_coupon_code})</td><td align="right" style="color: #10B981;">-₹{order.discount_amount:,.2f}</td></tr>' if order.discount_amount > 0 else ''}
            <tr style="border-top: 1px solid #2E2E3E;">
              <td style="padding-top: 8px; color: #FFFFFF; font-weight: 800; font-size: 15px;">Total Amount</td>
              <td align="right" style="padding-top: 8px; color: #D4AF37; font-weight: 800; font-size: 18px;">₹{order.grand_total:,.2f}</td>
            </tr>
          </table>
        </div>

        <!-- Shipping & Payment Details -->
        <div style="background-color: #0E0E12; border: 1px solid #1E1E28; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 12px; color: #A1A1AA; line-height: 1.6;">
          <div style="color: #FFFFFF; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
            📍 Delivering To:
          </div>
          <div>{shipping.get('full_name', customer_name)} ({shipping.get('phone', '')})</div>
          <div>{address_str}</div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #1E1E28;">
            <strong>Payment Method:</strong> {order.payment_method.upper()} • <strong>Payment Status:</strong> {order.payment_status.upper()}
          </div>
        </div>

        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="{settings.FRONTEND_URL}/orders" class="btn-gold" style="color: #09090B;">
            VIEW ORDER STATUS →
          </a>
        </div>
        """

        text_content = f"Order #{order.order_number} confirmed! Total: ₹{order.grand_total:,.2f}. Track at {settings.FRONTEND_URL}/orders"
        cls.send_email_async(customer_email, subject, _render_email_layout(subject, preheader, body_html), text_content)

    # =========================================================================
    # 3. ORDER DELIVERED EMAIL
    # =========================================================================
    @classmethod
    def send_order_delivered_email(cls, order: Any, customer_email: str, customer_name: str):
        subject = f"🎉 Your Handcrafted Bat Has Been Delivered! — Order #{order.order_number}"
        preheader = f"Order #{order.order_number} has been delivered. Welcome to the crease!"

        body_html = f"""
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 50%; line-height: 48px; font-size: 24px;">
            🏆
          </div>
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 16px 0 4px 0;">
            Parcel Successfully Delivered!
          </h1>
          <p style="color: #10B981; font-size: 13px; font-weight: 700; margin: 0; text-transform: uppercase;">
            Order #{order.order_number} • Verified Handover
          </p>
        </div>

        <p style="color: #D4D4D8; line-height: 1.6;">
          Hello <strong>{customer_name}</strong>, your Vishwakarma handcrafted cricket bat and gear have been safely delivered to your doorstep.
        </p>

        <div style="background-color: #181821; border: 1px solid #242436; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #D4AF37; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">
            🏏 Pro Bat Care & Knocking-In Guide:
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #A1A1AA; font-size: 13px; line-height: 1.8;">
            <li><strong>Linseed Oiling:</strong> Apply a light coat of raw linseed oil on the face and edges. Avoid the splice and handle.</li>
            <li><strong>Mallet Knocking:</strong> Gradually round the edges and toe with a wooden bat mallet before net sessions.</li>
            <li><strong>Extratec Protection:</strong> Apply an anti-scuff sheet on the face to prevent surface cracks against leather balls.</li>
            <li><strong>Storage:</strong> Store in a cool, dry place away from direct sunlight and damp conditions.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="{settings.FRONTEND_URL}/orders" class="btn-gold" style="color: #09090B;">
            VIEW ORDER & LEAVE REVIEW →
          </a>
        </div>
        """

        text_content = f"Your Vishwakarma Bat House order #{order.order_number} has been delivered! View details at {settings.FRONTEND_URL}/orders"
        cls.send_email_async(customer_email, subject, _render_email_layout(subject, preheader, body_html), text_content)

    # =========================================================================
    # 4. FORGOT / RESET PASSWORD EMAIL
    # =========================================================================
    @classmethod
    def send_password_reset_email(cls, user_email: str, user_name: str, reset_token: str):
        subject = "🔒 Password Reset Request — Vishwakarma Bat House"
        preheader = "Reset your Vishwakarma Bat House password. This link is active for 30 minutes."

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

        body_html = f"""
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 50%; line-height: 48px; font-size: 24px;">
            🔒
          </div>
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 16px 0 4px 0;">
            Password Reset Request
          </h1>
          <p style="color: #A1A1AA; font-size: 13px; margin: 0;">
            for account: <strong style="color: #FFFFFF;">{user_email}</strong>
          </p>
        </div>

        <p style="color: #D4D4D8; line-height: 1.6;">
          Hello <strong>{user_name}</strong>, we received a request to reset your Vishwakarma Bat House account password. Click the button below to set a new password:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_link}" class="btn-gold" style="color: #09090B;">
            RESET MY PASSWORD →
          </a>
        </div>

        <div style="background-color: #181821; border: 1px solid #242436; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 12px; color: #A1A1AA;">
          <p style="margin: 0 0 8px 0;">
            ⏰ <strong>Security Notice:</strong> This link will expire in <strong>30 minutes</strong> for your protection.
          </p>
          <p style="margin: 0;">
            If you did not request a password reset, you can safely ignore this email — your account remains secure.
          </p>
        </div>

        <div style="font-size: 11px; color: #71717A; word-break: break-all; margin-top: 16px;">
          If the button doesn't work, copy and paste this link in your browser:<br>
          <a href="{reset_link}" style="color: #D4AF37;">{reset_link}</a>
        </div>
        """

        text_content = f"Reset your Vishwakarma Bat House password by visiting: {reset_link} (Valid for 30 minutes)"
        cls.send_email_async(user_email, subject, _render_email_layout(subject, preheader, body_html), text_content)
