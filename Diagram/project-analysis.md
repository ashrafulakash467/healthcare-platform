# Project Analysis

## 1. System Overview

This is a healthcare platform built around a Laravel API. The API supports multiple portals and roles:

- Patient
- Doctor
- Admin
- Hospital

The platform is centered on healthcare service discovery and booking, especially doctor appointments.

## 2. Main Modules Found in the Backend

### Authentication

- `patient/login`
- `patient/register`
- `doctor/login`
- `doctor/register`
- `admin/login`
- Password reset flows

### Doctor Discovery

- Public search
- Public doctor profile view
- Doctor image endpoint

### Appointment Management

- Booking options
- Available dates
- Available slots
- Book appointment
- Payment for an appointment
- Cancel appointment
- Reschedule appointment
- Personal appointment history

### Medical Records

- Clinical notes
- Prescriptions
- Patient and doctor record history

### Administration

- Doctor verification
- User management
- Hospital listing
- Doctor CRUD for admin

### Dashboards

- Patient dashboard
- Doctor dashboard
- Hospital dashboard
- Admin dashboard

## 3. Core Business Flow

The most important end-to-end process is:

1. Patient searches a doctor.
2. Patient opens the doctor profile.
3. Patient chooses a clinic, date, and time slot.
4. API checks slot availability.
5. Appointment is created and the slot is reserved.
6. Payment is recorded if needed.
7. Doctor completes the consultation.
8. Doctor adds notes and prescription.
9. Patient can view the appointment and medical records.

## 4. Important Actors

- Patient initiates the booking and follows up on the appointment.
- Frontend presents search, booking, and dashboard screens.
- API validates business rules and writes records.
- Database stores users, doctors, hospitals, slots, appointments, payments, and records.
- Doctor completes consultation and clinical documentation.
- Admin verifies doctors and manages platform data.

## 5. Best Diagram Scope

For a project report, the clearest diagrams are:

- Activity Diagram for the appointment lifecycle
- Swimlane Diagram for responsibilities across actors

