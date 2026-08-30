import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  firstname: { type: DataTypes.STRING,  allowNull: false },
  lastname:  { type: DataTypes.STRING,  allowNull: false },
  email:     { type: DataTypes.STRING,  allowNull: false, unique: true },
  password:  { type: DataTypes.STRING,  allowNull: false },
  isActive:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  role:      { type: DataTypes.STRING,  allowNull: false, defaultValue: "user" },
}, {
  tableName:  "users",
  timestamps: true,
  createdAt:  "createAt",
  updatedAt:  "updateAt",
});

export default User;
