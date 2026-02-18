# UniSpace - University Facility Booking System

A comprehensive university facility booking system built with MVC architecture using Node.js, Express, and PostgreSQL. UniSpace provides seamless facility management and booking capabilities for educational institutions.

## Features

- **Facility Management**: View and manage campus facilities
- **Booking System**: Create, view, update, and cancel bookings
- **Availability Check**: Real-time availability checking with 30-minute time slots
- **User Management**: User roles and booking history
- **Modern UI**: Responsive web interface with Bootstrap
- **RESTful API**:  Complete API with validation and error handling

## Technology Stack

### Backend
- **Node.js** - Runtime environment 
- **Express.js** - Web framework 
- **PostgreSQL** - Database 
- **Express Validator** - Input validation
- **Moment.js** - Date/time handling 

### Frontend
- **HTML5/CSS3/JavaScript** - Core technologies
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icons

## Project Structure

```
miniproject/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── facilityController.js # Facility logic
│   └── bookingController.js  # Booking logic
├── database/
│   ├── schema.sql           # Database schema
│   └── setup.js             # Database setup script
├── middleware/
│   └── validation.js        # Input validation middleware
├── models/
│   ├── Facility.js         # Facility model
│   ├── User.js            # User model
│   └── Booking.js          # Booking model
├── public/
│   ├── index.html         # Frontend interface
│   └── app.js             # Frontend JavaScript
├── routes/
│   ├── facilities.js      # Facility routes
│   └── bookings.js        # Booking routes
├── .env                   # Environment variables
├── package.json           # Dependencies
├── server.js              # Main server file
└── README.md              # This file
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE campus_booking;
   ```

2. **Configure Environment**
   Copy `.env` file and update database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=campus_booking
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

3. **Setup Database Schema**
   ```bash
   node database/setup.js
   ```

### Application Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## API Endpoints

### Facilities
- `GET /api/facilities` - Get all facilities
- `GET /api/facilities/:id` - Get specific facility
- `POST /api/facilities` - Create facility (admin)
- `PUT /api/facilities/:id` - Update facility (admin)
- `DELETE /api/facilities/:id` - Delete facility (admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get specific booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/availability/check` - Check availability
- `GET /api/bookings/user/history` - Get user bookings

### System
- `GET /` - API information
- `GET /api/health` - Health check

## Database Schema

### Users
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `email` (VARCHAR(100) UNIQUE)
- `role` (VARCHAR(20) - user/admin)
- `created_at` (TIMESTAMP)

### Facilities
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `location` (VARCHAR(200))
- `capacity` (INTEGER)
- `created_at` (TIMESTAMP)

### Bookings
- `id` (SERIAL PRIMARY KEY)
- `facility_id` (INTEGER REFERENCES facilities)
- `user_id` (INTEGER REFERENCES users)
- `date` (DATE)
- `start_time` (TIME)
- `end_time` (TIME)
- `status` (VARCHAR(20) - confirmed/cancelled/pending)
- `created_at` (TIMESTAMP)

## Usage

### For Users
1. Browse available facilities
2. Select a facility to view details
3. Choose date and available time slot
4. Enter personal information
5. Create booking
6. View and manage booking history

### For Administrators
1. Manage facilities (create, update, delete)
2. Monitor all bookings
3. Handle booking conflicts
4. Generate reports

## Features Implemented

### ✅ Task 1: Database Setup
- PostgreSQL database with required tables
- Proper relationships and constraints
- Sample data insertion
- Database setup script

### ✅ Task 2: MVC Backend
- RESTful API with all required endpoints
- Input validation and error handling
- Booking conflict detection
- Proper HTTP status codes
- MVC architecture implementation

### ✅ Task 3: Frontend Development
- Modern, responsive UI with Bootstrap
- Facility listing and details
- Real-time availability checking
- Booking creation and management
- User booking history
- Seamless frontend-backend integration

## Error Handling

The application includes comprehensive error handling:
- Database connection errors
- Validation errors with detailed messages
- Booking conflict detection
- Network error handling
- User-friendly error messages

## Security Features

- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- CORS configuration
- Error message sanitization in production

## Development Notes

- Uses MVC pattern for clean separation of concerns
- Follows RESTful API conventions
- Implements proper HTTP status codes
- Includes comprehensive validation
- Responsive design for mobile compatibility

## Future Enhancements

- User authentication and authorization
- Email notifications for bookings
- Calendar integration
- Advanced filtering and search
- Analytics and reporting dashboard
- Mobile app development

## License

MIT License - feel free to use this project for learning and development purposes.
