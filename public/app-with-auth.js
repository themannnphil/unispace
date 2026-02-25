const API_BASE = '/api';

let currentFacility = null;
let selectedTimeSlot = null;
let currentUser = null;
let allFacilities = []; // Store all facilities for filtering and sorting
let allBookings = []; // Store all bookings for filtering and management

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }

    // Setup login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Setup register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // Setup facility form
    document.getElementById('facility-form').addEventListener('submit', handleAddFacility);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const bookingDateInput = document.getElementById('booking-date');
    if (bookingDateInput) {
        bookingDateInput.min = today;
        bookingDateInput.value = today;
    }
});

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const isAdmin = document.getElementById('admin-login').checked;

    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            currentUser = result.data;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
            showAlert('Login successful!', 'success');
        } else {
            showAlert(result.message || 'Login failed', 'danger');
        }
    } catch (error) {
        showAlert('Network error during login', 'danger');
        console.error('Error:', error);
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const isAdmin = document.getElementById('admin-register').checked;

    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: isAdmin ? 'admin' : 'user'
            })
        });

        const result = await response.json();

        if (result.success) {
            currentUser = result.data;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
            showAlert('Account created and logged in successfully!', 'success');
        } else {
            showAlert(result.message || 'Registration failed', 'danger');
        }
    } catch (error) {
        showAlert('Network error during registration', 'danger');
        console.error('Error:', error);
    }
}

// Show main application
function showMainApp() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';

    // Update user info in navbar
    document.getElementById('current-user-name').textContent = currentUser.name;
    document.getElementById('user-role-badge').textContent = currentUser.role;

    // Show appropriate navigation
    if (currentUser.role === 'admin') {
        document.getElementById('user-nav').style.display = 'none';
        document.getElementById('admin-nav').style.display = 'flex';
        document.getElementById('user-role-badge').className = 'badge bg-danger ms-1';
    } else {
        document.getElementById('user-nav').style.display = 'flex';
        document.getElementById('admin-nav').style.display = 'none';
        document.getElementById('user-role-badge').className = 'badge bg-success ms-1';
    }

    // Load initial data
    loadFacilities();

    // Show appropriate section
    if (currentUser.role === 'admin') {
        document.getElementById('admin-quick-actions').style.display = 'block';
        showSection('dashboard'); // Admin goes to dashboard
    } else {
        document.getElementById('admin-quick-actions').style.display = 'none';
        showSection('dashboard'); // User goes to dashboard
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';

    // Reset both login and register forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();

    showAlert('Logged out successfully', 'success');
}

// Show different sections
function showSection(section) {
    const sections = ['dashboard', 'facilities', 'booking', 'bookings', 'manage-facilities', 'all-bookings', 'approval-portal'];
    sections.forEach(s => {
        const element = document.getElementById(s + '-section');
        if (element) {
            const display = s === section ? 'block' : 'none';
            element.style.display = display;
        }
    });

    // Load section-specific data
    switch (section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'facilities':
            loadFacilities();
            // Show/hide admin Add Facility button
            const addFacilityBtn = document.getElementById('facilities-add-btn');
            if (addFacilityBtn) {
                addFacilityBtn.style.display = (currentUser && currentUser.role === 'admin') ? 'block' : 'none';
            }
            break;
        case 'bookings':
            loadUserBookings();
            break;
        case 'manage-facilities':
            loadAdminFacilities();
            break;
        case 'all-bookings':
            loadAllBookings();
            break;
        case 'approval-portal':
            loadApprovalPortal();
            break;
    }
}

// Load all facilities
async function loadFacilities() {
    try {
        const response = await fetch(`${API_BASE}/facilities`);
        const result = await response.json();

        if (result.success) {
            displayFacilities(result.data);
        } else {
            showAlert('Error loading facilities', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading facilities', 'danger');
        console.error('Error:', error);
    }
}

// Display facilities in cards
function displayFacilities(facilities) {
    const container = document.getElementById('facilities-list');

    if (facilities.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">No facilities available</p></div>';
        return;
    }

    container.innerHTML = facilities.map(facility => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card facility-card h-100" onclick="selectFacility(${facility.id})">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-building text-primary"></i> ${facility.name}
                    </h5>
                    <p class="card-text">
                        <i class="fas fa-map-marker-alt text-muted"></i> ${facility.location}<br>
                        <i class="fas fa-users text-muted"></i> Capacity: ${facility.capacity} people
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-success">Available</span>
                        <div>
                            ${currentUser && currentUser.role === 'admin' ? `
                                <button class="btn btn-sm btn-warning me-1" onclick="event.stopPropagation(); editFacility(${facility.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger me-1" onclick="event.stopPropagation(); deleteFacility(${facility.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); selectFacility(${facility.id})">
                                <i class="fas fa-calendar-plus"></i> Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Select a facility for booking
async function selectFacility(facilityId) {
    try {
        const response = await fetch(`${API_BASE}/facilities/${facilityId}`);
        const result = await response.json();

        if (result.success) {
            currentFacility = result.data;
            showSection('booking');
            displayFacilityDetails(currentFacility);
            document.getElementById('booking-facility-name').textContent = `Book ${currentFacility.name}`;

            // Pre-fill user information
            document.getElementById('user-name').value = currentUser.name || '';
            document.getElementById('user-email').value = currentUser.email || '';

            loadAvailability();
        } else {
            showAlert('Error loading facility details', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading facility', 'danger');
        console.error('Error:', error);
    }
}

// Display facility details
function displayFacilityDetails(facility) {
    const container = document.getElementById('facility-details');
    container.innerHTML = `
        <h6>${facility.name}</h6>
        <p><strong>Location:</strong> ${facility.location}</p>
        <p><strong>Capacity:</strong> ${facility.capacity} people</p>
        <p><strong>Facility ID:</strong> ${facility.id}</p>
        <div class="mt-3">
            <small class="text-muted">
                <i class="fas fa-info-circle"></i> 
                Select a date and time slot to make a booking
            </small>
        </div>
    `;
}

// Load availability for selected facility and date
async function loadAvailability() {
    if (!currentFacility) return;

    const date = document.getElementById('booking-date').value;
    if (!date) return;

    try {
        const response = await fetch(`${API_BASE}/bookings/availability/check?facility_id=${currentFacility.id}&date=${date}`);
        const result = await response.json();

        if (result.success) {
            displayTimeSlots(result.data.available_slots);
        } else {
            showAlert('Error loading availability', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading availability', 'danger');
        console.error('Error:', error);
    }
}

// Display available time slots
function displayTimeSlots(slots) {
    const container = document.getElementById('time-slots');

    if (slots.length === 0) {
        container.innerHTML = '<p class="text-muted">No available slots for this date</p>';
        return;
    }

    container.innerHTML = slots.map(slot => `
        <div class="col-md-6 col-lg-4 mb-2">
            <div class="card time-slot" onclick="selectTimeSlot('${slot.start_time}', '${slot.end_time}', this)">
                <div class="card-body text-center py-2">
                    <small>${slot.start_time} - ${slot.end_time}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Select a time slot
function selectTimeSlot(startTime, endTime, element) {
    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Add selection to clicked slot
    element.classList.add('selected');
    selectedTimeSlot = { start_time: startTime, end_time: endTime };

    // Enable booking button if user info is filled
    checkBookingForm();
}

// Check if booking form is complete
function checkBookingForm() {
    const userName = document.getElementById('user-name').value.trim();
    const userEmail = document.getElementById('user-email').value.trim();
    const createBtn = document.getElementById('create-booking-btn');

    if (userName && userEmail && selectedTimeSlot && currentFacility) {
        createBtn.disabled = false;
    } else {
        createBtn.disabled = true;
    }
}

// Create a new booking
async function createBooking() {
    const userName = document.getElementById('user-name').value.trim();
    const userEmail = document.getElementById('user-email').value.trim();
    const date = document.getElementById('booking-date').value;

    if (!userName || !userEmail || !selectedTimeSlot || !currentFacility || !date) {
        showAlert('Please fill all required fields', 'warning');
        return;
    }

    const bookingData = {
        facility_id: currentFacility.id,
        user_id: currentUser.id, // Use logged-in user ID
        date: date,
        start_time: selectedTimeSlot.start_time,
        end_time: selectedTimeSlot.end_time,
        status: 'pending', // All bookings start as pending
        // Include user details for better tracking
        user_name: userName,
        user_email: userEmail
    };

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Booking created successfully!', 'success');
            // Reset form
            document.getElementById('user-name').value = currentUser.name || '';
            document.getElementById('user-email').value = currentUser.email || '';
            selectedTimeSlot = null;
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.classList.remove('selected');
            });
            document.getElementById('create-booking-btn').disabled = true;
            // Reload availability
            loadAvailability();
        } else {
            showAlert(result.message || 'Error creating booking', 'danger');
        }
    } catch (error) {
        showAlert('Network error creating booking', 'danger');
        console.error('Error:', error);
    }
}

// Load user bookings (My Bookings tab)
async function loadUserBookings() {
    const container = document.getElementById('my-bookings-list');
    if (container) container.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Loading...</p></div>';
    try {
        const response = await fetch(`${API_BASE}/bookings/user/history?user_id=${currentUser.id}`);
        const result = await response.json();

        if (result.success) {
            displayUserBookings(result.data);
        } else {
            if (container) container.innerHTML = '<p class="text-muted p-3">Error loading bookings.</p>';
        }
    } catch (error) {
        if (container) container.innerHTML = '<p class="text-muted p-3">Network error loading bookings.</p>';
        console.error('Error:', error);
    }
}

// Display user bookings — full card view (used in My Bookings tab)
function displayUserBookings(bookings) {
    const container = document.getElementById('my-bookings-list');
    if (!container) return;
    container.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No Bookings Found</h4>
                <p class="text-muted">You haven't made any bookings yet. Browse facilities to create your first booking!</p>
                <button class="btn btn-primary mt-3" onclick="showSection('facilities')">
                    <i class="fas fa-building"></i> Browse Facilities
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = bookings.map(booking => {
        let statusBadge, statusText, canCancel = false;
        switch (booking.status) {
            case 'pending': statusBadge = 'bg-warning'; statusText = 'Pending'; canCancel = true; break;
            case 'confirmed': statusBadge = 'bg-success'; statusText = 'Confirmed'; canCancel = true; break;
            case 'cancelled': statusBadge = 'bg-danger'; statusText = 'Cancelled'; canCancel = false; break;
            default: statusBadge = 'bg-secondary'; statusText = 'Unknown'; canCancel = false;
        }
        return `
            <div class="card booking-card mb-3 ${booking.status === 'cancelled' ? 'cancelled' : ''}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-5">
                            <h5 class="mb-1"><i class="fas fa-building text-primary me-2"></i>${booking.facility_name || 'Unknown Facility'}</h5>
                            <small class="text-muted">Booking #${booking.id}</small>
                        </div>
                        <div class="col-md-4">
                            <div><i class="fas fa-calendar text-muted me-1"></i>${booking.date || 'N/A'}</div>
                            <div><i class="fas fa-clock text-muted me-1"></i>${booking.start_time || 'N/A'} – ${booking.end_time || 'N/A'}</div>
                        </div>
                        <div class="col-md-2 text-center">
                            <span class="badge ${statusBadge}">${statusText}</span>
                        </div>
                        <div class="col-md-1 text-end">
                            ${canCancel ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking(${booking.id})" title="Cancel"><i class="fas fa-times"></i></button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Simple compact list — used in dashboard widget
function displayBookingsList(bookings, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p class="text-muted mb-0">No bookings yet.</p>';
        return;
    }

    const rows = bookings.slice(0, 8).map(b => {
        const badge = b.status === 'confirmed' ? 'bg-success' : b.status === 'pending' ? 'bg-warning' : 'bg-danger';
        const userCol = (currentUser && currentUser.role === 'admin') ? `<td class="text-muted small">${b.user_name || '—'}</td>` : '';
        return `<tr>
            <td>${b.facility_name || '—'}</td>
            ${userCol}
            <td>${b.date || '—'}</td>
            <td>${b.start_time || '—'} – ${b.end_time || '—'}</td>
            <td><span class="badge ${badge}">${b.status}</span></td>
        </tr>`;
    }).join('');

    const userHeader = (currentUser && currentUser.role === 'admin') ? '<th>User</th>' : '';
    container.innerHTML = `
        <table class="table table-sm table-hover mb-0">
            <thead><tr><th>Facility</th>${userHeader}<th>Date</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
}

// Cancel a booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Booking cancelled successfully', 'success');
            // Reload bookings
            loadUserBookings();
        } else {
            showAlert(result.message || 'Error cancelling booking', 'danger');
        }
    } catch (error) {
        showAlert('Network error cancelling booking', 'danger');
        console.error('Error:', error);
    }
}

// Admin Functions

// Show add facility form
function showAddFacilityForm() {
    console.log('showAddFacilityForm called');
    const form = document.getElementById('add-facility-form');
    if (form) {
        form.style.display = 'block';
        document.getElementById('facility-name').focus();
    }
}

// Hide add facility form
function hideAddFacilityForm() {
    document.getElementById('add-facility-form').style.display = 'none';
    resetFacilityForm();
}

// Handle add facility
async function handleAddFacility(e) {
    e.preventDefault();
    console.log('handleAddFacility called with data:', e.target);

    const formData = new FormData(e.target);
    const facilityData = {
        name: formData.get('name'),
        location: formData.get('location'),
        capacity: parseInt(formData.get('capacity'))
    };

    console.log('Facility data to create:', facilityData);

    try {
        const response = await fetch(`${API_BASE}/facilities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(facilityData)
        });

        const result = await response.json();
        console.log('Create facility response:', result);

        if (result.success) {
            showAlert('Facility created successfully!', 'success');
            hideAddFacilityForm();
            loadAdminFacilities();
        } else {
            showAlert(result.message || 'Error creating facility', 'danger');
        }
    } catch (error) {
        console.error('Error creating facility:', error);
        showAlert('Network error creating facility', 'danger');
    }
}

// Load admin facilities
async function loadAdminFacilities() {
    try {
        const response = await fetch(`${API_BASE}/facilities`);
        const result = await response.json();

        if (result.success) {
            allFacilities = result.data; // Store globally
            displayAdminFacilities(allFacilities);
        } else {
            showAlert('Error loading facilities', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading facilities', 'danger');
        console.error('Error:', error);
    }
}

// Filter facilities
function filterFacilities() {
    const searchTerm = document.getElementById('facility-search').value.toLowerCase();
    const capacityFilter = document.getElementById('capacity-filter').value;

    let filtered = allFacilities.filter(facility => {
        // Search filter
        const matchesSearch = !searchTerm ||
            facility.name.toLowerCase().includes(searchTerm) ||
            facility.location.toLowerCase().includes(searchTerm);

        // Capacity filter
        let matchesCapacity = true;
        if (capacityFilter) {
            switch (capacityFilter) {
                case 'small':
                    matchesCapacity = facility.capacity <= 10;
                    break;
                case 'medium':
                    matchesCapacity = facility.capacity > 10 && facility.capacity <= 50;
                    break;
                case 'large':
                    matchesCapacity = facility.capacity > 50;
                    break;
            }
        }

        return matchesSearch && matchesCapacity;
    });

    displayAdminFacilities(filtered);
}

// Sort facilities
function sortFacilities() {
    const sortBy = document.getElementById('sort-facilities').value;

    let sorted = [...allFacilities].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'capacity':
                return b.capacity - a.capacity; // Descending
            case 'location':
                return a.location.localeCompare(b.location);
            default:
                return 0;
        }
    });

    displayAdminFacilities(sorted);
}

// Display admin facilities with management options
function displayAdminFacilities(facilities) {
    const container = document.getElementById('admin-facilities-list');

    if (!container) {
        console.error('admin-facilities-list container not found!');
        return;
    }

    // Show count
    const countHtml = `<div class="alert alert-info mb-3">
        <i class="fas fa-info-circle"></i> Showing ${facilities.length} of ${allFacilities.length} facilities
    </div>`;

    if (facilities.length === 0) {
        container.innerHTML = countHtml + '<p class="text-muted">No facilities found matching your criteria</p>';
        return;
    }

    container.innerHTML = countHtml + facilities.map(facility => {
        const capacityBadge = facility.capacity <= 10 ? 'bg-success' :
            facility.capacity <= 50 ? 'bg-warning' : 'bg-danger';
        const capacityLabel = facility.capacity <= 10 ? 'Small' :
            facility.capacity <= 50 ? 'Medium' : 'Large';

        return '<div class="card mb-3">' +
            '<div class="card-body">' +
            '<div class="row">' +
            '<div class="col-md-8">' +
            '<h5 class="card-title">' +
            '<i class="fas fa-building text-primary"></i> ' + facility.name +
            '<span class="badge ' + capacityBadge + ' ms-2">' + capacityLabel + '</span>' +
            '</h5>' +
            '<p class="card-text">' +
            '<i class="fas fa-map-marker-alt text-muted"></i> ' + facility.location + '<br>' +
            '<i class="fas fa-users text-muted"></i> Capacity: ' + facility.capacity + ' people<br>' +
            '<small class="text-muted">ID: ' + facility.id + '</small>' +
            '</p>' +
            '</div>' +
            '<div class="col-md-4 text-end">' +
            '<button class="btn btn-sm btn-warning me-2" onclick="editFacility(' + facility.id + ')">' +
            '<i class="fas fa-edit"></i> Edit' +
            '</button>' +
            '<button class="btn btn-sm btn-danger" onclick="deleteFacility(' + facility.id + ')">' +
            '<i class="fas fa-trash"></i> Delete' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

// Load all bookings (admin)
async function loadAllBookings() {
    console.log('loadAllBookings called');
    try {
        const response = await fetch(`${API_BASE}/bookings`);
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('API result:', result);

        if (result.success) {
            allBookings = result.data; // Store globally
            console.log('Bookings loaded:', allBookings.length);
            updateBookingStatistics();
            displayAllBookings(allBookings);
        } else {
            showAlert('Error loading bookings', 'danger');
        }
    } catch (error) {
        console.error('Error in loadAllBookings:', error);
        showAlert('Network error loading bookings', 'danger');
    }
}

// Update booking statistics
function updateBookingStatistics() {
    const pending = allBookings.filter(b => b.status === 'pending').length;
    const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
    const cancelled = allBookings.filter(b => b.status === 'cancelled').length;
    const total = allBookings.length;

    document.getElementById('pending-count').textContent = pending;
    document.getElementById('confirmed-count').textContent = confirmed;
    document.getElementById('cancelled-count').textContent = cancelled;
    document.getElementById('total-count').textContent = total;
}

// Display all bookings (admin view)
function displayAllBookings(bookings) {
    console.log('displayAllBookings called with:', bookings.length, 'bookings');
    const container = document.getElementById('all-bookings-list');

    if (!container) {
        console.error('all-bookings-list container not found!');
        return;
    }

    // Show count
    const countHtml = `<div class="alert alert-info mb-3">
        <i class="fas fa-info-circle"></i> Showing ${bookings.length} of ${allBookings.length} bookings
    </div>`;

    if (!bookings || bookings.length === 0) {
        console.log('No bookings to display');
        container.innerHTML = countHtml + '<p class="text-muted">No bookings found matching your criteria</p>';
        return;
    }

    console.log('Generating HTML for bookings...');
    const htmlContent = bookings.map(booking => {
        console.log('Processing booking:', booking);
        const statusBadge = booking.status === 'confirmed' ? 'bg-success' :
            booking.status === 'pending' ? 'bg-warning' : 'bg-danger';
        const statusIcon = booking.status === 'confirmed' ? 'fa-check-circle' :
            booking.status === 'pending' ? 'fa-clock' : 'fa-times-circle';

        const bookingHtml = '<div class="card booking-card mb-3 ' + (booking.status === 'cancelled' ? 'cancelled' : '') + '">' +
            '<div class="card-body">' +
            '<div class="row">' +
            '<div class="col-md-3">' +
            '<h6 class="card-title">' +
            '<i class="fas fa-building text-primary"></i> ' + (booking.facility_name || 'Unknown Facility') +
            '</h6>' +
            '<small class="text-muted">ID: ' + (booking.id || 'N/A') + '</small>' +
            '</div>' +
            '<div class="col-md-3">' +
            '<p class="card-text mb-1">' +
            '<i class="fas fa-user text-muted"></i> ' + (booking.user_name || 'Unknown User') + '<br>' +
            '<i class="fas fa-envelope text-muted"></i> ' + (booking.user_email || 'N/A') +
            '</p>' +
            '</div>' +
            '<div class="col-md-3">' +
            '<p class="card-text mb-1">' +
            '<i class="fas fa-calendar text-muted"></i> ' + (booking.date || 'N/A') + '<br>' +
            '<i class="fas fa-clock text-muted"></i> ' + (booking.start_time || 'N/A') + ' - ' + (booking.end_time || 'N/A') +
            '</p>' +
            '</div>' +
            '<div class="col-md-3 text-end">' +
            '<span class="badge ' + statusBadge + ' mb-2">' +
            '<i class="fas ' + statusIcon + '"></i> ' + (booking.status || 'Unknown') +
            '</span><br>' +
            '<div class="btn-group-vertical" role="group">' +
            (booking.status === 'pending' ?
                '<button class="btn btn-sm btn-success mb-1 w-100" onclick="approveBooking(' + (booking.id || 'null') + ')">' +
                '<i class="fas fa-check"></i> Approve' +
                '</button>' +
                '<button class="btn btn-sm btn-danger mb-1 w-100" onclick="rejectBooking(' + (booking.id || 'null') + ')">' +
                '<i class="fas fa-times"></i> Reject' +
                '</button>' :
                booking.status === 'confirmed' ?
                    '<button class="btn btn-sm btn-warning mb-1 w-100" onclick="adminCancelBooking(' + (booking.id || 'null') + ')">' +
                    '<i class="fas fa-times"></i> Cancel' +
                    '</button>' :
                    '<span class="text-muted small">No actions available</span>'
            ) +
            '<button class="btn btn-sm btn-outline-info mb-1 w-100" onclick="editBooking(' + (booking.id || 'null') + ')">' +
            '<i class="fas fa-edit"></i> Edit Details' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        console.log('Generated booking HTML:', bookingHtml);
        return bookingHtml;
    }).join('');

    console.log('Final HTML length:', htmlContent.length);
    const finalHtml = countHtml + htmlContent;
    console.log('Setting container HTML...');
    container.innerHTML = finalHtml;
    console.log('Container HTML set successfully');
}

// Approve booking
async function approveBooking(bookingId) {
    if (!confirm('Are you sure you want to approve this booking?')) return;
    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'confirmed' })
        });
        const result = await response.json();
        if (result.success) {
            showAlert('Booking approved successfully', 'success');
            loadAllBookings();
            loadApprovalPortal();
        } else {
            showAlert(result.message || 'Error approving booking', 'danger');
        }
    } catch (error) {
        showAlert('Network error approving booking', 'danger');
        console.error('Error:', error);
    }
}

// Reject booking
async function rejectBooking(bookingId) {
    if (!confirm('Are you sure you want to reject this booking?')) return;
    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
        });
        const result = await response.json();
        if (result.success) {
            showAlert('Booking rejected successfully', 'success');
            loadAllBookings();
            loadApprovalPortal();
        } else {
            showAlert(result.message || 'Error rejecting booking', 'danger');
        }
    } catch (error) {
        showAlert('Network error rejecting booking', 'danger');
        console.error('Error:', error);
    }
}

// Edit booking (placeholder for future implementation)
function editBooking(bookingId) {
    showAlert('Edit booking feature coming soon!', 'info');
    // TODO: Implement booking edit functionality
}

// Filter bookings
function filterBookings() {
    const searchTerm = document.getElementById('booking-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;

    let filtered = allBookings.filter(booking => {
        // Search filter
        const matchesSearch = !searchTerm ||
            (booking.facility_name && booking.facility_name.toLowerCase().includes(searchTerm)) ||
            (booking.user_name && booking.user_name.toLowerCase().includes(searchTerm)) ||
            (booking.user_email && booking.user_email.toLowerCase().includes(searchTerm));

        // Status filter
        const matchesStatus = !statusFilter || booking.status === statusFilter;

        // Date filter
        const matchesDate = !dateFilter || booking.date === dateFilter;

        return matchesSearch && matchesStatus && matchesDate;
    });

    displayAllBookings(filtered);
}

// Clear booking filters
function clearBookingFilters() {
    document.getElementById('booking-search').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('date-filter').value = '';
    displayAllBookings(allBookings);
}

// Admin cancel booking
async function adminCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
        });
        const result = await response.json();
        if (result.success) {
            showAlert('Booking cancelled successfully', 'success');
            loadAllBookings();
        } else {
            showAlert(result.message || 'Error cancelling booking', 'danger');
        }
    } catch (error) {
        showAlert('Network error cancelling booking', 'danger');
        console.error('Error:', error);
    }
}

// Delete facility (admin)
async function deleteFacility(facilityId) {
    if (!confirm('Are you sure you want to delete this facility? This will also delete all associated bookings.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/facilities/${facilityId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Facility deleted successfully', 'success');
            loadAdminFacilities();
        } else {
            showAlert(result.message || 'Error deleting facility', 'danger');
        }
    } catch (error) {
        showAlert('Network error deleting facility', 'danger');
        console.error('Error:', error);
    }
}

// Edit facility (admin)
async function editFacility(facilityId) {
    try {
        const response = await fetch(`${API_BASE}/facilities/${facilityId}`);
        const result = await response.json();

        if (result.success) {
            const facility = result.data;

            // Populate form with existing data
            document.getElementById('facility-name').value = facility.name;
            document.getElementById('facility-location').value = facility.location;
            document.getElementById('facility-capacity').value = facility.capacity;

            // Show form
            showAddFacilityForm();

            // Remove existing event listener and add new one
            const form = document.getElementById('facility-form');
            const newForm = form.cloneNode(true); // Clone to remove event listeners
            form.parentNode.replaceChild(newForm, form);

            // Add update event listener
            newForm.addEventListener('submit', function (e) {
                e.preventDefault();
                updateFacility(facilityId);
            });

            // Change button text
            const submitBtn = newForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Facility';

        } else {
            showAlert('Error loading facility details', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading facility', 'danger');
        console.error('Error:', error);
    }
}

// Update facility (admin)
async function updateFacility(facilityId) {
    const facilityData = {
        name: document.getElementById('facility-name').value,
        location: document.getElementById('facility-location').value,
        capacity: parseInt(document.getElementById('facility-capacity').value)
    };

    try {
        const response = await fetch(`${API_BASE}/facilities/${facilityId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(facilityData)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Facility updated successfully!', 'success');
            hideAddFacilityForm();
            loadAdminFacilities();

            // Reset form back to create mode
            resetFacilityForm();
        } else {
            showAlert(result.message || 'Error updating facility', 'danger');
        }
    } catch (error) {
        showAlert('Network error updating facility', 'danger');
        console.error('Error:', error);
    }
}

// Reset facility form to create mode
function resetFacilityForm() {
    const form = document.getElementById('facility-form');
    form.reset();

    // Remove all event listeners and add back the original
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Add the original create event listener
    newForm.addEventListener('submit', handleAddFacility);

    const submitBtn = newForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Facility';
}

// Show alert message
function showAlert(message, type) {
    const container = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();

    const alertHtml = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert" id="' + alertId + '">' +
        message +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        '</div>';

    container.insertAdjacentHTML('beforeend', alertHtml);

    // Auto-remove after 5 seconds
    setTimeout(function () {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}

// Dashboard Functions

// Load dashboard data
async function loadDashboard() {
    try {
        // Load statistics
        await Promise.all([
            loadDashboardStats(),
            loadRecentBookings()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Error loading dashboard data', 'danger');
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Get facilities count
        const facilitiesResponse = await fetch(`${API_BASE}/facilities`);
        const facilitiesResult = await facilitiesResponse.json();
        const facilitiesCount = facilitiesResult.success ? facilitiesResult.data.length : 0;
        document.getElementById('total-facilities-count').textContent = facilitiesCount;

        // Get bookings statistics
        const bookingsResponse = await fetch(`${API_BASE}/bookings`);
        const bookingsResult = await bookingsResponse.json();

        if (bookingsResult.success) {
            const bookings = bookingsResult.data;
            const today = new Date().toISOString().split('T')[0];

            const totalBookings = bookings.length;
            const pendingBookings = bookings.filter(b => b.status === 'pending').length;
            const todayBookings = bookings.filter(b => b.date === today).length;

            document.getElementById('total-bookings-count').textContent = totalBookings;
            document.getElementById('pending-bookings-count').textContent = pendingBookings;
            document.getElementById('today-bookings-count').textContent = todayBookings;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load recent bookings for dashboard
async function loadRecentBookings() {
    try {
        let url, bookings;

        if (currentUser.role === 'admin') {
            // Admin sees all recent bookings
            const response = await fetch(`${API_BASE}/bookings`);
            const result = await response.json();
            if (!result.success) return;
            bookings = result.data;
        } else {
            // Regular user sees only their own
            const response = await fetch(`${API_BASE}/bookings/user/history?user_id=${currentUser.id}`);
            const result = await response.json();
            if (!result.success) return;
            bookings = result.data;
        }

        // Render as compact list in dashboard widget
        displayBookingsList(bookings, 'user-bookings-list');

        // Update pending badge
        const pendingCount = bookings.filter(b => b.status === 'pending').length;
        const pendingElement = document.getElementById('dashboard-pending-count');
        if (pendingElement) pendingElement.textContent = pendingCount;

    } catch (error) {
        console.error('Error loading recent bookings:', error);
    }
}

// Display recent bookings
function displayRecentBookings(bookings) {
    const container = document.getElementById('recent-bookings-list');

    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p class="text-muted">No recent bookings</p>';
        return;
    }

    container.innerHTML = bookings.map(booking => `
        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
            <div>
                <h6 class="mb-1">${booking.facility_name || 'Unknown Facility'}</h6>
                <small class="text-muted">
                    <i class="fas fa-calendar"></i> ${booking.date || 'N/A'} 
                    <i class="fas fa-clock ms-2"></i> ${booking.start_time || 'N/A'} - ${booking.end_time || 'N/A'}
                </small>
                ${currentUser.role === 'admin' ? `<br><small class="text-muted"><i class="fas fa-user"></i> ${booking.user_name || 'Unknown User'}</small>` : ''}
            </div>
            <div class="text-end">
                <span class="badge ${booking.status === 'confirmed' ? 'bg-success' : booking.status === 'pending' ? 'bg-warning' : 'bg-danger'}">
                    ${booking.status || 'Unknown'}
                </span>
            </div>
        </div>
    `).join('');
}

// Approval Portal Functions

// Load approval portal
async function loadApprovalPortal() {
    console.log('Loading approval portal...');
    try {
        // Load all bookings to filter pending ones
        const response = await fetch(`${API_BASE}/bookings`);
        const result = await response.json();

        console.log('API Response:', result);

        if (result.success) {
            const allBookings = result.data;
            console.log('All bookings loaded:', allBookings.length);

            const pendingBookings = allBookings.filter(b => b.status === 'pending');
            console.log('Pending bookings found:', pendingBookings.length);

            displayPendingBookings(pendingBookings);
            updateApprovalStatistics(allBookings);
        } else {
            showAlert('Error loading bookings for approval', 'danger');
        }
    } catch (error) {
        console.error('Error loading approval portal:', error);
        showAlert('Network error loading approval portal', 'danger');
    }
}

// Display pending bookings for approval
function displayPendingBookings(bookings) {
    const container = document.getElementById('pending-bookings-list');
    if (!container) {
        console.error('pending-bookings-list container not found!');
        return;
    }

    // Clear container
    container.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                <h4 class="text-muted">No Pending Bookings</h4>
                <p class="text-muted">All bookings have been processed!</p>
            </div>
        `;
        return;
    }

    // Create booking cards for approval
    const bookingsHtml = bookings.map(booking => {
        return `
            <div class="card mb-3 border-start border-warning">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <h6 class="card-title">
                                <i class="fas fa-building text-primary"></i> ${booking.facility_name || 'Unknown Facility'}
                            </h6>
                            <small class="text-muted">Booking #${booking.id || 'N/A'}</small>
                        </div>
                        <div class="col-md-4">
                            <div class="mb-2">
                                <i class="fas fa-calendar text-muted"></i>
                                <strong>Date:</strong> ${booking.date || 'N/A'}
                            </div>
                            <div class="mb-2">
                                <i class="fas fa-clock text-muted"></i>
                                <strong>Time:</strong> ${booking.start_time || 'N/A'} - ${booking.end_time || 'N/A'}
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mb-2">
                                <i class="fas fa-user text-muted"></i>
                                <strong>User:</strong> ${booking.user_name || 'Unknown User'}
                            </div>
                            <div class="mb-2">
                                <i class="fas fa-envelope text-muted"></i>
                                <strong>Email:</strong> ${booking.user_email || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <div class="btn-group" role="group">
                            <button class="btn btn-success" onclick="approveBooking(${booking.id})" title="Approve this booking">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-danger" onclick="rejectBooking(${booking.id})" title="Reject this booking">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = bookingsHtml;
}

// Helper function to update elements safely
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Update approval statistics
function updateApprovalStatistics(allBookings) {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = allBookings.filter(b => b.date === today);
    const pendingCount = allBookings.filter(b => b.status === 'pending').length;
    const approvedCount = allBookings.filter(b => b.status === 'confirmed' && b.date === today).length;
    const rejectedCount = allBookings.filter(b => b.status === 'cancelled' && b.date === today).length;

    // Update statistics
    updateElement('approval-pending-count', pendingCount);
    updateElement('approval-today-count', todayBookings.length);
    updateElement('approval-approved-count', approvedCount);
    updateElement('approval-rejected-count', rejectedCount);
    updateElement('pending-list-count', pendingCount);
}

// Filter pending bookings
function filterPendingBookings() {
    // This would filter pending bookings based on search, status, and date
    // For now, just reload the portal
    loadApprovalPortal();
}

// Clear approval filters
function clearApprovalFilters() {
    document.getElementById('approval-search').value = '';
    document.getElementById('approval-status-filter').value = 'pending'; // Reset to show only pending
    document.getElementById('approval-date-filter').value = '';
    loadApprovalPortal();
}

// View booking details (placeholder)
function viewBookingDetails(bookingId) {
    showAlert('View booking details feature coming soon!', 'info');
}

// Event listeners
document.getElementById('booking-date').addEventListener('change', loadAvailability);
document.getElementById('user-name').addEventListener('input', checkBookingForm);
document.getElementById('user-email').addEventListener('input', checkBookingForm);
