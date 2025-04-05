"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../../lib/auth";

interface JournalEntry {
  id: string;
  user_id: string;
  mood: string;
  written_reflection: string;
  created_at: string;
  image_urls: string[] | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
  },
};

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const { user, error: userError } = await getCurrentUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Entry not found');
        setEntry(data);
      } catch (err) {
        console.error("Error loading entry:", err);
        setError(err instanceof Error ? err.message : "Failed to load entry");
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [params.id]);

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: "😊",
      sad: "😢",
      calm: "😌",
      angry: "😤",
      anxious: "😰",
    };
    return moodEmojis[mood] || "😐";
  };

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (error) return <div className="container mx-auto p-8 text-red-500">{error}</div>;
  if (!entry) return <div className="container mx-auto p-8">Entry not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div
        className="container mx-auto px-4 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.div variants={itemVariants}>
            <Link
              href={`/journal/day/${new Date(entry.created_at).toISOString().split('T')[0]}`}
              className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to List
            </Link>
          </motion.div>
          <motion.h1
            className="text-4xl font-bold text-gradient"
            variants={itemVariants}
          >
            Journal Entry
          </motion.h1>
        </div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">{getMoodEmoji(entry.mood)}</span>
            <div>
              <h2 className="text-2xl font-semibold capitalize">{entry.mood}</h2>
              <p className="text-gray-600">
                {new Date(entry.created_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{entry.written_reflection}</p>
          </div>

          {entry.image_urls && entry.image_urls.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4">
              {entry.image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Journal entry image ${index + 1}`}
                  className="rounded-lg shadow-md"
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
