const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();
const {
  addReminder,
  getReminders,
  updateReminder,
  deleteReminder,
} = require("../controllers/reminderController");

router.post("/", auth, addReminder);
router.get("/", auth, getReminders);
router.put("/:id", auth, updateReminder);
router.delete("/:id", auth, deleteReminder);

module.exports = router;
