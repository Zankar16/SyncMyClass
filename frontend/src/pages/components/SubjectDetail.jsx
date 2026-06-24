import React, { useEffect, useState } from "react";
import BookingButton from "./BookingButton";
import { subjects as fallbackSubjects } from "../data";

function SubjectDetail({ subjectId, onBack }) {
  const [subject, setSubject] = useState(null);

  useEffect(() => {
    if (!subjectId) return;

    let cancelled = false;

    fetch(`/subjects/detail/${subjectId}`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        if (!cancelled) setSubject(data);
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = fallbackSubjects.find(sub => sub.id === subjectId);
          setSubject(fallback || { id: subjectId, name: "Subject not found", syllabus: "No syllabus available." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  if (!subject) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: "16px" }}>
        ← Back to subjects
      </button>
      <h2>{subject.name}</h2>
      <p><strong>Syllabus:</strong> {subject.syllabus}</p>
      <p><strong>Topics Covered:</strong> {subject.topics}</p>
      {subject.pdf_url && (
        <p>
          <a href={subject.pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
            Download PDF Syllabus
          </a>
        </p>
      )}
      <BookingButton subjectId={subject.id} />
    </div>
  );
}

export default SubjectDetail;