const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");
const {BCRYPT_WORK_FACTOR} = require("../config");

//Might need to import constructors

class User {
  constructor({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
    is_admin
  }) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
    this.is_admin = is_admin
  }


  getUserInfo() {
    return {
      username: this.username,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      photo_url: this.photo_url
    }
  }

  static async authenticate(username, password){
    const result = await db.query(
      "SELECT password FROM users WHERE username = $1", 
      [username]);
    let user = result.rows[0];

    if(user){
      if(await bcrypt.compare(password, user.password)){
        console.log("this shouldn't be here")
        return true;
      }
    }
    console.log("RETURNING FALSE");
    return false;
  }

  static async getUsers() {
    const results = await db.query(
      `SELECT username, first_name, last_name, email
            FROM users`);

    return results.rows;
  }

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
            FROM users 
            WHERE username=$1`,
      [username]);

    if (result.rows.length === 0) {
      throw new ExpressError("Username does not match any user", 404);
    }

    return result.rows[0];
  }

  static async create({
    username, password, first_name, last_name, email, photo_url
  }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users
        (username, password, first_name, last_name, email, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, first_name, last_name, email, photo_url`,
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );

    return result.rows[0];
  }

  static async update(username, data) {
    try {
      const { query, values } = sqlForPartialUpdate('users', data, "username", username);
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new ExpressError("Username does not match any user", 404);
      }

      let updatedUser = new User(result.rows[0])
      return updatedUser.getUserInfo();
    } catch (err) {
      err.status = err.status || 400;
      throw err;
    }
  }

  static async delete(username) {
    const result = await db.query(
      `DELETE FROM users
            WHERE username=$1
            RETURNING username`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("username does not match any users", 404);
    }
  }
}

module.exports = User;