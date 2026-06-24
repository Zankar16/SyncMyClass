const express = require("express");
const router = express.Router();

let queue = [];
let currentTurnIndex = 0;

// helper → activate first user if none active
function activateNextUser() {
  if (queue.length === 0) return;

  if (currentTurnIndex >= queue.length) return;

  // reset all to waiting except done
  queue.forEach((q, i) => {
    if (q.status !== "done") q.status = "waiting";
  });

  queue[currentTurnIndex].status = "active";
}

// ================= JOIN =================
router.post("/queue/join", (req, res) => {
  const { studentId, electiveType } = req.body;

  if (!studentId || !electiveType) {
    return res.status(400).json({ error: "Missing fields" });
  }

  let index = queue.findIndex(
    (q) => q.studentId === studentId && q.electiveType === electiveType
  );

  if (index === -1) {
    queue.push({
      studentId,
      electiveType,
      status: "waiting",
      selectedSubject: null,
    });
    index = queue.length - 1;
  }

  // 🔥 IMPORTANT: start queue if first user
  if (queue.length === 1) {
    currentTurnIndex = 0;
    activateNextUser();
  }

  res.json({
    position: index + 1,
    totalInQueue: queue.length,
    status: queue[index].status,
  });
});

// ================= STATUS =================
router.post("/queue/status", (req, res) => {
  const { studentId, electiveType } = req.query;

  const index = queue.findIndex(
    (q) => q.studentId === studentId && q.electiveType === electiveType
  );

  if (index === -1) {
    return res.json({ error: "Not in queue" });
  }

  const user = queue[index];

  res.json({
    position: index + 1,
    totalInQueue: queue.length,
    status: user.status,
    isYourTurn: user.status === "active",
    redirectTo: user.status === "active" ? "/subject-selection" : null,
  });
});

// ================= NEXT TURN =================
router.post("/queue/next", (req, res) => {
  if (currentTurnIndex < queue.length) {
    queue[currentTurnIndex].status = "done";
    currentTurnIndex++;
  }

  activateNextUser();

  res.json({
    message: "Moved to next user",
    currentTurnIndex,
  });
});

// ================= SUBJECT SELECTION =================
router.post("/subject/select", (req, res) => {
  const { studentId, electiveType, subject } = req.body;

  if (!subject) {
    return res.status(400).json({ error: "Subject required" });
  }

  const user = queue.find(
    (q) => q.studentId === studentId && q.electiveType === electiveType
  );

  if (!user || user.status !== "active") {
    return res.status(403).json({ error: "Not your turn" });
  }

  user.selectedSubject = subject;

  res.json({
    message: "Subject selected",
    nextStep: "/confirm",
  });
});

// ================= CONFIRM =================
router.post("/confirm", (req, res) => {
  const { studentId, electiveType } = req.body;

  const index = queue.findIndex(
    (q) => q.studentId === studentId && q.electiveType === electiveType
  );

  if (index === -1) {
    return res.status(400).json({ error: "User not found" });
  }

  const user = queue[index];

  if (user.status !== "active") {
    return res.status(403).json({ error: "Not your turn" });
  }

  if (!user.selectedSubject) {
    return res.status(400).json({ error: "No subject selected" });
  }

  user.status = "done";

  // 🔥 auto move queue forward
  currentTurnIndex++;
  activateNextUser();

  res.json({
    message: "Booking confirmed ✅",
  });
});

// ================= LEAVE =================
router.post("/queue/leave", (req, res) => {
  const { studentId, electiveType } = req.body;

  const index = queue.findIndex(
    (q) => q.studentId === studentId && q.electiveType === electiveType
  );

  if (index === -1) {
    return res.json({ message: "Already not in queue" });
  }

  queue.splice(index, 1);

  // adjust pointer
  if (index <= currentTurnIndex && currentTurnIndex > 0) {
    currentTurnIndex--;
  }

  activateNextUser();

  res.json({ message: "Left queue" });
});

module.exports = router;