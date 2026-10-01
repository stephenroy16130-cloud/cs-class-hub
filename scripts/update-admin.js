const { sql } = require("@vercel/postgres");
const bcrypt = require("bcryptjs");

async function main() {
  const newEmail = process.argv[2];
  const newPassword = process.argv[3];

  if (!newEmail || !newPassword) {
    console.error("Usage: node scripts/update-admin.js <email> <password>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const result = await sql`
    UPDATE users
    SET email = ${newEmail}, password_hash = ${passwordHash}
    WHERE role = 'admin'
    RETURNING id, email;
  `;

  if (result.rows.length === 0) {
    console.error("No admin account found to update.");
    process.exit(1);
  }

  console.log(`Admin account updated: ${result.rows[0].email}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
