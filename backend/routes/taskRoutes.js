const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist, getTaskActivity, handleUserDeletion } = require("../controllers/taskController");

const router = express.Router();

//Task Management Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/:id/activity", protect, getTaskActivity); // Get task activity log
router.get("/", protect, getTasks); //Get all Tasks (Admin: all, User: assigned)
router.get("/:id", protect, getTaskById); //Get tasks by ID
router.post("/", protect, adminOnly, createTask); //Craete a task Admin only
router.put("/:id", protect, updateTask); //Update task details
router.delete("/:id", protect, adminOnly, deleteTask); //Delete a task (Admin only)
router.put("/:id/status", protect, updateTaskStatus); //Update task status
router.put("/:id/todo", protect, updateTaskChecklist); //Update task checklist
router.delete("/cleanup-user/:userId", protect, adminOnly, handleUserDeletion); //Cleanup user from tasks before deletion

module.exports = router;
