const express = require("express");
const router = express.Router();
const db = require("../db");

// ===================== QUEUE LOCKS =====================
const queueLocks = {};
const LOCK_TIMEOUT = 30000;

function acquireQueueLock(type) {
  const key = `lock_${type}`;
  if (!queueLocks[key] || Date.now() - queueLocks[key] > LOCK_TIMEOUT) {
    queueLocks[key] = Date.now();
    return true;
  }
  return false;
}

function releaseQueueLock(type) {
  delete queueLocks[`lock_${type}`];
}

// ===================== BASIC ROUTES =====================
router.get("/", (req, res) => {
  res.send("Backend running");
});

// ===================== CATEGORIES =====================
router.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, result) => {
    if (err) return res.status(500).json(err);

    const grouped = {};
    result.forEach(c => {
      if (!grouped[c.semester]) grouped[c.semester] = [];
      grouped[c.semester].push(c);
    });

    res.json(grouped);
  });
});

// ===================== SUBJECTS =====================
router.get("/subjects/:categoryId", (req, res) => {
  db.query(
    "SELECT * FROM subjects WHERE category_id=?",
    [req.params.categoryId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

router.get("/subject/:id", (req, res) => {
  db.query(
    "SELECT * FROM subjects WHERE id=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
});

// ===================== BOOKING (SIMPLE) =====================
router.post("/book", (req, res) => {
  const { studentId, subjectId } = req.body;

  db.query(
    "SELECT * FROM bookings WHERE student_id=? AND subject_id=?",
    [studentId, subjectId],
    (err, existing) => {
      if (existing.length > 0)
        return res.json({ message: "Already booked" });

      db.query(
        "SELECT COUNT(*) AS total FROM bookings WHERE subject_id=?",
        [subjectId],
        (err, count) => {
          const total = count[0].total;

          db.query(
            "SELECT max_seats FROM subjects WHERE id=?",
            [subjectId],
            (err, maxRes) => {
              const max = maxRes[0].max_seats;

              if (total >= max)
                return res.json({ message: "Seats full" });

              db.query(
                "INSERT INTO bookings (student_id, subject_id) VALUES (?,?)",
                [studentId, subjectId],
                (err) => {
                  if (err) return res.status(500).json(err);
                  res.json({ message: "Booked successfully 🎉" });
                }
              );
            }
          );
        }
      );
    }
  );
});

// ===================== QUEUE SYSTEM =====================
router.post("/api/queue/join", (req, res) => {
  const { studentId, electiveType } = req.body;

  if (!acquireQueueLock(electiveType)) {
    return res.status(429).json({ message: "Busy" });
  }

  db.query(
    "DELETE FROM queue WHERE student_id=? AND elective_type=?",
    [studentId, electiveType],
    () => {
      db.query(
        "SELECT MAX(position) AS maxPos FROM queue WHERE elective_type=?",
        [electiveType],
        (err, r) => {
          const pos = (r[0].maxPos || 0) + 1;

          db.query(
            "INSERT INTO queue (student_id,elective_type,position,status) VALUES (?,?,?,'waiting')",
            [studentId, electiveType, pos],
            (err) => {
              releaseQueueLock(electiveType);

              res.json({
                position: pos,
                message: "Joined queue"
              });
            }
          );
        }
      );
    }
  );
});

// ===================== EXPORT =====================
module.exports = router;