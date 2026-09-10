"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { getBlogById } from "@/services/blog.service";
import { getApiErrorMessage } from "@/utils/api";

const BlogDetailsPage = () => {
  const params = useParams();
  const blogId = params?.id;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const blogData = await getBlogById(blogId);
        setBlog(blogData);
      } catch (error) {
        if (error?.response?.status === 404) {
          setErrorMessage("Blog Not Found");
        } else {
          setErrorMessage(getApiErrorMessage(error, "Failed to load blog details."));
        }
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  const authorName = `${blog?.author?.firstname || ""} ${blog?.author?.lastname || ""}`.trim() || "Unknown Author";

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 sm:px-6">
        {loading && <Loader text="Loading blog details..." />}

        {!loading && errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">{errorMessage}</p>
            <Link href="/" className="mt-3 inline-block text-sm font-medium text-indigo-700 underline">
              Back to Home
            </Link>
          </div>
        )}

        {!loading && !errorMessage && blog && (
          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {blog.category}
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{blog.blogTitle}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {authorName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p>By {authorName}</p>
                <p>{new Date(blog.createAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 whitespace-pre-wrap text-gray-800">{blog.blog}</div>
          </article>
        )}
      </main>
    </div>
  );
};

export default BlogDetailsPage;
