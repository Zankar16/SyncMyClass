import React from "react";
import { Link } from "react-router-dom";
import SubjectCard from "./SubjectCard.jsx";

const subjects = [
  {
    id: 1,
    name: "Web Technology",
    desc: "Frontend & Backend",
    image: "https://source.unsplash.com/300x200/?coding"
  },
  {
    id: 2,
    name: "DBMS",
    desc: "Database Systems",
    image: "https://source.unsplash.com/300x200/?database"
  }
];

const SubjectList = () => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", padding: "20px" }}>
      {subjects.map(sub => (
        <Link
          key={sub.id}
          to={`/subject/${sub.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <SubjectCard subject={sub} />
        </Link>
      ))}
    </div>
  );
};

export default SubjectList;
