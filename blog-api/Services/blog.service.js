import { Op } from "sequelize";
import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import { ServiceError } from "./auth.service.js";

// Author fields included in every public blog response
const authorAttributes = ["id", "firstname", "lastname"];

export const create_blog = async (userId, { blogTitle, blog, category }) => {
  if (!blogTitle || !blog || !category) {
    throw new ServiceError(400, "blogTitle, blog and category are required");
  }

  const newBlog = await Blog.create({ userId, blogTitle, blog, category });
  return newBlog;
};

export const get_all_blogs = async ({ title, category }) => {
  const where = {};
  if (title)    where.blogTitle = { [Op.like]: `%${title}%` };
  if (category) where.category  = category;

  const blogs = await Blog.findAll({
    where,
    include: [{ model: User, as: "author", attributes: authorAttributes }],
  });
  return blogs;
};

export const get_blog_by_id = async (id) => {
  const blog = await Blog.findByPk(id, {
    include: [{ model: User, as: "author", attributes: authorAttributes }],
  });
  if (!blog) throw new ServiceError(404, "blog not found");
  return blog;
};

export const update_blog = async (blogId, userId, role, { blogTitle, blog, category }) => {
  const existing = await Blog.findByPk(blogId);
  if (!existing) throw new ServiceError(404, "blog not found");

  // Normal users can only update their own blog
  if (role !== "admin" && existing.userId !== userId) {
    throw new ServiceError(403, "you are not authorized to update this blog");
  }

  if (blogTitle) existing.blogTitle = blogTitle;
  if (blog)      existing.blog      = blog;
  if (category)  existing.category  = category;

  await existing.save();
  return existing;
};

export const delete_blog = async (blogId, userId, role) => {
  const existing = await Blog.findByPk(blogId);
  if (!existing) throw new ServiceError(404, "blog not found");

  // Normal users can only delete their own blog
  if (role !== "admin" && existing.userId !== userId) {
    throw new ServiceError(403, "you are not authorized to delete this blog");
  }

  await existing.destroy();
  return { message: "blog deleted successfully" };
};
