const blogModel = require("../models/blogModel");

async function allBlog() {
  return blogModel.getAllBlogs();
}

async function allUsersBlog() {
  return blogModel.getAllBlogs();
}

async function getMyBlogs(userId) {
  return blogModel.getBlogsByUserId(userId);
}

async function searchBlog(searchTerm) {
  return blogModel.searchBlogsByIdOrTitle(searchTerm);
}

async function createBlog(userId, { blogTitle, blog, category }) {
  if (!blogTitle || !blog) {
    throw new Error("Blog title and content are required.");
  }
  return blogModel.createBlog({ userId, blogTitle, blog, category });
}

async function updateBlog(blogId, userId, { blogTitle, blog, category }, isAdmin = false) {
  const existing = await blogModel.findBlogById(blogId);
  if (!existing) {
    throw new Error("Blog not found.");
  }
  if (!isAdmin && existing.userId !== userId) {
    throw new Error("You can only update your own blogs.");
  }
  await blogModel.updateBlog(blogId, {
    blogTitle: blogTitle || existing.blogTitle,
    blog: blog || existing.blog,
    category: category || existing.category,
  });
}

async function deleteBlog(blogId, userId, isAdmin = false) {
  const existing = await blogModel.findBlogById(blogId);
  if (!existing) {
    throw new Error("Blog not found.");
  }
  if (!isAdmin && existing.userId !== userId) {
    throw new Error("You can only delete your own blogs.");
  }
  await blogModel.deleteBlog(blogId);
}

module.exports = {
  allBlog,
  allUsersBlog,
  getMyBlogs,
  searchBlog,
  createBlog,
  updateBlog,
  deleteBlog,
};
