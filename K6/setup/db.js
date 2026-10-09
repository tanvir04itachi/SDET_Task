// Shared MySQL connection for the local-only DB preparation scripts.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

async function connect() {
  const host = process.env.DB_HOST;
  if (!LOCAL_HOSTS.includes(host)) {
    throw new Error(`Refusing to modify a non-local database (DB_HOST=${host}). These scripts are for a local test DB only.`);
  }
  return mysql.createConnection({
    host,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

module.exports = { connect };
