"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface JournalEntry {
  id: string;
  mood: string;
  created_at: string;
}

interface CalendarDay {
  day: number | null;
  entry: JournalEntry | null;
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

// Mock data for testing
const MOCK_ENTRIES = [
  { id: "1", mood: "sad", created_at: "2024-01-01T10:00:00Z" },
  { id: "2", mood: "happy", created_at: "2024-01-02T10:00:00Z" },
  { id: "3", mood: "calm", created_at: "2024-01-03T10:00:00Z" },
  { id: "4", mood: "calm", created_at: "2024-01-04T10:00:00Z" },
  { id: "5", mood: "happy", created_at: "2024-01-05T10:00:00Z" },
  { id: "6", mood: "happy", created_at: "2024-01-06T10:00:00Z" },
  { id: "7", mood: "happy", created_at: "2024-01-07T10:00:00Z" },
  { id: "8", mood: "angry", created_at: "2024-01-08T10:00:00Z" },
  { id: "11", mood: "happy", created_at: "2024-01-11T10:00:00Z" },
  { id: "12", mood: "calm", created_at: "2024-01-12T10:00:00Z" },
];

export default function MonthlyLogPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadEntries = async () => {
      try {
        // For now, use mock data
        setEntries(MOCK_ENTRIES);
        setLoading(false);

        /* Uncomment when ready to use Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

        const { data, error } = await supabase
          .from('journal_entries')
          .select('id, mood, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setEntries(data);
        */
      } catch (err) {
        console.error("Error loading entries:", err);
        setError(err instanceof Error ? err.message : "Failed to load entries");
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [currentDate]);

  const getMoodEmoji = (mood: string | null) => {
    const moodEmojis: { [key: string]: string } = {
      happy: "😊",
      sad: "😢",
      calm: "😌",
      angry: "😤",
      anxious: "😰",
    };
    return mood ? moodEmojis[mood] || "😐" : null;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: CalendarDay[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, entry: null });
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const entry = entries.find(
        (e) => new Date(e.created_at).getDate() === day
      );
      days.push({ day, entry: entry || null });
    }

    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(
      new Date(currentDate.setMonth(currentDate.getMonth() + offset))
    );
  };

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div
        className="container mx-auto px-4 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-4xl font-bold text-gradient"
            variants={itemVariants}
          >
            Monthly Log
          </motion.h1>
          <motion.div variants={itemVariants} className="flex gap-4">
            <Link href="/journal/list" className="btn-primary">
              List View
            </Link>
            <Link href="/journal" className="btn-primary">
              Write New Entry
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-8"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="text-purple-600 hover:text-purple-700"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-semibold">
              {formatMonthYear(currentDate)}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="text-purple-600 hover:text-purple-700"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-4 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <motion.div className="grid grid-cols-7 gap-4">
            {generateCalendarDays().map((day, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`aspect-square rounded-full flex items-center justify-center ${
                  day.day
                    ? day.entry
                      ? "bg-purple-100"
                      : "bg-gray-50"
                    : "bg-transparent"
                }`}
              >
                {day.day && (
                  <Link
                    href={day.entry ? `/journal/entry/${day.entry.id}` : "#"}
                    className={`w-full h-full flex flex-col items-center justify-center ${
                      day.entry
                        ? "cursor-pointer hover:bg-purple-200 rounded-full transition-colors"
                        : ""
                    }`}
                  >
                    <span className="text-sm text-gray-600">{day.day}</span>
                    {day.entry && (
                      <span className="text-xl">
                        {getMoodEmoji(day.entry.mood)}
                      </span>
                    )}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
