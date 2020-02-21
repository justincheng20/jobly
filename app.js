/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const { authenticateJWT, ensureLoggedIn } = require("./middleware/authMiddleware");

const app = express();

app.use(express.json());

// add logging system
app.use(morgan("tiny"));
app.use(authenticateJWT);

const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (process.env.NODE_ENV != "test"){
    console.error(err.stack);
  }

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
