const { initDb, getPool } = require("../src/config/db");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/promoteAdmin.js <email>");
    process.exit(1);
  }
  await initDb();
  await getPool().query("UPDATE users SET role='admin' WHERE email=?", [email]);
  console.log(`Promoted ${email} to admin.`);
  process.exit(0);
}

main();
