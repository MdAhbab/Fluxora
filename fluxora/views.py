from django.shortcuts import get_object_or_404, render, redirect
from django.core.files.storage import default_storage
from django.db.models import Count, Sum
from django.utils.timezone import now
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.conf import settings
from django.utils.http import url_has_allowed_host_and_scheme
import math
import re

from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    # Core
    User, Building, Unit, Resident,
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

# ========= Simple HTML views =========

def home(request):
    # Render the main landing page template that actually has content
    return render(request, 'index.html', {})


def landing_page(request):
    # Fallback to main index as our landing page
    return render(request, 'index.html', {})


def index_page(request):
    return render(request, 'index.html', {})


def dashboard_page(request):
    return render(request, 'dashboard/index.html', {})


# Auth pages (simple renders; actual auth handled by Django admin/auth or frontend)

def login_view(request):
    return render(request, 'auth/login.html', {})


def signup_view(request):
    return render(request, 'auth/signup.html', {})


def logout_view(request):
    logout(request)
    return redirect('home')


# Finance pages

def invoices_page(request):
    return render(request, 'finance/invoices_list.html', {})


def invoice_detail_page(request, pk: int):
    return render(request, 'finance/invoice_detail.html', {'invoice_id': pk})


# Ticket pages

def tickets_page(request):
    return render(request, 'tickets/list.html', {})


def ticket_detail_page(request, pk: int):
    return render(request, 'tickets/detail.html', {'ticket_id': pk})


# Document pages

def documents_page(request):
    return render(request, 'documents/list.html', {})


def document_detail_page(request, pk: int):
    return render(request, 'documents/detail.html', {'document_id': pk})


# Polls & bookings & visitors & services

def polls_page(request):
    return render(request, 'polls/list.html', {})


def bookings_calendar_page(request):
    return render(request, 'bookings/calendar.html', {})


def visitors_calendar_page(request):
    return render(request, 'visitors/calendar.html', {})


def services_directory_page(request):
    return render(request, 'services/directory.html', {})


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


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().select_related('building', 'vendor', 'created_by')
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommitteeOrAdmin]


# Notices
class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().select_related('building', 'created_by')
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]


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

    @action(detail=True, methods=['get'])
    def qr(self, request, pk=None):
        appt = self.get_object()
        return Response({'appointment_id': appt.id, 'qr_token': appt.qr_token})


class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all().select_related('appointment', 'handled_by')
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['patch'])
    def checkin(self, request, pk=None):
        v = self.get_object()
        v.status = 'checked_in'
        v.checkin_time = now()
        v.handled_by_id = request.data.get('handled_by') or getattr(request.user, 'id', None)
        v.save()
        return Response(VisitorSerializer(v).data)

    @action(detail=True, methods=['patch'])
    def checkout(self, request, pk=None):
        v = self.get_object()
        v.status = 'checked_out'
        v.checkout_time = now()
        v.handled_by_id = request.data.get('handled_by') or getattr(request.user, 'id', None)
        v.save()
        return Response(VisitorSerializer(v).data)


# Tickets
class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().select_related('building', 'resident', 'assigned_to', 'service_vendor')
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def images(self, request, pk=None):
        ticket = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'file is required'}, status=400)
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
        results = [{'option_id': o.id, 'text': o.option_text, 'votes': o.votes} for o in options]
        total = sum(r['votes'] for r in results)
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
        DocumentAuditLog.objects.create(document_id=serializer.data['id'], user=request.user, event_type='edit')
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        doc = self.get_object()
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


class LiftStatusLogViewSet(viewsets.ModelViewSet):
    queryset = LiftStatusLog.objects.all().select_related('building', 'asset')
    serializer_class = LiftStatusLogSerializer
    permission_classes = [permissions.IsAuthenticated]


# Waste & Notifications
class WasteScheduleViewSet(viewsets.ModelViewSet):
    queryset = WasteSchedule.objects.all().select_related('building')
    serializer_class = WasteScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]


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
            'payments_sum': float(Payment.objects.filter(**qs_filter).aggregate(s=Sum('amount'))['s'] or 0),
            'open_tickets': Ticket.objects.filter(status='open', **qs_filter).count(),
            'bookings': Booking.objects.filter(resource__building_id__in=building_ids) .count() if building_ids else Booking.objects.count(),
            'occupancy': Unit.objects.filter(status='occupied').count(),
        }
        return Response(data)
