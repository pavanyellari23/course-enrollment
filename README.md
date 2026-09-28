# Course Enrollment System

A full-stack course enrollment application built with React, FastAPI, and local JSON storage. Employees can browse courses and enroll in professional development programs with comprehensive validation and business rule enforcement.

## Architecture Overview

### Technology Stack
- **Backend**: Python with FastAPI
- **Frontend**: React 18
- **Data Storage**: Local JSON files
- **API Communication**: Axios (HTTP client)
- **Styling**: Custom CSS

### Data Structure Design

The application uses **two separate JSON files** for data storage:

#### Decision Rationale
Using separate files for courses and enrollments provides:
- **Clear separation of concerns**: Courses are reference data (stable), enrollments are transactional (frequently updated)
- **Simpler access patterns**: Each concern manages its own data lifecycle
- **Easier validation logic**: Can validate enrollments independently against the courses file
- **Better scalability**: If moving to a database, this structure maps naturally to separate tables

#### Data Models

**Courses** (`data/courses.json`):
```json
[
  {
    "course_id": "REACT-101",
    "course_name": "React Fundamentals",
    "trainer": "Sarah Johnson",
    "capacity": 30
  }
]
```

**Enrollments** (`data/enrollments.json`):
```json
[
  {
    "enrollment_id": "ENR-001",
    "course_id": "REACT-101",
    "employee_name": "John Smith",
    "employee_email": "john.smith@company.com"
  }
]
```

## Features

### Backend (FastAPI)

#### Endpoints

**GET /courses**
- Returns all available courses with calculated available-seat counts
- Response includes capacity and current enrollment statistics

**POST /enroll**
- Enrolls an employee in a course
- Validates all business rules before enrollment
- Returns the created enrollment record

**GET /courses/{course_id}/enrollments**
- Returns all enrollments for a specific course
- Includes course details and available-seat count
- Useful for viewing who is enrolled in a course

**DELETE /enrollments/{enrollment_id}**
- Cancels an enrollment and frees up a seat
- Validates that the enrollment exists

#### Validation & Business Rules

**FastAPI enforces all business rules:**
- ✓ Employee name is required and cannot be empty
- ✓ Employee email must be valid (using Pydantic EmailStr)
- ✓ Course capacity must be greater than zero
- ✓ Same email cannot enroll twice in the same course
- ✓ Cannot enroll in a full course
- ✓ Automatic available-seat calculation

**Error Responses:**
- `404 Not Found`: Course or enrollment doesn't exist
- `400 Bad Request`: Validation failures, duplicate enrollments, or full course

### Frontend (React)

**Main Features:**
1. **Course Browser**: List all courses with available seat indicators
2. **Course Selection**: Click a course to view details and enrollment form
3. **Enrollment Form**: Form with validation for employee name and email
4. **Course Details**: View current enrollments and cancel existing enrollments
5. **Real-time Updates**: UI refreshes after successful enrollments/cancellations
6. **Toast Notifications**: Success and error messages with auto-dismiss
7. **Responsive Design**: Works on desktop and tablet layouts

**Components:**
- `App.js`: Main app component managing state and API communication
- `CourseList.js`: Displays available courses with capacity visualization
- `CourseDetails.js`: Shows enrollments for selected course
- `EnrollmentForm.js`: Form for enrolling new employees

## Setup & Running

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`
   - Interactive API docs: `http://localhost:8000/docs`
   - Alternative API docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will automatically open at `http://localhost:3000`

## Usage Example

1. **View Courses**: The home page displays all available courses with seat availability
2. **Select a Course**: Click any course card to view its details
3. **View Enrollments**: See who is currently enrolled in the selected course
4. **Enroll an Employee**: Fill in the name and email, then click "Enroll Now"
5. **Cancel Enrollment**: Click the × button next to an enrollment to remove it

## Data Persistence

- Courses are loaded from `data/courses.json` at startup
- Enrollments are persisted to `data/enrollments.json` with each change
- Changes persist across server restarts
- Initial seed data includes 4 courses and 5 sample enrollments

## Testing the Validation

### Try these scenarios:

1. **Duplicate enrollment**: Try enrolling the same email in the same course twice
   - Error: "Employee is already enrolled in this course"

2. **Full course**: Enroll more employees to fill up a course (based on capacity)
   - Error: "Course is full, cannot enroll more employees"

3. **Invalid email**: Try submitting a form without @ symbol
   - Error: "Please enter a valid email address" (client-side)

4. **Empty name**: Try enrolling without a name
   - Error: "Employee name is required"

5. **Cancel and re-enroll**: Cancel an enrollment, then enroll the same employee again
   - Should succeed (validates that cancellation frees up the spot)

## Project Structure

```
Course_Enrollment/
├── backend/
│   ├── main.py                 # FastAPI application
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── App.js              # Main app component
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── components/
│   │       ├── CourseList.js
│   │       ├── CourseList.css
│   │       ├── CourseDetails.js
│   │       ├── CourseDetails.css
│   │       ├── EnrollmentForm.js
│   │       └── EnrollmentForm.css
│   └── package.json            # Node dependencies
├── data/
│   ├── courses.json            # Course master data
│   └── enrollments.json        # Enrollment records
└── README.md
```

## Key Design Decisions

### JSON Storage over Database
- **Pros**: Simple setup, no external dependencies, easy to inspect/debug data
- **Cons**: Not suitable for high concurrency; for production, migrate to PostgreSQL or similar

### Separate Course & Enrollment Files
- Makes validation logic clear and maintainable
- Available-seat calculation is computed on-demand (no redundant storage)
- Each file has a single responsibility

### Server-Side Validation
- All business rules enforced by FastAPI, not the client
- Prevents invalid data from being persisted
- Ensures API security regardless of client implementation

### Real-Time UI Updates
- After enrollment/cancellation, frontend refetches all course data
- Ensures UI stays in sync with backend state
- Simple but effective for small datasets

## Error Handling

The application handles errors gracefully:
- **API errors**: Displayed as toast messages with specific error details
- **Network errors**: Fallback message if backend is not running
- **Validation errors**: Client-side validation before submission, server-side as final check
- **Missing data**: Proper 404 handling with user-friendly messages

## Notes for Deployment

If deploying to production:
1. Switch from local JSON files to a proper database (PostgreSQL, MongoDB, etc.)
2. Add authentication/authorization
3. Implement request logging and monitoring
4. Set up CORS properly for specific domains
5. Add rate limiting and pagination for large datasets
6. Implement proper error logging and alerting
