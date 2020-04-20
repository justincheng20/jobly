# Jobly

This is a backend for a job posting site, built using Express and Postgres.

CRUD routes have been implemented for:
- Users
- Jobs
- Companies

Additional Features:
- Filtering companies by a search term or size of company
- Filtering jobs by a search term, salary, or equity

## Libraries
- Bcrypt: used for encrypting passwords
- JsonWebToken: Used for authentication 
- SuperTest: Testing library
- Morgan: Logger for middleware


## Setup
1) "npm install" to install the dependencies
2) "createdb jobly" to create the database. Additional, type "createdb jobly-test" to create a test database
3) "psql jobly < data.sql" to seed the database. Do the same for jobly-test to run tests
4) "node server" to start server at http://localhost:3000/


## Testing
1) Set up test database (see Setup)
2) Type "jest name_of_test_file" to run one test file. Test files can be found in the __tests__ folder. 
Typing only "jest" runs all the test files at once and may cause bugs.
