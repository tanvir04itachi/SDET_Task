"use client";

const CategoryFilter = ({ categories, value, onChange }) => {
  return (
    <div className="w-full sm:w-64">
      <label htmlFor="category-filter" className="mb-1 block text-sm font-medium text-gray-700">
        Category
      </label>
      <select
        id="category-filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
