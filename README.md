# HRMS Backend

A robust backend system for a Human Resource Management System (HRMS), built with Node.js, Express, and MongoDB. This API provides functionalities for managing employees, tracking attendance, and handling departments.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ORM:** Mongoose
- **Environment Management:** dotenv
- **Middleware:** cors

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) instance (Local or Atlas)

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd hrms-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following:
```env
MONGODB_URL=your_mongodb_connection_string
PORT=5000
```

### 4. Seed Initial Data (Optional)
To populate the database with default departments, run:
```bash
node seedDepartments.js
```

### 5. Run the Application
```bash
npm start
```
The server will start running on the port specified in your `.env` file (default: 5001).

## API Endpoints

### Employees (`/api/v1/employees`)
- `POST /` - Add a new employee
- `GET /` - Get all employees
- `GET /:id` - Get employee by ID
- `PUT /:id` - Update employee details
- `DELETE /:id` - Remove an employee

### Attendance (`/api/v1/attendance`)
- `POST /` - Mark attendance
- `GET /dashboard` - Get dashboard summary
- `GET /employee/:employeeId` - Get attendance history for a specific employee

### Departments (`/api/v1/departments`)
- `POST /` - Add a new department
- `GET /` - List all departments
- `DELETE /:id` - Delete a department

## Project Structure
- `controllers/`: Logic for handling API requests.
- `models/`: Mongoose schemas for MongoDB.
- `routes/`: Express route definitions.
- `app.js`: App configuration and middleware setup.
- `server.js`: Entry point of the application.

## Assumptions & Limitations
- **Authentication:** Currently, the API does not implement JWT or session-based authentication.
- **Validation:** Basic validation is handled by Mongoose schemas.
- **File Uploads:** There is no support for profile picture uploads in the current version.
