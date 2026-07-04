# fluxora/permissions.py
from rest_framework import permissions

from .models import User


def _has_admin_role(request) -> bool:
    user = getattr(request, 'user', None)
    if not (user and user.is_authenticated):
        return False
    if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
        return True
    email = getattr(user, 'email', None) or getattr(user, 'username', None)
    if not email:
        return False
    bu = User.objects.filter(email__iexact=email).only('role').first()
    return bool(bu and bu.role in ('admin', 'committee'))


class IsCommitteeOrAdmin(permissions.BasePermission):
    """Allow writes only to committee/admin roles (or Django staff); read for others."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return _has_admin_role(request)


class IsCommitteeOrAdminStrict(permissions.BasePermission):
    """Committee/admin role required for every method, including reads."""

    def has_permission(self, request, view):
        return _has_admin_role(request)
