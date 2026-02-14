const Department = require("../models/departmentModel");

// Add a new department
exports.addDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }

    const existing = await Department.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existing) {
      return res.status(409).json({ message: "Department already exists" });
    }

    const department = await Department.create({ name });
    res.status(201).json({ message: "Department added successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid department ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
