import React, { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";

function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");

  const [stats, setStats] = useState({});
  const [queue, setQueue] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (localStorage.getItem("adminAuthenticated") === "true") {
      setAuthenticated(true);
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    setStats(data);
  };

  const loadData = async (endpoint, setter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${endpoint}`);
      const data = await res.json();
      setter(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "queue") loadData("queue", setQueue);
    if (tab === "allocations") loadData("allocations", setAllocations);
    if (tab === "bookings") loadData("bookings", setBookings);
    if (tab === "subjects") loadData("subjects", setSubjects);
  };

  const handleRefresh = () => {
    handleTabChange(activeTab);
    if (activeTab === "stats") loadStats();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setAuthenticated(false);
  };

  // 🔥 Example admin action (cancel allocation)
  const cancelAllocation = async (id) => {
    await fetch(`/api/admin/cancel/${id}`, { method: "POST" });
    handleRefresh();
  };

  const filterData = (data) => {
    return data.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  };

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  const currentData =
    activeTab === "queue"
      ? queue
      : activeTab === "allocations"
      ? allocations
      : activeTab === "bookings"
      ? bookings
      : subjects;

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <header className="admin-header">
        <div>
          <h1>⚡ Admin Dashboard</h1>
          <p className="subtitle">Manage everything in one place</p>
        </div>

        <div className="header-actions">
          <button className="btn secondary">← Back</button>
          <button className="btn danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* NAV */}
      <nav className="admin-nav">
        {["stats", "queue", "allocations", "bookings", "subjects"].map(tab => (
          <button
            key={tab}
            className={`nav-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className="admin-content">

        {/* TOOLBAR */}
        <div className="admin-toolbar">
          <input
            className="search-input"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn primary" onClick={handleRefresh}>
            ⟳ Refresh
          </button>
        </div>

        {/* STATS */}
        {activeTab === "stats" && (
          <div className="stats-grid">
            {[
              ["Students", stats.totalStudents],
              ["Queue", stats.activeQueue],
              ["Allocations", stats.totalAllocations],
              ["Pending", stats.pendingAllocations],
              ["Subjects", stats.subjectsOffered],
            ].map(([title, value]) => (
              <div className="stat-card" key={title}>
                <h3>{title}</h3>
                <p>{value || 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* TABLE */}
        {activeTab !== "stats" && (
          <div className="data-table">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    {currentData[0] &&
                      Object.keys(currentData[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    {activeTab === "allocations" && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {filterData(currentData).map((item) => (
                    <tr key={item.id}>
                      {Object.entries(item).map(([key, val], i) => (
                        <td key={i}>
                          {["pending", "allocated", "cancelled"].includes(val) ? (
                            <span className={`badge ${val}`}>
                              {val}
                            </span>
                          ) : (
                            val
                          )}
                        </td>
                      ))}

                      {activeTab === "allocations" && (
                        <td>
                          <button
                            className="btn danger small"
                            onClick={() => cancelAllocation(item.id)}
                          >
                            Cancel
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;