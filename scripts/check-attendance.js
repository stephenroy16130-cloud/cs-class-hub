const { sql } = require("@vercel/postgres");

async function main() {
  const col = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'session_id'
  `;
  console.log("session_id column exists:", col.rows.length > 0);

  const idx = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'attendance_records'
  `;
  console.log("Indexes on attendance_records:", idx.rows.map((r) => r.indexname));

  const sessions = await sql`
    SELECT id, day, time, unit, mode FROM timetable_sessions ORDER BY day, time
  `;
  console.log("Timetable sessions:", sessions.rows.length);
  console.log(sessions.rows);

  const roster = await sql`SELECT COUNT(*) as count FROM roster`;
  console.log("Roster size:", roster.rows[0].count);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
