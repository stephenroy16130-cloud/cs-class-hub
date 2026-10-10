const { sql } = require("@vercel/postgres");

async function main() {
  await sql`ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS session_id INTEGER REFERENCES timetable_sessions(id)`;
  console.log("1. session_id column added.");

  await sql`ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_admission_no_class_date_key`;
  console.log("2. Old one-per-day constraint removed.");

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique_session
    ON attendance_records (admission_no, class_date, COALESCE(session_id, 0))
  `;
  console.log("3. New per-session unique index created.");
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
