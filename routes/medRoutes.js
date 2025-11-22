const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();
const {
  addMedication,
  getMedications,
  updateMedication,
  deleteMedication,
} = require("../controllers/medController");

router.post("/", auth, addMedication);
router.get("/", auth, getMedications);
router.put("/:id", auth, updateMedication);
router.delete("/:id", auth, deleteMedication);
module.exports = router;
