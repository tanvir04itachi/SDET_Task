"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BlogForm from "@/components/BlogForm";
import { createBlog } from "@/services/blog.service";
import { getApiErrorMessage } from "@/utils/api";

const CreateBlogPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBlog = async (payload) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await createBlog(payload);
      setSuccessMessage("Blog created successfully.");
      setTimeout(() => router.push("/dashboard/blogs"), 800);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to create blog."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Create Blog</h1>
      {errorMessage && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
      {successMessage && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{successMessage}</p>}
      <BlogForm
        onSubmit={handleCreateBlog}
        isSubmitting={isSubmitting}
        submitText="Publish Blog"
        loadingText="Publishing..."
      />
    </section>
  );
};

export default CreateBlogPage;
