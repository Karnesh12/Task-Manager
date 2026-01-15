const Task = require("../models/Task");
const TaskActivity = require("../models/TaskActivity");
const { rawListeners } = require("../models/User");
const moment = require("moment");

const logActivity = async (taskId, performedBy, performedByName, performedByProfileImageUrl, action, description) => {
  try {
    await TaskActivity.create({
      taskId,
      performedBy,
      performedByName,
      performedByProfileImageUrl,
      action,
      description,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

//@desc Get all tasks (admin: all, User: only assigned tasks)
//@route GET /api/tasks/
//@access Private
const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        if (status) {
            filter.status = status;
        }

        let tasks;

        if (req.user.role === "admin"){
            tasks = await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        } else {
            tasks = await Task.find({ ...filter, assignedTo: req.user._id }).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        }

        //Add completed todoChecklist count to each task
        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoChecklist.filter(
                    (item) => item.completed
                ).length;
                return { ...task._doc, completedTodoCount: completedCount };
            })
        );

        //Status summery counts
        const allTasks = await Task.countDocuments(
            req.user.role === "admin" ? {} :{ assignedTo: req.user._id}
        );

        const pendingTasks = await Task.countDocuments({
            ...filter,
            status: "Pending",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
        });

        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status: "In Progress",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
        });

        const completedTasks = await Task.countDocuments({
            ...filter,
            status: "Completed",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
        });

        res.json({
            tasks,
            statusSummery: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Get task by ID
//@route GET /api/tasks/:id
//@access Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        if (!task) return res.status(404).json({ message: "Task not found" });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Create a new task (Admin only)
//@route POST /api/tasks/
//@access Private (Admin)
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
        } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res
            .status(400)
            .json({ message: "assignedTo must be an array of user IDs" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoChecklist,
            attachments,
        });

        await logActivity(
            task._id,
            req.user._id,
            req.user.name,
            req.user.profileImageUrl,
            "Task Created",
            `Task "${task.title}" was created.`
        );

        res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Update task details
//@route PUT /api/tasks/:id
//@access Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });

        const changes = [];
        if (req.body.title && task.title !== req.body.title) {
            changes.push(`title to "${req.body.title}"`);
        }
        if (req.body.description && task.description !== req.body.description) {
            changes.push('description');
        }
        if (req.body.priority && task.priority !== req.body.priority) {
            changes.push(`priority to "${req.body.priority}"`);
        }
        if (req.body.dueDate && new Date(task.dueDate).toISOString() !== new Date(req.body.dueDate).toISOString()) {
            changes.push(`due date to "${moment(req.body.dueDate).format('MMM Do YYYY')}"`);
        }
        if (req.body.assignedTo) {
            const oldIds = task.assignedTo.map(u => u.toString()).sort();
            const newIds = [...req.body.assignedTo].sort();
            if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
                changes.push('assignees');
            }
        }

        // Handle checklist text changes if needed, separate from toggling
        if (req.body.todoChecklist && JSON.stringify(task.todoChecklist.map(t => t.text)) !== JSON.stringify(req.body.todoChecklist.map(t => t.text || t))) {
            changes.push('TODO checklist');
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res
                .status(400)
                .json({ message: "assignedTo must be an array of user IDs" });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();

        if (changes.length > 0) {
            await logActivity(
                updatedTask._id,
                req.user._id,
                req.user.name,
                req.user.profileImageUrl,
                "Task Details Updated",
                `Updated ${changes.join(', ')}.`
            );
        }

        res.json({ message: "Task updated successfully", updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Delete a task (Admin only)
//@route DELETE /api/tasks/:id
//@access Private (Admin)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });

        await logActivity(
            task._id,
            req.user._id,
            req.user.name,
            req.user.profileImageUrl,
            "Task Deleted",
            `Task "${task.title}" was deleted.`
        );

        await task.deleteOne();
        res.json({ message: "Task deleted seccessfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Update task status
//@route PUT /api/tasks/:id/status
//@access Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() == req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const oldStatus = task.status;
        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        if (oldStatus !== task.status) {
            await logActivity(
                task._id,
                req.user._id,
                req.user.name,
                req.user.profileImageUrl,
                "Status Changed",
                `Status changed from "${oldStatus}" to "${task.status}".`
            );
        }

        await task.save();
        res.json({ message: "Task status updated", task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Update task checklist
//@route POST /api/tasks/:id/todo
//@access Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if  (!task) return res.status(404).json({ message: "Task not found" });

        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));

        if (!isAssigned && req.user.role !== "admin") {
            return res 
            .status(403)
            .json({ message: "Not authorized to update chacklist" });
        }

        const oldChecklist = task.todoChecklist.map(item => item.toObject());
        task.todoChecklist = todoChecklist; //Replace with updated checklist

        //Auto-update progress based on chacklist completion
        const completedCount = task.todoChecklist.filter(
            (item) => item.completed
        ).length;
        const totalItems = task.todoChecklist.length;
        task.progress =
        totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        //Auto-mark task as completed if all items are checked
        if (task.progress === 100) {
            task.status = "Completed";
        } else if (task.progress > 0) {
            task.status = "In Progress";
        } else {
            task.status = "Pending";
        }

        await task.save();

        // Log checklist toggles
        const newChecklist = task.todoChecklist;
        const maxLength = Math.max(oldChecklist.length, newChecklist.length);
        for (let i = 0; i < maxLength; i++) {
            const oldItem = oldChecklist[i];
            const newItem = newChecklist[i];

            if (oldItem && newItem && oldItem.text === newItem.text && oldItem.completed !== newItem.completed) {
                await logActivity(task._id, req.user._id, req.user.name, req.user.profileImageUrl, "Checklist Item Toggled",
                    `"${newItem.text}" was marked as ${newItem.completed ? 'complete' : 'incomplete'}.`
                );
            }
        }
        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({ message: "Task checklist updated", task:updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Dashboard Data (Admin only)
//@route GET /api/tasks/dashboard-data
//@access Private
const getDashboardData = async (req, res) => {
    try {
        //Fetch statistics
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: "Pending" });
        const completedTasks = await Task.countDocuments({ status: "Completed" });
        const overdueTask = await Task.countDocuments({
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        //Ensure all possible statuses are included
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formatedKey = status.replace(/\s+/g, ""); //Remove spaces for response keys
            acc[formatedKey] = 
            taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks; //Add total count to taskDistribution

        //Ensure all priority levels are included
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = 
            taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        //Fetch recent 10 tasks
        const recentTasks = await Task.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTask,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Dashboard Data (User-specific)
//@route POST /api/tasks/user-dashboard-data
//@access Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id; //Only fetch data for the logged-in user

        //Fetch statistics for user-spcific tasks
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "Pending" });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        //Task distribution by status
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formatedKey =status.replace(/\s+/g, "");
            acc[formatedKey] = 
            taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        //Task distribution by priority
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = 
            taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        //Fetch recent 10 tasks for the logged-in user
        const recentTasks = await Task.find({ assignedTo: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

        res.status (200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Get task activity log
//@route GET /api/tasks/:id/activity
//@access Private
const getTaskActivity = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Admin can see all activity. Members can only see for assigned tasks.
      const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));

      if (req.user.role !== 'admin' && !isAssigned) {
        return res.status(403).json({ message: "Not authorized to view this task's activity" });
      }
  
      const activities = await TaskActivity.find({ taskId: req.params.id }).sort({ createdAt: -1 });
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
    getTaskActivity,
};