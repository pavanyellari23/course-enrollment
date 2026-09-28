import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CourseDetails.css";

const API_BASE_URL = "http://localhost:8000";

function CourseDetails({ course, onCancelEnrollment }) {
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseEnrollments();
  }, [course.course_id]);

  const fetchCourseEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses/${course.course_id}/enrollments`
      );
      setEnrollmentDetails(response.data);
    } catch (err) {
      setError("Failed to load course details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = async (enrollmentId, employeeName) => {
    if (
      window.confirm(
        `Are you sure you want to cancel the enrollment for ${employeeName}?`
      )
    ) {
      onCancelEnrollment(enrollmentId);
    }
  };

  const getEmployeeInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getColorByIndex = (index) => {
    const colors = ["#667eea", "#f093fb", "#4facfe", "#00f2fe", "#43e97b", "#fa709a"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="course-details-container">
        <div className="details-spinner">
          <div className="mini-spinner"></div>
          <p className="loading-text">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-details-container">
        <p className="error-text">⚠️ {error}</p>
      </div>
    );
  }

  if (!enrollmentDetails) {
    return null;
  }

  const totalEnrolled = enrollmentDetails.enrollments.length;
  const totalCapacity = totalEnrolled + enrollmentDetails.available_seats;
  const enrollmentPercentage = (totalEnrolled / totalCapacity) * 100;

  return (
    <div className="course-details-container">
      <div className="course-details-header">
        <h2>👨‍💼 {enrollmentDetails.course_name}</h2>
        <div className="seats-summary-grid">
          <div className="seat-stat">
            <div className="seat-stat-icon">💺</div>
            <div className="seat-stat-content">
              <div className="stat-value">{enrollmentDetails.available_seats}</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
          <div className="seat-stat">
            <div className="seat-stat-icon">👥</div>
            <div className="seat-stat-content">
              <div className="stat-value">{totalEnrolled}</div>
              <div className="stat-label">Enrolled</div>
            </div>
          </div>
          <div className="seat-stat">
            <div className="seat-stat-icon">📊</div>
            <div className="seat-stat-content">
              <div className="stat-value">{Math.round(enrollmentPercentage)}%</div>
              <div className="stat-label">Full</div>
            </div>
          </div>
        </div>

        <div className="enrollment-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${enrollmentPercentage}%` }}
            />
          </div>
          <p className="progress-text">
            {totalEnrolled} of {totalCapacity} seats filled
          </p>
        </div>
      </div>

      <div className="enrollments-section">
        <h3>📝 Current Enrollments</h3>

        {enrollmentDetails.enrollments.length === 0 ? (
          <div className="no-enrollments">
            <div className="empty-icon">📭</div>
            <p>No employees enrolled in this course yet.</p>
            <p className="subtext">Be the first to enroll!</p>
          </div>
        ) : (
          <div className="enrollments-list">
            {enrollmentDetails.enrollments.map((enrollment, index) => (
              <div
                key={enrollment.enrollment_id}
                className="enrollment-item"
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <div className="enrollment-avatar-section">
                  <div
                    className="employee-avatar"
                    style={{ backgroundColor: getColorByIndex(index) }}
                  >
                    {getEmployeeInitials(enrollment.employee_name)}
                  </div>
                  <div className="enrollment-info">
                    <p className="employee-name">✓ {enrollment.employee_name}</p>
                    <p className="employee-email">📧 {enrollment.employee_email}</p>
                  </div>
                </div>
                <button
                  className="cancel-btn"
                  onClick={() =>
                    handleCancelClick(
                      enrollment.enrollment_id,
                      enrollment.employee_name
                    )
                  }
                  title="Cancel enrollment"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetails;
