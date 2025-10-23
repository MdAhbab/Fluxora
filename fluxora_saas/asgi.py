"""
ASGI config for fluxora_saas project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import importlib

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fluxora_saas.settings')

# HTTP application
django_asgi_app = get_asgi_application()

# Try to compose a Channels ProtocolTypeRouter without hard imports
try:
    channels_routing = importlib.import_module('channels.routing')
    channels_auth = importlib.import_module('channels.auth')
    flux_routing = importlib.import_module('fluxora.routing')

    ProtocolTypeRouter = getattr(channels_routing, 'ProtocolTypeRouter')
    URLRouter = getattr(channels_routing, 'URLRouter')
    AuthMiddlewareStack = getattr(channels_auth, 'AuthMiddlewareStack')
    websocket_urlpatterns = getattr(flux_routing, 'websocket_urlpatterns')

    application = ProtocolTypeRouter({
        'http': django_asgi_app,
        'websocket': AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    })
except Exception:
    # Fallback to plain Django ASGI if channels isn't available or routing is missing
    application = django_asgi_app
