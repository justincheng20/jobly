const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema");
const userUpdateSchema = require("../schemas/userUpdateSchema");


/**
 * GET /users/ -> {users: [{username, first_name, last_name, email}...]}
 */

router.get("/", async function (req, res, next) {
  try {
    const users = await User.getUsers();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /users/ -> new user {everything but password and is_admin}
 * Expects JSON:
 * {username, password, first_name, last_name, email, photo_url (optional)}
 */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, userSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const user = await User.create(req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:username -> {everything but password and is_admin}
 */

router.get("/:username", async function (req, res, next) {
  try {
    let username = req.params.username;
    const user = await User.get(username);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /users/:username
 */

router.patch("/:username", async function (req, res, next) {
  try {
    let username = req.params.username;

    const result = jsonschema.validate(req.body, userUpdateSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const user = await User.update(username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
})

/**
 * DELETE /users/:username
 */

router.delete("/:username", async function (req, res, next) {
  try {
    let username = req.params.username;
    await User.delete(username);
    return res.json({ message: "Deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;