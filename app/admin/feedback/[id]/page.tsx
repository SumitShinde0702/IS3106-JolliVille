"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../lib/auth";
import AdminNav from "../../../components/AdminNav";
import { motion } from "framer-motion";
import BackArrow from "../../../components/BackArrow";

interface Complaint {
  id: string;
  profile_id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolution_notes: string | null;
  profiles: {
    email: string;
  };
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

export default function ComplaintDetail({ params }: { params: { id: string } }) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdminAndLoadComplaint = async () => {
      try {
        const { user, error: userError } = await getCurrentUser();
        if (userError) throw new Error(userError);
        if (!user?.admin) {
          router.push("/");
          return;
        }

        const { data, error } = await supabase
          .from("complaints")
          .select(`
            *,
            profiles (
              email
            )
          `)
          .eq("id", params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Complaint not found");

        setComplaint(data);
        setStatus(data.status);
        setResolutionNotes(data.resolution_notes || "");
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load complaint");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadComplaint();
  }, [params.id]);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from("complaints")
        .update({
          status,
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (error) throw error;

      setComplaint((prev) => 
        prev ? {
          ...prev,
          status,
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString(),
        } : null
      );

      alert("Complaint updated successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!complaint) return <div className="p-8">Complaint not found</div>;

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
          <BackArrow href="/admin/feedback" />
        </motion.div>

        <motion.div 
          className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
          variants={itemVariants}
        >
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-gradient">{complaint.subject}</h1>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium">
                  {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium">
                  {new Date(complaint.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Submitted By</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">
                    {complaint.profiles?.email || 'Unknown'}
                  </p>
                  {complaint.profiles?.email && (
                    <a
                      href={`mailto:${complaint.profiles.email}?subject=Re: ${complaint.subject}`}
                      className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-all"
                    >
                      Email User
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8 bg-white/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white/50"
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-white/50"
                placeholder="Add notes about how this complaint was resolved..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
              >
                {updating ? "Updating..." : "Update Complaint"}
              </button>
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