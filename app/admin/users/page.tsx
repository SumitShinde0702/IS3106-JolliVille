"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../lib/auth";
import AdminNav from "../../components/AdminNav";
import { motion } from "framer-motion";

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  status: string;
  admin: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      try {
        const { user, error: userError } = await getCurrentUser();
        if (userError) throw new Error(userError);
        if (!user?.admin) {
          router.push("/");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("username");

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadUsers();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <>
      <AdminNav />
      <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
        <motion.div
          className="container mx-auto px-4 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-bold mb-8 text-gradient">
              User Management
            </h1>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Points
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white/30">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.points}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                        >
                          {user.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          user.admin
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                        >
                          {user.admin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-pink-600 hover:text-pink-900 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>

        <style jsx global>{`
          .text-gradient {
            background: linear-gradient(to right, #ec4899, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
        `}</style>
      </div>
    </>
  );
}
