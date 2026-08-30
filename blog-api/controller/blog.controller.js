import { ServiceError } from "../Services/auth.service.js";
import {
  create_blog,
  get_all_blogs,
  get_blog_by_id,
  update_blog,
  delete_blog,
} from "../Services/blog.service.js";

const send_error = (res, error) => {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  res.status(500).json({ message: "something went wrong" });
};

export const create_blog_post = async (req, res) => {
  try {
    // userId always comes from the token — never from req.body
    const blog = await create_blog(req.user.id, req.body);
    res.status(201).json({ message: "blog created", data: blog });
  } catch (error) {
    send_error(res, error);
  }
};

export const get_blogs = async (req, res) => {
  try {
    const { title, category } = req.query;
    const blogs = await get_all_blogs({ title, category });
    res.status(200).json({ message: "blogs found", data: blogs });
  } catch (error) {
    send_error(res, error);
  }
};

export const get_blog = async (req, res) => {
  try {
    const blog = await get_blog_by_id(Number(req.params.id));
    res.status(200).json({ message: "blog found", data: blog });
  } catch (error) {
    send_error(res, error);
  }
};

export const update_blog_post = async (req, res) => {
  try {
    const blog = await update_blog(
      Number(req.params.id),
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json({ message: "blog updated", data: blog });
  } catch (error) {
    send_error(res, error);
  }
};

export const delete_blog_post = async (req, res) => {
  try {
    const result = await delete_blog(
      Number(req.params.id),
      req.user.id,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    send_error(res, error);
  }
};
