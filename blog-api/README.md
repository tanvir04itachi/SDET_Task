# 📝 Blog Application REST API

A scalable, secure RESTful API for a Blog Management Application built with **Node.js**, **Express.js**, **Sequelize ORM**, and **MySQL**.

Includes complete JWT authentication, role-based access control (Admin/User), input validation, dynamic Postman automation collections, and end-to-end API test suites with **Newman**.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Configuration](#database-configuration)
  - [Starting the Application](#starting-the-application)
- [API Reference & Documentation](#-api-reference--documentation)
- [Postman & Automated Testing](#-postman--automated-testing)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [HTTP Status Codes](#-http-status-codes)
- [Security Features](#-security-features)
- [License & Author](#-license--author)

---

## 🚀 Features

- **Authentication & Authorization**: Secure signup, login, password hashing with `bcrypt`, and JWT token verification with 24-hour expiration.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `user` and `admin` roles.
- **Blog Management**: Full CRUD operations for blog posts with category filtering and search capabilities.
- **User Management**: Profile retrieval and updates, secure password changes, and admin-only account status control (activation/deactivation).
- **Relational Data Modeling**: Sequelize ORM associations between `User` and `Blog` entities with automatic foreign key constraints.
- **Automated API Testing**: Fully automated Postman collection with dynamic variable chaining and Newman CLI test execution.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** (v18+) | JavaScript runtime environment |
| **Express.js** (v5) | Web framework for routing and middleware |
| **Sequelize** (v6) | Promise-based Node.js ORM for MySQL |
| **MySQL** (v8) | Relational database management system |
| **bcrypt** | Password encryption and hashing (10 salt rounds) |
| **jsonwebtoken** | Token-based authentication and claim validation |
| **dotenv** | Environment variable management |
| **Newman** | Command-line collection runner for automated Postman testing |

---

## 📁 Project Architecture

```
blog-api/
├── config/
│   └── db.js                    # Sequelize connection & initialization
├── models/
│   ├── user.model.js            # User entity schema & timestamps
│   └── blog.model.js            # Blog entity schema & User associations
├── middlewares/
│   └── auth.middleware.js       # verify_token & is_admin RBAC middleware
├── Services/
│   ├── auth.service.js          # Authentication business logic & ServiceError
│   ├── user.service.js          # User profile & status management logic
│   └── blog.service.js          # Blog CRUD & ownership validation logic
├── controller/
│   ├── auth.controller.js       # Signup & Login route handlers
│   ├── users.controller.js      # User management route handlers
│   └── blog.controller.js       # Blog operations route handlers
├── routes/
│   ├── auth.route.js            # /api/auth routes
│   ├── users.route.js           # /api/users routes
│   └── blog.route.js            # /api/blogs routes
├── Postman/
│   ├── BlogAPI.postman_collection.json   # Automated Postman test suite
│   ├── BlogAPI.postman_environment.json  # Environment variables for Postman
│   ├── API_Documentation.md             # Complete API documentation
│   └── README.md                         # Postman execution guide
├── app.js                       # Express app configuration & middleware
├── server.js                    # Server startup & DB synchronization entrypoint
├── .env.example                 # Template for environment variables
├── .gitignore                   # Ignored files and directories
└── package.json                 # Project configuration & scripts
```

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MySQL Server** (v8.0 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tanvir04itachi/SDET_Task.git
   cd "SDET_Task/blog-api"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```

Configure the environment variables in `.env`:
```env
PORT=5000
DB_NAME=blogdb
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=your_jwt_secret_key
DB_SYNC=true
```

> **Note:** Set `DB_SYNC=false` once your schema is stable to skip `sequelize.sync({ alter: true })` on subsequent startups.

### Database Configuration

1. Log in to your MySQL terminal:
   ```sql
   CREATE DATABASE blogdb;
   ```
2. Sequelize will automatically create and synchronize the `users` and `blogs` tables on the first server launch.

### Starting the Application

- **Production Mode:**
  ```bash
  npm start
  ```
- **Development Mode (Hot Reload with Node watch):**
  ```bash
  npm run dev
  ```

The server will start at: `http://localhost:5000`

---

## 📖 API Reference & Documentation

Detailed request schemas, parameters, sample bodies, and responses are documented in:
👉 **[Complete API Documentation (Postman/API_Documentation.md)](./Postman/API_Documentation.md)**

### Summary of Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |

#### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | Get list of all registered users |
| `GET` | `/api/users/:id` | Admin | Get specific user by ID |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or deactivate user account |
| `GET` | `/api/users/profile` | User / Admin | Retrieve current logged-in user's profile |
| `PUT` | `/api/users/profile/update` | User / Admin | Update first name and last name |
| `PATCH` | `/api/users/password` | User / Admin | Update account password |

#### Blogs (`/api/blogs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/blogs/create` | User / Admin | Create a new blog post |
| `GET` | `/api/blogs` | Public | Get all blogs (supports `?title=` and `?category=`) |
| `GET` | `/api/blogs/:id` | Public | Get single blog post by ID with author info |
| `PUT` | `/api/blogs/update/:id` | Owner / Admin | Update existing blog post |
| `DELETE` | `/api/blogs/delete/:id` | Owner / Admin | Delete blog post permanently |

---

## 🧪 Postman & Automated Testing

This repository includes a dynamic Postman test collection with automated test assertions and pre-request scripts that generate unique mock data on each run.

### Running with Newman CLI

Run the entire automated test suite directly from your terminal:
```bash
npm install -g newman
cd Postman
newman run BlogAPI.postman_collection.json -e BlogAPI.postman_environment.json
```

### Running inside Postman UI

1. Open Postman and click **Import**.
2. Select [`Postman/BlogAPI.postman_collection.json`](./Postman/BlogAPI.postman_collection.json) and [`Postman/BlogAPI.postman_environment.json`](./Postman/BlogAPI.postman_environment.json).
3. Select the **Blog API - Local** environment.
4. Click **Run Collection** to execute all 14 requests and 43+ automated assertions.

---

## 🔒 Role-Based Access Control (RBAC)

| Action | Guest / Public | User (Owner) | User (Non-Owner) | Admin |
|---|:---:|:---:|:---:|:---:|
| Register & Login | ✅ | ✅ | ✅ | ✅ |
| View / Search Blogs | ✅ | ✅ | ✅ | ✅ |
| View Single Blog | ✅ | ✅ | ✅ | ✅ |
| Create Blog | ❌ | ✅ | ✅ | ✅ |
| Update Own Blog | ❌ | ✅ | ❌ | ✅ |
| Delete Own Blog | ❌ | ✅ | ❌ | ✅ |
| Update / Delete Any Blog | ❌ | ❌ | ❌ | ✅ |
| View & Update Own Profile | ❌ | ✅ | ✅ | ✅ |
| Change Own Password | ❌ | ✅ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ❌ | ✅ |
| Activate / Deactivate User | ❌ | ❌ | ❌ | ✅ |

---

## 📡 HTTP Status Codes

| Code | Status | Usage |
|---|---|---|
| `200` | OK | Successful GET, PUT, PATCH, DELETE operations |
| `201` | Created | Resource successfully created (User registration, Blog creation) |
| `400` | Bad Request | Missing or invalid payload / validation failure |
| `401` | Unauthorized | Missing, invalid, or expired JWT token |
| `403` | Forbidden | Insufficient permissions or accessing another user's resource |
| `404` | Not Found | Requested user or blog entity does not exist |
| `409` | Conflict | Duplicate entry (e.g., email already registered) |
| `500` | Internal Server Error | Unhandled server or database error |

---

## 🛡 Security Features

- [x] **Password Hashing**: Passwords are encrypted with `bcrypt` before database storage.
- [x] **Data Sanitation**: Passwords are excluded from all API responses.
- [x] **JWT Token Verification**: Stateless Bearer token authentication with configurable secret key.
- [x] **Account Deactivation Guard**: Inactive accounts are blocked at authentication.
- [x] **Protected Role Escalation**: User `role` is enforced via model defaults and cannot be injected via request bodies.
- [x] **Ownership Authorization**: Strict checking prevents non-admin users from modifying or deleting blogs created by other users.
- [x] **Secret Exclusion**: `.env` and `node_modules` are safely excluded via `.gitignore`.

---

## 👤 Author

**Tanvir**  
GitHub: [@tanvir04itachi](https://github.com/tanvir04itachi)
