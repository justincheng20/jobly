const express = require("express");
const router = express.Router();
const Job = require("../models/jobModel");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema");
const jobUpdateSchema = require("../schemas/jobUpdateSchema");
const jobSearchSchema = require("../schemas/jobSearchSchema");


/**
 * Get /jobs -> get a list of all job postings
 * Query Parameters:
 * - searchTerm: search string for filtering by job title
 * - min_salary
 * - min_equity
 */

router.get("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.query, jobSearchSchema);

    if(!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const jobs = await Job.getJobs(req.query);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/**
* POST /job -> make a new job listing
* Expects JSON: {title (required), 
* salary (required), equity (required)} 
*/

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const job = await Job.create(req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


/**
 * GET /job/:id
 * Return info about a job
 */

router.get("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    const job = await Job.get(id);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


/**
 * PATCH /job/:id: can update using partial info. 
 */
router.patch("/:id", async function (req, res, next) {
  try {

    let id = req.params.id;

    const result = jsonschema.validate(req.body, jobUpdateSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const job = await Job.update(id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


/**
 * DELETE /job/:id
 * Remove job listing, returning success message
 */

router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    await Job.delete(id);
    return res.json({ message: "Deleted" })
  } catch (err) {
    return next(err);
  }
})

module.exports = router;