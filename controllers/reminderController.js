const db = require("../config/db");

exports.addReminder = (req, res) => {
  const { medication_id, reminder_time } = req.body;
  const user_id = req.user.id;

  db.query(
    `INSERT INTO reminders (user_id, medication_id, reminder_time)
VALUES (?, ?, ?)`,
    [user_id, medication_id, reminder_time],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Reminder added" });
    }
  );
};

exports.getReminders = (req, res) => {
  const user_id = req.user.id;
  db.query(
    "SELECT * FROM reminders WHERE user_id=?",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};
exports.updateReminder = (req, res) => {
  const reminderId = req.params.id;
  const { medication_id, reminder_time } = req.body;
  const user_id = req.user.id;
  db.query(
    `UPDATE reminders SET medication_id=?, reminder_time=? WHERE id=? AND user_id=?`,
    [medication_id, reminder_time, reminderId, user_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json({ message: "Reminder updated" });
    }
  );
};

exports.deleteReminder = (req, res) => {
  const reminderId = req.params.id;
  const user_id = req.user.id;
  db.query(
    `DELETE FROM reminders WHERE id=? AND user_id=?`,
    [reminderId, user_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json({ message: "Reminder deleted" });
    }
  );
};
