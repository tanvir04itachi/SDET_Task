import User from "../models/user.model.js";
import { ServiceError } from "../Services/auth.service.js";
import {
  get_profile,
  update_profile,
  update_password,
  update_user_status,
  update_user_role,
} from "../Services/user.service.js";

const send_error = (res, error) => {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  res.status(500).json({ message: "something went wrong" });
};

// Admin: get all users
export const get_users = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.status(200).json({ message: "users found", data: users });
  } catch (error) {
    send_error(res, error);
  }
};

// Admin: get user by ID
export const get_user_by_id = async (req, res) => {
  try {
    const user = await User.findByPk(Number(req.params.id), {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "user not found" });
    res.status(200).json({ message: "user found", data: user });
  } catch (error) {
    send_error(res, error);
  }
};

// User/Admin: get own profile
export const get_own_profile = async (req, res) => {
  try {
    const user = await get_profile(req.user.id);
    res.status(200).json({ message: "profile found", data: user });
  } catch (error) {
    send_error(res, error);
  }
};

// User/Admin: update own profile
export const update_own_profile = async (req, res) => {
  try {
    const user = await update_profile(req.user.id, req.body);
    res.status(200).json({ message: "profile updated", data: user });
  } catch (error) {
    send_error(res, error);
  }
};

// User/Admin: update own password
export const update_own_password = async (req, res) => {
  try {
    const result = await update_password(req.user.id, req.body.password);
    res.status(200).json(result);
  } catch (error) {
    send_error(res, error);
  }
};

// Admin: activate or deactivate a user
export const update_status = async (req, res) => {
  try {
    const user = await update_user_status(Number(req.params.id), req.body.isActive);
    res.status(200).json({ message: "user status updated", data: user });
  } catch (error) {
    send_error(res, error);
  }
};

// Admin: change a user's role
export const update_role = async (req, res) => {
  try {
    const user = await update_user_role(Number(req.params.id), req.body.role, req.user.id);
    res.status(200).json({ message: "user role updated", data: user });
  } catch (error) {
    send_error(res, error);
  }
};
