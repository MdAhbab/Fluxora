# fluxora/consumers.py
try:
    from channels.generic.websocket import AsyncJsonWebsocketConsumer  # type: ignore
except Exception:
    class AsyncJsonWebsocketConsumer:  # type: ignore
        async def accept(self):
            pass
        async def send_json(self, content):
            pass
        async def close(self):
            pass

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope.get('url_route', {}).get('kwargs', {}).get('room_id')
        self.group_name = f"chat_{self.room_id}"
        try:
            await self.channel_layer.group_add(self.group_name, self.channel_name)
        except Exception:
            pass
        await self.accept()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        except Exception:
            pass

    async def receive_json(self, content, **kwargs):
        # Expected payload: {"type":"message", "text":"...", "sender":"..."}
        msg_type = content.get('type')
        if msg_type == 'message':
            try:
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'chat.message',
                        'text': content.get('text'),
                        'sender': content.get('sender'),
                    }
                )
            except Exception:
                # Fallback: just echo back
                await self.send_json({'text': content.get('text'), 'sender': content.get('sender')})

    async def chat_message(self, event):
        await self.send_json({
            'text': event.get('text'),
            'sender': event.get('sender'),
        })
