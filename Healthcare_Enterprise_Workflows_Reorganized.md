# Healthcare Enterprise Workflows (Reorganized)

> Reorganized into **User → Doctor → Admin** workflows. Large duplicate Doctor Dashboard section removed.

# 1. User / Patient Workflows

## 1. Visitor / Guest Workflow

**Classification:** Observed + Probable

```text
Landing Page
    │
    ▼
Browse Public Website
    │
    ├───────────────┬────────────────┬──────────────────┐
    │               │                │                  │
    ▼               ▼                ▼                  ▼
Search Doctors   Browse Hospitals   Browse Diagnostics  Browse Other Services
    │               │                │                  │
    └───────────────┴───────────────┬┴──────────────────┘
                                    ▼
                              View Listing Page
                                    │
                                    ▼
                           Apply Filters / Sort Results
                                    │
                                    ▼
                              Open Detail Page
                                    │
                                    ▼
                         Read Public Information
     (fees, schedule, services, location, reviews, package details)
                                    │
                                    ▼
                         Click "Book Now" / "Get Service"
                                    │
                                    ▼
                             Authentication Check
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                       ▼                         ▼
                 Guest User                Logged-in User
                       │                         │
                       ▼                         ▼
                Login / Register          Continue Booking
                       │
                       ▼
              Return to Intended Page
```

### Guest Capabilities

- View public pages.
- Search doctors, hospitals, diagnostic centers, ambulances, packages, and services.
- View public profiles, fees, schedules, locations, reviews, and service descriptions.
- Read blogs, health information, FAQs, and policy pages.
- Start a booking or service request.

### Guest Restrictions

- Cannot confirm appointments.
- Cannot access patient dashboard.
- Cannot access medical records, prescriptions, invoices, or booking history.
- Cannot submit verified reviews.
- Cannot reschedule or cancel an appointment without authentication.

---

#1.1 User Booking Flow

``` text
Landing Page
      │
      ▼
Browse Website
      │
      ├──────────────┐
      │              │
      ▼              ▼
Search          Browse Categories
      │              │
      └──────┬───────┘
             ▼
      View Details
             │
             ├──────────────┐
             │              │
             ▼              ▼
Doctor      Hospital / Diagnostic / Ambulance / Package
Profile             Details
             │
             ▼
Read Information
(View fees, schedule, reviews, services, location)
             │
             ▼
Click "Book Now" / "Get Service"
             │
             ▼
Logged In?
      │
 ┌────┴────┐
 │         │
No        Yes
 │         │
 ▼         ▼
Login / Register
 │
 ▼
Return to Previous Page
 │
 ▼
Continue Booking
 │
 ▼
Choose Date
 │
 ▼
Choose Time Slot
 │
 ▼
Enter Patient Information
 │
 ▼
Review Booking
 │
 ▼
Payment (if required)
 │
 ▼
Appointment Confirmed
 │
 ▼
Confirmation Screen
 │
 ▼
Appointment History
 │
 ▼
Receive Notifications
```




---

## 2. Patient Registration Workflow

**Classification:** Probable

```text
Click Register
    │
    ▼
Select Patient Registration
    │
    ▼
Enter Basic Information
(name, phone, email, password)
    │
    ▼
Accept Terms and Privacy Policy
    │
    ▼
Submit Registration
    │
    ▼
Validate Input
    │
    ├─────────────── Invalid ───────────────┐
    │                                       ▼
    │                              Show Field-Level Errors
    │                                       │
    │                                       └──► Correct and Resubmit
    ▼
Send OTP
    │
    ▼
Enter OTP
    │
    ├────────────── Invalid / Expired ──────┐
    │                                       ▼
    │                                Retry / Resend OTP
    ▼
OTP Verified
    │
    ▼
Create Patient Account
    │
    ▼
Optional Profile Completion
(date of birth, gender, address, blood group)
    │
    ▼
Patient Dashboard
```

---


---

## 3. Patient Login Workflow

**Classification:** Probable

```text
Login Page
    │
    ▼
Enter Phone/Email and Password
    │
    ▼
Submit
    │
    ▼
Credential Validation
    │
    ├──────────── Invalid ────────────┐
    │                                 ▼
    │                         Show Login Error
    │                                 │
    │                      Forgot Password / Retry
    ▼
Optional OTP / Two-Step Verification
    │
    ▼
Create Authenticated Session
    │
    ▼
Redirect
    │
    ├──► Previous Booking Page
    └──► Patient Dashboard
```

---


---

## 4. Forgot Password / Account Recovery Workflow

**Classification:** Probable

```text
Login Page
    │
    ▼
Click "Forgot Password"
    │
    ▼
Enter Registered Phone or Email
    │
    ▼
Account Lookup
    │
    ├──────────── Not Found ───────────► Show Generic Error
    ▼
Send OTP / Reset Link
    │
    ▼
Verify OTP / Open Reset Link
    │
    ▼
Enter New Password
    │
    ▼
Validate Password Policy
    │
    ▼
Update Password
    │
    ▼
Invalidate Old Sessions
    │
    ▼
Login Confirmation
```

---


---

## 5. Doctor Search Workflow

**Classification:** Observed + Probable

```text
Landing Page
    │
    ▼
Doctor Search
    │
    ├──► Search by Doctor Name
    ├──► Search by Specialty
    ├──► Search by Hospital
    ├──► Search by Location
    └──► Search by Availability
              │
              ▼
        Doctor Results
              │
              ▼
       Filter / Sort Results
              │
              ▼
       Open Doctor Profile
              │
              ▼
 Review Qualifications, Experience,
 Fees, Schedule, Location and Reviews
              │
              ▼
      Select Consultation Type
              │
      ┌───────┴────────┐
      ▼                ▼
In-person Visit   Video Consultation
      │                │
      └───────┬────────┘
              ▼
          Book Now
```

---


---

## 6. Patient Appointment Booking Workflow

**Classification:** Observed + Probable

```text
Doctor / Hospital Detail Page
    │
    ▼
Click "Book Now"
    │
    ▼
Authentication Check
    │
    ├──► Not Logged In → Login / Register → Return
    ▼
Select Appointment Type
    │
    ├──► In-person
    ├──► Video
    └──► Follow-up
    │
    ▼
Choose Location / Chamber
    │
    ▼
Choose Date
    │
    ▼
Load Available Time Slots
    │
    ▼
Choose Time Slot
    │
    ▼
Temporarily Hold Slot
    │
    ▼
Select Patient
    │
    ├──► Self
    └──► Family Member / Dependent
    │
    ▼
Enter Visit Information
(symptoms, reason, notes)
    │
    ▼
Upload Documents (Optional)
    │
    ▼
Review Booking
    │
    ▼
Payment Required?
    │
    ├──────── No ────────► Confirm Appointment
    │
    ▼
Select Payment Method
    │
    ▼
Complete Payment
    │
    ├──────── Failed ─────► Retry / Change Method
    ▼
Booking Confirmed
    │
    ▼
Generate Appointment ID
    │
    ▼
Send SMS / Email / Push Confirmation
    │
    ▼
Show Confirmation Screen
    │
    ▼
Add to Appointment History
```

---


---

## 7. Appointment Rescheduling Workflow

**Classification:** Probable

```text
Patient Dashboard
    │
    ▼
Appointment History
    │
    ▼
Open Upcoming Appointment
    │
    ▼
Click Reschedule
    │
    ▼
Check Reschedule Eligibility
    │
    ├──────── Not Eligible ─────────► Show Policy / Contact Support
    ▼
Load Alternative Dates and Slots
    │
    ▼
Select New Date and Time
    │
    ▼
Calculate Fee Difference
    │
    ├──► Additional Payment Required
    ├──► No Difference
    └──► Partial Refund Required
    │
    ▼
Confirm Reschedule
    │
    ▼
Release Old Slot
    │
    ▼
Reserve New Slot
    │
    ▼
Update Appointment
    │
    ▼
Notify Patient and Provider
```

---


---

## 8. Appointment Cancellation Workflow

**Classification:** Probable

```text
Patient Dashboard
    │
    ▼
Open Upcoming Appointment
    │
    ▼
Click Cancel
    │
    ▼
Display Cancellation Policy
    │
    ▼
Select Cancellation Reason
    │
    ▼
Confirm Cancellation
    │
    ▼
Check Refund Eligibility
    │
    ├──────── Eligible ───────► Start Refund Process
    │
    └──────── Not Eligible ───► Mark Non-refundable
    │
    ▼
Release Time Slot
    │
    ▼
Update Appointment Status
    │
    ▼
Notify Patient, Doctor and Facility
```

---


---

## 9. Video Consultation Workflow

**Classification:** Probable

```text
Confirmed Video Appointment
    │
    ▼
Send Pre-Consultation Reminder
    │
    ▼
Patient Opens Appointment
    │
    ▼
Device and Network Check
    │
    ├──────── Failed ─────────► Troubleshooting / Support
    ▼
Join Waiting Room
    │
    ▼
Doctor Joins Session
    │
    ▼
Identity Confirmation
    │
    ▼
Video Consultation
    │
    ▼
Doctor Records Clinical Notes
    │
    ▼
Create Prescription / Advice
    │
    ▼
End Consultation
    │
    ▼
Save Consultation Record
    │
    ▼
Send Prescription and Follow-up Instructions
```

---


---

## 11. Patient Medical Record Workflow

**Classification:** Probable

```text
Patient Dashboard
    │
    ▼
Medical Records
    │
    ├──► Prescriptions
    ├──► Diagnostic Reports
    ├──► Appointment Notes
    ├──► Uploaded Documents
    └──► Invoices
              │
              ▼
        Open Record
              │
              ├──► View
              ├──► Download
              ├──► Share with Provider
              └──► Upload Related Document
```

---


---

## 12. Patient Review and Rating Workflow

**Classification:** Probable

```text
Completed Appointment
    │
    ▼
Request Review
    │
    ▼
Patient Opens Review Form
    │
    ▼
Select Rating
    │
    ▼
Write Comments
    │
    ▼
Submit Review
    │
    ▼
Verify Appointment Ownership
    │
    ├──────── Invalid ─────────► Reject Submission
    ▼
Moderation Required?
    │
    ├──────── Yes ─────────────► Moderation Queue
    └──────── No ──────────────► Publish Review
    │
    ▼
Update Provider Rating
```

---


---

## 18. Diagnostic Test Booking Workflow

**Classification:** Observed + Probable

```text
Diagnostic Listing
    │
    ▼
Search Test / Diagnostic Center
    │
    ▼
Open Center or Test Details
    │
    ▼
Review Price, Preparation and Availability
    │
    ▼
Select Test / Package
    │
    ▼
Choose Service Type
    │
    ├──► Center Visit
    └──► Home Sample Collection
    │
    ▼
Choose Date and Time
    │
    ▼
Enter Patient Information
    │
    ▼
Enter Collection Address (if home service)
    │
    ▼
Upload Doctor Prescription (if required)
    │
    ▼
Review Order
    │
    ▼
Payment
    │
    ▼
Booking Confirmed
    │
    ▼
Sample Collection / Center Visit
    │
    ▼
Test Processing
    │
    ▼
Report Uploaded
    │
    ▼
Patient Notification
    │
    ▼
View / Download Report
```

---


---

## 20. Ambulance Booking Workflow

**Classification:** Observed + Probable

```text
Ambulance Service Page
    │
    ▼
Select Ambulance Type
    │
    ├──► General
    ├──► ICU
    ├──► Freezer
    └──► Emergency
    │
    ▼
Enter Pickup Location
    │
    ▼
Enter Destination
    │
    ▼
Select Date and Time
    │
    ├──► Immediate
    └──► Scheduled
    │
    ▼
Enter Patient and Contact Information
    │
    ▼
Estimate Fare / Request Quote
    │
    ▼
Confirm Request
    │
    ▼
Provider Assignment
    │
    ▼
Driver Accepts Request
    │
    ▼
Track Ambulance
    │
    ▼
Pickup
    │
    ▼
Trip Completion
    │
    ▼
Payment / Receipt
```

---


---

## 22. Home Care Service Booking Workflow

**Classification:** Probable

```text
Home Care Service Page
    │
    ▼
Select Service
(nurse, caregiver, physiotherapy, sample collection)
    │
    ▼
Review Service Details
    │
    ▼
Choose Date and Time
    │
    ▼
Enter Patient Information
    │
    ▼
Enter Service Address
    │
    ▼
Add Special Instructions
    │
    ▼
Review Price / Request Quote
    │
    ▼
Confirm Booking
    │
    ▼
Assign Service Provider
    │
    ▼
Provider Accepts
    │
    ▼
Service Delivered
    │
    ▼
Completion Confirmation
    │
    ▼
Payment / Review
```

---


---

## 23. Health Package Purchase Workflow

**Classification:** Observed + Probable

```text
Health Package Listing
    │
    ▼
Search / Browse Packages
    │
    ▼
Open Package Details
    │
    ▼
Review Included Tests and Price
    │
    ▼
Select Diagnostic Center / Location
    │
    ▼
Choose Center Visit or Home Collection
    │
    ▼
Choose Date and Time
    │
    ▼
Enter Patient Information
    │
    ▼
Apply Coupon (Optional)
    │
    ▼
Payment
    │
    ▼
Package Booking Confirmed
    │
    ▼
Complete Tests
    │
    ▼
Receive Reports
```

---


---

## 24. Payment Workflow

**Classification:** Probable

```text
Booking Review
    │
    ▼
Calculate Payable Amount
    │
    ├──► Service Fee
    ├──► Discount
    ├──► Tax / VAT
    └──► Convenience Fee
    │
    ▼
Choose Payment Method
    │
    ├──► Mobile Financial Service
    ├──► Card
    ├──► Bank
    ├──► Wallet
    └──► Cash / Pay at Facility
    │
    ▼
Create Payment Intent
    │
    ▼
Redirect / Open Gateway
    │
    ▼
Payment Authorization
    │
    ├──────── Failed / Cancelled ─────► Retry / Change Method
    │
    ├──────── Pending ────────────────► Reconciliation Queue
    ▼
Payment Success
    │
    ▼
Verify Gateway Callback
    │
    ▼
Record Transaction
    │
    ▼
Confirm Booking
    │
    ▼
Generate Invoice and Receipt
```

---


---

## 25. Refund Workflow

**Classification:** Probable

```text
Cancellation / Failed Service
    │
    ▼
Refund Eligibility Check
    │
    ▼
Calculate Refund Amount
    │
    ▼
Admin / System Approval
    │
    ▼
Create Refund Request
    │
    ▼
Send to Payment Gateway
    │
    ├──────── Failed ───────► Manual Review
    ▼
Refund Processed
    │
    ▼
Update Transaction Status
    │
    ▼
Generate Credit Note
    │
    ▼
Notify Patient
```

---


---

## 26. Notification Workflow

**Classification:** Probable

```text
Business Event Occurs
(booking, payment, cancellation, reminder, report)
    │
    ▼
Create Notification Event
    │
    ▼
Load User Preferences
    │
    ▼
Select Channels
    │
    ├──► SMS
    ├──► Email
    ├──► Push
    └──► In-App
    │
    ▼
Queue Notification
    │
    ▼
Template Rendering
    │
    ▼
Send Through Provider
    │
    ├──────── Failed ───────► Retry Policy
    ▼
Delivery Status Update
    │
    ▼
Audit Notification Log
```

---


---

## 27. Customer Support Workflow

**Classification:** Probable

```text
User Opens Help / Support
    │
    ▼
Select Support Category
    │
    ├──► Booking
    ├──► Payment
    ├──► Refund
    ├──► Doctor / Facility
    ├──► Technical Issue
    └──► Other
    │
    ▼
Search FAQ / Self-Service
    │
    ├──────── Resolved ─────► Close
    ▼
Create Support Ticket
    │
    ▼
Assign Priority and Agent
    │
    ▼
Agent Reviews User History
    │
    ▼
Communicate with User
    │
    ▼
Escalate if Required
    │
    ▼
Resolve Ticket
    │
    ▼
User Confirmation / Feedback
    │
    ▼
Close Ticket
```

---


# 2. Doctor Workflows

## 10. Prescription Workflow

**Classification:** Probable

```text
Doctor Opens Active Appointment
    │
    ▼
Review Patient Information
    │
    ▼
Enter Diagnosis
    │
    ▼
Add Medicines
(name, dose, frequency, duration, instructions)
    │
    ▼
Add Tests / Investigations
    │
    ▼
Add Advice and Follow-up Date
    │
    ▼
Validate Prescription
    │
    ▼
Digitally Sign / Confirm
    │
    ▼
Save Prescription
    │
    ▼
Generate PDF / Printable View
    │
    ▼
Notify Patient
    │
    ▼
Store in Medical History
```

---


---

## 13. Doctor Registration and Verification Workflow

**Classification:** Probable

```text
Doctor Registration Page
    │
    ▼
Enter Personal Information
    │
    ▼
Enter Professional Information
(BMDC/registration number, specialty, experience)
    │
    ▼
Enter Chamber / Hospital Details
    │
    ▼
Upload Verification Documents
    │
    ▼
Set Consultation Fees
    │
    ▼
Set Availability
    │
    ▼
Submit Application
    │
    ▼
Automated Validation
    │
    ▼
Admin Verification Queue
    │
    ├──────── More Information Needed ─────► Request Correction
    │
    ├──────── Rejected ────────────────────► Notify Applicant
    ▼
Approved
    │
    ▼
Activate Doctor Account
    │
    ▼
Publish Doctor Profile
```

---


---

## 14. Doctor Daily Workflow

**Classification:** Probable

```text
Doctor Login
    │
    ▼
Doctor Dashboard
    │
    ├──► Today's Appointments
    ├──► Upcoming Appointments
    ├──► Pending Requests
    ├──► Patient Records
    ├──► Prescriptions
    ├──► Earnings
    └──► Notifications
              │
              ▼
      Open Appointment
              │
              ▼
      Review Patient Details
              │
              ▼
      Accept / Reject / Reschedule
              │
              ▼
      Conduct Consultation
              │
              ▼
      Add Clinical Notes
              │
              ▼
      Issue Prescription
              │
              ▼
      Mark Appointment Complete
              │
              ▼
      Schedule Follow-up
```

---


---

## 15. Doctor Schedule Management Workflow

**Classification:** Probable

```text
Doctor Dashboard
    │
    ▼
Schedule Management
    │
    ▼
Select Chamber / Consultation Type
    │
    ▼
Define Working Days
    │
    ▼
Define Start and End Time
    │
    ▼
Set Slot Duration
    │
    ▼
Set Breaks and Capacity
    │
    ▼
Add Exceptions
(leave, holiday, emergency closure)
    │
    ▼
Preview Availability
    │
    ▼
Save Schedule
    │
    ▼
Generate Appointment Slots
```

---


---

## 16. Hospital / Clinic Onboarding Workflow

**Classification:** Probable

```text
Facility Registration
    │
    ▼
Enter Organization Information
    │
    ▼
Enter License and Registration Details
    │
    ▼
Add Address and Map Location
    │
    ▼
Add Departments and Services
    │
    ▼
Add Doctors
    │
    ▼
Add Contact and Support Information
    │
    ▼
Upload Documents and Branding
    │
    ▼
Submit for Verification
    │
    ▼
Admin Review
    │
    ├──────── Rejected / Correction Required
    ▼
Approved
    │
    ▼
Facility Dashboard Activated
    │
    ▼
Publish Facility Profile
```

---


---

## 17. Hospital Appointment Management Workflow

**Classification:** Probable

```text
Hospital Staff Login
    │
    ▼
Hospital Dashboard
    │
    ▼
Appointment Queue
    │
    ├──► New
    ├──► Confirmed
    ├──► Checked In
    ├──► In Consultation
    ├──► Completed
    ├──► Cancelled
    └──► No-show
              │
              ▼
      Open Appointment
              │
              ▼
      Verify Patient
              │
              ▼
      Assign Doctor / Room / Serial
              │
              ▼
      Update Status
              │
              ▼
      Complete Visit
```

---


---

## 19. Diagnostic Center Operations Workflow

**Classification:** Probable

```text
Diagnostic Staff Login
    │
    ▼
Diagnostic Dashboard
    │
    ├──► New Orders
    ├──► Collection Schedule
    ├──► Samples Received
    ├──► Tests In Progress
    ├──► Reports Pending
    └──► Completed Orders
              │
              ▼
        Open Test Order
              │
              ▼
      Verify Patient and Test
              │
              ▼
      Collect / Receive Sample
              │
              ▼
      Update Processing Status
              │
              ▼
      Upload Verified Report
              │
              ▼
      Notify Patient
```

---


---

## 21. Ambulance Provider Workflow

**Classification:** Probable

```text
Provider Login
    │
    ▼
Ambulance Dashboard
    │
    ├──► Incoming Requests
    ├──► Active Trips
    ├──► Fleet Status
    ├──► Driver Management
    └──► Earnings
              │
              ▼
        Open Request
              │
              ▼
        Accept / Reject
              │
              ▼
      Assign Vehicle and Driver
              │
              ▼
      Start Navigation
              │
              ▼
      Update Arrival Status
              │
              ▼
      Confirm Patient Pickup
              │
              ▼
      Complete Trip
              │
              ▼
      Close Request
```

---


# 3. Admin Workflows

## 29. Admin Login and Dashboard Workflow

**Classification:** Probable

```text
Admin Login
    │
    ▼
Multi-Factor Authentication
    │
    ▼
Admin Dashboard
    │
    ├──► Users
    ├──► Doctors
    ├──► Hospitals
    ├──► Appointments
    ├──► Payments
    ├──► Content
    ├──► Reports
    └──► Notification
    ├──► Support
    └──► Settings
```

---
## Enterprise Admin Dashboard Workflow(


> **Purpose:** Comprehensive workflow for an enterprise healthcare administration portal similar to Healthcare.
>
> **Classification:** Mostly **Probable / Estimated**, based on common enterprise healthcare platform architecture.

---

# 1. Admin Login Workflow

```text
Admin Login
    │
    ▼
Enter Email / Username
    │
    ▼
Enter Password
    │
    ▼
Credential Validation
    │
    ├── Invalid → Show Error
    ▼
MFA / OTP (Optional)
    │
    ▼
RBAC Permission Check
    │
    ▼
Admin Dashboard
```

---

# 2. Main Dashboard Navigation

```text
Admin Dashboard
│
├── Dashboard Overview
├── User Management
├── Doctor Management
├── Hospital Management
├── Appointment Management
├── Payment & Finance
├── Patient Management
├── Reviews & Ratings
├── CMS
├── Notifications
├── Reports & Analytics
├── Support Tickets
├── Roles & Permissions
├── System Settings
├── Audit Logs
└── Logout
```

---

# 3. Dashboard Overview Workflow

```text
Login
 │
 ▼
Load KPI Widgets
 │
 ├── Total Patients
 ├── Total Doctors
 ├── Hospitals
 ├── Today's Appointments
 ├── Revenue
 ├── Pending Verifications
 ├── Refund Requests
 ├── Support Tickets
 └── System Health
       │
       ▼
Select Widget
       │
       ▼
Open Related Module
```

---

# 4. Doctor Management Workflow

```text
Doctor Management
      │
      ▼
Doctor List
      │
      ├── Search
      ├── Filter
      ├── Sort
      ▼
Open Doctor Profile
      │
      ├── Verify
      ├── Approve
      ├── Reject
      ├── Suspend
      ├── Edit
      ├── Reset Password
      └── View Activity
             │
             ▼
Save Changes
      │
      ▼
Audit Log + Notification
```

---

# 5. Hospital Management Workflow

```text
Hospitals
   │
   ▼
Search Hospital
   │
   ▼
Open Profile
   │
   ├── Verify License
   ├── Edit Information
   ├── Manage Departments
   ├── Manage Doctors
   ├── Activate
   ├── Suspend
   └── Delete (Restricted)
          │
          ▼
Save Changes
```

---

# 6. Patient Management Workflow

```text
Patients
   │
   ▼
Search Patient
   │
   ▼
Patient Profile
   │
   ├── View History
   ├── View Appointments
   ├── View Payments
   ├── View Medical Records*
   ├── Lock Account
   ├── Reset Password
   └── Merge Duplicate Accounts
```

*Access to medical records should be permission-controlled.

---

# 7. Appointment Management Workflow

```text
Appointments
     │
     ▼
Search / Filter
     │
     ▼
Appointment Details
     │
     ├── Confirm
     ├── Cancel
     ├── Reschedule
     ├── Reassign Doctor
     ├── Refund
     └── Export
           │
           ▼
Update Status
           │
           ▼
Notify Stakeholders
```

Appointment lifecycle:

```text
Requested
   │
Confirmed
   │
Checked In
   │
In Consultation
   │
Completed

Alternative:
Cancelled
Rejected
Rescheduled
No-show
```

---

# 8. Diagnostic Management Workflow

```text
Diagnostics
     │
     ▼
Manage Centers
     │
     ▼
Tests
     │
     ├── Add
     ├── Edit
     ├── Delete
     ├── Price Update
     ├── Package Mapping
     └── Availability
```

---

# 9. Ambulance Management Workflow

```text
Ambulance Providers
      │
      ▼
Provider List
      │
      ▼
Vehicles
      │
      ├── Add
      ├── Update
      ├── Activate
      ├── Suspend
      └── Track Requests
```

---

# 10. Home Care Workflow

```text
Home Care
    │
    ▼
Provider List
    │
    ▼
Manage Services
    │
    ├── Nurse
    ├── Physiotherapy
    ├── Caregiver
    ├── Sample Collection
    └── Others
```

---

# 11. Payment & Finance Workflow

```text
Payments
    │
    ▼
Transactions
    │
    ├── Successful
    ├── Pending
    ├── Failed
    ├── Refunded
    └── Settlement
           │
           ▼
Open Transaction
           │
           ├── Invoice
           ├── Receipt
           ├── Refund
           └── Audit
```

---

# 12. CMS Workflow

```text
CMS
 │
 ▼
Pages
 │
 ├── Home
 ├── About
 ├── Contact
 ├── Blog
 ├── FAQ
 ├── Banner
 └── SEO
       │
       ▼
Draft
       │
Review
       │
Publish
```

---

# 13. Notification Workflow

```text
Create Event
      │
      ▼
Choose Template
      │
      ▼
Recipients
      │
      ├── Patients
      ├── Doctors
      ├── Hospitals
      └── Staff
            │
            ▼
SMS / Email / Push
```

---

# 14. Reports & Analytics Workflow

```text
Reports
    │
    ▼
Choose Report
    │
    ├── Revenue
    ├── Appointments
    ├── Doctors
    ├── Patients
    ├── Diagnostics
    ├── Refunds
    ├── Support
    └── Activity Logs
          │
          ▼
Apply Filters
          │
          ▼
Generate
          │
          ├── PDF
          ├── Excel
          ├── CSV
          └── Dashboard
```

---

# 15. Support Workflow

```text
Support Queue
      │
      ▼
Open Ticket
      │
      ├── Assign
      ├── Escalate
      ├── Reply
      ├── Resolve
      └── Close
```

---

# 16. Roles & Permissions (RBAC)

```text
Roles
 │
 ▼
Administrator
 │
 ├── Super Admin
 ├── Operations Admin
 ├── Finance Admin
 ├── Medical Admin
 ├── CMS Manager
 ├── Support Agent
 └── Analytics User
       │
       ▼
Assign Permissions
       │
       ▼
Save
```

Permission levels:

| Permission | Description |
|------------|-------------|
| View | Read-only |
| Create | Create records |
| Update | Modify records |
| Delete | Delete where allowed |
| Approve | Approval actions |
| Export | Export data |
| Manage | Full module access |

---

# 17. Audit Log Workflow

```text
Sensitive Action
      │
      ▼
Capture User
Capture Timestamp
Capture IP
Capture Before/After
      │
      ▼
Write Immutable Log
      │
      ▼
Searchable Audit History
```

---

# 18. System Settings Workflow

```text
Settings
   │
   ├── General
   ├── Branding
   ├── Appointment Rules
   ├── Payment Gateways
   ├── SMS Gateway
   ├── Email
   ├── Notification Templates
   ├── Security
   ├── Backup
   └── API Keys
```

---

# 19. Admin Logout

```text
Dashboard
    │
    ▼
Logout
    │
    ▼
Invalidate Session
    │
    ▼
Redirect Login
```

---

# 20. End-to-End Admin Workflow

```text
Admin Login
      │
      ▼
Dashboard
      │
      ├─────────────┬──────────────┬───────────────┐
      ▼             ▼              ▼               ▼
Doctors       Hospitals      Patients      Appointments
      │             │              │               │
      └─────────────┴──────────────┴───────────────┘
                        │
                        ▼
Manage Platform Operations
                        │
                        ├── Payments
                        ├── Diagnostics
                        ├── Ambulance
                        ├── Home Care
                        ├── CMS
                        ├── Notifications
                        ├── Reports
                        ├── Support
                        ├── RBAC
                        └── Settings
                                │
                                ▼
Audit Logging
                                │
                                ▼
Logout
```

---

# Recommended Admin Dashboard Widgets

- Total Users
- Active Doctors
- Verified Hospitals
- Pending Verifications
- Today's Appointments
- Revenue Today
- Monthly Revenue
- Failed Payments
- Refund Requests
- Support Tickets
- System Alerts
- API Health
- Server Status
- Recent Activities
- Audit Log Summary

---

# Recommended Admin Permissions Matrix

| Module | Super Admin | Operations | Finance | CMS | Support |
|--------|-------------|-----------|----------|-----|---------|
| Users | ✔ | ✔ | | | |
| Doctors | ✔ | ✔ | | | |
| Hospitals | ✔ | ✔ | | | |
| Patients | ✔ | ✔ | | | ✔ |
| Payments | ✔ | | ✔ | | |
| CMS | ✔ | | | ✔ | |
| Reports | ✔ | ✔ | ✔ | ✔ | ✔ |
| Settings | ✔ | | | | |
| Audit Logs | ✔ | ✔ | ✔ | | |
)


## 30. Doctor Verification by Admin Workflow

**Classification:** Probable

```text
Admin Dashboard
    │
    ▼
Pending Doctor Applications
    │
    ▼
Open Application
    │
    ▼
Review Identity and Credentials
    │
    ▼
Validate Registration Number
    │
    ▼
Review Uploaded Documents
    │
    ▼
Decision
    │
    ├──► Approve
    ├──► Reject
    └──► Request More Information
    │
    ▼
Update Verification Status
    │
    ▼
Notify Doctor
    │
    ▼
Publish / Keep Profile Hidden
```

---

## 31. Provider Management Workflow

**Classification:** Probable

```text
Admin Dashboard
    │
    ▼
Select Provider Type
    │
    ├──► Hospital
    ├──► Diagnostic Center
    ├──► Ambulance Provider
    └──► Home Care Provider
    │
    ▼
View Provider List
    │
    ▼
Open Provider Profile
    │
    ├──► Verify
    ├──► Activate
    ├──► Suspend
    ├──► Edit
    ├──► Review Complaints
    └──► View Transactions
              │
              ▼
         Save Admin Action
              │
              ▼
         Create Audit Log
```

---

## 32. Appointment Administration Workflow

**Classification:** Probable

```text
Admin Dashboard
    │
    ▼
Appointment Management
    │
    ▼
Search / Filter Appointments
    │
    ▼
Open Appointment
    │
    ├──► View Details
    ├──► Change Status
    ├──► Reassign Provider
    ├──► Cancel
    ├──► Reschedule
    ├──► Initiate Refund
    └──► Add Internal Note
              │
              ▼
        Confirm Admin Action
              │
              ▼
        Notify Relevant Parties
              │
              ▼
        Write Audit Log
```

---

## 33. Review Moderation Workflow

**Classification:** Probable

```text
Review Submitted
    │
    ▼
Automated Content Checks
    │
    ├──► Spam
    ├──► Abuse
    ├──► Personal Data
    └──► Restricted Content
    │
    ▼
Moderation Queue
    │
    ▼
Moderator Decision
    │
    ├──► Approve
    ├──► Reject
    ├──► Edit / Redact
    └──► Escalate
    │
    ▼
Update Review Status
    │
    ▼
Notify Reviewer if Required
```

---

## 34. Reporting and Analytics Workflow

**Classification:** Probable

```text
Admin / Authorized User
    │
    ▼
Reports Module
    │
    ▼
Select Report Type
    │
    ├──► Appointments
    ├──► Revenue
    ├──► Payments
    ├──► Refunds
    ├──► Doctors
    ├──► Patients
    ├──► Diagnostics
    ├──► Service Utilization
    └──► Support Performance
    │
    ▼
Set Date Range and Filters
    │
    ▼
Generate Report
    │
    ▼
View Charts and Tables
    │
    ├──► Export CSV
    ├──► Export Excel
    ├──► Export PDF
    └──► Schedule Delivery
```

---

## 35. Role and Permission Management Workflow

**Classification:** Probable

```text
Super Admin Login
    │
    ▼
Roles and Permissions
    │
    ▼
Create / Select Role
    │
    ▼
Assign Module Permissions
    │
    ├──► View
    ├──► Create
    ├──► Edit
    ├──► Delete
    ├──► Approve
    ├──► Export
    └──► Manage
    │
    ▼
Assign Role to User
    │
    ▼
Validate Privilege Conflicts
    │
    ▼
Save
    │
    ▼
Invalidate Permission Cache
    │
    ▼
Write Audit Log
```

---

## 36. Audit Logging Workflow

**Classification:** Probable

```text
Sensitive Action Occurs
    │
    ▼
Capture Event Context
(user, role, IP, device, timestamp)
    │
    ▼
Capture Before and After Values
    │
    ▼
Write Immutable Audit Record
    │
    ▼
Risk Rule Evaluation
    │
    ├──────── Suspicious ─────► Alert Security/Admin
    ▼
Retention and Reporting
```

---

## 37. Search and Filter Workflow

**Classification:** Observed + Probable

```text
User Opens Search
    │
    ▼
Enter Search Term
    │
    ▼
Autocomplete Suggestions
    │
    ▼
Submit Search
    │
    ▼
Normalize Query
    │
    ▼
Search Across Indexed Entities
    │
    ├──► Doctors
    ├──► Hospitals
    ├──► Diagnostics
    ├──► Services
    ├──► Packages
    └──► Content
    │
    ▼
Display Results
    │
    ▼
Apply Filters
    │
    ├──► Specialty
    ├──► Location
    ├──► Fee Range
    ├──► Rating
    ├──► Availability
    ├──► Gender
    └──► Service Type
    │
    ▼
Sort Results
    │
    ├──► Relevance
    ├──► Rating
    ├──► Price
    └──► Availability
    │
    ▼
Open Result
```

---

## 38. Complaint and Dispute Workflow

**Classification:** Probable

```text
Patient Opens Completed Booking
    │
    ▼
Report a Problem
    │
    ▼
Select Complaint Type
    │
    ▼
Enter Description and Evidence
    │
    ▼
Create Dispute Case
    │
    ▼
Support Review
    │
    ▼
Request Provider Response
    │
    ▼
Investigate Booking and Payment Logs
    │
    ▼
Decision
    │
    ├──► No Action
    ├──► Partial Refund
    ├──► Full Refund
    ├──► Service Credit
    └──► Provider Penalty
    │
    ▼
Notify Parties
    │
    ▼
Close Case
```

---

## 39. Account Deactivation Workflow

**Classification:** Probable

```text
User Settings
    │
    ▼
Request Account Deactivation
    │
    ▼
Show Consequences and Retention Policy
    │
    ▼
Re-authenticate User
    │
    ▼
Check Active Bookings / Outstanding Balance
    │
    ├──────── Blocking Issue ─────► Resolve First
    ▼
Confirm Deactivation
    │
    ▼
Disable Login
    │
    ▼
Retain Required Medical / Financial Records
    │
    ▼
Anonymize Optional Personal Data
    │
    ▼
Send Confirmation
```

---

## 40. System Error Handling Workflow

**Classification:** Estimated

```text
User or System Action
    │
    ▼
Error Occurs
    │
    ▼
Classify Error
    │
    ├──► Validation Error
    ├──► Authentication Error
    ├──► Authorization Error
    ├──► Business Rule Error
    ├──► Integration Error
    └──► Server Error
    │
    ▼
Show Safe User Message
    │
    ▼
Log Technical Details
    │
    ▼
Attach Correlation ID
    │
    ▼
Retry Automatically?
    │
    ├──────── Yes ─────► Retry with Backoff
    └──────── No ──────► Escalate / Support
```

---

## 41. High-Level End-to-End Platform Workflow

**Classification:** Observed + Probable

```text
User Visits Platform
    │
    ▼
Discover Healthcare Service
    │
    ├──► Doctor
    ├──► Hospital
    ├──► Diagnostic Test
    ├──► Ambulance
    ├──► Home Care
    └──► Health Package
    │
    ▼
Compare Options
    │
    ▼
View Details
    │
    ▼
Authenticate
    │
    ▼
Select Service Parameters
    │
    ▼
Confirm Patient Information
    │
    ▼
Payment / Pay Later
    │
    ▼
Booking or Order Confirmation
    │
    ▼
Provider Fulfilment
    │
    ▼
Medical Output
(prescription, consultation notes, diagnostic report)
    │
    ▼
Payment Settlement
    │
    ▼
Review / Support / Follow-up
    │
    ▼
History and Analytics
```

---

## 42. Recommended Workflow Status Model

**Classification:** Estimated

### Appointment Statuses

```text
Draft
  ↓
Pending Payment
  ↓
Requested
  ↓
Confirmed
  ↓
Checked In
  ↓
In Consultation
  ↓
Completed

Alternative paths:
Requested → Rejected
Confirmed → Rescheduled
Confirmed → Cancelled
Confirmed → No-show
Pending Payment → Payment Failed / Expired
```

### Diagnostic Order Statuses

```text
Draft
  ↓
Pending Payment
  ↓
Confirmed
  ↓
Sample Collection Scheduled
  ↓
Sample Collected
  ↓
Processing
  ↓
Report Verification
  ↓
Report Published
  ↓
Completed
```

### Ambulance Request Statuses

```text
Requested
  ↓
Provider Assigned
  ↓
Driver Assigned
  ↓
Accepted
  ↓
En Route to Pickup
  ↓
Arrived
  ↓
Patient Onboard
  ↓
En Route to Destination
  ↓
Completed
```

### Payment Statuses

```text
Initiated
  ↓
Pending
  ↓
Authorized
  ↓
Captured
  ↓
Paid

Alternative paths:
Pending → Failed
Pending → Cancelled
Paid → Partially Refunded
Paid → Refunded
```

---

## 43. Workflow Implementation Notes

1. Every workflow should generate a unique transaction, booking, order, or case identifier.
2. Every state change should be timestamped and attributable to a user or system process.
3. Booking, payment, refund, prescription, and medical-record actions should be auditable.
4. Public workflows should support both desktop and mobile layouts.
5. Sensitive workflows should enforce role-based authorization.
6. Payment and notification integrations should be asynchronous where possible.
7. Time slots should use locking or reservation logic to prevent double booking.
8. The platform should preserve the user's intended destination after login.
9. All provider profiles should have verification and publication statuses.
10. All workflows should support clear failure, retry, cancellation, and recovery paths.
