# fluxora/permissions.py
from rest_framework import permissions
from .models import User

class IsCommitteeOrAdmin(permissions.BasePermission):
    """Allow write to committee/admin roles (or Django staff), read for others."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
                return True
            try:
                if getattr(user, 'email', None):
                    bu = User.objects.filter(email=user.email).first()
                    if bu and bu.role in ('admin', 'committee'):
                        return True
            except Exception:
                pass
        return False

