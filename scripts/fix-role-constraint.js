const { sql } = require("@vercel/postgres");

async function main() {
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`;
  await sql`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'assistant', 'student'))`;
  console.log("Role constraint updated to allow 'assistant'.");
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
