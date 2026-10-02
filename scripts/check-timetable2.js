const { sql } = require("@vercel/postgres");

async function main() {
  const result = await sql`
    SELECT id, day, time, unit, lecturer, venue, mode FROM timetable_sessions
    ORDER BY day, time
  `;
  console.log(JSON.stringify(result.rows, null, 2));
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
