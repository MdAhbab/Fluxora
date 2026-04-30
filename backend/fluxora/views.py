from uuid import uuid4

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.db.models import Count, Sum, Q, Max
from django.db.models.functions import TruncMonth, ExtractHour
from django.utils.timezone import now
from django.conf import settings
import math
import re

from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .models import (
    # Core
    UserRole, User, Building, Unit, Resident,
    # Services & Vendors
    Service, Vendor, Review,
    # Finance
    BillType, Invoice, InvoiceItem, Payment, Expense,
    # Notices
    Notice,
    # Staff & Attendance
    Staff, Attendance,
    # Visitor Management
    Appointment, Visitor,
    # Tickets
    Ticket, TicketImage,
    # Resources & Bookings
    Resource, Booking,
    # Polls & Surveys
    Poll, Option, Vote,
    # Documents
    Document, DocumentACLUser, DocumentACLRole, DocumentAuditLog,
    # SOS
    Emergency,
    # Intercom
    IntercomDevice, IntercomLog,
    # Chat
    ChatRoom, RoomMember, Message,
    # Rental
    Listing, RentalRequest, Contract,
    # Utilities
    UtilityMeter, UtilityBill,
    # Assets
    Asset, AssetMaintenance,
    # Gate & Lift
    GateEvent, LiftStatusLog,
    # Waste & Notifications
    WasteSchedule, Notification,
    # Events & Community
    Event, EventAttendee,
    # Access & Emergency Contacts
    AccessCard, EmergencyContact,
    # Parking
    ParkingSlot, Vehicle,
    # ML & Analytics
    MLModel, MLTrainingRun, MLCityPriceCache,
    # Activity & Settings
    ActivityLog, BuildingSetting,
)
from .permissions import IsCommitteeOrAdmin


def business_user_from_request(request):
    user = getattr(request, 'user', None)
    email = getattr(user, 'email', None)
    if email:
        match = User.objects.filter(email=email).first()
        if match:
            return match
    user_id = getattr(user, 'id', None)
    if user_id:
        return User.objects.filter(pk=user_id).first()
    return None


def serialize_business_user(user):
    if not user:
        return None
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'phone': user.phone,
        'role': user.role,
        'avatar_path': user.avatar_path,
    }


def first_building_for_user(user):
    if not user:
        return Building.objects.order_by('id').first()
    resident = Resident.objects.filter(user=user).select_related('building').first()
    if resident:
        return resident.building
    staff = Staff.objects.filter(user=user).select_related('building').first()
    if staff:
        return staff.building
    return (
        Building.objects.filter(Q(primary_contact=user) | Q(developer=user)).first()
        or Building.objects.order_by('id').first()
    )


def pageless_data(serializer_class, queryset, many=True):
    return serializer_class(queryset, many=many).data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField()
    building_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    modules = serializers.ListField(child=serializers.CharField(), required=False)


# ========= Serializers =========

class AutoModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
        fields = '__all__'


# Core
class UserSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = User


class BuildingSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Building


class UnitSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Unit


class ResidentSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Resident


# Services & Vendors
class ServiceSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Service


class VendorSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Vendor


class ReviewSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Review


# Finance
class BillTypeSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = BillType


class InvoiceItemSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = InvoiceItem


class InvoiceSerializer(AutoModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)

    class Meta(AutoModelSerializer.Meta):
        model = Invoice

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item)
        return invoice


class PaymentSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Payment


class ExpenseSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Expense

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be positive.')
        return value

    def validate_date(self, value):
        if value > now().date():
            raise serializers.ValidationError('Expense date cannot be in the future.')
        return value


# Notices
class NoticeSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Notice


# Staff & Attendance
class StaffSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Staff


class AttendanceSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Attendance


# Visitor Management
class AppointmentSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Appointment


class VisitorSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Visitor


# Tickets
class TicketImageSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = TicketImage


class TicketSerializer(AutoModelSerializer):
    images = TicketImageSerializer(many=True, read_only=True)

    class Meta(AutoModelSerializer.Meta):
        model = Ticket


# Resources & Bookings
class ResourceSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Resource


class BookingSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Booking

    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        resource = attrs.get('resource') or getattr(instance, 'resource', None)
        start_time = attrs.get('start_time') or getattr(instance, 'start_time', None)
        end_time = attrs.get('end_time') or getattr(instance, 'end_time', None)

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})

        if resource and start_time and end_time:
            conflicts = Booking.objects.filter(
                resource=resource,
                status__in=['pending', 'confirmed'],
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if instance:
                conflicts = conflicts.exclude(pk=instance.pk)
            if conflicts.exists():
                raise serializers.ValidationError('This resource already has a booking in that time window.')

        return attrs


# Polls
class OptionSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Option


class PollSerializer(AutoModelSerializer):
    options = OptionSerializer(many=True, required=False)

    class Meta(AutoModelSerializer.Meta):
        model = Poll

    def create(self, validated_data):
        options = validated_data.pop('options', [])
        poll = Poll.objects.create(**validated_data)
        for opt in options:
            Option.objects.create(poll=poll, **opt)
        return poll


class VoteSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Vote


# Documents
class DocumentSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Document


class DocumentACLUserSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = DocumentACLUser


class DocumentACLRoleSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = DocumentACLRole


class DocumentAuditLogSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = DocumentAuditLog


# SOS
class EmergencySerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Emergency


# Intercom
class IntercomDeviceSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = IntercomDevice


class IntercomLogSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = IntercomLog


# Chat
class ChatRoomSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = ChatRoom


class RoomMemberSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = RoomMember


class MessageSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Message


# Rental
class ListingSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Listing


class RentalRequestSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = RentalRequest


class ContractSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Contract


# Utilities
class UtilityMeterSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = UtilityMeter


class UtilityBillSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = UtilityBill


# Assets
class AssetSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Asset


class AssetMaintenanceSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = AssetMaintenance


# Gate & Lift
class GateEventSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = GateEvent


class LiftStatusLogSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = LiftStatusLog


# Waste & Notifications
class WasteScheduleSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = WasteSchedule


class NotificationSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Notification


# Events & Community
class EventSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Event


class EventAttendeeSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = EventAttendee


# Access & Emergency Contacts
class AccessCardSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = AccessCard


class EmergencyContactSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = EmergencyContact


# Parking
class ParkingSlotSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = ParkingSlot


class VehicleSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = Vehicle


# ML & Analytics
class MLModelSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = MLModel


class MLTrainingRunSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = MLTrainingRun


class MLCityPriceCacheSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = MLCityPriceCache


# Activity & Settings
class ActivityLogSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = ActivityLog


class BuildingSettingSerializer(AutoModelSerializer):
    class Meta(AutoModelSerializer.Meta):
        model = BuildingSetting


# ========= Permissions (simple defaults) =========

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Allow Django staff/superusers
        user = getattr(request, 'user', None)
        if user and user.is_authenticated and (getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False)):
            return True
        # Fallback: map Django user -> business user by email and check role
        try:
            if user and user.is_authenticated and getattr(user, 'email', None):
                bu = User.objects.filter(email=user.email).first()
                if bu and bu.role in ('admin', 'committee'):
                    return True
        except Exception:
            pass
        return False


# ========= ViewSets & APIs =========

class AuthLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']
        django_user = get_user_model().objects.filter(email__iexact=email).first()
        if not django_user:
            django_user = get_user_model().objects.filter(username__iexact=email).first()
        username = django_user.get_username() if django_user else email
        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        business_user = User.objects.filter(email__iexact=email).first()
        building = first_building_for_user(business_user)
        return Response({
            'token': token.key,
            'user': serialize_business_user(business_user),
            'building': BuildingSerializer(building).data if building else None,
        })


class AuthLogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'detail': 'Logged out.'})


class AuthMeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        business_user = business_user_from_request(request)
        building = first_building_for_user(business_user)
        return Response({
            'user': serialize_business_user(business_user),
            'building': BuildingSerializer(building).data if building else None,
        })


class AuthSignupAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        name = serializer.validated_data['name']
        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']
        building_name = serializer.validated_data.get('building_name') or 'Fluxora Demo Tower'
        modules = serializer.validated_data.get('modules', [])

        DjangoUser = get_user_model()
        if DjangoUser.objects.filter(email__iexact=email).exists():
            return Response({'detail': 'An account with this email already exists.'}, status=400)

        django_user = DjangoUser.objects.create_user(username=email, email=email, password=password, first_name=name)
        business_user = User.objects.create(
            name=name,
            email=email,
            password_hash=make_password(password),
            role=UserRole.ADMIN,
            phone='',
        )
        building = Building.objects.create(
            name=building_name,
            address='Dhaka, Bangladesh',
            developer=business_user,
            primary_contact=business_user,
            total_units=0,
        )
        BuildingSetting.objects.create(
            building=building,
            key_name='enabled_modules',
            value_json={'modules': modules},
        )
        token, _ = Token.objects.get_or_create(user=django_user)
        return Response({
            'token': token.key,
            'user': serialize_business_user(business_user),
            'building': BuildingSerializer(building).data,
        }, status=201)


class DashboardSummaryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        business_user = business_user_from_request(request)
        building_id = request.query_params.get('building_id')
        building = Building.objects.filter(pk=building_id).first() if building_id else first_building_for_user(business_user)

        if not building:
            return Response({
                'building': None,
                'buildings': [],
                'metrics': {},
                'sections': {},
            })

        invoices = Invoice.objects.filter(building=building).select_related('resident__user', 'resident__unit', 'bill_type').order_by('-created_at')
        tickets = Ticket.objects.filter(building=building).select_related('resident__user', 'assigned_to').order_by('-created_at')
        residents = Resident.objects.filter(building=building).select_related('user', 'unit').order_by('unit__unit_number')
        units = Unit.objects.filter(building=building).order_by('floor', 'unit_number')
        payments_total = Payment.objects.filter(invoice__building=building).aggregate(total=Sum('amount'))['total'] or 0
        outstanding = invoices.exclude(status='paid').aggregate(total=Sum('amount'))['total'] or 0
        occupied_units = units.filter(status__in=['occupied', 'sold', 'rented']).count()

        expense_rows = (
            Expense.objects.filter(building=building)
            .values('category')
            .annotate(total=Sum('amount'), entries=Count('id'))
            .order_by('-total')[:8]
        )

        latest_lift_logs = []
        for log in LiftStatusLog.objects.filter(building=building).select_related('asset').order_by('asset_id', '-timestamp'):
            if not any(item['asset_id'] == log.asset_id for item in latest_lift_logs):
                latest_lift_logs.append({
                    'id': log.id,
                    'asset_id': log.asset_id,
                    'name': log.asset.name if log.asset else 'Building lift',
                    'status': log.status,
                    'timestamp': log.timestamp,
                })

        parking_layout = BuildingSetting.objects.filter(building=building, key_name='parking_layout').first()
        chat_rooms = ChatRoom.objects.filter(building=building).annotate(last_message_at=Max('messages__sent_at')).order_by('-last_message_at', 'name')
        first_room = chat_rooms.first()
        resident_cards = [
            {
                'id': resident.id,
                'user': resident.user_id,
                'name': resident.user.name,
                'email': resident.user.email if resident.opt_in else None,
                'phone': resident.user.phone if resident.opt_in else None,
                'unit': resident.unit_id,
                'unit_number': resident.unit.unit_number if resident.unit else None,
                'is_owner': resident.is_owner,
                'opt_in': resident.opt_in,
            }
            for resident in residents
        ]
        invoice_cards = [
            {
                **InvoiceSerializer(invoice).data,
                'resident_name': invoice.resident.user.name,
                'unit_number': invoice.resident.unit.unit_number if invoice.resident.unit else None,
            }
            for invoice in invoices[:10]
        ]
        ticket_cards = [
            {
                **TicketSerializer(ticket).data,
                'resident_name': ticket.resident.user.name,
                'assigned_to_name': ticket.assigned_to.name if ticket.assigned_to else None,
            }
            for ticket in tickets[:12]
        ]
        booking_cards = [
            {
                **BookingSerializer(booking).data,
                'resource_name': booking.resource.name if booking.resource else None,
            }
            for booking in Booking.objects.filter(resource__building=building)
            .select_related('resource')
            .order_by('-start_time')[:8]
        ]
        poll_cards = []
        for poll in Poll.objects.filter(building=building).order_by('-start_date')[:5]:
            options = Option.objects.filter(poll=poll).annotate(votes=Count('vote')).order_by('id')
            total_votes = sum(option.votes for option in options)
            poll_cards.append({
                **PollSerializer(poll).data,
                'options': [
                    {
                        **OptionSerializer(option).data,
                        'votes': option.votes,
                        'percentage': round((option.votes / total_votes) * 100, 2) if total_votes else 0,
                    }
                    for option in options
                ],
                'total_votes': total_votes,
            })

        data = {
            'building': BuildingSerializer(building).data,
            'buildings': BuildingSerializer(Building.objects.all().order_by('name'), many=True).data,
            'me': serialize_business_user(business_user),
            'current_resident_id': Resident.objects.filter(user=business_user, building=building).values_list('id', flat=True).first(),
            'metrics': {
                'outstanding': outstanding,
                'payments_total': payments_total,
                'collection_rate': round((invoices.filter(status='paid').count() / invoices.count()) * 100) if invoices.exists() else 0,
                'open_tickets': tickets.exclude(status__in=['resolved', 'closed']).count(),
                'visitors_today': Appointment.objects.filter(building=building, scheduled_time__date=now().date()).count(),
                'occupancy_rate': round((occupied_units / units.count()) * 100) if units.exists() else 0,
                'occupied_units': occupied_units,
                'total_units': units.count(),
            },
            'sections': {
                'invoices': invoice_cards,
                'expenses': list(expense_rows),
                'notices': NoticeSerializer(Notice.objects.filter(building=building).order_by('-is_pinned', '-publish_date')[:8], many=True).data,
                'appointments': AppointmentSerializer(Appointment.objects.filter(building=building).order_by('-scheduled_time')[:8], many=True).data,
                'visitors': VisitorSerializer(Visitor.objects.filter(appointment__building=building).select_related('appointment').order_by('-checkin_time')[:8], many=True).data,
                'tickets': ticket_cards,
                'services': ServiceSerializer(Service.objects.all().order_by('name')[:12], many=True).data,
                'vendors': VendorSerializer(Vendor.objects.filter(Q(building=building) | Q(building__isnull=True)).select_related('service').order_by('-rating')[:8], many=True).data,
                'reviews': ReviewSerializer(Review.objects.filter(vendor__building=building).order_by('-created_at')[:8], many=True).data,
                'resources': ResourceSerializer(Resource.objects.filter(building=building).order_by('name'), many=True).data,
                'bookings': booking_cards,
                'polls': poll_cards,
                'documents': DocumentSerializer(Document.objects.filter(building=building, is_active=True).order_by('-uploaded_at')[:8], many=True).data,
                'emergencies': EmergencySerializer(Emergency.objects.filter(building=building).order_by('-timestamp')[:5], many=True).data,
                'staff': StaffSerializer(Staff.objects.filter(building=building).order_by('name'), many=True).data,
                'attendance': AttendanceSerializer(Attendance.objects.filter(staff__building=building).select_related('staff').order_by('-checkin_time')[:8], many=True).data,
                'directory': resident_cards,
                'intercom_logs': IntercomLogSerializer(IntercomLog.objects.filter(device__building=building).select_related('device').order_by('-timestamp')[:8], many=True).data,
                'chat_rooms': ChatRoomSerializer(chat_rooms, many=True).data,
                'messages': MessageSerializer(Message.objects.filter(room=first_room).order_by('sent_at')[:30], many=True).data if first_room else [],
                'listings': ListingSerializer(Listing.objects.filter(building=building).order_by('-created_at')[:8], many=True).data,
                'gate_logs': GateEventSerializer(GateEvent.objects.filter(building=building).order_by('-timestamp')[:10], many=True).data,
                'lifts': latest_lift_logs,
                'waste': WasteScheduleSerializer(WasteSchedule.objects.filter(building=building).order_by('schedule_time')[:5], many=True).data,
                'units': UnitSerializer(units, many=True).data,
                'assets': AssetSerializer(Asset.objects.filter(building=building).order_by('name'), many=True).data,
                'asset_maintenance': AssetMaintenanceSerializer(AssetMaintenance.objects.filter(asset__building=building).select_related('asset').order_by('-scheduled_date')[:8], many=True).data,
                'parking_slots': ParkingSlotSerializer(ParkingSlot.objects.filter(building=building).order_by('slot_number'), many=True).data,
                'vehicles': VehicleSerializer(Vehicle.objects.filter(resident__building=building).select_related('resident', 'parking_slot').order_by('vehicle_number'), many=True).data,
                'parking_layout': parking_layout.value_json if parking_layout else {'rows': 4, 'columns': 6, 'prefix': 'P'},
                'notifications': NotificationSerializer(Notification.objects.filter(building=building).order_by('-sent_at')[:8], many=True).data,
                'emergency_contacts': EmergencyContactSerializer(EmergencyContact.objects.filter(building=building).order_by('type'), many=True).data,
            }
        }
        return Response(data)


# Core
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all().order_by('-created_at')
    serializer_class = BuildingSerializer
    permission_classes = [permissions.IsAuthenticated]


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all().select_related('building').order_by('building_id', 'unit_number')
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        building_id = self.request.query_params.get('building_id')
        status_q = self.request.query_params.get('status')
        if building_id:
            qs = qs.filter(building_id=building_id)
        if status_q:
            qs = qs.filter(status=status_q)
        return qs


class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all().select_related('user', 'building', 'unit').order_by('-created_at')
    serializer_class = ResidentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def directory(self, request):
        qs = self.get_queryset().filter(user__is_listed=True)
        building_id = request.query_params.get('building_id')
        search = request.query_params.get('search')
        if building_id:
            qs = qs.filter(building_id=building_id)
        if search:
            qs = qs.filter(
                Q(user__name__icontains=search)
                | Q(unit__unit_number__icontains=search)
                | Q(user__email__icontains=search)
            )

        data = []
        for resident in qs[:100]:
            user = resident.user
            data.append({
                'id': resident.id,
                'name': user.name,
                'unit': resident.unit.unit_number if resident.unit else None,
                'building': resident.building.name,
                'email': user.email if resident.opt_in else None,
                'phone': user.phone if resident.opt_in else None,
                'avatar_path': user.avatar_path,
            })
        return Response({'count': len(data), 'results': data})


# Services & Vendors
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().select_related('service', 'building')
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        try:
            service_id = int(request.query_params.get('service_id'))
            lat = float(request.query_params.get('lat'))
            lng = float(request.query_params.get('lng'))
            radius_km = float(request.query_params.get('radius_km', 5))
        except (TypeError, ValueError):
            return Response({'detail': 'service_id, lat, lng are required'}, status=400)

        # Simple Haversine computation (approx)
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371.0
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlambda = math.radians(lon2 - lon1)
            a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
            return 2 * R * math.asin(math.sqrt(a))

        candidates = Vendor.objects.filter(service_id=service_id, latitude__isnull=False, longitude__isnull=False)
        results = []
        for v in candidates:
            d = haversine(lat, lng, float(v.latitude), float(v.longitude))
            if d <= radius_km:
                results.append((d, v))
        results.sort(key=lambda x: x[0])
        data = VendorSerializer([v for _, v in results], many=True).data
        return Response({'count': len(data), 'results': data})


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related('vendor', 'resident')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


# Finance
class BillTypeViewSet(viewsets.ModelViewSet):
    queryset = BillType.objects.all()
    serializer_class = BillTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommitteeOrAdmin]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related('resident', 'building', 'bill_type')
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        building_id = self.request.query_params.get('building_id')
        resident_id = self.request.query_params.get('resident_id')
        status_q = self.request.query_params.get('status')
        due_before = self.request.query_params.get('due_before')
        due_after = self.request.query_params.get('due_after')
        if building_id:
            qs = qs.filter(building_id=building_id)
        if resident_id:
            qs = qs.filter(resident_id=resident_id)
        if status_q:
            qs = qs.filter(status=status_q)
        if due_before:
            qs = qs.filter(due_date__lte=due_before)
        if due_after:
            qs = qs.filter(due_date__gte=due_after)
        return qs.order_by('-created_at')

    @action(detail=False, methods=['post'], permission_classes=[IsCommitteeOrAdmin])
    def generate_monthly(self, request):
        building_id = request.data.get('building_id')
        bill_type_id = request.data.get('bill_type_id')
        billing_month = request.data.get('billing_month')  # 'YYYY-MM'
        due_date = request.data.get('due_date')            # 'YYYY-MM-DD'
        include_utilities = bool(request.data.get('include_utilities', False))

        if not all([building_id, bill_type_id, billing_month, due_date]):
            return Response({'detail': 'building_id, bill_type_id, billing_month, due_date required'}, status=400)

        residents = Resident.objects.filter(building_id=building_id)
        created = []
        for r in residents:
            inv = Invoice.objects.create(
                invoice_number=f"AUTO-{r.id}-{billing_month.replace('-', '')}",
                resident=r,
                building_id=building_id,
                bill_type_id=bill_type_id,
                amount=0,
                due_date=due_date,
                status='pending'
            )
            # Example fixed line; replace with your business rules:
            InvoiceItem.objects.create(invoice=inv, description='Monthly Service Charge', quantity=1, unit_price=2000, tax_amount=0, total_amount=2000)
            total = inv.items.aggregate(s=Sum('total_amount'))['s'] or 0
            # Optionally include utilities:
            if include_utilities:
                # Attach latest unpaid utility bills for this resident's unit
                if r.unit_id:
                    meters = UtilityMeter.objects.filter(unit_id=r.unit_id)
                    bills = UtilityBill.objects.filter(meter__in=meters, status='pending')
                    for b in bills:
                        InvoiceItem.objects.create(invoice=inv, description=f'Utility {b.meter.type} {b.reading_date}', quantity=1, unit_price=b.amount, tax_amount=0, total_amount=b.amount, utility_bill_id=b.id)
                    total = inv.items.aggregate(s=Sum('total_amount'))['s'] or total
            inv.amount = total
            inv.save()
            created.append(inv.id)
        return Response({'created_invoices': created}, status=201)

    @action(detail=True, methods=['post'])
    def remind(self, request, pk=None):
        # Stub: integrate with email/SMS later
        inv = self.get_object()
        return Response({'detail': f'Reminder queued for invoice {inv.invoice_number}'})


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('invoice', 'resident')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        invoice_id = request.data.get('invoice_id')
        method = request.data.get('method', 'card')
        invoice = get_object_or_404(Invoice, pk=invoice_id)
        transaction_id = request.data.get('transaction_id') or f"demo_{uuid4().hex[:12]}"
        payment = Payment.objects.create(
            invoice=invoice,
            resident=invoice.resident,
            amount=invoice.amount,
            method=method,
            transaction_id=transaction_id,
        )
        invoice.status = 'paid'
        invoice.save(update_fields=['status', 'updated_at'])
        return Response({
            'checkout_status': 'paid',
            'transaction_id': transaction_id,
            'payment': PaymentSerializer(payment).data,
        }, status=201)


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().select_related('building', 'vendor', 'created_by')
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommitteeOrAdmin]

    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        qs = self.get_queryset()
        building_id = request.query_params.get('building_id')
        if building_id:
            qs = qs.filter(building_id=building_id)

        rows = (
            qs.annotate(month=TruncMonth('date'))
            .values('month', 'category')
            .annotate(total=Sum('amount'), entries=Count('id'))
            .order_by('-month', 'category')
        )
        return Response({
            'results': [
                {
                    'month': row['month'].date().isoformat() if row['month'] else None,
                    'category': row['category'],
                    'total': row['total'],
                    'entries': row['entries'],
                }
                for row in rows
            ]
        })


# Notices
class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().select_related('building', 'created_by')
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        building_id = self.request.query_params.get('building_id')
        include_archived = self.request.query_params.get('include_archived') == 'true'
        search = self.request.query_params.get('search')
        current = now()
        if building_id:
            qs = qs.filter(building_id=building_id)
        if not include_archived:
            qs = qs.filter(publish_date__lte=current).filter(Q(expiry_date__isnull=True) | Q(expiry_date__gte=current))
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(body__icontains=search))
        return qs.order_by('-is_pinned', '-publish_date')


# Staff & Attendance
class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().select_related('user', 'building')
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAuthenticated]


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('staff')
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def checkin(self, request):
        staff_id = request.data.get('staff_id')
        ts = request.data.get('timestamp')
        staff = get_object_or_404(Staff, pk=staff_id)
        rec = Attendance.objects.create(staff=staff, checkin_time=ts or now())
        return Response(AttendanceSerializer(rec).data, status=201)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        staff_id = request.data.get('staff_id')
        ts = request.data.get('timestamp')
        att = Attendance.objects.filter(staff_id=staff_id, checkout_time__isnull=True).order_by('-checkin_time').first()
        if not att:
            return Response({'detail': 'No open attendance record'}, status=400)
        att.checkout_time = ts or now()
        att.save()
        return Response(AttendanceSerializer(att).data)


# Visitor Management
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().select_related('building', 'resident')
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        token = serializer.validated_data.get('qr_token') or uuid4().hex
        serializer.save(qr_token=token)

    @action(detail=True, methods=['get'])
    def qr(self, request, pk=None):
        appt = self.get_object()
        return Response({'appointment_id': appt.id, 'qr_token': appt.qr_token})


class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all().select_related('appointment', 'handled_by')
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def scan(self, request):
        token = request.data.get('qr_token')
        handled_by = request.data.get('handled_by')
        if not token:
            return Response({'detail': 'qr_token is required'}, status=400)

        appointment = get_object_or_404(Appointment, qr_token=token)
        if appointment.scheduled_time.date() < now().date():
            return Response({'detail': 'Appointment has expired'}, status=400)

        visitor, _ = Visitor.objects.get_or_create(appointment=appointment)
        visitor.status = 'checked_in'
        visitor.checkin_time = visitor.checkin_time or now()
        if handled_by:
            visitor.handled_by_id = handled_by
        visitor.save()
        return Response(VisitorSerializer(visitor).data)

    @action(detail=True, methods=['patch'])
    def checkin(self, request, pk=None):
        v = self.get_object()
        v.status = 'checked_in'
        v.checkin_time = now()
        handled_by = request.data.get('handled_by')
        if handled_by:
            v.handled_by_id = handled_by
        else:
            app_user = business_user_from_request(request)
            if app_user:
                v.handled_by = app_user
        v.save()
        return Response(VisitorSerializer(v).data)

    @action(detail=True, methods=['patch'])
    def checkout(self, request, pk=None):
        v = self.get_object()
        v.status = 'checked_out'
        v.checkout_time = now()
        handled_by = request.data.get('handled_by')
        if handled_by:
            v.handled_by_id = handled_by
        else:
            app_user = business_user_from_request(request)
            if app_user:
                v.handled_by = app_user
        v.save()
        return Response(VisitorSerializer(v).data)


# Tickets
class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().select_related('building', 'resident', 'assigned_to', 'service_vendor')
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        category = serializer.validated_data.get('category', '')
        building = serializer.validated_data.get('building')
        assigned_to = serializer.validated_data.get('assigned_to')
        if not assigned_to and building:
            assigned_to = Staff.objects.filter(building=building, role__icontains=category).first()
            if not assigned_to:
                assigned_to = Staff.objects.filter(building=building).first()
        serializer.save(assigned_to=assigned_to)

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        ticket = self.get_object()
        next_status = request.data.get('status')
        valid_statuses = {choice[0] for choice in TicketStatus.choices}
        if next_status not in valid_statuses:
            return Response({'detail': f'status must be one of {sorted(valid_statuses)}'}, status=400)
        ticket.status = next_status
        ticket.closed_at = now() if next_status in {'resolved', 'closed'} else None
        ticket.save(update_fields=['status', 'closed_at', 'updated_at'])
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def images(self, request, pk=None):
        ticket = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'file is required'}, status=400)
        if file_obj.size > 5 * 1024 * 1024:
            return Response({'detail': 'file must be 5MB or smaller'}, status=400)
        # store file (can integrate with S3 later)
        path = default_storage.save(f"tickets/{ticket.id}/{file_obj.name}", file_obj)
        img = TicketImage.objects.create(ticket=ticket, image_path=path)
        return Response(TicketImageSerializer(img).data, status=201)


class TicketImageViewSet(viewsets.ModelViewSet):
    queryset = TicketImage.objects.all().select_related('ticket')
    serializer_class = TicketImageSerializer
    permission_classes = [permissions.IsAuthenticated]


# Resources & Bookings
class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all().select_related('building')
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        resource = self.get_object()
        start_from = request.query_params.get('start_from')
        end_to = request.query_params.get('end_to')
        qs = Booking.objects.filter(resource=resource)
        if start_from:
            qs = qs.filter(end_time__gte=start_from)
        if end_to:
            qs = qs.filter(start_time__lte=end_to)
        data = BookingSerializer(qs.order_by('start_time'), many=True).data
        return Response({'resource_id': resource.id, 'bookings': data})


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().select_related('resource', 'resident')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def quote(self, request):
        resource_id = request.data.get('resource')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        serializer = self.get_serializer(data={
            'resource': resource_id,
            'resident': request.data.get('resident'),
            'start_time': start_time,
            'end_time': end_time,
            'status': 'pending',
        })
        serializer.is_valid(raise_exception=True)
        return Response({'available': True, 'estimated_fee': request.data.get('estimated_fee', 0)})


# Polls
class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all().select_related('building', 'created_by')
    serializer_class = PollSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        poll = self.get_object()
        option_id = request.data.get('option_id')
        resident_id = request.data.get('resident_id')
        if not option_id or not resident_id:
            return Response({'detail': 'option_id and resident_id required'}, status=400)
        # Enforce one vote per poll per resident
        if Vote.objects.filter(poll=poll, resident_id=resident_id).exists():
            return Response({'detail': 'Already voted'}, status=400)
        opt = get_object_or_404(Option, pk=option_id, poll=poll)
        vote = Vote.objects.create(poll=poll, option=opt, resident_id=resident_id)
        return Response(VoteSerializer(vote).data, status=201)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        poll = self.get_object()
        options = Option.objects.filter(poll=poll).annotate(votes=Count('vote'))
        raw = [{'option_id': o.id, 'text': o.option_text, 'votes': o.votes} for o in options]
        total = sum(r['votes'] for r in raw)
        results = [
            {
                **row,
                'percentage': round((row['votes'] / total) * 100, 2) if total else 0,
            }
            for row in raw
        ]
        return Response({'poll_id': poll.id, 'total_votes': total, 'results': results})


class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all().select_related('poll')
    serializer_class = OptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class VoteViewSet(viewsets.ModelViewSet):
    queryset = Vote.objects.all().select_related('poll', 'option', 'resident')
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]


# Documents
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().select_related('building', 'uploaded_by', 'parent')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        # Accepts multipart: title, building, file, mime_type, parent_id
        file_obj = request.FILES.get('file')
        data = request.data.copy()
        if file_obj:
            path = default_storage.save(f"documents/{file_obj.name}", file_obj)
            data['file_path'] = path
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Audit
        audit_user = business_user_from_request(request)
        if audit_user:
            DocumentAuditLog.objects.create(document_id=serializer.data['id'], user=audit_user, event_type='edit')
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        doc = self.get_object()
        audit_user = business_user_from_request(request)
        if audit_user:
            DocumentAuditLog.objects.create(document=doc, user=audit_user, event_type='download')
        # Typically return a signed URL or redirect; here we return path
        return Response({'file_path': doc.file_path})

    @action(detail=True, methods=['get'])
    def audit(self, request, pk=None):
        doc = self.get_object()
        logs = DocumentAuditLog.objects.filter(document=doc).order_by('-event_time')
        return Response(DocumentAuditLogSerializer(logs, many=True).data)


class DocumentACLUserViewSet(viewsets.ModelViewSet):
    queryset = DocumentACLUser.objects.all().select_related('document', 'user')
    serializer_class = DocumentACLUserSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentACLRoleViewSet(viewsets.ModelViewSet):
    queryset = DocumentACLRole.objects.all().select_related('document')
    serializer_class = DocumentACLRoleSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentAuditLog.objects.all().select_related('document', 'user')
    serializer_class = DocumentAuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]


# SOS
class EmergencyViewSet(viewsets.ModelViewSet):
    queryset = Emergency.objects.all().select_related('building', 'resident')
    serializer_class = EmergencySerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        emergency = Emergency.objects.filter(pk=response.data.get('id')).first()
        if emergency:
            Notification.objects.create(
                building=emergency.building,
                resident=emergency.resident,
                type='sos',
                message='Emergency SOS alert created. Security has been notified.',
            )
        return response


# Intercom
class IntercomDeviceViewSet(viewsets.ModelViewSet):
    queryset = IntercomDevice.objects.all().select_related('building')
    serializer_class = IntercomDeviceSerializer
    permission_classes = [permissions.IsAuthenticated]


class IntercomLogViewSet(viewsets.ModelViewSet):
    queryset = IntercomLog.objects.all().select_related('device')
    serializer_class = IntercomLogSerializer
    permission_classes = [permissions.IsAuthenticated]


class IntercomWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        device_id = request.data.get('device_id')
        event_type = request.data.get('event_type')
        timestamp = request.data.get('timestamp')  # optional
        details = request.data.get('details')
        device = get_object_or_404(IntercomDevice, pk=device_id)
        log = IntercomLog.objects.create(device=device, event_type=event_type, details=details)
        return Response({'id': log.id}, status=201)


# Chat
class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all().select_related('building')
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]


class RoomMemberViewSet(viewsets.ModelViewSet):
    queryset = RoomMember.objects.all().select_related('room', 'resident')
    serializer_class = RoomMemberSerializer
    permission_classes = [permissions.IsAuthenticated]


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().select_related('room', 'resident').order_by('-sent_at')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        room_id = self.request.query_params.get('room_id')
        search = self.request.query_params.get('search')
        latest = self.request.query_params.get('latest') == 'true'
        if room_id:
            qs = qs.filter(room_id=room_id)
        if search:
            qs = qs.filter(content__icontains=search)
        return qs.order_by('-sent_at' if latest else 'sent_at')

    def perform_create(self, serializer):
        message = serializer.save()
        member_ids = RoomMember.objects.filter(room=message.room).exclude(resident=message.resident).values_list('resident_id', flat=True)
        notifications = [
            Notification(
                building=message.room.building,
                resident_id=resident_id,
                type='chat',
                message=f'New message in {message.room.name}',
            )
            for resident_id in member_ids
        ]
        if notifications:
            Notification.objects.bulk_create(notifications)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        room_id = request.query_params.get('room_id')
        qs = self.get_queryset()
        if room_id:
            qs = qs.filter(room_id=room_id)
        return Response({
            'messages': qs.count(),
            'rooms': ChatRoom.objects.count(),
            'latest': MessageSerializer(qs.order_by('-sent_at').first()).data if qs.exists() else None,
        })


# Rental
class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all().select_related('resident', 'building', 'unit')
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]


class RentalRequestViewSet(viewsets.ModelViewSet):
    queryset = RentalRequest.objects.all().select_related('listing', 'tenant')
    serializer_class = RentalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all().select_related('request')
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


# Utilities
class UtilityMeterViewSet(viewsets.ModelViewSet):
    queryset = UtilityMeter.objects.all().select_related('unit')
    serializer_class = UtilityMeterSerializer
    permission_classes = [permissions.IsAuthenticated]


class UtilityBillViewSet(viewsets.ModelViewSet):
    queryset = UtilityBill.objects.all().select_related('meter')
    serializer_class = UtilityBillSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def generate(self, request):
        building_id = request.data.get('building_id')
        month = request.data.get('month')  # 'YYYY-MM'
        rates_json = request.data.get('rates_json')  # optional; implement logic as needed
        if not building_id or not month:
            return Response({'detail': 'building_id and month required'}, status=400)
        meters = UtilityMeter.objects.filter(unit__building_id=building_id)
        created = []
        for m in meters:
            # Placeholder: create a bill with dummy values
            bill = UtilityBill.objects.create(
                meter=m, reading_date=f"{month}-28", reading_value=0, amount=0, status='pending'
            )
            created.append(bill.id)
        return Response({'created_bills': created}, status=201)


# Assets
class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().select_related('building')
    serializer_class = AssetSerializer
    permission_classes = [permissions.IsAuthenticated]


class AssetMaintenanceViewSet(viewsets.ModelViewSet):
    queryset = AssetMaintenance.objects.all().select_related('asset', 'vendor')
    serializer_class = AssetMaintenanceSerializer
    permission_classes = [permissions.IsAuthenticated]


# Gate & Lift
class GateEventViewSet(viewsets.ModelViewSet):
    queryset = GateEvent.objects.all().select_related('building', 'actor')
    serializer_class = GateEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        qs = self.get_queryset()
        building_id = request.query_params.get('building_id')
        if building_id:
            qs = qs.filter(building_id=building_id)
        rows = qs.annotate(hour=ExtractHour('timestamp')).values('hour', 'event_type').annotate(total=Count('id')).order_by('hour')
        return Response({'results': list(rows)})


class LiftStatusLogViewSet(viewsets.ModelViewSet):
    queryset = LiftStatusLog.objects.all().select_related('building', 'asset')
    serializer_class = LiftStatusLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def current(self, request):
        qs = self.get_queryset()
        building_id = request.query_params.get('building_id')
        if building_id:
            qs = qs.filter(building_id=building_id)
        latest = {}
        for log in qs.order_by('asset_id', '-timestamp'):
            key = log.asset_id or f'building-{log.building_id}'
            if key not in latest:
                latest[key] = LiftStatusLogSerializer(log).data
        return Response({'results': list(latest.values())})


# Waste & Notifications
class WasteScheduleViewSet(viewsets.ModelViewSet):
    queryset = WasteSchedule.objects.all().select_related('building')
    serializer_class = WasteScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def next(self, request):
        qs = self.get_queryset().filter(schedule_time__gte=now()).order_by('schedule_time')
        building_id = request.query_params.get('building_id')
        if building_id:
            qs = qs.filter(building_id=building_id)
        schedule = qs.first()
        return Response({'next_collection': WasteScheduleSerializer(schedule).data if schedule else None})


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().select_related('building', 'resident')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]


# Events & Community
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().select_related('building', 'created_by')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]


class EventAttendeeViewSet(viewsets.ModelViewSet):
    queryset = EventAttendee.objects.all().select_related('event', 'resident')
    serializer_class = EventAttendeeSerializer
    permission_classes = [permissions.IsAuthenticated]


# Access & Emergency Contacts
class AccessCardViewSet(viewsets.ModelViewSet):
    queryset = AccessCard.objects.all().select_related('resident')
    serializer_class = AccessCardSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmergencyContactViewSet(viewsets.ModelViewSet):
    queryset = EmergencyContact.objects.all().select_related('building')
    serializer_class = EmergencyContactSerializer
    permission_classes = [permissions.IsAuthenticated]


# Parking
class ParkingSlotViewSet(viewsets.ModelViewSet):
    queryset = ParkingSlot.objects.all().select_related('building')
    serializer_class = ParkingSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def layout(self, request):
        building_id = request.data.get('building_id')
        rows = int(request.data.get('rows', 4))
        columns = int(request.data.get('columns', 6))
        prefix = request.data.get('prefix', 'P')
        if not building_id:
            return Response({'detail': 'building_id is required'}, status=400)
        building = get_object_or_404(Building, pk=building_id)
        rows = max(1, min(rows, 12))
        columns = max(1, min(columns, 12))
        slots = []
        for row in range(1, rows + 1):
            for column in range(1, columns + 1):
                slot_number = f'{prefix}{row}-{column:02d}'
                slot, _ = ParkingSlot.objects.get_or_create(
                    building=building,
                    slot_number=slot_number,
                    defaults={'status': 'available'},
                )
                slots.append(slot)
        setting, _ = BuildingSetting.objects.update_or_create(
            building=building,
            key_name='parking_layout',
            defaults={'value_json': {'rows': rows, 'columns': columns, 'prefix': prefix}},
        )
        return Response({
            'layout': setting.value_json,
            'slots': ParkingSlotSerializer(slots, many=True).data,
        }, status=201)


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().select_related('resident', 'parking_slot')
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]


# ML & Analytics
class MLModelViewSet(viewsets.ModelViewSet):
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer
    permission_classes = [permissions.IsAuthenticated]


class MLTrainingRunViewSet(viewsets.ModelViewSet):
    queryset = MLTrainingRun.objects.all().select_related('model')
    serializer_class = MLTrainingRunSerializer
    permission_classes = [permissions.IsAuthenticated]


class MLCityPriceCacheViewSet(viewsets.ModelViewSet):
    queryset = MLCityPriceCache.objects.all().select_related('model')
    serializer_class = MLCityPriceCacheSerializer
    permission_classes = [permissions.IsAuthenticated]


class PriceEstimateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        city = request.data.get('city')
        currency = request.data.get('currency', 'BDT')
        if not city:
            return Response({'detail': 'city is required'}, status=400)
        latest_model = MLModel.objects.order_by('-created_at').first()
        if not latest_model:
            return Response({'detail': 'No model available'}, status=404)
        cache = MLCityPriceCache.objects.filter(city__iexact=city, model=latest_model).order_by('-computed_at').first()
        if cache:
            return Response({'city': city, 'estimate': cache.estimate, 'currency': cache.currency, 'model_version': latest_model.version})
        # If not cached, return a placeholder (or trigger background compute)
        return Response({'city': city, 'estimate': None, 'currency': currency, 'model_version': latest_model.version}, status=202)


# Activity & Settings
class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all().select_related('user')
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]


class BuildingSettingViewSet(viewsets.ModelViewSet):
    queryset = BuildingSetting.objects.all().select_related('building')
    serializer_class = BuildingSettingSerializer
    permission_classes = [permissions.IsAuthenticated]


# Admin overview (multi-building)
class AdminOverviewAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        building_ids = request.query_params.getlist('building_ids[]') or request.query_params.getlist('building_ids')
        qs_filter = {}
        if building_ids:
            qs_filter['building_id__in'] = building_ids

        data = {
            'invoices': Invoice.objects.filter(**qs_filter).count(),
            'payments_sum': float(
                Payment.objects.filter(invoice__building_id__in=building_ids).aggregate(s=Sum('amount'))['s'] or 0
            ) if building_ids else float(Payment.objects.aggregate(s=Sum('amount'))['s'] or 0),
            'open_tickets': Ticket.objects.filter(status='open', **qs_filter).count(),
            'bookings': Booking.objects.filter(resource__building_id__in=building_ids) .count() if building_ids else Booking.objects.count(),
            'occupancy': Unit.objects.filter(status='occupied').count(),
        }
        return Response(data)
