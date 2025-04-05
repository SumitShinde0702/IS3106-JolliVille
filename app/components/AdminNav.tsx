"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import React from "react";

export default function AdminNav() {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin" className="text-xl font-bold text-blue-600">
            JolliVille Admin
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="px-3 py-2 hover:text-pink-600 transition-colors"
                >
                  Dashboard
                </Link>

                <Link
                  href="/admin/users"
                  className="px-3 py-2 hover:text-pink-600 transition-colors"
                >
                  View Users
                </Link>

                <Link
                  href="/admin/feedback"
                  className="px-3 py-2 hover:text-pink-600 transition-colors"
                >
                  Feedback
                </Link>

                <Link
                  href="/admin/profile"
                  className="px-3 py-2 hover:text-pink-600 transition-colors"
                >
                  Profile
                </Link>

                <button
                  onClick={signOut}
                  className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 hover:text-pink-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 hover:text-pink-600 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
