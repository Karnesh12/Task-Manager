const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { exportTasksReport, exportUserReport } = require("../controllers/reportController");

const router = express.Router();

router.get("/export/task", protect, adminOnly, exportTasksReport); //Export all tasks as Excel/PDF
router.get("/export/users", protect, adminOnly, exportUserReport); //Export user-task report

module.exports = router;