const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const Job = require("./jobModel");

/**
 * Maximum value for a PSQL integer type
 */
const MAX_INTEGER = 2147483647;

class Company {

  constructor({ handle, name, num_employees, description, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }

  // parameters => {search: "", min_employees: #, max_employees: #}
  // returns list filtered by parameters (optional)
  static async getCompanies({ searchTerm = "", min_employees = 0, max_employees = MAX_INTEGER }) {
    // default search to empty string, then make it look like %search%
    searchTerm = `%${searchTerm}%`;

    if (+max_employees < +min_employees) {
      throw new ExpressError("Max must be >= min", 400);
    }

    const results = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
        FROM companies
        WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
      [searchTerm, min_employees, max_employees]);

    return results.rows;
  }

/**
     * 
     * [
     * (...company1), (...job1),
     * (...company1), (...job2)
     * ]
     * 
     * [
     * (...company1), ()
     * ]
     * 
     * 
     * {..., jobs: [{}]}
     */

  static async get(handle) {
    const result = await db.query(
      `SELECT id, title,
        handle, name, num_employees, description, logo_url
        FROM companies LEFT JOIN jobs
          ON handle = company_handle
        WHERE handle=$1`,
      [handle]);

    console.log(result.rows);

    if (result.rows.length === 0) {
      throw new ExpressError("Handle does not match any companies", 404);
    }

    let company = new Company(result.rows[0]);
    let jobs;

    // LEFT join returns a full row for the company, but also a null job.
    // This means mapping over it would make an array with an empty job
    // object instead of just an empty array
    if(result.rows[0].id){
      jobs = result.rows.map( job => new Job(job) );
    } else {
      jobs = [];
    }

    company.jobs = jobs;

    return company;
  }

  // Inserts a new company into our database
  static async create({ handle, name, num_employees = 0, description, logo_url }) {
    const result = await db.query(
      `INSERT INTO companies
        (handle, name, num_employees, description, logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );

    return result.rows[0];
  }

  static async update(handle, data) {
    try {
      const { query, values } = sqlForPartialUpdate('companies', data, "handle", handle);
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new ExpressError("Handle does not match any companies", 404);
      }
      return result.rows[0];
    } catch (err) {
      err.status = err.status || 400;
      throw err;
    }
  }

  static async delete(handle) {
    const result = await db.query(
      `DELETE FROM companies
        WHERE handle=$1
        RETURNING handle`,
      [handle]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Handle does not match any companies", 404);
    }
  }

}

module.exports = Company;