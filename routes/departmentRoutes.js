const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

router.post("/", departmentController.addDepartment);
router.get("/", departmentController.getAllDepartments);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
