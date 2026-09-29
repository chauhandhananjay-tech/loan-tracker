const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");

const loanRoutes = require("./routes/loanRoutes");
const authRoutes = require("./routes/authRoutes");
const bankRoutes = require("./routes/bankRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Loan Application Tracker API is running" });
});

app.use("/api/loans", loanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});
