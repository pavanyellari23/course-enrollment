import React, { useState } from "react";
import axios from "axios";
import "./EnrollmentForm.css";

const API_BASE_URL = "http://localhost:8000";

function EnrollmentForm({ course, onEnrollSuccess, onEnrollError }) {
  const [formData, setFormData] = useState({
    employee_name: "",
    employee_email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successAnimation, setSuccessAnimation] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_name.trim()) {
      newErrors.employee_name = "Employee name is required";
    }

    if (!formData.employee_email.trim()) {
      newErrors.employee_email = "Employee email is required";
    } else if (!isValidEmail(formData.employee_email)) {
      newErrors.employee_email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (course.available_seats <= 0) {
      onEnrollError(new Error("Course is full"));
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/enroll`, {
        course_id: course.course_id,
        employee_name: formData.employee_name,
        employee_email: formData.employee_email,
      });

      setFormData({
        employee_name: "",
        employee_email: "",
      });
      setErrors({});
      setSuccessAnimation(true);
      setTimeout(() => setSuccessAnimation(false), 1000);
      onEnrollSuccess();
    } catch (error) {
      onEnrollError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`enrollment-form-container ${successAnimation ? "success-animation" : ""}`}>
      <h2>🎓 Enroll in {course.course_name}</h2>

      {course.available_seats <= 0 && (
        <div className="form-warning">
          <span className="warning-icon">⚠️</span>
          This course is currently full. Please check back later.
        </div>
      )}

      <form onSubmit={handleSubmit} className="enrollment-form">
        <div className="form-group">
          <label htmlFor="employee_name">
            👤 Employee Name <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="employee_name"
              name="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
              placeholder="Enter full name"
              disabled={loading || course.available_seats <= 0}
              className={errors.employee_name ? "input-error" : ""}
            />
            {formData.employee_name && !errors.employee_name && (
              <span className="input-check">✓</span>
            )}
          </div>
          {errors.employee_name && (
            <span className="error-message">❌ {errors.employee_name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="employee_email">
            📧 Employee Email <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="employee_email"
              name="employee_email"
              value={formData.employee_email}
              onChange={handleChange}
              placeholder="example@company.com"
              disabled={loading || course.available_seats <= 0}
              className={errors.employee_email ? "input-error" : ""}
            />
            {formData.employee_email && !errors.employee_email && (
              <span className="input-check">✓</span>
            )}
          </div>
          {errors.employee_email && (
            <span className="error-message">❌ {errors.employee_email}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || course.available_seats <= 0}
          className={`submit-btn ${loading ? "loading" : ""}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Enrolling...
            </>
          ) : (
            <>
              ✓ Enroll Now
            </>
          )}
        </button>

        <div className="form-helper-text">
          All fields are required. We'll send a confirmation to your email.
        </div>
      </form>
    </div>
  );
}

export default EnrollmentForm;
