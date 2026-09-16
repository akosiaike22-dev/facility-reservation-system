# Deployment Guide

## Step-by-Step Deployment Instructions

### Phase 1: Supabase Setup (15 minutes)

#### 1. Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Verify your email address

#### 2. Create a New Project
1. Click "New Project"
2. Enter project name: `facility-reservation-system`
3. Enter database password (save this securely)
4. Select region closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for project to be ready

#### 3. Set Up Database Schema
1. Go to **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify success message appears

#### 4. Get API Credentials
1. Go to **Settings** → **API**
2. Copy **Project URL** (looks like: https://xyz.supabase.co)
3. Copy **anon public key** (long string starting with eyJhbGci...)
4. Save both values - you'll need them soon

#### 5. Configure Authentication
1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Go to **URL Configuration**
4. Add your GitHub Pages URL (once deployed) to:
   - Site URL
   - Redirect URLs

### Phase 2: Application Configuration (5 minutes)

#### 1. Update config.js
1. Open `config.js` in your code editor
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```
3. Save the file

#### 2. Test Locally (Optional)
1. Open `index.html` in your browser
2. Try to register a new account
3. Verify you can login
4. Check that the dashboard loads

### Phase 3: GitHub Setup (10 minutes)

#### 1. Create GitHub Repository
1. Go to https://github.com
2. Click **+** → **New repository**
3. Repository name: `facility-reservation-system`
4. Description: `Role-Based Facility Reservation and Approval System`
5. Make it **Public** (required for GitHub Pages)
6. Click **Create repository**

#### 2. Initialize Git and Push
Open your terminal/command prompt in the project directory:

```bash
cd C:\Users\Acer\CascadeProjects\facility-reservation-system
git init
git add .
git commit -m "Initial commit: Facility Reservation System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/facility-reservation-system.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Phase 4: GitHub Pages Deployment (5 minutes)

#### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Pages** in left sidebar
4. Under **Build and deployment** → **Branch**:
   - Select `main` branch
   - Select `/ (root)` folder
5. Click **Save**

#### 2. Wait for Deployment
1. Wait 1-2 minutes
2. Refresh the page
3. You'll see a link like: `https://YOUR_USERNAME.github.io/facility-reservation-system/`
4. Click the link to view your live site

#### 3. Update Supabase Redirect URLs
1. Go back to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Add your GitHub Pages URL to:
   - Site URL
   - Redirect URLs
4. Click **Save**

### Phase 5: Testing and Verification (10 minutes)

#### 1. Create Test Users
Register these accounts to test all roles:

**Administrator Account:**
- Email: admin@test.com
- Password: admin123
- Role: Administrator

**Facility Staff Account:**
- Email: staff@test.com
- Password: staff123
- Role: Facility Staff

**Requester Account:**
- Email: requester@test.com
- Password: requester123
- Role: Requester

#### 2. Test Each Role
Log in as each role and verify:

**Administrator:**
- Can see all sections (Facilities, Reservations, Users, Audit Logs)
- Can add/edit/delete facilities
- Can approve/reject reservations
- Can edit user roles
- Can view audit logs

**Facility Staff:**
- Can see Facilities and Reservations
- Can mark reservations as In Use
- Can complete reservations
- Cannot see Users or Audit Logs sections

**Requester:**
- Can see Facilities and Reservations
- Can submit new reservations
- Can edit/cancel own pending reservations
- Cannot see other users' reservations
- Cannot see Users or Audit Logs sections

#### 3. Run Test Cases
Follow the test cases in `TESTING.md` to verify all functionality:
- TC-B4-01 to TC-B4-10 should all pass

### Phase 6: Submission Preparation (5 minutes)

#### 1. Gather Required Items
Prepare these for submission:

1. **GitHub Repository URL**
   - Format: https://github.com/YOUR_USERNAME/facility-reservation-system

2. **Live GitHub Pages URL**
   - Format: https://YOUR_USERNAME.github.io/facility-reservation-system

3. **Updated ERD**
   - Found in `DOCUMENTATION.md` - Entity Relationship Diagram section

4. **Use Case Diagram**
   - Found in `DOCUMENTATION.md` - Use Case Diagram section

5. **Role-Permission Matrix**
   - Found in `DOCUMENTATION.md` - Role-Permission Matrix section

6. **Reservation Workflow**
   - Found in `DOCUMENTATION.md` - Reservation Workflow Diagram section

7. **Business Rules**
   - Found in `BUSINESS_RULES.md` - All 10 rules documented

8. **Audit Log Screenshot**
   - Login as Administrator
   - Go to Audit Logs section
   - Take a screenshot showing logged actions
   - Save as `audit-log-screenshot.png`

9. **Functional Test Results**
   - Found in `TESTING.md` - All 10 test cases documented

#### 2. Create Screenshots
Take screenshots of:
- Login page
- Dashboard (each role)
- Facilities list
- Reservations list
- Audit logs (admin only)
- A successful reservation submission
- An approval action

#### 3. Final Verification Checklist
- [ ] All files pushed to GitHub
- [ ] GitHub Pages is live and accessible
- [ ] Supabase credentials are correctly configured
- [ ] All three roles can login
- [ ] All business rules are enforced
- [ ] Audit logging is working
- [ ] All test cases pass
- [ ] Documentation is complete

### Troubleshooting

#### Issue: "Invalid API credentials"
**Solution**: Double-check your SUPABASE_URL and SUPABASE_ANON_KEY in config.js

#### Issue: "Login not working"
**Solution**: 
- Check Supabase Auth is enabled
- Verify email provider is active
- Check redirect URLs in Supabase settings

#### Issue: "GitHub Pages not loading"
**Solution**:
- Wait 2-3 minutes after pushing
- Check repository is public
- Verify Pages is enabled in Settings
- Check the Actions tab for build errors

#### Issue: "RLS policy violations"
**Solution**:
- Ensure SQL schema was run successfully
- Check that user_profiles table has your user
- Verify role is set correctly in user_profiles

#### Issue: "Overlapping reservations not blocked"
**Solution**:
- Ensure the trigger function was created
- Check that the function is working in SQL Editor
- Verify the status check includes 'approved', 'scheduled', 'in_use'

### Support Resources

- Supabase Documentation: https://supabase.com/docs
- GitHub Pages Documentation: https://docs.github.com/pages
- Project README: `README.md`
- Business Rules: `BUSINESS_RULES.md`
- Testing Guide: `TESTING.md`
- System Documentation: `DOCUMENTATION.md`

### Time Estimate

- Supabase Setup: 15 minutes
- App Configuration: 5 minutes
- GitHub Setup: 10 minutes
- GitHub Pages Deployment: 5 minutes
- Testing: 10 minutes
- Submission Prep: 5 minutes

**Total: ~50 minutes**

### Success Criteria

You'll know deployment is successful when:
1. ✅ GitHub Pages URL loads in browser
2. ✅ You can register and login
3. ✅ All three roles work correctly
4. ✅ Reservations can be submitted and approved
5. ✅ Audit logs are being created
6. ✅ All business rules are enforced
7. ✅ All test cases pass
