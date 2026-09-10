import Link from "next/link";

const getAuthorName = (author) => {
  if (!author) return "Unknown Author";
  const fullName = `${author.firstname || ""} ${author.lastname || ""}`.trim();
  return fullName || "Unknown Author";
};

const BlogCard = ({ blog }) => {
  const authorName = getAuthorName(blog.author);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {blog.category}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(blog.createAt).toLocaleDateString()}
        </span>
      </div>

      <h2 className="mb-2 text-lg font-semibold text-gray-900">{blog.blogTitle}</h2>
      <p className="mb-4 line-clamp-3 text-sm text-gray-600">{blog.blog}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {authorName.charAt(0).toUpperCase()}
          </span>
          <p className="text-sm text-gray-700">By {authorName}</p>
        </div>
        <Link
          href={`/blogs/${blog.id}`}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Read More
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;
