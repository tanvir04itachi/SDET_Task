# Testing Workflow

Manual test script for verifying the BlogDB console app end-to-end. Run `npm start` and follow the steps below.

## 1. Setup

1. Ensure MySQL is running and `.env` has correct credentials.
2. Run `npm install` (first time only).
3. Run `npm start`. Confirm the console prints `Connected to database and ready.` and shows the main menu:
   ```
   1. View All Blogs
   2. Login
   3. Register
   0. Exit
   ```

## 2. Reader Journey (no login)

1. Select **1. View All Blogs**.
2. Expect either `No blogs are found` (empty DB) or a list of `[id] title (category)`.

## 3. Register + User Journey

1. Select **3. Register** → enter first name, last name, email, password.
2. Expect `Registration successful. You can now log in.`
3. Select **2. Login** with the same email/password.
4. Expect `Welcome, <firstname>!` and the **User Menu**:
   ```
   1. View Your Blogs
   2. Search Blog by ID/Title
   3. Create Blog
   4. Update Blog
   5. Delete Blog
   0. Logout
   ```
5. **1. View Your Blogs** → expect `No blogs are found` (new user has none).
6. **3. Create Blog** → enter title, content, category. Expect `Blog created successfully.`
7. **1. View Your Blogs** → the new blog should now be listed.
8. **2. Search Blog by ID/Title** → search by the numeric ID, then again by (partial) title. Both should return the full blog details.
9. **4. Update Blog** → enter the blog ID, provide a new title/content/category (or blank to keep current). Expect `Blog updated successfully.` Verify via search.
10. **5. Delete Blog** → enter the blog ID. Expect `Blog deleted successfully.` Verify it no longer appears in **1. View Your Blogs**.
11. **0. Logout** → returns to the main menu.

## 4. Negative Cases

- Login with a wrong password → `Error: Invalid email or password.`
- Register with an email that already exists → `Error: A user with this email already exists.`
- Update/Delete a blog ID that belongs to another user → `Error: You can only update/delete your own blogs.`
- Update/Delete a blog ID that doesn't exist → `Error: Blog not found.`

## 5. Promote a User to Admin (Prerequisite)

Since there is no seeded admin, promote an existing registered user manually:

```bash
node scripts/promoteAdmin.js <email>
```

## 6. Admin Journey

1. Login with the promoted admin account. Expect the **Admin Menu**:
   ```
   1. View All Users
   2. View All Blogs
   3. Search Blog by ID/Title
   4. Update User
   5. Delete User
   6. Delete Blog
   0. Logout
   ```
2. **1. View All Users** → lists all users with id, name, email, role, and active status.
3. **2. View All Blogs** → lists blogs from every user.
4. **3. Search Blog by ID/Title** → same behavior as the user journey search, works across all users' blogs.
5. **4. Update User** → enter a user ID and set `isActive` to `false`. Expect `User updated successfully.`
6. Logout, then try to log in as that deactivated user → expect `User is deactivated` and the login is blocked.
7. Log back in as admin, **4. Update User** → set `isActive` back to `true` to confirm re-activation works.
8. **6. Delete Blog** → enter any blog ID (even one owned by another user). Expect `Blog deleted successfully.`
9. **5. Delete User** → enter a non-admin user ID. Expect `User deleted successfully.` Verify with **1. View All Users** that the user (and their blogs, via cascade) are gone.
10. Attempt to delete your own logged-in admin ID → expect it to be blocked with `You cannot delete your own admin account while logged in.`

## 7. Exit

- From the main menu, select **0. Exit** → expect `Goodbye!` and the process terminates cleanly.
