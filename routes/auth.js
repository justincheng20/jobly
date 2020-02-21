const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");
const jwt = require("jsonwebtoken");

router.post("/login", async function(req, res, next){
  try{
    const {username, password} = req.body;
    if(await User.authenticate(username, password)){
      let _token = jwt.sign({username}, SECRET_KEY);
      return res.json({_token});
    }
    throw new ExpressError("Invalid user/password", 400);
  } catch(err){
    return next(err);
  }
});

module.exports = router;