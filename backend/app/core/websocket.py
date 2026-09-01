import asyncio
import json
import logging
from typing import Dict, List, Set, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
from app.models.user import User

logger = logging.getLogger("vkbathouse.realtime")

class ConnectionManager:
    """
    Production-grade WebSocket connection manager for Vishwakarma Bat House.
    Supports authenticated channels:
      - 'public': Broadcasts to all connected customers and visitors.
      - 'admin': Broadcasts exclusively to authenticated admin & superadmin users.
      - 'user:{user_id}': Sends private notifications (e.g. order status updates) directly to the specific user.
    """
    def __init__(self):
        # All active connections
        self.active_connections: Set[WebSocket] = set()
        
        # Connections with authenticated admin privileges
        self.admin_connections: Set[WebSocket] = set()
        
        # Connections mapped by User ID -> Set of WebSockets (supporting multiple devices/tabs per user)
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        
        # Lock for thread-safe state modification
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user: Optional[User] = None):
        """Accept connection and register into appropriate channels."""
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)
            
            if user:
                # Add to user's private channel
                user_id = str(user.id)
                if user_id not in self.user_connections:
                    self.user_connections[user_id] = set()
                self.user_connections[user_id].add(websocket)
                
                # If admin or superadmin, add to admin channel
                if user.role in ["admin", "superadmin"]:
                    self.admin_connections.add(websocket)
                    logger.info(f"[Realtime] Admin connected: {user.email} (Total admins: {len(self.admin_connections)})")
                else:
                    logger.info(f"[Realtime] Customer connected: {user.email}")
            else:
                logger.info(f"[Realtime] Public guest connected (Total clients: {len(self.active_connections)})")

    async def disconnect(self, websocket: WebSocket, user: Optional[User] = None):
        """Clean up disconnected websocket from all channels."""
        async with self._lock:
            self.active_connections.discard(websocket)
            self.admin_connections.discard(websocket)
            
            if user:
                user_id = str(user.id)
                if user_id in self.user_connections:
                    self.user_connections[user_id].discard(websocket)
                    if not self.user_connections[user_id]:
                        del self.user_connections[user_id]
        logger.info(f"[Realtime] Client disconnected (Remaining: {len(self.active_connections)})")

    async def broadcast_public(self, event: str, entity: str, data: Any = None):
        """Broadcast public catalog event to all connected clients."""
        payload = {
            "channel": "public",
            "event": event,
            "entity": entity,
            "data": data or {}
        }
        await self._send_to_set(self.active_connections, payload)

    async def broadcast_admin(self, event: str, entity: str, data: Any = None):
        """Broadcast administrative event exclusively to active admin portals."""
        payload = {
            "channel": "admin",
            "event": event,
            "entity": entity,
            "data": data or {}
        }
        await self._send_to_set(self.admin_connections, payload)

    async def send_to_user(self, user_id: str, event: str, entity: str, data: Any = None):
        """Send private event to all active sessions of a specific customer."""
        payload = {
            "channel": f"user:{user_id}",
            "event": event,
            "entity": entity,
            "data": data or {}
        }
        async with self._lock:
            sockets = list(self.user_connections.get(str(user_id), set()))
            
        await self._send_to_set(set(sockets), payload)

    async def _send_to_set(self, socket_set: Set[WebSocket], message: dict):
        """Send message safely to a set of sockets, automatically discarding broken sockets."""
        if not socket_set:
            return
        text = json.dumps(message)
        dead_sockets = []
        for ws in list(socket_set):
            try:
                await ws.send_text(text)
            except Exception as e:
                logger.warning(f"[Realtime] Failed to send message to socket: {e}")
                dead_sockets.append(ws)
                
        if dead_sockets:
            async with self._lock:
                for dead in dead_sockets:
                    self.active_connections.discard(dead)
                    self.admin_connections.discard(dead)

# Global Realtime Manager Singleton
realtime_manager = ConnectionManager()
