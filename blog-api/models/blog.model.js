import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";

const Blog = sequelize.define("Blog", {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  blogTitle: { type: DataTypes.STRING,  allowNull: false },
  blog:      { type: DataTypes.TEXT,    allowNull: false },
  category:  { type: DataTypes.STRING,  allowNull: false },
}, {
  tableName:  "blogs",
  timestamps: true,
  createdAt:  "createAt",
  updatedAt:  "updateAt",
});

// one user has many blogs; each blog belongs to one user
Blog.belongsTo(User, { foreignKey: "userId", as: "author" });
User.hasMany(Blog,   { foreignKey: "userId" });

export default Blog;
