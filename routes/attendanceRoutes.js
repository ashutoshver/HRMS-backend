const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.post("/", attendanceController.markAttendance);
router.get("/records", attendanceController.getAttendanceRecords);
router.get("/dashboard", attendanceController.getDashboardSummary);
router.get("/employee/:employeeId", attendanceController.getAttendanceByEmployee);

module.exports = router;
