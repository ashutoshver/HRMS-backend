const express = require("express");
const cors = require("cors");
const app = express();
const employeeRouter = require("./routes/employeeRoutes");
const attendanceRouter = require("./routes/attendanceRoutes");
const departmentRouter = require("./routes/departmentRoutes");

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "HRMS API is running" });
});
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/departments", departmentRouter);

module.exports = app;
