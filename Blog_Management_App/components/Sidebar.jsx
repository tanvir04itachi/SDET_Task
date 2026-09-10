"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";

  const baseItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: isAdmin ? "All Blogs" : "My Blogs", href: "/dashboard/blogs" },
    { label: "Create Blog", href: "/dashboard/blogs/create" },
  ];

  const adminItems = isAdmin ? [{ label: "Users", href: "/admin/users" }] : [];

  const accountItems = [
    { label: "Profile", href: "/dashboard/profile" },
    { label: "Change Password", href: "/dashboard/change-password" },
  ];

  const allItems = [...baseItems, ...adminItems, ...accountItems];

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    closeSidebar();
    logout();
    router.push("/login");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-3 top-[72px] z-30 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow sm:hidden"
      >
        Menu
      </button>

      {isOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-20 bg-black/30 sm:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white p-4 transition-transform sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Navigation</p>
        <nav className="space-y-1">
          {allItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  active ? "bg-indigo-100 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
