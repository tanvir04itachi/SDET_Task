const { ask } = require("../utils/prompt");
const { printBlogList, printBlogDetails, printUserList } = require("../utils/display");
const blogService = require("../services/blogService");
const userService = require("../services/userService");

async function adminMenu(admin) {
  let loggedIn = true;

  while (loggedIn) {
    console.log(`\n=== Admin Menu (${admin.firstname} ${admin.lastname}) ===`);
    console.log("1. View All Users");
    console.log("2. View All Blogs");
    console.log("3. Search Blog by ID/Title");
    console.log("4. Update User");
    console.log("5. Delete User");
    console.log("6. Delete Blog");
    console.log("0. Logout");

    const choice = await ask("Select an option: ");

    switch (choice) {
      case "1":
        await viewAllUsers();
        break;
      case "2":
        await viewAllBlogs();
        break;
      case "3":
        await searchBlog();
        break;
      case "4":
        await updateUser();
        break;
      case "5":
        await deleteUser(admin);
        break;
      case "6":
        await deleteBlog();
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

async function viewAllUsers() {
  const users = await userService.allUsers();
  console.log("\nAll Users:");
  printUserList(users);
}

async function viewAllBlogs() {
  const blogs = await blogService.allUsersBlog();
  console.log("\nAll Blogs:");
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

async function updateUser() {
  const userId = await ask("Enter user ID to update: ");
  const activeInput = await ask("Set isActive status (true/false): ");
  const isActive = activeInput.toLowerCase() === "true";

  try {
    await userService.updateUserActiveStatus(Number(userId), isActive);
    console.log("User updated successfully.");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function deleteUser(admin) {
  const userId = await ask("Enter user ID to delete: ");
  if (Number(userId) === admin.id) {
    console.log("You cannot delete your own admin account while logged in.");
    return;
  }
  try {
    await userService.deleteUser(Number(userId));
    console.log("User deleted successfully.");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function deleteBlog() {
  const blogId = await ask("Enter blog ID to delete: ");
  try {
    await blogService.deleteBlog(Number(blogId), null, true);
    console.log("Blog deleted successfully.");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

module.exports = adminMenu;
