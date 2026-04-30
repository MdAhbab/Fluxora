# admin.py
from django.contrib import admin
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


# ========== INLINES ==========

class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1
    fields = ('description', 'quantity', 'unit_price', 'tax_amount', 'total_amount')
    readonly_fields = ()


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ('amount', 'method', 'transaction_id', 'payment_date')
    readonly_fields = ('payment_date',)


class TicketImageInline(admin.TabularInline):
    model = TicketImage
    extra = 0
    fields = ('image_path',)


class OptionInline(admin.TabularInline):
    model = Option
    extra = 2
    fields = ('option_text',)


class DocumentACLUserInline(admin.TabularInline):
    model = DocumentACLUser
    extra = 0
    fields = ('user', 'can_view', 'can_edit')
    autocomplete_fields = ('user',)


class DocumentACLRoleInline(admin.TabularInline):
    model = DocumentACLRole
    extra = 0
    fields = ('role', 'can_view', 'can_edit')


class DocumentAuditLogInline(admin.TabularInline):
    model = DocumentAuditLog
    extra = 0
    fields = ('user', 'event_type', 'event_time')
    readonly_fields = ('event_time',)
    autocomplete_fields = ('user',)


class EventAttendeeInline(admin.TabularInline):
    model = EventAttendee
    extra = 0
    fields = ('resident', 'status')
    autocomplete_fields = ('resident',)


class MLTrainingRunInline(admin.TabularInline):
    model = MLTrainingRun
    extra = 0
    fields = ('started_at', 'completed_at')
    readonly_fields = ('started_at',)


# ========== ADMIN CLASSES ==========

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'is_listed', 'phone', 'created_at')
    search_fields = ('name', 'email', 'phone', 'national_id')
    list_filter = ('role', 'is_listed')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'developer', 'year_built', 'num_floors', 'total_units')
    search_fields = ('name', 'address')
    list_filter = ('year_built',)
    autocomplete_fields = ('developer', 'primary_contact')
    readonly_fields = ('created_at',)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('building', 'unit_number', 'type', 'status', 'price', 'floor')
    list_filter = ('building', 'type', 'status')
    search_fields = ('unit_number',)
    autocomplete_fields = ('building',)
    ordering = ('building', 'unit_number')
    readonly_fields = ('created_at',)


@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ('user', 'building', 'unit', 'is_owner', 'opt_in', 'start_date', 'end_date')
    list_filter = ('building', 'is_owner', 'opt_in')
    search_fields = ('user__name', 'user__email', 'unit__unit_number')
    autocomplete_fields = ('user', 'building', 'unit')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)
    autocomplete_fields = ('parent',)


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'service', 'building', 'rating', 'contact_info', 'created_at')
    list_filter = ('service', 'building')
    search_fields = ('name', 'contact_info')
    autocomplete_fields = ('service', 'building')
    readonly_fields = ('created_at',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'resident', 'rating', 'created_at')
    list_filter = ('rating', 'vendor')
    search_fields = ('vendor__name', 'resident__user__name')
    autocomplete_fields = ('vendor', 'resident')
    readonly_fields = ('created_at',)


@admin.register(BillType)
class BillTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'resident', 'building', 'bill_type', 'amount', 'status', 'due_date', 'created_at')
    list_filter = ('building', 'status', 'bill_type', 'due_date')
    search_fields = ('invoice_number', 'resident__user__name', 'resident__user__email')
    autocomplete_fields = ('resident', 'building', 'bill_type')
    date_hierarchy = 'due_date'
    inlines = [InvoiceItemInline, PaymentInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'resident', 'amount', 'method', 'transaction_id', 'payment_date')
    list_filter = ('method', 'payment_date')
    search_fields = ('invoice__invoice_number', 'resident__user__name', 'transaction_id')
    autocomplete_fields = ('invoice', 'resident')
    date_hierarchy = 'payment_date'
    readonly_fields = ('payment_date',)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('building', 'category', 'amount', 'date', 'vendor', 'created_by')
    list_filter = ('building', 'category', 'date')
    search_fields = ('category', 'description', 'vendor__name')
    autocomplete_fields = ('building', 'vendor', 'created_by')
    date_hierarchy = 'date'
    readonly_fields = ('created_at',)


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'building', 'is_pinned', 'publish_date', 'expiry_date', 'created_by')
    list_filter = ('building', 'is_pinned', 'publish_date')
    search_fields = ('title', 'body')
    autocomplete_fields = ('building', 'created_by')
    date_hierarchy = 'publish_date'
    readonly_fields = ('created_at',)


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'designation', 'building', 'user')
    list_filter = ('building', 'role')
    search_fields = ('name', 'designation', 'user__email')
    autocomplete_fields = ('building', 'user')


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('staff', 'checkin_time', 'checkout_time')
    list_filter = ('staff__building',)
    search_fields = ('staff__name',)
    autocomplete_fields = ('staff',)
    date_hierarchy = 'checkin_time'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('building', 'resident', 'visitor_name', 'visitor_phone', 'scheduled_time', 'approved', 'qr_token')
    list_filter = ('building', 'approved', 'scheduled_time')
    search_fields = ('visitor_name', 'visitor_phone', 'resident__user__name')
    autocomplete_fields = ('building', 'resident')
    date_hierarchy = 'scheduled_time'
    readonly_fields = ('created_at',)


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'status', 'checkin_time', 'checkout_time', 'handled_by')
    list_filter = ('status',)
    search_fields = ('appointment__visitor_name', 'handled_by__name')
    autocomplete_fields = ('appointment', 'handled_by')
    date_hierarchy = 'checkin_time'


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'building', 'resident', 'category', 'status', 'priority', 'assigned_to', 'service_vendor', 'created_at', 'closed_at')
    list_filter = ('building', 'status', 'priority', 'assigned_to')
    search_fields = ('category', 'description', 'resident__user__name', 'service_vendor__name')
    autocomplete_fields = ('building', 'resident', 'assigned_to', 'service_vendor')
    date_hierarchy = 'created_at'
    inlines = [TicketImageInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'building', 'type', 'capacity', 'location')
    list_filter = ('building', 'type')
    search_fields = ('name', 'location')
    autocomplete_fields = ('building',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('resource', 'resident', 'status', 'start_time', 'end_time', 'purpose', 'created_at')
    list_filter = ('status', 'resource__building', 'start_time')
    search_fields = ('resident__user__name', 'resource__name', 'purpose')
    autocomplete_fields = ('resource', 'resident')
    date_hierarchy = 'start_time'
    readonly_fields = ('created_at',)


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ('question', 'building', 'created_by', 'start_date', 'end_date')
    list_filter = ('building', 'start_date')
    search_fields = ('question',)
    autocomplete_fields = ('building', 'created_by')
    date_hierarchy = 'start_date'
    inlines = [OptionInline]


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('poll', 'option', 'resident', 'voted_at')
    list_filter = ('poll',)
    search_fields = ('poll__question', 'resident__user__name')
    autocomplete_fields = ('poll', 'option', 'resident')
    date_hierarchy = 'voted_at'
    readonly_fields = ('voted_at',)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'building', 'version', 'is_active', 'uploaded_by', 'uploaded_at')
    list_filter = ('building', 'is_active')
    search_fields = ('title', 'file_path', 'mime_type')
    autocomplete_fields = ('building', 'uploaded_by', 'parent')
    date_hierarchy = 'uploaded_at'
    inlines = [DocumentACLUserInline, DocumentACLRoleInline, DocumentAuditLogInline]
    readonly_fields = ('uploaded_at',)


@admin.register(Emergency)
class EmergencyAdmin(admin.ModelAdmin):
    list_display = ('building', 'resident', 'latitude', 'longitude', 'timestamp')
    list_filter = ('building',)
    search_fields = ('resident__user__name',)
    autocomplete_fields = ('building', 'resident')
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)


@admin.register(IntercomDevice)
class IntercomDeviceAdmin(admin.ModelAdmin):
    list_display = ('device_name', 'building', 'ip_address')
    list_filter = ('building',)
    search_fields = ('device_name', 'ip_address')
    autocomplete_fields = ('building',)


@admin.register(IntercomLog)
class IntercomLogAdmin(admin.ModelAdmin):
    list_display = ('device', 'event_type', 'timestamp')
    list_filter = ('event_type', 'device__building')
    search_fields = ('device__device_name', 'event_type', 'details')
    autocomplete_fields = ('device',)
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'building', 'is_public')
    list_filter = ('building', 'is_public')
    search_fields = ('name',)
    autocomplete_fields = ('building',)


@admin.register(RoomMember)
class RoomMemberAdmin(admin.ModelAdmin):
    list_display = ('room', 'resident', 'joined_at')
    list_filter = ('room__building',)
    search_fields = ('room__name', 'resident__user__name', 'resident__user__email')
    autocomplete_fields = ('room', 'resident')
    date_hierarchy = 'joined_at'
    readonly_fields = ('joined_at',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('room', 'resident', 'sent_at')
    list_filter = ('room__building',)
    search_fields = ('room__name', 'resident__user__name', 'content')
    autocomplete_fields = ('room', 'resident')
    date_hierarchy = 'sent_at'
    readonly_fields = ('sent_at',)


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'building', 'resident', 'unit', 'rent', 'available_from', 'created_at')
    list_filter = ('building', 'available_from')
    search_fields = ('title', 'resident__user__name', 'unit__unit_number', 'description')
    autocomplete_fields = ('building', 'resident', 'unit')
    date_hierarchy = 'available_from'
    readonly_fields = ('created_at',)


@admin.register(RentalRequest)
class RentalRequestAdmin(admin.ModelAdmin):
    list_display = ('listing', 'tenant', 'status', 'requested_at')
    list_filter = ('status',)
    search_fields = ('listing__title', 'tenant__user__name')
    autocomplete_fields = ('listing', 'tenant')
    date_hierarchy = 'requested_at'
    readonly_fields = ('requested_at',)


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('request', 'contract_path', 'signed_at')
    search_fields = ('request__listing__title', 'contract_path')
    autocomplete_fields = ('request',)
    date_hierarchy = 'signed_at'


@admin.register(UtilityMeter)
class UtilityMeterAdmin(admin.ModelAdmin):
    list_display = ('meter_number', 'unit', 'type')
    list_filter = ('type', 'unit__building')
    search_fields = ('meter_number', 'unit__unit_number')
    autocomplete_fields = ('unit',)


@admin.register(UtilityBill)
class UtilityBillAdmin(admin.ModelAdmin):
    list_display = ('meter', 'reading_date', 'reading_value', 'amount', 'status')
    list_filter = ('status', 'reading_date', 'meter__unit__building')
    search_fields = ('meter__meter_number',)
    autocomplete_fields = ('meter',)
    date_hierarchy = 'reading_date'


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'building', 'type', 'status', 'purchase_date', 'warranty_expiry')
    list_filter = ('building', 'type', 'status')
    search_fields = ('name', 'type')
    autocomplete_fields = ('building',)
    date_hierarchy = 'purchase_date'


@admin.register(AssetMaintenance)
class AssetMaintenanceAdmin(admin.ModelAdmin):
    list_display = ('asset', 'scheduled_date', 'completed_date', 'vendor', 'cost')
    list_filter = ('scheduled_date', 'completed_date', 'vendor')
    search_fields = ('asset__name', 'vendor__name', 'description')
    autocomplete_fields = ('asset', 'vendor')
    date_hierarchy = 'scheduled_date'


@admin.register(GateEvent)
class GateEventAdmin(admin.ModelAdmin):
    list_display = ('building', 'event_type', 'timestamp', 'actor')
    list_filter = ('building', 'event_type')
    search_fields = ('actor__name',)
    autocomplete_fields = ('building', 'actor')
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)


@admin.register(LiftStatusLog)
class LiftStatusLogAdmin(admin.ModelAdmin):
    list_display = ('building', 'asset', 'status', 'timestamp')
    list_filter = ('building', 'status')
    search_fields = ('asset__name',)
    autocomplete_fields = ('building', 'asset')
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)


@admin.register(WasteSchedule)
class WasteScheduleAdmin(admin.ModelAdmin):
    list_display = ('building', 'schedule_time', 'recurring')
    list_filter = ('building',)
    search_fields = ('recurring',)
    autocomplete_fields = ('building',)
    date_hierarchy = 'schedule_time'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('building', 'resident', 'type', 'is_read', 'sent_at')
    list_filter = ('building', 'is_read', 'type')
    search_fields = ('message', 'resident__user__name')
    autocomplete_fields = ('building', 'resident')
    date_hierarchy = 'sent_at'
    readonly_fields = ('sent_at',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'building', 'event_date', 'created_by')
    list_filter = ('building', 'event_date')
    search_fields = ('title', 'description')
    autocomplete_fields = ('building', 'created_by')
    date_hierarchy = 'event_date'


@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ('event', 'resident', 'status')
    list_filter = ('status', 'event__building')
    search_fields = ('event__title', 'resident__user__name')
    autocomplete_fields = ('event', 'resident')


@admin.register(AccessCard)
class AccessCardAdmin(admin.ModelAdmin):
    list_display = ('resident', 'card_number', 'status', 'issued_at')
    list_filter = ('status',)
    search_fields = ('card_number', 'resident__user__name')
    autocomplete_fields = ('resident',)
    date_hierarchy = 'issued_at'
    readonly_fields = ('issued_at',)


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ('building', 'name', 'phone', 'type')
    list_filter = ('building', 'type')
    search_fields = ('name', 'phone')
    autocomplete_fields = ('building',)


@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    list_display = ('building', 'slot_number', 'status')
    list_filter = ('building', 'status')
    search_fields = ('slot_number',)
    autocomplete_fields = ('building',)
    ordering = ('building', 'slot_number')


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_number', 'resident', 'type', 'parking_slot', 'registered_at')
    list_filter = ('type',)
    search_fields = ('vehicle_number', 'resident__user__name')
    autocomplete_fields = ('resident', 'parking_slot')
    date_hierarchy = 'registered_at'
    readonly_fields = ('registered_at',)


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'artifact_path', 'created_at')
    search_fields = ('name', 'version', 'artifact_path')
    inlines = [MLTrainingRunInline]
    readonly_fields = ('created_at',)


@admin.register(MLTrainingRun)
class MLTrainingRunAdmin(admin.ModelAdmin):
    list_display = ('model', 'started_at', 'completed_at')
    list_filter = ('model',)
    search_fields = ('model__name',)
    autocomplete_fields = ('model',)
    readonly_fields = ('started_at',)


@admin.register(MLCityPriceCache)
class MLCityPriceCacheAdmin(admin.ModelAdmin):
    list_display = ('city', 'currency', 'estimate', 'model', 'computed_at')
    list_filter = ('currency',)
    search_fields = ('city', 'model__name')
    autocomplete_fields = ('model',)
    date_hierarchy = 'computed_at'
    readonly_fields = ('computed_at',)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'entity_type', 'entity_id', 'action', 'timestamp')
    list_filter = ('entity_type', 'action')
    search_fields = ('user__name', 'entity_type', 'action')
    autocomplete_fields = ('user',)
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)


@admin.register(BuildingSetting)
class BuildingSettingAdmin(admin.ModelAdmin):
    list_display = ('building', 'key_name', 'updated_at')
    list_filter = ('building',)
    search_fields = ('key_name',)
    autocomplete_fields = ('building',)
    readonly_fields = ('updated_at',)


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('poll', 'option_text')
    search_fields = ('option_text', 'poll__question')
    autocomplete_fields = ('poll',)
