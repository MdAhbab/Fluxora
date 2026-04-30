## Feature list

1. ### Finance & Billing (merged: Financial Management, Expense Tracking, Utility Billing)

   Handles monthly service charges, utilities, invoices, payments, and expenses with analytics and automated reminders.

* Frontend: Django Templates with responsive dashboards (Chart.js), invoice views, expense forms, and utility bill viewer.

* Backend: Django apps for billing, expenses, utilities; Celery/cron for monthly charge runs and reminders; PDF generation (WeasyPrint/wkhtmltopdf).

* DRF: Optional for mobile invoice viewing and webhook-based payment updates.

* Database: residents, units, invoices, payments, expenses, utility\_meters, utility\_bills, tariff tables; indexes on due\_date, status; stored procedures or Django ORM annotations for monthly rollups.

2. ### Digital Notice Board

   Secure bulletin with pinning, scheduling, and expiry.

* Frontend: WYSIWYG editor in templates (Quill), search and filters.

* Backend: Django views for CRUD; scheduled publish/unpublish via Celery/cron.

* DRF: Optional for read-only notice feeds to mobile.

* Database: notices with title, body (HTML), publish\_date, expiry\_date, is\_pinned; full-text index on title/body.

3. ## Visitor Management System

   Pre-approvals, guard check-ins, QR codes, and SMS/push alerts.

* Frontend: Mobile-friendly templates for guards/residents; QR generation/scan in JS.

* Backend: Django views for approvals and check-ins; SMS gateway integration; JWT sessions for guard devices if using API.

* DRF: Required if a tablet/mobile guard app consumes APIs.

* Database: visitors, appointments, approvals, relations to residents; fast lookup for active approvals.

4. ### Complaint & Maintenance Request Tracker

   Ticketing with photos, routing, status, and notifications.

* Frontend: File upload forms with progress UI; ticket list and SLA status.

* Backend: Django views for ticket lifecycle; media storage (S3 or local); notification hooks.

* DRF: Optional for mobile apps.

* Database: tickets, ticket\_images, service\_providers, status enum, SLA timestamps and audit fields.

5. ### Service Directory & Providers (merged: Service Lookup & Integration, Verified Providers)

   Hierarchical services with nearby vendors, profiles, reviews, and maps.

* Frontend: Collapsible category tree; map rendering with Google Maps JS; search/filter.

* Backend: Views/APIs to fetch categories, sub-services, vendors; optional Google Places integration.

* DRF: Optional for maps/app clients; useful if exposing vendor data to a mobile app.

* Database: services (id, name, parent\_id), vendors (service links, contact, lat/lng), reviews, categories; composite indexes for search.

6. ### Facility & Resource Booking (merged: Resource Booking, Shared Facility Booking)

   Calendar-driven reservations for halls, rooftop, parking-time slots, mosque, gym, with conflict detection.

* Frontend: Calendar UI (FullCalendar) in templates; capacity and policy hints.

* Backend: Atomic bookings with database-level uniqueness; transactional checks; email confirmations.

* DRF: Optional for mobile booking.

* Database: resources, bookings with unique(resource\_id, start, end), capacity and policy fields.

7. ### Polls & Surveys

   Custom polls with real-time visualisations and CSV export.

* Frontend: Forms and live Chart.js charts.

* Backend: Voting endpoints with rate-limiting and audit.

* DRF: Optional for vote submission via app.

* Database: polls, options, votes; aggregate-friendly indexes.

8. ### Secure Document Repository

   Versioned, role-based document storage with audit logs.

* Frontend: Drag-and-drop uploads, previews.

* Backend: Upload to S3/local; pre-signed URLs; audit logging.

* DRF: Optional for document fetch from apps.

* Database: documents (metadata, version), \` tables linking roles to docs.

9. ### Emergency / SOS Button

   One-tap alerts with optional geolocation to security and neighbours.

* Frontend: Fixed-position SOS control; location permission prompt.

* Backend: Real-time notifications (Channels/FCM) with SMS fallback.

* DRF: Optional for push notification services.

* Database: emergencies with timestamp, user\_id, and optional lat/lng.

10. ### Staff Attendance & Management

    Check-in/out tracking, shift logs, and payroll calculations.

* Frontend: Time-punch UI with live clock.

* Backend: Shift logging, payroll rules, and scheduled monthly finalisation.

* DRF: Optional for biometric device or mobile punches.

* Database: staff, attendance, wage\_rules, payroll\_runs; computed hours and penalties.

11. ### Resident & Tenant Directory

    Opt-in directory with privacy controls.

* Frontend: Searchable directory with visibility toggles.

* Backend: Profile and privacy settings; access control.

* DRF: Optional for directory access via app.

* Database: users with is\_listed and field-level visibility flags.

12. ### Multi-Building Support

    Super-admin oversight across multiple buildings with tenant isolation.

* Frontend: Building switcher and consolidated widgets.

* Backend: Tenant-aware middleware; per-tenant data scoping.

* DRF: Optional if external admin tools need APIs.

* Database: tenants, building mappings; row-level or schema-level isolation strategy.

13. ### Intercom Integration API

    REST layer for IP intercoms (door release, call logs, directory sync).

* Frontend: Future widgets for call control.

* Backend: Signed API endpoints, device configs, logs.

* DRF: Required for a clean integration surface with devices.

* Database: intercom\_devices, intercom\_logs, directory links.

14. ### Group Chat

    Real-time channels with moderation and persistence.

* Frontend: Chat UI in templates; message list with lazy load.

* Backend: Django Channels for WebSockets; persistence and moderation rules.

* DRF: Optional for message history via HTTP.

* Database: chat\_rooms, room\_members, messages; indexes on room\_id, created\_at.

15. ### Rental Listings & Requests

    Owner listings, tenant inquiries, negotiation stages, and contracts.

* Frontend: Listing cards, filters, inquiry forms.

* Backend: CRUD, workflow states, email notifications.

* DRF: Optional for public/mobile listings.

* Database: listings, rental\_requests, contracts; FKs to users and units.

16. ### Main Gate Lock/Unlock Logs

    Automated access logs with analytics.

* Frontend: Live event log and charts.

* Backend: MQTT/WebSocket ingestion to API; aggregation endpoints.

* DRF: Required if hardware posts events to HTTP endpoints.

* Database: gate\_events (event\_type, timestamp, actor\_id); monthly partitioning.

17. ### Lift Status Monitoring

    Live operational states, alerts, and failure patterns.

* Frontend: Status badges and uptime charts.

* Backend: MQTT/WebSocket receiver; normalisation and alerting hooks.

* DRF: Required if sensors push to REST endpoints.

* Database: lift\_status\_logs with status changes and counters; triggers for anomaly flags.

18. ### Dumpster Management

    Waste pickup scheduling with resident notifications and volume analytics.

* Frontend: Calendar view and reminder widget.

* Backend: Scheduler to dispatch notifications; admin updates.

* DRF: Optional for mobile reminders.

* Database: waste\_scheduling, notifications, building relations.

19. ### Unit / Apartment Management

    Unit profiles, ownership history, rent, and utility associations.

* Frontend: Unit detail pages and edit forms.

* Backend: CRUD with ownership transfer logic and audits.

* DRF: Optional for mobile or integrations.

* Database: units (unit\_id, unit\_number, type, size, price, ownership\_history), utility\_meter\_ids mapping.

20. ### Parking Management

    Resident and visitor parking slots with vehicle types.

* Frontend: Availability dashboard and assignments.

* Backend: Slot allocation, availability checks, vehicle tracking.

* DRF: Optional for guard/visitor apps.

* Database: parking\_slots (slot\_id, type, assigned\_unit\_id, is\_occupied), vehicles (vehicle\_id, owner\_unit\_id, plate\_number, type).

21. ### Asset & Equipment Tracking

    Assets (lifts, generators, CCTV) with maintenance schedules.

* Frontend: Asset dashboard with status and warranty info.

* Backend: Add assets, schedule and log maintenance, status updates.

* DRF: Optional for vendor integrations.

* Database: assets, asset\_maintenance (schedule\_date, status, vendor), warranties.

22. ### Event & Community Management

    Events, RSVPs, attendance, capacities.

* Frontend: Calendar, event details, and RSVP forms.

* Backend: Registration rules, capacity enforcement, reminders.

* DRF: Optional for mobile event views.

* Database: events (name, date, location, capacity), event\_attendance (user\_id, status).

23. ### Analytics & Reporting (with rental price ML)

    BI dashboards for revenue, occupancy, complaints, and a linear-regression-based rental/flat price estimator for non-logged visitors by city on index.html.

* Frontend: Charts and exports (PDF/Excel); public city input form on index.html showing initial price estimate.

* Backend: Aggregation queries/views; model training as a management command; model inference endpoint/view for anonymous users.

* DRF: Optional if exposing the price estimator as a public API.

* Database: reporting views/procedures over invoices, tickets, units, events; ML features table for training metadata and versioned model storage reference.

## Global Design System (Before Page-by-Page)

* ## **Fonts:**

  * ## **Poppins (main): Load via Google Fonts for \<head\> and body**

  * ## **Roboto: Override in table, .data-table, pre, .report-section**

* ## **CSS Variables:**

* ## **css**

## **:root {**

##   **\--color-flux-blue: \#005FAA;**

##   **\--color-citrine: \#FFB800;**

##   **\--color-charcoal: \#2F2F2F;**

##   **\--color-smoke: \#F5F5F5;**

##   **\--color-success: \#28A745;**

##   **\--color-warning: \#FFC107;**

##   **\--color-error: \#DC3545;**

##   **\--font-main: 'Poppins', Arial, sans-serif;**

##   **\--font-secondary: 'Roboto', Arial, sans-serif;**

##   **\--radius-xl: 1.5rem;**

##   **\--radius-lg: 1rem;**

##   **\--radius: 0.5rem;**

##   **\--shadow-card: 0 0 8px rgba(0,0,0,.05);**

##   **\--shadow-hover: 0px 6px 16px rgba(0, 95, 170, .12);**

##   **\--transition-fast: 100ms cubic-bezier(.4,0,.2,1);**

##   **\--transition-medium: 200ms cubic-bezier(.4,0,.2,1);**

##   **\--transition-slow: 350ms cubic-bezier(.4,0,.2,1);**

##   **\--focus: 0 0 0 2px \#FFB800;**

## **}**

* ## 

* ## **Typography:**   **Style H1-H3, body, labels, inject font-weight/size in CSS.**

* ## **WCAG:**   **Check all palette roles in components for 4.5:1 contrast.**

## 

### 1\. Login / Onboarding

## Components:

* ## Email input field, password input field (both with clear labels and placeholders)

* ## “Forgot password?” link below fields, clickable

* ## Login button with .btn-primary styles

* ## Brand hero graphic/banner occupying full width or left half   Styles:

* ## Hero banner background: Flux Blue (\#005FAA) with centered branding imagery or logo

* ## Login form card: background Smoke (\#F5F5F5), border-radius 2xl (\~1.5rem), subtle shadow

* ## Input borders: 1px solid \#CCC, focus outline 2px Citrine (\#FFB800)

* ## Text: Labels and placeholders in Charcoal (\#2F2F2F) or lighter gray (\#AAA)   Transitions:

* ## Form card fade-in on page load (200 ms ease-in)

* ## Ripple effect on login button press (200 ms)

## ---

### 2\. Dashboard (Home)

## Components:

* ## KPI Cards: financial summary, upcoming bookings, pending tickets, SOS button status

* ## Collapsible side navigation with menu items and icons

* ## Header showing “Dashboard” as H1   Styles:

* ## Grid layout: 4 columns with equal card widths, using CSS Grid or Flexbox

* ## Cards background: Smoke (\#F5F5F5), border-radius 1rem, subtle shadow (0 0 8px rgba(0,0,0,0.05))

* ## Card headers: Flux Blue (\#005FAA) text, font-weight 600, size 24px (H2)

* ## Numeric data/values: Charcoal (\#2F2F2F), font-weight 600, sized large   Transitions:

* ## Card hover: lift (translateY \-4px), stronger shadow, 150 ms ease-out

* ## Sidebar toggle with smooth width transition

## ---

### 3\. Financial Management

## Components:

* ## Invoice table displaying invoice number, resident, amount, status, and due date

* ## “Generate Invoice” button above the table

* ## Payment reminder widget showing counts and statuses   Styles:

* ## Table header: background Flux Blue, white text in Roboto font

* ## Table rows: alternate background Smoke and white, hover row tinted Smoke (\#F5F5F5)

* ## Buttons: .btn-primary for actions, ripple effect on click   Transitions:

* ## Button ripple effect (200 ms)

* ## Table row highlight on hover (background colour fade)

## ---

### 4\. Expense Tracking & Reporting

## Components:

* ## Expense entry form broken into wizard steps for date, category, amount, and attachment upload

* ## The report section below shows bar/line charts of expenses by category and time   Styles:

* ## Step indicator: horizontal bar with Citrine (\#FFB800) for active, Flux Blue for completed

* ## Form inputs: bordered (\#CCC), Citrine highlight on focus

* ## Charts axes and labels: Charcoal (\#2F2F2F)   Transitions:

* ## Step indicator sliding animation (300 ms) on step change

* ## Smooth chart redraw animation (400 ms)

## ---

### 5\. Digital Notice Board

## Components:

* ## List/grid of notices with titles, dates, and snippet of body

* ## Pinned notice banner displayed prominently at top, distinct styling

* ## Modal dialog with WYSIWYG editor for creating/editing notices   Styles:

* ## Pinned banner: Citrine left border or background highlight

* ## Modal overlay: semi-opaque Charcoal (\#2F2F2F) with 0.6 opacity

* ## Modal content background: White, border-radius 1rem, padding generous   Transitions:

* ## Modal fade and scale on open/close (200 ms)

## ---

### 6\. Visitor Management

## Components:

* ## Monthly calendar view showing visitor appointments (FullCalendar.js recommended)

* ## Check-in panel with QR code generation/scanning functionality   Styles:

* ## Selected calendar dates: background Flux Blue

* ## QR panel card: background Smoke, border-radius 2xl, subtle shadow   Transitions:

* ## Calendar cell flip animation on date select (250 ms)

* ## Card hover raise effect (100 ms)

## ---

### 7\. Complaint & Maintenance

## Components:

* ## Ticket list with status tags and priorities visible

* ## Detail drawer that slides in from the right with full ticket info

* ## Image upload area with preview thumbnails   Styles:

* ## Status tags:

  * ## Open: Citrine (\#FFB800)

  * ## In Progress: Flux Blue (\#005FAA)

  * ## Resolved: Success Green (\#28A745)

  * ## Closed: Charcoal (\#2F2F2F)

* ## Drawer: white background, border-radius 1rem   Transitions:

* ## Drawer slide-in/out from right (300 ms)

* ## Smooth fade-in of uploaded image previews

## ---

### 8\. Service Provider Directory

## Components:

* ## Card listing of providers with photo/avatar, name, contact details, and star rating

* ## Sidebar with filters to sort by rating, service categories   Styles:

* ## Star icons in Citrine (\#FFB800)

* ## Filter section headers in Flux Blue (\#005FAA)

* ## Cards with Smoke background, radius 1rem, subtle shadow   Transitions:

* ## Expand/collapse filter sidebar sections (200 ms)

## ---

### 9\. Resource & Facility Booking

## Components:

* ## Calendar view of available bookings (FullCalendar.js)

* ## Booking modal for selecting timing, purpose, and capacity checks

* ## Capacity indicators as badges on slots   Styles:

* ## Available slots: Flux Blue (\#005FAA)

* ## Booked slots: Charcoal (\#2F2F2F)

* ## Capacity badges: Citrine (\#FFB800)   Transitions:

* ## Hover highlight on slots (100 ms)

* ## Modal fade in/out (200 ms)

## ---

### 10\. Polls & Surveys

## Components:

* ## List of polls with questions and vote buttons

* ## Real-time result charts in pie/bar format   Styles:

* ## Vote buttons: Flux Blue background, white text

* ## Bars: Citrine (\#FFB800) fill   Transitions:

* ## Chart bar grow animation on load (400 ms)

* ## Button ripple on vote press (200 ms)

## ---

### 11\. Document Repository

## Components:

* ## File list with version history accordion control

* ## Drag-and-drop upload zone with dashed border   Styles:

* ## Accordion headers: Flux Blue (\#005FAA)

* ## Upload zone border: 2px dashed Charcoal (\#2F2F2F)   Transitions:

* ## Accordion expand/collapse (250 ms)

## ---

### 12\. Emergency / SOS

## Components:

* ## Fixed-position SOS button visible across app, pulsing outer ring animation

* ## Confirm prompt after pressing, modal style   Styles:

* ## SOS button background: Error Red (\#DC3545), white icon/text

* ## Pulsing animation ring with ease-in-out infinite cycle, 1.5s duration   Transitions:

* ## Infinite pulse animation on the button

* ## Modal fade (200 ms) for confirmation prompt

## ---

### 13\. Staff Attendance

## Components:

* ## Check-in/out toggle button, attendance listing with check-in status   Styles:

* ## Checked-in rows highlighted in Success Green (\#28A745) background border or light tint

* ## Check-in button: Flux Blue background   Transitions:

* ## Attendance table row fade-in/out on status update (200 ms)

## ---

### 14\. Multi-Building Admin

## Components:

* ## Building selector dropdown at top nav

* ## Panels showing consolidated analytics from multiple buildings   Styles:

* ## Dropdown background: Smoke (\#F5F5F5), caret icon in Flux Blue (\#005FAA)   Transitions:

* ## Dropdown open/close fade (150 ms)

## ---

### 15\. Intercom Integration

## Components:

* ## List of intercom devices as cards

* ## Event logs table   Styles:

* ## Cards background Smoke (\#F5F5F5)

* ## Alternate row colours: Smoke and White for logs   Transitions:

* ## Table row slide in on update (200 ms)

## ---

### 16\. Group Chat

## Components:

* ## Chat messages window with sent and received messages bubbles

* ## Message input field and user list panel   Styles:

* ## Sent message bubble: Flux Blue background, white text, right aligned

* ## Received: Smoke background, Charcoal text, left aligned

* ## Scrollbar: thin, Charcoal colour   Transitions:

* ## New message fade-in (100 ms)

## ---

### 17\. Rental Listings

## Components:

* ## Listing cards show unit info, rent badge, and inquiry button

* ## Inquiry modal form   Styles:

* ## Card header: Flux Blue (\#005FAA)

* ## Rent badge: Citrine (\#FFB800)   Transitions:

* ## Card hover raise (150 ms)

## ---

### 18\. Gate Logs

## Components:

* ## Event feed with icons for open/close

* ## Date filter with date range picker   Styles:

* ## Open events: Success Green (\#28A745)

* ## Close events: Warning Citrine (\#FFC107)

* ## Date picker background Smoke (\#F5F5F5)   Transitions:

* ## Filter icon rotate (200 ms)

## ---

### 19\. Lift Monitoring

## Components:

* ## Badge status indicator (operational, maintenance, offline)

* ## Uptime sparkline chart   Styles:

* ## Badge colours: Success Green, Warning Citrine, Error Red accordingly   Transitions:

* ## Sparkline draw animation (500 ms)

## ---

### 20\. Dumpster Management

## Components:

* ## Schedule a calendar with pickup days highlighted

* ## Notification toggle switch   Styles:

* ## Scheduled days: Flux Blue (\#005FAA)

* ## Toggle switch background: Citrine (\#FFB800)   Transitions:

* ## Toggle slide (150 ms)

## ---

### 21\. Service Lookup & Integration

## Components:

* ## Hierarchical menu (service categories expanding to sub-services)

* ## Vendor location map embedded (Google Maps)   Styles:

* ## Menu items default Charcoal (\#2F2F2F), active/hover Flux Blue (\#005FAA) highlight

* ## Map container border Smoke (\#F5F5F5)   Transitions:

* ## Menu expand/collapse accordion (200 ms)

## ---

### UI Patterns Summary

* ## .btn-primary: Flux Blue bg, white text, 2xl rounded corners, subtle box-shadow

* ## .btn-secondary: Citrine background, Charcoal text

* ## Inputs: 1px solid \#CCC border, 2px Citrine focus ring, placeholder \#AAA

* ## Cards: \#F5F5F5 background, 1rem border radius, subtle shadow

* ## Modals/drawers: Overlay rgba(47,47,47,0.6), content bg white with radius 1rem

* ## Tooltips/popovers: Charcoal bg with white text, 4px border-radius, fade 150 ms

* ## Loading states: spinner (Flux Blue), skeleton cards shimmering (Smoke gradient)

* ## Motion easing cubic-bezier(0.4,0,0.2,1), durations 100–500 ms, honour prefers-reduced-motion

## 

## 

## Apis and Endpoints

## **Auth & Profiles**

* ## POST /api/auth/login — keys: email, password

* ## POST /api/auth/refresh — keys: refresh\_token

* ## POST /api/auth/logout — keys: refresh\_token

* ## POST /api/auth/password/forgot — keys: email

* ## POST /api/auth/password/reset — keys: token, new\_password

* ## GET /api/me — keys: none

* ## PATCH /api/me — keys: name, phone, avatar\_path, address, bio, emergency\_contact\_phone

* ## GET /api/users — query: search, role, page, page\_size, ordering

* ## GET /api/users/{id} — keys: none

* ## POST /api/users — keys: name, email, phone, password, role, is\_listed

* ## PATCH /api/users/{id} — keys: name, phone, role, is\_listed, dob, national\_id, avatar\_path, address, bio

* ## DELETE /api/users/{id} — keys: none

## **Buildings & Units**

* ## GET /api/buildings — query: search, page, page\_size

* ## GET /api/buildings/{id} — keys: none

* ## POST /api/buildings — keys: name, address, developer\_id, year\_built, num\_floors, total\_units, website, primary\_contact\_id, amenities\_json, photo\_path

* ## PATCH /api/buildings/{id} — keys: name, address, website, primary\_contact\_id, amenities\_json, photo\_path

* ## DELETE /api/buildings/{id} — keys: none

* ## GET /api/units — query: building\_id, status, type, floor, page, page\_size

* ## GET /api/units/{id} — keys: none

* ## POST /api/units — keys: building\_id, unit\_number, floor, type, size\_sqft, price, status

* ## PATCH /api/units/{id} — keys: unit\_number, floor, type, size\_sqft, price, status

* ## DELETE /api/units/{id} — keys: none

## **Residents & Directory**

* ## GET /api/residents — query: building\_id, unit\_id, user\_id, is\_owner, page, page\_size

* ## GET /api/residents/{id} — keys: none

* ## POST /api/residents — keys: user\_id, building\_id, unit\_id, is\_owner, opt\_in, start\_date

* ## PATCH /api/residents/{id} — keys: unit\_id, is\_owner, opt\_in, end\_date

* ## DELETE /api/residents/{id} — keys: none

* ## GET /api/directory — query: building\_id, search, is\_listed=true, page, page\_size

## **Finance & Billing (service charges, utilities, payments, expenses)**

* ## GET /api/bill-types — query: search

* ## POST /api/bill-types — keys: name, description

* ## PATCH /api/bill-types/{id} — keys: name, description

* ## DELETE /api/bill-types/{id} — keys: none

* ## GET /api/invoices — query: building\_id, resident\_id, status, due\_before, due\_after, page, page\_size, ordering

* ## GET /api/invoices/{id} — keys: none

* ## POST /api/invoices — keys: resident\_id, building\_id, bill\_type\_id, amount, due\_date, items\[\]

* ## POST /api/invoices/{id}/items — keys: description, quantity, unit\_price, tax\_amount

* ## PATCH /api/invoices/{id} — keys: bill\_type\_id, amount, due\_date, status

* ## DELETE /api/invoices/{id} — keys: none

* ## GET /api/payments — query: building\_id, resident\_id, invoice\_id, date\_from, date\_to, page, page\_size

* ## POST /api/payments — keys: invoice\_id, resident\_id, amount, method, transaction\_id

* ## GET /api/expenses — query: building\_id, category, date\_from, date\_to, page, page\_size

* ## POST /api/expenses — keys: building\_id, category, amount, description, date, vendor\_id, receipt\_path

* ## PATCH /api/expenses/{id} — keys: category, amount, description, date, vendor\_id, receipt\_path

* ## DELETE /api/expenses/{id} — keys: none

* ## POST /api/invoices/generate-monthly — keys: building\_id, bill\_type\_id, billing\_month, due\_date, prorate (bool), include\_utilities (bool)

* ## POST /api/invoices/{id}/remind — keys: channel (email|sms|push)

## **Utility Management**

* ## GET /api/utility-meters — query: unit\_id, type, meter\_number, page, page\_size

* ## POST /api/utility-meters — keys: unit\_id, type, meter\_number

* ## PATCH /api/utility-meters/{id} — keys: type, meter\_number

* ## DELETE /api/utility-meters/{id} — keys: none

* ## GET /api/utility-bills — query: meter\_id, reading\_date\_from, reading\_date\_to, status, page, page\_size

* ## POST /api/utility-bills — keys: meter\_id, reading\_date, reading\_value, amount, status

* ## PATCH /api/utility-bills/{id} — keys: reading\_value, amount, status

* ## DELETE /api/utility-bills/{id} — keys: none

* ## POST /api/utility-bills/generate — keys: building\_id, month, rates\_json

## **Digital Notice Board**

* ## GET /api/notices — query: building\_id, is\_pinned, active\_only, q, page, page\_size

* ## GET /api/notices/{id} — keys: none

* ## POST /api/notices — keys: building\_id, title, body, is\_pinned, publish\_date, expiry\_date

* ## PATCH /api/notices/{id} — keys: title, body, is\_pinned, publish\_date, expiry\_date

* ## DELETE /api/notices/{id} — keys: none

## **Visitor Management**

* ## GET /api/appointments — query: building\_id, resident\_id, date\_from, date\_to, approved, page, page\_size

* ## GET /api/appointments/{id} — keys: none

* ## POST /api/appointments — keys: building\_id, resident\_id, visitor\_name, visitor\_phone, scheduled\_time

* ## PATCH /api/appointments/{id} — keys: visitor\_name, visitor\_phone, scheduled\_time, approved

* ## DELETE /api/appointments/{id} — keys: none

* ## GET /api/visitors — query: appointment\_id, status, page, page\_size

* ## POST /api/visitors — keys: appointment\_id

* ## PATCH /api/visitors/{id}/checkin — keys: handled\_by

* ## PATCH /api/visitors/{id}/checkout — keys: handled\_by

* ## GET /api/appointments/{id}/qr — query: format (svg|png)

* ## POST /api/visitors/notify — keys: visitor\_id, channel (sms|push), template\_id

## **Complaint & Maintenance Tickets**

* ## GET /api/tickets — query: building\_id, status, priority, assigned\_to, resident\_id, page, page\_size

* ## GET /api/tickets/{id} — keys: none

* ## POST /api/tickets — keys: building\_id, resident\_id, category, description, priority, service\_vendor\_id

* ## PATCH /api/tickets/{id} — keys: status, priority, assigned\_to, service\_vendor\_id, description

* ## DELETE /api/tickets/{id} — keys: none

* ## POST /api/tickets/{id}/images — content-type: multipart/form-data; keys: file

* ## DELETE /api/ticket-images/{image\_id} — keys: none

* ## POST /api/tickets/{id}/comment — keys: message

* ## POST /api/tickets/{id}/notify — keys: channel (email|sms|push), recipient (resident|assignee|both)

## **Service Directory & Providers**

* ## GET /api/services — query: parent\_id, q

* ## POST /api/services — keys: name, parent\_id

* ## PATCH /api/services/{id} — keys: name, parent\_id

* ## DELETE /api/services/{id} — keys: none

* ## GET /api/vendors — query: building\_id, service\_id, q, rating\_min, page, page\_size

* ## GET /api/vendors/{id} — keys: none

* ## POST /api/vendors — keys: service\_id, building\_id (nullable), name, contact\_info, latitude, longitude

* ## PATCH /api/vendors/{id} — keys: service\_id, name, contact\_info, latitude, longitude, rating

* ## DELETE /api/vendors/{id} — keys: none

* ## GET /api/vendors/{id}/reviews — query: page, page\_size

* ## POST /api/vendors/{id}/reviews — keys: rating, comment

* ## GET /api/service-lookup/nearby — query: service\_id, lat, lng, radius\_km

## **Facility & Resource Booking**

* ## GET /api/resources — query: building\_id, type, q, page, page\_size

* ## POST /api/resources — keys: building\_id, name, capacity, location, type

* ## PATCH /api/resources/{id} — keys: name, capacity, location, type

* ## DELETE /api/resources/{id} — keys: none

* ## GET /api/bookings — query: resource\_id, resident\_id, status, start\_from, end\_to, page, page\_size

* ## GET /api/bookings/{id} — keys: none

* ## POST /api/bookings — keys: resource\_id, resident\_id, start\_time, end\_time, purpose

* ## PATCH /api/bookings/{id} — keys: start\_time, end\_time, status, purpose

* ## DELETE /api/bookings/{id} — keys: none

* ## GET /api/resources/{id}/availability — query: start\_from, end\_to, granularity

## **Polls & Surveys**

* ## GET /api/polls — query: building\_id, active\_only, page, page\_size

* ## GET /api/polls/{id} — keys: none

* ## POST /api/polls — keys: building\_id, question, start\_date, end\_date, options\[\]

* ## PATCH /api/polls/{id} — keys: question, start\_date, end\_date

* ## DELETE /api/polls/{id} — keys: none

* ## POST /api/polls/{id}/vote — keys: option\_id

* ## GET /api/polls/{id}/results — keys: none

## **Secure Document Repository**

* ## GET /api/documents — query: building\_id, q, page, page\_size

* ## GET /api/documents/{id} — keys: none

* ## POST /api/documents — content-type: multipart/form-data; keys: building\_id, title, file, mime\_type, parent\_id

* ## PATCH /api/documents/{id} — keys: title, is\_active

* ## DELETE /api/documents/{id} — keys: none

* ## GET /api/documents/{id}/download — keys: none

* ## GET /api/documents/{id}/acl/users — keys: none

* ## POST /api/documents/{id}/acl/users — keys: user\_id, can\_view, can\_edit

* ## PATCH /api/document-acl-users/{acl\_id} — keys: can\_view, can\_edit

* ## DELETE /api/document-acl-users/{acl\_id} — keys: none

* ## GET /api/documents/{id}/acl/roles — keys: none

* ## POST /api/documents/{id}/acl/roles — keys: role, can\_view, can\_edit

* ## PATCH /api/document-acl-roles/{acl\_id} — keys: can\_view, can\_edit

* ## DELETE /api/document-acl-roles/{acl\_id} — keys: none

* ## GET /api/documents/{id}/audit — query: page, page\_size

## **Emergency / SOS**

* ## POST /api/sos/trigger — keys: building\_id, latitude (optional), longitude (optional)

* ## POST /api/sos/{id}/acknowledge — keys: handled\_by, note

* ## GET /api/sos — query: building\_id, since, page, page\_size

## **Staff Attendance & Management**

* ## GET /api/staff — query: building\_id, role, q, page, page\_size

* ## POST /api/staff — keys: name, role, designation, qualifications, building\_id, contact\_info, user\_id (optional)

* ## PATCH /api/staff/{id} — keys: role, designation, qualifications, contact\_info

* ## DELETE /api/staff/{id} — keys: none

* ## GET /api/attendance — query: staff\_id, date\_from, date\_to, page, page\_size

* ## POST /api/attendance/checkin — keys: staff\_id, timestamp (optional)

* ## POST /api/attendance/checkout — keys: staff\_id, timestamp (optional)

## **Multi‑Building Admin**

* ## GET /api/admin/overview — query: building\_ids\[\], period, metrics\[\]

* ## GET /api/building-settings — query: building\_id, key\_name

* ## POST /api/building-settings — keys: building\_id, key\_name, value\_json

* ## PATCH /api/building-settings/{id} — keys: value\_json

* ## DELETE /api/building-settings/{id} — keys: none

## **Intercom Integration API**

* ## GET /api/intercom/devices — query: building\_id, q

* ## POST /api/intercom/devices — keys: building\_id, device\_name, ip\_address

* ## PATCH /api/intercom/devices/{id} — keys: device\_name, ip\_address

* ## DELETE /api/intercom/devices/{id} — keys: none

* ## GET /api/intercom/logs — query: device\_id, event\_type, date\_from, date\_to, page, page\_size

* ## POST /api/intercom/webhook — keys: device\_id, event\_type, timestamp, details

## **Group Chat**

* ## GET /api/chat/rooms — query: building\_id, q

* ## POST /api/chat/rooms — keys: building\_id, name, is\_public

* ## PATCH /api/chat/rooms/{id} — keys: name, is\_public

* ## DELETE /api/chat/rooms/{id} — keys: none

* ## GET /api/chat/rooms/{id}/members — query: page, page\_size

* ## POST /api/chat/rooms/{id}/members — keys: resident\_id

* ## DELETE /api/chat/rooms/{id}/members/{resident\_id} — keys: none

* ## GET /api/chat/rooms/{id}/messages — query: since\_id, page, page\_size

* ## POST /api/chat/rooms/{id}/messages — keys: content

* ## WebSocket /ws/chat/{room\_id}/ — payload keys (send): type ("message"), content; payload keys (receive): message\_id, content, sender, sent\_at

## **Rental Listings & Requests**

* ## GET /api/listings — query: building\_id, resident\_id, min\_rent, max\_rent, available\_from, q, page, page\_size

* ## GET /api/listings/{id} — keys: none

* ## POST /api/listings — keys: resident\_id, building\_id, unit\_id (optional), title, description, rent, available\_from

* ## PATCH /api/listings/{id} — keys: title, description, rent, available\_from

* ## DELETE /api/listings/{id} — keys: none

* ## GET /api/listings/{id}/requests — query: page, page\_size

* ## POST /api/listings/{id}/requests — keys: tenant\_id

* ## PATCH /api/rental-requests/{id} — keys: status

* ## POST /api/rental-requests/{id}/contract — content-type: multipart/form-data; keys: file, signed\_at

## **Gate Logs**

* ## GET /api/gate-events — query: building\_id, event\_type, date\_from, date\_to, page, page\_size

* ## POST /api/gate-events/ingest — keys: building\_id, event\_type (open|close), timestamp, actor\_id (optional)

## **Lift Status Monitoring**

* ## GET /api/lifts/status — query: building\_id, asset\_id, date\_from, date\_to, page, page\_size

* ## POST /api/lifts/status/ingest — keys: building\_id, asset\_id (optional), status (operational|maintenance|offline), timestamp

## **Dumpster Management**

* ## GET /api/waste-schedules — query: building\_id, date\_from, date\_to, page, page\_size

* ## POST /api/waste-schedules — keys: building\_id, schedule\_time, recurring

* ## PATCH /api/waste-schedules/{id} — keys: schedule\_time, recurring

* ## DELETE /api/waste-schedules/{id} — keys: none

* ## POST /api/waste/notify — keys: building\_id, schedule\_id (optional), channel (push|sms), template\_id

## **Parking Management**

* ## GET /api/parking/slots — query: building\_id, status, page, page\_size

* ## POST /api/parking/slots — keys: building\_id, slot\_number, status

* ## PATCH /api/parking/slots/{id} — keys: slot\_number, status

* ## DELETE /api/parking/slots/{id} — keys: none

* ## GET /api/vehicles — query: resident\_id, vehicle\_number, page, page\_size

* ## POST /api/vehicles — keys: resident\_id, vehicle\_number, type, parking\_slot\_id (optional)

* ## PATCH /api/vehicles/{id} — keys: vehicle\_number, type, parking\_slot\_id

* ## DELETE /api/vehicles/{id} — keys: none

## **Asset & Equipment Tracking**

* ## GET /api/assets — query: building\_id, type, status, q, page, page\_size

* ## POST /api/assets — keys: building\_id, name, type, purchase\_date, warranty\_expiry, status

* ## PATCH /api/assets/{id} — keys: name, type, purchase\_date, warranty\_expiry, status

* ## DELETE /api/assets/{id} — keys: none

* ## GET /api/assets/{id}/maintenance — query: page, page\_size

* ## POST /api/assets/{id}/maintenance — keys: scheduled\_date, description, cost (optional), vendor\_id (optional)

* ## PATCH /api/asset-maintenance/{id} — keys: scheduled\_date, completed\_date, description, cost, vendor\_id

* ## DELETE /api/asset-maintenance/{id} — keys: none

## **Events & Community**

* ## GET /api/events — query: building\_id, date\_from, date\_to, q, page, page\_size

* ## GET /api/events/{id} — keys: none

* ## POST /api/events — keys: building\_id, title, description, event\_date

* ## PATCH /api/events/{id} — keys: title, description, event\_date

* ## DELETE /api/events/{id} — keys: none

* ## GET /api/events/{id}/attendees — query: page, page\_size

* ## POST /api/events/{id}/attendees — keys: resident\_id, status

* ## PATCH /api/event-attendees/{id} — keys: status

* ## DELETE /api/event-attendees/{id} — keys: none

## **Notifications**

* ## GET /api/notifications — query: building\_id, resident\_id, is\_read, page, page\_size

* ## POST /api/notifications — keys: building\_id, resident\_id (nullable for broadcast), type, message

* ## PATCH /api/notifications/{id}/read — keys: is\_read (true|false)

* ## POST /api/notifications/test — keys: resident\_id, channel (push|sms|email), template\_id, variables\_json

## **ML: Analytics & Rental Price Estimator**

* ## GET /api/analytics/summary — query: building\_id, period (month|quarter|year), metrics\[\]

* ## GET /api/analytics/finance — query: building\_id, date\_from, date\_to, group\_by (month|type)

* ## GET /api/analytics/ops — query: building\_id, date\_from, date\_to, include (tickets|bookings|occupancy)

* ## POST /api/ml/price-estimate — keys: city, currency (optional, default BDT)

* ## GET /api/ml/models — query: name

* ## POST /api/ml/models — keys: name, version, artifact\_path

* ## POST /api/ml/training-runs — keys: model\_id, params\_json

* ## PATCH /api/ml/training-runs/{id} — keys: completed\_at, metrics\_json

* ## GET /api/ml/city-cache — query: city, model\_id

* ## POST /api/ml/city-cache — keys: city, currency, estimate, model\_id

## **Access Control**

* ## GET /api/access-cards — query: resident\_id, status, page, page\_size

* ## POST /api/access-cards — keys: resident\_id, card\_number, status

* ## PATCH /api/access-cards/{id} — keys: card\_number, status

* ## DELETE /api/access-cards/{id} — keys: none

## **Emergency Contacts**

* ## GET /api/emergency-contacts — query: building\_id, type, page, page\_size

* ## POST /api/emergency-contacts — keys: building\_id, name, phone, type

* ## PATCH /api/emergency-contacts/{id} — keys: name, phone, type

* ## DELETE /api/emergency-contacts/{id} — keys: none

## **Activity Logs (optional audit trail)**

* ## GET /api/activity-logs — query: user\_id, entity\_type, entity\_id, action, date\_from, date\_to, page, page\_size

* ## POST /api/activity-logs — keys: user\_id, entity\_type, entity\_id, action, details\_json

## Notes for implementation

* ## Authentication: Use Authorisation: Bearer \<token\> for protected endpoints; restrict admin-only routes (e.g., building create, ML model admin, intercom webhooks management).

* ## Pagination and filtering: Standardise page, page\_size, ordering, and q query params across list endpoints to simplify clients.

* ## File uploads: Use multipart/form-data for document and image uploads with a file key; return a stable file\_path.

* ## Real-time: Use WebSocket for chat and optionally for SOS/ticket updates; keep REST fallbacks for all state transitions.

* ## Idempotency and safety: For ingestion/webhook endpoints, accept idempotency\_key to avoid duplicates if needed.

## 

## Database Tables:

SET NAMES utf8mb4;  
SET FOREIGN\_KEY\_CHECKS \= 0;

\-- 1\) USERS & ROLES  
CREATE TABLE IF NOT EXISTS users (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  name VARCHAR(100) NOT NULL,  
  email VARCHAR(150) NOT NULL UNIQUE,  
  phone VARCHAR(20) NULL,  
  password\_hash VARCHAR(255) NOT NULL,  
  role ENUM('resident','committee','guard','staff','admin') NOT NULL DEFAULT 'resident',  
  is\_listed BOOLEAN NOT NULL DEFAULT TRUE,  
  dob DATE NULL,  
  national\_id VARCHAR(50) NULL,  
  avatar\_path VARCHAR(255) NULL,  
  address VARCHAR(255) NULL,  
  bio TEXT NULL,  
  emergency\_contact\_phone VARCHAR(20) NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP  
) ENGINE=InnoDB;

\-- 2\) BUILDINGS  
CREATE TABLE IF NOT EXISTS buildings (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  name VARCHAR(150) NOT NULL,  
  address VARCHAR(255) NOT NULL,  
  developer\_id INT NULL,  
  year\_built YEAR NULL,  
  num\_floors INT NULL,  
  total\_units INT NULL,  
  website VARCHAR(255) NULL,  
  primary\_contact\_id INT NULL,  
  amenities\_json JSON NULL,  
  photo\_path VARCHAR(255) NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (developer\_id) REFERENCES users(id) ON DELETE SET NULL,  
  FOREIGN KEY (primary\_contact\_id) REFERENCES users(id) ON DELETE SET NULL  
) ENGINE=InnoDB;

\-- 3\) UNITS  
CREATE TABLE IF NOT EXISTS units (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  unit\_number VARCHAR(50) NOT NULL,  
  floor INT NULL,  
  type ENUM('studio','1BHK','2BHK','3BHK','duplex','shop','office') NOT NULL DEFAULT '1BHK',  
  size\_sqft DECIMAL(10,2) NULL,  
  price DECIMAL(12,2) NULL,  
  status ENUM('available','occupied','sold','rented') NOT NULL DEFAULT 'available',  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  UNIQUE KEY ux\_unit (building\_id, unit\_number)  
) ENGINE=InnoDB;

\-- 4\) RESIDENTS  
CREATE TABLE IF NOT EXISTS residents (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  user\_id INT NOT NULL,  
  building\_id INT NOT NULL,  
  unit\_id INT NULL,  
  is\_owner BOOLEAN NOT NULL DEFAULT FALSE,  
  opt\_in BOOLEAN NOT NULL DEFAULT TRUE,  
  start\_date DATE NULL,  
  end\_date DATE NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
  FOREIGN KEY (user\_id) REFERENCES users(id) ON DELETE CASCADE,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id) ON DELETE CASCADE,  
  FOREIGN KEY (unit\_id) REFERENCES units(id),  
  UNIQUE KEY ux\_resident\_building (user\_id, building\_id)  
) ENGINE=InnoDB;

\-- 5\) SERVICES & VENDORS  
CREATE TABLE IF NOT EXISTS services (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  name VARCHAR(100) NOT NULL,  
  parent\_id INT NULL,  
  FOREIGN KEY (parent\_id) REFERENCES services(id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vendors (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  service\_id INT NOT NULL,  
  building\_id INT NULL,  
  name VARCHAR(150) NOT NULL,  
  contact\_info VARCHAR(255) NULL,  
  rating DECIMAL(2,1) NULL,  
  latitude DECIMAL(9,6) NULL,  
  longitude DECIMAL(9,6) NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (service\_id) REFERENCES services(id),  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  INDEX idx\_vendor\_building (building\_id),  
  INDEX idx\_vendor\_service (service\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  vendor\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  rating TINYINT NOT NULL,  
  comment TEXT NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (vendor\_id) REFERENCES vendors(id),  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  INDEX idx\_reviews\_vendor (vendor\_id),  
  INDEX idx\_reviews\_resident (resident\_id)  
) ENGINE=InnoDB;

\-- 6\) FINANCE  
CREATE TABLE IF NOT EXISTS bill\_types (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  name VARCHAR(100) NOT NULL,  
  description TEXT NULL,  
  UNIQUE KEY ux\_bill\_type (name)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invoices (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  invoice\_number VARCHAR(50) NOT NULL UNIQUE,  
  resident\_id INT NOT NULL,  
  building\_id INT NOT NULL,  
  bill\_type\_id INT NULL,  
  amount DECIMAL(10,2) NOT NULL,  
  due\_date DATE NOT NULL,  
  status ENUM('pending','paid','overdue') NOT NULL DEFAULT 'pending',  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (bill\_type\_id) REFERENCES bill\_types(id),  
  INDEX idx\_invoices\_due (due\_date),  
  INDEX idx\_invoices\_status (status),  
  INDEX idx\_invoices\_building (building\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invoice\_items (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  invoice\_id INT NOT NULL,  
  description VARCHAR(255) NOT NULL,  
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,  
  unit\_price DECIMAL(10,2) NOT NULL DEFAULT 0,  
  tax\_amount DECIMAL(10,2) NOT NULL DEFAULT 0,  
  total\_amount DECIMAL(10,2) NOT NULL,  
  utility\_bill\_id INT NULL,  
  FOREIGN KEY (invoice\_id) REFERENCES invoices(id) ON DELETE CASCADE  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  invoice\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  amount DECIMAL(10,2) NOT NULL,  
  payment\_date DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  method VARCHAR(50) NOT NULL,  
  transaction\_id VARCHAR(100) NULL,  
  FOREIGN KEY (invoice\_id) REFERENCES invoices(id),  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  INDEX idx\_payments\_date (payment\_date)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expenses (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  category VARCHAR(100) NOT NULL,  
  amount DECIMAL(10,2) NOT NULL,  
  description TEXT NULL,  
  date DATE NOT NULL,  
  receipt\_path VARCHAR(255) NULL,  
  created\_by INT NOT NULL,  
  vendor\_id INT NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (created\_by) REFERENCES users(id),  
  FOREIGN KEY (vendor\_id) REFERENCES vendors(id),  
  INDEX idx\_expenses\_building\_date (building\_id, date)  
) ENGINE=InnoDB;

\-- 7\) NOTICES  
CREATE TABLE IF NOT EXISTS notices (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  title VARCHAR(200) NOT NULL,  
  body TEXT NOT NULL,  
  is\_pinned BOOLEAN NOT NULL DEFAULT FALSE,  
  publish\_date DATETIME NOT NULL,  
  expiry\_date DATETIME NULL,  
  created\_by INT NOT NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (created\_by) REFERENCES users(id),  
  INDEX idx\_notices\_building (building\_id),  
  FULLTEXT KEY ft\_notices (title, body)  
) ENGINE=InnoDB;

\-- 8\) STAFF & ATTENDANCE  
CREATE TABLE IF NOT EXISTS staff (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  user\_id INT NULL,  
  name VARCHAR(100) NOT NULL,  
  role VARCHAR(50) NOT NULL,  
  designation VARCHAR(100) NULL,  
  qualifications TEXT NULL,  
  building\_id INT NOT NULL,  
  contact\_info VARCHAR(100) NULL,  
  FOREIGN KEY (user\_id) REFERENCES users(id),  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  INDEX idx\_staff\_building (building\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  staff\_id INT NOT NULL,  
  checkin\_time DATETIME NOT NULL,  
  checkout\_time DATETIME NULL,  
  FOREIGN KEY (staff\_id) REFERENCES staff(id) ON DELETE CASCADE,  
  INDEX idx\_attendance\_staff (staff\_id, checkin\_time)  
) ENGINE=InnoDB;

\-- 9\) VISITOR MANAGEMENT  
CREATE TABLE IF NOT EXISTS appointments (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  visitor\_name VARCHAR(100) NOT NULL,  
  visitor\_phone VARCHAR(20) NOT NULL,  
  scheduled\_time DATETIME NOT NULL,  
  approved BOOLEAN NOT NULL DEFAULT FALSE,  
  qr\_token VARCHAR(64) NULL UNIQUE,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  INDEX idx\_appointments\_building\_time (building\_id, scheduled\_time)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS visitors (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  appointment\_id INT NOT NULL,  
  checkin\_time DATETIME NULL,  
  checkout\_time DATETIME NULL,  
  status ENUM('pending','checked\_in','checked\_out') NOT NULL DEFAULT 'pending',  
  handled\_by INT NULL,  
  FOREIGN KEY (appointment\_id) REFERENCES appointments(id),  
  FOREIGN KEY (handled\_by) REFERENCES users(id)  
) ENGINE=InnoDB;

\-- 10\) TICKETS & MAINTENANCE  
CREATE TABLE IF NOT EXISTS tickets (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  category VARCHAR(100) NOT NULL,  
  description TEXT NOT NULL,  
  status ENUM('open','in\_progress','resolved','closed') NOT NULL DEFAULT 'open',  
  priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',  
  assigned\_to INT NULL,  
  service\_vendor\_id INT NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
  closed\_at DATETIME NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  FOREIGN KEY (assigned\_to) REFERENCES staff(id),  
  FOREIGN KEY (service\_vendor\_id) REFERENCES vendors(id),  
  INDEX idx\_tickets\_building\_status (building\_id, status),  
  INDEX idx\_tickets\_assigned (assigned\_to)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket\_images (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  ticket\_id INT NOT NULL,  
  image\_path VARCHAR(255) NOT NULL,  
  FOREIGN KEY (ticket\_id) REFERENCES tickets(id) ON DELETE CASCADE  
) ENGINE=InnoDB;

\-- 11\) RESOURCES & BOOKINGS  
CREATE TABLE IF NOT EXISTS resources (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  name VARCHAR(150) NOT NULL,  
  capacity INT NOT NULL DEFAULT 1,  
  location VARCHAR(100) NULL,  
  building\_id INT NOT NULL,  
  type VARCHAR(50) NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  INDEX idx\_resources\_building (building\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  resource\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  start\_time DATETIME NOT NULL,  
  end\_time DATETIME NOT NULL,  
  status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',  
  purpose VARCHAR(150) NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (resource\_id) REFERENCES resources(id),  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  UNIQUE KEY ux\_booking\_exact (resource\_id, start\_time, end\_time),  
  INDEX idx\_booking\_window (resource\_id, start\_time),  
  INDEX idx\_booking\_resident (resident\_id, start\_time)  
) ENGINE=InnoDB;

\-- 12\) POLLS & SURVEYS  
CREATE TABLE IF NOT EXISTS polls (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  question VARCHAR(255) NOT NULL,  
  created\_by INT NOT NULL,  
  start\_date DATETIME NOT NULL,  
  end\_date DATETIME NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (created\_by) REFERENCES users(id),  
  INDEX idx\_polls\_building (building\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS options (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  poll\_id INT NOT NULL,  
  option\_text VARCHAR(200) NOT NULL,  
  FOREIGN KEY (poll\_id) REFERENCES polls(id) ON DELETE CASCADE  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS votes (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  poll\_id INT NOT NULL,  
  option\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  voted\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (poll\_id) REFERENCES polls(id),  
  FOREIGN KEY (option\_id) REFERENCES options(id),  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  UNIQUE KEY ux\_one\_vote (poll\_id, resident\_id)  
) ENGINE=InnoDB;

\-- 13\) DOCUMENT REPOSITORY & ACL  
CREATE TABLE IF NOT EXISTS documents (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  title VARCHAR(200) NOT NULL,  
  file\_path VARCHAR(255) NOT NULL,  
  version INT NOT NULL DEFAULT 1,  
  mime\_type VARCHAR(120) NULL,  
  parent\_id INT NULL,  
  is\_active BOOLEAN NOT NULL DEFAULT TRUE,  
  uploaded\_by INT NOT NULL,  
  uploaded\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (uploaded\_by) REFERENCES users(id),  
  FOREIGN KEY (parent\_id) REFERENCES documents(id),  
  INDEX idx\_documents\_building (building\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document\_acl\_users (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  document\_id INT NOT NULL,  
  user\_id INT NOT NULL,  
  can\_view BOOLEAN NOT NULL DEFAULT TRUE,  
  can\_edit BOOLEAN NOT NULL DEFAULT FALSE,  
  FOREIGN KEY (document\_id) REFERENCES documents(id) ON DELETE CASCADE,  
  FOREIGN KEY (user\_id) REFERENCES users(id),  
  UNIQUE KEY ux\_doc\_user (document\_id, user\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document\_acl\_roles (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  document\_id INT NOT NULL,  
  role ENUM('resident','committee','guard','staff','admin') NOT NULL,  
  can\_view BOOLEAN NOT NULL DEFAULT TRUE,  
  can\_edit BOOLEAN NOT NULL DEFAULT FALSE,  
  FOREIGN KEY (document\_id) REFERENCES documents(id) ON DELETE CASCADE,  
  UNIQUE KEY ux\_doc\_role (document\_id, role)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document\_audit\_logs (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  document\_id INT NOT NULL,  
  user\_id INT NOT NULL,  
  event\_type ENUM('view','download','edit','delete') NOT NULL,  
  event\_time DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (document\_id) REFERENCES documents(id),  
  FOREIGN KEY (user\_id) REFERENCES users(id)  
) ENGINE=InnoDB;

\-- 14\) EMERGENCY / SOS  
CREATE TABLE IF NOT EXISTS emergencies (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  latitude DECIMAL(9,6) NULL,  
  longitude DECIMAL(9,6) NULL,  
  timestamp DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  INDEX idx\_emergencies\_building (building\_id, timestamp)  
) ENGINE=InnoDB;

\-- 15\) INTERCOM DEVICES/LOGS  
CREATE TABLE IF NOT EXISTS intercom\_devices (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  device\_name VARCHAR(100) NOT NULL,  
  ip\_address VARCHAR(45) NOT NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  UNIQUE KEY ux\_intercom\_building\_ip (building\_id, ip\_address)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS intercom\_logs (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  device\_id INT NOT NULL,  
  event\_type VARCHAR(50) NOT NULL,  
  timestamp DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  details TEXT NULL,  
  FOREIGN KEY (device\_id) REFERENCES intercom\_devices(id),  
  INDEX idx\_intercom\_logs\_device (device\_id, timestamp)  
) ENGINE=InnoDB;

\-- 16\) GROUP CHAT  
CREATE TABLE IF NOT EXISTS chat\_rooms (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  name VARCHAR(100) NOT NULL,  
  is\_public BOOLEAN NOT NULL DEFAULT TRUE,  
  building\_id INT NOT NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  INDEX idx\_chat\_rooms\_building (building\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS room\_members (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  room\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  joined\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (room\_id) REFERENCES chat\_rooms(id) ON DELETE CASCADE,  
  FOREIGN KEY (resident\_id) REFERENCES residents(id) ON DELETE CASCADE,  
  UNIQUE KEY ux\_room\_member (room\_id, resident\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  room\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  content TEXT NOT NULL,  
  sent\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (room\_id) REFERENCES chat\_rooms(id) ON DELETE CASCADE,  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  INDEX idx\_messages\_room (room\_id, sent\_at)  
) ENGINE=InnoDB;

\-- 17\) RENTAL & CONTRACTS  
CREATE TABLE IF NOT EXISTS listings (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  resident\_id INT NOT NULL,  
  building\_id INT NOT NULL,  
  unit\_id INT NULL,  
  title VARCHAR(150) NOT NULL,  
  description TEXT NOT NULL,  
  rent DECIMAL(10,2) NOT NULL,  
  available\_from DATE NOT NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (unit\_id) REFERENCES units(id),  
  INDEX idx\_listings\_building (building\_id),  
  INDEX idx\_listings\_unit (unit\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rental\_requests (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  listing\_id INT NOT NULL,  
  tenant\_id INT NOT NULL,  
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',  
  requested\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (listing\_id) REFERENCES listings(id) ON DELETE CASCADE,  
  FOREIGN KEY (tenant\_id) REFERENCES residents(id),  
  INDEX idx\_rental\_requests\_listing (listing\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contracts (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  request\_id INT NOT NULL,  
  contract\_path VARCHAR(255) NOT NULL,  
  signed\_at DATETIME NOT NULL,  
  FOREIGN KEY (request\_id) REFERENCES rental\_requests(id) ON DELETE CASCADE  
) ENGINE=InnoDB;

\-- 18\) UTILITY MANAGEMENT  
CREATE TABLE IF NOT EXISTS utility\_meters (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  unit\_id INT NOT NULL,  
  type ENUM('electricity','water','gas') NOT NULL,  
  meter\_number VARCHAR(100) NOT NULL,  
  FOREIGN KEY (unit\_id) REFERENCES units(id),  
  UNIQUE KEY ux\_meter\_unit\_type (unit\_id, type),  
  UNIQUE KEY ux\_meter\_number (meter\_number)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS utility\_bills (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  meter\_id INT NOT NULL,  
  reading\_date DATE NOT NULL,  
  reading\_value DECIMAL(10,2) NOT NULL,  
  amount DECIMAL(10,2) NOT NULL,  
  status ENUM('pending','paid','overdue') NOT NULL DEFAULT 'pending',  
  FOREIGN KEY (meter\_id) REFERENCES utility\_meters(id),  
  INDEX idx\_utility\_bills\_meter (meter\_id, reading\_date)  
) ENGINE=InnoDB;

\-- 19\) ASSET & MAINTENANCE  
CREATE TABLE IF NOT EXISTS assets (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  name VARCHAR(150) NOT NULL,  
  type VARCHAR(100) NOT NULL,  
  purchase\_date DATE NULL,  
  warranty\_expiry DATE NULL,  
  status ENUM('operational','under\_maintenance','retired') NOT NULL DEFAULT 'operational',  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  INDEX idx\_assets\_building (building\_id)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS asset\_maintenance (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  asset\_id INT NOT NULL,  
  scheduled\_date DATE NOT NULL,  
  completed\_date DATE NULL,  
  description TEXT NULL,  
  cost DECIMAL(10,2) NULL,  
  vendor\_id INT NULL,  
  FOREIGN KEY (asset\_id) REFERENCES assets(id) ON DELETE CASCADE,  
  FOREIGN KEY (vendor\_id) REFERENCES vendors(id),  
  INDEX idx\_asset\_maintenance\_asset (asset\_id, scheduled\_date)  
) ENGINE=InnoDB;

\-- 20\) GATE EVENTS  
CREATE TABLE IF NOT EXISTS gate\_events (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  event\_type ENUM('open','close') NOT NULL,  
  timestamp DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  actor\_id INT NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (actor\_id) REFERENCES users(id),  
  INDEX idx\_gate\_events\_building (building\_id, timestamp)  
) ENGINE=InnoDB;

\-- 21\) LIFT STATUS  
CREATE TABLE IF NOT EXISTS lift\_status\_logs (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  asset\_id INT NULL,  
  status ENUM('operational','maintenance','offline') NOT NULL,  
  timestamp DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (asset\_id) REFERENCES assets(id),  
  INDEX idx\_lift\_logs\_building (building\_id, timestamp)  
) ENGINE=InnoDB;

\-- 22\) WASTE SCHEDULES & NOTIFICATIONS  
CREATE TABLE IF NOT EXISTS waste\_schedules (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  schedule\_time DATETIME NOT NULL,  
  recurring VARCHAR(50) NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  INDEX idx\_waste\_schedule\_building (building\_id, schedule\_time)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  resident\_id INT NULL,  
  type VARCHAR(50) NOT NULL,  
  message TEXT NOT NULL,  
  sent\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  is\_read BOOLEAN NOT NULL DEFAULT FALSE,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  INDEX idx\_notifications\_building (building\_id, sent\_at),  
  INDEX idx\_notifications\_resident (resident\_id, is\_read)  
) ENGINE=InnoDB;

\-- 23\) EVENTS & COMMUNITY  
CREATE TABLE IF NOT EXISTS events (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  title VARCHAR(200) NOT NULL,  
  description TEXT NULL,  
  event\_date DATETIME NOT NULL,  
  created\_by INT NOT NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  FOREIGN KEY (created\_by) REFERENCES users(id),  
  INDEX idx\_events\_building (building\_id, event\_date)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event\_attendees (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  event\_id INT NOT NULL,  
  resident\_id INT NOT NULL,  
  status ENUM('interested','going','not\_going') NOT NULL DEFAULT 'interested',  
  FOREIGN KEY (event\_id) REFERENCES events(id) ON DELETE CASCADE,  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  UNIQUE KEY ux\_event\_attendee (event\_id, resident\_id)  
) ENGINE=InnoDB;

\-- 24\) ACCESS CONTROL  
CREATE TABLE IF NOT EXISTS access\_cards (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  resident\_id INT NOT NULL,  
  card\_number VARCHAR(100) NOT NULL UNIQUE,  
  issued\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  status ENUM('active','inactive','lost') NOT NULL DEFAULT 'active',  
  FOREIGN KEY (resident\_id) REFERENCES residents(id)  
) ENGINE=InnoDB;

\-- 25\) EMERGENCY CONTACTS  
CREATE TABLE IF NOT EXISTS emergency\_contacts (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  name VARCHAR(100) NOT NULL,  
  phone VARCHAR(20) NOT NULL,  
  type ENUM('police','fire','ambulance','maintenance','other') NOT NULL,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  INDEX idx\_emergency\_contacts\_building (building\_id)  
) ENGINE=InnoDB;

\-- 26\) PARKING MANAGEMENT  
CREATE TABLE IF NOT EXISTS parking\_slots (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  slot\_number VARCHAR(50) NOT NULL,  
  status ENUM('available','occupied','reserved') NOT NULL DEFAULT 'available',  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  UNIQUE KEY ux\_parking\_slot (building\_id, slot\_number)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicles (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  resident\_id INT NOT NULL,  
  parking\_slot\_id INT NULL,  
  vehicle\_number VARCHAR(50) NOT NULL,  
  type ENUM('car','motorbike','bicycle','other') NOT NULL DEFAULT 'car',  
  registered\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (resident\_id) REFERENCES residents(id),  
  FOREIGN KEY (parking\_slot\_id) REFERENCES parking\_slots(id),  
  UNIQUE KEY ux\_vehicle\_number (vehicle\_number)  
) ENGINE=InnoDB;

\-- 27\) ML ANALYTICS / RENT PRICE ESTIMATOR  
CREATE TABLE IF NOT EXISTS ml\_models (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  name VARCHAR(100) NOT NULL,  
  version VARCHAR(50) NOT NULL,  
  artifact\_path VARCHAR(255) NOT NULL,  
  created\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  UNIQUE KEY ux\_model\_name\_version (name, version)  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ml\_training\_runs (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  model\_id INT NOT NULL,  
  started\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  completed\_at DATETIME NULL,  
  params\_json JSON NULL,  
  metrics\_json JSON NULL,  
  FOREIGN KEY (model\_id) REFERENCES ml\_models(id) ON DELETE CASCADE  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ml\_city\_price\_cache (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  city VARCHAR(120) NOT NULL,  
  currency VARCHAR(10) NOT NULL DEFAULT 'BDT',  
  estimate DECIMAL(12,2) NOT NULL,  
  model\_id INT NOT NULL,  
  computed\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (model\_id) REFERENCES ml\_models(id),  
  UNIQUE KEY ux\_city\_model (city, model\_id)  
) ENGINE=InnoDB;

\-- 28\) GENERIC ACTIVITY LOGS (future-proof/audit-all)  
CREATE TABLE IF NOT EXISTS activity\_logs (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  user\_id INT NOT NULL,  
  entity\_type VARCHAR(50) NOT NULL,  
  entity\_id INT NOT NULL,  
  action VARCHAR(50) NOT NULL,  
  details\_json JSON NULL,  
  timestamp DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (user\_id) REFERENCES users(id)  
) ENGINE=InnoDB;

\-- 29\) SYSTEM/BUILDING SETTINGS (future extension)  
CREATE TABLE IF NOT EXISTS building\_settings (  
  id INT AUTO\_INCREMENT PRIMARY KEY,  
  building\_id INT NOT NULL,  
  key\_name VARCHAR(100) NOT NULL,  
  value\_json JSON NULL,  
  updated\_at DATETIME NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  FOREIGN KEY (building\_id) REFERENCES buildings(id),  
  UNIQUE KEY ux\_building\_setting (building\_id, key\_name)  
) ENGINE=InnoDB;

SET FOREIGN\_KEY\_CHECKS \= 1;

