const express = require("express");
const router = express.Router();
const Company = require("../models/companyModel");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema");


/**
 * GET /companies -> list of all companies
 * Query parameters:
 * -search => search string for filtering names
 * -min_employees
 * -max_employees
 */

router.get("/", async function (req, res, next) {
  try {
    const companies = await Company.getList(req.query);

    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /companies -> make a new company
 * Expects JSON: {handle (required), name (required), 
 * num_employees (defaults to 0), description, logo_url } 
 */

router.post("/", async function (req, res, next) {
  try {
    // Set up to pass schema
    req.body._name = req.body.name;
    req.body._handle = req.body.handle;

    const result = jsonschema.validate(req.body, companySchema);

    if(!result.valid){
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const company = await Company.make(req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /companies/:handle
 * Return info about company
 */

router.get("/:handle", async function (req, res, next) {
  try {
    let handle = req.params.handle;
    const company = await Company.get(handle);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /companies: can update using partial info. 
 */
router.patch("/:handle", async function (req, res, next) {
  try {
    // Set up to pass schema regardless of whether input was given
    // (so that it still does the update right)
    req.body._handle = req.body.handle || "";
    req.body._name = req.body.name || "";
    let handle = req.params.handle;

    const result = jsonschema.validate(req.body, companySchema);

    if(!result.valid){
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const company = await Company.update(handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /companies/:handle
 * Remove company, returning success message
 */

router.delete("/:handle", async function (req, res, next) {
  try {
    let handle = req.params.handle;
    await Company.delete(handle);
    return res.json({ message: "Deleted" })
  } catch (err) {
    return next(err);
  }
})

module.exports = router;