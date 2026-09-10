# 📝 Blog Management Frontend (Next.js)

A responsive, role-aware blogging platform frontend built with **Next.js (App Router)** and **Tailwind CSS**. It consumes the [Blog Management REST API](../blog-api/README.md) and supports three types of visitors — **Guest**, **User**, and **Admin** — through public browsing, authenticated dashboards, and admin user management.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Backend Dependency](#-backend-dependency)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Application Routes](#-application-routes)
- [User & Admin Functionality](#-user--admin-functionality)
- [API Integration](#-api-integration)
- [Authentication & Route Protection](#-authentication--route-protection)
- [Validation, Loading & Empty States](#-validation-loading--empty-states)
- [Known Backend Limitations](#-known-backend-limitations)
- [Screenshots](#-screenshots)

---

## 📌 Project Overview

This project is the frontend deliverable for the *"Create a Blogsite using Next.js and Tailwind"* assignment. It implements a realistic blog website where:

- **Guests** can browse, search, filter, and read blogs.
- **Users** can register, log in, manage their profile, change their password, and create/update/delete their own blogs.
- **Admins** can additionally manage all users (view, activate/deactivate) and manage any user's blogs.

All data is fetched live from the backend REST API — there is no hardcoded/mock data, and authentication/authorization decisions are always re-validated against the backend, not just hidden in the UI.

## ✨ Features

**Guest**
- Public homepage with blog cards (title, category, preview, author, created date)
- Blog search (`?title=`) and category filter (`?category=`), combinable
- Blog details page (`/blogs/[id]`) with a "Blog Not Found" fallback
- Register and Login forms with client-side validation

**Authenticated User**
- Token-based login/logout with persisted session across page refresh
- Dashboard with welcome message, total blogs, and recent blogs
- Blog management: create, edit, and delete (with confirmation dialog) own blogs
- Profile view/update (first name, last name)
- Change password
- Protected routes that redirect unauthenticated visitors to `/login`

**Admin**
- All User capabilities, plus:
- User management list (`/admin/users`) with activate/deactivate actions
- View any user's detailed information
- Edit/delete any user's blog, not just their own
- Role-based route guarding so normal users cannot reach `/admin/*`

**Application-wide**
- Fixed responsive Navbar (search + auth-aware ProfileMenu) and a collapsible Sidebar
- Loading indicators/spinners and disabled "pending" button states (e.g. `Publishing...`) to prevent duplicate submits
- Human-readable error messages sourced from backend responses (no raw JS errors surfaced)
- Empty-state messaging (e.g. "No blogs found.", "You haven't created any blogs yet.")
- Reusable API service layer — no repeated fetch/axios logic scattered across pages

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Routing, layouts, middleware-based route protection |
| **React 18** | UI components |
| **Tailwind CSS 3** | Styling and responsive design |
| **Axios** | HTTP client for API integration |
| **Context API** | Global authentication state (`AuthContext`) |

## 📁 Project Structure

```
Blog_Management_App/
├── app/
│   ├── page.jsx                  # Public homepage
│   ├── login/                    # /login
│   ├── register/                 # /register
│   ├── forgot-password/          # /forgot-password
│   ├── reset-password/[token]/   # /reset-password/[token]
│   ├── blogs/[id]/               # /blogs/[id] (public blog details)
│   ├── dashboard/
│   │   ├── layout.jsx            # Protected dashboard layout (Navbar + Sidebar)
│   │   ├── page.jsx              # /dashboard
│   │   ├── blogs/                # /dashboard/blogs (list, create, [id]/edit)
│   │   ├── profile/              # /dashboard/profile
│   │   └── change-password/      # /dashboard/change-password
│   └── admin/
│       └── users/                # /admin/users (admin only)
├── components/                   # Navbar, Sidebar, ProfileMenu, BlogCard, BlogForm,
│                                  # SearchBar, CategoryFilter, Loader, ConfirmDialog
├── services/                     # auth.service.js, user.service.js, blog.service.js
├── contexts/                     # AuthContext.jsx (auth state & actions)
├── utils/                        # api.js (axios client), auth.js (token/role helpers)
├── middleware.js                 # Route protection & role-based redirects
├── .env.example
└── package.json
```

## 🔗 Backend Dependency

This frontend is a pure client for the [Blog Management REST API](../blog-api/README.md) (Express.js + Sequelize + MySQL) and does **not** implement any backend logic itself. The API must be running before starting the frontend.

To run the backend from the repository root:

```bash
cd ../blog-api
npm install
npm run dev
```

By default the API is expected at `http://localhost:5000`. See [blog-api/README.md](../blog-api/README.md) for database configuration and environment setup.

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- The [blog-api](../blog-api) backend running and reachable

### Installation
```bash
cd Blog_Management_App
npm install
```

### Environment Variables
Copy `.env.example` to `.env.local` and set the API base URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
> Do not commit `.env.local`/`.env` — only `.env.example` is tracked.

### Running the Application
```bash
# Development server
npm run dev

# Production build
npm run build
npm run start

# Lint
npm run lint
```
The app runs at `http://localhost:3000` by default.

## 🗺 Application Routes

| Route | Access |
|---|---|
| `/` | Public |
| `/blogs/[id]` | Public |
| `/login` | Public |
| `/register` | Public |
| `/forgot-password` | Public |
| `/reset-password/[token]` | Public |
| `/dashboard` | User / Admin |
| `/dashboard/blogs` | User / Admin |
| `/dashboard/blogs/create` | User / Admin |
| `/dashboard/blogs/[id]/edit` | User / Admin |
| `/dashboard/profile` | User / Admin |
| `/dashboard/change-password` | User / Admin |
| `/admin/users` | Admin only |

Unauthenticated visitors requesting a `/dashboard/*` or `/admin/*` route are redirected to `/login`; authenticated non-admins requesting `/admin/*` are redirected to `/dashboard`.

## 👤 User & Admin Functionality

**Registered User journey:** Login → view/update Profile → Change Password → Create Blogs → Update/Delete own Blogs → Logout.

**Admin journey:** Admin Login → Dashboard → View Users → View a User's details → Activate/Deactivate a User → Manage all Blogs (edit/delete any blog, not just their own).

Normal users can only edit/delete blogs they own; the frontend disables/hides those actions for blogs they don't own, and the backend independently enforces ownership so the restriction cannot be bypassed by calling the API directly.

## 🔌 API Integration

All requests go through a shared axios client (`utils/api.js`) and endpoint-specific service modules (`services/`). Endpoints currently wired into the UI:

| Method | Endpoint | Used by |
|---|---|---|
| `POST` | `/api/auth/register` | Register page |
| `POST` | `/api/auth/login` | Login page |
| `GET` | `/api/users/profile` | Navbar, Profile page |
| `PUT` | `/api/users/profile/update` | Profile page |
| `PATCH` | `/api/users/password` | Change Password page |
| `GET` | `/api/users` | Admin users list |
| `GET` | `/api/users/:id` | Admin user details |
| `PATCH` | `/api/users/:id/status` | Admin activate/deactivate |
| `GET` | `/api/blogs` | Homepage, dashboard blog list (supports `title`/`category` filters) |
| `GET` | `/api/blogs/:id` | Blog details, edit form prefill |
| `POST` | `/api/blogs/create` | Create Blog page |
| `PUT` | `/api/blogs/update/:id` | Edit Blog page |
| `DELETE` | `/api/blogs/delete/:id` | Blog list delete action |

The blog creation payload never includes `userId` — the backend derives the author from the authenticated token.

## 🔐 Authentication & Route Protection

- On login, the auth token and role are stored and the user's profile is loaded into `AuthContext`.
- Every protected request sends `Authorization: Bearer <token>`.
- [`middleware.js`](./middleware.js) enforces route protection at the edge: it reads the token/role cookies and redirects unauthenticated or under-privileged requests before the page renders, so role-based access does not rely solely on hiding menu items in the UI.
- Backend `401`/`403` responses are surfaced to the user (e.g. session expiry, forbidden actions) rather than ignored.
- Logout clears the token/role and all client-side user state, then redirects to `/login`.

## ✅ Validation, Loading & Empty States

- Client-side validation for required fields, email format, password length, password confirmation, and blog title/content/category — this complements, not replaces, backend validation.
- Loading indicators (`Loader` component, disabled/pending buttons like `Publishing...`) prevent duplicate submissions.
- Empty states such as "No blogs found.", "You haven't created any blogs yet.", and "No users found." are shown instead of blank screens.
- Backend error messages (e.g. "Invalid email or password.", "Blog not found.", "You are not authorized to update this blog.") are displayed as-is; raw JavaScript/network errors are never shown to the user.

## ⚠️ Known Backend Limitations

The following routes from the assignment spec are **not implemented by the current backend** and are handled safely in the UI (clear "feature unavailable" messaging instead of calling a non-existent endpoint):

- `POST /api/auth/forgot-password`
- `PATCH /api/auth/reset-password/:token`
- `PATCH /api/users/profile/image`

The `/forgot-password` and `/reset-password/[token]` pages and the profile image upload UI exist, but submitting them informs the user the feature is not yet available on the backend rather than silently failing or faking success.

## 📸 Screenshots

> Add screenshots of the major pages (homepage, blog details, login/register, dashboard, blog list/create/edit, profile, change password, admin users) to a `screenshots/` folder and reference them here, e.g.:
>
> `![Homepage](./screenshots/homepage.png)`

## 📄 Notes

- Blog fields are mapped from the backend shape: `blogTitle`, `blog`, `category`, `createAt`, `author`.
- No Docker files are used for this project.
