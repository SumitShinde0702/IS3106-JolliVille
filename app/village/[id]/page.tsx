"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import BackArrow from "../../components/BackArrow";
import { VillageItem, initialItems } from "../../lib/villageItems";

interface User {
  id: string;
  username: string;
  points: number;
  current_streak: number;
  avatar_url: string | null;
}

const GRID_SIZE = 8;

// Function to get organized tile number based on position
const getTileNumber = (row: number, col: number, gridSize: number) => {
  const basePattern = [
    [1, 2],
    [3, 4],
  ];
  const patternRow = row % 2;
  const patternCol = col % 2;
  const baseNumber = basePattern[patternRow][patternCol];
  const section = Math.floor((row * gridSize + col) / 4) % 16;
  const tileNumber = ((baseNumber + section * 4 - 1) % 64) + 1;
  return tileNumber;
};

// Function to get tile path
const getTilePath = (tileNumber: number) => {
  return `/village-items/tiles/FieldsTile_${String(tileNumber).padStart(2, "0")}.png`;
};

// Function to get item size class
const getItemSizeClass = (itemId: string) => {
  if (itemId.startsWith("house")) return "scale-100";
  if (itemId.startsWith("tent")) return "scale-90";
  if (itemId.startsWith("decor")) return "scale-75";
  return "scale-100";
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

export default function FriendVillagePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [gridItems, setGridItems] = useState<(VillageItem | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGridSize, setCurrentGridSize] = useState(GRID_SIZE);
  const [tileNumbers, setTileNumbers] = useState(() =>
    Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (_, col) =>
        getTileNumber(row, col, GRID_SIZE)
      )
    ).flat()
  );
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadVillageData = async () => {
      try {
        // Load user profile
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id, username, points, current_streak, avatar_url")
          .eq("id", params.id)
          .single();

        if (userError) throw userError;
        if (!userData) throw new Error("User not found");

        setUser(userData);

        // Get the user's latest village layout
        const { data: layouts, error: layoutError } = await supabase
          .from("village_layouts")
          .select("id, grid_size")
          .eq("user_id", params.id)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (layoutError) throw layoutError;
        if (!layouts || layouts.length === 0) throw new Error("No village layout found");

        const layout = layouts[0];
        setCurrentGridSize(layout.grid_size || GRID_SIZE);

        // Update tile numbers for the saved grid size
        setTileNumbers(
          Array.from({ length: layout.grid_size }, (_, row) =>
            Array.from({ length: layout.grid_size }, (_, col) =>
              getTileNumber(row, col, layout.grid_size)
            )
          ).flat()
        );

        // Load placed items
        const { data: placedItems, error: itemsError } = await supabase
          .from("village_items")
          .select("item_id, grid_position")
          .eq("layout_id", layout.id);

        if (itemsError) throw itemsError;

        // Create grid items array
        const newGridItems = Array(layout.grid_size * layout.grid_size).fill(null);

        // Place items in the grid
        placedItems?.forEach((item) => {
          const itemData = initialItems.find((i) => i.id === item.item_id);
          if (itemData && item.grid_position < newGridItems.length) {
            newGridItems[item.grid_position] = itemData;
          }
        });

        setGridItems(newGridItems);
      } catch (error) {
        console.error("Error loading village:", error);
        setError(error instanceof Error ? error.message : "Failed to load village");
      } finally {
        setLoading(false);
      }
    };

    loadVillageData();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!user) return <div className="p-8">Village not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <BackArrow href="/friends" />
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-6">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">
                {user.username}'s Village
              </h1>
              <p className="text-gray-600">
                {user.points} points • {user.current_streak || '0'} days streak
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg"
        >
          <div className="relative w-[800px] mx-auto">
            <div
              className="grid gap-0 bg-gray-800 p-1 rounded-lg aspect-square relative"
              style={{
                gridTemplateColumns: `repeat(${currentGridSize}, 1fr)`,
              }}
            >
              {/* Grid Items */}
              {Array.from({ length: currentGridSize * currentGridSize }).map((_, index) => (
                <div key={index} className="aspect-square relative">
                  {/* Background Tile */}
                  <div className="absolute inset-0">
                    <Image
                      src={getTilePath(tileNumbers[index])}
                      alt="Tile"
                      fill
                      sizes="(max-width: 768px) 50px, 100px"
                      className="object-cover"
                    />
                  </div>

                  {/* Item Overlay */}
                  {gridItems[index] && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className={`relative w-full h-full transform ${getItemSizeClass(gridItems[index]!.id)}`}>
                        <Image
                          src={gridItems[index]!.image}
                          alt={gridItems[index]!.name}
                          fill
                          sizes="(max-width: 768px) 50px, 100px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
      `}</style>
    </div>
  );
} 