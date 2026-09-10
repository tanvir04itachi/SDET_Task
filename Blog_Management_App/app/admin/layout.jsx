"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <Loader text="Checking authorization..." />;
  }

  if (user.role !== "admin") {
    return (
      <div>
        <Navbar />
        <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 pb-10 pt-24">
          <section className="w-full rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-2xl font-bold text-red-800">Access Denied</h1>
            <p className="mt-2 text-sm text-red-700">Only admins can access this page.</p>
            <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-indigo-700 underline">
              Back to Dashboard
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="pt-16 sm:pl-64">
        <Sidebar />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
