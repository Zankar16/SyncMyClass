import React, { useState } from "react";

function BookingButton({ subjectId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    fetch("http://localhost:5000/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subjectId,
        ...formData
      })
    })
      .then(async res => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setMessage(data?.error || `Server error: ${res.status}`);
        } else if (data?.message) {
          setMessage("Booking successful!");
          setFormData({ studentName: "", email: "", phone: "", message: "" });
          setShowForm(false); // hide form after success
        } else {
          setMessage("Booking failed. Please try again.");
        }
      })
      .catch(err => {
        setMessage(`Network error. ${err.message}`);
      })
      .finally(() => setIsSubmitting(false));
  };

  if (!showForm) {
    return (
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px" }}>
          Book Subject
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Book This Subject</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Name: </label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Email: </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Phone: </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Message: </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="3"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: "10px 20px", marginRight: "10px" }}>
          {isSubmitting ? "Booking..." : "Submit Booking"}
        </button>
        <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px" }}>
          Cancel
        </button>
      </form>
      {message && <p style={{ marginTop: "10px", color: message.includes("successful") ? "green" : "red" }}>{message}</p>}
    </div>
  );
}

export default BookingButton;