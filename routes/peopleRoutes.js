// routes/peopleRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { getContactChain, flagPerson } = require("../controllers/peopleController");

// Get contact chain for an rfid (protected)
router.get("/contacts/:rfid", auth, getContactChain);

// Flag a person (suspected / positive). Protected route for doctors/admins.
router.post("/flag", auth, flagPerson);

module.exports = router;
