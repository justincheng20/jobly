CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL,
  company_handle TEXT REFERENCES companies ON DELETE CASCADE,
  date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT equity_check CHECK (equity >= 0 AND equity <= 1)
);