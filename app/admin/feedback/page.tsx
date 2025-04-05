"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import AdminNav from "../../components/AdminNav";
import { motion } from "framer-motion";

interface Complaint {
  id: string;
  profile_id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolution_notes: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function AdminFeedback() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdminAndLoadComplaints = async () => {
      try {
        const { user, error: userError } = await getCurrentUser();
        if (userError) throw new Error(userError);
        if (!user?.admin) {
          router.push("/");
          return;
        }

        const { data, error } = await supabase
          .from("complaints")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setComplaints(data || []);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadComplaints();
  }, []);

  const handleResolve = async (id: string) => {
    if (resolvingId === id) {
      try {
        const { error } = await supabase
          .from("complaints")
          .update({
            status: "resolved",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        setComplaints(complaints.map(complaint => 
          complaint.id === id 
            ? { ...complaint, status: "resolved", updated_at: new Date().toISOString() }
            : complaint
        ));
        setResolvingId(null);
      } catch (err) {
        console.error("Error:", err);
        alert("Failed to resolve complaint");
      }
    } else {
      setResolvingId(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <AdminNav />
      <motion.div 
        className="container mx-auto px-4 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold mb-8 text-gradient">Feedback Management</h1>
        </motion.div>
        
        <motion.div 
          className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
          variants={itemVariants}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                      <Link
                        href={`/admin/feedback/${complaint.id}`}
                        className="text-pink-600 hover:text-pink-900"
                      >
                        View Details
                      </Link>
                      {complaint.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolve(complaint.id)}
                          className={`${
                            resolvingId === complaint.id
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-pink-600 hover:bg-pink-700"
                          } text-white px-3 py-1 rounded-full text-xs transition-colors`}
                        >
                          {resolvingId === complaint.id ? "Confirm Resolve" : "Resolve"}
                        </button>
                      )}
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
      `}</style>
    </div>
  );
}
