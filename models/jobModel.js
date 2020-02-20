const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const Company = require("./companyModel");

class Job {
  constructor({ id, title, salary, equity, company_handle, date_posted }) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
    this.date_posted = date_posted;
  }

  static async getJobs({ searchTerm = "", min_salary = 0, min_equity = 0 }) {
    searchTerm = `%${searchTerm}%`;

    const results = await db.query(
      `SELECT id, title, company_handle
        FROM jobs
        WHERE title ILIKE $1 AND salary >= $2 AND equity >= $3
        ORDER BY date_posted DESC`,
      [searchTerm, min_salary, min_equity]
    );

    return results.rows;
  }

  // Get => {id, title, salary, equity, date_posted, company: {all info on the company}}
  static async get(id) {
    const result = await db.query(
      `SELECT
        id, title, salary, equity, date_posted
        handle, name, num_employees, description, logo_url
        FROM jobs JOIN companies
          ON company_handle = handle
        WHERE id=$1`,
      [id]);

    if (result.rows.length === 0) {
      throw new ExpressError("ID does not match any jobs", 404);
    }

    let job = new Job(result.rows[0]);
    let company = new Company(result.rows[0]);

    job.company = company;

    return job;
  }

  // Create => {id, title, salary, equity, company_handle, date_posted}
  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle, date_posted`,
      [title, salary, equity, company_handle]
    );

    return result.rows[0];
  }

  static async update(id, data) {
    try {
      const { query, values } = sqlForPartialUpdate('jobs', data, 'id', id);
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new ExpressError("ID does not match any jobs", 404);
      }
      return result.rows[0];
    } catch (err) {
      err.status = err.status || 400;
      throw err;
    }
  }

  static async delete(id) {
    const result = await db.query(
      `DELETE FROM jobs
        WHERE id = $1
        RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("ID does not match any jobs");
    }
  }
}

module.exports = Job;