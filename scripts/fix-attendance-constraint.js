const { sql } = require("@vercel/postgres");

async function main() {
  await sql`ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_admission_no_class_date_key`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique_session
    ON attendance_records (admission_no, class_date, COALESCE(session_id, 0))
  `;
  console.log("Attendance constraint updated to allow multiple sessions per day.");
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
