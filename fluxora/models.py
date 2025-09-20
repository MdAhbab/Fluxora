# models.py
from django.db import models


# ---------- Shared Choices ----------

class UserRole(models.TextChoices):
    RESIDENT = 'resident', 'Resident'
    COMMITTEE = 'committee', 'Committee'
    GUARD = 'guard', 'Guard'
    STAFF = 'staff', 'Staff'
    ADMIN = 'admin', 'Admin'


class UnitType(models.TextChoices):
    STUDIO = 'studio', 'Studio'
    ONE_BHK = '1BHK', '1BHK'
    TWO_BHK = '2BHK', '2BHK'
    THREE_BHK = '3BHK', '3BHK'
    DUPLEX = 'duplex', 'Duplex'
    SHOP = 'shop', 'Shop'
    OFFICE = 'office', 'Office'


class UnitStatus(models.TextChoices):
    AVAILABLE = 'available', 'Available'
    OCCUPIED = 'occupied', 'Occupied'
    SOLD = 'sold', 'Sold'
    RENTED = 'rented', 'Rented'


class InvoiceStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PAID = 'paid', 'Paid'
    OVERDUE = 'overdue', 'Overdue'


class TicketStatus(models.TextChoices):
    OPEN = 'open', 'Open'
    IN_PROGRESS = 'in_progress', 'In Progress'
    RESOLVED = 'resolved', 'Resolved'
    CLOSED = 'closed', 'Closed'


class TicketPriority(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    URGENT = 'urgent', 'Urgent'


class VisitorStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CHECKED_IN = 'checked_in', 'Checked In'
    CHECKED_OUT = 'checked_out', 'Checked Out'


class GateEventType(models.TextChoices):
    OPEN = 'open', 'Open'
    CLOSE = 'close', 'Close'


class LiftStatus(models.TextChoices):
    OPERATIONAL = 'operational', 'Operational'
    MAINTENANCE = 'maintenance', 'Maintenance'
    OFFLINE = 'offline', 'Offline'


class AttendeeStatus(models.TextChoices):
    INTERESTED = 'interested', 'Interested'
    GOING = 'going', 'Going'
    NOT_GOING = 'not_going', 'Not Going'


class CardStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    INACTIVE = 'inactive', 'Inactive'
    LOST = 'lost', 'Lost'


class EmergencyContactType(models.TextChoices):
    POLICE = 'police', 'Police'
    FIRE = 'fire', 'Fire'
    AMBULANCE = 'ambulance', 'Ambulance'
    MAINTENANCE = 'maintenance', 'Maintenance'
    OTHER = 'other', 'Other'


class VehicleType(models.TextChoices):
    CAR = 'car', 'Car'
    MOTORBIKE = 'motorbike', 'Motorbike'
    BICYCLE = 'bicycle', 'Bicycle'
    OTHER = 'other', 'Other'


class UtilityType(models.TextChoices):
    ELECTRICITY = 'electricity', 'Electricity'
    WATER = 'water', 'Water'
    GAS = 'gas', 'Gas'


class DocumentAuditEvent(models.TextChoices):
    VIEW = 'view', 'View'
    DOWNLOAD = 'download', 'Download'
    EDIT = 'edit', 'Edit'
    DELETE = 'delete', 'Delete'


# ---------- 1) USERS & ROLES ----------

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=150, unique=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.RESIDENT)
    is_listed = models.BooleanField(default=True)
    dob = models.DateField(null=True, blank=True)
    national_id = models.CharField(max_length=50, null=True, blank=True)
    avatar_path = models.CharField(max_length=255, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # CURRENT_TIMESTAMP
    updated_at = models.DateTimeField(auto_now=True)      # ON UPDATE CURRENT_TIMESTAMP

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.name} ({self.email})'


# ---------- 2) BUILDINGS ----------

class Building(models.Model):
    name = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    developer = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='developed_buildings')
    year_built = models.PositiveSmallIntegerField(null=True, blank=True)
    num_floors = models.IntegerField(null=True, blank=True)
    total_units = models.IntegerField(null=True, blank=True)
    website = models.CharField(max_length=255, null=True, blank=True)
    primary_contact = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='primary_contact_buildings')
    amenities_json = models.JSONField(null=True, blank=True)
    photo_path = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buildings'

    def __str__(self):
        return self.name


# ---------- 3) UNITS ----------

class Unit(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    unit_number = models.CharField(max_length=50)
    floor = models.IntegerField(null=True, blank=True)
    type = models.CharField(max_length=10, choices=UnitType.choices, default=UnitType.ONE_BHK)
    size_sqft = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=10, choices=UnitStatus.choices, default=UnitStatus.AVAILABLE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'units'
        constraints = [
            models.UniqueConstraint(fields=['building', 'unit_number'], name='ux_unit')
        ]

    def __str__(self):
        return f'{self.building.name} - {self.unit_number}'


# ---------- 4) RESIDENTS ----------

class Resident(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, null=True, blank=True, on_delete=models.PROTECT)
    is_owner = models.BooleanField(default=False)
    opt_in = models.BooleanField(default=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'residents'
        constraints = [
            models.UniqueConstraint(fields=['user', 'building'], name='ux_resident_building')
        ]

    def __str__(self):
        return f'{self.user.name} @ {self.building.name}'


# ---------- 5) SERVICES & VENDORS ----------

class Service(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.PROTECT)

    class Meta:
        db_table = 'services'

    def __str__(self):
        return self.name


class Vendor(models.Model):
    service = models.ForeignKey(Service, on_delete=models.PROTECT)
    building = models.ForeignKey(Building, null=True, blank=True, on_delete=models.PROTECT)
    name = models.CharField(max_length=150)
    contact_info = models.CharField(max_length=255, null=True, blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vendors'
        indexes = [
            models.Index(fields=['building'], name='idx_vendor_building'),
            models.Index(fields=['service'], name='idx_vendor_service'),
        ]

    def __str__(self):
        return self.name


class Review(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        indexes = [
            models.Index(fields=['vendor'], name='idx_reviews_vendor'),
            models.Index(fields=['resident'], name='idx_reviews_resident'),
        ]


# ---------- 6) FINANCE ----------

class BillType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'bill_types'
        constraints = [
            models.UniqueConstraint(fields=['name'], name='ux_bill_type'),
        ]

    def __str__(self):
        return self.name


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50, unique=True)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    bill_type = models.ForeignKey(BillType, null=True, blank=True, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=8, choices=InvoiceStatus.choices, default=InvoiceStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        indexes = [
            models.Index(fields=['due_date'], name='idx_invoices_due'),
            models.Index(fields=['status'], name='idx_invoices_status'),
            models.Index(fields=['building'], name='idx_invoices_building'),
        ]

    def __str__(self):
        return self.invoice_number


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # Matches schema: no FK declared to utility_bills; keep as plain integer
    utility_bill_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'invoice_items'


class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'payments'
        indexes = [
            models.Index(fields=['payment_date'], name='idx_payments_date'),
        ]


class Expense(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(null=True, blank=True)
    date = models.DateField()
    receipt_path = models.CharField(max_length=255, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    vendor = models.ForeignKey(Vendor, null=True, blank=True, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expenses'
        indexes = [
            models.Index(fields=['building', 'date'], name='idx_expenses_building_date'),
        ]


# ---------- 7) NOTICES ----------

class Notice(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    title = models.CharField(max_length=200)
    body = models.TextField()
    is_pinned = models.BooleanField(default=False)
    publish_date = models.DateTimeField()
    expiry_date = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notices'
        indexes = [
            models.Index(fields=['building'], name='idx_notices_building'),
            # MySQL FULLTEXT index should be added via a custom migration:
            # migrations.RunSQL("ALTER TABLE notices ADD FULLTEXT KEY ft_notices (title, body);")
        ]


# ---------- 8) STAFF & ATTENDANCE ----------

class Staff(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50)
    designation = models.CharField(max_length=100, null=True, blank=True)
    qualifications = models.TextField(null=True, blank=True)
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    contact_info = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'staff'
        indexes = [
            models.Index(fields=['building'], name='idx_staff_building'),
        ]

    def __str__(self):
        return self.name


class Attendance(models.Model):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)
    checkin_time = models.DateTimeField()
    checkout_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'attendance'
        indexes = [
            models.Index(fields=['staff', 'checkin_time'], name='idx_attendance_staff'),
        ]


# ---------- 9) VISITOR MANAGEMENT ----------

class Appointment(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    visitor_name = models.CharField(max_length=100)
    visitor_phone = models.CharField(max_length=20)
    scheduled_time = models.DateTimeField()
    approved = models.BooleanField(default=False)
    qr_token = models.CharField(max_length=64, null=True, blank=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments'
        indexes = [
            models.Index(fields=['building', 'scheduled_time'], name='idx_appointments_building_time'),
        ]


class Visitor(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.PROTECT)
    checkin_time = models.DateTimeField(null=True, blank=True)
    checkout_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=VisitorStatus.choices, default=VisitorStatus.PENDING)
    handled_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.PROTECT)

    class Meta:
        db_table = 'visitors'


# ---------- 10) TICKETS & MAINTENANCE ----------

class Ticket(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    category = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=12, choices=TicketStatus.choices, default=TicketStatus.OPEN)
    priority = models.CharField(max_length=6, choices=TicketPriority.choices, default=TicketPriority.MEDIUM)
    assigned_to = models.ForeignKey(Staff, null=True, blank=True, on_delete=models.PROTECT)
    service_vendor = models.ForeignKey(Vendor, null=True, blank=True, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'tickets'
        indexes = [
            models.Index(fields=['building', 'status'], name='idx_tickets_building_status'),
            models.Index(fields=['assigned_to'], name='idx_tickets_assigned'),
        ]


class TicketImage(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='images')
    image_path = models.CharField(max_length=255)

    class Meta:
        db_table = 'ticket_images'


# ---------- 11) RESOURCES & BOOKINGS ----------

class Resource(models.Model):
    name = models.CharField(max_length=150)
    capacity = models.IntegerField(default=1)
    location = models.CharField(max_length=100, null=True, blank=True)
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    type = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'resources'
        indexes = [
            models.Index(fields=['building'], name='idx_resources_building'),
        ]

    def __str__(self):
        return self.name


class Booking(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.PROTECT)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')], default='pending')
    purpose = models.CharField(max_length=150, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bookings'
        constraints = [
            models.UniqueConstraint(fields=['resource', 'start_time', 'end_time'], name='ux_booking_exact'),
        ]
        indexes = [
            models.Index(fields=['resource', 'start_time'], name='idx_booking_window'),
            models.Index(fields=['resident', 'start_time'], name='idx_booking_resident'),
        ]


# ---------- 12) POLLS & SURVEYS ----------

class Poll(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    question = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'polls'
        indexes = [
            models.Index(fields=['building'], name='idx_polls_building'),
        ]


class Option(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=200)

    class Meta:
        db_table = 'options'


class Vote(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.PROTECT)
    option = models.ForeignKey(Option, on_delete=models.PROTECT)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    voted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'votes'
        constraints = [
            models.UniqueConstraint(fields=['poll', 'resident'], name='ux_one_vote'),
        ]


# ---------- 13) DOCUMENT REPOSITORY & ACL ----------

class Document(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    title = models.CharField(max_length=200)
    file_path = models.CharField(max_length=255)
    version = models.IntegerField(default=1)
    mime_type = models.CharField(max_length=120, null=True, blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'documents'
        indexes = [
            models.Index(fields=['building'], name='idx_documents_building'),
        ]


class DocumentACLUser(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    can_view = models.BooleanField(default=True)
    can_edit = models.BooleanField(default=False)

    class Meta:
        db_table = 'document_acl_users'
        constraints = [
            models.UniqueConstraint(fields=['document', 'user'], name='ux_doc_user'),
        ]


class DocumentACLRole(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=UserRole.choices)
    can_view = models.BooleanField(default=True)
    can_edit = models.BooleanField(default=False)

    class Meta:
        db_table = 'document_acl_roles'
        constraints = [
            models.UniqueConstraint(fields=['document', 'role'], name='ux_doc_role'),
        ]


class DocumentAuditLog(models.Model):
    document = models.ForeignKey(Document, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    event_type = models.CharField(max_length=8, choices=DocumentAuditEvent.choices)
    event_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_audit_logs'


# ---------- 14) EMERGENCY / SOS ----------

class Emergency(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'emergencies'
        indexes = [
            models.Index(fields=['building', 'timestamp'], name='idx_emergencies_building'),
        ]


# ---------- 15) INTERCOM DEVICES/LOGS ----------

class IntercomDevice(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    device_name = models.CharField(max_length=100)
    ip_address = models.CharField(max_length=45)

    class Meta:
        db_table = 'intercom_devices'
        constraints = [
            models.UniqueConstraint(fields=['building', 'ip_address'], name='ux_intercom_building_ip'),
        ]


class IntercomLog(models.Model):
    device = models.ForeignKey(IntercomDevice, on_delete=models.PROTECT)
    event_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'intercom_logs'
        indexes = [
            models.Index(fields=['device', 'timestamp'], name='idx_intercom_logs_device'),
        ]


# ---------- 16) GROUP CHAT ----------

class ChatRoom(models.Model):
    name = models.CharField(max_length=100)
    is_public = models.BooleanField(default=True)
    building = models.ForeignKey(Building, on_delete=models.PROTECT)

    class Meta:
        db_table = 'chat_rooms'
        indexes = [
            models.Index(fields=['building'], name='idx_chat_rooms_building'),
        ]

    def __str__(self):
        return self.name


class RoomMember(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'room_members'
        constraints = [
            models.UniqueConstraint(fields=['room', 'resident'], name='ux_room_member'),
        ]


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        indexes = [
            models.Index(fields=['room', 'sent_at'], name='idx_messages_room'),
        ]


# ---------- 17) RENTAL & CONTRACTS ----------

class Listing(models.Model):
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    unit = models.ForeignKey(Unit, null=True, blank=True, on_delete=models.PROTECT)
    title = models.CharField(max_length=150)
    description = models.TextField()
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    available_from = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'listings'
        indexes = [
            models.Index(fields=['building'], name='idx_listings_building'),
            models.Index(fields=['unit'], name='idx_listings_unit'),
        ]


class RentalRequest(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='requests')
    tenant = models.ForeignKey(Resident, on_delete=models.PROTECT)
    status = models.CharField(max_length=8, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rental_requests'
        indexes = [
            models.Index(fields=['listing'], name='idx_rental_requests_listing'),
        ]


class Contract(models.Model):
    request = models.ForeignKey(RentalRequest, on_delete=models.CASCADE)
    contract_path = models.CharField(max_length=255)
    signed_at = models.DateTimeField()

    class Meta:
        db_table = 'contracts'


# ---------- 18) UTILITY MANAGEMENT ----------

class UtilityMeter(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT)
    type = models.CharField(max_length=11, choices=UtilityType.choices)
    meter_number = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'utility_meters'
        constraints = [
            models.UniqueConstraint(fields=['unit', 'type'], name='ux_meter_unit_type'),
        ]


class UtilityBill(models.Model):
    meter = models.ForeignKey(UtilityMeter, on_delete=models.PROTECT)
    reading_date = models.DateField()
    reading_value = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=7, choices=InvoiceStatus.choices, default=InvoiceStatus.PENDING)

    class Meta:
        db_table = 'utility_bills'
        indexes = [
            models.Index(fields=['meter', 'reading_date'], name='idx_utility_bills_meter'),
        ]


# ---------- 19) ASSET & MAINTENANCE ----------

class Asset(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=100)
    purchase_date = models.DateField(null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=18, choices=[('operational', 'operational'), ('under_maintenance', 'under_maintenance'), ('retired', 'retired')], default='operational')

    class Meta:
        db_table = 'assets'
        indexes = [
            models.Index(fields=['building'], name='idx_assets_building'),
        ]

    def __str__(self):
        return self.name


class AssetMaintenance(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vendor = models.ForeignKey(Vendor, null=True, blank=True, on_delete=models.PROTECT)

    class Meta:
        db_table = 'asset_maintenance'
        indexes = [
            models.Index(fields=['asset', 'scheduled_date'], name='idx_asset_maintenance_asset'),
        ]


# ---------- 20) GATE EVENTS ----------

class GateEvent(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    event_type = models.CharField(max_length=5, choices=GateEventType.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.PROTECT)

    class Meta:
        db_table = 'gate_events'
        indexes = [
            models.Index(fields=['building', 'timestamp'], name='idx_gate_events_building'),
        ]


# ---------- 21) LIFT STATUS ----------

class LiftStatusLog(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    asset = models.ForeignKey(Asset, null=True, blank=True, on_delete=models.PROTECT)
    status = models.CharField(max_length=12, choices=LiftStatus.choices)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lift_status_logs'
        indexes = [
            models.Index(fields=['building', 'timestamp'], name='idx_lift_logs_building'),
        ]


# ---------- 22) WASTE SCHEDULES & NOTIFICATIONS ----------

class WasteSchedule(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    schedule_time = models.DateTimeField()
    recurring = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'waste_schedules'
        indexes = [
            models.Index(fields=['building', 'schedule_time'], name='idx_waste_schedule_building'),
        ]


class Notification(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    resident = models.ForeignKey(Resident, null=True, blank=True, on_delete=models.PROTECT)
    type = models.CharField(max_length=50)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['building', 'sent_at'], name='idx_notifications_building'),
            models.Index(fields=['resident', 'is_read'], name='idx_notifications_resident'),
        ]


# ---------- 23) EVENTS & COMMUNITY ----------

class Event(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    event_date = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)

    class Meta:
        db_table = 'events'
        indexes = [
            models.Index(fields=['building', 'event_date'], name='idx_events_building'),
        ]


class EventAttendee(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    status = models.CharField(max_length=11, choices=AttendeeStatus.choices, default=AttendeeStatus.INTERESTED)

    class Meta:
        db_table = 'event_attendees'
        constraints = [
            models.UniqueConstraint(fields=['event', 'resident'], name='ux_event_attendee'),
        ]


# ---------- 24) ACCESS CONTROL ----------

class AccessCard(models.Model):
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    card_number = models.CharField(max_length=100, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=8, choices=CardStatus.choices, default=CardStatus.ACTIVE)

    class Meta:
        db_table = 'access_cards'


# ---------- 25) EMERGENCY CONTACTS ----------

class EmergencyContact(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    type = models.CharField(max_length=12, choices=EmergencyContactType.choices)

    class Meta:
        db_table = 'emergency_contacts'
        indexes = [
            models.Index(fields=['building'], name='idx_emergency_bldg'),  # shortened
        ]

# ---------- 26) PARKING MANAGEMENT ----------

class ParkingSlot(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    slot_number = models.CharField(max_length=50)
    status = models.CharField(max_length=9, choices=[('available', 'available'), ('occupied', 'occupied'), ('reserved', 'reserved')], default='available')

    class Meta:
        db_table = 'parking_slots'
        constraints = [
            models.UniqueConstraint(fields=['building', 'slot_number'], name='ux_parking_slot'),
        ]


class Vehicle(models.Model):
    resident = models.ForeignKey(Resident, on_delete=models.PROTECT)
    parking_slot = models.ForeignKey(ParkingSlot, null=True, blank=True, on_delete=models.PROTECT)
    vehicle_number = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=10, choices=VehicleType.choices, default=VehicleType.CAR)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'


# ---------- 27) ML ANALYTICS / RENT PRICE ESTIMATOR ----------

class MLModel(models.Model):
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=50)
    artifact_path = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ml_models'
        constraints = [
            models.UniqueConstraint(fields=['name', 'version'], name='ux_model_name_version'),
        ]

    def __str__(self):
        return f'{self.name} v{self.version}'


class MLTrainingRun(models.Model):
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE, related_name='training_runs')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    params_json = models.JSONField(null=True, blank=True)
    metrics_json = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'ml_training_runs'


class MLCityPriceCache(models.Model):
    city = models.CharField(max_length=120)
    currency = models.CharField(max_length=10, default='BDT')
    estimate = models.DecimalField(max_digits=12, decimal_places=2)
    model = models.ForeignKey(MLModel, on_delete=models.PROTECT)
    computed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ml_city_price_cache'
        constraints = [
            models.UniqueConstraint(fields=['city', 'model'], name='ux_city_model'),
        ]


# ---------- 28) GENERIC ACTIVITY LOGS ----------

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    entity_type = models.CharField(max_length=50)
    entity_id = models.IntegerField()
    action = models.CharField(max_length=50)
    details_json = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'


# ---------- 29) SYSTEM/BUILDING SETTINGS ----------

class BuildingSetting(models.Model):
    building = models.ForeignKey(Building, on_delete=models.PROTECT)
    key_name = models.CharField(max_length=100)
    value_json = models.JSONField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'building_settings'
        constraints = [
            models.UniqueConstraint(fields=['building', 'key_name'], name='ux_building_setting'),
        ]
