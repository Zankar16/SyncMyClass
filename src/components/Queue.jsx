import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Queue() {
  const [position, setPosition] = useState(100);
  const navigate = useNavigate();

  // Ticket categories (dummy data)
  const [categories, setCategories] = useState({
    VIP: 120,
    Premium: 240,
    Standard: 400,
  });

  // Queue movement
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev <= 1) {
          navigate("/booking");
          return 0;
        }
        return Math.max(prev - 2, 0);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [navigate]);

  // Fake real-time seat updates
  useEffect(() => {
    const seatInterval = setInterval(() => {
      setCategories((prev) => ({
        VIP: Math.max(prev.VIP - Math.floor(Math.random() * 3), 0),
        Premium: Math.max(prev.Premium - Math.floor(Math.random() * 5), 0),
        Standard: Math.max(prev.Standard - Math.floor(Math.random() * 8), 0),
      }));
    }, 3000);

    return () => clearInterval(seatInterval);
  }, []);

  const progress = 100 - position;

  return (
    <div className="container">
      <div className="card">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h3>{position} people ahead of you</h3>

        <hr style={{ margin: "15px 0" }} />

        <h3>Available Tickets</h3>
        <p>VIP: {categories.VIP} seats left</p>
        <p>Premium: {categories.Premium} seats left</p>
        <p>Standard: {categories.Standard} seats left</p>

        <p>Please keep this page open</p>
      </div>
    </div>
  );
}

export default Queue;