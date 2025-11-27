const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const medRoutes = require("./routes/medRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const peopleRoutes = require("./routes/peopleRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/medications", medRoutes);
app.use("/reminders", reminderRoutes);
app.use("/people", peopleRoutes);

module.exports = app;
