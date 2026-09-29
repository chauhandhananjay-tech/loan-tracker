const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "Name, email and a 6-character password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = normalizedEmail === process.env.ADMIN_EMAIL?.toLowerCase() ? "admin" : "user";
    const user = await User.create({ name, email: normalizedEmail, password: passwordHash, role });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() }).select("+password");
    const passwordMatches = user && (await bcrypt.compare(password || "", user.password));

    if (!passwordMatches) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, register };