"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BlogForm from "@/components/BlogForm";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { getBlogById, updateBlog } from "@/services/blog.service";
import { getApiErrorMessage } from "@/utils/api";

const EditBlogPage = () => {
  const params = useParams();
  const blogId = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const blogData = await getBlogById(blogId);
        setBlog(blogData);
      } catch (error) {
        if (error?.response?.status === 404) {
          setErrorMessage("Blog not found.");
        } else {
          setErrorMessage(getApiErrorMessage(error, "Failed to load blog."));
        }
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  const isOwner = blog?.author?.id === user?.id;
  const isAdmin = user?.role === "admin";
  const hasAccess = isAdmin || isOwner;

  const handleUpdateBlog = async (payload) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await updateBlog(blogId, payload);
      setSuccessMessage("Blog updated successfully.");
      setTimeout(() => router.push("/dashboard/blogs"), 800);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to update blog."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading blog..." />;
  }

  if (errorMessage && !blog) {
    return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>;
  }

  if (!hasAccess) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-800">Access Denied</h1>
        <p className="mt-2 text-sm text-red-700">You are not authorized to edit this blog.</p>
        <Link href="/dashboard/blogs" className="mt-4 inline-block text-sm font-medium text-indigo-700 underline">
          Back to Blog List
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
      {errorMessage && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
      {successMessage && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{successMessage}</p>}
      <BlogForm
        initialData={blog}
        onSubmit={handleUpdateBlog}
        isSubmitting={isSubmitting}
        submitText="Update Blog"
        loadingText="Updating..."
      />
    </section>
  );
};

export default EditBlogPage;
