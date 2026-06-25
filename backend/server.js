const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===================== ROUTES =====================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/polls", require("./routes/polls"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/subjects", require("./routes/subjects"));

// legacy queue system
app.use("/api/legacy", require("./routes/legacy"));

// health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server running fine " });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});