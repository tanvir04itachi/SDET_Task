import api from "@/utils/api";

export const getProfile = async () => {
  const response = await api.get("/api/users/profile");
  return response.data?.data;
};

export const updateProfile = async (payload) => {
  const response = await api.put("/api/users/profile/update", payload);
  return response.data?.data;
};

export const changePassword = async (payload) => {
  const response = await api.patch("/api/users/password", payload);
  return response.data;
};

export const uploadProfileImage = async () => {
  throw new Error("Profile image upload is unavailable. Backend endpoint is not implemented.");
};

export const getUsers = async () => {
  const response = await api.get("/api/users");
  return response.data?.data || [];
};

export const getUserById = async (userId) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data?.data;
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await api.patch(`/api/users/${userId}/status`, { isActive });
  return response.data?.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/api/users/${userId}/role`, { role });
  return response.data?.data;
};
