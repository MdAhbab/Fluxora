# fluxora/tenancy.py
# Row-level tenant isolation: every building-owned queryset is filtered to the
# buildings the caller belongs to (resident, staff, developer, or primary
# contact). Django staff/superusers bypass scoping for back-office work.

from django.db.models import Q

from .models import Building, Resident, Staff, User

_REQUEST_CACHE_ATTR = '_fluxora_allowed_building_ids'


def business_user_for(request):
    """Resolve the business-domain User for an authenticated Django user."""
    auth_user = getattr(request, 'user', None)
    email = getattr(auth_user, 'email', None) or getattr(auth_user, 'username', None)
    if not email:
        return None
    return User.objects.filter(email__iexact=email).first()


def buildings_for_user(business_user):
    """Queryset of buildings the business user is attached to in any capacity."""
    if not business_user:
        return Building.objects.none()
    return Building.objects.filter(
        Q(developer=business_user)
        | Q(primary_contact=business_user)
        | Q(pk__in=Resident.objects.filter(user=business_user).values('building_id'))
        | Q(pk__in=Staff.objects.filter(user=business_user).values('building_id'))
    ).distinct()


def is_backoffice(request) -> bool:
    user = getattr(request, 'user', None)
    return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


def allowed_building_ids(request):
    """Building ids the caller may see, or None for unrestricted back-office users.

    Cached on the request so a single API call resolves membership once.
    """
    if is_backoffice(request):
        return None
    cached = getattr(request, _REQUEST_CACHE_ATTR, False)
    if cached is not False:
        return cached
    ids = list(buildings_for_user(business_user_for(request)).values_list('id', flat=True))
    setattr(request, _REQUEST_CACHE_ATTR, ids)
    return ids


class BuildingScopedMixin:
    """Filters a ViewSet's queryset to the caller's buildings.

    `tenant_field` is the ORM path from the model to its Building FK
    (e.g. 'building', 'invoice__building', 'resource__building').
    Set it to None on a ViewSet to opt out (global catalogs).
    Also honours an explicit `?building_id=` filter within the allowed set.
    """

    tenant_field = 'building'

    def get_queryset(self):
        qs = super().get_queryset()
        if self.tenant_field is None:
            return qs
        allowed = allowed_building_ids(self.request)
        if allowed is not None:
            qs = qs.filter(**{f'{self.tenant_field}__in': allowed})
        building_id = self.request.query_params.get('building_id')
        if building_id:
            qs = qs.filter(**{self.tenant_field: building_id})
        return qs
