"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { registerUser } from "@/services/auth.service";
import { getApiErrorMessage } from "@/utils/api";

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => router.push("/login"), 900);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to register user."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4 pb-10 pt-24">
        <section className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Register</h1>
          <p className="mt-1 text-sm text-gray-600">Create your account to manage blogs.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {errorMessage && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
            {successMessage && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{successMessage}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstname" className="mb-1 block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstname"
                  value={formData.firstname}
                  onChange={(event) => updateField("firstname", event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="lastname" className="mb-1 block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(event) => updateField("lastname", event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-700">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-700 hover:underline">
              Login here
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
