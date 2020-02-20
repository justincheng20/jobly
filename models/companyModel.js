const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

/**
 * Maximum value for a PSQL integer type
 */
const MAX_INTEGER = 2147483647;

class Company {
  // parameters => {search: "", min_employees: #, max_employees: #}
  // returns list filtered by parameters (optional)
  static async getList({ searchTerm = "", min_employees = 0, max_employees = MAX_INTEGER }) {
    // default search to empty string, then make it look like %search%
    searchTerm = `%${searchTerm}%`;

    if (max_employees < min_employees) {
      throw new ExpressError("Max must be >= min", 400);
    }

    const results = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
        FROM companies
        WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
      [searchTerm, min_employees, max_employees]);

    return results.rows;
  }

  static async get(handle) {
    const result = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
        FROM companies
        WHERE handle=$1`,
      [handle]);

    if (result.rows.length === 0) {
      throw new ExpressError("Handle does not match any companies", 404);
    }

    return result.rows[0];
  }

  // Inserts a new company into our database
  static async make(data) {
    const result = await db.query(
      `INSERT INTO companies
        (handle, name, num_employees, description, logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`,
      [data.handle, data.name, data.num_employees || 0, data.description, data.logo_url]
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
      // TODO: Come back later and figure out how to deal with database errors
      err.message = err.message || "Temporary placeholder for database errors";
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