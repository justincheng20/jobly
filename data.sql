CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
);