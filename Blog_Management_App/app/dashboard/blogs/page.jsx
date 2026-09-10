"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { deleteBlog, getBlogs } from "@/services/blog.service";
import { getApiErrorMessage } from "@/utils/api";

const DashboardBlogsPage = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBlogs = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const blogList = await getBlogs();
      setBlogs(blogList);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load blogs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const visibleBlogs = useMemo(() => {
    if (user?.role === "admin") {
      return blogs;
    }
    return blogs.filter((blog) => blog.author?.id === user?.id);
  }, [blogs, user]);

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;

    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await deleteBlog(blogToDelete.id);
      setSuccessMessage(response?.message || "Blog deleted successfully.");
      setBlogs((previous) => previous.filter((blog) => blog.id !== blogToDelete.id));
      setBlogToDelete(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to delete blog."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">{user?.role === "admin" ? "All Blogs" : "My Blogs"}</h1>
        <Link
          href="/dashboard/blogs/create"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Create Blog
        </Link>
      </div>

      {successMessage && <p className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-700">{successMessage}</p>}
      {errorMessage && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}

      {loading && <Loader text="Loading blogs..." />}

      {!loading && visibleBlogs.length === 0 && (
        <p className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-600">
          {user?.role === "admin" ? "No blogs found." : "You haven&apos;t created any blogs yet."}
        </p>
      )}

      {!loading && visibleBlogs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBlogs.map((blog) => {
                const authorName = `${blog.author?.firstname || ""} ${blog.author?.lastname || ""}`.trim() || "Unknown";

                return (
                  <tr key={blog.id} className="border-t border-gray-200">
                    <td className="px-3 py-2">{blog.blogTitle}</td>
                    <td className="px-3 py-2">{blog.category}</td>
                    <td className="px-3 py-2">{authorName}</td>
                    <td className="px-3 py-2">{new Date(blog.createAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/blogs/${blog.id}/edit`}
                          className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setBlogToDelete(blog)}
                          className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(blogToDelete)}
        title="Delete Blog"
        message="Are you sure you want to delete this blog?"
        confirmText="Delete"
        isLoading={isDeleting}
        onCancel={() => setBlogToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  );
};

export default DashboardBlogsPage;
