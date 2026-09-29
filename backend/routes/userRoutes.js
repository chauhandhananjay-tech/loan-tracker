const express = require("express");
const { deleteUser, getUsers, updateUser } = require("../controllers/userController");
const { requireAdmin, requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/", getUsers);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;