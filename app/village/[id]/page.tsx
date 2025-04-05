"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import BackArrow from "../../components/BackArrow";
import { VillageItem } from "../../lib/villageItems";
import { shopItems } from "../../lib/shopItems";

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
      console.log("Loading village data for user:", params.id);
      try {
        // Load user profile
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, points, current_streak, avatar_url")
          .eq("id", params.id)
          .limit(1);

        if (profileError) throw profileError;
        if (!profiles || profiles.length === 0) {
          setError("User not found");
          return;
        }

        console.log("Loaded user profile:", profiles[0]);
        setUser(profiles[0]);

        // Load latest village layout
        const { data: layouts, error: layoutError } = await supabase
          .from("village_layouts")
          .select("id, grid_size")
          .eq("user_id", params.id)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (layoutError) throw layoutError;
        if (!layouts || layouts.length === 0) {
          setError("Village layout not found");
          return;
        }

        const layout = layouts[0];
        console.log("Loaded layout:", layout);
        setCurrentGridSize(layout.grid_size || GRID_SIZE);

        // Load placed items and owned items in parallel
        const [placedItemsResult, ownedItemsResult] = await Promise.all([
          supabase
            .from("village_items")
            .select("item_id, grid_position")
            .eq("layout_id", layout.id),
          supabase
            .from("owned_items")
            .select("item_id")
            .eq("user_id", params.id)
        ]);

        const { data: placedItems, error: itemsError } = placedItemsResult;
        const { data: ownedItems, error: ownedError } = ownedItemsResult;

        if (itemsError) throw itemsError;
        if (ownedError) throw ownedError;

        console.log("Loaded placed items:", placedItems);
        console.log("Loaded owned items:", ownedItems);

        // Create sets for efficient lookup
        const ownedItemIds = new Set(ownedItems?.map(item => item.item_id) || []);
        const starterItems = shopItems.filter(item => item.isStarter).map(item => item.id);
        starterItems.forEach(id => ownedItemIds.add(id));

        console.log("All owned items (including starters):", Array.from(ownedItemIds));
        console.log("Placed items:", placedItems);

        // Place items in grid
        const savedGridSize = layout.grid_size || GRID_SIZE;
        const newGridItems = Array(savedGridSize * savedGridSize).fill(null);
        if (placedItems && placedItems.length > 0) {
          placedItems.forEach((item) => {
            const itemData = shopItems.find((i) => i.id === item.item_id);
            console.log("Processing item:", item.item_id);
            console.log("Found in shopItems:", !!itemData);
            console.log("Position in bounds:", item.grid_position < newGridItems.length);
            console.log("Is owned:", ownedItemIds.has(item.item_id));
            
            if (itemData && item.grid_position < newGridItems.length && ownedItemIds.has(item.item_id)) {
              newGridItems[item.grid_position] = itemData;
            }
          });
        }

        console.log("Final grid items:", newGridItems.filter(Boolean));
        setGridItems(newGridItems);
        setLoading(false);
      } catch (error) {
        console.error("Error loading village data:", error);
        setError("Error loading village data");
        setLoading(false);
      }
    };

    loadVillageData();
  }, [params.id]);

  useEffect(() => {
    // Update tile numbers when grid size changes
    setTileNumbers(
      Array.from({ length: currentGridSize * currentGridSize }, (_, index) => {
        const row = Math.floor(index / currentGridSize);
        const col = index % currentGridSize;
        return getTileNumber(row, col, currentGridSize);
      })
    );
  }, [currentGridSize]);

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
                      alt={`Tile ${tileNumbers[index]}`}
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