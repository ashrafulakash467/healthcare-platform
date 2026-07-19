# Healthcare Platform Workflow

> **Purpose**: This document reorganizes the healthcare platform workflow into:
> 1. **Core workflows** - must-have paths for the current product.
> 2. **Optional workflows** - useful later, but not part of the primary flow.
>
> **Current codebase reality**: The repository currently contains scaffolded backend modules for `auth`, `patient`, `appointment`, and `admin`.  
> That means the workflow below is written as a practical product spec: core flows come first, and advanced flows are marked as optional for future updates.

---

## 1. Workflow Priority Map

### P0 - Core / Must Have
These are the workflows that should stay in the main product flow.

- Visitor browsing and discovery
- Patient registration and login
- Appointment search and booking
- Appointment view, reschedule, and cancellation
- Basic patient dashboard and history
- Basic admin management

### P1 - Important, but can be added after MVP
These are useful and recommended, but not required to launch the core product.

- OTP or two-step verification
- Notifications by SMS/email/push
- Payment and refund handling
- Prescription and medical record access
- Doctor availability and schedule management
- Admin audit logs and analytics

### P2 - Optional / Future Expansion
These are not essential for the main workflow and can be added later without breaking the core platform.

- Doctor portal
- Hospital or clinic onboarding
- Diagnostic center booking and report tracking
- Review and rating moderation
- Support and complaint handling
- Role and permission management
- Advanced reporting dashboards
- Leave management and queue management

---

## 2. Role Map

### Guest
- Can browse public pages.
- Can search doctors, hospitals, and services.
- Can start a booking flow.

### Patient
- Can register, log in, and manage personal bookings.
- Can view appointment history and basic health-related data.
- Can reschedule or cancel eligible appointments.

### Admin
- Can manage patients, appointments, and system data.
- Can approve, update, or correct records when needed.
- Can monitor the platform and handle exceptions.

### Doctor - Optional
- Can review appointments, patient context, and consultation notes.
- Can create prescriptions and mark consultation outcomes.

### Hospital or Facility Staff - Optional
- Can manage queue, room allocation, and on-site appointment handling.

---

## 3. Core End-to-End Workflow

This is the primary journey the platform should support.

```text
Guest visits site
-> searches service or doctor
-> opens detail page
-> logs in or registers if needed
-> selects service date/time
-> enters patient information
-> reviews booking
-> confirms appointment
-> receives confirmation
-> tracks appointment in history
-> reschedules or cancels if needed
-> completes consultation
-> stores outcome in record/history
```

---

## 4. Visitor and Discovery Workflow

### Goal
Let visitors explore the platform before creating an account.

### Flow

```text
Open homepage
-> browse featured services
-> search by doctor, hospital, or service
-> filter by location, specialty, fee, availability
-> open detail page
-> inspect public information
-> choose next action
```

### Public Data
- Doctor name and specialty
- Hospital or chamber location
- Service fee or estimated cost
- Available days or schedule
- Ratings or reviews if enabled
- Service description and booking button

### Rules
- Guest can view public content only.
- Guest cannot confirm a booking without authentication.
- If the user starts booking, the system should preserve the selected detail page and return there after login.

### Why this is core
This is the entry point for almost every user. Without discovery, the rest of the workflow cannot start smoothly.

---

## 5. Authentication Workflow

### Goal
Allow users to create and access a secure account.

### Flow

```text
Open login or register page
-> enter phone/email and password
-> validate input
-> create or verify account
-> create session
-> redirect to the intended page or dashboard
```

### Registration Flow

```text
Click Register
-> choose patient account
-> enter name, phone, email, password
-> accept terms and privacy policy
-> validate form
-> send verification code or OTP
-> verify account
-> create user profile
-> open dashboard
```

### Login Flow

```text
Enter credentials
-> validate credentials
-> optional OTP or second factor
-> create authenticated session
-> redirect to dashboard or booking flow
```

### Password Recovery

```text
Open Forgot Password
-> provide phone or email
-> verify ownership
-> send reset link or OTP
-> set new password
-> return to login
```

### Priority Note
OTP and two-factor login are recommended, but they can be added after the main registration/login path is working.

---

## 6. Patient Profile and Onboarding Workflow

### Goal
Create a usable patient profile after sign-up.

### Flow

```text
Account created
-> complete profile
-> add optional demographic data
-> save patient record
-> enter dashboard
```

### Recommended Fields
- Full name
- Date of birth
- Gender
- Phone number
- Email address
- Address
- Blood group
- Emergency contact
- Existing medical conditions

### Rules
- Only required fields should block registration.
- Optional fields can be completed later from the profile page.
- Profile changes should be logged if they affect medical or booking data.

### Why this matters
This gives the booking system enough identity data to produce reliable appointments and history.

---

## 7. Appointment Booking Workflow

### Goal
Make booking simple, traceable, and recoverable.

### Flow

```text
Open doctor or service detail page
-> click Book Now
-> check login status
-> if not logged in, authenticate first
-> choose appointment type
-> choose date and time
-> select patient profile
-> enter booking notes if needed
-> review summary
-> confirm booking
-> generate appointment ID
-> show confirmation screen
-> store in appointment history
```

### Booking Inputs
- Service type
- Doctor or facility
- Appointment date
- Time slot
- Patient identity
- Reason for visit
- Visit mode: in-person or video

### Booking Validation
- Time slot must be available.
- Appointment must not overlap with another confirmed slot.
- Patient identity must be valid.
- Required payment, if any, must be completed before final confirmation.

### Booking Output
- Appointment ID
- Confirmed date and time
- Provider details
- Booking status
- Booking history entry
- Notification to patient and provider

### Important Behavior
If the user is forced to log in during booking, return them to the exact step they left, not to a generic dashboard.

---

## 8. Appointment Management Workflow

### Goal
Let patients manage booked appointments safely.

### Main actions
- View upcoming appointments
- View past appointments
- Reschedule eligible appointments
- Cancel eligible appointments
- Check booking status

### Reschedule Flow

```text
Open appointment
-> choose reschedule
-> verify eligibility
-> choose new slot
-> validate availability
-> update appointment
-> notify patient and provider
```

### Cancellation Flow

```text
Open appointment
-> choose cancel
-> confirm reason
-> check refund rules
-> cancel appointment
-> update history
-> notify patient and provider
```

### Rules
- Only upcoming appointments can usually be rescheduled or cancelled.
- Completed appointments should not return to pending state.
- Cancellation policy should be visible before final confirmation.

### Why this is core
Users judge healthcare platforms heavily by how easy booking changes are. This is one of the most important real-world workflows.

---

## 9. Patient Dashboard Workflow

### Goal
Provide a single place for the patient to manage care-related activity.

### Dashboard Blocks
- Upcoming appointments
- Past appointments
- Saved patient profiles
- Notifications
- Reports or documents if enabled
- Payment history if enabled

### Dashboard Flow

```text
Login
-> open dashboard
-> view summary cards
-> open appointment detail
-> open profile or history
-> take next action
```

### Recommended Actions
- Book new appointment
- Reschedule
- Cancel
- Download receipt
- View doctor or hospital details

### Priority Note
This is part of the core product. The dashboard does not need to be visually complex, but it must be clear and fast.

---

## 10. Admin Workflow

### Goal
Let admins manage the platform without touching raw data directly.

### Core Admin Responsibilities
- View and manage patient records
- View and manage appointments
- Correct invalid data
- Support user issue resolution
- Monitor platform activity

### Admin Flow

```text
Admin login
-> open admin dashboard
-> review system summary
-> search records
-> open patient or appointment
-> take action
-> save changes
-> create audit entry
```

### Admin Actions
- Approve or reject corrections
- Update appointment status
- Merge or correct duplicate records
- Suspend or deactivate problematic accounts
- Handle support escalations

### Rules
- Admin actions should be logged.
- Admin should not silently change medical or booking data.
- High-risk actions should require confirmation.

### Why this is core
Without admin control, the platform will be hard to operate safely once real users start using it.

---

## 11. Notification Workflow - Optional but Recommended

### Goal
Keep users informed at every important state change.

### Events That Should Trigger Notifications
- Registration successful
- Appointment confirmed
- Appointment rescheduled
- Appointment cancelled
- Reminder before visit
- Payment successful
- Prescription or report ready

### Channels
- SMS
- Email
- In-app notification
- Push notification

### Flow

```text
Event occurs
-> notification service creates message
-> route by channel
-> send to user
-> store delivery status
```

### Priority Note
This is very useful, but the core product can still work with basic in-app messages first.

---

## 12. Payment and Refund Workflow - Optional

### Goal
Support paid bookings cleanly.

### Flow

```text
Show fee
-> user confirms booking
-> payment gateway opens
-> payment succeeds or fails
-> appointment updates accordingly
-> receipt stored in history
```

### Refund Flow

```text
Cancel eligible appointment
-> evaluate policy
-> approve refund
-> process refund
-> update payment record
-> notify patient
```

### Priority Note
Add this when the business model needs online payments. If the platform starts as booking-only, this can stay optional.

---

## 13. Doctor Workflow - Optional

### Goal
Let doctors manage their own daily work in a secure workspace.

### Doctor Capabilities
- View today's appointments
- Accept or reject requests
- Review patient context before consultation
- Mark consultation complete
- Create notes or prescription
- Update availability

### Doctor Flow

```text
Doctor login
-> open doctor dashboard
-> review schedule
-> open appointment
-> inspect patient info
-> conduct consultation
-> write notes or prescription
-> mark complete
```

### Priority Note
This is important for a full healthcare platform, but it is not required for the first release of the current scaffold.

---

## 14. Hospital or Clinic Workflow - Optional

### Goal
Support facility-level operations.

### Flow

```text
Hospital staff login
-> open queue dashboard
-> verify patient
-> assign doctor or room
-> manage serial or queue
-> update visit status
```

### Useful Features
- Facility onboarding
- Doctor mapping
- Room allocation
- Queue handling
- On-site check-in

### Priority Note
This becomes important when the platform needs multi-provider or multi-branch operations.

---

## 15. Diagnostic Center Workflow - Optional

### Goal
Support test booking and report delivery.

### Flow

```text
Open diagnostic listing
-> choose test package
-> enter patient info
-> upload prescription if needed
-> book slot
-> collect sample
-> process test
-> publish report
-> notify patient
```

### Priority Note
This is a separate service line and should stay optional unless the product scope explicitly includes diagnostics.

---

## 16. Prescription and Medical Record Workflow - Optional

### Goal
Store consultation outcomes and share them securely.

### Flow

```text
Consultation complete
-> doctor creates prescription
-> system stores record
-> patient receives access
-> patient can download or view later
```

### Rules
- Only authorized users can view medical records.
- Access should be role-based.
- Changes should be versioned when possible.

### Priority Note
This is highly valuable, but it is safer to add after appointment and login flows are stable.

---

## 17. Review and Rating Workflow - Optional

### Goal
Collect patient feedback after a completed visit.

### Flow

```text
Appointment completed
-> patient opens review form
-> verifies booking ownership
-> submits rating and comment
-> system stores review
-> optional moderation checks
```

### Rules
- Only completed appointments can be reviewed.
- Review should be linked to a real booking.
- Abuse and spam should be moderated.

---

## 18. Support and Complaint Workflow - Optional

### Goal
Handle user issues without breaking the main booking flow.

### Flow

```text
User opens support
-> selects issue type
-> submits complaint
-> support/admin reviews
-> action is taken
-> user gets resolution status
```

### Typical Issues
- Wrong booking time
- Payment failed but money deducted
- Doctor unavailable
- Report missing
- Account access problem

---

## 19. Audit and Logging Workflow - Recommended

### Goal
Keep sensitive actions traceable.

### Log Events
- Login and logout
- Booking creation
- Appointment update
- Cancellation
- Admin override
- Prescription or record access

### Audit Flow

```text
User or admin action
-> validate action
-> execute action
-> write audit log
-> keep timestamp and actor
```

### Priority Note
This is not visible to most users, but it is important for security and trust.

---

## 20. Recommended Appointment Status Model

### Main Statuses
- Draft
- Pending
- Confirmed
- Rescheduled
- Cancelled
- In Consultation
- Completed
- No Show
- Rejected

### Typical Lifecycle

```text
Draft
-> Pending
-> Confirmed
-> In Consultation
-> Completed
```

### Alternative Paths
- Pending -> Cancelled
- Pending -> Rejected
- Confirmed -> Rescheduled
- Confirmed -> Cancelled
- Confirmed -> No Show

### Rule
A completed appointment should not move back to any earlier active state.

---

## 21. Recommended Build Order

If the team is building this step by step, this is the cleanest order:

1. Authentication
2. Patient profile
3. Public discovery
4. Appointment booking
5. Appointment history
6. Reschedule and cancellation
7. Admin dashboard
8. Notifications
9. Payments
10. Doctor portal
11. Hospital workflow
12. Diagnostics
13. Prescription and records
14. Reviews
15. Support and analytics

---

## 22. Final Recommended Workflow Summary

This is the simplest and most practical version of the platform:

```text
Guest discovers service
-> patient signs up or logs in
-> patient books appointment
-> system confirms and stores booking
-> patient tracks or updates booking
-> admin monitors and supports operations
-> optional doctor, hospital, payment, and diagnostic flows can be added later
```

---

## 23. Notes for Implementation

- Keep the main flow short and direct.
- Do not push doctor, hospital, diagnostics, and analytics into the first user journey unless the product truly needs them.
- Make appointment booking, rescheduling, and cancellation stable before adding advanced modules.
- Mark optional flows clearly in the UI and in the backend so they can be introduced later without refactoring the core journey.
- Maintain clean status transitions and audit logs from the beginning.

