const { sql } = require("@vercel/postgres");
const bcrypt = require("bcryptjs");

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Virginia Chemutai";

  if (!email || !password) {
    console.error("Usage: node scripts/add-assistant.js <email> <password> [name]");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await sql`
    INSERT INTO users (role, name, email, password_hash)
    VALUES ('assistant', ${name}, ${email}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${passwordHash}, role = 'assistant'
  `;

  console.log(`Assistant account ready: ${email}`);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
