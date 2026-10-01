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
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
