const Bug = require("../models/bug");
const User = require("../models/user");

const createBug = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      type,
      priority,
      assignedTo,
    } = req.body;

    if (!title || !description || !project || !type) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    let assigneeId = null;

    if (assignedTo) {
      const developer = await User.findById(assignedTo);

      if (!developer) {
        return res.status(404).json({
          message: "Selected developer not found",
        });
      }

      if (!["frontend", "backend", "server"].includes(developer.role)) {
        return res.status(400).json({
          message: "Bug can only be assigned to a frontend, backend or server developer",
        });
      }

      if (developer.role !== type) {
        return res.status(400).json({
          message: `This is a ${type} bug. Assign it to a ${type} developer.`,
        });
      }

      assigneeId = developer._id;
    }

    const screenshotUrl = req.files?.screenshot?.[0]
      ? `/uploads/screenshots/${req.files.screenshot[0].filename}`
      : null;

    const issueVideoFile = req.files?.issueVideo?.[0];
    let issueVideoUrl = null;
    let issueLinkValue = null;

    if (issueVideoFile) {
      issueVideoUrl = `/uploads/issue-videos/${issueVideoFile.filename}`;
    } else if (req.body.issueLink && req.body.issueLink.trim()) {
      try {
        new URL(req.body.issueLink.trim());
      } catch {
        return res.status(400).json({
          message: "issueLink must be a valid URL",
        });
      }
      issueLinkValue = req.body.issueLink.trim();
    }

    const bug = await Bug.create({
      title,
      description,
      project,
      type,
      priority: priority || "medium",
      reportedBy: req.user.userId,
      assignedTo: assigneeId,
      screenshotUrl,
      issueLink: issueLinkValue,
      issueVideoUrl,
    });

    res.status(201).json({
      message: "Bug reported successfully",
      bug,
    });

  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      message: "Failed to report bug",
      error: error.message,
    });
  }
};


const getBugs = async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate("project", "name")
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      bugs,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bugs",
      error: error.message,
    });
  }
};

const assignBug = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "Developer userId is required",
      });
    }

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!["frontend", "backend", "server"].includes(user.role)) {
      return res.status(400).json({
        message: "Bug can only be assigned to frontend, backend or server developer",
      });
    }

    if (bug.type !== user.role) {
      return res.status(400).json({
        message: `This is a ${bug.type} bug. Assign it to a ${bug.type} developer.`,
      });
    }

    bug.assignedTo = userId;
    // bug.status = "in-progress";

    await bug.save();

    res.status(200).json({
      message: "Bug assigned successfully",
      bug,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to assign bug",
      error: error.message,
    });
  }
};


const getMyBugs = async (req, res) => {
  try {
    const bugs = await Bug.find({
      assignedTo: req.user.userId,
    })
      .populate("project", "name")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      bugs,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assigned bugs",
      error: error.message,
    });
  }
};

const updateBugStatus = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["in-progress", "fixed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Use in-progress or fixed",
      });
    }

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const currentUserId = String(req.user.userId || "");
    const assigneeId = bug.assignedTo ? String(bug.assignedTo) : "";

    if (!assigneeId || assigneeId !== currentUserId) {
      return res.status(403).json({
        message: "This bug is not assigned to you",
      });
    }

    bug.status = status;
    await bug.save();

    const updatedBug = await Bug.findById(bug._id)
      .populate("project", "name")
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      message: "Bug status updated successfully",
      bug: updatedBug,
    });
  } catch (error) {
    console.log("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      message: "Failed to update bug status",
      error: error.message,
    });
  }
};

const addFixProof = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { fixLink } = req.body;

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const currentUserId = String(req.user.userId || "");
    const assigneeId = bug.assignedTo ? String(bug.assignedTo) : "";

    if (!assigneeId || assigneeId !== currentUserId) {
      return res.status(403).json({
        message: "This bug is not assigned to you",
      });
    }

    if (req.file) {
      // A video file was uploaded — save its path, clear any previous link
      bug.fixVideoUrl = `/uploads/fix-videos/${req.file.filename}`;
      bug.fixLink = null;
    } else if (fixLink && fixLink.trim()) {
      try {
        new URL(fixLink.trim());
      } catch {
        return res.status(400).json({
          message: "fixLink must be a valid URL",
        });
      }
      bug.fixLink = fixLink.trim();
      bug.fixVideoUrl = null;
    } else {
      return res.status(400).json({
        message: "Provide either a link or a video file",
      });
    }

    await bug.save();

    const updatedBug = await Bug.findById(bug._id)
      .populate("project", "name")
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      message: "Fix proof saved successfully",
      bug: updatedBug,
    });
  } catch (error) {
    console.log("ADD FIX PROOF ERROR:", error);
    res.status(500).json({
      message: "Failed to save fix proof",
      error: error.message,
    });
  }
};

const retestBug = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { result } = req.body;

    if (!["passed", "failed"].includes(result)) {
      return res.status(400).json({
        message: "Result must be passed or failed",
      });
    }

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    if (bug.status !== "fixed") {
      return res.status(400).json({
        message: "Only fixed bugs can be retested",
      });
    }

    if (result === "passed") {
      bug.status = "closed";
    } else {
      bug.status = "reopened";
    }

    await bug.save();

    res.status(200).json({
      message: `Bug retest ${result}`,
      bug,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to retest bug",
      error: error.message,
    });
  }
};

module.exports = {
  createBug,
  getBugs,
  assignBug,
  getMyBugs,
  updateBugStatus,
  addFixProof,
  retestBug
};