# fluxora/context.py
import os

def brand(request):
    """
    Inject brand/theme tokens and public keys into template context.
    """
    return {
        'BRAND': {
            'name': os.getenv('BRAND_NAME', 'Fluxora'),
            'primary': os.getenv('BRAND_PRIMARY', '#005FAA'),
            'accent': os.getenv('BRAND_ACCENT', '#FFB800'),
        },
        'GOOGLE_MAPS_API_KEY': os.getenv('GOOGLE_MAPS_API_KEY', ''),
        'CURRENT_BUILDING_ID': getattr(request, 'current_building_id', None),
    }

