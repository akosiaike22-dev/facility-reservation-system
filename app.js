// Global State
let currentUser = null;
let currentRole = null;

// Get Supabase client from window
const supabase = window.supabase;

// DOM Elements
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check Authentication
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        await loadUserProfile(session.user.id);
        showDashboard();
    } else {
        showLogin();
    }
}

// Load User Profile with Role
async function loadUserProfile(userId) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (data) {
        currentUser = data;
        currentRole = data.role;
        updateUserDisplay();
    }
}

// Update User Display
function updateUserDisplay() {
    const userDisplay = document.getElementById('user-display');
    userDisplay.textContent = `${currentUser.name} (${currentRole})`;
    
    // Show/hide admin-only elements
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        if (currentRole === 'admin') {
            el.classList.add('show');
            if (el.classList.contains('admin-only')) {
                el.style.display = el.tagName === 'BUTTON' ? 'inline-block' : 'block';
            }
        } else {
            el.classList.remove('show');
            el.style.display = 'none';
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener attached');
    }
    
    // Register Form
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('Register form listener attached');
    }
    
    // Show Register
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });
    
    // Show Login
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
        });
    });
    
    // Modal Close
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Add Facility
    document.getElementById('add-facility-btn').addEventListener('click', showAddFacilityModal);
    
    // Add Reservation
    document.getElementById('add-reservation-btn').addEventListener('click', showAddReservationModal);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        await loadUserProfile(data.user.id);
        showDashboard();
        showAlert('Login successful!', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (authError) throw authError;
        
        // Create user profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                name,
                email,
                role
            });
        
        if (profileError) throw profileError;
        
        // Log registration
        await logAuditAction('USER_REGISTER', 'user_profiles', authData.user.id, 
            `User registered with role: ${role}`);
        
        showAlert('Registration successful! Please login.', 'success');
        showLogin();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Handle Logout
async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    currentRole = null;
    showLogin();
}

// Show Pages
function showLogin() {
    loginPage.classList.remove('hidden');
    registerPage.classList.add('hidden');
    dashboardPage.classList.add('hidden');
}

function showRegister() {
    loginPage.classList.add('hidden');
    registerPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
}

function showDashboard() {
    loginPage.classList.add('hidden');
    registerPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    
    loadFacilities();
    loadReservations();
    
    if (currentRole === 'admin') {
        loadUsers();
        loadAuditLogs();
    }
}

// Show Section
function showSection(section) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load data based on section
    switch(section) {
        case 'facilities':
            loadFacilities();
            break;
        case 'reservations':
            loadReservations();
            break;
        case 'users':
            if (currentRole === 'admin') loadUsers();
            break;
        case 'audit-logs':
            if (currentRole === 'admin') loadAuditLogs();
            break;
    }
}

// Load Facilities
async function loadFacilities() {
    const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');
    
    if (error) {
        showAlert(error.message, 'error');
        return;
    }
    
    const facilitiesList = document.getElementById('facilities-list');
    facilitiesList.innerHTML = '';
    
    data.forEach(facility => {
        const statusClass = facility.status === 'active' ? 'status-active' : 
                           facility.status === 'maintenance' ? 'status-maintenance' : 'status-inactive';
        
        const card = document.createElement('div');
        card.className = 'facility-card';
        card.innerHTML = `
            <h3>${facility.name}</h3>
            <p><strong>Type:</strong> ${facility.type}</p>
            <p><strong>Capacity:</strong> ${facility.capacity}</p>
            <p><strong>Location:</strong> ${facility.location}</p>
            <p><strong>Status:</strong> <span class="status ${statusClass}">${facility.status}</span></p>
            <p><strong>Condition:</strong> ${facility.condition}</p>
            <div class="actions">
                ${currentRole === 'admin' ? `
                    <button class="btn btn-secondary" onclick="editFacility('${facility.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteFacility('${facility.id}')">Delete</button>
                ` : ''}
            </div>
        `;
        facilitiesList.appendChild(card);
    });
}

// Load Reservations
async function loadReservations() {
    let query = supabase
        .from('reservations')
        .select(`
            *,
            facilities(name, location),
            user_profiles(name, email)
        `)
        .order('created_at', { ascending: false });
    
    // Requesters can only see their own reservations
    if (currentRole === 'requester') {
        query = query.eq('user_id', currentUser.id);
    }
    
    const { data, error } = await query;
    
    if (error) {
        showAlert(error.message, 'error');
        return;
    }
    
    const reservationsList = document.getElementById('reservations-list');
    reservationsList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Facility</th>
                    <th>User</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    
    const tbody = reservationsList.querySelector('tbody');
    
    data.forEach(reservation => {
        const statusClass = `status-${reservation.status.replace('_', '-')}`;
        const row = document.createElement('tr');
        
        let actions = '';
        
        // Admin actions
        if (currentRole === 'admin') {
            if (reservation.status === 'pending') {
                actions += `
                    <button class="btn btn-success" onclick="approveReservation('${reservation.id}')">Approve</button>
                    <button class="btn btn-danger" onclick="rejectReservation('${reservation.id}')">Reject</button>
                `;
            }
        }
        
        // Facility Staff actions
        if (currentRole === 'facility_staff') {
            if (reservation.status === 'approved' || reservation.status === 'scheduled') {
                actions += `<button class="btn btn-warning" onclick="markInUse('${reservation.id}')">Mark In Use</button>`;
            }
            if (reservation.status === 'in_use') {
                actions += `<button class="btn btn-success" onclick="completeReservation('${reservation.id}')">Complete</button>`;
            }
        }
        
        // Requester actions
        if (currentRole === 'requester' && reservation.user_id === currentUser.id) {
            if (reservation.status === 'pending') {
                actions += `
                    <button class="btn btn-secondary" onclick="editReservation('${reservation.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="cancelReservation('${reservation.id}')">Cancel</button>
                `;
            }
        }
        
        row.innerHTML = `
            <td>${reservation.facilities.name}</td>
            <td>${reservation.user_profiles.name}</td>
            <td>${new Date(reservation.start_time).toLocaleString()}</td>
            <td>${new Date(reservation.end_time).toLocaleString()}</td>
            <td><span class="status-badge ${statusClass}">${reservation.status.replace('_', ' ')}</span></td>
            <td>${actions}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load Users (Admin Only)
async function loadUsers() {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('name');
    
    if (error) {
        showAlert(error.message, 'error');
        return;
    }
    
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    
    const tbody = usersList.querySelector('tbody');
    
    data.forEach(user => {
        const roleClass = `role-${user.role}`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${roleClass}">${user.role.replace('_', ' ')}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="editUserRole('${user.id}')">Edit Role</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load Audit Logs (Admin Only)
async function loadAuditLogs() {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
    
    if (error) {
        showAlert(error.message, 'error');
        return;
    }
    
    const auditLogsList = document.getElementById('audit-logs-list');
    auditLogsList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Table</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    
    const tbody = auditLogsList.querySelector('tbody');
    
    data.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td>${log.action}</td>
            <td>${log.user_name || 'System'}</td>
            <td>${log.table_name}</td>
            <td>${log.details}</td>
        `;
        tbody.appendChild(row);
    });
}

// Show Add Facility Modal
function showAddFacilityModal() {
    modalBody.innerHTML = `
        <h3>Add New Facility</h3>
        <form id="add-facility-form">
            <div class="form-group">
                <label>Facility Name</label>
                <input type="text" id="facility-name" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="facility-type" required>
                    <option value="conference_room">Conference Room</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="gym">Gym</option>
                    <option value="auditorium">Auditorium</option>
                    <option value="classroom">Classroom</option>
                </select>
            </div>
            <div class="form-group">
                <label>Capacity</label>
                <input type="number" id="facility-capacity" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" id="facility-location" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="facility-status" required>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div class="form-group">
                <label>Condition</label>
                <select id="facility-condition" required>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                </select>
            </div>
            <button type="submit">Add Facility</button>
        </form>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('add-facility-form').addEventListener('submit', handleAddFacility);
}

// Handle Add Facility
async function handleAddFacility(e) {
    e.preventDefault();
    
    const facility = {
        name: document.getElementById('facility-name').value,
        type: document.getElementById('facility-type').value,
        capacity: parseInt(document.getElementById('facility-capacity').value),
        location: document.getElementById('facility-location').value,
        status: document.getElementById('facility-status').value,
        condition: document.getElementById('facility-condition').value
    };
    
    try {
        const { error } = await supabase
            .from('facilities')
            .insert(facility);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('FACILITY_CREATE', 'facilities', null, 
            `Created facility: ${facility.name}`);
        
        showAlert('Facility added successfully!', 'success');
        closeModal();
        loadFacilities();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Edit Facility
async function editFacility(facilityId) {
    const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single();
    
    if (error) {
        showAlert(error.message, 'error');
        return;
    }
    
    modalBody.innerHTML = `
        <h3>Edit Facility</h3>
        <form id="edit-facility-form">
            <div class="form-group">
                <label>Facility Name</label>
                <input type="text" id="edit-facility-name" value="${data.name}" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="edit-facility-type" required>
                    <option value="conference_room" ${data.type === 'conference_room' ? 'selected' : ''}>Conference Room</option>
                    <option value="laboratory" ${data.type === 'laboratory' ? 'selected' : ''}>Laboratory</option>
                    <option value="gym" ${data.type === 'gym' ? 'selected' : ''}>Gym</option>
                    <option value="auditorium" ${data.type === 'auditorium' ? 'selected' : ''}>Auditorium</option>
                    <option value="classroom" ${data.type === 'classroom' ? 'selected' : ''}>Classroom</option>
                </select>
            </div>
            <div class="form-group">
                <label>Capacity</label>
                <input type="number" id="edit-facility-capacity" value="${data.capacity}" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" id="edit-facility-location" value="${data.location}" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="edit-facility-status" required>
                    <option value="active" ${data.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="maintenance" ${data.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                    <option value="inactive" ${data.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <div class="form-group">
                <label>Condition</label>
                <select id="edit-facility-condition" required>
                    <option value="excellent" ${data.condition === 'excellent' ? 'selected' : ''}>Excellent</option>
                    <option value="good" ${data.condition === 'good' ? 'selected' : ''}>Good</option>
                    <option value="fair" ${data.condition === 'fair' ? 'selected' : ''}>Fair</option>
                    <option value="poor" ${data.condition === 'poor' ? 'selected' : ''}>Poor</option>
                </select>
            </div>
            <button type="submit">Update Facility</button>
        </form>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('edit-facility-form').addEventListener('submit', (e) => handleEditFacility(e, facilityId));
}

// Handle Edit Facility
async function handleEditFacility(e, facilityId) {
    e.preventDefault();
    
    const facility = {
        name: document.getElementById('edit-facility-name').value,
        type: document.getElementById('edit-facility-type').value,
        capacity: parseInt(document.getElementById('edit-facility-capacity').value),
        location: document.getElementById('edit-facility-location').value,
        status: document.getElementById('edit-facility-status').value,
        condition: document.getElementById('edit-facility-condition').value
    };
    
    try {
        const { error } = await supabase
            .from('facilities')
            .update(facility)
            .eq('id', facilityId);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('FACILITY_UPDATE', 'facilities', facilityId, 
            `Updated facility: ${facility.name}`);
        
        showAlert('Facility updated successfully!', 'success');
        closeModal();
        loadFacilities();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Delete Facility
async function deleteFacility(facilityId) {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    
    try {
        const { error } = await supabase
            .from('facilities')
            .delete()
            .eq('id', facilityId);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('FACILITY_DELETE', 'facilities', facilityId, 
            `Deleted facility ID: ${facilityId}`);
        
        showAlert('Facility deleted successfully!', 'success');
        loadFacilities();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Show Add Reservation Modal
async function showAddReservationModal() {
    // Load active facilities
    const { data: facilities, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('status', 'active')
        .order('name');
    
    if (error) {
        showAlert(error.message, 'error');
        return;
    }
    
    const facilityOptions = facilities.map(f => 
        `<option value="${f.id}">${f.name} (${f.location}) - Capacity: ${f.capacity}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h3>New Reservation</h3>
        <form id="add-reservation-form">
            <div class="form-group">
                <label>Facility</label>
                <select id="reservation-facility" required>
                    ${facilityOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Start Time</label>
                <input type="datetime-local" id="reservation-start" required>
            </div>
            <div class="form-group">
                <label>End Time</label>
                <input type="datetime-local" id="reservation-end" required>
            </div>
            <div class="form-group">
                <label>Purpose</label>
                <input type="text" id="reservation-purpose" required>
            </div>
            <button type="submit">Submit Reservation</button>
        </form>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('add-reservation-form').addEventListener('submit', handleAddReservation);
}

// Handle Add Reservation
async function handleAddReservation(e) {
    e.preventDefault();
    
    const facilityId = document.getElementById('reservation-facility').value;
    const startTime = document.getElementById('reservation-start').value;
    const endTime = document.getElementById('reservation-end').value;
    const purpose = document.getElementById('reservation-purpose').value;
    
    // Business Rule: BR-B4-02 - Reservation start must precede end time
    if (new Date(startTime) >= new Date(endTime)) {
        showAlert('Start time must be before end time', 'error');
        return;
    }
    
    // Business Rule: BR-B4-01 & BR-B4-08 - Check if facility is active and not under maintenance
    const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single();
    
    if (facilityError || !facility) {
        showAlert('Facility not found', 'error');
        return;
    }
    
    if (facility.status !== 'active') {
        showAlert('Only active facilities may be reserved (BR-B4-01, BR-B4-08)', 'error');
        return;
    }
    
    // Business Rule: BR-B4-03 - Check for overlapping approved schedules
    const hasOverlap = await checkScheduleOverlap(facilityId, startTime, endTime);
    if (hasOverlap) {
        showAlert('Overlapping approved schedules are prohibited (BR-B4-03)', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('reservations')
            .insert({
                facility_id: facilityId,
                user_id: currentUser.id,
                start_time: startTime,
                end_time: endTime,
                purpose,
                status: 'pending'
            });
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('RESERVATION_SUBMIT', 'reservations', null, 
            `Reservation submitted for facility ${facilityId} by ${currentUser.name}`);
        
        showAlert('Reservation submitted successfully! Status: Pending', 'success');
        closeModal();
        loadReservations();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Check Schedule Overlap
async function checkScheduleOverlap(facilityId, startTime, endTime) {
    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('facility_id', facilityId)
        .in('status', ['approved', 'scheduled', 'in_use']);
    
    if (error) return false;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    for (const reservation of data) {
        const resStart = new Date(reservation.start_time);
        const resEnd = new Date(reservation.end_time);
        
        // Check for overlap
        if ((start < resEnd) && (end > resStart)) {
            return true;
        }
    }
    
    return false;
}

// Approve Reservation (Admin Only)
async function approveReservation(reservationId) {
    if (currentRole !== 'admin') {
        showAlert('Only Administrator may approve reservations (BR-B4-04)', 'error');
        return;
    }
    
    try {
        // Get reservation details
        const { data: reservation, error: resError } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', reservationId)
            .single();
        
        if (resError) throw resError;
        
        // Business Rule: BR-B4-05 - Rejected reservations cannot become Scheduled
        if (reservation.status === 'rejected') {
            showAlert('Rejected reservations cannot become Scheduled (BR-B4-05)', 'error');
            return;
        }
        
        // Check for overlap again before approving
        const hasOverlap = await checkScheduleOverlap(reservation.facility_id, reservation.start_time, reservation.end_time);
        if (hasOverlap) {
            showAlert('Cannot approve: overlapping schedule detected', 'error');
            return;
        }
        
        const { error } = await supabase
            .from('reservations')
            .update({ status: 'approved' })
            .eq('id', reservationId);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('RESERVATION_APPROVE', 'reservations', reservationId, 
            `Reservation ${reservationId} approved by ${currentUser.name}`);
        
        showAlert('Reservation approved!', 'success');
        loadReservations();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Reject Reservation (Admin Only)
async function rejectReservation(reservationId) {
    if (currentRole !== 'admin') {
        showAlert('Only Administrator may reject reservations', 'error');
        return;
    }
    
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
        const { error } = await supabase
            .from('reservations')
            .update({ status: 'rejected', rejection_reason: reason })
            .eq('id', reservationId);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('RESERVATION_REJECT', 'reservations', reservationId, 
            `Reservation ${reservationId} rejected. Reason: ${reason}`);
        
        showAlert('Reservation rejected', 'success');
        loadReservations();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Mark In Use (Facility Staff Only)
async function markInUse(reservationId) {
    if (currentRole !== 'facility_staff') {
        showAlert('Only Facility Staff may mark reservations as In Use', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('reservations')
            .update({ status: 'in_use' })
            .eq('id', reservationId);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('RESERVATION_IN_USE', 'reservations', reservationId, 
            `Reservation ${reservationId} marked as In Use by ${currentUser.name}`);
        
        showAlert('Reservation marked as In Use', 'success');
        loadReservations();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Complete Reservation (Facility Staff Only)
async function completeReservation(reservationId) {
    if (currentRole !== 'facility_staff') {
        showAlert('Only Facility Staff may complete reservations', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('reservations')
            .update({ status: 'completed' })
            .eq('id', reservationId);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('RESERVATION_COMPLETE', 'reservations', reservationId, 
            `Reservation ${reservationId} completed by ${currentUser.name}`);
        
        showAlert('Reservation completed', 'success');
        loadReservations();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Cancel Reservation (Requester Only)
async function cancelReservation(reservationId) {
    if (currentRole !== 'requester') {
        showAlert('Only Requesters may cancel their own reservations', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    
    try {
        const { error } = await supabase
            .from('reservations')
            .update({ status: 'cancelled' })
            .eq('id', reservationId)
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('RESERVATION_CANCEL', 'reservations', reservationId, 
            `Reservation ${reservationId} cancelled by ${currentUser.name}`);
        
        showAlert('Reservation cancelled', 'success');
        loadReservations();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Edit Reservation (Requester Only - Pending Only)
async function editReservation(reservationId) {
    if (currentRole !== 'requester') {
        showAlert('Only Requesters may edit their own reservations', 'error');
        return;
    }
    
    // Business Rule: BR-B4-09 - Requesters may modify only their own Pending requests
    const { data: reservation, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();
    
    if (error) {
        showAlert(error.message, 'error');
        return;
    }
    
    if (reservation.user_id !== currentUser.id) {
        showAlert('You can only edit your own reservations (BR-B4-07)', 'error');
        return;
    }
    
    if (reservation.status !== 'pending') {
        showAlert('You can only edit pending reservations (BR-B4-09)', 'error');
        return;
    }
    
    // Load facilities
    const { data: facilities } = await supabase
        .from('facilities')
        .select('*')
        .eq('status', 'active')
        .order('name');
    
    const facilityOptions = facilities.map(f => 
        `<option value="${f.id}" ${f.id === reservation.facility_id ? 'selected' : ''}>${f.name}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h3>Edit Reservation</h3>
        <form id="edit-reservation-form">
            <div class="form-group">
                <label>Facility</label>
                <select id="edit-reservation-facility" required>
                    ${facilityOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Start Time</label>
                <input type="datetime-local" id="edit-reservation-start" value="${reservation.start_time.slice(0, 16)}" required>
            </div>
            <div class="form-group">
                <label>End Time</label>
                <input type="datetime-local" id="edit-reservation-end" value="${reservation.end_time.slice(0, 16)}" required>
            </div>
            <div class="form-group">
                <label>Purpose</label>
                <input type="text" id="edit-reservation-purpose" value="${reservation.purpose}" required>
            </div>
            <button type="submit">Update Reservation</button>
        </form>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('edit-reservation-form').addEventListener('submit', (e) => handleEditReservation(e, reservationId));
}

// Handle Edit Reservation
async function handleEditReservation(e, reservationId) {
    e.preventDefault();
    
    const facilityId = document.getElementById('edit-reservation-facility').value;
    const startTime = document.getElementById('edit-reservation-start').value;
    const endTime = document.getElementById('edit-reservation-end').value;
    const purpose = document.getElementById('edit-reservation-purpose').value;
    
    // Business Rule: BR-B4-02
    if (new Date(startTime) >= new Date(endTime)) {
        showAlert('Start time must be before end time', 'error');
        return;
    }
    
    // Check for overlap
    const hasOverlap = await checkScheduleOverlap(facilityId, startTime, endTime);
    if (hasOverlap) {
        showAlert('Overlapping approved schedules are prohibited', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('reservations')
            .update({
                facility_id: facilityId,
                start_time: startTime,
                end_time: endTime,
                purpose
            })
            .eq('id', reservationId);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('RESERVATION_UPDATE', 'reservations', reservationId, 
            `Reservation ${reservationId} updated by ${currentUser.name}`);
        
        showAlert('Reservation updated successfully!', 'success');
        closeModal();
        loadReservations();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Edit User Role (Admin Only)
async function editUserRole(userId) {
    if (currentRole !== 'admin') {
        showAlert('Only Administrators may edit user roles', 'error');
        return;
    }
    
    const { data: user, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        showAlert(error.message, 'error');
        return;
    }
    
    modalBody.innerHTML = `
        <h3>Edit User Role</h3>
        <form id="edit-user-role-form">
            <div class="form-group">
                <label>User</label>
                <input type="text" value="${user.name}" disabled>
            </div>
            <div class="form-group">
                <label>Role</label>
                <select id="edit-user-role" required>
                    <option value="requester" ${user.role === 'requester' ? 'selected' : ''}>Requester</option>
                    <option value="facility_staff" ${user.role === 'facility_staff' ? 'selected' : ''}>Facility Staff</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
                </select>
            </div>
            <button type="submit">Update Role</button>
        </form>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('edit-user-role-form').addEventListener('submit', (e) => handleEditUserRole(e, userId));
}

// Handle Edit User Role
async function handleEditUserRole(e, userId) {
    e.preventDefault();
    
    const newRole = document.getElementById('edit-user-role').value;
    
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', userId);
        
        if (error) throw error;
        
        // Log action
        await logAuditAction('USER_ROLE_UPDATE', 'user_profiles', userId, 
            `User role updated to ${newRole} by ${currentUser.name}`);
        
        showAlert('User role updated successfully!', 'success');
        closeModal();
        loadUsers();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Audit Logging
async function logAuditAction(action, tableName, recordId, details) {
    try {
        await supabase
            .from('audit_logs')
            .insert({
                action,
                table_name: tableName,
                record_id: recordId,
                user_id: currentUser ? currentUser.id : null,
                user_name: currentUser ? currentUser.name : null,
                details
            });
    } catch (error) {
        console.error('Audit log error:', error);
    }
}

// Modal Functions
function closeModal() {
    modal.classList.remove('active');
}

// Alert Function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
