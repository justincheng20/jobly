const express = require("express");
const router = express.Router();
const Company = require("../models/companyModel");
const ExpressError = require("../helpers/expressError");

/**
 * GET /companies -> list of all companies
 * Query parameters:
 * -search => search string for filtering names
 * -min_employees
 * -max_employees
 */

router.get("/", async function (req, res, next) {
  try {
    const companies = await Company.getCompanies(req.query);

    return res.json({ companies })
  } catch (err) {
    return next(err);
  }
});

module.exports = router;