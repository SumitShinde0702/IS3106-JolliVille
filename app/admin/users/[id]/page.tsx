"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import AdminNav from "../../../components/AdminNav";
import { motion } from "framer-motion";
import BackArrow from "../../../components/BackArrow";

interface UserDetails {
  id: string;
  username: string;
  email: string;
  points: number;
  status: string;
  admin: boolean;
  current_streak: number;
  weekly_streak: number;
  monthly_streak: number;
  last_journal_date: string | null;
  avatar_url: string | null;
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

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdminAndLoadUser = async () => {
      try {
        const { user: currentUser, error: userError } = await getCurrentUser();
        if (userError) throw new Error(userError);
        if (!currentUser?.admin) {
          router.push("/");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("User not found");

        setUser(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadUser();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <AdminNav />
      <motion.div 
        className="container mx-auto px-4 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <BackArrow href="/admin/users" />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center gap-6 mb-8">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gradient mb-2">{user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">User Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {user.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.admin ? 'Admin' : 'User'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="font-medium">{user.points}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Journaling Stats</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Current Streak</p>
                    <p className="font-medium">{user.current_streak || '0'} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weekly Streak</p>
                    <p className="font-medium">{user.weekly_streak || '0'} weeks</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Streak</p>
                    <p className="font-medium">{user.monthly_streak || '0'} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Journal Entry</p>
                    <p className="font-medium">
                      {user.last_journal_date 
                        ? new Date(user.last_journal_date).toLocaleDateString()
                        : 'No entries yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
  );
} 