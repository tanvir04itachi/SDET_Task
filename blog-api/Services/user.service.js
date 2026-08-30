import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { ServiceError } from "./auth.service.js";

export const get_profile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw new ServiceError(404, "user not found");
  return user;
};

export const update_profile = async (userId, body) => {
  const user = await User.findByPk(userId);
  if (!user) throw new ServiceError(404, "user not found");

  // Only these two fields are allowed — role and isActive are silently ignored
  const { firstname, lastname } = body;
  if (firstname) user.firstname = firstname;
  if (lastname)  user.lastname  = lastname;

  await user.save();

  const { password: _pw, ...safeUser } = user.toJSON();
  return safeUser;
};

export const update_password = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new ServiceError(400, "password must be at least 6 characters");
  }

  const user = await User.findByPk(userId);
  if (!user) throw new ServiceError(404, "user not found");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "password updated successfully" };
};

export const update_user_status = async (userId, isActive) => {
  if (typeof isActive !== "boolean") {
    throw new ServiceError(400, "isActive must be true or false");
  }

  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw new ServiceError(404, "user not found");

  user.isActive = isActive;
  await user.save();

  return user;
};
