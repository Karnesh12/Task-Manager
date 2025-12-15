const express = require("express");

const router = express.Router();

router.get("/export/task", protect, adminOnly, exportTasksReport); //Export all tasks as Excel/PDF
router.get("/export/users", protect, adminOnly, exportUserReports); //Export user-task report

module.exports = router;