"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const getDisplayName = (user) => {
  const name = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
  return name || user?.email || "User";
};

const ProfileMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm hover:bg-gray-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
          {getDisplayName(user).charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-gray-700 sm:block">{getDisplayName(user)}</span>
        <span className="text-xs text-gray-500">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
          <Link
            href="/dashboard/profile"
            className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/dashboard/change-password"
            className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Change Password
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="mt-1 block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
