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

    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST companies -> make a new company
 * Expects JSON: {handle (required), name (required), 
 * num_employees (defaults to 0), description, logo_url } 
 */

router.post("/", async function (req, res, next) {
  try {
    const company = await Company.makeCompany(req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;