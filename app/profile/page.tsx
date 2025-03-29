"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

import {
  updateProfile,
  changePassword,
  deleteAccount,
} from "../utils/profileApi";
import { signOut } from "app/lib/auth";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { username, email } = formData;

    const { error, user } = await updateProfile(username, email);
    if (error) {
      setError(error);
    } else {
      //setSuccess("Profile updated successfully!");
      refreshUser();
      alert("Changes saved successfully!");
    }
  };

  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: keyof typeof passwordVisible) => {
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields must be filled.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const { error } = await changePassword(currentPassword, newPassword);
    if (error) {
      setError(error);
    } else {
      setSuccess("Password updated successfully!");
      setShowChangePassword(false);
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password changed successfully!");
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { currentPassword } = formData;

    const { error } = await deleteAccount(currentPassword);
    if (error) {
      setError(error);
    } else {
      setSuccess("Account deleted successfully.");
      alert("Account deleted successfully. Redirecting to login page.");
      window.location.href = "/login";
      signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto max-w-lg p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Profile Settings
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>

        {/* Change Password Section */}
        <div className="mt-6">
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600"
          >
            Change Password
          </button>
          {showChangePassword && (
            <div className="mt-4 space-y-3">
              {(
                ["current", "new", "confirm"] as Array<
                  keyof typeof passwordVisible
                >
              ).map((field, index) => (
                <div key={index} className="relative">
                  <input
                    type={passwordVisible[field] ? "text" : "password"}
                    placeholder={
                      field === "current"
                        ? "Current Password"
                        : field === "new"
                        ? "New Password"
                        : "Confirm New Password"
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field + "Password"]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {passwordVisible[field] ? "👁" : "👁‍🗨"}
                  </button>
                </div>
              ))}
              <button
                onClick={handleChangePassword}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                Update Password
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {success && (
                <p className="text-green-500 text-sm mt-2">{success}</p>
              )}
            </div>
          )}
        </div>

        {/* Delete Account Section */}
        <div className="mt-6">
          <button
            onClick={() => setShowDeleteAccount(!showDeleteAccount)}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
          >
            Delete Account
          </button>
          {showDeleteAccount && (
            <div className="mt-4">
              <p className="text-sm text-red-600">
                Warning: This action is irreversible!
              </p>
              <input
                type="password"
                placeholder="Enter current password to confirm"
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md mt-2"
              />
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-700 text-white py-2 rounded-md hover:bg-red-800 mt-3"
              >
                Confirm Deletion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
