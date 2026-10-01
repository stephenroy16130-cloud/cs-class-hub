const { sql } = require("@vercel/postgres");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

function splitStatements(schema) {
  return schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  const statements = splitStatements(schema);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`Schema applied (${statements.length} statements).`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "stephen@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await sql`
    INSERT INTO users (role, name, email, password_hash)
    VALUES ('admin', 'Stephen', ${adminEmail}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
    RETURNING id;
  `;
  console.log(`Admin account ready: ${adminEmail}`);

  const rosterPath = path.join(__dirname, "roster.json");
  const roster = JSON.parse(fs.readFileSync(rosterPath, "utf8"));

  let inserted = 0;
  let skipped = 0;
  for (const r of roster) {
    const result = await sql`
      INSERT INTO roster (admission_no, name, contact)
      VALUES (${r.admissionNo.toUpperCase()}, ${r.name}, ${r.contact})
      ON CONFLICT (admission_no) DO NOTHING
      RETURNING id;
    `;
    if (result.rows.length > 0) inserted++;
    else skipped++;
  }
  console.log(`Roster seeded: ${inserted} inserted, ${skipped} skipped.`);

  const existingAnnouncements = await sql`SELECT id FROM announcements LIMIT 1`;
  if (existingAnnouncements.rows.length === 0) {
    const sample = [
      { title: "COMP 103 Assignment Deadline Extended", category: "Academic", excerpt: "Following requests from group leaders, the deadline has been extended to Monday." },
      { title: "Class Representative Elections Results", category: "Administrative", excerpt: "Thank you to everyone who voted. Full results are posted on the announcements page." },
      { title: "Welcome Back Social This Friday", category: "Social", excerpt: "Join your classmates for snacks and games in the common room at 5pm." },
    ];
    for (const a of sample) {
      await sql`INSERT INTO announcements (title, category, excerpt) VALUES (${a.title}, ${a.category}, ${a.excerpt})`;
    }
    console.log("Sample announcements seeded.");
  } else {
    console.log("Announcements already exist, skipping sample seed.");
  }

  const existingTimetable = await sql`SELECT id FROM timetable_sessions LIMIT 1`;
  if (existingTimetable.rows.length === 0) {
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
    for (const t of initialTimetable) {
      await sql`
        INSERT INTO timetable_sessions (day, time, unit, lecturer, venue, mode)
        VALUES (${t.day}, ${t.time}, ${t.unit}, ${t.lecturer}, ${t.venue}, ${t.mode})
      `;
    }
    console.log(`Timetable seeded: ${initialTimetable.length} sessions.`);
  } else {
    console.log("Timetable already exists in the database, skipping initial seed.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
