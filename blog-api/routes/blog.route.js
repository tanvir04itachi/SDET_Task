import express from "express";
import { verify_token } from "../middlewares/auth.middleware.js";
import {
  create_blog_post,
  get_blogs,
  get_blog,
  update_blog_post,
  delete_blog_post,
} from "../controller/blog.controller.js";

const router = express.Router();

router.get("/",           get_blogs);                           // public
router.get("/:id",        get_blog);                            // public
router.post("/create",    verify_token, create_blog_post);      // user/admin
router.put("/update/:id", verify_token, update_blog_post);      // user/admin
router.delete("/delete/:id", verify_token, delete_blog_post);   // user/admin

export default router;
