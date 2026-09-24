const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    type: {
      type: String,
      enum: ["frontend", "backend", "server"],
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "open",
        "in-progress",
        "fixed",
        "reopened",
        "closed",
      ],
      default: "open",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    screenshotUrl: {
      type: String,
      default: null,
    },

    issueLink: {
      type: String,
      default: null,
      trim: true,
    },

    issueVideoUrl: {
      type: String,
      default: null,
    },

    fixLink: {
      type: String,
      default: null,
      trim: true,
    },

    fixVideoUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Bug = mongoose.model("Bug", bugSchema);

module.exports = Bug;