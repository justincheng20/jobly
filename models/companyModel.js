const db = require("../db");
const ExpressError = require("../helpers/expressError");

/**
 * Maximum value for a PSQL integer type
 */
const MAX_INTEGER = 2147483647;

class Company{
  // parameters => {search: "", min_employees: #, max_employees: #}
  // returns list filtered by parameters (optional)
  static async getCompanies({search, min_employees, max_employees}){
    // default search to empty string, then make it look like %search%
    search = `%${search || ""}%`;
    min_employees = min_employees || 0;
    max_employees = max_employees || MAX_INTEGER;

    if (max_employees < min_employees) {
      throw new ExpressError("Max must be >= min", 400);
    }
    
    const results = await db.query(
     `SELECT handle, name, num_employees, description, logo_url
        FROM companies
        WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
      [search, min_employees, max_employees]);
    
    return results.rows;
  }
}

module.exports = Company;