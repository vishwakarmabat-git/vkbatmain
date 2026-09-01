import json
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.websocket import realtime_manager
from app.core.security import decode_access_token
from app.core.database import SessionLocal
from app.models.user import User

logger = logging.getLogger("vkbathouse.realtime")
router = APIRouter(tags=["Realtime WebSocket"])

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    user: Optional[User] = None
    if token:
        try:
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                db = SessionLocal()
                try:
                    user = db.query(User).filter(User.id == payload.get("sub"), User.is_active == True).first()
                finally:
                    db.close()
        except Exception as e:
            logger.warning(f"[Realtime] Token authentication failed during WS handshake: {e}")

    await realtime_manager.connect(websocket, user)
    try:
        # Send initial handshake acknowledgement
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "entity": "system",
            "data": {
                "authenticated": user is not None,
                "role": user.role if user else "guest",
                "user_id": user.id if user else None
            }
        }))
        
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        await realtime_manager.disconnect(websocket, user)
    except Exception as e:
        logger.warning(f"[Realtime] WebSocket loop exception: {e}")
        await realtime_manager.disconnect(websocket, user)
