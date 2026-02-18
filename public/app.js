const API_BASE = '/api';

let currentFacility = null;
let selectedTimeSlot = null;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('booking-date').min = today;
    document.getElementById('booking-date').value = today;
    
    // Load facilities
    loadFacilities();
});

// Show different sections
function showSection(section) {
    const sections = ['facilities', 'booking', 'bookings'];
    sections.forEach(s => {
        const element = document.getElementById(`${s}-section`);
        if (element) {
            element.style.display = s === section ? 'block' : 'none';
        }
    });
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
                        <button class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-calendar-plus"></i> Book Now
                        </button>
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
            document.getElementById('facility-name').textContent = `Book ${currentFacility.name}`;
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
        user_id: 1, // Using default user ID for demo
        date: date,
        start_time: selectedTimeSlot.start_time,
        end_time: selectedTimeSlot.end_time,
        status: 'confirmed'
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
            document.getElementById('user-name').value = '';
            document.getElementById('user-email').value = '';
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
    const userEmail = document.getElementById('user-email-bookings').value.trim();
    
    if (!userEmail) {
        showAlert('Please enter your email', 'warning');
        return;
    }
    
    // For demo purposes, we'll use a fixed user ID
    // In a real app, you'd authenticate the user first
    const userId = 1;
    
    try {
        const response = await fetch(`${API_BASE}/bookings/user/history?user_id=${userId}`);
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
