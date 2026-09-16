# System Documentation

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐
│  user_profiles  │       │    facilities   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ email           │       │ type            │
│ role            │       │ capacity        │
│ created_at      │       │ location        │
│ updated_at      │       │ status          │
└────────┬────────┘       │ condition       │
         │                │ created_at      │
         │                │ updated_at      │
         │                └────────┬────────┘
         │                         │
         │                         │
         │                ┌────────▼────────┐
         │                │   reservations  │
         │                ├─────────────────┤
         │                │ id (PK)         │
         │                │ facility_id (FK)│
         │                │ user_id (FK)    │
         │                │ start_time      │
         │                │ end_time        │
         │                │ purpose         │
         │                │ status          │
         │                │ rejection_reason│
         │                │ created_at      │
         │                │ updated_at      │
         │                └────────┬────────┘
         │                         │
         │                         │
         │                ┌────────▼────────┐
         │                │   audit_logs    │
         │                ├─────────────────┤
         │                │ id (PK)         │
         │                │ action          │
         │                │ table_name      │
         │                │ record_id       │
         │                │ user_id (FK)    │
         │                │ user_name       │
         │                │ details         │
         │                │ created_at      │
         │                └─────────────────┘
```

### Table Relationships

1. **user_profiles** → **reservations**
   - One user can have many reservations
   - Relationship: 1:N
   - Foreign Key: reservations.user_id → user_profiles.id

2. **facilities** → **reservations**
   - One facility can have many reservations
   - Relationship: 1:N
   - Foreign Key: reservations.facility_id → facilities.id

3. **user_profiles** → **audit_logs**
   - One user can have many audit log entries
   - Relationship: 1:N
   - Foreign Key: audit_logs.user_id → user_profiles.id

### Entity Details

#### user_profiles
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK | References auth.users |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email |
| role | VARCHAR(50) | NOT NULL, CHECK | admin, facility_staff, requester |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

#### facilities
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Facility name |
| type | VARCHAR(100) | NOT NULL, CHECK | conference_room, laboratory, gym, auditorium, classroom |
| capacity | INTEGER | NOT NULL, CHECK > 0 | Maximum occupancy |
| location | VARCHAR(255) | NOT NULL | Physical location |
| status | VARCHAR(50) | NOT NULL, CHECK | active, maintenance, inactive |
| condition | VARCHAR(50) | NOT NULL, CHECK | excellent, good, fair, poor |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

#### reservations
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| facility_id | UUID | FK, NOT NULL | References facilities |
| user_id | UUID | FK, NOT NULL | References user_profiles |
| start_time | TIMESTAMP | NOT NULL | Reservation start |
| end_time | TIMESTAMP | NOT NULL | Reservation end |
| purpose | TEXT | NOT NULL | Reservation purpose |
| status | VARCHAR(50) | NOT NULL, CHECK | pending, approved, rejected, scheduled, in_use, completed, cancelled |
| rejection_reason | TEXT | NULL | Reason for rejection |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

#### audit_logs
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| action | VARCHAR(100) | NOT NULL | Action performed |
| table_name | VARCHAR(100) | NOT NULL | Table affected |
| record_id | UUID | NULL | Record affected |
| user_id | UUID | FK, NULL | User who performed action |
| user_name | VARCHAR(255) | NULL | Name of user |
| details | TEXT | NULL | Action details |
| created_at | TIMESTAMP | DEFAULT NOW() | Timestamp of action |

---

## Use Case Diagram

### Actors
1. **Administrator** - Manages the entire system
2. **Facility Staff** - Manages facility operations
3. **Requester** - Submits and manages reservations
4. **System** - Automated processes

### Use Cases

#### Administrator Use Cases
- **UC-A01**: Login to System
- **UC-A02**: Manage Facilities
  - Add new facility
  - Edit facility details
  - Delete facility
  - Update facility status/condition
- **UC-A03**: Manage Users
  - View all users
  - Edit user roles
- **UC-A04**: Manage Reservations
  - View all reservations
  - Approve pending reservations
  - Reject pending reservations
  - View reservation history
- **UC-A05**: View Audit Logs
  - View all audit entries
  - Filter by action type
  - Filter by date range
- **UC-A06**: View Reports
  - Facility utilization report
  - User activity report

#### Facility Staff Use Cases
- **UC-F01**: Login to System
- **UC-F02**: View Reservations
  - View all reservations
  - Filter by status
  - Filter by facility
- **UC-F03**: Manage Reservation Status
  - Mark reservation as "In Use"
  - Complete reservation
- **UC-F04**: Create Service Requests
  - Report facility issues
  - Request maintenance
- **UC-F05**: Update Facility Condition
  - Update condition after use
  - Report damages

#### Requester Use Cases
- **UC-R01**: Login to System
- **UC-R02**: Register Account
  - Provide personal information
  - Select role (requester)
- **UC-R03**: View Facilities
  - Browse available facilities
  - View facility details
  - Check facility status
- **UC-R04**: Submit Reservation
  - Select facility
  - Specify time slot
  - Provide purpose
- **UC-R05**: Manage Own Reservations
  - View reservation status
  - Edit pending reservations
  - Cancel pending reservations
  - View reservation history
- **UC-R06**: View Profile
  - View personal information
  - Update profile details

### Use Case Relationships

```
                    ┌──────────────┐
                    │   System     │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼──────┐    ┌────▼────┐
    │ Requester│      │Facility Staff│    │Administrator│
    └────┬────┘      └─────┬──────┘    └────┬────┘
         │                 │                 │
         │                 │                 │
    ┌────▼─────────────────▼─────────────────▼────┐
    │              Common Use Cases                │
    │  - Login to System (UC-A01, UC-F01, UC-R01)   │
    └──────────────────────────────────────────────┘

    Requester Specific:
    - Register Account (UC-R02)
    - View Facilities (UC-R03)
    - Submit Reservation (UC-R04)
    - Manage Own Reservations (UC-R05)
    - View Profile (UC-R06)

    Facility Staff Specific:
    - View Reservations (UC-F02)
    - Manage Reservation Status (UC-F03)
    - Create Service Requests (UC-F04)
    - Update Facility Condition (UC-F05)

    Administrator Specific:
    - Manage Facilities (UC-A02)
    - Manage Users (UC-A03)
    - Manage Reservations (UC-A04)
    - View Audit Logs (UC-A05)
    - View Reports (UC-A06)
```

---

## Role-Permission Matrix

| Function | Administrator | Facility Staff | Requester |
|----------|--------------|----------------|------------|
| **Authentication** |
| Login | ✅ | ✅ | ✅ |
| Register | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |
| **Facility Management** |
| View all facilities | ✅ | ✅ | ✅ |
| Add facility | ✅ | ❌ | ❌ |
| Edit facility | ✅ | ❌ | ❌ |
| Delete facility | ✅ | ❌ | ❌ |
| Update facility status | ✅ | ✅ | ❌ |
| Update facility condition | ✅ | ✅ | ❌ |
| **User Management** |
| View all users | ✅ | ❌ | ❌ |
| Edit user roles | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| **Reservation Management** |
| View all reservations | ✅ | ✅ | ❌ |
| View own reservations | ✅ | ✅ | ✅ |
| Submit reservation | ✅ | ✅ | ✅ |
| Edit own pending reservation | ✅ | ❌ | ✅ |
| Cancel own pending reservation | ✅ | ❌ | ✅ |
| Approve reservation | ✅ | ❌ | ❌ |
| Reject reservation | ✅ | ❌ | ❌ |
| Mark as In Use | ✅ | ✅ | ❌ |
| Complete reservation | ✅ | ✅ | ❌ |
| **Audit & Reporting** |
| View audit logs | ✅ | ❌ | ❌ |
| View reports | ✅ | ❌ | ❌ |
| View service concerns | ✅ | ✅ | ❌ |

### Legend
- ✅ = Permitted
- ❌ = Not permitted

### Permission Levels

**Administrator** - Full system access
- Can perform all functions
- Can manage all users and facilities
- Can approve/reject reservations
- Can view audit logs and reports

**Facility Staff** - Operational access
- Can view all facilities and reservations
- Can manage reservation status (In Use, Complete)
- Can update facility condition
- Can create service requests
- Cannot approve/reject reservations
- Cannot manage users

**Requester** - Basic access
- Can view facilities
- Can submit and manage own reservations
- Can only edit/cancel pending reservations
- Cannot view other users' reservations
- Cannot manage facilities or users

---

## Reservation Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    RESERVATION WORKFLOW                      │
└─────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │ SUBMIT   │  Requester submits reservation
    └─────┬────┘
          │
          ▼
    ┌──────────┐
    │ PENDING  │  Initial status after submission
    └─────┬────┘
          │
          ▼
    ┌──────────────────┐
    │ ADMIN REVIEW     │  Administrator reviews request
    └────┬─────────┬───┘
         │         │
    ┌────▼──┐  ┌───▼────┐
    │APPROVE│  │ REJECT │
    └───┬───┘  └───┬───┘
        │          │
        ▼          ▼
  ┌─────────┐  ┌──────────┐
  │APPROVED │  │ REJECTED │  ← Cannot be changed to Scheduled
  └────┬────┘  └──────────┘
       │
       ▼
  ┌─────────┐
  │SCHEDULED│  Time slot reserved
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │ IN USE  │  Facility currently being used
  └────┬────┘
       │
       ▼
  ┌──────────┐
  │ COMPLETED│  Reservation finished
  └──────────┘

    ┌──────────┐
    │ CANCELLED│  Requester cancels (only if Pending)
    └──────────┘
```

### Workflow Rules

1. **Submission Phase**
   - Any user can submit a reservation
   - Initial status is always "pending"
   - System validates: active facility, no overlap, start < end

2. **Review Phase**
   - Only Administrator can approve/reject
   - Approval changes status to "approved"
   - Rejection requires reason and changes status to "rejected"
   - Rejected reservations cannot be reactivated

3. **Scheduling Phase**
   - Approved reservations automatically reserve time slot
   - Status may show as "scheduled" before actual use
   - Overlapping check prevents conflicts

4. **Usage Phase**
   - Only Facility Staff can mark as "In Use"
   - Status changes when facility is occupied
   - Time slot is locked during this phase

5. **Completion Phase**
   - Only Facility Staff can complete reservation
   - Status changes to "completed"
   - Completed reservations cannot be edited
   - Facility condition may be updated

6. **Cancellation**
   - Only Requester can cancel own reservations
   - Only "pending" reservations can be cancelled
   - Cancelled reservations cannot be reactivated

### Status Transition Table

| Current Status | Can Transition To | Who Can Change |
|----------------|-------------------|----------------|
| pending | approved, rejected, cancelled | Admin (approve/reject), Requester (cancel) |
| approved | scheduled, in_use | System (auto), Facility Staff |
| rejected | - | None (terminal state) |
| scheduled | in_use | Facility Staff |
| in_use | completed | Facility Staff |
| completed | - | None (terminal state) |
| cancelled | - | None (terminal state) |

### Business Rules in Workflow

- **BR-B4-01**: Only active facilities can be reserved (checked at submission)
- **BR-B4-02**: Start must precede end time (checked at submission/edit)
- **BR-B4-03**: No overlapping approved schedules (checked at submission/approval)
- **BR-B4-04**: Only Admin can approve (enforced in workflow)
- **BR-B4-05**: Rejected cannot become scheduled (enforced in workflow)
- **BR-B4-06**: Approved reservations reserve time slot (automatic)
- **BR-B4-07**: Completed cannot be edited (enforced in workflow)
- **BR-B4-08**: Maintenance facilities cannot be reserved (checked at submission)
- **BR-B4-09**: Requesters edit only own pending (enforced in workflow)
- **BR-B4-10**: All changes logged (automatic audit logging)
