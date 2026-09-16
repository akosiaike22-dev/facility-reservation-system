# Facility Reservation and Approval System

A role-based facility reservation system with approval workflow, conflict checking, and audit logging.

## Features

- **Role-Based Access Control**: Administrator, Facility Staff, and Requester roles
- **Reservation Workflow**: Pending → Approved/Scheduled → In Use → Completed
- **Business Rules Enforcement**: All 10 business rules implemented
- **Conflict Detection**: Prevents overlapping approved schedules
- **Audit Logging**: Tracks all critical actions
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL database + Authentication)
- **Hosting**: GitHub Pages

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (2-3 minutes)

### 2. Set Up Database

1. Go to the Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL script
5. This will create all tables, indexes, functions, triggers, and sample data

### 3. Configure Application

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Open `config.js` in this project
4. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```

### 4. Deploy to GitHub Pages

1. Create a GitHub repository
2. Push all files to the repository
3. Go to repository **Settings** → **Pages**
4. Select **main** branch and save
5. Your site will be live at `https://yourusername.github.io/repository-name`

### 5. Create Initial Users

Register users with different roles:
- **Administrator**: Full access to all features
- **Facility Staff**: Can view reservations, mark in use, complete
- **Requester**: Can submit and manage own reservations

## Business Rules Implementation

| ID | Rule | Status |
|----|------|--------|
| BR-B4-01 | Only active facilities may be reserved | ✅ Implemented |
| BR-B4-02 | Reservation start must precede end time | ✅ Implemented |
| BR-B4-03 | Overlapping approved schedules are prohibited | ✅ Implemented |
| BR-B4-04 | Only Administrator may approve reservations | ✅ Implemented |
| BR-B4-05 | Rejected reservations cannot become Scheduled | ✅ Implemented |
| BR-B4-06 | Approved reservations reserve the time slot | ✅ Implemented |
| BR-B4-07 | Completed reservations cannot be edited | ✅ Implemented |
| BR-B4-08 | Facilities under Maintenance cannot be reserved | ✅ Implemented |
| BR-B4-09 | Requesters may modify only their own Pending requests | ✅ Implemented |
| BR-B4-10 | Approval and status changes must be logged | ✅ Implemented |

## Role Permissions

### Administrator
- Manage facilities (add, edit, delete)
- Manage users (view, edit roles)
- Approve/reject reservations
- View all reservations
- View audit logs
- View service concerns and reports

### Facility Staff
- View all reservations
- Mark reservations as "In Use"
- Complete reservations
- Create service requests
- Update facility condition

### Requester
- View facilities
- Submit reservation requests
- View own reservation status
- Cancel own pending requests
- Edit own pending requests
- View reservation history

## Reservation Workflow

```
Submitted
    ↓
Pending
    ↓
Administrator Review
    ↓
Approved / Rejected
    ↓
If Approved → Scheduled → In Use → Completed
```

### Status Values
- `pending`: Initial status after submission
- `approved`: Approved by administrator
- `rejected`: Rejected by administrator
- `scheduled`: Time slot reserved
- `in_use`: Facility currently in use
- `completed`: Reservation finished
- `cancelled`: Cancelled by requester

## Testing

Test cases are documented in `TESTING.md`. All 10 test cases should pass:
- TC-B4-01 to TC-B4-10

## File Structure

```
facility-reservation-system/
├── index.html              # Main HTML file
├── styles.css              # Styling
├── config.js               # Supabase configuration
├── app.js                  # Application logic
├── supabase-schema.sql     # Database schema
├── README.md               # This file
├── TESTING.md              # Test cases
├── DOCUMENTATION.md        # ERD, Use Case, Workflow diagrams
└── BUSINESS_RULES.md       # Detailed business rules
```

## Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Audit logging for all critical actions
- Input validation
- SQL injection prevention (via Supabase client)

## Troubleshooting

### Login Issues
- Ensure Supabase credentials are correct in `config.js`
- Check that user exists in `user_profiles` table
- Verify email is confirmed in Supabase Auth

### Reservation Issues
- Check facility status (must be 'active')
- Verify no overlapping reservations exist
- Ensure start time is before end time

### Permission Issues
- Verify user role in `user_profiles` table
- Check RLS policies in Supabase
- Ensure user is logged in

## License

This project is created for educational purposes.
