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

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      employeeId,
      date: attendanceDate,
    });

    if (existing) {
      return res.status(409).json({
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
      const filterDate = new Date(req.query.date);
      filterDate.setHours(0, 0, 0, 0);
      query.date = filterDate;
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presentToday = await Attendance.countDocuments({
      date: today,
      status: "Present",
    });

    const absentToday = await Attendance.countDocuments({
      date: today,
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
