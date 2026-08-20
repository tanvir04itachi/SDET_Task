const mysql = require("mysql2/promise");
const dbConfig = require("./dbConfig");

let pool;

/**
 * Creates the database (if missing) and returns a connection pool bound to it.
 */
async function initDb() {
  // Connect without selecting a database first, so we can create it if needed.
  const rootConnection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await rootConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
  );
  await rootConnection.end();

  pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await createTables();

  return pool;
}

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstname VARCHAR(100) NOT NULL,
      lastname VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      isActive BOOLEAN DEFAULT true,
      role VARCHAR(20) DEFAULT 'user',
      createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updateAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      blogTitle VARCHAR(255) NOT NULL,
      blog TEXT NOT NULL,
      category VARCHAR(100),
      createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updateAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_blogs_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

function getPool() {
  if (!pool) {
    throw new Error("Database pool has not been initialized. Call initDb() first.");
  }
  return pool;
}

module.exports = { initDb, getPool };
