"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface JournalEntry {
  id: string;
  user_id: string;
  mood: string;
  written_reflection: string;
  created_at: string;
  image_urls: string[];
  audio_url?: string;
  transcription?: string;
}

interface UserProfile {
  id: string;
  points: number;
  last_journal_date: string | null;
  current_streak: number;
  weekly_streak: number;
  monthly_streak: number;
}

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

// Add mock user data
const MOCK_USER = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
};

const MOCK_PROFILE = {
  id: MOCK_USER.id,
  points: 100,
  last_journal_date: null,
  current_streak: 0,
  weekly_streak: 0,
  monthly_streak: 0,
};

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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Modify the loadUserProfile function
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Comment out Supabase auth and data fetching for now
        /*
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting current user:', userError);
          throw userError;
        }
        if (!user) {
          console.error('No user found');
          throw new Error('No user found');
        }

        // Get profile directly from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }
        */

        // Use mock data instead
        const user = MOCK_USER;
        console.log("Using mock user:", user);
        setUserProfile(MOCK_PROFILE);
        console.log("Using mock profile:", MOCK_PROFILE);
      } catch (err) {
        console.error("Error in loadUserProfile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      }
    };
    loadUserProfile();
  }, []);

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

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-image`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      uploadedUrls.push(data.url);
    }

    return uploadedUrls;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        "Failed to start recording. Please check your microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/upload-audio`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload audio");
    }

    const data = await response.json();
    return data.url;
  };

  const transcribeAudio = async (audioUrl: string): Promise<string> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transcribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ audioUrl }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to transcribe audio");
    }

    const data = await response.json();
    return data.transcription;
  };

  const calculateStreakBonus = async (
    userId: string,
    lastJournalDate: string | null
  ): Promise<number> => {
    const today = new Date();
    const lastDate = lastJournalDate ? new Date(lastJournalDate) : null;

    // If no last journal date, start new streak
    if (!lastDate) {
      await supabase
        .from("profiles")
        .update({
          current_streak: 1,
          weekly_streak: 1,
          monthly_streak: 1,
          last_journal_date: today.toISOString(),
        })
        .eq("id", userId);
      return 0;
    }

    // Check if streak is broken (more than 1 day gap)
    const daysSinceLastEntry = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastEntry > 1) {
      // Reset streaks
      await supabase
        .from("profiles")
        .update({
          current_streak: 1,
          weekly_streak: 1,
          monthly_streak: 1,
          last_journal_date: today.toISOString(),
        })
        .eq("id", userId);
      return 0;
    }

    // Update streaks
    const newCurrentStreak = (userProfile?.current_streak || 0) + 1;
    const newWeeklyStreak = (userProfile?.weekly_streak || 0) + 1;
    const newMonthlyStreak = (userProfile?.monthly_streak || 0) + 1;

    // Calculate bonus points
    let bonusPoints = 0;

    // Weekly bonus (every 7 days)
    if (newWeeklyStreak % 7 === 0) {
      bonusPoints += WEEKLY_BONUS;
    }

    // 21-day bonus
    if (newCurrentStreak === 21) {
      bonusPoints += TWENTY_ONE_DAY_BONUS;
    }

    // 48-day bonus
    if (newCurrentStreak === 48) {
      bonusPoints += FORTY_EIGHT_DAY_BONUS;
    }

    // Monthly bonus (every 30 days)
    if (newMonthlyStreak % 30 === 0) {
      bonusPoints += MONTHLY_BONUS;
    }

    // Update streaks in database
    await supabase
      .from("profiles")
      .update({
        current_streak: newCurrentStreak,
        weekly_streak: newWeeklyStreak,
        monthly_streak: newMonthlyStreak,
        last_journal_date: today.toISOString(),
      })
      .eq("id", userId);

    return bonusPoints;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setBonusPoints(0);

    try {
      const user = MOCK_USER;

      // Validation logic
      if (!mood || (!reflection && !audioBlob)) {
        throw new Error(
          "Please fill in all required fields and provide either text or audio reflection"
        );
      }

      if (reflection) {
        const wordCount = reflection.trim().split(/\s+/).length;
        if (wordCount < MIN_WORDS_FOR_POINTS) {
          throw new Error(
            `Your reflection must be at least ${MIN_WORDS_FOR_POINTS} words to receive points`
          );
        }
      }

      // Mock successful submission
      const mockBonusPoints = 50; // Example bonus points
      const totalPoints = POINTS_PER_JOURNAL + mockBonusPoints;

      // Update mock profile
      const updatedProfile = {
        ...MOCK_PROFILE,
        points: MOCK_PROFILE.points + totalPoints,
        current_streak: MOCK_PROFILE.current_streak + 1,
        weekly_streak: MOCK_PROFILE.weekly_streak + 1,
        monthly_streak: MOCK_PROFILE.monthly_streak + 1,
        last_journal_date: new Date().toISOString(),
      };

      // Update local state with mock data
      setUserProfile(updatedProfile);
      setBonusPoints(mockBonusPoints);
      setSuccess(true);

      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push("/journal/list");
      }, 1500);

      /* Comment out actual Supabase operations
      // Handle audio upload and transcription
      let audioUrl = '';
      let transcribedText = '';
      if (audioBlob) {
        const audioFileName = `${user.id}/${Date.now()}.webm`;
        const { data: audioData, error: audioError } = await supabase.storage
          .from('journal-audio')
          .upload(audioFileName, audioBlob);
        
        if (audioError) throw audioError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('journal-audio')
          .getPublicUrl(audioFileName);
          
        audioUrl = publicUrl;
      }

      // Upload images
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        for (const image of images) {
          const fileName = `${user.id}/${Date.now()}-${image.name}`;
          const { data: imageData, error: imageError } = await supabase.storage
            .from('journal-images')
            .upload(fileName, image);
            
          if (imageError) throw imageError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('journal-images')
            .getPublicUrl(fileName);
            
          uploadedImageUrls.push(publicUrl);
        }
      }

      // Insert journal entry
      const { data: journalEntry, error: journalError } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: user.id,
          mood,
          written_reflection: reflection || transcribedText,
          image_urls: uploadedImageUrls,
          audio_url: audioUrl,
          transcription: transcribedText,
        }])
        .select()
        .single();

      if (journalError) throw journalError;

      // Update user's points
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          points: (userProfile?.points || 0) + totalPoints 
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      */

      // Reset form
      setMood("");
      setReflection("");
      setImages([]);
      setImageUrls([]);
      setAudioBlob(null);
      setTranscription("");
    } catch (err) {
      console.error("Error submitting journal:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
      <motion.div
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-bold mb-8 text-gradient"
          variants={itemVariants}
        >
          Daily Journal
        </motion.h1>

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

              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full h-48 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />

              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isRecording
                      ? "bg-red-500 text-white"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <span>Stop Recording</span>
                      <span className="animate-pulse">🔴</span>
                    </>
                  ) : (
                    <>
                      <span>Start Recording</span>
                      <span>🎤</span>
                    </>
                  )}
                </button>
                {audioBlob && !isRecording && (
                  <div className="flex items-center gap-2 flex-1">
                    <audio
                      controls
                      src={URL.createObjectURL(audioBlob)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAudioBlob(null);
                        setTranscription("");
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete recording"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
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

              {success && (
                <div className="text-green-500 text-sm mt-4">
                  Journal entry submitted successfully! You earned{" "}
                  {POINTS_PER_JOURNAL} points.
                  {bonusPoints > 0 && (
                    <span className="block mt-1">
                      Bonus points earned: {bonusPoints} points for maintaining
                      your streak!
                    </span>
                  )}
                </div>
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
                <h2 className="text-2xl font-semibold mb-6">Points Guide</h2>
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
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
