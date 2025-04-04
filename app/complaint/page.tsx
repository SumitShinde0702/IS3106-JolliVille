"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { submitComplaint } from "../utils/complaintApi";

export default function ComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const { error: submitError } = await submitComplaint(
      formData.subject,
      formData.description
    );

    if (submitError) {
      setError(submitError);
    } else {
      setSuccess("Your complaint has been submitted successfully!");
      // Clear form after successful submission
      setFormData({ subject: "", description: "" });
      // Redirect back to profile after 2 seconds
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <button
              onClick={() => router.back()}
              className="text-white mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Profile
            </button>
            <h1 className="text-2xl font-bold text-white">
              Submit a Complaint
            </h1>
            <p className="text-purple-100 mt-2">
              We value your feedback and will address your concerns promptly.
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject Field */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Brief subject of your complaint"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors h-40 resize-none"
                  placeholder="Please provide detailed information about your complaint..."
                  required
                />
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-500 text-sm bg-green-50 p-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
