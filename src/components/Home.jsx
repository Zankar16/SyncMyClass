import "../index.css";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <div className="home-wrapper">

      {}
      <aside className="profile-sidebar">
        <img
          src="/profile.png"
          alt="Profile"
          className="profile-pic"
        />

        <h3>John Doe</h3>
        <p className="role">Student</p>

        <nav>
          <a className="active">Dashboard</a>
          <a>Open Elective</a>
          <a>Core Elective</a>
          <a>Class Choose</a>
          <a>Faculty Elections</a>
          <a> Notifications </a>
          <a className="logout" onClick={handleLogout}>
            Logout
          </a>
        </nav>
      </aside>

      {}
    <main className="home-main">
  <div className="home-cards">


    <div className="home-card timetable-card">
  <h3>Semester Timetable</h3>

  <table className="timetable">
    <thead>
      <tr>
        <th>Day</th>
        <th>9–10 AM</th>
        <th>10–11 AM</th>
        <th>11–12 PM</th>
        <th>1–2 PM</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td className="day">Mon</td>

        <td className="slot lecture">
          <strong>CS301</strong>
          <span>FAC12</span>
          <small>Room B-204</small>
        </td>
        <td className="slot lab">
          <strong>CS302L</strong>
          <span>FAC08</span>
          <small>Lab L-1</small>
        </td>

        <td className="slot elective">
          <strong>OE105</strong>
          <span>FAC21</span>
          <small>Room A-101</small>
        </td>

        <td className="slot free">Free</td>
      </tr>

      <tr>
        <td className="day">Tue</td>

        <td className="slot lecture">
          <strong>MA201</strong>
          <span>FAC05</span>
          <small>Room C-110</small>
        </td>

        <td className="slot lecture">
          <strong>CS301</strong>
          <span>FAC12</span>
          <small>Room B-204</small>
        </td>

        <td className="slot elective">
          <strong>OE105</strong>
          <span>FAC21</span>
          <small>Room A-101</small>
        </td>

        <td className="slot lab">
          <strong>CS302L</strong>
          <span>FAC08</span>
          <small>Lab L-1</small>
        </td>
      </tr>
    </tbody>
  </table>

  <button className="glass-btn">Download PDF</button>
</div>

  </div>
</main>
    </div>
  );
}