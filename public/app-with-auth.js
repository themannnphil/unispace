const API_BASE = '/api';

let currentFacility = null;
let selectedTimeSlot = null;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }
    
    // Setup login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
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
        const response = await fetch(`${API_BASE}/users/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password, // Still accepts any password for demo
                role: isAdmin ? 'admin' : 'user'
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
        showSection('manage-facilities');
    } else {
        showSection('facilities');
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-form').reset();
    showAlert('Logged out successfully', 'success');
}

// Show different sections
function showSection(section) {
    const sections = ['facilities', 'booking', 'bookings', 'manage-facilities', 'all-bookings'];
    sections.forEach(s => {
        const element = document.getElementById(`${s}-section`);
        if (element) {
            element.style.display = s === section ? 'block' : 'none';
        }
    });
    
    // Load section-specific data
    switch(section) {
        case 'facilities':
            loadFacilities();
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
        status: 'confirmed',
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

// Load user bookings
async function loadUserBookings() {
    try {
        const response = await fetch(`${API_BASE}/bookings/user/history?user_id=${currentUser.id}`);
        const result = await response.json();
        
        if (result.success) {
            displayUserBookings(result.data);
        } else {
            showAlert('Error loading bookings', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading bookings', 'danger');
        console.error('Error:', error);
    }
}

// Display user bookings
function displayUserBookings(bookings) {
    const container = document.getElementById('user-bookings-list');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-muted">No bookings found</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="card booking-card mb-3 ${booking.status === 'cancelled' ? 'cancelled' : ''}">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="card-title">
                            <i class="fas fa-building text-primary"></i> ${booking.facility_name}
                        </h6>
                        <p class="card-text mb-1">
                            <i class="fas fa-calendar text-muted"></i> ${booking.date}<br>
                            <i class="fas fa-clock text-muted"></i> ${booking.start_time} - ${booking.end_time}
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <span class="badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-danger'}">
                            ${booking.status}
                        </span><br>
                        ${booking.status === 'confirmed' ? `
                            <button class="btn btn-sm btn-outline-danger mt-2" onclick="cancelBooking(${booking.id})">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
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
    document.getElementById('add-facility-form').style.display = 'block';
}

// Hide add facility form
function hideAddFacilityForm() {
    document.getElementById('add-facility-form').style.display = 'none';
    resetFacilityForm();
}

// Handle add facility
async function handleAddFacility(e) {
    e.preventDefault();
    
    const facilityData = {
        name: document.getElementById('facility-name').value,
        location: document.getElementById('facility-location').value,
        capacity: parseInt(document.getElementById('facility-capacity').value)
    };
    
    try {
        const response = await fetch(`${API_BASE}/facilities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(facilityData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Facility added successfully!', 'success');
            hideAddFacilityForm();
            loadAdminFacilities();
        } else {
            showAlert(result.message || 'Error adding facility', 'danger');
        }
    } catch (error) {
        showAlert('Network error adding facility', 'danger');
        console.error('Error:', error);
    }
}

// Load admin facilities
async function loadAdminFacilities() {
    try {
        const response = await fetch(`${API_BASE}/facilities`);
        const result = await response.json();
        
        if (result.success) {
            displayAdminFacilities(result.data);
        } else {
            showAlert('Error loading facilities', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading facilities', 'danger');
        console.error('Error:', error);
    }
}

// Display admin facilities with management options
function displayAdminFacilities(facilities) {
    const container = document.getElementById('admin-facilities-list');
    
    if (facilities.length === 0) {
        container.innerHTML = '<p class="text-muted">No facilities available</p>';
        return;
    }
    
    container.innerHTML = facilities.map(facility => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="card-title">
                            <i class="fas fa-building text-primary"></i> ${facility.name}
                        </h5>
                        <p class="card-text">
                            <i class="fas fa-map-marker-alt text-muted"></i> ${facility.location}<br>
                            <i class="fas fa-users text-muted"></i> Capacity: ${facility.capacity} people<br>
                            <small class="text-muted">ID: ${facility.id}</small>
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-warning me-2" onclick="editFacility(${facility.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteFacility(${facility.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load all bookings (admin)
async function loadAllBookings() {
    try {
        const response = await fetch(`${API_BASE}/bookings`);
        const result = await response.json();
        
        console.log('All bookings API response:', result); // Debug log
        
        if (result.success) {
            displayAllBookings(result.data);
        } else {
            showAlert('Error loading bookings', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading bookings', 'danger');
        console.error('Error:', error);
    }
}

// Display all bookings (admin view)
function displayAllBookings(bookings) {
    console.log('Displaying bookings:', bookings); // Debug log
    
    const container = document.getElementById('all-bookings-list');
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p class="text-muted">No bookings found</p>';
        return;
    }
    
    // Check if bookings have the required fields
    console.log('First booking data:', bookings[0]); // Debug first booking
    
    let html = '';
    bookings.forEach((booking, index) => {
        console.log(`Booking ${index}:`, booking); // Debug each booking
        html += `
            <div class="card booking-card mb-3 ${booking.status === 'cancelled' ? 'cancelled' : ''}">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <h6 class="card-title">
                                <i class="fas fa-building text-primary"></i> ${booking.facility_name || 'Unknown Facility'}
                            </h6>
                        </div>
                        <div class="col-md-3">
                            <p class="card-text mb-1">
                                <i class="fas fa-user text-muted"></i> ${booking.user_name || 'Unknown User'}<br>
                                <i class="fas fa-envelope text-muted"></i> ${booking.user_email || 'N/A'}
                            </p>
                        </div>
                        <div class="col-md-3">
                            <p class="card-text mb-1">
                                <i class="fas fa-calendar text-muted"></i> ${booking.date || 'N/A'}<br>
                                <i class="fas fa-clock text-muted"></i> ${booking.start_time || 'N/A'} - ${booking.end_time || 'N/A'}
                            </p>
                        </div>
                        <div class="col-md-3 text-end">
                            <span class="badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-danger'}">
                                ${booking.status || 'Unknown'}
                            </span><br>
                            <small class="text-muted">Booking ID: ${booking.id || 'N/A'}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('HTML set for bookings container'); // Debug log
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
            newForm.addEventListener('submit', function(e) {
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
    
    console.log('Updating facility:', facilityId, facilityData); // Debug log
    
    try {
        const response = await fetch(`${API_BASE}/facilities/${facilityId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(facilityData)
        });
        
        const result = await response.json();
        console.log('Update response:', result); // Debug log
        
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
    
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}

// Event listeners
document.getElementById('booking-date').addEventListener('change', loadAvailability);
document.getElementById('user-name').addEventListener('input', checkBookingForm);
document.getElementById('user-email').addEventListener('input', checkBookingForm);
