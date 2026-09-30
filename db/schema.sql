CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN (''admin'', ''student'')),
  admission_no TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  group_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS group_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_users_admission_no ON users (admission_no);

CREATE TABLE IF NOT EXISTS join_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  requested_group_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT ''pending'' CHECK (status IN (''pending'', ''approved'', ''rejected'')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests (status);

CREATE TABLE IF NOT EXISTS roster (
  id SERIAL PRIMARY KEY,
  admission_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact TEXT,
  added_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  admission_no TEXT NOT NULL,
  class_date DATE NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (''present'', ''absent'')),
  marked_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(admission_no, class_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_admission_date ON attendance_records (admission_no, class_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records (class_date);
