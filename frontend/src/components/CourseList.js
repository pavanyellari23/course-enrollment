import React from "react";
import "./CourseList.css";

function CourseList({ courses, selectedCourse, onSelectCourse, loading }) {
  const getCourseCategory = (courseName) => {
    if (courseName.toLowerCase().includes("react") || courseName.toLowerCase().includes("python"))
      return { label: "Dev", color: "#667eea" };
    if (courseName.toLowerCase().includes("data")) return { label: "Data", color: "#f093fb" };
    if (courseName.toLowerCase().includes("devops")) return { label: "Ops", color: "#4facfe" };
    return { label: "Other", color: "#667eea" };
  };

  const getCapacityStatus = (availableSeats, capacity) => {
    const percentage = (availableSeats / capacity) * 100;
    if (percentage === 0) return { color: "capacity-danger", status: "🔴 Full", className: "capacity-danger" };
    if (percentage > 50) return { color: "capacity-good", status: "🟢 Plenty", className: "capacity-good" };
    if (percentage > 20) return { color: "capacity-warning", status: "🟡 Limited", className: "capacity-warning" };
    return { color: "capacity-danger", status: "🔴 Almost Full", className: "capacity-danger" };
  };

  const getTrainerInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="course-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <h2>📚 Available Courses</h2>
      <div className="course-count">{courses.length} courses</div>
      <div className="course-list">
        {courses.length === 0 ? (
          <p className="no-courses">No courses available</p>
        ) : (
          courses.map((course) => {
            const category = getCourseCategory(course.course_name);
            const status = getCapacityStatus(course.available_seats, course.capacity);
            const trainerInitials = getTrainerInitials(course.trainer);

            return (
              <div
                key={course.course_id}
                className={`course-card ${
                  selectedCourse?.course_id === course.course_id ? "selected" : ""
                }`}
                onClick={() => onSelectCourse(course)}
              >
                <div className="course-header">
                  <div className="course-title-section">
                    <h3>{course.course_name}</h3>
                    <span className="course-id">{course.course_id}</span>
                  </div>
                  <span
                    className="category-badge"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.label}
                  </span>
                </div>

                <div className="course-trainer-section">
                  <div
                    className="trainer-avatar"
                    style={{ backgroundColor: category.color }}
                  >
                    {trainerInitials}
                  </div>
                  <div>
                    <p className="trainer-label">Trainer</p>
                    <p className="trainer-name">{course.trainer}</p>
                  </div>
                </div>

                <div className="course-capacity">
                  <div className="capacity-header">
                    <span className="capacity-label">Capacity: {course.capacity}</span>
                    <span className={`status-badge ${status.className}`}>
                      {status.status}
                    </span>
                  </div>
                  <div className={`capacity-bar ${status.className}`}>
                    <div
                      className="capacity-fill"
                      style={{
                        width: `${((course.capacity - course.available_seats) / course.capacity) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="capacity-footer">
                    <span className="enrolled">
                      {course.capacity - course.available_seats} enrolled
                    </span>
                    <span className="available-seats">
                      {course.available_seats} available
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CourseList;
