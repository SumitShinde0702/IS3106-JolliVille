"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/auth";

interface JournalEntry {
  id: string;
  user_id: string;
  mood: string;
  written_reflection: string;
  created_at: string;
  image_urls: string[];
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

export default function JournalListPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const { user, error: userError } = await getCurrentUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEntries(data || []);
      } catch (err) {
        console.error("Error loading entries:", err);
        setError(err instanceof Error ? err.message : "Failed to load entries");
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-4xl font-bold text-gradient"
            variants={itemVariants}
          >
            Your Journal Entries
          </motion.h1>
          <motion.div variants={itemVariants} className="flex gap-4">
            <Link href="/journal/monthly" className="btn-primary">
              Monthly View
            </Link>
            <Link href="/journal" className="btn-primary">
              Write New Entry
            </Link>
          </motion.div>
        </div>

        {entries.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            variants={itemVariants}
          >
            <p className="text-gray-600 text-lg mb-4">No journal entries yet.</p>
            <Link href="/journal" className="btn-primary">
              Write your first entry
            </Link>
          </motion.div>
        ) : (
          <motion.div className="grid gap-6" variants={containerVariants}>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <Link href={`/journal/entry/${entry.id}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <span className="text-gray-600">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 line-clamp-3">
                    {entry.written_reflection}
                  </p>
                  {entry.image_urls.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      <span className="text-purple-600">
                        📷 {entry.image_urls.length} image(s)
                      </span>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
