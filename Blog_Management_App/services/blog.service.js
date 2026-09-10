import api from "@/utils/api";

export const getBlogs = async (filters = {}) => {
  const params = {};

  if (filters.title) {
    params.title = filters.title;
  }

  if (filters.category) {
    params.category = filters.category;
  }

  const response = await api.get("/api/blogs", { params });
  return response.data?.data || [];
};

export const getBlogById = async (blogId) => {
  const response = await api.get(`/api/blogs/${blogId}`);
  return response.data?.data;
};

export const createBlog = async (payload) => {
  const response = await api.post("/api/blogs/create", payload);
  return response.data?.data;
};

export const updateBlog = async (blogId, payload) => {
  const response = await api.put(`/api/blogs/update/${blogId}`, payload);
  return response.data?.data;
};

export const deleteBlog = async (blogId) => {
  const response = await api.delete(`/api/blogs/delete/${blogId}`);
  return response.data;
};
