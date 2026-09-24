const express = require("express");

const {
  createBug,
  getBugs,
  assignBug,
  getMyBugs,
  updateBugStatus,
  addFixProof,
  retestBug
} = require("../controllers/bugController");



const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const uploadFixVideo = require("../middleware/uploadFixVideoMiddleware");
const uploadBugAttachments = require("../middleware/uploadBugAttachmentsMiddleware");

const router = express.Router();


// QA can report bug (with optional screenshot and/or link/video)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("qa"),
  uploadBugAttachments.fields([
    { name: "screenshot", maxCount: 1 },
    { name: "issueVideo", maxCount: 1 },
  ]),
  createBug
);


// Logged-in users can see bugs
router.get(
  "/",
  authMiddleware,
  getBugs
);

router.patch(
  "/assign/:bugId",
  authMiddleware,
  roleMiddleware("admin"),
  assignBug
);

router.get(
  "/my-bugs",
  authMiddleware,
  roleMiddleware("frontend", "backend", "server"),
  getMyBugs
);

router.patch(
  "/status/:bugId",
  authMiddleware,
  roleMiddleware("frontend", "backend", "server"),
  updateBugStatus
);

router.put(
  "/status/:bugId",
  authMiddleware,
  roleMiddleware("frontend", "backend", "server"),
  updateBugStatus
);

router.patch(
  "/fix-proof/:bugId",
  authMiddleware,
  roleMiddleware("frontend", "backend", "server"),
  uploadFixVideo.single("fixVideo"),
  addFixProof
);

router.patch(
  "/retest/:bugId",
  authMiddleware,
  roleMiddleware("qa"),
  retestBug
);


module.exports = router;