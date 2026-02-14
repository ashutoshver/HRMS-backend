const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Employee ID is required"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
  },
  status: {
    type: String,
    required: [true, "Status is required"],
    enum: {
      values: ["Present", "Absent"],
      message: "Status must be either Present or Absent",
    },
  },
});

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
