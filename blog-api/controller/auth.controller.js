import { register_user, login_user, ServiceError } from "../Services/auth.service.js";

// Reusable error handler — keeps both controllers consistent
const send_error = (res, error) => {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({ message: error.errors[0].message });
  }
  // Catches DB-level unique constraint (e.g. duplicate email race condition)
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ message: "email already registered" });
  }
  console.error(error);
  res.status(500).json({ message: "something went wrong" });
};

export const sign_up = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const user = await register_user({ firstname, lastname, email, password });
    res.status(201).json({ message: "user registered successfully", data: user });
  } catch (error) {
    send_error(res, error);
  }
};

export const log_in = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await login_user({ email, password });
    res.status(200).json({ message: "login successful", token, data: user });
  } catch (error) {
    send_error(res, error);
  }
};
