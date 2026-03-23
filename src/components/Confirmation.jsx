import { useLocation, useNavigate } from "react-router-dom";

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state;

  if (!ticket) return <h2>No booking found</h2>;

  const bookingId = "BK" + Math.floor(Math.random() * 1000000);

  return (
    <div className="container">
      <div className="card">
        <h1>✅ Booking Confirmed</h1>

        <p><b>Booking ID:</b> {bookingId}</p>
        <p><b>Ticket Category:</b> {ticket.name}</p>
        <p><b>Amount:</b> ₹{ticket.price}</p>

        <p>
          🎵 Live Concert Night <br />
          📍 Mumbai Stadium <br />
          📅 15 March 2026
        </p>

        <button onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    </div>
  );
}

export default Confirmation;