const { getPool } = require("../config/db");

async function createUser({ firstname, lastname, email, password }) {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)`,
    [firstname, lastname, email, password]
  );
  return result.insertId;
}

async function findUserByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0];
}

async function findUserById(id) {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  return rows[0];
}

async function getAllUsers() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, firstname, lastname, email, isActive, role, createAt, updateAt FROM users`
  );
  return rows;
}

async function updateUserActiveStatus(id, isActive) {
  const pool = getPool();
  const [result] = await pool.query(`UPDATE users SET isActive = ? WHERE id = ?`, [
    isActive,
    id,
  ]);
  return result.affectedRows;
}

async function updateUserRole(id, role) {
  const pool = getPool();
  const [result] = await pool.query(`UPDATE users SET role = ? WHERE id = ?`, [role, id]);
  return result.affectedRows;
}

async function deleteUser(id) {
  const pool = getPool();
  const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
  return result.affectedRows;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUserActiveStatus,
  updateUserRole,
  deleteUser,
};
