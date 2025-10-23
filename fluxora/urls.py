# fluxora/urls.py

from django.urls import path

from .views import (
    # Simple HTML pages
    home, login_view, logout_view, signup_view,
    invoices_page, invoice_detail_page,
    tickets_page, ticket_detail_page,
    documents_page, document_detail_page,
    polls_page, bookings_calendar_page, visitors_calendar_page,
    services_directory_page,
    landing_page, index_page, dashboard_page,
    # API ViewSets & APIViews
    UserViewSet, BuildingViewSet, UnitViewSet, ResidentViewSet,
    ServiceViewSet, VendorViewSet, ReviewViewSet,
    BillTypeViewSet, InvoiceViewSet, PaymentViewSet, ExpenseViewSet,
    NoticeViewSet,
    StaffViewSet, AttendanceViewSet,
    AppointmentViewSet, VisitorViewSet,
    TicketViewSet, TicketImageViewSet,
    ResourceViewSet, BookingViewSet,
    PollViewSet, OptionViewSet, VoteViewSet,
    DocumentViewSet, DocumentACLUserViewSet, DocumentACLRoleViewSet, DocumentAuditLogViewSet,
    EmergencyViewSet,
    IntercomDeviceViewSet, IntercomLogViewSet, IntercomWebhookView,
    ChatRoomViewSet, RoomMemberViewSet, MessageViewSet,
    ListingViewSet, RentalRequestViewSet, ContractViewSet,
    UtilityMeterViewSet, UtilityBillViewSet,
    AssetViewSet, AssetMaintenanceViewSet,
    GateEventViewSet, LiftStatusLogViewSet,
    WasteScheduleViewSet, NotificationViewSet,
    EventViewSet, EventAttendeeViewSet,
    AccessCardViewSet, EmergencyContactViewSet,
    ParkingSlotViewSet, VehicleViewSet,
    MLModelViewSet, MLTrainingRunViewSet, MLCityPriceCacheViewSet, PriceEstimateAPIView,
    ActivityLogViewSet, BuildingSettingViewSet, AdminOverviewAPIView,
)

# Helper: make list/detail views for a ViewSet
make_list = lambda VS: VS.as_view({'get': 'list', 'post': 'create'})
make_detail = lambda VS: VS.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

# ---------- HTML pages (simple render) ----------
urlpatterns = [
    path('', home, name='home'),
    path('index/', index_page, name='index'),
    path('landing/', landing_page, name='landing'),
    path('dashboard/', dashboard_page, name='dashboard'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('signup/', signup_view, name='signup'),
    path('invoices/', invoices_page, name='invoices-page'),
    path('invoices/<int:pk>/', invoice_detail_page, name='invoice_detail'),
    path('tickets/', tickets_page, name='tickets-page'),
    path('tickets/<int:pk>/', ticket_detail_page, name='ticket_detail'),
    path('documents/', documents_page, name='documents-page'),
    path('documents/<int:pk>/', document_detail_page, name='document-detail-page'),
    path('polls/', polls_page, name='polls-page'),
    path('bookings/', bookings_calendar_page, name='bookings-page'),
    path('visitors/', visitors_calendar_page, name='visitors-page'),
    path('services/', services_directory_page, name='services-page'),
]

# ---------- API endpoints (path-based, no router) ----------
# Core
users_list = make_list(UserViewSet)
users_detail = make_detail(UserViewSet)

buildings_list = make_list(BuildingViewSet)
buildings_detail = make_detail(BuildingViewSet)

units_list = make_list(UnitViewSet)
units_detail = make_detail(UnitViewSet)

residents_list = make_list(ResidentViewSet)
residents_detail = make_detail(ResidentViewSet)

# Services & Vendors
services_list = make_list(ServiceViewSet)
services_detail = make_detail(ServiceViewSet)

vendors_list = make_list(VendorViewSet)
vendors_detail = make_detail(VendorViewSet)
vendors_nearby = VendorViewSet.as_view({'get': 'nearby'})

reviews_list = make_list(ReviewViewSet)
reviews_detail = make_detail(ReviewViewSet)

# Finance
billtypes_list = make_list(BillTypeViewSet)
billtypes_detail = make_detail(BillTypeViewSet)

invoices_list = make_list(InvoiceViewSet)
invoices_detail = make_detail(InvoiceViewSet)
invoices_generate_monthly = InvoiceViewSet.as_view({'post': 'generate_monthly'})
invoice_remind = InvoiceViewSet.as_view({'post': 'remind'})

payments_list = make_list(PaymentViewSet)
payments_detail = make_detail(PaymentViewSet)

expenses_list = make_list(ExpenseViewSet)
expenses_detail = make_detail(ExpenseViewSet)

# Notices
notices_list = make_list(NoticeViewSet)
notices_detail = make_detail(NoticeViewSet)

# Staff & Attendance
staff_list = make_list(StaffViewSet)
staff_detail = make_detail(StaffViewSet)

attendance_list = make_list(AttendanceViewSet)
attendance_detail = make_detail(AttendanceViewSet)
attendance_checkin = AttendanceViewSet.as_view({'post': 'checkin'})
attendance_checkout = AttendanceViewSet.as_view({'post': 'checkout'})

# Visitor Management
appointments_list = make_list(AppointmentViewSet)
appointments_detail = make_detail(AppointmentViewSet)
appointment_qr = AppointmentViewSet.as_view({'get': 'qr'})

visitors_list = make_list(VisitorViewSet)
visitors_detail = make_detail(VisitorViewSet)
visitor_checkin = VisitorViewSet.as_view({'patch': 'checkin'})
visitor_checkout = VisitorViewSet.as_view({'patch': 'checkout'})

# Tickets
tickets_list = make_list(TicketViewSet)
tickets_detail = make_detail(TicketViewSet)
ticket_images_upload = TicketViewSet.as_view({'post': 'images'})

ticketimages_list = make_list(TicketImageViewSet)
ticketimages_detail = make_detail(TicketImageViewSet)

# Resources & Bookings
resources_list = make_list(ResourceViewSet)
resources_detail = make_detail(ResourceViewSet)
resource_availability = ResourceViewSet.as_view({'get': 'availability'})

bookings_list = make_list(BookingViewSet)
bookings_detail = make_detail(BookingViewSet)

# Polls & Surveys
polls_list = make_list(PollViewSet)
polls_detail = make_detail(PollViewSet)
poll_vote = PollViewSet.as_view({'post': 'vote'})
poll_results = PollViewSet.as_view({'get': 'results'})

options_list = make_list(OptionViewSet)
options_detail = make_detail(OptionViewSet)

votes_list = make_list(VoteViewSet)
votes_detail = make_detail(VoteViewSet)

# Documents
documents_list = make_list(DocumentViewSet)
documents_detail = make_detail(DocumentViewSet)
document_download = DocumentViewSet.as_view({'get': 'download'})
document_audit = DocumentViewSet.as_view({'get': 'audit'})

doc_acl_users_list = make_list(DocumentACLUserViewSet)
doc_acl_users_detail = make_detail(DocumentACLUserViewSet)

doc_acl_roles_list = make_list(DocumentACLRoleViewSet)
doc_acl_roles_detail = make_detail(DocumentACLRoleViewSet)

# Read-only audit logs
DocumentAuditLog_list = DocumentAuditLogViewSet.as_view({'get': 'list'})
DocumentAuditLog_detail = DocumentAuditLogViewSet.as_view({'get': 'retrieve'})

# SOS
emergencies_list = make_list(EmergencyViewSet)
emergencies_detail = make_detail(EmergencyViewSet)

# Intercom
intercom_devices_list = make_list(IntercomDeviceViewSet)
intercom_devices_detail = make_detail(IntercomDeviceViewSet)

intercom_logs_list = make_list(IntercomLogViewSet)
intercom_logs_detail = make_detail(IntercomLogViewSet)

# Chat
chat_rooms_list = make_list(ChatRoomViewSet)
chat_rooms_detail = make_detail(ChatRoomViewSet)

chat_members_list = make_list(RoomMemberViewSet)
chat_members_detail = make_detail(RoomMemberViewSet)

chat_messages_list = make_list(MessageViewSet)
chat_messages_detail = make_detail(MessageViewSet)

# Rental
listings_list = make_list(ListingViewSet)
listings_detail = make_detail(ListingViewSet)

rental_requests_list = make_list(RentalRequestViewSet)
rental_requests_detail = make_detail(RentalRequestViewSet)

contracts_list = make_list(ContractViewSet)
contracts_detail = make_detail(ContractViewSet)

# Utilities
utility_meters_list = make_list(UtilityMeterViewSet)
utility_meters_detail = make_detail(UtilityMeterViewSet)

utility_bills_list = make_list(UtilityBillViewSet)
utility_bills_detail = make_detail(UtilityBillViewSet)
utility_bills_generate = UtilityBillViewSet.as_view({'post': 'generate'})

# Assets
assets_list = make_list(AssetViewSet)
assets_detail = make_detail(AssetViewSet)

asset_maintenance_list = make_list(AssetMaintenanceViewSet)
asset_maintenance_detail = make_detail(AssetMaintenanceViewSet)

# Gate & Lift
gate_events_list = make_list(GateEventViewSet)
gate_events_detail = make_detail(GateEventViewSet)

lift_status_list = make_list(LiftStatusLogViewSet)
lift_status_detail = make_detail(LiftStatusLogViewSet)

# Waste & Notifications
waste_schedules_list = make_list(WasteScheduleViewSet)
waste_schedules_detail = make_detail(WasteScheduleViewSet)

notifications_list = make_list(NotificationViewSet)
notifications_detail = make_detail(NotificationViewSet)

# Events & Community
events_list = make_list(EventViewSet)
events_detail = make_detail(EventViewSet)

event_attendees_list = make_list(EventAttendeeViewSet)
event_attendees_detail = make_detail(EventAttendeeViewSet)

# Access & Emergency Contacts
access_cards_list = make_list(AccessCardViewSet)
access_cards_detail = make_detail(AccessCardViewSet)

emergency_contacts_list = make_list(EmergencyContactViewSet)
emergency_contacts_detail = make_detail(EmergencyContactViewSet)

# Parking
parking_slots_list = make_list(ParkingSlotViewSet)
parking_slots_detail = make_detail(ParkingSlotViewSet)

vehicles_list = make_list(VehicleViewSet)
vehicles_detail = make_detail(VehicleViewSet)

# ML & Analytics
ml_models_list = make_list(MLModelViewSet)
ml_models_detail = make_detail(MLModelViewSet)

ml_training_runs_list = make_list(MLTrainingRunViewSet)
ml_training_runs_detail = make_detail(MLTrainingRunViewSet)

ml_city_cache_list = make_list(MLCityPriceCacheViewSet)
ml_city_cache_detail = make_detail(MLCityPriceCacheViewSet)

# ---------- API endpoints (path-based, no router) ----------
# Append APIs
urlpatterns += [
    # Core
    path('api/users/', users_list, name='users-list'),
    path('api/users/<int:pk>/', users_detail, name='users-detail'),
    # Buildings
    path('api/buildings/', make_list(BuildingViewSet), name='buildings-list'),
    path('api/buildings/<int:pk>/', make_detail(BuildingViewSet), name='buildings-detail'),
    # Units
    path('api/units/', make_list(UnitViewSet), name='units-list'),
    path('api/units/<int:pk>/', make_detail(UnitViewSet), name='units-detail'),
    # Residents
    path('api/residents/', make_list(ResidentViewSet), name='residents-list'),
    path('api/residents/<int:pk>/', make_detail(ResidentViewSet), name='residents-detail'),

    # Services & Vendors
    path('api/services/', make_list(ServiceViewSet), name='services-list'),
    path('api/services/<int:pk>/', make_detail(ServiceViewSet), name='services-detail'),
    path('api/vendors/', make_list(VendorViewSet), name='vendors-list'),
    path('api/vendors/<int:pk>/', make_detail(VendorViewSet), name='vendors-detail'),
    path('api/vendors/nearby/', VendorViewSet.as_view({'get': 'nearby'}), name='vendors-nearby'),
    path('api/reviews/', make_list(ReviewViewSet), name='reviews-list'),
    path('api/reviews/<int:pk>/', make_detail(ReviewViewSet), name='reviews-detail'),

    # Finance
    path('api/bill-types/', make_list(BillTypeViewSet), name='billtypes-list'),
    path('api/bill-types/<int:pk>/', make_detail(BillTypeViewSet), name='billtypes-detail'),
    path('api/invoices/', make_list(InvoiceViewSet), name='invoices-list'),
    path('api/invoices/<int:pk>/', make_detail(InvoiceViewSet), name='invoices-detail'),
    path('api/invoices/generate-monthly/', InvoiceViewSet.as_view({'post': 'generate_monthly'}), name='invoices-generate-monthly'),
    path('api/invoices/<int:pk>/remind/', InvoiceViewSet.as_view({'post': 'remind'}), name='invoice-remind'),
    path('api/payments/', make_list(PaymentViewSet), name='payments-list'),
    path('api/payments/<int:pk>/', make_detail(PaymentViewSet), name='payments-detail'),
    path('api/expenses/', make_list(ExpenseViewSet), name='expenses-list'),
    path('api/expenses/<int:pk>/', make_detail(ExpenseViewSet), name='expenses-detail'),

    # Notices
    path('api/notices/', make_list(NoticeViewSet), name='notices-list'),
    path('api/notices/<int:pk>/', make_detail(NoticeViewSet), name='notices-detail'),

    # Staff & Attendance
    path('api/staff/', make_list(StaffViewSet), name='staff-list'),
    path('api/staff/<int:pk>/', make_detail(StaffViewSet), name='staff-detail'),
    path('api/attendance/', make_list(AttendanceViewSet), name='attendance-list'),
    path('api/attendance/<int:pk>/', make_detail(AttendanceViewSet), name='attendance-detail'),
    path('api/attendance/checkin/', AttendanceViewSet.as_view({'post': 'checkin'}), name='attendance-checkin'),
    path('api/attendance/checkout/', AttendanceViewSet.as_view({'post': 'checkout'}), name='attendance-checkout'),

    # Visitor Management
    path('api/appointments/', make_list(AppointmentViewSet), name='appointments-list'),
    path('api/appointments/<int:pk>/', make_detail(AppointmentViewSet), name='appointments-detail'),
    path('api/appointments/<int:pk>/qr/', AppointmentViewSet.as_view({'get': 'qr'}), name='appointment-qr'),
    path('api/visitors/', make_list(VisitorViewSet), name='visitors-list'),
    path('api/visitors/<int:pk>/', make_detail(VisitorViewSet), name='visitors-detail'),
    path('api/visitors/<int:pk>/checkin/', VisitorViewSet.as_view({'patch': 'checkin'}), name='visitors-checkin'),
    path('api/visitors/<int:pk>/checkout/', VisitorViewSet.as_view({'patch': 'checkout'}), name='visitors-checkout'),

    # Tickets
    path('api/tickets/', make_list(TicketViewSet), name='tickets-list'),
    path('api/tickets/<int:pk>/', make_detail(TicketViewSet), name='tickets-detail'),
    path('api/tickets/<int:pk>/images/', TicketViewSet.as_view({'post': 'images'}), name='ticket-images'),
    path('api/ticket-images/', make_list(TicketImageViewSet), name='ticketimages-list'),
    path('api/ticket-images/<int:pk>/', make_detail(TicketImageViewSet), name='ticketimages-detail'),

    # Resources & Bookings
    path('api/resources/', make_list(ResourceViewSet), name='resources-list'),
    path('api/resources/<int:pk>/', make_detail(ResourceViewSet), name='resources-detail'),
    path('api/resources/<int:pk>/availability/', ResourceViewSet.as_view({'get': 'availability'}), name='resource-availability'),
    path('api/bookings/', make_list(BookingViewSet), name='bookings-list'),
    path('api/bookings/<int:pk>/', make_detail(BookingViewSet), name='bookings-detail'),

    # Polls & Surveys
    path('api/polls/', make_list(PollViewSet), name='polls-list'),
    path('api/polls/<int:pk>/', make_detail(PollViewSet), name='polls-detail'),
    path('api/polls/<int:pk>/vote/', PollViewSet.as_view({'post': 'vote'}), name='poll-vote'),
    path('api/polls/<int:pk>/results/', PollViewSet.as_view({'get': 'results'}), name='poll-results'),
    path('api/options/', make_list(OptionViewSet), name='options-list'),
    path('api/options/<int:pk>/', make_detail(OptionViewSet), name='options-detail'),
    path('api/votes/', make_list(VoteViewSet), name='votes-list'),
    path('api/votes/<int:pk>/', make_detail(VoteViewSet), name='votes-detail'),

    # Documents
    path('api/documents/', make_list(DocumentViewSet), name='documents-list'),
    path('api/documents/<int:pk>/', make_detail(DocumentViewSet), name='documents-detail'),
    path('api/documents/<int:pk>/download/', DocumentViewSet.as_view({'get': 'download'}), name='document_download'),
    path('api/documents/<int:pk>/audit/', DocumentViewSet.as_view({'get': 'audit'}), name='document-audit'),
    path('api/document-acl-users/', make_list(DocumentACLUserViewSet), name='doc-acl-users-list'),
    path('api/document-acl-users/<int:pk>/', make_detail(DocumentACLUserViewSet), name='doc-acl-users-detail'),
    path('api/document-acl-roles/', make_list(DocumentACLRoleViewSet), name='doc-acl-roles-list'),
    path('api/document-acl-roles/<int:pk>/', make_detail(DocumentACLRoleViewSet), name='doc-acl-roles-detail'),
    path('api/document-audit/', DocumentAuditLogViewSet.as_view({'get': 'list'}), name='document-audit-list'),
    path('api/document-audit/<int:pk>/', DocumentAuditLogViewSet.as_view({'get': 'retrieve'}), name='document-audit-detail'),

    # SOS
    path('api/emergencies/', make_list(EmergencyViewSet), name='emergencies-list'),
    path('api/emergencies/<int:pk>/', make_detail(EmergencyViewSet), name='emergencies-detail'),

    # Intercom
    path('api/intercom/devices/', make_list(IntercomDeviceViewSet), name='intercom-devices-list'),
    path('api/intercom/devices/<int:pk>/', make_detail(IntercomDeviceViewSet), name='intercom-devices-detail'),
    path('api/intercom/logs/', make_list(IntercomLogViewSet), name='intercom-logs-list'),
    path('api/intercom/logs/<int:pk>/', make_detail(IntercomLogViewSet), name='intercom-logs-detail'),
    path('api/intercom/webhook', IntercomWebhookView.as_view(), name='intercom-webhook'),

    # Chat
    path('api/chat/rooms/', make_list(ChatRoomViewSet), name='chat-rooms-list'),
    path('api/chat/rooms/<int:pk>/', make_detail(ChatRoomViewSet), name='chat-rooms-detail'),
    path('api/chat/members/', make_list(RoomMemberViewSet), name='chat-members-list'),
    path('api/chat/members/<int:pk>/', make_detail(RoomMemberViewSet), name='chat-members-detail'),
    path('api/chat/messages/', make_list(MessageViewSet), name='chat-messages-list'),
    path('api/chat/messages/<int:pk>/', make_detail(MessageViewSet), name='chat-messages-detail'),

    # Rental
    path('api/listings/', make_list(ListingViewSet), name='listings-list'),
    path('api/listings/<int:pk>/', make_detail(ListingViewSet), name='listings-detail'),
    path('api/rental-requests/', make_list(RentalRequestViewSet), name='rental-requests-list'),
    path('api/rental-requests/<int:pk>/', make_detail(RentalRequestViewSet), name='rental-requests-detail'),
    path('api/contracts/', make_list(ContractViewSet), name='contracts-list'),
    path('api/contracts/<int:pk>/', make_detail(ContractViewSet), name='contracts-detail'),

    # Utilities
    path('api/utility-meters/', make_list(UtilityMeterViewSet), name='utility-meters-list'),
    path('api/utility-meters/<int:pk>/', make_detail(UtilityMeterViewSet), name='utility-meters-detail'),
    path('api/utility-bills/', make_list(UtilityBillViewSet), name='utility-bills-list'),
    path('api/utility-bills/<int:pk>/', make_detail(UtilityBillViewSet), name='utility-bills-detail'),
    path('api/utility-bills/generate/', UtilityBillViewSet.as_view({'post': 'generate'}), name='utility-bills-generate'),

    # Assets
    path('api/assets/', make_list(AssetViewSet), name='assets-list'),
    path('api/assets/<int:pk>/', make_detail(AssetViewSet), name='assets-detail'),
    path('api/asset-maintenance/', make_list(AssetMaintenanceViewSet), name='asset-maintenance-list'),
    path('api/asset-maintenance/<int:pk>/', make_detail(AssetMaintenanceViewSet), name='asset-maintenance-detail'),

    # Gate & Lift
    path('api/gate-events/', make_list(GateEventViewSet), name='gate-events-list'),
    path('api/gate-events/<int:pk>/', make_detail(GateEventViewSet), name='gate-events-detail'),
    path('api/lifts/status/', make_list(LiftStatusLogViewSet), name='lift-status-list'),
    path('api/lifts/status/<int:pk>/', make_detail(LiftStatusLogViewSet), name='lift-status-detail'),

    # Waste & Notifications
    path('api/waste-schedules/', make_list(WasteScheduleViewSet), name='waste-schedules-list'),
    path('api/waste-schedules/<int:pk>/', make_detail(WasteScheduleViewSet), name='waste-schedules-detail'),
    path('api/notifications/', make_list(NotificationViewSet), name='notifications-list'),
    path('api/notifications/<int:pk>/', make_detail(NotificationViewSet), name='notifications-detail'),

    # Events & Community
    path('api/events/', make_list(EventViewSet), name='events-list'),
    path('api/events/<int:pk>/', make_detail(EventViewSet), name='events-detail'),
    path('api/event-attendees/', make_list(EventAttendeeViewSet), name='event-attendees-list'),
    path('api/event-attendees/<int:pk>/', make_detail(EventAttendeeViewSet), name='event-attendees-detail'),

    # Access & Emergency Contacts
    path('api/access-cards/', make_list(AccessCardViewSet), name='access-cards-list'),
    path('api/access-cards/<int:pk>/', make_detail(AccessCardViewSet), name='access-cards-detail'),
    path('api/emergency-contacts/', make_list(EmergencyContactViewSet), name='emergency-contacts-list'),
    path('api/emergency-contacts/<int:pk>/', make_detail(EmergencyContactViewSet), name='emergency-contacts-detail'),

    # Parking
    path('api/parking/slots/', make_list(ParkingSlotViewSet), name='parking-slots-list'),
    path('api/parking/slots/<int:pk>/', make_detail(ParkingSlotViewSet), name='parking-slots-detail'),
    path('api/vehicles/', make_list(VehicleViewSet), name='vehicles-list'),
    path('api/vehicles/<int:pk>/', make_detail(VehicleViewSet), name='vehicles-detail'),

    # ML & Analytics
    path('api/ml/models/', make_list(MLModelViewSet), name='ml-models-list'),
    path('api/ml/models/<int:pk>/', make_detail(MLModelViewSet), name='ml-models-detail'),
    path('api/ml/training-runs/', make_list(MLTrainingRunViewSet), name='ml-training-runs-list'),
    path('api/ml/training-runs/<int:pk>/', make_detail(MLTrainingRunViewSet), name='ml-training-runs-detail'),
    path('api/ml/city-cache/', make_list(MLCityPriceCacheViewSet), name='ml-city-cache-list'),
    path('api/ml/city-cache/<int:pk>/', make_detail(MLCityPriceCacheViewSet), name='ml-city-cache-detail'),

    # Analytics/Overview and Price Estimate
    path('api/analytics/overview', AdminOverviewAPIView.as_view(), name='admin-overview'),
    path('api/ml/price-estimate', PriceEstimateAPIView.as_view(), name='price-estimate'),
]
