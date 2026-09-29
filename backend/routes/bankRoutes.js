const express = require("express");
const banks = require("../data/banks");

const router = express.Router();

router.get("/", (req, res) => {
  const search = req.query.search?.toLowerCase().trim();
  const result = search ? banks.filter((bank) => bank.toLowerCase().includes(search)) : banks;
  res.json(result);
});

module.exports = router;