const { getPool } = require("../config/db");

async function createBlog({ userId, blogTitle, blog, category }) {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO blogs (userId, blogTitle, blog, category) VALUES (?, ?, ?, ?)`,
    [userId, blogTitle, blog, category]
  );
  return result.insertId;
}

async function getAllBlogs() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT b.*, u.firstname, u.lastname, u.email
     FROM blogs b
     JOIN users u ON u.id = b.userId
     ORDER BY b.createAt DESC`
  );
  return rows;
}

async function getBlogsByUserId(userId) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM blogs WHERE userId = ? ORDER BY createAt DESC`,
    [userId]
  );
  return rows;
}

async function findBlogById(id) {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM blogs WHERE id = ?`, [id]);
  return rows[0];
}

async function searchBlogsByIdOrTitle(searchTerm) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT b.*, u.firstname, u.lastname, u.email
     FROM blogs b
     JOIN users u ON u.id = b.userId
     WHERE b.id = ? OR b.blogTitle LIKE ?`,
    [Number.isNaN(Number(searchTerm)) ? -1 : Number(searchTerm), `%${searchTerm}%`]
  );
  return rows;
}

async function updateBlog(id, { blogTitle, blog, category }) {
  const pool = getPool();
  const [result] = await pool.query(
    `UPDATE blogs SET blogTitle = ?, blog = ?, category = ? WHERE id = ?`,
    [blogTitle, blog, category, id]
  );
  return result.affectedRows;
}

async function deleteBlog(id) {
  const pool = getPool();
  const [result] = await pool.query(`DELETE FROM blogs WHERE id = ?`, [id]);
  return result.affectedRows;
}

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogsByUserId,
  findBlogById,
  searchBlogsByIdOrTitle,
  updateBlog,
  deleteBlog,
};
