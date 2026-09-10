import api from "@/utils/api";

export const registerUser = async (payload) => {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
};

export const forgotPassword = async () => {
  throw new Error("Forgot password is currently unavailable. Backend endpoint is not implemented.");
};

export const resetPassword = async () => {
  throw new Error("Reset password is currently unavailable. Backend endpoint is not implemented.");
};
