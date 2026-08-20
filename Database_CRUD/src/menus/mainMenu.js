const { ask } = require("../utils/prompt");
const { printBlogList } = require("../utils/display");
const authService = require("../services/authService");
const blogService = require("../services/blogService");
const userMenu = require("./userMenu");
const adminMenu = require("./adminMenu");

async function mainMenu() {
  let running = true;

  while (running) {
    console.log("\n=== Welcome to BlogDB ===");
    console.log("1. View All Blogs");
    console.log("2. Login");
    console.log("3. Register");
    console.log("0. Exit");

    const choice = await ask("Select an option: ");

    switch (choice) {
      case "1":
        await viewAllBlogs();
        break;
      case "2":
        await login();
        break;
      case "3":
        await register();
        break;
      case "0":
        console.log("Goodbye!");
        running = false;
        break;
      default:
        console.log("Invalid option. Please try again.");
    }
  }
}

async function viewAllBlogs() {
  const blogs = await blogService.allBlog();
  console.log("\nAll Blogs:");
  printBlogList(blogs);
}

async function register() {
  const firstname = await ask("First name: ");
  const lastname = await ask("Last name: ");
  const email = await ask("Email: ");
  const password = await ask("Password: ");

  try {
    await authService.register({ firstname, lastname, email, password });
    console.log("Registration successful. You can now log in.");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function login() {
  const email = await ask("Email: ");
  const password = await ask("Password: ");

  try {
    const user = await authService.login({ email, password });
    console.log(`Welcome, ${user.firstname}!`);

    if (user.role === "admin") {
      await adminMenu(user);
    } else {
      await userMenu(user);
    }
  } catch (err) {
    if (err.message === "DEACTIVATED") {
      console.log("User is deactivated");
    } else {
      console.log(`Error: ${err.message}`);
    }
  }
}

module.exports = mainMenu;
