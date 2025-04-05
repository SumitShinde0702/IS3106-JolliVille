"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/auth";

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  current_streak: number;
  avatar_url: string | null;
}

interface SearchUser {
  id: string;
  username: string;
  points: number;
  current_streak: number;
  avatar_url: string | null;
}

interface Friend {
  id: string;
  follower_id: string;
  following_id: string;
  following: SearchUser;
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

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<SearchUser[]>([]);
  const [currentFriends, setCurrentFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setCurrentUser(user as unknown as User);

        // Load current friends
        const { data: friendsData, error: friendsError } = await supabase
          .from("friends")
          .select(`
            id,
            follower_id,
            following_id,
            following:profiles!following_id (
              id,
              username,
              points,
              current_streak,
              avatar_url
            )
          `)
          .eq("follower_id", user.id);

        if (friendsError) {
          console.error("Error fetching friends:", friendsError);
          throw friendsError;
        }

        setCurrentFriends((friendsData || []) as unknown as Friend[]);

        // Load suggested friends
        const pointRange = {
          min: Math.max(0, user.points - 100),
          max: user.points + 100,
        };

        const { data: suggestedData, error: suggestedError } = await supabase
          .from("profiles")
          .select("id, username, points, current_streak, avatar_url")
          .neq("id", user.id)
          .gte("points", pointRange.min)
          .lte("points", pointRange.max)
          .limit(4);

        if (suggestedError) {
          console.error("Error fetching suggested friends:", suggestedError);
          throw suggestedError;
        }

        setSuggestedFriends((suggestedData || []) as unknown as SearchUser[]);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, points, current_streak, avatar_url")
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .neq("id", currentUser.id)
        .limit(5);

      if (error) {
        console.error("Error searching users:", error);
        return;
      }

      setSearchResults((data || []) as unknown as SearchUser[]);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("friends")
        .insert([
          {
            follower_id: currentUser.id,
            following_id: userId,
          }
        ])
        .select(`
          id,
          follower_id,
          following_id,
          following:profiles!following_id (
            id,
            username,
            points,
            current_streak,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error("Error following user:", error);
        return;
      }

      setCurrentFriends([...currentFriends, data as unknown as Friend]);
      setSuggestedFriends(suggestedFriends.filter(friend => friend.id !== userId));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (friendId: string) => {
    try {
      await supabase
        .from("friends")
        .delete()
        .eq("id", friendId);

      setCurrentFriends(currentFriends.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold mb-8 text-gradient">Friends</h1>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          variants={itemVariants}
          className="mb-12"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Find Friends</h2>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-white/70 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.points} points</p>
                      </div>
                    </div>
                    {!currentFriends.some(friend => friend.following.id === user.id) && (
                      <button
                        onClick={() => handleFollow(user.id)}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm hover:opacity-90 transition-opacity"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Suggested Friends */}
        {suggestedFriends.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="mb-12"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Suggested Friends</h2>
              <p className="text-gray-600 mb-6">Users with similar points to you</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestedFriends.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/70 p-4 rounded-lg"
                  >
                    <div className="flex flex-col items-center text-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-16 h-16 rounded-full object-cover mb-3"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold mb-3">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="font-medium mb-1">{user.username}</p>
                      <p className="text-sm text-gray-500 mb-3">{user.points} points</p>
                      {!currentFriends.some(friend => friend.following.id === user.id) && (
                        <button
                          onClick={() => handleFollow(user.id)}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm hover:opacity-90 transition-opacity w-full"
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Friends */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Following</h2>
            {currentFriends.length === 0 ? (
              <p className="text-gray-500">You're not following anyone yet</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {currentFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white/70 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {friend.following.avatar_url ? (
                        <img
                          src={friend.following.avatar_url}
                          alt={friend.following.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {friend.following.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{friend.following.username}</p>
                        <p className="text-sm text-gray-500">
                          {friend.following.points} points • {friend.following.current_streak || '0'} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/village/${friend.following.id}`}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm hover:opacity-90 transition-opacity min-w-[140px] text-center"
                      >
                        Visit Village
                      </Link>
                      <button
                        onClick={() => handleUnfollow(friend.id)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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