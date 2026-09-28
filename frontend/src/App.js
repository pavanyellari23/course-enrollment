import React, { useState, useEffect } from "react";
import axios from "axios";
import CourseList from "./components/CourseList";
import EnrollmentForm from "./components/EnrollmentForm";
import CourseDetails from "./components/CourseDetails";
import "./App.css";

const API_BASE_URL = "http://localhost:8000";

function App() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`);
      setCourses(response.data);
      setMessage({ type: "", text: "" });
    } catch (error) {
      showMessage(
        "error",
        "Failed to load courses. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleEnrollSuccess = async () => {
    showMessage("success", "🎉 Enrollment successful!");
    await fetchCourses();
    if (selectedCourse) {
      setSelectedCourse(null);
    }
  };

  const handleEnrollError = (error) => {
    const errorText =
      error.response?.data?.detail ||
      error.message ||
      "Enrollment failed. Please try again.";
    showMessage("error", errorText);
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    try {
      await axios.delete(`${API_BASE_URL}/enrollments/${enrollmentId}`);
      showMessage("success", "✓ Enrollment cancelled successfully!");
      await fetchCourses();
      if (selectedCourse) {
        setSelectedCourse(null);
      }
    } catch (error) {
      const errorText =
        error.response?.data?.detail ||
        error.message ||
        "Failed to cancel enrollment.";
      showMessage("error", errorText);
    }
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
  };

  const totalEnrollments = courses.reduce(
    (sum, c) => sum + (c.capacity - c.available_seats),
    0
  );
  const totalAvailable = courses.reduce((sum, c) => sum + c.available_seats, 0);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 Course Enrollment System</h1>
        <p>Enroll employees in professional development courses</p>
      </header>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-number">{courses.length}</div>
            <div className="stat-label">Courses Available</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{totalEnrollments}</div>
            <div className="stat-label">Total Enrollments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💺</div>
          <div className="stat-content">
            <div className="stat-number">{totalAvailable}</div>
            <div className="stat-label">Available Seats</div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`message message-${message.type}`}>
          <span>{message.text}</span>
          <button
            className="message-close"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            ×
          </button>
        </div>
      )}

      <div className="app-content">
        <div className="left-panel">
          <CourseList
            courses={courses}
            selectedCourse={selectedCourse}
            onSelectCourse={handleSelectCourse}
            loading={loading}
          />
        </div>

        <div className="right-panel">
          {selectedCourse ? (
            <>
              <CourseDetails
                course={selectedCourse}
                onCancelEnrollment={handleCancelEnrollment}
              />
              <EnrollmentForm
                course={selectedCourse}
                onEnrollSuccess={handleEnrollSuccess}
                onEnrollError={handleEnrollError}
              />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👆</div>
              <p>Select a course to view details and enroll</p>
              <p className="empty-subtext">Click on any course card to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
