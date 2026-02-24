# UniSpace API Documentation

## Overview

UniSpace is a RESTful API for managing university facility bookings. This API provides endpoints for facilities, bookings, and user management with full CRUD operations, validation, and error handling.

**Base URL**: `https://unispace.onrender.com/api`
**API Version**: 1.0.0
**Content-Type**: `application/json`

## Authentication

Currently, the API uses basic user identification. Users are created/validated through the `/api/users/authenticate` endpoint. In production, implement proper JWT-based authentication.

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

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid input data
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource conflict (e.g., booking overlap)
- `500` - Internal Server Error: Server error

---

## Endpoints

### Users

#### Authenticate User
**POST** `/users/authenticate`

Authenticates a user or creates a new account if user doesn't exist.

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "any-password",
  "role": "user" // or "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "user",
    "email": "user@university.edu",
    "role": "user",
    "created_at": "2024-02-18T03:35:26.789Z"
  },
  "message": "Authentication successful"
}
```

#### Get All Users (Admin Only)
**GET** `/users`

Returns all users in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@university.edu",
      "role": "user",
      "created_at": "2024-02-18T03:35:26.789Z"
    }
  ]
}
```

---

### Facilities

#### Get All Facilities
**GET** `/facilities`

Returns all available facilities.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Computer Lab 101",
      "location": "Building A, Floor 1",
      "capacity": 30,
      "created_at": "2024-02-18T03:35:26.789Z"
    }
  ]
}
```

#### Get Specific Facility
**GET** `/facilities/{id}`

Returns details of a specific facility.

**Path Parameters:**
- `id` (integer): Facility ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Computer Lab 101",
    "location": "Building A, Floor 1",
    "capacity": 30,
    "created_at": "2024-02-18T03:35:26.789Z"
  }
}
```

#### Create Facility (Admin Only)
**POST** `/facilities`

Creates a new facility.

**Request Body:**
```json
{
  "name": "Study Room 202",
  "location": "Library, Floor 2",
  "capacity": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Study Room 202",
    "location": "Library, Floor 2",
    "capacity": 15,
    "created_at": "2024-02-18T03:35:26.789Z"
  },
  "message": "Facility created successfully"
}
```

#### Update Facility (Admin Only)
**PUT** `/facilities/{id}`

Updates an existing facility.

**Path Parameters:**
- `id` (integer): Facility ID

**Request Body:**
```json
{
  "name": "Updated Lab Name",
  "location": "New Location",
  "capacity": 25
}
```

#### Delete Facility (Admin Only)
**DELETE** `/facilities/{id}`

Deletes a facility and all associated bookings.

**Path Parameters:**
- `id` (integer): Facility ID

---

### Bookings

#### Get All Bookings (Admin Only)
**GET** `/bookings`

Returns all bookings with user and facility details.

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
      "start_time": "09:00",
      "end_time": "10:30",
      "status": "confirmed",
      "facility_name": "Computer Lab 101",
      "user_name": "John Doe",
      "user_email": "john@university.edu",
      "created_at": "2024-02-18T03:35:26.789Z"
    }
  ]
}
```

#### Get User Bookings
**GET** `/bookings/user/{userId}`

Returns bookings for a specific user.

**Path Parameters:**
- `userId` (integer): User ID

#### Create Booking
**POST** `/bookings`

Creates a new booking.

**Request Body:**
```json
{
  "facility_id": 1,
  "user_id": 1,
  "date": "2024-02-20",
  "start_time": "09:00",
  "end_time": "10:30",
  "status": "confirmed"
}
```

**Validation Rules:**
- `facility_id`: Must be a positive integer
- `user_id`: Must be a positive integer
- `date`: Must be a valid ISO date
- `start_time`: Must be in HH:MM format
- `end_time`: Must be in HH:MM format
- `status`: Must be 'confirmed', 'cancelled', or 'pending'

#### Update Booking
**PUT** `/bookings/{id}`

Updates an existing booking.

**Path Parameters:**
- `id` (integer): Booking ID

**Request Body:**
```json
{
  "facility_id": 1,
  "user_id": 1,
  "date": "2024-02-20",
  "start_time": "09:00",
  "end_time": "11:00",
  "status": "confirmed"
}
```

#### Delete Booking
**DELETE** `/bookings/{id}`

Cancels a booking.

**Path Parameters:**
- `id` (integer): Booking ID

#### Check Availability
**GET** `/bookings/availability/check`

Checks availability for a specific facility and date.

**Query Parameters:**
- `facility_id` (integer): Facility ID
- `date` (string): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "facility_id": 1,
    "date": "2024-02-20",
    "available_slots": [
      {"start_time": "08:00", "end_time": "08:30"},
      {"start_time": "08:30", "end_time": "09:00"}
    ],
    "booked_slots": [
      {"start_time": "09:00", "end_time": "10:30", "user_name": "John Doe"}
    ]
  }
}
```

---

## System Information

#### Health Check
**GET** `/health`

Returns system health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-02-18T03:35:26.789Z",
  "uptime": 3600
}
```

#### API Information
**GET** `/`

Returns API information and available endpoints.

**Response:**
```json
{
  "message": "UniSpace API - University Facility Booking System",
  "version": "1.0.0",
  "endpoints": {
    "facilities": "/api/facilities",
    "bookings": "/api/bookings",
    "users": "/api/users"
  }
}
```

---

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### Booking Conflicts
```json
{
  "success": false,
  "message": "Booking conflict: Facility is already booked for this time slot"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Facility not found"
}
```

---

## Rate Limiting

Current implementation doesn't include rate limiting. In production, implement:
- 100 requests per minute per IP
- 1000 requests per hour per user

## Security Considerations

1. **Authentication**: Implement JWT-based authentication
2. **Authorization**: Add role-based access control
3. **Input Validation**: All inputs are validated using express-validator
4. **SQL Injection**: Protected through parameterized queries
5. **CORS**: Configured for cross-origin requests

## Testing

Use the provided Postman collection in `/tests/postman-collection.json` to test all endpoints.

---

## MVC Implementation

This API follows the Model-View-Controller (MVC) pattern:

- **Models**: `/models/` - Database interaction layer
- **Controllers**: `/controllers/` - Business logic layer
- **Routes**: `/routes/` - Request routing layer
- **Views**: API responses serve as "views" in this REST API

Each controller handles specific entity operations, models manage database interactions, and routes define API endpoints.

### Create Booking
**POST** `/bookings`

Creates a new booking.

**Request Body:**
```json
{
  "facility_id": 1,
  "user_id": 1,
  "date": "2024-02-20",
  "start_time": "09:00",
  "end_time": "10:30",
  "status": "confirmed"
}
```

**Validation Rules:**
- `facility_id`: Must be a positive integer
- `user_id`: Must be a positive integer
- `date`: Must be a valid ISO date
- `start_time`: Must be in HH:MM format
- `end_time`: Must be in HH:MM format
- `status`: Must be 'confirmed', 'cancelled', or 'pending'

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "facility_id": 1,
    "user_id": 1,
    "date": "2024-02-20",
    "start_time": "09:00",
    "end_time": "10:30",
    "status": "confirmed",
    "created_at": "2024-02-18T03:35:26.789Z"
  },
  "message": "Booking created successfully"
}
```

### Get All Bookings
**GET** `/bookings`

Returns all bookings with user and facility details.

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
      "start_time": "09:00",
      "end_time": "10:30",
      "status": "confirmed",
      "facility_name": "Computer Lab 101",
      "user_name": "John Doe",
      "user_email": "john@university.edu",
      "created_at": "2024-02-18T03:35:26.789Z"
    }
  ]
}
```

### Get Booking by ID
**GET** `/bookings/{id}`

Returns a specific booking by its ID.

**Path Parameters:**
- `id` (integer): Booking ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "facility_id": 1,
    "user_id": 1,
    "date": "2024-02-20",
    "start_time": "09:00",
    "end_time": "10:30",
    "status": "confirmed",
    "facility_name": "Computer Lab 101",
    "user_name": "John Doe",
    "user_email": "john@university.edu",
    "created_at": "2024-02-18T03:35:26.789Z"
  }
}
```

### Update Booking
**PUT** `/bookings/{id}`

Updates an existing booking.

**Path Parameters:**
- `id` (integer): Booking ID

**Request Body:**
```json
{
  "facility_id": 1,
  "user_id": 1,
  "date": "2024-02-20",
  "start_time": "09:00",
  "end_time": "11:00",
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "facility_id": 1,
    "user_id": 1,
    "date": "2024-02-20",
    "start_time": "09:00",
    "end_time": "11:00",
    "status": "confirmed",
    "created_at": "2024-02-18T03:35:26.789Z"
  },
  "message": "Booking updated successfully"
}
```

### Delete Booking
**DELETE** `/bookings/{id}`

Cancels a booking.

**Path Parameters:**
- `id` (integer): Booking ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "facility_id": 1,
    "user_id": 1,
    "date": "2024-02-20",
    "start_time": "09:00",
    "end_time": "10:30",
    "status": "cancelled",
    "created_at": "2024-02-18T03:35:26.789Z"
  },
  "message": "Booking cancelled successfully"
}
```

### Check Availability
**GET** `/bookings/availability/check`

Checks availability for a specific facility and date.

**Query Parameters:**
- `facility_id` (integer): Facility ID
- `date` (string): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "facility_id": 1,
    "date": "2024-02-20",
    "available_slots": [
      {"start_time": "08:00", "end_time": "08:30"},
      {"start_time": "08:30", "end_time": "09:00"}
    ],
    "booked_slots": [
      {"start_time": "09:00", "end_time": "10:30", "user_name": "John Doe"}
    ]
  }
}
```

### Get User Bookings
**GET** `/bookings/user/{userId}`

Returns bookings for a specific user.

**Path Parameters:**
- `userId` (integer): User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "facility_id": 1,
      "date": "2024-02-20",
      "start_time": "09:00",
      "end_time": "10:30",
      "status": "confirmed",
      "facility_name": "Computer Lab 101",
      "created_at": "2024-02-18T03:35:26.789Z"
    }
  ]
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
  "message": "UniSpace API - University Facility Booking System",
  "version": "1.0.0",
  "endpoints": {
    "facilities": "/api/facilities",
    "bookings": "/api/bookings",
    "users": "/api/users"
  }
}
```

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
