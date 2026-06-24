import React, { useState } from "react";
import "./styles.css";
import CategoryCards from "./components/CategoryCards";
import Queue from "./components/Queue";
import SubjectSelectionForm from "./components/SubjectSelectionForm";
import AdminDashboard from "./components/AdminDashboard";

function Subjects() {
  const [electiveType, setElectiveType] = useState(null);
  const [currentView, setCurrentView] = useState("categories");
  const [studentId] = useState(localStorage.getItem("studentId") || "STU001");
  const [isAdmin, setIsAdmin] = useState(false);

  const onSelectElective = (type) => {
    setElectiveType(type);
    setCurrentView("queue");
  };

  const handleTurnCome = () => {
    setCurrentView("subjectForm");
  };

  const handleCancelQueue = () => {
    setCurrentView("categories");
    setElectiveType(null);
  };

  const handleSubmitSuccess = () => {
    setCurrentView("categories");
    setElectiveType(null);
  };

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  if (isAdmin) {
    return (
      <div className="admin-wrapper">
        <button onClick={toggleAdmin} className="back-to-student">
          ← Back to Student Portal
        </button>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="home-main">
      <div className="admin-toggle">
        <button onClick={toggleAdmin} className="admin-btn">
          Admin Dashboard
        </button>
      </div>

      {currentView === "categories" ? (
        <CategoryCards onSelectElective={onSelectElective} />
      ) : currentView === "queue" ? (
        <Queue
          electiveType={electiveType}
          studentId={studentId}
          onTurnCome={handleTurnCome}
          onCancel={handleCancelQueue}
        />
      ) : currentView === "subjectForm" ? (
        <SubjectSelectionForm
          electiveType={electiveType}
          studentId={studentId}
          onBack={handleCancelQueue}
          onSubmitSuccess={handleSubmitSuccess}
        />
      ) : null}
    </div>
  );
}

export default Subjects;
