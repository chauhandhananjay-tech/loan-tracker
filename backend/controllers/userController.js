const mongoose = require("mongoose");
const Loan = require("../models/Loan");
const User = require("../models/User");

async function getUsers(req, res, next) {
  try {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const { name, email, role } = req.body;
    if (!name || !email || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Name, email and a valid role are required." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), email: email.toLowerCase().trim(), role },
      { new: true, runValidators: true }
    ).select("name email role createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered." });
    }
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    await Loan.deleteMany({ userId: user._id });
    res.json({ message: "User and their loan applications were deleted." });
  } catch (error) {
    next(error);
  }
}

module.exports = { deleteUser, getUsers, updateUser };