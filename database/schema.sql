-- UniSpace Database Schema
-- University Facility Booking System

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS facilities;
DROP TABLE IF EXISTS users;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Facilities table
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT unique_booking UNIQUE (facility_id, date, start_time, end_time)
);

-- Insert sample data
INSERT INTO users (name, email, role) VALUES
('John Doe', 'john.doe@university.edu', 'user'),
('Jane Smith', 'jane.smith@university.edu', 'admin'),
('Mike Johnson', 'mike.johnson@university.edu', 'user');

INSERT INTO facilities (name, location, capacity) VALUES
('Conference Room A', 'Building 1, Floor 2', 20),
('Computer Lab 101', 'Engineering Building, Room 101', 30),
('Study Room B', 'Library, 3rd Floor', 8),
('Lecture Hall 5', 'Main Building, Room 501', 150),
('Room 6', 'Pent Hall, 1st Floor', 4),
('Lecture Room SF-F1', 'SES Main Building, Room 1', 79);

INSERT INTO bookings (facility_id, user_id, date, start_time, end_time, status) VALUES
(1, 1, '2024-02-20', '09:00:00', '10:30:00', 'confirmed'),
(2, 2, '2024-02-20', '14:00:00', '16:00:00', 'confirmed'),
(3, 1, '2024-02-21', '10:00:00', '11:00:00', 'pending');
