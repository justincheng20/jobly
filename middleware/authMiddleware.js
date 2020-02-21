const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

function authenticateJWT(req, res, next) {
  try {
    const token = req.body._token;
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next){
  if(!req.user){
    const err = new ExpressError("Unauthorized", 401);
    return next(err);
  } else {
    return next();
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn
}