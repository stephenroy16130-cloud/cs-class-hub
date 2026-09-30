const { sql } = require("@vercel/postgres");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await sql.query(schema);
  console.log("Schema applied.");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "stephen@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminResult = await sql`
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

  console.log(`Roster seeded: ${inserted} inserted, ${skipped} skipped (duplicates or already existed).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
