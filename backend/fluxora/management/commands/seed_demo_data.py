from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.utils import timezone

from fluxora.models import (
    AccessCard,
    Appointment,
    Asset,
    AssetMaintenance,
    Attendance,
    BillType,
    Booking,
    Building,
    BuildingSetting,
    ChatRoom,
    Document,
    DocumentACLRole,
    Emergency,
    EmergencyContact,
    Event,
    EventAttendee,
    Expense,
    GateEvent,
    IntercomDevice,
    IntercomLog,
    Invoice,
    InvoiceItem,
    LiftStatusLog,
    Listing,
    Message,
    MLModel,
    MLCityPriceCache,
    Notice,
    Notification,
    Option,
    ParkingSlot,
    Payment,
    Poll,
    Resident,
    Resource,
    Review,
    RoomMember,
    RentalRequest,
    Service,
    Staff,
    Ticket,
    Unit,
    User,
    UtilityBill,
    UtilityMeter,
    Vehicle,
    Vendor,
    Visitor,
    Vote,
    WasteSchedule,
)


PASSWORD = 'Fluxora@2026'


class Command(BaseCommand):
    help = 'Seed Fluxora with Bangladeshi demo data and stakeholder login accounts.'

    def handle(self, *args, **options):
        now = timezone.now()
        today = now.date()
        DjangoUser = get_user_model()

        accounts = [
            ('admin1@fluxora.bd', 'Nusrat Jahan', 'admin', True, True),
            ('admin2@fluxora.bd', 'Arafat Hossain', 'admin', True, True),
            ('committee1@fluxora.bd', 'Farhana Islam', 'committee', True, False),
            ('committee2@fluxora.bd', 'Mahmud Rahman', 'committee', True, False),
            ('resident1@fluxora.bd', 'Aisha Rahman', 'resident', False, False),
            ('resident2@fluxora.bd', 'Omar Aziz', 'resident', False, False),
            ('guard1@fluxora.bd', 'Rafiq Uddin', 'guard', False, False),
            ('guard2@fluxora.bd', 'Biplob Das', 'guard', False, False),
            ('staff1@fluxora.bd', 'Mina Akter', 'staff', False, False),
            ('staff2@fluxora.bd', 'Jamal Mia', 'staff', False, False),
        ]

        business_users = {}
        for email, name, role, is_staff, is_superuser in accounts:
            django_user, _ = DjangoUser.objects.update_or_create(
                username=email,
                defaults={
                    'email': email,
                    'first_name': name,
                    'is_staff': is_staff,
                    'is_superuser': is_superuser,
                    'is_active': True,
                },
            )
            django_user.set_password(PASSWORD)
            django_user.save()
            business_user, _ = User.objects.update_or_create(
                email=email,
                defaults={
                    'name': name,
                    'phone': '+88017' + str(abs(hash(email)) % 100000000).zfill(8),
                    'password_hash': make_password(PASSWORD),
                    'role': role,
                    'address': 'Dhaka, Bangladesh',
                    'is_listed': role in {'resident', 'committee', 'admin'},
                },
            )
            business_users[email] = business_user

        admin = business_users['admin1@fluxora.bd']
        committee = business_users['committee1@fluxora.bd']
        resident_user_1 = business_users['resident1@fluxora.bd']
        resident_user_2 = business_users['resident2@fluxora.bd']
        guard_user = business_users['guard1@fluxora.bd']

        building, _ = Building.objects.update_or_create(
            name='Gulshan Lakeview Heights',
            defaults={
                'address': 'Road 53, Gulshan 2, Dhaka 1212',
                'developer': admin,
                'primary_contact': committee,
                'year_built': 2021,
                'num_floors': 12,
                'total_units': 48,
                'website': 'https://fluxora.local/gulshan-lakeview',
                'amenities_json': ['Gym', 'Rooftop Lounge', 'Prayer Room', 'Community Hall'],
            },
        )
        Building.objects.update_or_create(
            name='Banani Garden Square',
            defaults={
                'address': 'Road 11, Banani, Dhaka 1213',
                'developer': business_users['admin2@fluxora.bd'],
                'primary_contact': business_users['committee2@fluxora.bd'],
                'year_built': 2019,
                'num_floors': 10,
                'total_units': 36,
                'amenities_json': ['Parking', 'Lift', 'Security Desk'],
            },
        )
        BuildingSetting.objects.update_or_create(
            building=building,
            key_name='enabled_modules',
            defaults={'value_json': {'modules': ['Finance', 'Visitors', 'Maintenance', 'Messaging', 'Documents', 'Units & Occupancy', 'Assets & Compliance', 'Parking & Access']}},
        )
        BuildingSetting.objects.update_or_create(
            building=building,
            key_name='parking_layout',
            defaults={'value_json': {'rows': 4, 'columns': 6, 'prefix': 'G'}},
        )

        units = []
        for floor in range(1, 7):
            for suffix in ['A', 'B']:
                status = 'occupied' if floor <= 4 else 'available'
                if floor == 5:
                    status = 'rented'
                unit, _ = Unit.objects.update_or_create(
                    building=building,
                    unit_number=f'{floor:02d}{suffix}',
                    defaults={
                        'floor': floor,
                        'type': '2BHK' if suffix == 'A' else '3BHK',
                        'size_sqft': 1250 if suffix == 'A' else 1650,
                        'price': 18500000 if suffix == 'A' else 24500000,
                        'status': status,
                    },
                )
                units.append(unit)
                
        # Also seed Banani Garden Square building
        banani_building = Building.objects.get(name='Banani Garden Square')
        for floor in range(1, 5):
            for suffix in ['A', 'B', 'C']:
                Unit.objects.update_or_create(
                    building=banani_building,
                    unit_number=f'{floor:02d}{suffix}',
                    defaults={
                        'floor': floor,
                        'type': '3BHK',
                        'size_sqft': 1800,
                        'price': 22000000,
                        'status': 'occupied' if floor <= 3 else 'available',
                    },
                )

        resident_1, _ = Resident.objects.update_or_create(
            user=resident_user_1,
            building=building,
            defaults={'unit': units[0], 'is_owner': True, 'opt_in': True, 'start_date': today - timedelta(days=900)},
        )
        resident_2, _ = Resident.objects.update_or_create(
            user=resident_user_2,
            building=building,
            defaults={'unit': units[1], 'is_owner': False, 'opt_in': True, 'start_date': today - timedelta(days=430)},
        )
        committee_resident, _ = Resident.objects.update_or_create(
            user=committee,
            building=building,
            defaults={'unit': units[2], 'is_owner': True, 'opt_in': True, 'start_date': today - timedelta(days=1100)},
        )
        residents = [resident_1, resident_2, committee_resident]

        bill_service, _ = BillType.objects.update_or_create(name='Monthly Service Charge', defaults={'description': 'Common area and security service fee'})
        utility_bill_type, _ = BillType.objects.update_or_create(name='Utility Adjustment', defaults={'description': 'Water, gas, and electricity reconciliation'})
        for idx, resident in enumerate(residents, start=1):
            invoice, _ = Invoice.objects.update_or_create(
                invoice_number=f'GLH-2026-05-{idx:03d}',
                defaults={
                    'resident': resident,
                    'building': building,
                    'bill_type': bill_service if idx < 3 else utility_bill_type,
                    'amount': 8500 + idx * 1200,
                    'due_date': today + timedelta(days=7 + idx),
                    'status': 'paid' if idx == 2 else 'pending',
                },
            )
            InvoiceItem.objects.update_or_create(
                invoice=invoice,
                description='Monthly service charge',
                defaults={'quantity': 1, 'unit_price': invoice.amount, 'tax_amount': 0, 'total_amount': invoice.amount},
            )
            if invoice.status == 'paid':
                Payment.objects.update_or_create(
                    transaction_id=f'BKASH-DEMO-{idx}',
                    defaults={'invoice': invoice, 'resident': resident, 'amount': invoice.amount, 'method': 'bKash'},
                )

        services = {}
        for name in ['Plumbing', 'Electrical', 'Cleaning', 'Lift Maintenance', 'Security']:
            services[name], _ = Service.objects.update_or_create(name=name, defaults={})
        vendors = []
        vendor_rows = [
            ('BrightFlow Plumbing BD', 'Plumbing', '01711000001', 4.6, 23.780887, 90.419219),
            ('North Star Electrical', 'Electrical', '01711000002', 4.4, 23.793699, 90.406625),
            ('MetroLift Services Ltd.', 'Lift Maintenance', '01711000003', 4.8, 23.810332, 90.412518),
            ('GreenSweep Cleaning', 'Cleaning', '01711000004', 4.2, 23.746466, 90.376015),
        ]
        for name, service_name, phone, rating, lat, lng in vendor_rows:
            vendor, _ = Vendor.objects.update_or_create(
                name=name,
                building=building,
                defaults={'service': services[service_name], 'contact_info': phone, 'rating': rating, 'latitude': lat, 'longitude': lng},
            )
            vendors.append(vendor)
        Review.objects.update_or_create(vendor=vendors[0], resident=resident_1, defaults={'rating': 5, 'comment': 'Fast response during a kitchen leak.'})
        Review.objects.update_or_create(vendor=vendors[2], resident=resident_2, defaults={'rating': 5, 'comment': 'Professional lift inspection.'})

        Expense.objects.update_or_create(
            building=building,
            category='Security Salary',
            date=today - timedelta(days=3),
            defaults={'amount': 126000, 'description': 'Monthly guard payroll', 'created_by': committee, 'vendor': None},
        )
        Expense.objects.update_or_create(
            building=building,
            category='Generator Fuel',
            date=today - timedelta(days=2),
            defaults={'amount': 38500, 'description': 'Diesel purchase for backup generator', 'created_by': committee, 'vendor': None},
        )
        Expense.objects.update_or_create(
            building=building,
            category='Lift Service',
            date=today - timedelta(days=1),
            defaults={'amount': 22000, 'description': 'Quarterly lift maintenance', 'created_by': committee, 'vendor': vendors[2]},
        )

        Notice.objects.update_or_create(
            building=building,
            title='Water tank cleaning schedule',
            defaults={'body': 'Rooftop tank cleaning will run from 10 AM to 2 PM this Friday.', 'is_pinned': True, 'publish_date': now - timedelta(days=1), 'expiry_date': now + timedelta(days=5), 'created_by': committee},
        )
        Notice.objects.update_or_create(
            building=building,
            title='Eid holiday security roster',
            defaults={'body': 'Additional guards will be posted at the north gate during Eid holidays.', 'is_pinned': False, 'publish_date': now - timedelta(hours=8), 'expiry_date': now + timedelta(days=14), 'created_by': committee},
        )

        guard_staff, _ = Staff.objects.update_or_create(
            user=guard_user,
            building=building,
            name='Rafiq Uddin',
            defaults={'role': 'Security', 'designation': 'Senior Guard', 'contact_info': '+880171000100'},
        )
        cleaner_staff, _ = Staff.objects.update_or_create(
            user=business_users['staff1@fluxora.bd'],
            building=building,
            name='Mina Akter',
            defaults={'role': 'Cleaning', 'designation': 'Housekeeping Lead', 'contact_info': '+880171000101'},
        )
        maintenance_staff, _ = Staff.objects.update_or_create(
            user=business_users['staff2@fluxora.bd'],
            building=building,
            name='Jamal Mia',
            defaults={'role': 'Maintenance', 'designation': 'Technician', 'contact_info': '+880171000102'},
        )
        Attendance.objects.update_or_create(staff=guard_staff, checkin_time=now.replace(hour=8, minute=0, second=0, microsecond=0), defaults={'checkout_time': None})
        Attendance.objects.update_or_create(staff=cleaner_staff, checkin_time=now - timedelta(hours=5), defaults={'checkout_time': now - timedelta(hours=1)})

        appointment, _ = Appointment.objects.update_or_create(
            building=building,
            visitor_phone='+880181000200',
            scheduled_time=now + timedelta(hours=2),
            defaults={'resident': resident_1, 'visitor_name': 'Tanvir Ahmed', 'approved': True, 'qr_token': f'GLH-VIS-{int(now.timestamp())}'},
        )
        Visitor.objects.update_or_create(appointment=appointment, defaults={'status': 'pending', 'handled_by': guard_user})

        Ticket.objects.update_or_create(
            building=building,
            resident=resident_1,
            category='Plumbing',
            description='Low water pressure in kitchen line.',
            defaults={'status': 'open', 'priority': 'high', 'assigned_to': maintenance_staff, 'service_vendor': vendors[0]},
        )
        Ticket.objects.update_or_create(
            building=building,
            resident=resident_2,
            category='Electrical',
            description='Corridor light flickering near 02B.',
            defaults={'status': 'in_progress', 'priority': 'medium', 'assigned_to': maintenance_staff, 'service_vendor': vendors[1]},
        )

        resources = []
        for name, capacity, location, resource_type in [('Rooftop Lounge', 60, 'Roof', 'amenity'), ('Gym', 18, 'Level 2', 'fitness'), ('Community Hall', 90, 'Ground Floor', 'hall')]:
            resource, _ = Resource.objects.update_or_create(name=name, building=building, defaults={'capacity': capacity, 'location': location, 'type': resource_type})
            resources.append(resource)
        Booking.objects.update_or_create(resource=resources[0], resident=resident_1, start_time=now + timedelta(days=2, hours=2), end_time=now + timedelta(days=2, hours=4), defaults={'status': 'confirmed', 'purpose': 'Family gathering'})
        Booking.objects.update_or_create(resource=resources[1], resident=resident_2, start_time=now + timedelta(days=1, hours=1), end_time=now + timedelta(days=1, hours=2), defaults={'status': 'pending', 'purpose': 'Workout'})

        poll, _ = Poll.objects.update_or_create(
            building=building,
            question='Approve smart access cards for all residents?',
            defaults={'created_by': committee, 'start_date': now - timedelta(days=2), 'end_date': now + timedelta(days=5)},
        )
        option_yes, _ = Option.objects.update_or_create(poll=poll, option_text='Approve', defaults={})
        option_review, _ = Option.objects.update_or_create(poll=poll, option_text='Review budget', defaults={})
        Vote.objects.get_or_create(poll=poll, option=option_yes, resident=resident_1)
        Vote.objects.get_or_create(poll=poll, option=option_review, resident=resident_2)

        doc, _ = Document.objects.update_or_create(
            building=building,
            title='Building bylaws',
            defaults={'file_path': 'documents/demo/bylaws.pdf', 'version': 4, 'mime_type': 'application/pdf', 'uploaded_by': committee},
        )
        DocumentACLRole.objects.update_or_create(document=doc, role='resident', defaults={'can_view': True, 'can_edit': False})
        Emergency.objects.update_or_create(building=building, resident=resident_2, defaults={'latitude': 23.793699, 'longitude': 90.406625})

        device, _ = IntercomDevice.objects.update_or_create(building=building, ip_address='192.168.10.25', defaults={'device_name': 'North Gate Intercom'})
        IntercomLog.objects.update_or_create(device=device, event_type='ring', defaults={'details': 'Food delivery at north gate'})

        rooms = []
        for room_name in ['General', 'Security Desk', 'Committee']:
            room, _ = ChatRoom.objects.update_or_create(building=building, name=room_name, defaults={'is_public': room_name != 'Committee'})
            rooms.append(room)
            for resident in residents:
                RoomMember.objects.get_or_create(room=room, resident=resident)
        Message.objects.update_or_create(room=rooms[0], resident=committee_resident, content='Generator servicing starts at 10 AM.', defaults={})
        Message.objects.update_or_create(room=rooms[1], resident=resident_1, content='Please keep the north gate open for school pickup.', defaults={})

        listing, _ = Listing.objects.update_or_create(
            resident=resident_1,
            building=building,
            unit=units[4],
            title='Sunny 2BHK near Gulshan Lake',
            defaults={'description': 'Family-friendly apartment with parking and rooftop access.', 'rent': 65000, 'available_from': today + timedelta(days=20)},
        )
        RentalRequest.objects.update_or_create(listing=listing, tenant=resident_2, defaults={'status': 'pending'})

        for unit in units[:4]:
            for utility_type in ['electricity', 'water']:
                meter, _ = UtilityMeter.objects.update_or_create(unit=unit, type=utility_type, defaults={'meter_number': f'{unit.unit_number}-{utility_type[:3].upper()}'})
                UtilityBill.objects.update_or_create(meter=meter, reading_date=today - timedelta(days=5), defaults={'reading_value': 120 + unit.floor, 'amount': 1800 + unit.floor * 120, 'status': 'pending'})

        lift_asset, _ = Asset.objects.update_or_create(building=building, name='Lift A', defaults={'type': 'Lift', 'purchase_date': today - timedelta(days=1400), 'warranty_expiry': today + timedelta(days=240), 'status': 'operational'})
        generator_asset, _ = Asset.objects.update_or_create(building=building, name='Diesel Generator', defaults={'type': 'Generator', 'purchase_date': today - timedelta(days=1700), 'warranty_expiry': today - timedelta(days=90), 'status': 'under_maintenance'})
        AssetMaintenance.objects.update_or_create(asset=generator_asset, scheduled_date=today + timedelta(days=3), defaults={'description': 'Oil filter replacement', 'cost': 12500, 'vendor': vendors[1]})
        LiftStatusLog.objects.update_or_create(building=building, asset=lift_asset, status='operational', defaults={})
        GateEvent.objects.update_or_create(building=building, event_type='open', actor=guard_user, defaults={})
        WasteSchedule.objects.update_or_create(building=building, schedule_time=now + timedelta(days=1, hours=7), defaults={'recurring': 'Weekly Friday recycling and general waste'})
        Notification.objects.update_or_create(building=building, resident=resident_1, type='notice', message='Water tank cleaning notice published.', defaults={'is_read': False})
        event, _ = Event.objects.update_or_create(building=building, title='Residents Eid Meetup', defaults={'description': 'Community dinner at the rooftop lounge.', 'event_date': now + timedelta(days=12), 'created_by': committee})
        EventAttendee.objects.update_or_create(event=event, resident=resident_1, defaults={'status': 'going'})
        AccessCard.objects.update_or_create(resident=resident_1, card_number='GLH-CARD-001', defaults={'status': 'active'})
        EmergencyContact.objects.update_or_create(building=building, type='fire', phone='999', defaults={'name': 'Bangladesh Fire Service'})
        EmergencyContact.objects.update_or_create(building=building, type='maintenance', phone='+880171000102', defaults={'name': 'Jamal Mia'})

        slots = []
        for row in range(1, 5):
            for column in range(1, 7):
                slot, _ = ParkingSlot.objects.update_or_create(
                    building=building,
                    slot_number=f'G{row}-{column:02d}',
                    defaults={'status': 'available'},
                )
                slots.append(slot)
        slots[0].status = 'occupied'
        slots[0].save(update_fields=['status'])
        slots[1].status = 'reserved'
        slots[1].save(update_fields=['status'])
        Vehicle.objects.update_or_create(resident=resident_1, vehicle_number='DHAKA-METRO-GA-11-2233', defaults={'parking_slot': slots[0], 'type': 'car'})
        Vehicle.objects.update_or_create(resident=resident_2, vehicle_number='DHAKA-METRO-HA-44-8821', defaults={'parking_slot': slots[1], 'type': 'motorbike'})

        model, _ = MLModel.objects.update_or_create(name='Dhaka Rent Estimator', version='2026.05', defaults={'artifact_path': 'ml/demo/dhaka-rent.pkl'})
        MLCityPriceCache.objects.update_or_create(city='Dhaka', model=model, defaults={'currency': 'BDT', 'estimate': 72000})

        self.stdout.write(self.style.SUCCESS('Seeded Fluxora Bangladeshi demo data.'))
        self.stdout.write(self.style.SUCCESS(f'Demo password for all stakeholder accounts: {PASSWORD}'))
