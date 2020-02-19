const db = require("../db");
const ExpressError = require("../helpers/expressError");

/**
 * Maximum value for a PSQL integer type
 */
const MAX_INTEGER = 2147483647;

class Company {
  // parameters => {search: "", min_employees: #, max_employees: #}
  // returns list filtered by parameters (optional)
  static async getCompanies({ searchTerm = "", min_employees = 0, max_employees = MAX_INTEGER }) {
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

  static async makeCompany(data) {
    const result = await db.query(
      `INSERT INTO companies
        (handle, name, num_employees, description, logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`,
      [data.handle, data.name, data.num_employees || 0, data.description, data.logo_url]
    );

    return result.rows[0];
  }
}

module.exports = Company;