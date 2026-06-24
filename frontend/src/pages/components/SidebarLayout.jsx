import React, { useEffect, useState } from "react";

function SidebarLayout({ onSelect }) {
  const [data, setData] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    <div className="profile-sidebar">
      <h2>📚 Semesters</h2>

      {Object.keys(data).map(sem => (
        <div key={sem}>
          <h4>Semester {sem}</h4>

          {data[sem].map(cat => (
            <div
              key={cat.id}
              className={`sidebar-item ${
                selectedId === cat.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedId(cat.id);
                onSelect(cat.id);
              }}
            >
              • {cat.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default SidebarLayout;