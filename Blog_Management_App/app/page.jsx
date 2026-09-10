"use client";

import { useEffect, useMemo, useState } from "react";
import BlogCard from "@/components/BlogCard";
import CategoryFilter from "@/components/CategoryFilter";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { getBlogs } from "@/services/blog.service";
import { getApiErrorMessage } from "@/utils/api";

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadBlogs = async ({ title = "", category = "" } = {}) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const blogList = await getBlogs({ title, category });
      setBlogs(blogList);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load blogs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const titleFromUrl = query.get("title") || "";
    setSearchInput(titleFromUrl);
    setSearchTerm(titleFromUrl);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await loadBlogs({ title: searchTerm, category: selectedCategory });
      try {
        const blogList = await getBlogs();
        const categories = [...new Set(blogList.map((blog) => blog.category).filter(Boolean))];
        setAllCategories(categories);
      } catch {
        // category list is optional for filtering UI
      }
    };

    loadData();
  }, [searchTerm, selectedCategory]);

  const heading = useMemo(() => {
    if (searchTerm && selectedCategory) {
      return `Showing results for "${searchTerm}" in "${selectedCategory}"`;
    }
    if (searchTerm) {
      return `Showing results for "${searchTerm}"`;
    }
    if (selectedCategory) {
      return `Showing category "${selectedCategory}"`;
    }
    return "Latest Blogs";
  }, [searchTerm, selectedCategory]);

  return (
    <div>
      <Navbar
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => setSearchTerm(searchInput.trim())}
      />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Public Blog Feed</h1>
            <p className="mt-1 text-sm text-gray-600">{heading}</p>
          </div>
          <CategoryFilter
            categories={allCategories}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {loading && <Loader text="Loading blogs..." />}

        {!loading && errorMessage && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>
        )}

        {!loading && !errorMessage && blogs.length === 0 && (
          <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
            No blogs found.
          </p>
        )}

        {!loading && !errorMessage && blogs.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default HomePage;
