# 📖 Blog Application REST API — Complete API Documentation

Comprehensive API documentation for the **Blog Application REST API** built with **Express.js**, **Sequelize ORM**, and **MySQL**.

---

## 📌 Overview & Base URL

- **Base URL:** `http://localhost:5000/api`
- **Content-Type:** `application/json`
- **Authentication Scheme:** `Bearer <JWT_TOKEN>` in the `Authorization` request header.

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📑 Table of Contents

1. [Authentication (`/api/auth`)](#1-authentication-apiauth)
   - [Register User](#11-register-user)
   - [Login User](#12-login-user)
2. [User Management (`/api/users`)](#2-user-management-apiusers)
   - [Get All Users (Admin)](#21-get-all-users-admin)
   - [Get User By ID (Admin)](#22-get-user-by-id-admin)
   - [Update User Status (Admin)](#23-update-user-status-admin)
   - [Get Own Profile](#24-get-own-profile)
   - [Update Own Profile](#25-update-own-profile)
   - [Update Own Password](#26-update-own-password)
3. [Blog Management (`/api/blogs`)](#3-blog-management-apiblogs)
   - [Create Blog](#31-create-blog)
   - [Get All / Filter Blogs](#32-get-all--filter-blogs)
   - [Get Blog By ID](#33-get-blog-by-id)
   - [Update Blog](#34-update-blog)
   - [Delete Blog](#35-delete-blog)
4. [Role-Based Access Control (RBAC) Matrix](#4-role-based-access-control-rbac-matrix)
5. [Standard HTTP Status Codes](#5-standard-http-status-codes)
6. [Postman & Newman Automated Testing](#6-postman--newman-automated-testing)

---

## 1. Authentication (`/api/auth`)

### 1.1. Register User

Creates a new user account. Passwords are encrypted using `bcrypt` (10 salt rounds). Defaults `role: "user"` and `isActive: true`.

- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Access Level:** Public

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `firstname` | String | Yes | User's first name |
| `lastname` | String | Yes | User's last name |
| `email` | String | Yes | Valid unique email address |
| `password` | String | Yes | Minimum 6 characters |

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

#### Responses

**`201 Created`**
```json
{
  "message": "user registered successfully",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "isActive": true,
    "role": "user",
    "createAt": "2026-08-30T17:00:00.000Z",
    "updateAt": "2026-08-30T17:00:00.000Z"
  }
}
```

**`400 Bad Request`**
```json
{
  "message": "firstname, lastname, email and password are required"
}
```

**`409 Conflict`**
```json
{
  "message": "email already registered"
}
```

---

### 1.2. Login User

Authenticates credentials and returns a signed JSON Web Token (JWT) valid for 24 hours.

- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Access Level:** Public

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | String | Yes | Registered account email |
| `password` | String | Yes | Account password |

```json
{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

#### Responses

**`200 OK`**
```json
{
  "message": "login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

**`401 Unauthorized`**
```json
{
  "message": "invalid email or password"
}
```

**`403 Forbidden`**
```json
{
  "message": "your account has been deactivated"
}
```

---

## 2. User Management (`/api/users`)

### 2.1. Get All Users (Admin)

Retrieves a list of all registered users excluding passwords.

- **Method:** `GET`
- **Endpoint:** `/api/users`
- **Access Level:** Admin only (`role: admin`)
- **Headers:** `Authorization: Bearer <admin_token>`

#### Responses

**`200 OK`**
```json
{
  "message": "users found",
  "data": [
    {
      "id": 1,
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "isActive": true,
      "role": "user",
      "createAt": "2026-08-30T17:00:00.000Z",
      "updateAt": "2026-08-30T17:00:00.000Z"
    }
  ]
}
```

---

### 2.2. Get User By ID (Admin)

Retrieves full details of a specific user by ID.

- **Method:** `GET`
- **Endpoint:** `/api/users/:id`
- **Access Level:** Admin only
- **Headers:** `Authorization: Bearer <admin_token>`

#### Responses

**`200 OK`**
```json
{
  "message": "user found",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "isActive": true,
    "role": "user",
    "createAt": "2026-08-30T17:00:00.000Z",
    "updateAt": "2026-08-30T17:00:00.000Z"
  }
}
```

**`404 Not Found`**
```json
{
  "message": "user not found"
}
```

---

### 2.3. Update User Status (Admin)

Enables or disables an account. Deactivated accounts (`isActive: false`) are rejected at login with HTTP 403.

- **Method:** `PATCH`
- **Endpoint:** `/api/users/:id/status`
- **Access Level:** Admin only
- **Headers:** `Authorization: Bearer <admin_token>`

#### Request Body
```json
{
  "isActive": false
}
```

#### Responses

**`200 OK`**
```json
{
  "message": "user status updated",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "isActive": false,
    "role": "user",
    "createAt": "2026-08-30T17:00:00.000Z",
    "updateAt": "2026-08-30T17:15:00.000Z"
  }
}
```

---

### 2.4. Get Own Profile

Retrieves the authenticated user's profile details.

- **Method:** `GET`
- **Endpoint:** `/api/users/profile`
- **Access Level:** Authenticated (`user` or `admin`)
- **Headers:** `Authorization: Bearer <token>`

#### Responses

**`200 OK`**
```json
{
  "message": "profile found",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "isActive": true,
    "role": "user",
    "createAt": "2026-08-30T17:00:00.000Z",
    "updateAt": "2026-08-30T17:00:00.000Z"
  }
}
```

---

### 2.5. Update Own Profile

Updates `firstname` and/or `lastname` of the logged-in user.

- **Method:** `PUT`
- **Endpoint:** `/api/users/profile/update`
- **Access Level:** Authenticated (`user` or `admin`)
- **Headers:** `Authorization: Bearer <token>`

#### Request Body
```json
{
  "firstname": "Johnny",
  "lastname": "Doe"
}
```

#### Responses

**`200 OK`**
```json
{
  "message": "profile updated",
  "data": {
    "id": 1,
    "firstname": "Johnny",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "isActive": true,
    "role": "user",
    "createAt": "2026-08-30T17:00:00.000Z",
    "updateAt": "2026-08-30T17:20:00.000Z"
  }
}
```

---

### 2.6. Update Own Password

Changes the authenticated user's password. Requires minimum 6 characters.

- **Method:** `PATCH`
- **Endpoint:** `/api/users/password`
- **Access Level:** Authenticated (`user` or `admin`)
- **Headers:** `Authorization: Bearer <token>`

#### Request Body
```json
{
  "password": "NewSecretPassword123"
}
```

#### Responses

**`200 OK`**
```json
{
  "message": "password updated successfully"
}
```

---

## 3. Blog Management (`/api/blogs`)

### 3.1. Create Blog

Creates a new blog post. `userId` is automatically populated from the verified JWT token.

- **Method:** `POST`
- **Endpoint:** `/api/blogs/create`
- **Access Level:** Authenticated (`user` or `admin`)
- **Headers:** `Authorization: Bearer <token>`

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `blogTitle` | String | Yes | Title of the blog post |
| `blog` | String (Text) | Yes | Content/body of the post |
| `category` | String | Yes | Topic or category |

```json
{
  "blogTitle": "Introduction to API Automation",
  "blog": "This guide covers test automation with Postman and Newman...",
  "category": "Testing"
}
```

#### Responses

**`201 Created`**
```json
{
  "message": "blog created",
  "data": {
    "id": 1,
    "userId": 1,
    "blogTitle": "Introduction to API Automation",
    "blog": "This guide covers test automation with Postman and Newman...",
    "category": "Testing",
    "createAt": "2026-08-30T17:30:00.000Z",
    "updateAt": "2026-08-30T17:30:00.000Z"
  }
}
```

---

### 3.2. Get All / Filter Blogs

Returns all blog posts including author details (`id`, `firstname`, `lastname`). Supports optional filtering by title and category.

- **Method:** `GET`
- **Endpoint:** `/api/blogs`
- **Access Level:** Public
- **Query Parameters:**
  - `title` *(optional)*: Case-insensitive partial string match
  - `category` *(optional)*: Exact category match

#### Query Examples
```http
GET /api/blogs
GET /api/blogs?title=automation
GET /api/blogs?category=Testing
GET /api/blogs?title=automation&category=Testing
```

#### Responses

**`200 OK`**
```json
{
  "message": "blogs found",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "blogTitle": "Introduction to API Automation",
      "blog": "This guide covers test automation with Postman and Newman...",
      "category": "Testing",
      "createAt": "2026-08-30T17:30:00.000Z",
      "updateAt": "2026-08-30T17:30:00.000Z",
      "author": {
        "id": 1,
        "firstname": "Johnny",
        "lastname": "Doe"
      }
    }
  ]
}
```

---

### 3.3. Get Blog By ID

Retrieves a single blog post by its ID with author information.

- **Method:** `GET`
- **Endpoint:** `/api/blogs/:id`
- **Access Level:** Public

#### Responses

**`200 OK`**
```json
{
  "message": "blog found",
  "data": {
    "id": 1,
    "userId": 1,
    "blogTitle": "Introduction to API Automation",
    "blog": "This guide covers test automation with Postman and Newman...",
    "category": "Testing",
    "createAt": "2026-08-30T17:30:00.000Z",
    "updateAt": "2026-08-30T17:30:00.000Z",
    "author": {
      "id": 1,
      "firstname": "Johnny",
      "lastname": "Doe"
    }
  }
}
```

**`404 Not Found`**
```json
{
  "message": "blog not found"
}
```

---

### 3.4. Update Blog

Updates a blog's title, content, or category. Users can only update their own blogs; Admins can update any blog.

- **Method:** `PUT`
- **Endpoint:** `/api/blogs/update/:id`
- **Access Level:** Authenticated (Owner or Admin)
- **Headers:** `Authorization: Bearer <token>`

#### Request Body
```json
{
  "blogTitle": "Introduction to API Automation (Updated)",
  "blog": "Updated detailed content...",
  "category": "Testing"
}
```

#### Responses

**`200 OK`**
```json
{
  "message": "blog updated",
  "data": {
    "id": 1,
    "userId": 1,
    "blogTitle": "Introduction to API Automation (Updated)",
    "blog": "Updated detailed content...",
    "category": "Testing",
    "createAt": "2026-08-30T17:30:00.000Z",
    "updateAt": "2026-08-30T17:40:00.000Z"
  }
}
```

**`403 Forbidden`**
```json
{
  "message": "you are not authorized to update this blog"
}
```

---

### 3.5. Delete Blog

Deletes a blog post permanently. Users can only delete their own blogs; Admins can delete any blog.

- **Method:** `DELETE`
- **Endpoint:** `/api/blogs/delete/:id`
- **Access Level:** Authenticated (Owner or Admin)
- **Headers:** `Authorization: Bearer <token>`

#### Responses

**`200 OK`**
```json
{
  "message": "blog deleted successfully"
}
```

**`403 Forbidden`**
```json
{
  "message": "you are not authorized to delete this blog"
}
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Guest / Public | User (Owner) | User (Non-Owner) | Admin |
|---|---|:---:|:---:|:---:|:---:|
| `/api/auth/register` | POST | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/login` | POST | ✅ | ✅ | ✅ | ✅ |
| `/api/blogs` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/blogs/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/blogs/create` | POST | ❌ | ✅ | ✅ | ✅ |
| `/api/blogs/update/:id` | PUT | ❌ | ✅ | ❌ | ✅ |
| `/api/blogs/delete/:id` | DELETE | ❌ | ✅ | ❌ | ✅ |
| `/api/users/profile` | GET | ❌ | ✅ | ✅ | ✅ |
| `/api/users/profile/update` | PUT | ❌ | ✅ | ✅ | ✅ |
| `/api/users/password` | PATCH | ❌ | ✅ | ✅ | ✅ |
| `/api/users` | GET | ❌ | ❌ | ❌ | ✅ |
| `/api/users/:id` | GET | ❌ | ❌ | ❌ | ✅ |
| `/api/users/:id/status` | PATCH | ❌ | ❌ | ❌ | ✅ |

---

## 5. Standard HTTP Status Codes

| Code | Status | Description |
|---|---|---|
| `200` | OK | Request succeeded (GET, PUT, PATCH, DELETE) |
| `201` | Created | Resource created successfully (POST) |
| `400` | Bad Request | Missing required fields or invalid data types |
| `401` | Unauthorized | Missing, expired, or invalid JWT token |
| `403` | Forbidden | Insufficient permissions or accessing another user's blog |
| `404` | Not Found | Requested user or blog resource does not exist |
| `409` | Conflict | Duplicate entry (e.g., email already registered) |
| `500` | Internal Server Error | Unexpected server or database exception |

---

## 6. Postman & Newman Automated Testing

### 🚀 Quick CLI Execution with Newman

```bash
# From the project root
npm install -g newman
cd Postman
newman run BlogAPI.postman_collection.json -e BlogAPI.postman_environment.json
```

### 📦 Importing into Postman
1. Open Postman → Click **Import**.
2. Select [`BlogAPI.postman_collection.json`](./BlogAPI.postman_collection.json) and [`BlogAPI.postman_environment.json`](./BlogAPI.postman_environment.json).
3. Select **Blog API - Local** environment from the top-right environment picker.
4. Click **Run Collection** to execute all automated test assertions with dynamic data chaining.
