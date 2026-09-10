"use client";

import { useEffect, useRef, useState } from "react";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { getUserById, getUsers, updateUserRole, updateUserStatus } from "@/services/user.service";
import { getApiErrorMessage } from "@/utils/api";

const ROLE_OPTIONS = ["user", "admin"];

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState(null);
  const detailsRef = useRef(null);

  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    setErrorMessage("");
    setSuccessMessage("");
    setUpdatingUserId(user.id);

    try {
      const updatedUser = await updateUserStatus(user.id, !user.isActive);
      setUsers((previous) =>
        previous.map((currentUser) => (currentUser.id === user.id ? updatedUser : currentUser))
      );
      setSuccessMessage(`User ${updatedUser.isActive ? "activated" : "deactivated"} successfully.`);

      if (selectedUser?.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to update user status."));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleViewDetails = async (userId) => {
    setDetailLoading(true);
    setErrorMessage("");
    try {
      const details = await getUserById(userId);
      setSelectedUser(details);
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load user details."));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (newRole === user.role) return;

    setErrorMessage("");
    setSuccessMessage("");
    setUpdatingRoleUserId(user.id);

    try {
      const updatedUser = await updateUserRole(user.id, newRole);
      setUsers((previous) =>
        previous.map((currentUserRow) => (currentUserRow.id === user.id ? updatedUser : currentUserRow))
      );
      setSuccessMessage(`${updatedUser.firstname} ${updatedUser.lastname}'s role updated to ${updatedUser.role}.`);

      if (selectedUser?.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to update user role."));
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>

      {successMessage && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{successMessage}</p>}
      {errorMessage && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {loading && <Loader text="Loading users..." />}

        {!loading && users.length === 0 && (
          <p className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-600">
            No users found.
          </p>
        )}

        {!loading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-200">
                    <td className="px-3 py-2">{`${user.firstname} ${user.lastname}`}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">
                      <select
                        value={user.role}
                        onChange={(event) => handleRoleChange(user, event.target.value)}
                        disabled={updatingRoleUserId === user.id || user.id === currentUser?.id}
                        title={user.id === currentUser?.id ? "You cannot change your own role" : undefined}
                        className="rounded border border-gray-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">{user.isActive ? "Active" : "Inactive"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(user.id)}
                          className="rounded bg-gray-700 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={updatingUserId === user.id}
                          className={`rounded px-2 py-1 text-xs font-medium text-white ${
                            user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {updatingUserId === user.id
                            ? "Updating..."
                            : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div ref={detailsRef} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
        {detailLoading && <Loader text="Loading user details..." />}
        {!detailLoading && !selectedUser && (
          <p className="mt-2 text-sm text-gray-600">Select a user to view details.</p>
        )}
        {!detailLoading && selectedUser && (
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <p><strong>Name:</strong> {selectedUser.firstname} {selectedUser.lastname}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Status:</strong> {selectedUser.isActive ? "Active" : "Inactive"}</p>
            <p><strong>Created Date:</strong> {new Date(selectedUser.createAt).toLocaleString()}</p>
            <p><strong>Profile Image:</strong> Not available in backend response.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminUsersPage;
