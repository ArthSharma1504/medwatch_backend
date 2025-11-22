const db = require("../config/db");

exports.addMedication = (req, res) => {
  const { name, disease, dosage, frequency, start_date, end_date } = req.body;
  const user_id = req.user.id;

  db.query(
    `INSERT INTO medications (user_id, name, disease, dosage, frequency, start_date, end_date)
VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, name, disease, dosage, frequency, start_date, end_date],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Medication added" });
    }
  );
};

exports.getMedications = (req, res) => {
  const user_id = req.user.id;
  db.query(
    "SELECT * FROM medications WHERE user_id=?",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};
exports.updateMedication = (req, res) => {
  const medId = req.params.id;
  const { name, disease, dosage, frequency, start_date, end_date } = req.body;
  const user_id = req.user.id;
  db.query(
    `UPDATE medications SET name=?, disease=?, dosage=?, frequency=?, start_date=?, end_date=? WHERE id=? AND user_id=?`,
    [name, disease, dosage, frequency, start_date, end_date, medId, user_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json({ message: "Medication updated" });
    }
  );
};
exports.deleteMedication = (req, res) => {
  const medId = req.params.id;
  const user_id = req.user.id;
  db.query(
    `DELETE FROM medications WHERE id=? AND user_id=?`,
    [medId, user_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json({ message: "Medication deleted" });
    }
  );
};
