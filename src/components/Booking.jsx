import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Booking() {
  const navigate = useNavigate();

  const categories = [
    { name: "VIP", price: 2000, available: 120 },
    { name: "Premium", price: 1200, available: 250 },
    { name: "Standard", price: 600, available: 500 },
  ];

  const [selected, setSelected] = useState(null);

  const confirmBooking = () => {
    navigate("/confirmation", { state: selected });
  };

  return (
    <div className="container">
      <div className="card" style={{ width: "400px" }}>
        <h2>Select Ticket Category</h2>
        <p>Only 1 ticket per user</p>

        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => setSelected(cat)}
            style={{
              padding: "12px",
              margin: "10px 0",
              borderRadius: "10px",
              cursor: "pointer",
              border: selected?.name === cat.name
                ? "2px solid #3b82f6"
                : "1px solid #ddd",
              background:
                selected?.name === cat.name ? "#e0f2fe" : "#f8fafc",
            }}
          >
            <h3>{cat.name}</h3>
            <p>Price: ₹{cat.price}</p>
            <p>Available: {cat.available}</p>
          </div>
        ))}

        <button disabled={!selected} onClick={confirmBooking}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
}

export default Booking;