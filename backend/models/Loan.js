const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    applicantName: {
      type: String,
      required: [true, "Applicant name is required"],
      trim: true,
    },
    loanAmount: {
      type: Number,
      required: [true, "Loan amount is required"],
      min: [1, "Loan amount must be greater than 0"],
    },
    tenureMonths: {
      type: Number,
      required: [true, "Tenure is required"],
      min: [1, "Tenure must be at least 1 month"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
