const { sql } = require("@vercel/postgres");

async function main() {
  const result = await sql`SELECT COUNT(*) as count FROM timetable_sessions`;
  console.log("Rows in timetable_sessions:", result.rows[0].count);
  const sample = await sql`SELECT * FROM timetable_sessions LIMIT 3`;
  console.log(sample.rows);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
