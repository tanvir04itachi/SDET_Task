"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  blogTitle: "",
  category: "",
  blog: "",
};

const BlogForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitText = "Submit",
  loadingText = "Submitting...",
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        blogTitle: initialData.blogTitle || "",
        category: initialData.category || "",
        blog: initialData.blog || "",
      });
    }
  }, [initialData]);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const payload = {
      blogTitle: formData.blogTitle.trim(),
      category: formData.category.trim(),
      blog: formData.blog.trim(),
    };

    if (!payload.blogTitle || !payload.category || !payload.blog) {
      setErrorMessage("Blog title, category and content are required.");
      return;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {errorMessage && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>
      )}

      <div>
        <label htmlFor="blog-title" className="mb-1 block text-sm font-medium text-gray-700">
          Blog Title
        </label>
        <input
          id="blog-title"
          value={formData.blogTitle}
          onChange={(event) => updateField("blogTitle", event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="blog-category" className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
        <input
          id="blog-category"
          value={formData.category}
          onChange={(event) => updateField("category", event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Example: Testing"
        />
      </div>

      <div>
        <label htmlFor="blog-content" className="mb-1 block text-sm font-medium text-gray-700">
          Blog Content
        </label>
        <textarea
          id="blog-content"
          value={formData.blog}
          onChange={(event) => updateField("blog", event.target.value)}
          rows={8}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? loadingText : submitText}
      </button>
    </form>
  );
};

export default BlogForm;
