const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Department = require("./models/departmentModel");

dotenv.config();

const departments = [
  "Human Resources",
  "Engineering",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "IT",
  "Design",
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");

  for (const name of departments) {
    const exists = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (!exists) {
      await Department.create({ name });
      console.log(`Added: ${name}`);
    } else {
      console.log(`Skipped (already exists): ${name}`);
    }
  }

  console.log("\nDone! Departments seeded.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
