import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("vkbathouse.security")

# Rate limit configuration: endpoint path -> (max_requests, window_seconds)
RATE_LIMIT_RULES: Dict[str, Tuple[int, int]] = {
    "/api/v1/auth/login": (15, 60),           # 15 login attempts per minute per IP
    "/api/v1/auth/register": (10, 60),        # 10 registrations per minute per IP
    "/api/v1/auth/change-password": (10, 60), # 10 password changes per minute per IP
    "/api/v1/admin/users": (20, 60),          # 20 admin user invitations per minute per IP
    "/api/v1/payments/verify": (20, 60),      # 20 payment verifications per minute per IP
}

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Store timestamps of requests: (client_ip, path) -> list of timestamp floats
        self.request_records: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # Check if current path matches any rate-limited rule
        rule = None
        for rule_path, config in RATE_LIMIT_RULES.items():
            if path == rule_path or path.startswith(rule_path):
                rule = config
                break

        if rule:
            max_requests, window_seconds = rule
            now = time.time()
            key = f"{client_ip}:{path}"
            
            # Filter timestamps within current window
            self.request_records[key] = [
                ts for ts in self.request_records[key] if now - ts < window_seconds
            ]
            
            if len(self.request_records[key]) >= max_requests:
                logger.warning(f"Rate limit exceeded for IP {client_ip} on path {path}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "success": False,
                        "detail": "Too many requests. Please wait a minute before trying again."
                    }
                )
            
            self.request_records[key].append(now)

        return await call_next(request)
