const mongoose = require("mongoose");

const taskActivitySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    performedByName: { type: String, required: true },
    performedByProfileImageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskActivity", taskActivitySchema);