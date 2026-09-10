"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/services/user.service";
import { getApiErrorMessage } from "@/utils/api";

const ProfilePage = () => {
  const { updateUserInState } = useAuth();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const profile = await getProfile();
        setFormData({
          firstname: profile?.firstname || "",
          lastname: profile?.lastname || "",
          email: profile?.email || "",
          role: profile?.role || "",
        });
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Failed to load profile."));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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

    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      setErrorMessage("First name and last name are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProfile = await updateProfile({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
      });
      updateUserInState(updatedProfile);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to update profile."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading profile..." />;
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {errorMessage && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
      {successMessage && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
            {(formData.firstname || formData.email || "U").charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-gray-900">Profile Image</p>
            <p className="text-sm text-amber-700">
              Upload unavailable: backend has no <code>/api/users/profile/image</code> endpoint.
            </p>
          </div>
        </div>

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
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            value={formData.email}
            readOnly
            className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
            Role
          </label>
          <input
            id="role"
            value={formData.role}
            readOnly
            className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </section>
  );
};

export default ProfilePage;
