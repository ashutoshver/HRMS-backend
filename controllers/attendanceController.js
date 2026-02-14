const Attendance = require("../models/attendanceModel");
const Employee = require("../models/employeeModel");

// Mark attendance for an employee
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({
        message: "All fields are required (employeeId, date, status)",
      });
    }

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either Present or Absent",
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Normalize date to UTC midnight to avoid timezone mismatches
    const parts = new Date(date);
    const attendanceDate = new Date(Date.UTC(parts.getFullYear(), parts.getMonth(), parts.getDate()));

    // Check for existing attendance using a date range (entire day in UTC)
    const nextDay = new Date(attendanceDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const existing = await Attendance.findOne({
      employeeId,
      date: { $gte: attendanceDate, $lt: nextDay },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for this employee on this date",
      });
    }

    const attendance = await Attendance.create({
      employeeId,
      date: attendanceDate,
      status,
    });

    res.status(201).json({ message: "Attendance marked successfully", attendance });
  } catch (error) {
    // Handle MongoDB duplicate key error (race condition safety net)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for this employee on this date",
      });
    }
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records for an employee (optional date filter)
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const query = { employeeId };

    // Optional date filter
    if (req.query.date) {
      const parts = new Date(req.query.date);
      const filterDate = new Date(Date.UTC(parts.getFullYear(), parts.getMonth(), parts.getDate()));
      const nextDay = new Date(filterDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      query.date = { $gte: filterDate, $lt: nextDay };
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .populate("employeeId", "employeeId fullName department");

    const totalPresent = await Attendance.countDocuments({
      employeeId,
      status: "Present",
    });

    res.json({
      employee: { _id: employee._id, employeeId: employee.employeeId, fullName: employee.fullName },
      totalPresentDays: totalPresent,
      records,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();

    // Use IST (Asia/Kolkata) to determine "today" regardless of server timezone
    const now = new Date();
    const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate()));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const dateFilter = { $gte: today, $lt: tomorrow };

    const presentToday = await Attendance.countDocuments({
      date: dateFilter,
      status: "Present",
    });

    const absentToday = await Attendance.countDocuments({
      date: dateFilter,
      status: "Absent",
    });

    res.json({
      totalEmployees,
      presentToday,
      absentToday,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
