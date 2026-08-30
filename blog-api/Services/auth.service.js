import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Signals a known, client-caused failure.
// Controllers convert this into the right HTTP status instead of 500.
export class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.name   = "ServiceError";
    this.status = status;
  }
}

export const register_user = async ({ firstname, lastname, email, password }) => {
  if (!firstname || !lastname || !email || !password) {
    throw new ServiceError(400, "firstname, lastname, email and password are required");
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ServiceError(400, "email must be a valid email address");
  }

  if (password.length < 6) {
    throw new ServiceError(400, "password must be at least 6 characters");
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ServiceError(409, "email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    // role and isActive are always set by the model defaults — never from the request
  });

  const { password: _pw, ...safeUser } = user.toJSON();
  return safeUser;
};

export const login_user = async ({ email, password }) => {
  if (!email || !password) {
    throw new ServiceError(400, "email and password are required");
  }

  const user = await User.findOne({ where: { email } });

  // Same message for wrong email and wrong password — avoids email enumeration
  if (!user) {
    throw new ServiceError(401, "invalid email or password");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ServiceError(401, "invalid email or password");
  }

  // Block deactivated accounts AFTER verifying the password
  if (!user.isActive) {
    throw new ServiceError(403, "your account has been deactivated");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
};
