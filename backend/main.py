from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import json
import os
from uuid import uuid4
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
COURSES_FILE = os.path.join(DATA_DIR, "courses.json")
ENROLLMENTS_FILE = os.path.join(DATA_DIR, "enrollments.json")

os.makedirs(DATA_DIR, exist_ok=True)


def load_courses():
    if os.path.exists(COURSES_FILE):
        with open(COURSES_FILE, "r") as f:
            return json.load(f)
    return []


def load_enrollments():
    if os.path.exists(ENROLLMENTS_FILE):
        with open(ENROLLMENTS_FILE, "r") as f:
            return json.load(f)
    return []


def save_courses(courses):
    with open(COURSES_FILE, "w") as f:
        json.dump(courses, f, indent=2)


def save_enrollments(enrollments):
    with open(ENROLLMENTS_FILE, "w") as f:
        json.dump(enrollments, f, indent=2)


def get_course_by_id(course_id):
    courses = load_courses()
    for course in courses:
        if course["course_id"] == course_id:
            return course
    return None


def count_enrollments_for_course(course_id):
    enrollments = load_enrollments()
    return sum(1 for e in enrollments if e["course_id"] == course_id)


def is_already_enrolled(course_id, email):
    enrollments = load_enrollments()
    return any(
        e["course_id"] == course_id and e["employee_email"].lower() == email.lower()
        for e in enrollments
    )


def validate_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


async def get_courses(request):
    courses = load_courses()
    result = []
    for course in courses:
        enrolled_count = count_enrollments_for_course(course["course_id"])
        available = max(0, course["capacity"] - enrolled_count)
        result.append({
            "course_id": course["course_id"],
            "course_name": course["course_name"],
            "trainer": course["trainer"],
            "capacity": course["capacity"],
            "available_seats": available,
        })
    return JSONResponse(result)


async def enroll_employee(request):
    try:
        data = await request.json()
    except:
        return JSONResponse({"detail": "Invalid JSON"}, status_code=400)

    course_id = data.get("course_id", "").strip()
    employee_name = data.get("employee_name", "").strip()
    employee_email = data.get("employee_email", "").strip()

    # Validation
    if not employee_name:
        return JSONResponse(
            {"detail": "Employee name is required"}, status_code=400
        )

    if not employee_email:
        return JSONResponse(
            {"detail": "Employee email is required"}, status_code=400
        )

    if not validate_email(employee_email):
        return JSONResponse(
            {"detail": "Please enter a valid email address"}, status_code=400
        )

    # Business rules
    course = get_course_by_id(course_id)
    if not course:
        return JSONResponse({"detail": "Course not found"}, status_code=404)

    enrolled_count = count_enrollments_for_course(course_id)
    if enrolled_count >= course["capacity"]:
        return JSONResponse(
            {"detail": "Course is full, cannot enroll more employees"},
            status_code=400,
        )

    if is_already_enrolled(course_id, employee_email):
        return JSONResponse(
            {"detail": "Employee is already enrolled in this course"},
            status_code=400,
        )

    enrollment = {
        "enrollment_id": str(uuid4()),
        "course_id": course_id,
        "employee_name": employee_name,
        "employee_email": employee_email.lower(),
    }

    enrollments = load_enrollments()
    enrollments.append(enrollment)
    save_enrollments(enrollments)

    return JSONResponse(enrollment, status_code=201)


async def get_course_enrollments(request):
    course_id = request.path_params["course_id"]

    course = get_course_by_id(course_id)
    if not course:
        return JSONResponse({"detail": "Course not found"}, status_code=404)

    enrollments = load_enrollments()
    course_enrollments = [e for e in enrollments if e["course_id"] == course_id]
    enrolled_count = len(course_enrollments)
    available = max(0, course["capacity"] - enrolled_count)

    return JSONResponse({
        "course_id": course["course_id"],
        "course_name": course["course_name"],
        "enrollments": course_enrollments,
        "available_seats": available,
    })


async def cancel_enrollment(request):
    enrollment_id = request.path_params["enrollment_id"]

    enrollments = load_enrollments()
    enrollment = next(
        (e for e in enrollments if e["enrollment_id"] == enrollment_id), None
    )

    if not enrollment:
        return JSONResponse({"detail": "Enrollment not found"}, status_code=404)

    enrollments = [e for e in enrollments if e["enrollment_id"] != enrollment_id]
    save_enrollments(enrollments)

    return JSONResponse({"message": "Enrollment cancelled successfully"})


async def health_check(request):
    return JSONResponse({"status": "ok"})


routes = [
    Route("/courses", get_courses, methods=["GET"]),
    Route("/enroll", enroll_employee, methods=["POST"]),
    Route("/courses/{course_id}/enrollments", get_course_enrollments, methods=["GET"]),
    Route("/enrollments/{enrollment_id}", cancel_enrollment, methods=["DELETE"]),
    Route("/health", health_check, methods=["GET"]),
]

app = Starlette(debug=True, routes=routes)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
