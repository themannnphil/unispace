# UniSpace API Documentation

## Overview

UniSpace is a RESTful API for managing university facility bookings. This API provides endpoints for facilities, bookings, and user management with full CRUD operations, validation, and error handling.

## Authentication
Currently, the API uses basic user identification. In production, implement proper JWT-based authentication.

## Response Format
All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (Validation errors)
- `404` - Not Found
- `409` - Conflict (Booking conflicts)
- `500` - Internal Server Error

---

## Facilities Endpoints

### Get All Facilities
**GET** `/facilities`

Retrieves all available facilities.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Conference Room A",
      "location": "Building 1, Floor 2",
      "capacity": 20,
      "created_at": "2024-02-20T10:00:00.000Z"
    }
  ],
  "message": "Facilities retrieved successfully"
}
```

### Get Facility by ID
**GET** `/facilities/{id}`

Retrieves a specific facility by its ID.

**Parameters:**
- `id` (integer, required) - Facility ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Conference Room A",
    "location": "Building 1, Floor 2",
    "capacity": 20,
    "created_at": "2024-02-20T10:00:00.000Z"
  },
  "message": "Facility retrieved successfully"
}
```

### Create Facility
**POST** `/facilities`

Creates a new facility (Admin functionality).

**Request Body:**
```json
{
  "name": "Study Room C",
  "location": "Library, 2nd Floor",
  "capacity": 6
}
```

**Validation:**
- `name` (string, required) - Facility name
- `location` (string, required) - Facility location
- `capacity` (integer, required, > 0) - Maximum capacity

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Study Room C",
    "location": "Library, 2nd Floor",
    "capacity": 6,
    "created_at": "2024-02-20T10:00:00.000Z"
  },
  "message": "Facility created successfully"
}
```

### Update Facility
**PUT** `/facilities/{id}`

Updates an existing facility (Admin functionality).

**Parameters:**
- `id` (integer, required) - Facility ID

**Request Body:**
```json
{
  "name": "Updated Conference Room",
  "location": "Building 1, Floor 3",
  "capacity": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Conference Room",
    "location": "Building 1, Floor 3",
    "capacity": 25,
    "created_at": "2024-02-20T10:00:00.000Z"
  },
  "message": "Facility updated successfully"
}
```

### Delete Facility
**DELETE** `/facilities/{id}`

Deletes a facility (Admin functionality).

**Parameters:**
- `id` (integer, required) - Facility ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Conference Room A",
    "location": "Building 1, Floor 2",
    "capacity": 20,
    "created_at": "2024-02-20T10:00:00.000Z"
  },
  "message": "Facility deleted successfully"
}
```

---

## Bookings Endpoints

### Get All Bookings
**GET** `/bookings`

Retrieves all bookings with facility and user details.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "facility_id": 1,
      "user_id": 1,
      "date": "2024-02-20",
      "start_time": "09:00:00",
      "end_time": "10:30:00",
      "status": "confirmed",
      "facility_name": "Conference Room A",
      "user_name": "John Doe",
      "created_at": "2024-02-20T10:00:00.000Z"
    }
  ],
  "message": "Bookings retrieved successfully"
}
```

### Get Booking by ID
**GET** `/bookings/{id}`

Retrieves a specific booking by its ID.

**Parameters:**
- `id` (integer, required) - Booking ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "facility_id": 1,
    "user_id": 1,
    "date": "2024-02-20",
    "start_time": "09:00:00",
    "end_time": "10:30:00",
    "status": "confirmed",
    "facility_name": "Conference Room A",
    "user_name": "John Doe",
    "created_at": "2024-02-20T10:00:00.000Z"
  },
  "message": "Booking retrieved successfully"
}
```

### Create Booking
**POST** `/bookings`

Creates a new booking.

**Request Body:**
```json
{
  "facility_id": 1,
  "user_id": 1,
  "date": "2024-02-25",
  "start_time": "14:00:00",
  "end_time": "15:30:00",
  "status": "confirmed"
}
```

**Validation:**
- `facility_id` (integer, required, > 0) - Facility ID
- `user_id` (integer, required, > 0) - User ID
- `date` (date, required) - Booking date (ISO 8601)
- `start_time` (time, required) - Start time (HH:MM format)
- `end_time` (time, required) - End time (HH:MM format)
- `status` (string, optional) - confirmed/cancelled/pending

**Conflict Handling:**
Returns `409 Conflict` if the time slot is already booked.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "facility_id": 1,
    "user_id": 1,
    "date": "2024-02-25",
    "start_time": "14:00:00",
    "end_time": "15:30:00",
    "status": "confirmed",
    "created_at": "2024-02-20T10:00:00.000Z"
  },
  "message": "Booking created successfully"
}
```

### Update Booking
**PUT** `/bookings/{id}`

Updates an existing booking.

**Parameters:**
- `id` (integer, required) - Booking ID

**Request Body:**
```json
{
  "facility_id": 2,
  "user_id": 1,
  "date": "2024-02-25",
  "start_time": "16:00:00",
  "end_time": "17:30:00",
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "facility_id": 2,
    "user_id": 1,
    "date": "2024-02-25",
    "start_time": "16:00:00",
    "end_time": "17:30:00",
    "status": "confirmed",
    "created_at": "2024-02-20T10:00:00.000Z"
  },
  "message": "Booking updated successfully"
}
```

### Cancel Booking
**DELETE** `/bookings/{id}`

Cancels a booking (sets status to 'cancelled').

**Parameters:**
- `id` (integer, required) - Booking ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "facility_id": 1,
    "user_id": 1,
    "date": "2024-02-25",
    "start_time": "14:00:00",
    "end_time": "15:30:00",
    "status": "cancelled",
    "created_at": "2024-02-20T10:00:00.000Z"
  },
  "message": "Booking cancelled successfully"
}
```

### Check Availability
**GET** `/bookings/availability/check`

Checks available time slots for a facility on a specific date.

**Query Parameters:**
- `facility_id` (integer, required) - Facility ID
- `date` (date, required) - Date to check (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "facility_id": 1,
    "date": "2024-02-25",
    "available_slots": [
      {
        "start_time": "08:00",
        "end_time": "08:30"
      },
      {
        "start_time": "08:30",
        "end_time": "09:00"
      }
    ],
    "booked_slots": [
      {
        "start_time": "09:00:00",
        "end_time": "10:30:00"
      }
    ]
  },
  "message": "Availability retrieved successfully"
}
```

### Get User Bookings
**GET** `/bookings/user/history`

Retrieves all bookings for a specific user.

**Query Parameters:**
- `user_id` (integer, required) - User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "facility_id": 1,
      "date": "2024-02-20",
      "start_time": "09:00:00",
      "end_time": "10:30:00",
      "status": "confirmed",
      "facility_name": "Conference Room A",
      "created_at": "2024-02-20T10:00:00.000Z"
    }
  ],
  "message": "User bookings retrieved successfully"
}
```

---

## System Endpoints

### Health Check
**GET** `/health`

Checks system health and status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-02-20T10:00:00.000Z",
  "uptime": 3600.123
}
```

### API Information
**GET** `/`

Returns basic API information and available endpoints.

**Response:**
```json
{
  "message": "Campus Facility Booking System API",
  "version": "1.0.0",
  "endpoints": {
    "facilities": "/api/facilities",
    "bookings": "/api/bookings",
    "availability": "/api/bookings/availability/check"
  }
}
```

---

## Error Examples

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "location": "body",
      "param": "name",
      "msg": "Facility name is required",
      "value": ""
    }
  ]
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Facility not found"
}
```

### Booking Conflict Error (409)
```json
{
  "success": false,
  "message": "Booking conflict: Facility is already booked for this time slot"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Error retrieving facilities",
  "error": "Connection timeout"
}
```

---

## Usage Examples

### Creating a Booking Flow
1. **Check Availability:**
   ```bash
   GET /api/bookings/availability/check?facility_id=1&date=2024-02-25
   ```

2. **Create Booking:**
   ```bash
   POST /api/bookings
   {
     "facility_id": 1,
     "user_id": 1,
     "date": "2024-02-25",
     "start_time": "08:00:00",
     "end_time": "09:00:00"
   }
   ```

3. **Verify Booking:**
   ```bash
   GET /api/bookings/1
   ```

### Managing Bookings
1. **View User Bookings:**
   ```bash
   GET /api/bookings/user/history?user_id=1
   ```

2. **Cancel Booking:**
   ```bash
   DELETE /api/bookings/1
   ```

---

## Rate Limiting
Currently not implemented. Consider implementing rate limiting for production use.

## CORS
The API supports cross-origin requests. Configure allowed origins in production.

## Testing
Use tools like Postman, curl, or the frontend interface to test all endpoints.

## Notes
- All timestamps are in UTC
- Time slots are generated in 30-minute intervals from 08:00 to 22:00
- Booking conflicts are automatically detected and prevented
- The API follows RESTful conventions for consistency
