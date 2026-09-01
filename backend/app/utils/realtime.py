import asyncio
import logging
from typing import Any, Optional
from app.core.websocket import realtime_manager

logger = logging.getLogger("vkbathouse.realtime")

def emit_realtime_event(
    channel: str,
    event: str,
    entity: str,
    data: Optional[Any] = None,
    user_id: Optional[str] = None
):
    """
    Safely dispatches realtime WebSocket events to connected clients from synchronous or asynchronous FastAPI contexts.
    """
    async def _emit():
        try:
            if channel == "public":
                await realtime_manager.broadcast_public(event, entity, data)
            elif channel == "admin":
                await realtime_manager.broadcast_admin(event, entity, data)
            elif channel == "user" and user_id:
                await realtime_manager.send_to_user(str(user_id), event, entity, data)
        except Exception as e:
            logger.warning(f"[Realtime] Emission failed ({channel}:{event}:{entity}): {e}")

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_emit())
    except RuntimeError:
        # Fallback when running outside active event loop
        try:
            asyncio.run(_emit())
        except Exception as e:
            logger.warning(f"[Realtime] Asyncio run failed: {e}")
