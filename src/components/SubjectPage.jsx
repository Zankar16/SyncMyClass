import { useParams } from "react-router-dom";
import { useState } from "react";

const facultyBySubject = {
  1: ["Dr. Sharma", "Prof. Patel", "Dr. Mehta"],
  2: ["Prof. Rao", "Dr. Shah"]
};

function SubjectPage() {
  const { id } = useParams();
  const facultyList = facultyBySubject[id] || [];

  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const submitVote = () => {
    if (selected) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Choose Faculty for Subject</h2>

      {facultyList.map((name, index) => (
        <div key={index}>
          <label>
            <input
              type="radio"
              name="faculty"
              value={name}
              onChange={() => setSelected(name)}
            />
            {name}
          </label>
        </div>
      ))}

      <br />

      <button onClick={submitVote}>
        Submit Vote
      </button>

      {submitted && (
        <p>You selected: {selected}</p>
      )}
    </div>
  );
}
export default SubjectPage;