const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: [true, "Department is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate employeeId before saving (EMP001, EMP002, ...)
employeeSchema.pre("save", async function () {
  if (!this.employeeId) {
    const lastEmployee = await mongoose
      .model("Employee")
      .findOne()
      .sort({ createdAt: -1 });

    if (lastEmployee && lastEmployee.employeeId) {
      const lastNum = parseInt(lastEmployee.employeeId.replace("EMP", ""));
      this.employeeId = `EMP${String(lastNum + 1).padStart(3, "0")}`;
    } else {
      this.employeeId = "EMP001";
    }
  }
});

module.exports = mongoose.model("Employee", employeeSchema);
