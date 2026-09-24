const express = require("express");

const {
  createProject,
  getProjects,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Create Project
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "qa"),
  createProject
);


// Get Projects
router.get(
  "/",
  authMiddleware,
  getProjects
);


module.exports = router;