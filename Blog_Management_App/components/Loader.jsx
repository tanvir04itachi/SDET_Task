const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-gray-700">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      <p className="text-sm sm:text-base">{text}</p>
    </div>
  );
};

export default Loader;
