import React from "react";
import { Link } from "react-router-dom";

const SubjectCard = ({ subject }) => {
  return (
    <div style={{
      width: "250px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      overflow: "hidden",
      margin: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <img
        src={subject.image}
        alt={subject.name}
        style={{ width: "100%", height: "150px", objectFit: "cover" }}
      />

      <div style={{ padding: "10px" }}>
        <h3>{subject.name}</h3>
        <p>{subject.desc}</p>

        <Link to={`/subject/${subject.id}`}>
          <button style={{
            width: "100%",
            padding: "8px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}>
            Open
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SubjectCard;
