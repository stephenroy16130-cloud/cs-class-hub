const { sql } = require("@vercel/postgres");

async function main() {
  const confirm = process.argv[2];
  if (confirm !== "CONFIRM") {
    console.log("This will permanently delete ALL attendance records for ALL students.");
    console.log("To proceed, run: node scripts/reset-attendance.js CONFIRM");
    return;
  }

  const countBefore = await sql`SELECT COUNT(*) as count FROM attendance_records`;
  console.log(`About to delete ${countBefore.rows[0].count} attendance records...`);

  await sql`DELETE FROM attendance_records`;

  const countAfter = await sql`SELECT COUNT(*) as count FROM attendance_records`;
  console.log(`Done. Attendance table now has ${countAfter.rows[0].count} records.`);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
