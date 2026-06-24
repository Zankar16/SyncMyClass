import React, { useEffect, useState } from "react";
import { subjects as fallbackSubjects } from "../data";
import BookingButton from "./BookingButton";

function SubjectList({ categoryId, onSelect, onBack }) {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!categoryId) return;

    let cancelled = false;

    fetch(`/subjects/${categoryId}`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        if (!cancelled) setSubjects(data);
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = fallbackSubjects.filter(sub => sub.categoryId === categoryId);
          setSubjects(fallback);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: "16px" }}>
        ← Back to categories
      </button>
      <h2>Subjects</h2>

      <div className="choice-cards">
        {subjects.map(sub => (
          <div
            key={sub.id}
            className="choice-card"
            onClick={() => onSelect(sub.id)}
            style={{ cursor: "pointer" }}
          >
            <h3>{sub.name}</h3>
            <p><strong>Topics:</strong> {sub.topics}</p>
            {sub.pdf_url && (
              <a
                href={sub.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'blue', textDecoration: 'underline' }}
                onClick={e => e.stopPropagation()}
              >
                Download PDF
              </a>
            )}
            <div onClick={e => e.stopPropagation()}>
              <BookingButton subjectId={sub.id} />
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && <p>No subjects found for this category.</p>}
    </div>
  );
}

export default SubjectList;