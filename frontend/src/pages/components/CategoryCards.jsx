import React from "react";

function CategoryCards({ onSelectElective }) {
  return (
    <div className="hero-panel">
      <div className="hero-copy">
        <p className="hero-subtitle">Elective Booking Simplified</p>
        <h1>Book Your Elective Subject</h1>
        <p className="hero-text">
          Choose your elective type and join the queue. We removed the extra category step so you can book quickly.
        </p>
      </div>

      <div className="choice-cards centered-cards">
        <div className="choice-card choice-card-primary" onClick={() => onSelectElective("Open Elective")}> 
          <h3>Open Elective</h3>
          <p>Choose from a range of open subjects available now.</p>
        </div>

        <div className="choice-card choice-card-secondary" onClick={() => onSelectElective("Core Elective")}> 
          <h3>Core Elective</h3>
          <p>Select a core elective without extra navigation.</p>
        </div>
      </div>
    </div>
  );
}

export default CategoryCards;
