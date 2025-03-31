"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface JournalEntry {
  id: string;
  mood: string;
  written_reflection: string;
  created_at: string;
  audio_url?: string;
  image_urls: string[];
  transcription?: string;
}

const MOCK_ENTRY = {
  id: "1",
  mood: "happy",
  written_reflection: "Today was a great day...",
  created_at: "2024-03-15T10:00:00Z",
  image_urls: [],
  audio_url: "",
  transcription: "",
};

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

export default function JournalEntryPage() {
  const params = useParams();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadEntry = async () => {
      try {
        // For now, use mock data
        setEntry(MOCK_ENTRY);
        setLoading(false);

        /* Uncomment when ready to use Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
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
        */
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-8 text-red-500">{error}</div>;
  if (!entry)
    return <div className="container mx-auto p-8">Entry not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div
        className="container mx-auto px-4 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <Link
            href="/journal/list"
            className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            ← Back to Journal List
          </Link>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">{getMoodEmoji(entry.mood)}</span>
            <div>
              <h1 className="text-3xl font-bold mb-2">Journal Entry</h1>
              <p className="text-gray-600">{formatDate(entry.created_at)}</p>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-wrap">{entry.written_reflection}</p>
          </div>

          {entry.audio_url && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Voice Recording</h2>
              <audio controls src={entry.audio_url} className="w-full" />
              {entry.transcription && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Transcription</h3>
                  <p className="text-gray-700">{entry.transcription}</p>
                </div>
              )}
            </div>
          )}

          {entry.image_urls.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {entry.image_urls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={url}
                      alt={`Journal image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
