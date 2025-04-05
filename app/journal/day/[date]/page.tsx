"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { getCurrentUser } from "../../../lib/auth";
import BackArrow from "../../../components/BackArrow";

interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string;
  created_at: string;
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

const moodEmojis: { [key: string]: string } = {
  happy: "😊",
  sad: "😢",
  calm: "😌",
  angry: "😤",
  anxious: "😰",
};

export default function DayEntriesPage({ params }: { params: { date: string } }) {
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

        // Convert URL-encoded date to Date object and handle timezone
        const selectedDate = new Date(decodeURIComponent(params.date));
        const startOfDay = new Date(selectedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        console.log('Fetching entries between:', startOfDay, 'and', endOfDay);

        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('Found entries:', data);
        setEntries(data || []);
      } catch (err) {
        console.error("Error loading entries:", err);
        setError(err instanceof Error ? err.message : "Failed to load entries");
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [params.date]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (error) return <div className="container mx-auto p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div
        className="container mx-auto px-4 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <BackArrow href="/journal/monthly" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-gradient mb-8"
        >
          Journal Entries for {new Date(decodeURIComponent(params.date)).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </motion.h1>

        {entries.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <p className="text-gray-600">No entries for this day</p>
            <Link
              href="/journal"
              className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Write New Entry
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="space-y-6"
          >
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">{entry.title}</h2>
                  <span className="text-3xl" title={entry.mood}>
                    {moodEmojis[entry.mood]}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                  {entry.content}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{formatDate(entry.created_at)}</span>
                  <Link
                    href={`/journal/entry/${entry.id}`}
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    View Full Entry →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 