const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const Department = require("../models/departmentModel");

// Add a new employee
exports.addEmployee = async (req, res) => {
  try {
    const { fullName, email, department } = req.body;

    if (!fullName || !email || !department) {
      return res.status(400).json({
        message: "All fields are required (fullName, email, department)",
      });
    }

    const existingByEmail = await Employee.findOne({ email: email.toLowerCase() });
    if (existingByEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const employee = new Employee({ fullName, email, department });
    await employee.save();

    const populated = await Employee.findById(employee._id).populate("department", "name");
    res.status(201).json({ message: "Employee added successfully", employee: populated });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all employees (paginated + filtered)
exports.getAllEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: "i" } },
        { employeeId: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by department ID
    if (req.query.department) {
      filter.department = req.query.department;
    }

    const employees = await Employee.find(filter)
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEmployees: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("department", "name");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const { fullName, email, department } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (email && email.toLowerCase() !== employee.email) {
      const existingByEmail = await Employee.findOne({ email: email.toLowerCase() });
      if (existingByEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    if (department) {
      const dept = await Department.findById(department);
      if (!dept) {
        return res.status(404).json({ message: "Department not found" });
      }
      employee.department = department;
    }

    if (fullName) employee.fullName = fullName;
    if (email) employee.email = email;

    await employee.save();

    const populated = await Employee.findById(employee._id).populate("department", "name");
    res.json({ message: "Employee updated successfully", employee: populated });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete an employee and their attendance records
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Attendance.deleteMany({ employeeId: req.params.id });

    res.json({ message: "Employee and related attendance records deleted successfully" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
