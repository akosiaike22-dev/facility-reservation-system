# Business Rules Documentation

## Facility Reservation System - Business Rules

### BR-B4-01: Only active facilities may be reserved
**Description**: Users can only submit reservation requests for facilities that have an "active" status.

**Implementation**:
- Frontend validation in `handleAddReservation()` function
- Database check: `facilities.status = 'active'`
- Error message: "Only active facilities may be reserved (BR-B4-01, BR-B4-08)"

**Location**: `app.js` line ~430

---

### BR-B4-02: Reservation start must precede end time
**Description**: The start time of a reservation must always be before the end time.

**Implementation**:
- Frontend validation: `new Date(startTime) >= new Date(endTime)`
- Database constraint: `CONSTRAINT check_end_after_start CHECK (end_time > start_time)`
- Error message: "Start time must be before end time"

**Location**: `app.js` line ~425, `supabase-schema.sql` line ~45

---

### BR-B4-03: Overlapping approved schedules are prohibited
**Description**: Two approved reservations for the same facility cannot have overlapping time slots.

**Implementation**:
- Frontend function: `checkScheduleOverlap()` checks against approved/scheduled/in_use reservations
- Database function: `check_reservation_overlap()` with trigger
- Database trigger: `prevent_overlapping_reservations()`
- Error message: "Overlapping approved schedules are prohibited (BR-B4-03)"

**Location**: `app.js` line ~440, `supabase-schema.sql` line ~120-140

---

### BR-B4-04: Only Administrator may approve reservations
**Description**: Only users with the "admin" role can approve reservation requests.

**Implementation**:
- Role check: `if (currentRole !== 'admin')`
- Error message: "Only Administrator may approve reservations (BR-B4-04)"
- RLS policy restricts updates to admin role

**Location**: `app.js` line ~475

---

### BR-B4-05: Rejected reservations cannot become Scheduled
**Description**: Once a reservation is rejected, it cannot be changed to scheduled or approved status.

**Implementation**:
- Status check before approval: `if (reservation.status === 'rejected')`
- Error message: "Rejected reservations cannot become Scheduled (BR-B4-05)"
- Database check constraint on status transitions

**Location**: `app.js` line ~485

---

### BR-B4-06: Approved reservations reserve the time slot
**Description**: When a reservation is approved, the time slot is reserved and cannot be used by other reservations.

**Implementation**:
- Overlap check includes 'approved' status
- Database function checks status IN ('approved', 'scheduled', 'in_use')
- Time slot becomes unavailable for new reservations

**Location**: `supabase-schema.sql` line ~125

---

### BR-B4-07: Completed reservations cannot be edited
**Description**: Reservations with "completed" status cannot be modified by any user.

**Implementation**:
- Edit function checks status before allowing modifications
- Only 'pending' status can be edited by requesters
- RLS policy prevents updates on completed reservations

**Location**: `app.js` line ~630

---

### BR-B4-08: Facilities under Maintenance cannot be reserved
**Description**: Facilities with "maintenance" status cannot be reserved by users.

**Implementation**:
- Combined with BR-B4-01: checks status != 'active'
- Facilities with 'maintenance' or 'inactive' status are blocked
- Error message references both rules

**Location**: `app.js` line ~430

---

### BR-B4-09: Requesters may modify only their own Pending requests
**Description**: Users with "requester" role can only edit reservations they created and only if the status is "pending".

**Implementation**:
- User ID check: `reservation.user_id !== currentUser.id`
- Status check: `reservation.status !== 'pending'`
- Error messages for both conditions
- RLS policy: `auth.uid() = user_id AND status = 'pending'`

**Location**: `app.js` line ~620, `supabase-schema.sql` line ~95

---

### BR-B4-10: Approval and status changes must be logged
**Description**: All changes to reservation status (approval, rejection, cancellation, etc.) must be recorded in the audit log.

**Implementation**:
- `logAuditAction()` function called after every status change
- Logged actions: RESERVATION_SUBMIT, RESERVATION_APPROVE, RESERVATION_REJECT, RESERVATION_CANCEL, RESERVATION_IN_USE, RESERVATION_COMPLETE, RESERVATION_UPDATE
- Audit log includes: action, table, record ID, user, timestamp, details

**Location**: `app.js` line ~680, throughout the file

---

## Enforcement Summary

| Rule | Frontend Validation | Database Constraint | RLS Policy | Status |
|------|-------------------|-------------------|------------|--------|
| BR-B4-01 | ✅ | ✅ | ✅ | Implemented |
| BR-B4-02 | ✅ | ✅ | - | Implemented |
| BR-B4-03 | ✅ | ✅ | ✅ | Implemented |
| BR-B4-04 | ✅ | ✅ | ✅ | Implemented |
| BR-B4-05 | ✅ | ✅ | ✅ | Implemented |
| BR-B4-06 | ✅ | ✅ | ✅ | Implemented |
| BR-B4-07 | ✅ | ✅ | ✅ | Implemented |
| BR-B4-08 | ✅ | ✅ | ✅ | Implemented |
| BR-B4-09 | ✅ | ✅ | ✅ | Implemented |
| BR-B4-10 | ✅ | ✅ | ✅ | Implemented |

All business rules are enforced at multiple levels for maximum security and data integrity.
