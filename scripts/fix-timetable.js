const { sql } = require("@vercel/postgres");

const initialTimetable = [
  { day: "Monday", time: "9:00 AM - 11:00 AM", unit: "COMP 103 A", lecturer: "Mr. Benjamin", venue: "KSU C22", mode: "In-Person" },
  { day: "Tuesday", time: "7:00 AM - 9:00 AM", unit: "COMP 107", lecturer: "Mdm Rebecca", venue: "KSU T V3", mode: "Online" },
  { day: "Tuesday", time: "1:00 PM - 3:00 PM", unit: "MATH 112 (COMP)", lecturer: "Mr. Geoffrey", venue: "KSU LH 20", mode: "In-Person" },
  { day: "Wednesday", time: "12:00 PM - 1:00 PM", unit: "COMP 103", lecturer: "Mr. Benjamin", venue: "KSU T V6", mode: "Online" },
  { day: "Wednesday", time: "1:00 PM - 2:00 PM", unit: "COMP 107", lecturer: "Mdm Rebecca", venue: "KSU T V7", mode: "Online" },
  { day: "Wednesday", time: "5:00 PM - 7:00 PM", unit: "COMS 101 - SIST", lecturer: "Mdm. Veronica", venue: "KSU T V1", mode: "Online" },
  { day: "Thursday", time: "9:00 AM - 11:00 AM", unit: "PHIL 104 - SIST", lecturer: "Dr. Ichiluo", venue: "KSU T V1", mode: "Online" },
  { day: "Thursday", time: "3:00 PM - 5:00 PM", unit: "COMP 103 B", lecturer: "Mr. Benjamin", venue: "COMP LAB 6", mode: "In-Person" },
  { day: "Friday", time: "12:00 PM - 1:00 PM", unit: "MATH 112 - COMP", lecturer: "Mr. Geoffrey", venue: "KSU TC23", mode: "In-Person" },
];

async function main() {
  const existing = await sql`SELECT COUNT(*) as count FROM timetable_sessions`;
  if (Number(existing.rows[0].count) > 0) {
    console.log("Timetable already has rows, skipping to avoid duplicates.");
    return;
  }

  for (const t of initialTimetable) {
    await sql`
      INSERT INTO timetable_sessions (day, time, unit, lecturer, venue, mode)
      VALUES (${t.day}, ${t.time}, ${t.unit}, ${t.lecturer}, ${t.venue}, ${t.mode})
    `;
  }
  console.log(`Inserted ${initialTimetable.length} sessions.`);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
