function printBlogList(blogs) {
  if (!blogs || blogs.length === 0) {
    console.log("No blogs are found");
    return;
  }
  blogs.forEach((b) => {
    console.log(`  [${b.id}] ${b.blogTitle}${b.category ? ` (${b.category})` : ""}`);
  });
}

function printBlogDetails(blog) {
  console.log("----------------------------------------");
  console.log(`ID       : ${blog.id}`);
  console.log(`Title    : ${blog.blogTitle}`);
  console.log(`Content  : ${blog.blog}`);
  console.log(`Category : ${blog.category || "-"}`);
  if (blog.firstname) {
    console.log(`Author   : ${blog.firstname} ${blog.lastname} (${blog.email})`);
  }
  console.log(`Created  : ${blog.createAt}`);
  console.log(`Updated  : ${blog.updateAt}`);
  console.log("----------------------------------------");
}

function printUserList(users) {
  if (!users || users.length === 0) {
    console.log("No users are found");
    return;
  }
  users.forEach((u) => {
    console.log(
      `  [${u.id}] ${u.firstname} ${u.lastname} | ${u.email} | role: ${u.role} | active: ${
        u.isActive ? "yes" : "no"
      }`
    );
  });
}

module.exports = { printBlogList, printBlogDetails, printUserList };
