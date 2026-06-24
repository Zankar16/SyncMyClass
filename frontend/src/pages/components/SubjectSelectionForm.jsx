import React, { useState, useEffect } from "react";

function SubjectSelectionForm({ electiveType, studentId, onBack, onSubmitSuccess }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subjectDetails, setSubjectDetails] = useState({});

  // Form validation state
  const [formData, setFormData] = useState({
    preferenceOrder: "1"
  });

  useEffect(() => {
    // Fetch available subjects for this elective type
    fetch(`/api/subjects/available?electiveType=${electiveType}`)
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load subjects: " + err.message);
        setLoading(false);
      });
  }, [electiveType]);

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    
    // Find subject details
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (subject) {
      setSubjectDetails(subject);
    }
  };

  const validateForm = () => {
    if (!selectedSubject) {
      setError("Please select a subject");
      return false;
    }

    const subject = subjects.find(s => s.id === parseInt(selectedSubject));
    if (!subject) {
      setError("Invalid subject selected");
      return false;
    }

    if (subject.available_seats <= 0) {
      setError("This subject is now full. Please select another subject.");
      return false;
    }

    if (!formData.preferenceOrder || parseInt(formData.preferenceOrder) < 1 || parseInt(formData.preferenceOrder) > 3) {
      setError("Preference order must be between 1 and 3");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          subjectId: parseInt(selectedSubject),
          electiveType,
          preferenceOrder: parseInt(formData.preferenceOrder)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Subject selected successfully! You will be allocated a faculty within 2-3 hours.");
        setSubmitting(false);
        setTimeout(() => {
          onSubmitSuccess();
        }, 2000);
      } else {
        setError(data.message || "Booking failed");
        setSubmitting(false);
      }
    } catch (err) {
      setError("Error submitting form: " + err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Loading subjects...</div>;
  }

  return (
    <div className="page-card form-card">
      <button
        className="secondary-button"
        onClick={onBack}
      >
        ← Back
      </button>

      <h1 className="section-title">{electiveType} - Subject Selection</h1>

      {error && (
        <div className="error-card">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="success-card">
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="subject" className="form-label">
            Select Subject *
          </label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={handleSubjectChange}
            required
            className="form-select"
          >
            <option value="">-- Select a Subject --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.available_seats} seats available)
              </option>
            ))}
          </select>
        </div>

        {subjectDetails && Object.keys(subjectDetails).length > 0 && (
          <div className="info-card">
            <h3>{subjectDetails.name}</h3>
            <p><strong>Max Seats:</strong> {subjectDetails.max_seats}</p>
            <p><strong>Available Seats:</strong> {subjectDetails.available_seats}</p>
            <p><strong>Booked:</strong> {subjectDetails.max_seats - subjectDetails.available_seats}</p>
            <p><strong>Syllabus:</strong> {subjectDetails.syllabus || "N/A"}</p>
          </div>
        )}

        <div className="form-row">
          <label htmlFor="preference" className="form-label">
            Preference Order * (1st, 2nd, or 3rd choice)
          </label>
          <select
            id="preference"
            value={formData.preferenceOrder}
            onChange={(e) => setFormData({ ...formData, preferenceOrder: e.target.value })}
            required
            className="form-select"
          >
            <option value="1">1st Choice</option>
            <option value="2">2nd Choice</option>
            <option value="3">3rd Choice</option>
          </select>
        </div>

        <div className="note-card">
          <strong>ℹ️ Note:</strong> Faculty allocation will be completed within 2-3 hours. You will receive confirmation via email.
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="button-primary"
          style={submitting ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          {submitting ? "Processing..." : "Confirm Selection"}
        </button>
      </form>

      <div className="validation-card">
        <strong>Validation Rules:</strong>
        <ul>
          <li>Subject must be selected</li>
          <li>Subject must have available seats</li>
          <li>Preference order must be valid (1st, 2nd, or 3rd choice)</li>
          <li>Only one booking per student per elective type</li>
        </ul>
      </div>
    </div>
  );
}

export default SubjectSelectionForm;
