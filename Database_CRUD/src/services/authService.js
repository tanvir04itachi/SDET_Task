const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

const SALT_ROUNDS = 10;

async function register({ firstname, lastname, email, password }) {
  const existing = await userModel.findUserByEmail(email);
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = await userModel.createUser({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  return userModel.findUserById(userId);
}

async function login({ email, password }) {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    throw new Error("DEACTIVATED");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  return user;
}

module.exports = { register, login };
