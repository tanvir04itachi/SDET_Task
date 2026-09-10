"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { getBlogs } from "@/services/blog.service";
import { getApiErrorMessage } from "@/utils/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const blogList = await getBlogs();
        setBlogs(blogList);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Failed to load dashboard data."));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const visibleBlogs = user?.role === "admin" ? blogs : blogs.filter((blog) => blog.author?.id === user?.id);
  const recentBlogs = [...visibleBlogs].slice(0, 5);
  const displayName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || user?.email;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {displayName}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {user?.role === "admin" ? "You are logged in as Admin." : "Manage your blogs from this dashboard."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
            Total Visible Blogs: {visibleBlogs.length}
          </span>
          <Link
            href="/dashboard/blogs/create"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Quick Create Blog
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent Blogs</h2>
        {loading && <Loader text="Loading dashboard..." />}
        {!loading && errorMessage && <p className="mt-3 text-sm text-red-700">{errorMessage}</p>}
        {!loading && !errorMessage && recentBlogs.length === 0 && (
          <p className="mt-3 text-sm text-gray-600">You haven&apos;t created any blogs yet.</p>
        )}
        {!loading && !errorMessage && recentBlogs.length > 0 && (
          <ul className="mt-3 space-y-2">
            {recentBlogs.map((blog) => (
              <li key={blog.id} className="rounded-md border border-gray-100 px-3 py-2 text-sm text-gray-700">
                <strong>{blog.blogTitle}</strong> - {blog.category}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
