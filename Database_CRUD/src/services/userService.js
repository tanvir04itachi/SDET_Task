const userModel = require("../models/userModel");

async function allUsers() {
  return userModel.getAllUsers();
}

async function updateUserActiveStatus(id, isActive) {
  const user = await userModel.findUserById(id);
  if (!user) {
    throw new Error("User not found.");
  }
  await userModel.updateUserActiveStatus(id, isActive);
}

async function deleteUser(id) {
  const user = await userModel.findUserById(id);
  if (!user) {
    throw new Error("User not found.");
  }
  await userModel.deleteUser(id);
}

module.exports = { allUsers, updateUserActiveStatus, deleteUser };
