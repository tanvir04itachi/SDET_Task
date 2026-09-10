"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ProfileMenu from "@/components/ProfileMenu";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = ({
  showSearch = true,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [internalSearchValue, setInternalSearchValue] = useState("");

  const isControlledSearch = useMemo(
    () => typeof searchValue === "string" && typeof onSearchChange === "function",
    [searchValue, onSearchChange]
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const effectiveSearchValue = isControlledSearch ? searchValue : internalSearchValue;

  const handleSearchChange = (value) => {
    if (isControlledSearch) {
      onSearchChange(value);
      return;
    }
    setInternalSearchValue(value);
  };

  const handleSearchSubmit = () => {
    if (typeof onSearchSubmit === "function") {
      onSearchSubmit();
      return;
    }

    const value = effectiveSearchValue.trim();
    const targetPath = value ? `/?title=${encodeURIComponent(value)}` : "/";
    router.push(targetPath);
  };

  const isLinkActive = (href) => pathname === href;

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-bold text-indigo-700">
          BlogHub
        </Link>

        {showSearch && (
          <div className="flex-1">
            <SearchBar
              value={effectiveSearchValue}
              onChange={handleSearchChange}
              onSearch={handleSearchSubmit}
              placeholder="Search by blog title..."
              buttonLabel="Go"
            />
          </div>
        )}

        {!showSearch && <div className="flex-1" />}

        {loading ? (
          <p className="text-sm text-gray-500">Checking session...</p>
        ) : user ? (
          <ProfileMenu user={user} onLogout={handleLogout} />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isLinkActive("/login") ? "bg-indigo-100 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isLinkActive("/register")
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
