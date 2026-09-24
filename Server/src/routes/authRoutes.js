const express = require("express");

const {
  signup,
  login,
  getProfile,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authMiddleware, getProfile);

router.get(
  "/admin-test",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin",
    });
  }
);

router.get(
  "/qa-test",
  authMiddleware,
  roleMiddleware("qa"),
  (req, res) => {
    res.json({
      message: "Welcome QA",
    });
  }
);

module.exports = router;
