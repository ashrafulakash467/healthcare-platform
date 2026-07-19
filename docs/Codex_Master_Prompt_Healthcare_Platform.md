# Codex Master Prompt — Enterprise Healthcare Platform

Copy everything below and paste it into Codex from the root of the project repository.

---

## MASTER PROMPT

You are a principal full-stack engineer, software architect, database designer, DevOps engineer, security engineer, and UI/UX specialist. Build a production-oriented, enterprise healthcare service platform based on the workflow specification in:

`docs/Healthcare_Enterprise_Workflows_Reorganized.md`

If that file is currently in the repository root, move or copy it to the `docs/` directory without deleting the original unless safe to do so.

The system must support three primary roles in this order:

1. User / Patient
2. Doctor / Healthcare Provider
3. Admin / Platform Operator

The application should be inspired by a modern healthcare marketplace and operations platform, but must use original branding, original UI, and original source code. Do not copy proprietary layouts, text, assets, or code from any existing website.

## 1. Main Objective

Create a secure, responsive, maintainable healthcare platform where:

- Guests can browse doctors, hospitals, diagnostic centers, health packages, ambulance services, and home-care services.
- Patients can register, verify their account, manage dependents, book and manage appointments, book diagnostics and other services, pay, receive notifications, access medical documents, review completed services, and contact support.
- Doctors can register, submit verification documents, manage profiles and schedules, handle appointments, conduct in-person or video consultations, review patient-authorized records, write clinical notes, issue prescriptions, review diagnostic reports, manage follow-ups, and view earnings.
- Admins can manage users, doctors, facilities, service providers, appointments, payments, refunds, disputes, reviews, CMS content, notifications, analytics, roles, permissions, audit logs, and platform settings.

Build an MVP-complete foundation first, but architect it so later enterprise modules can be added without major rewrites.

## 2. Required Technology Stack

Use the following stack unless a package is incompatible. When replacing anything, document the reason in `docs/DECISIONS.md`.

### Monorepo and tooling

- Node.js 22+
- npm workspaces; do not require pnpm
- Turborepo
- TypeScript with strict mode
- ESLint
- Prettier
- Husky and lint-staged if practical

### Frontend

- Next.js using the App Router
- React
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React Hook Form
- Zod
- TanStack Query for server-state interactions where useful
- TanStack Table for administration tables
- Recharts for analytics charts
- Accessible semantic HTML

### Backend

- NestJS
- REST API under `/api/v1`
- Swagger / OpenAPI documentation
- Prisma ORM
- PostgreSQL
- Redis for caching, temporary slot holds, OTP state, rate-limiting support, and queues
- BullMQ for background jobs
- Socket.IO or Server-Sent Events for real-time notifications and status updates where appropriate

### Authentication and security

- JWT access tokens with short expiration
- Rotating refresh tokens stored securely
- Argon2 password hashing
- OTP verification for account registration and sensitive actions
- Role-based access control and permission-based authorization
- HTTP-only secure cookies where suitable
- CSRF protection for cookie-authenticated state-changing requests
- Rate limiting
- Helmet/security headers
- Input validation and sanitization
- Audit logging for sensitive operations

### Storage and integrations

- S3-compatible object storage abstraction for profile images, verification documents, reports, and medical attachments
- Local development storage adapter
- Payment gateway abstraction with a mock provider for development
- SMS abstraction with a mock provider
- Email abstraction with a development provider
- Video consultation provider abstraction; implement a development room workflow without claiming medical-grade compliance

### Testing

- Vitest or Jest for unit tests
- Supertest for API integration tests
- Playwright for critical end-to-end flows
- Testcontainers if it remains practical for integration testing

### DevOps

- Docker and Docker Compose
- Services for PostgreSQL, Redis, API, web app, and optional local object storage
- `.env.example`
- Health-check endpoints
- Structured logging
- CI workflow for lint, type-check, test, and build

## 3. Repository Structure

Create a clean monorepo similar to:

```text
healthcare-platform/
├── apps/
│   ├── web/                    # Next.js patient, doctor, and admin interfaces
│   └── api/                    # NestJS REST API
├── packages/
│   ├── ui/                     # Shared UI components and design tokens
│   ├── config/                 # Shared ESLint, TS, and environment config
│   ├── types/                  # Shared domain and API types
│   ├── validation/             # Shared Zod schemas where safe
│   └── sdk/                    # Typed API client
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── docs/
│   ├── Healthcare_Enterprise_Workflows_Reorganized.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   └── IMPLEMENTATION_STATUS.md
├── infrastructure/
│   └── docker/
├── tests/
│   └── e2e/
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

Keep clinical-domain logic in services/domain modules, not inside controllers or UI components.

## 4. Architecture Principles

Follow these rules:

- Use modular monolith architecture for the first version.
- Keep module boundaries clear enough to extract services later.
- Apply separation of concerns.
- Use DTOs and validation at every API boundary.
- Use transactions for booking, payment, refund, prescription finalization, and other multi-step state changes.
- Use optimistic concurrency or row-level protection for appointment-slot booking.
- Never trust pricing, permissions, appointment availability, or status transitions sent by the client.
- Keep all monetary values as integer minor units, such as paisa, and store currency separately.
- Store all timestamps in UTC and render them using the user’s timezone.
- Default business timezone can be `Asia/Dhaka`, but make it configurable.
- Use soft deletion for records that require retention or auditability.
- Protect medical data using least-privilege access rules.
- Doctors may only access patients connected to their appointments or records explicitly shared with them.
- Preserve immutable audit history for sensitive actions.
- Preserve prescription version history after finalization.

## 5. Core Backend Modules

Implement the following NestJS modules:

```text
auth
users
patients
dependents
doctors
doctor-verification
doctor-schedules
facilities
facility-staff
specialties
services
appointments
consultations
prescriptions
medical-records
diagnostic-centers
diagnostic-tests
diagnostic-orders
health-packages
ambulance-providers
ambulance-requests
home-care-providers
home-care-bookings
payments
refunds
invoices
reviews
notifications
support-tickets
complaints-disputes
cms
reports
analytics
roles-permissions
audit-logs
system-settings
files
health
```

Each module should have an appropriate controller, service/use-case layer, repository/data-access boundary, DTOs, authorization rules, and tests.

## 6. Roles and Permissions

Create these initial roles:

- `PATIENT`
- `DOCTOR`
- `FACILITY_ADMIN`
- `FACILITY_STAFF`
- `DIAGNOSTIC_STAFF`
- `AMBULANCE_PROVIDER`
- `HOME_CARE_PROVIDER`
- `SUPPORT_AGENT`
- `CONTENT_MANAGER`
- `FINANCE_ADMIN`
- `OPERATIONS_ADMIN`
- `SUPER_ADMIN`

Implement permissions as granular strings, for example:

```text
appointments.read.own
appointments.read.assigned
appointments.manage.assigned
prescriptions.create
prescriptions.finalize
patients.records.read.authorized
doctors.verify
providers.manage
payments.read
refunds.approve
reviews.moderate
cms.publish
roles.manage
audit.read
settings.manage
```

Use guards/decorators in the API and route-level protection in the web app. Hiding a button is not authorization; every protected action must be checked on the server.

## 7. Database Design

Create a normalized Prisma schema with proper indexes, unique constraints, enums, timestamps, and audit metadata.

At minimum include models or equivalent structures for:

- User
- UserSession / RefreshToken
- OtpChallenge
- Role
- Permission
- UserRole
- RolePermission
- PatientProfile
- PatientDependent
- DoctorProfile
- DoctorQualification
- DoctorSpecialty
- DoctorVerificationDocument
- DoctorAvailabilityRule
- DoctorScheduleException
- Facility
- FacilityDepartment
- FacilityDoctor
- FacilityStaff
- ServiceCatalogItem
- Appointment
- AppointmentSlot or generated slot representation
- AppointmentStatusHistory
- Consultation
- ClinicalNote
- Prescription
- PrescriptionVersion
- PrescriptionMedicine
- PrescriptionInvestigation
- MedicalRecord
- MedicalDocument
- DiagnosticCenter
- DiagnosticTest
- DiagnosticOrder
- DiagnosticOrderItem
- DiagnosticReport
- HealthPackage
- HealthPackageItem
- AmbulanceProvider
- AmbulanceVehicle
- AmbulanceDriver
- AmbulanceRequest
- AmbulanceStatusHistory
- HomeCareProvider
- HomeCareService
- HomeCareBooking
- Payment
- PaymentAttempt
- Refund
- Invoice
- Coupon or Promotion
- Review
- ReviewModeration
- Notification
- NotificationPreference
- SupportTicket
- SupportMessage
- ComplaintDispute
- CmsPage
- BlogPost
- Faq
- MediaAsset
- AuditLog
- SystemSetting

Important constraints:

- Email and phone uniqueness must be handled safely for active accounts.
- Doctor registration/license number must be unique where required.
- An appointment must reference a patient and doctor; facility is optional for online consultations.
- Prevent conflicting active appointments for the same doctor and slot.
- Payment processing must be idempotent.
- Store gateway references with unique constraints.
- Finalized prescriptions must not be silently overwritten.
- Status transitions must be written to history tables.
- Use indexes for searchable fields, foreign keys, statuses, dates, and dashboard queries.

Create a Mermaid ER diagram in `docs/DATABASE.md`.

## 8. Status Models and State Machines

Implement explicit status-transition services. Reject invalid transitions.

### Appointment statuses

```text
REQUESTED
PENDING_PAYMENT
CONFIRMED
RESCHEDULE_REQUESTED
RESCHEDULED
CHECKED_IN
WAITING
IN_CONSULTATION
COMPLETED
CANCELLED
REJECTED
NO_SHOW
REFUND_PENDING
REFUNDED
```

Typical valid lifecycle:

```text
REQUESTED -> PENDING_PAYMENT -> CONFIRMED
REQUESTED -> CONFIRMED
REQUESTED -> REJECTED
CONFIRMED -> RESCHEDULE_REQUESTED -> RESCHEDULED -> CONFIRMED
CONFIRMED -> CHECKED_IN -> WAITING -> IN_CONSULTATION -> COMPLETED
CONFIRMED -> CANCELLED
CONFIRMED -> NO_SHOW
CANCELLED -> REFUND_PENDING -> REFUNDED
```

### Diagnostic order statuses

```text
DRAFT
PENDING_PAYMENT
CONFIRMED
COLLECTION_SCHEDULED
SAMPLE_COLLECTED
SAMPLE_RECEIVED
PROCESSING
REPORT_PENDING_VERIFICATION
REPORT_READY
COMPLETED
CANCELLED
REFUND_PENDING
REFUNDED
```

### Ambulance request statuses

```text
REQUESTED
QUOTED
CONFIRMED
PROVIDER_ASSIGNED
DRIVER_ASSIGNED
DRIVER_EN_ROUTE
ARRIVED
PATIENT_PICKED_UP
IN_TRANSIT
COMPLETED
CANCELLED
```

### Payment statuses

```text
CREATED
PENDING
AUTHORIZED
PAID
FAILED
CANCELLED
PARTIALLY_REFUNDED
REFUNDED
```

Document all allowed transitions in `docs/ARCHITECTURE.md` and cover critical transitions with tests.

## 9. User / Patient Workflows

Implement the user-facing workflows first.

### 9.1 Public browsing

Create public pages for:

- Home
- Doctor listing and search
- Doctor profile
- Hospital/clinic listing and detail
- Diagnostic center listing and detail
- Diagnostic tests
- Health packages
- Ambulance services
- Home-care services
- Blog, FAQ, privacy, terms, and contact pages

Support search, filters, sorting, pagination, empty states, loading states, and SEO metadata.

Doctor search filters should include:

- Name
- Specialty
- Hospital/facility
- Location
- Consultation type
- Availability
- Fee range
- Rating

### 9.2 Registration, login, and recovery

Implement:

- Patient registration with name, phone, optional email, and password
- Terms/privacy acceptance
- OTP verification
- Login using phone or email
- Refresh-token session flow
- Forgot-password OTP/reset flow
- Logout from current session
- Logout from all sessions
- Optional account deactivation request

Avoid account-enumeration leaks. Add rate limits and OTP expiry/resend rules.

### 9.3 Patient dashboard

Create dashboard modules:

- Overview
- Upcoming appointments
- Appointment history
- Diagnostic orders
- Ambulance requests
- Home-care bookings
- Health packages
- Prescriptions
- Reports and medical records
- Payments, invoices, and refunds
- Dependents/family members
- Notifications
- Reviews
- Support tickets
- Profile and security settings

### 9.4 Appointment booking

Implement this robust flow:

```text
Open doctor profile
-> Select consultation type
-> Select facility/chamber or online
-> Select date
-> Load server-confirmed available slots
-> Hold selected slot temporarily in Redis
-> Select self or dependent
-> Enter reason, symptoms, and optional notes
-> Upload optional documents
-> Review price and policy
-> Pay if required
-> Verify payment callback
-> Confirm booking transactionally
-> Generate appointment number
-> Release temporary hold
-> Send notifications
-> Add to patient and doctor dashboards
```

Handle:

- Slot expiration
- Concurrent booking attempts
- Invalid price changes
- Payment failure or timeout
- Duplicate callback/webhook delivery
- Retry without duplicate appointments
- Free and pay-at-facility appointments

### 9.5 Appointment management

Patients can:

- View appointment detail and status history
- Reschedule when policy allows
- Cancel with a reason
- View refund calculation before final cancellation
- Join video consultation during an allowed time window
- Download invoice and prescription
- Review a completed appointment only once, subject to moderation

### 9.6 Diagnostic booking

Implement:

```text
Search center/test/package
-> Review price, preparation, and availability
-> Select center visit or home collection
-> Select date/time
-> Select patient
-> Add collection address when needed
-> Upload doctor prescription when required
-> Review order
-> Pay
-> Confirm
-> Track collection and processing
-> Receive notification
-> View/download verified report
```

### 9.7 Ambulance booking

Support:

- General, ICU, freezer, and emergency ambulance categories
- Pickup and destination
- Immediate or scheduled request
- Patient/contact information
- Fare estimate or quotation
- Provider/vehicle/driver assignment
- Live-like status tracking through simulated updates in development
- Completion, payment, receipt, cancellation, and support

### 9.8 Home-care booking

Support nurse, caregiver, physiotherapy, and home sample-collection services with schedule, address, instructions, provider assignment, service completion, payment, and review.

### 9.9 Medical records

Patients can view and download:

- Prescriptions
- Diagnostic reports
- Appointment summaries
- Uploaded documents
- Invoices

Implement controlled sharing with a provider using revocable authorization and expiration where possible.

## 10. Doctor Workflows

### 10.1 Doctor onboarding

Implement:

```text
Doctor registration
-> Personal information
-> Professional registration/license details
-> Specialty and experience
-> Qualifications
-> Facility/chamber information
-> Consultation fees
-> Availability
-> Verification-document uploads
-> Application submission
-> Automated validation
-> Admin review
-> Correction request, rejection, or approval
-> Account activation
-> Public profile publication
```

Doctor account states should include:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
CHANGES_REQUESTED
APPROVED
REJECTED
SUSPENDED
```

### 10.2 Doctor dashboard

Create:

- Overview cards
- Today’s appointments
- Upcoming appointments
- Pending requests
- Appointment status filters
- Assigned patients
- Consultation workspace
- Prescriptions
- Diagnostic reports
- Schedule and availability
- Earnings and settlements
- Reviews and responses
- Notifications
- Profile management
- Reports
- Support

### 10.3 Appointment management

Doctors can:

- Accept an appointment
- Reject with a required reason
- Propose rescheduling
- Review patient-authorized information
- Start consultation within the allowed window
- Mark check-in/waiting/in-consultation/completed states where permitted
- Mark no-show according to policy
- Schedule follow-up

Prevent overlapping appointments and unauthorized patient access.

### 10.4 Consultation workspace

For in-person and video consultations provide:

- Patient summary
- Reason/symptoms
- Allergies and conditions
- Previous authorized appointments
- Previous prescriptions
- Diagnostic reports
- Uploaded documents
- Clinical notes
- Diagnosis
- Investigation recommendations
- Prescription builder
- Advice
- Follow-up date
- Completion action

Autosave draft clinical notes safely. Final completion should validate required clinical fields.

### 10.5 Prescription workflow

Prescription form should support:

- Diagnosis
- Medicine name
- Strength
- Dose
- Route
- Frequency
- Duration
- Instructions
- Investigations/tests
- Advice
- Follow-up date

On finalization:

- Validate required fields
- Create immutable version
- Record doctor identity and timestamp
- Generate a printable HTML/PDF-ready view
- Store it in the patient’s medical history
- Notify the patient

Edits after finalization must create an amendment or new version, preserve previous versions, record a reason, and write an audit log.

### 10.6 Schedule and availability

Doctors can configure:

- Facility/chamber/online location
- Working days
- Start/end time
- Slot duration
- Maximum patients
- Break periods
- Holidays
- Leave
- Emergency closures
- Special schedules

Validate overlaps and regenerate future available slots or compute availability safely without modifying already-confirmed appointments.

## 11. Facility and Provider Operations

Implement appropriate provider dashboards or API foundations for:

### Hospital / Clinic

- Onboarding and verification
- Departments and services
- Doctors and staff
- Appointment queue
- Patient check-in
- Doctor/room/serial assignment
- Status updates

### Diagnostic center

- New orders
- Collection schedule
- Sample receipt
- Processing status
- Report upload
- Report verification
- Patient notification

### Ambulance provider

- Incoming requests
- Quote/accept/reject
- Fleet and driver management
- Vehicle/driver assignment
- Trip status updates
- Earnings

### Home-care provider

- Incoming bookings
- Staff assignment
- Accept/reject/reschedule
- Service status
- Completion evidence
- Earnings

For MVP, provider dashboards may share the same web app with role-specific routes and navigation.

## 12. Admin Workflows

### 12.1 Admin authentication

Implement admin login with MFA-ready flow, permission checks, secure session management, and audit logs.

### 12.2 Admin dashboard

Include KPI cards and trends for:

- Total patients
- Active doctors
- Facilities
- Diagnostic centers
- Today’s appointments
- Appointment status distribution
- Revenue
- Pending verifications
- Refund requests
- Open support tickets
- Provider activity
- System health indicators

### 12.3 User management

Admins with permission can:

- Search/filter users
- View account status and activity
- Suspend/reactivate accounts
- Initiate password reset without viewing passwords
- Review deactivation requests
- View related bookings and support history according to permission

### 12.4 Doctor verification and management

Implement review queue with:

- Applicant information
- Uploaded documents
- Registration/license details
- Qualifications
- Specialty
- Facilities
- Verification notes
- Request changes
- Approve
- Reject with reason
- Suspend/reactivate
- Full audit history

### 12.5 Provider management

Manage hospitals, diagnostic centers, ambulance providers, and home-care providers including verification, services, staff, activation, suspension, and restricted deletion.

### 12.6 Appointment administration

Admins can search/filter appointments, inspect history, help reschedule/cancel, resolve booking conflicts, and apply permission-controlled overrides with mandatory reason and audit logging.

### 12.7 Payments, finance, and refunds

Provide:

- Transaction list
- Payment attempts
- Gateway references
- Reconciliation status
- Revenue breakdown
- Platform fees
- Tax/VAT fields
- Provider earnings
- Settlement status
- Refund request queue
- Partial/full refund workflow
- Manual-review state
- Invoice and credit-note records

Never allow an admin to arbitrarily edit a paid amount. Use adjustments, refunds, or ledger-like records.

### 12.8 Review moderation

Admins can:

- Review pending content
- Verify booking ownership
- Approve, reject, or hide reviews
- Record moderation reason
- Handle abuse reports
- Recalculate provider rating from approved reviews

### 12.9 CMS

Create content management for pages, blog posts, FAQs, banners, categories, and SEO metadata. Include draft, review, publish, unpublish, revision, and audit history states.

### 12.10 Support, complaints, and disputes

Implement ticket categories, priorities, statuses, assignment, threaded messages, attachments, internal notes, escalation, resolution, and customer feedback.

Complaint/dispute workflows should link to relevant appointment, payment, provider, or service records.

### 12.11 Roles and permissions

Create a usable permission-management screen. Protect the `SUPER_ADMIN` role against accidental removal or lockout. Log all role and permission changes.

### 12.12 Reports and analytics

Provide filterable reports for:

- Appointments
- Patients
- Doctors
- Facilities/providers
- Diagnostic orders
- Ambulance requests
- Revenue
- Refunds
- Cancellations
- No-shows
- Service types
- Reviews
- Support performance

Support CSV export initially. Design interfaces for future PDF/Excel export.

### 12.13 Audit logs

Audit at least:

- Authentication events
- Role/permission changes
- Doctor/provider verification decisions
- Appointment overrides
- Medical-record access
- Prescription creation/amendment
- Payment/refund actions
- User suspension/deactivation
- CMS publication
- System-setting changes

Audit records should include actor, action, resource type, resource ID, timestamp, IP where available, user agent, summary, and safe before/after metadata. Never store raw passwords, OTPs, tokens, or unnecessary medical content in logs.

## 13. API Requirements

Use resource-oriented REST endpoints under `/api/v1`.

Examples:

```text
POST   /auth/register/patient
POST   /auth/register/doctor
POST   /auth/verify-otp
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password

GET    /doctors
GET    /doctors/:id
GET    /doctors/:id/availability
POST   /doctors/:id/appointments

GET    /appointments
GET    /appointments/:id
PATCH  /appointments/:id/cancel
PATCH  /appointments/:id/reschedule
PATCH  /appointments/:id/accept
PATCH  /appointments/:id/reject
PATCH  /appointments/:id/check-in
PATCH  /appointments/:id/start
PATCH  /appointments/:id/complete

POST   /consultations/:appointmentId/notes
POST   /consultations/:appointmentId/prescriptions
POST   /prescriptions/:id/finalize
POST   /prescriptions/:id/amendments

GET    /diagnostic-tests
POST   /diagnostic-orders
PATCH  /diagnostic-orders/:id/status
POST   /diagnostic-orders/:id/report

POST   /ambulance-requests
PATCH  /ambulance-requests/:id/status

POST   /home-care-bookings
PATCH  /home-care-bookings/:id/status

POST   /payments/intents
POST   /payments/webhooks/:provider
POST   /refunds

GET    /notifications
PATCH  /notifications/:id/read

POST   /support-tickets
POST   /support-tickets/:id/messages

GET    /admin/doctor-verifications
PATCH  /admin/doctor-verifications/:id/decision
GET    /admin/reports/appointments
GET    /admin/audit-logs
```

Use consistent response envelopes and error formats, for example:

```json
{
  "data": {},
  "meta": {},
  "requestId": "..."
}
```

```json
{
  "error": {
    "code": "APPOINTMENT_SLOT_UNAVAILABLE",
    "message": "The selected time slot is no longer available.",
    "details": [],
    "requestId": "..."
  }
}
```

Implement pagination, sorting, filtering, and safe search conventions consistently.

Generate and maintain Swagger documentation.

## 14. Frontend Route Structure

Use route groups and role-specific layouts similar to:

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── doctors/
│   ├── hospitals/
│   ├── diagnostics/
│   ├── health-packages/
│   ├── ambulance/
│   ├── home-care/
│   ├── blog/
│   └── contact/
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── verify-otp/
│   └── forgot-password/
├── patient/
│   ├── dashboard/
│   ├── appointments/
│   ├── diagnostics/
│   ├── ambulance/
│   ├── home-care/
│   ├── records/
│   ├── prescriptions/
│   ├── payments/
│   ├── notifications/
│   ├── support/
│   └── settings/
├── doctor/
│   ├── dashboard/
│   ├── appointments/
│   ├── patients/
│   ├── consultations/
│   ├── prescriptions/
│   ├── reports/
│   ├── schedule/
│   ├── earnings/
│   ├── notifications/
│   ├── profile/
│   └── support/
├── provider/
│   └── ...
└── admin/
    ├── dashboard/
    ├── users/
    ├── doctors/
    ├── providers/
    ├── appointments/
    ├── diagnostics/
    ├── ambulance/
    ├── home-care/
    ├── payments/
    ├── refunds/
    ├── reviews/
    ├── cms/
    ├── notifications/
    ├── reports/
    ├── support/
    ├── roles/
    ├── audit-logs/
    └── settings/
```

## 15. UI/UX Requirements

Create an original, modern healthcare design system.

Requirements:

- Mobile-first responsive layout
- WCAG-minded contrast and keyboard navigation
- Clear patient-friendly language
- Consistent status badges
- Skeleton loading states
- Empty states with meaningful actions
- Confirmation dialogs for destructive actions
- Toasts for immediate feedback
- Inline validation errors
- Breadcrumbs in complex dashboards
- Search, filters, sorting, pagination, and saved filter state where helpful
- Tables on desktop and card views on small screens
- No sensitive medical data in browser logs
- Avoid exposing internal IDs where a public reference number is better

Create shared UI patterns for:

- App shell
- Sidebar
- Header
- Data table
- Filter bar
- Date/slot picker
- Status badge
- File uploader
- Stepper
- Confirmation dialog
- Empty state
- Error state
- Permission denied state
- Timeline/status history
- Notification center

## 16. Security and Privacy Requirements

This is a sensitive healthcare application. Implement strong defaults, but do not claim legal or regulatory certification.

Required:

- Strict server-side authorization
- Least privilege
- Password hashing with Argon2
- Token rotation and revocation
- OTP expiration and attempt limits
- Login rate limiting
- File type/size validation
- Signed/private file access
- MIME validation; do not trust filename extension
- Safe error messages
- Parameterized database access via Prisma
- Content-security policy where practical
- Secure headers
- CORS allowlist
- Secret validation at startup
- No secrets committed to Git
- Audit sensitive record access
- Redact PII and medical information from logs
- Data-retention hooks and soft-delete strategy
- Admin actions with reason fields where appropriate
- Idempotency keys for payment-sensitive POST operations
- Webhook signature verification abstraction
- Dependency and container security scanning in CI if practical

Write a threat-model summary in `docs/SECURITY.md` covering authentication, broken access control, appointment race conditions, payment callbacks, malicious uploads, audit tampering, and medical-data leakage.

## 17. Background Jobs and Notifications

Use BullMQ for jobs such as:

- OTP delivery
- Booking confirmation
- Appointment reminders
- Video consultation reminders
- Payment reconciliation
- Refund processing/retry
- Diagnostic report notification
- Review requests
- Email/SMS/push delivery
- Report exports
- Cleanup of expired slot holds

Store notification records before or during delivery. Track queued, sent, delivered where supported, failed, and retried states.

Create template keys rather than hardcoding notification text throughout services.

## 18. Search and Filtering

Implement consistent search/filter APIs and UI for doctors, facilities, appointments, users, diagnostic orders, ambulance requests, payments, support tickets, and audit logs.

Use debounced search on the client. Validate sort fields against an allowlist. Never interpolate raw client-provided column names into queries.

## 19. Seed Data

Create deterministic seed data containing:

- One super admin
- One operations admin
- One finance admin
- One support agent
- At least six doctors across multiple specialties
- At least three hospitals/clinics
- At least two diagnostic centers
- Diagnostic tests and two health packages
- One ambulance provider with vehicles and drivers
- One home-care provider
- Several patients and dependents
- Sample schedules and available slots
- Appointments in multiple states
- One completed consultation and prescription
- Diagnostic orders in several states
- Payments, one refund, reviews, notifications, and support tickets

Use clearly documented development credentials in `README.md`. Never use the development credentials in production.

## 20. Testing Requirements

Write unit tests for:

- Appointment transition rules
- Slot conflict detection
- Price calculation
- Refund calculation
- Permission checks
- Doctor record-access restrictions
- Prescription finalization/versioning
- OTP expiration/attempt handling
- Payment webhook idempotency

Write API integration tests for:

- Registration and verification
- Login and refresh
- Doctor search
- Appointment booking
- Concurrent slot booking
- Cancellation/refund initiation
- Doctor acceptance and consultation completion
- Prescription finalization
- Admin doctor approval

Write Playwright tests for these critical user journeys:

1. Patient registers, verifies, logs in, finds a doctor, and books an appointment.
2. Doctor logs in, accepts the appointment, records a consultation, and issues a prescription.
3. Patient views and downloads the prescription and submits a review.
4. Admin reviews and approves a doctor application.
5. Patient books a diagnostic test and later views the report.

Tests must use stable selectors such as `data-testid` only when semantic selectors are insufficient.

## 21. Documentation Requirements

Create:

- `README.md`: setup, commands, environment, services, credentials, architecture summary
- `docs/ARCHITECTURE.md`: modules, data flow, state machines, queues, integrations
- `docs/DATABASE.md`: schema explanation and Mermaid ERD
- `docs/API.md`: API conventions and major endpoint groups
- `docs/SECURITY.md`: security controls and threat model
- `docs/DECISIONS.md`: architecture decision records
- `docs/IMPLEMENTATION_STATUS.md`: completed, partial, mocked, and pending features

Keep documents synchronized with the implementation.

## 22. Environment Variables

Create a validated `.env.example` including at least:

```env
NODE_ENV=development
APP_TIMEZONE=Asia/Dhaka
WEB_URL=http://localhost:3000
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/healthcare
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
OTP_TTL_SECONDS=300
SLOT_HOLD_SECONDS=300
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./storage
PAYMENT_PROVIDER=mock
SMS_PROVIDER=mock
EMAIL_PROVIDER=development
LOG_LEVEL=debug
```

Validate environment variables at startup and fail with a clear error when required values are missing.

## 23. Docker and Commands

Provide commands that work on Windows PowerShell, Git Bash, macOS, and Linux where possible.

Required root scripts:

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

Make `docker compose up -d` start local dependencies. Add health checks and clear setup instructions.

## 24. Implementation Phases

Work in this order and keep `docs/IMPLEMENTATION_STATUS.md` updated after every phase.

### Phase 0 — Analyze and plan

- Read the complete workflow document.
- Identify duplicate or conflicting requirements.
- Record assumptions.
- Create architecture, database, API, and implementation plan documents.
- Do not remove important workflow coverage merely because the MVP UI is smaller.

### Phase 1 — Foundation

- Initialize monorepo.
- Configure TypeScript, linting, formatting, Docker, database, Redis, environment validation, CI, shared packages, design system, API base, logging, error handling, Swagger, and health endpoints.

### Phase 2 — Authentication and RBAC

- Patient/doctor/admin authentication.
- OTP mock delivery.
- Refresh token rotation.
- Roles, permissions, guards, protected layouts, sessions, and audit events.

### Phase 3 — Public marketplace and patient profile

- Public pages, doctor/facility search, profiles, patient dashboard, dependents, file upload abstraction, and seed data.

### Phase 4 — Appointment engine

- Doctor schedules, availability, temporary slot holds, booking, payment mock, confirmation, cancellation, rescheduling, status history, notifications, and tests for concurrency.

### Phase 5 — Doctor workspace

- Doctor onboarding, admin verification, doctor dashboard, appointment actions, consultation workspace, clinical notes, prescriptions, follow-ups, and authorized medical-record access.

### Phase 6 — Diagnostics and packages

- Diagnostic catalog, orders, home collection, provider operations, reports, packages, payment, notifications, and patient record integration.

### Phase 7 — Ambulance and home care

- Request/booking flows, provider assignment, status tracking, completion, payments, and receipts.

### Phase 8 — Admin operations

- Admin modules for users, providers, appointments, finance, refunds, reviews, CMS, support, disputes, analytics, permissions, settings, and audit logs.

### Phase 9 — Hardening

- Security review, authorization tests, performance indexes, accessibility pass, production Docker build, CI, monitoring hooks, backup notes, documentation, and complete end-to-end tests.

## 25. Coding Rules

Follow these non-negotiable rules:

- Use strict TypeScript. Avoid `any`; document unavoidable cases.
- Do not put business logic in React components or controllers.
- Keep functions focused and names explicit.
- Use enums/constants for statuses and permissions.
- Validate every mutation payload.
- Use database transactions where partial completion would corrupt state.
- Do not create fake implementations that silently appear complete.
- Clearly label development mocks.
- Never hardcode secrets.
- Never log passwords, tokens, OTPs, full payment credentials, or unnecessary medical data.
- Never permit a doctor to query unrelated patients.
- Never trust client-provided role, price, payment success, or appointment status.
- Do not delete historical financial or clinical records through normal UI operations.
- Use public reference numbers for appointments, orders, invoices, and tickets.
- Return user-friendly messages and stable machine-readable error codes.
- Add tests when fixing a bug or implementing critical domain behavior.
- Keep imports, folder names, scripts, and documentation consistent.
- Do not leave the repository in a broken state between phases.

## 26. Completion Criteria

The project is considered successfully initialized only when:

- `npm install` succeeds.
- `docker compose up -d` starts required local services.
- Database migrations and seed run successfully.
- `npm run dev` starts web and API applications.
- Public doctor browsing works.
- Patient registration/login works using development OTP.
- A patient can book an available doctor slot without double-booking.
- A doctor can manage the appointment and finalize a prescription.
- A patient can view the resulting prescription.
- An admin can approve a doctor application.
- A diagnostic order can move through report-ready state.
- Role and permission enforcement exists on the server.
- Audit logs are produced for critical actions.
- Lint, type-check, unit tests, integration tests, build, and critical E2E tests pass.
- README and implementation-status documents accurately describe what is complete and what remains mocked or pending.

## 27. Execution Instructions

Start now.

1. Inspect the current repository before changing files.
2. Read the complete workflow source document.
3. Preserve useful existing code and configuration.
4. Create or update `docs/IMPLEMENTATION_STATUS.md` with a checklist for every phase.
5. Implement Phase 0 and Phase 1 first.
6. Then continue through the phases in order as far as the current session allows.
7. After each phase, run formatting, linting, type-checking, relevant tests, and build checks.
8. Fix errors rather than hiding or disabling checks.
9. Commit-ready code is required, but do not create Git commits unless explicitly asked.
10. At the end, report:
   - files created or changed;
   - commands run;
   - completed workflows;
   - tests and build results;
   - mocked integrations;
   - remaining work and exact next step.

Do not ask broad planning questions when the workflow document already answers them. Make sensible, documented assumptions. Ask only when a missing decision would create a serious security, legal, or irreversible architectural risk.

---

## Optional First Command

From a writable parent folder, Codex may initialize the repository using npm:

```bash
mkdir healthcare-platform
cd healthcare-platform
npm init -y
```

If the repository already exists, do not recreate it. Inspect it and continue from the current state.
