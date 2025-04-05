"use client";

import { ChevronDownIcon, MicrophoneIcon } from "@heroicons/react/24/solid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getCurrentUser, updateUserPoints } from '../lib/auth';

interface JournalEntry {
  id: string;
  user_id: string;
  mood: string;
  written_reflection: string;
  created_at: string;
  image_urls: string[];
}

interface UserProfile {
  id: string;
  points: number;
  last_journal_date: string | null;
  current_streak: number;
  weekly_streak: number;
  monthly_streak: number;
}

interface CongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointsEarned: number;
  totalPoints: number;
  bonusPoints: number;
}

const CongratsModal = ({ isOpen, onClose, pointsEarned, totalPoints, bonusPoints }: CongratsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">🎉 Congratulations! 🎉</h2>
          <p className="text-lg mb-4">
            You've earned <span className="font-bold text-purple-600">{pointsEarned}</span> points!
          </p>
          {bonusPoints > 0 && (
            <p className="text-lg mb-4">
              Including <span className="font-bold text-pink-600">{bonusPoints}</span> bonus points!
            </p>
          )}
          <p className="text-lg">
            Your total points: <span className="font-bold text-purple-600">{totalPoints}</span>
          </p>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="btn-primary px-8"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MIN_WORDS_FOR_POINTS = 50;
const POINTS_PER_JOURNAL = 10;
const WEEKLY_BONUS = 50;
const TWENTY_ONE_DAY_BONUS = 150;
const FORTY_EIGHT_DAY_BONUS = 250;
const MONTHLY_BONUS = 400;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    recognition: any;
  }
}

export default function JournalPage() {
  const [mood, setMood] = useState("");
  const [reflection, setReflection] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPointsGuideOpen, setIsPointsGuideOpen] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [daysUntilMilestone, setDaysUntilMilestone] = useState(0);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Set up the SpeechRecognition API
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setError("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: { resultIndex: number; results: any }) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setReflection(transcript);
    };

    recognition.onerror = (event: { error: any }) => {
      console.error("Speech recognition error", event.error);
      setError("Speech recognition error occurred. Please try again.");
      setIsRecording(false);
    };

    recognition.onaudioend = () => {
      setIsRecording(false);
    };

    window.recognition = recognition;
  }, []);

  // Handle recording button click
  const handleRecordButtonClick = () => {
    if (!window.recognition) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      window.recognition.stop();
      setIsRecording(false);
    } else {
      window.recognition.start();
      setIsRecording(true);
      setError(null);
    }
  };

  // Load user profile and calculate days until next milestone
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
          router.push('/login');
          return;
        }

        // Get extended profile data from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // If profile doesn't exist, create one
        if (!profile) {
          const newProfile = {
            id: user.id,
            points: 100,
            current_streak: 0,
            weekly_streak: 0,
            monthly_streak: 0,
            last_journal_date: null
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) return;
          
          setUserProfile(createdProfile);
        } else {
          setUserProfile(profile);
        }

        // Calculate days until next milestone
        const currentStreak = profile?.current_streak || 0;
        let nextMilestone;
        if (currentStreak < 21) {
          nextMilestone = 21;
        } else if (currentStreak < 48) {
          nextMilestone = 48;
        } else if (currentStreak < 100) {
          nextMilestone = 100;
        } else {
          nextMilestone = currentStreak + (30 - (currentStreak % 30));
        }

        const daysRemaining = nextMilestone - currentStreak;
        setDaysUntilMilestone(daysRemaining);

      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    loadUserProfile();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);

      // Create preview URLs
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images to Supabase Storage
  const uploadImages = async (files: File[]): Promise<string[]> => {
    try {
      const { user } = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const uploadPromises = files.map(async (file) => {
        try {
          // Basic sanitized filename
          const ext = file.name.split('.').pop();
          const fileName = `${Date.now()}.${ext}`;

          // Simple upload
          const { data, error } = await supabase.storage
            .from('journal_images')
            .upload(fileName, file);

          if (error) {
            console.error('Upload error:', error);
            return ''; // Return empty string for failed uploads
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('journal_images')
            .getPublicUrl(fileName);

          return publicUrl;
        } catch (error) {
          console.error('Individual file upload error:', error);
          return ''; // Return empty string for failed uploads
        }
      });

      // Filter out failed uploads (empty strings)
      const urls = (await Promise.all(uploadPromises)).filter(url => url !== '');
      return urls;
    } catch (error) {
      console.error('Upload process error:', error);
      return []; // Return empty array if entire process fails
    }
  };

  // Handle journal submission with enhanced debugging
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, error: authError } = await getCurrentUser();
      if (authError || !user) throw new Error('Not authenticated');

      // Validate required fields
      if (!mood || !reflection.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Upload images first if there are any
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await uploadImages(images);
      }

      // Create journal entry with image URLs array
      const { data: journalEntry, error: journalError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          mood,
          written_reflection: reflection,
          created_at: new Date().toISOString(),
          image_urls: uploadedImageUrls // This will be an array of strings
        })
        .select()
        .single();

      if (journalError) throw journalError;

      // Handle streak logic
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastJournalDate = userProfile?.last_journal_date ? new Date(userProfile.last_journal_date) : null;
      if (lastJournalDate) {
        lastJournalDate.setHours(0, 0, 0, 0);
      }

      let newStreak = 1; // Default for first entry or broken streak
      let newWeeklyStreak = 1; // Start or reset weekly streak
      let bonus = 0;

      if (lastJournalDate) {
        const diffDays = Math.floor((today.getTime() - lastJournalDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Last entry was yesterday, increment streaks
          newStreak = (userProfile?.current_streak || 0) + 1;
          newWeeklyStreak = (userProfile?.weekly_streak || 0) + 1;
          
          // Calculate milestone bonuses
          if (newStreak === 21) bonus = TWENTY_ONE_DAY_BONUS;
          else if (newStreak === 48) bonus = FORTY_EIGHT_DAY_BONUS;
          else if (newStreak % 30 === 0) bonus = MONTHLY_BONUS;
          
          // Add weekly bonus if applicable
          if (newWeeklyStreak === 7) {
            bonus += WEEKLY_BONUS;
            newWeeklyStreak = 0; // Reset weekly streak after bonus
          }
        } else if (diffDays === 0) {
          // Same day entry, keep current streaks
          newStreak = userProfile?.current_streak || 1;
          newWeeklyStreak = userProfile?.weekly_streak || 1;
        } else {
          // More than one day gap, reset weekly streak too
          newWeeklyStreak = 1;
        }
      }

      // Update profile with new streaks and points
      const earnedPoints = POINTS_PER_JOURNAL + bonus;
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          weekly_streak: newWeeklyStreak,
          last_journal_date: today.toISOString(),
          points: (userProfile?.points || 0) + earnedPoints
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setUserProfile(updatedProfile);
      setPointsEarned(earnedPoints);
      setBonusPoints(bonus);
      setShowCongratsModal(true);

      // Reset form
      setMood("");
      setReflection("");
      setImages([]); // Clear images array
      setImageUrls([]); // Clear image URLs
      setSuccess(true);

    } catch (error) {
      console.error('Error submitting journal:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCongratsModal = () => {
    setShowCongratsModal(false);
    router.push("/journal/list");
  };

  const moods = [
    { emoji: "😊", value: "happy", label: "Happy" },
    { emoji: "😢", value: "sad", label: "Sad" },
    { emoji: "😌", value: "calm", label: "Calm" },
    { emoji: "😤", value: "angry", label: "Angry" },
    { emoji: "😰", value: "anxious", label: "Anxious" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Daily Journal
          </h1>
          <button
            onClick={() => router.push('/journal/monthly')}
            className="px-6 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
          >
            <span>Monthly View</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Next Milestone Card */}
        <motion.div className="bg-white rounded-lg shadow-lg p-6 mb-8" variants={itemVariants}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Next Milestone</h2>
            <p className="text-gray-600">
              {userProfile?.current_streak || 0} / {
                userProfile?.current_streak !== undefined ? (
                  userProfile.current_streak < 21 ? 21 :
                  userProfile.current_streak < 48 ? 48 :
                  userProfile.current_streak < 100 ? 100 :
                  userProfile.current_streak + (30 - (userProfile.current_streak % 30))
                ) : 21
              } days
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${userProfile?.current_streak ? (
                  (userProfile.current_streak / (
                    userProfile.current_streak < 21 ? 21 :
                    userProfile.current_streak < 48 ? 48 :
                    userProfile.current_streak < 100 ? 100 :
                    userProfile.current_streak + (30 - (userProfile.current_streak % 30))
                  )) * 100
                ) : 0}%` 
              }}
            ></div>
          </div>
          <p className="text-gray-600 text-sm">
            {daysUntilMilestone} days until {
              userProfile?.current_streak !== undefined ? (
                userProfile.current_streak < 21 ? '21-day' :
                userProfile.current_streak < 48 ? '48-day' :
                userProfile.current_streak < 100 ? '100-day' :
                'next monthly'
              ) : '21-day'
            } milestone
          </p>
        </motion.div>

        {userProfile && (
          <motion.div className="card mb-8" variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current Streak</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {userProfile.current_streak} Days 🔥
                </p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Weekly Streak</h3>
                <p className="text-3xl font-bold text-pink-600">
                  {userProfile.weekly_streak} Days ⭐
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Monthly Streak</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {userProfile.monthly_streak} Days 📝
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="grid md:grid-cols-5 gap-8"
          variants={containerVariants}
        >
          {/* Journal Entry Form */}
          <motion.div className="md:col-span-3" variants={itemVariants}>
            <form onSubmit={handleSubmit} className="card">
              <h2 className="text-2xl font-semibold mb-6">
                How are you feeling today?
              </h2>

              <div className="flex gap-4 mb-6">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`p-4 rounded-lg flex flex-col items-center ${
                      mood === m.value
                        ? "bg-purple-100 ring-2 ring-purple-500"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <span className="text-sm">{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="w-full h-48 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <button
                  type="button"
                  onClick={handleRecordButtonClick}
                  className={`absolute top-2 right-2 p-2 rounded-full focus:outline-none transition-colors ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-purple-500 hover:bg-purple-600"
                  } text-white`}
                >
                  <MicrophoneIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Add images (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm mt-4">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-4 w-full justify-center"
              >
                {loading ? "Submitting..." : "Save Entry"}
              </button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div className="md:col-span-2" variants={itemVariants}>
            <div className="space-y-6">
              {/* Your Journey Card */}
              <div className="card">
                <h2 className="text-2xl font-semibold mb-6">Your Journey</h2>
                <div className="space-y-6">
                  {/* Total Points */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-600 mb-1">
                      Total Points
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {userProfile?.points || 0} pts
                    </p>
                  </div>

                  {/* Next Milestone Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Next Milestone</span>
                      <span>
                        {userProfile?.current_streak || 0} /{" "}
                        {userProfile?.current_streak || 0 < 21
                          ? "21"
                          : userProfile?.current_streak || 0 < 48
                          ? "48"
                          : "30"}{" "}
                        days
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{
                          width: `${
                            userProfile?.current_streak || 0 < 21
                              ? ((userProfile?.current_streak || 0) / 21) * 100
                              : userProfile?.current_streak || 0 < 48
                              ? ((userProfile?.current_streak || 0) / 48) * 100
                              : (((userProfile?.current_streak || 0) % 30) /
                                  30) *
                                100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {userProfile?.current_streak || 0 < 21
                        ? `${
                            21 - (userProfile?.current_streak || 0)
                          } days until 21-day milestone`
                        : userProfile?.current_streak || 0 < 48
                        ? `${
                            48 - (userProfile?.current_streak || 0)
                          } days until 48-day milestone`
                        : `${
                            30 - ((userProfile?.current_streak || 0) % 30)
                          } days until monthly bonus`}
                    </p>
                  </div>

                  {/* Weekly Progress */}
                  <div>
                    <h3 className="font-medium text-gray-600 mb-4">
                      This Week's Progress
                    </h3>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 7 }).map((_, index) => {
                        const isCompleted =
                          (userProfile?.weekly_streak || 0) % 7 > index;
                        return (
                          <div
                            key={index}
                            className={`h-8 rounded ${
                              isCompleted
                                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                : "bg-gray-200"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {7 - ((userProfile?.weekly_streak || 0) % 7)} days until
                      weekly bonus
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <h3 className="text-sm font-medium text-gray-600">
                        Longest Streak
                      </h3>
                      <p className="text-xl font-bold text-purple-600 mt-1">
                        {userProfile?.current_streak || 0} Days
                      </p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg text-center">
                      <h3 className="text-sm font-medium text-gray-600">
                        Monthly Bonus
                      </h3>
                      <p className="text-xl font-bold text-pink-600 mt-1">
                        {Math.floor((userProfile?.monthly_streak || 0) / 30)}{" "}
                        Times
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Guide Card */}
              <div className="card">
                <button
                  onClick={() => setIsPointsGuideOpen(!isPointsGuideOpen)}
                  className="w-full flex justify-between items-center"
                >
                  <h2 className="text-2xl font-semibold">Points Guide</h2>
                  <ChevronDownIcon
                    className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${
                      isPointsGuideOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isPointsGuideOpen ? "auto" : 0,
                    opacity: isPointsGuideOpen ? 1 : 0,
                    marginTop: isPointsGuideOpen ? "1.5rem" : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Daily Journal</h3>
                      <p className="text-lg font-bold text-purple-600">
                        +10 Points
                      </p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Weekly Bonus</h3>
                      <p className="text-lg font-bold text-pink-600">
                        +50 Points
                      </p>
                      <p className="text-sm text-gray-600">Every 7 days</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Special Milestones</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>21 Days</span>
                          <span className="font-bold text-blue-600">
                            +150 Points
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>48 Days</span>
                          <span className="font-bold text-blue-600">
                            +250 Points
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Monthly</span>
                          <span className="font-bold text-blue-600">
                            +400 Points
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Add the CongratsModal component */}
      <CongratsModal
        isOpen={showCongratsModal}
        onClose={handleCloseCongratsModal}
        pointsEarned={pointsEarned}
        totalPoints={userProfile?.points || 0}
        bonusPoints={bonusPoints}
      />
    </div>
  );
}
