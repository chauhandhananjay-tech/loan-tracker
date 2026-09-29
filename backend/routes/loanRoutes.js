const express = require("express");

const {
  createLoan,
  deleteLoan,
  getLoans,
  sendLoanEmail,
  updateLoanStatus,
} = require("../controllers/loanController");
const { requireAdmin, requireAuth } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(requireAuth, getLoans).post(requireAuth, createLoan);
router.delete("/:id", requireAuth, deleteLoan);
router.patch("/:id/status", requireAuth, requireAdmin, updateLoanStatus);
router.post("/:id/email", requireAuth, requireAdmin, sendLoanEmail);

module.exports = router;
