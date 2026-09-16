# Functional Testing Results

## Test Cases for Facility Reservation System

### TC-B4-01: Requester submits reservation
**Scenario**: A requester submits a new reservation request.

**Steps**:
1. Login as a user with "requester" role
2. Navigate to Reservations section
3. Click "New Reservation" button
4. Select an active facility
5. Enter valid start and end times
6. Enter purpose
7. Submit the form

**Expected Result**: Reservation is saved with "pending" status.

**Actual Result**: ✅ PASS - Reservation created with status = 'pending'

**Evidence**: 
- Reservation appears in reservations list
- Status badge shows "pending" (orange)
- Audit log shows "RESERVATION_SUBMIT" action

---

### TC-B4-02: Submit overlapping schedule
**Scenario**: Attempt to submit a reservation that overlaps with an existing approved reservation.

**Steps**:
1. Ensure there is an approved reservation for a facility
2. Login as a requester
3. Try to submit a reservation for the same facility with overlapping time
4. Submit the form

**Expected Result**: Conflict is detected and the reservation is blocked.

**Actual Result**: ✅ PASS - Error message displayed: "Overlapping approved schedules are prohibited (BR-B4-03)"

**Evidence**:
- Alert shows error message
- Reservation is not created
- Database trigger prevents insertion

---

### TC-B4-03: Administrator approves request
**Scenario**: Administrator approves a pending reservation request.

**Steps**:
1. Login as a user with "admin" role
2. Navigate to Reservations section
3. Find a reservation with "pending" status
4. Click "Approve" button

**Expected Result**: Reservation status becomes "approved".

**Actual Result**: ✅ PASS - Status changes to 'approved'

**Evidence**:
- Status badge changes to green "approved"
- Audit log shows "RESERVATION_APPROVE" action
- Time slot is now reserved

---

### TC-B4-04: Administrator rejects request
**Scenario**: Administrator rejects a pending reservation request.

**Steps**:
1. Login as administrator
2. Navigate to Reservations section
3. Find a pending reservation
4. Click "Reject" button
5. Enter rejection reason

**Expected Result**: Reservation status becomes "rejected".

**Actual Result**: ✅ PASS - Status changes to 'rejected' with reason

**Evidence**:
- Status badge shows red "rejected"
- Rejection reason is stored
- Audit log shows "RESERVATION_REJECT" action

---

### TC-B4-05: Staff marks facility In Use
**Scenario**: Facility staff marks an approved reservation as "In Use".

**Steps**:
1. Login as a user with "facility_staff" role
2. Navigate to Reservations section
3. Find an approved or scheduled reservation
4. Click "Mark In Use" button

**Expected Result**: Reservation status is updated to "in_use".

**Actual Result**: ✅ PASS - Status changes to 'in_use'

**Evidence**:
- Status badge shows purple "in use"
- Audit log shows "RESERVATION_IN_USE" action
- Only facility staff can perform this action

---

### TC-B4-06: Staff completes reservation
**Scenario**: Facility staff marks a reservation as "completed".

**Steps**:
1. Login as facility staff
2. Navigate to Reservations section
3. Find a reservation with "in_use" status
4. Click "Complete" button

**Expected Result**: Reservation status becomes "completed".

**Actual Result**: ✅ PASS - Status changes to 'completed'

**Evidence**:
- Status badge shows teal "completed"
- Audit log shows "RESERVATION_COMPLETE" action
- Reservation cannot be edited after completion

---

### TC-B4-07: Requester edits another user request
**Scenario**: A requester attempts to edit a reservation created by another user.

**Steps**:
1. Login as requester
2. Navigate to Reservations section
3. Find a reservation created by another user
4. Attempt to click "Edit" button

**Expected Result**: Edit action is blocked.

**Actual Result**: ✅ PASS - Edit button not shown for other users' reservations

**Evidence**:
- Only own reservations show edit button
- Attempting direct edit via API is blocked by RLS
- Error: "You can only edit your own reservations (BR-B4-07)"

---

### TC-B4-08: Reserve facility under maintenance
**Scenario**: Attempt to reserve a facility with "maintenance" status.

**Steps**:
1. Ensure a facility has "maintenance" status
2. Login as requester
3. Try to submit a reservation for that facility

**Expected Result**: Reservation is blocked.

**Actual Result**: ✅ PASS - Error message: "Only active facilities may be reserved (BR-B4-01, BR-B4-08)"

**Evidence**:
- Maintenance facilities don't appear in dropdown
- If manually selected, validation fails
- Database constraint prevents insertion

---

### TC-B4-09: Check audit log
**Scenario**: Administrator views the audit log to verify actions are being recorded.

**Steps**:
1. Login as administrator
2. Navigate to Audit Logs section
3. Review the log entries

**Expected Result**: Approval and status change logs are visible.

**Actual Result**: ✅ PASS - All critical actions are logged

**Evidence**:
- Audit log shows timestamp, action, user, table, and details
- Actions logged: USER_REGISTER, FACILITY_CREATE, RESERVATION_SUBMIT, RESERVATION_APPROVE, RESERVATION_REJECT, RESERVATION_CANCEL, RESERVATION_IN_USE, RESERVATION_COMPLETE, RESERVATION_UPDATE
- Logs are ordered by most recent first

---

### TC-B4-10: Open protected page without login
**Scenario**: Attempt to access protected pages without being logged in.

**Steps**:
1. Logout from the system
2. Try to directly access dashboard URLs
3. Try to access admin-only sections

**Expected Result**: Access is denied and user is redirected to login.

**Actual Result**: ✅ PASS - Redirect to login page

**Evidence**:
- Unauthenticated users see login page
- Dashboard is hidden without valid session
- Supabase auth check redirects to login
- RLS policies prevent data access

---

## Test Summary

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TC-B4-01 | Requester submits reservation | ✅ PASS | Status = pending |
| TC-B4-02 | Submit overlapping schedule | ✅ PASS | Conflict detected |
| TC-B4-03 | Administrator approves request | ✅ PASS | Status = approved |
| TC-B4-04 | Administrator rejects request | ✅ PASS | Status = rejected |
| TC-B4-05 | Staff marks facility In Use | ✅ PASS | Status = in_use |
| TC-B4-06 | Staff completes reservation | ✅ PASS | Status = completed |
| TC-B4-07 | Requester edits another user request | ✅ PASS | Blocked |
| TC-B4-08 | Reserve facility under maintenance | ✅ PASS | Blocked |
| TC-B4-09 | Check audit log | ✅ PASS | All actions logged |
| TC-B4-10 | Open protected page without login | ✅ PASS | Access denied |

**Overall Result**: 10/10 tests passed ✅

## Additional Testing Notes

### Security Testing
- ✅ SQL injection prevention (Supabase client)
- ✅ XSS prevention (input sanitization)
- ✅ CSRF protection (Supabase auth tokens)
- ✅ Role-based access control (RLS policies)

### Performance Testing
- ✅ Database queries optimized with indexes
- ✅ Pagination for audit logs (limit 100)
- ✅ Efficient overlap checking algorithm

### Cross-Browser Testing
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (responsive design)

### Edge Cases Tested
- ✅ Simultaneous reservation submissions
- ✅ Time zone handling
- ✅ Very long reservation periods
- ✅ Rapid status changes
- ✅ Network timeout handling
