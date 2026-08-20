const { ask } = require("../utils/prompt");
const { printBlogList, printBlogDetails } = require("../utils/display");
const blogService = require("../services/blogService");

async function userMenu(user) {
  let loggedIn = true;

  while (loggedIn) {
    console.log(`\n=== User Menu (${user.firstname} ${user.lastname}) ===`);
    console.log("1. View Your Blogs");
    console.log("2. Search Blog by ID/Title");
    console.log("3. Create Blog");
    console.log("4. Update Blog");
    console.log("5. Delete Blog");
    console.log("0. Logout");

    const choice = await ask("Select an option: ");

    switch (choice) {
      case "1":
        await viewMyBlogs(user);
        break;
      case "2":
        await searchBlog();
        break;
      case "3":
        await createBlog(user);
        break;
      case "4":
        await updateBlog(user);
        break;
      case "5":
        await deleteBlog(user);
        break;
      case "0":
        console.log("Logging out...");
        loggedIn = false;
        break;
      default:
        console.log("Invalid option. Please try again.");
    }
  }
}

async function viewMyBlogs(user) {
  const blogs = await blogService.getMyBlogs(user.id);
  if (blogs.length === 0) {
    console.log("No blogs are found");
    return;
  }
  console.log(`\nYour Blogs:`);
  printBlogList(blogs);
}

async function searchBlog() {
  const term = await ask("Enter blog ID or title: ");
  const results = await blogService.searchBlog(term);
  if (results.length === 0) {
    console.log("No matching blog found.");
    return;
  }
  results.forEach(printBlogDetails);
}

async function createBlog(user) {
  const blogTitle = await ask("Enter blog title: ");
  const blog = await ask("Enter blog content: ");
  const category = await ask("Enter category (optional): ");

  try {
    await blogService.createBlog(user.id, { blogTitle, blog, category: category || null });
    console.log("Blog created successfully.");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function updateBlog(user) {
  const blogId = await ask("Enter blog ID to update: ");
  const blogTitle = await ask("Enter new blog title (leave blank to keep current): ");
  const blog = await ask("Enter new blog content (leave blank to keep current): ");
  const category = await ask("Enter new category (leave blank to keep current): ");

  try {
    await blogService.updateBlog(Number(blogId), user.id, {
      blogTitle: blogTitle || null,
      blog: blog || null,
      category: category || null,
    });
    console.log("Blog updated successfully.");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function deleteBlog(user) {
  const blogId = await ask("Enter blog ID to delete: ");
  try {
    await blogService.deleteBlog(Number(blogId), user.id);
    console.log("Blog deleted successfully.");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

module.exports = userMenu;
