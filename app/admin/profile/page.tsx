"use client";

import {
  ExclamationCircleIcon,
  KeyIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  changePassword,
  deleteAccount,
  updateProfile,
} from "../../utils/profileApi";
import AdminNav from "app/components/AdminNav";
import withAdminOnly from "../../utils/preventUser";

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    const { username, email, currentPassword, newPassword, confirmPassword } =
      formData;

    // Update profile information
    const { error: profileError, user: updatedUser } = await updateProfile(
      username,
      email
    );
    if (profileError) {
      setError(profileError);
      return;
    }

    // If password fields are filled, update password
    if (currentPassword && newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }

      const { error: passwordError } = await changePassword(
        currentPassword,
        newPassword
      );
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setSuccess("Profile updated successfully!");
    refreshUser();
    setIsEditing(false);
    setShowChangePassword(false);
    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: keyof typeof passwordVisible) => {
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError("");
    setSuccess("");

    const { error } = await deleteAccount();
    if (error) {
      setError(error);
      setIsDeleting(false);
    } else {
      setShowDeleteConfirmation(false);
      setShowDeleteSuccess(true);
    }
  };

  const handleSuccessOk = () => {
    window.location.href = "/";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
        <motion.div
          className="container mx-auto max-w-4xl p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl font-bold mb-8 text-center text-gradient"
            variants={itemVariants}
          >
            My Profile
          </motion.h1>

          <motion.div
            className="card bg-white shadow-lg rounded-xl overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-700">
                        Basic Information
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-700">
                          Change Password
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setShowChangePassword(!showChangePassword)
                          }
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <KeyIcon className="h-5 w-5" />
                          <span>
                            {showChangePassword ? "Hide" : "Change Password"}
                          </span>
                        </button>
                      </div>

                      {showChangePassword && (
                        <motion.div
                          className="p-4 bg-gray-50 rounded-lg"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="space-y-4">
                            {(
                              ["current", "new", "confirm"] as Array<
                                keyof typeof passwordVisible
                              >
                            ).map((field, index) => (
                              <div key={index} className="relative">
                                <input
                                  type={
                                    passwordVisible[field] ? "text" : "password"
                                  }
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
                                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-12"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    togglePasswordVisibility(field)
                                  }
                                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                  {passwordVisible[field] ? "👁" : "👁‍🗨"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Delete Account Section */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-700">
                          Delete Account
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmation(true)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                      >
                        Save All Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                    {success && (
                      <p className="text-green-500 text-sm mt-2">{success}</p>
                    )}
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <UserCircleIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        {user?.username || "Username"}
                      </h3>
                      <p className="text-gray-600">
                        {user?.email || "email@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Confirm Account Deletion
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setError("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <p className="text-sm text-red-600 mb-4">
                  All your data, including journal entries, will be permanently
                  deleted.
                </p>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md disabled:opacity-70"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setError("");
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Success Modal */}
        {showDeleteSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <div className="flex justify-center mb-6">
                  <div className="rounded-full bg-green-100 p-4">
                    <svg
                      className="h-12 w-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Account Successfully Deleted
                </h3>
                <p className="text-gray-600">
                  Thank you for being part of JolliVille. We hope to see you
                  again soon!
                </p>
              </div>

              <button
                onClick={handleSuccessOk}
                className="w-32 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
export default withAdminOnly(ProfilePage);
