const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Loan = require("../models/Loan");
const User = require("../models/User");

async function getLoans(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user.id };
    const loans = await Loan.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    next(error);
  }
}

async function createLoan(req, res, next) {
  try {
    const { applicantName, loanAmount, tenureMonths, purpose, bankName } = req.body;
    const loan = await Loan.create({
      userId: req.user.id,
      applicantName,
      loanAmount,
      tenureMonths,
      purpose,
      bankName,
    });
    res.status(201).json(loan);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((validationError) => validationError.message)
          .join(", "),
      });
    }
    next(error);
  }
}

async function deleteLoan(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid loan ID." });
    }

    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, userId: req.user.id };
    const loan = await Loan.findOneAndDelete(filter);
    if (!loan) {
      return res.status(404).json({ message: "Loan application not found." });
    }

    res.json({ message: "Loan application deleted successfully." });
  } catch (error) {
    next(error);
  }
}

async function updateLoanStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Approved", "Rejected"];

    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be Pending, Approved, or Rejected." });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid loan ID." });
    }

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan application not found." });
    }

    res.json(loan);
  } catch (error) {
    next(error);
  }
}

async function sendLoanEmail(req, res, next) {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    const loan = await Loan.findById(req.params.id).populate("userId", "email name");
    if (!loan) {
      return res.status(404).json({ message: "Loan application not found." });
    }
    if (!loan.userId?.email) {
      return res.status(400).json({ message: "Applicant email is not available." });
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(503).json({ message: "SMTP email settings are missing in backend/.env." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: loan.userId.email,
      subject,
      text: message,
    });

    res.json({ message: `Email sent to ${loan.userId.email}.` });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createLoan,
  deleteLoan,
  getLoans,
  sendLoanEmail,
  updateLoanStatus,
};
