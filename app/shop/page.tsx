"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getCurrentUser, updateUserPoints } from "../lib/auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import BackArrow from "../components/BackArrow";
import withUserOnly from "../utils/preventAdmin";

interface ShopItem {
  id: string;
  name: string;
  image: string;
  category: "houses" | "tents" | "decor" | "archer-towers";
  subCategory?: "greenery" | "stones" | "trees" | "general";
  price: number;
  description: string;
  isStarter?: boolean;
}

interface Bundle {
  id: string;
  name: string;
  items: ShopItem[];
  totalPrice: number;
  discountedPrice: number;
  expiresAt: Date;
}

// Initial items with prices
const initialItems: ShopItem[] = [
  // Houses - Based on visual complexity and luxury
  {
    id: "house-1",
    name: "Noble Manor",
    image: "/village-items/houses/1.png",
    category: "houses",
    price: 100,
    description: "A prestigious noble estate",
    isStarter: true,
  },
  {
    id: "house-2",
    name: "Cozy Cabin",
    image: "/village-items/houses/2.png",
    category: "houses",
    price: 150,
    description: "A comfortable family home",
    isStarter: true,
  },
  {
    id: "house-3",
    name: "Modest House",
    image: "/village-items/houses/3.png",
    category: "houses",
    price: 200,
    description: "A simple but elegant residence",
  },
  {
    id: "house-4",
    name: "Charming Home",
    image: "/village-items/houses/4.png",
    category: "houses",
    price: 250,
    description: "A quaint and lovely dwelling",
  },
  {
    id: "house-5",
    name: "Elegant Manor",
    image: "/village-items/houses/5.png",
    category: "houses",
    price: 300,
    description: "A refined and sophisticated home",
  },
  {
    id: "house-6",
    name: "Grand Estate",
    image: "/village-items/houses/6.png",
    category: "houses",
    price: 350,
    description: "A magnificent family estate",
  },
  {
    id: "house-7",
    name: "Royal Palace",
    image: "/village-items/houses/7.png",
    category: "houses",
    price: 400,
    description: "A majestic royal residence",
  },
  {
    id: "house-8",
    name: "Simple Cottage",
    image: "/village-items/houses/8.png",
    category: "houses",
    price: 450,
    description: "A humble dwelling",
  },
  {
    id: "house-9",
    name: "Imperial Castle",
    image: "/village-items/houses/9.png",
    category: "houses",
    price: 500,
    description: "A grand imperial fortress",
  },
  {
    id: "house-10",
    name: "Royal Castle",
    image: "/village-items/houses/10.png",
    category: "houses",
    price: 550,
    description: "A splendid royal castle",
  },
  {
    id: "house-11",
    name: "Imperial Palace",
    image: "/village-items/houses/11.png",
    category: "houses",
    price: 600,
    description: "An imperial palace of grandeur",
  },
  {
    id: "house-12",
    name: "Royal Fortress",
    image: "/village-items/houses/12.png",
    category: "houses",
    price: 650,
    description: "A fortified royal residence",
  },
  {
    id: "house-13",
    name: "Mystical Castle",
    image: "/village-items/houses/13.png",
    category: "houses",
    price: 700,
    description: "A castle shrouded in mystery",
  },
  {
    id: "house-14",
    name: "Enchanted Palace",
    image: "/village-items/houses/14.png",
    category: "houses",
    price: 750,
    description: "A palace touched by magic",
  },
  {
    id: "house-15",
    name: "Mystical Manor",
    image: "/village-items/houses/15.png",
    category: "houses",
    price: 800,
    description: "A manor of mystical power",
  },
  {
    id: "house-16",
    name: "Legendary Castle",
    image: "/village-items/houses/16.png",
    category: "houses",
    price: 850,
    description: "A castle of legendary renown",
  },
  {
    id: "house-17",
    name: "Ancient Citadel",
    image: "/village-items/houses/17.png",
    category: "houses",
    price: 900,
    description: "An ancient fortified city",
  },
  {
    id: "house-18",
    name: "Divine Palace",
    image: "/village-items/houses/18.png",
    category: "houses",
    price: 950,
    description: "A palace blessed by the gods",
  },
  {
    id: "house-19",
    name: "Celestial Castle",
    image: "/village-items/houses/19.png",
    category: "houses",
    price: 1000,
    description: "A castle from the heavens",
  },
  {
    id: "house-20",
    name: "Ethereal Mansion",
    image: "/village-items/houses/20.png",
    category: "houses",
    price: 1050,
    description: "A mansion of ethereal beauty",
  },
  {
    id: "house-21",
    name: "Mythical Palace",
    image: "/village-items/houses/21.png",
    category: "houses",
    price: 1100,
    description: "A palace from myths",
  },
  {
    id: "house-22",
    name: "Legendary Citadel",
    image: "/village-items/houses/22.png",
    category: "houses",
    price: 1150,
    description: "A citadel of legends",
  },
  {
    id: "house-23",
    name: "Celestial Palace",
    image: "/village-items/houses/23.png",
    category: "houses",
    price: 1200,
    description: "A palace from the stars",
  },
  {
    id: "house-24",
    name: "Ethereal Castle",
    image: "/village-items/houses/24.png",
    category: "houses",
    price: 1250,
    description: "A castle of ethereal grace",
  },
  {
    id: "house-25",
    name: "Mythical Fortress",
    image: "/village-items/houses/25.png",
    category: "houses",
    price: 1300,
    description: "A fortress from myths",
  },
  {
    id: "house-26",
    name: "Divine Citadel",
    image: "/village-items/houses/26.png",
    category: "houses",
    price: 1350,
    description: "A citadel blessed by divinity",
  },
  {
    id: "house-27",
    name: "Legendary Palace",
    image: "/village-items/houses/27.png",
    category: "houses",
    price: 1400,
    description: "A palace of legendary status",
  },

  // Tents - Based on size and complexity
  {
    id: "tent-1",
    name: "Basic Tent",
    image: "/village-items/tents/1.png",
    category: "tents",
    price: 50,
    description: "A simple camping tent",
    isStarter: true,
  },
  {
    id: "tent-2",
    name: "Comfortable Tent",
    image: "/village-items/tents/2.png",
    category: "tents",
    price: 75,
    description: "A cozy camping tent",
  },
  {
    id: "tent-3",
    name: "Deluxe Tent",
    image: "/village-items/tents/3.png",
    category: "tents",
    price: 100,
    description: "A spacious camping tent",
  },
  {
    id: "tent-4",
    name: "Luxury Tent",
    image: "/village-items/tents/4.png",
    category: "tents",
    price: 125,
    description: "A luxurious camping tent",
  },
  {
    id: "tent-5",
    name: "Premium Tent",
    image: "/village-items/tents/5.png",
    category: "tents",
    price: 150,
    description: "A premium camping tent",
  },
  {
    id: "tent-6",
    name: "Elite Tent",
    image: "/village-items/tents/6.png",
    category: "tents",
    price: 175,
    description: "An elite camping tent",
  },

  // Archer Towers - Based on defensive capabilities
  {
    id: "tower-1",
    name: "Basic Tower",
    image: "/village-items/archer-towers/1.png",
    category: "archer-towers",
    price: 200,
    description: "A simple defensive tower",
    isStarter: true,
  },
  {
    id: "tower-2",
    name: "Improved Tower",
    image: "/village-items/archer-towers/2.png",
    category: "archer-towers",
    price: 300,
    description: "An enhanced defensive tower",
  },
  {
    id: "tower-4",
    name: "Advanced Tower",
    image: "/village-items/archer-towers/4.png",
    category: "archer-towers",
    price: 400,
    description: "A sophisticated defensive tower",
  },
  {
    id: "tower-7",
    name: "Elite Tower",
    image: "/village-items/archer-towers/7.png",
    category: "archer-towers",
    price: 500,
    description: "An elite defensive tower",
  },

  // Decor Items - Based on visual complexity and rarity
  {
    id: "decor-1",
    name: "Simple Ornament",
    image: "/village-items/decor/decor_1.png",
    category: "decor",
    subCategory: "general",
    price: 25,
    description: "A basic decorative item",
    isStarter: true,
  },
  {
    id: "decor-2",
    name: "Elegant Ornament",
    image: "/village-items/decor/decor_2.png",
    category: "decor",
    subCategory: "general",
    price: 30,
    description: "A refined decorative piece",
  },
  {
    id: "decor-3",
    name: "Charming Decoration",
    image: "/village-items/decor/decor_3.png",
    category: "decor",
    subCategory: "general",
    price: 35,
    description: "A charming decorative item",
  },
  {
    id: "decor-4",
    name: "Lovely Ornament",
    image: "/village-items/decor/decor_4.png",
    category: "decor",
    subCategory: "general",
    price: 40,
    description: "A lovely decorative piece",
  },
  {
    id: "decor-5",
    name: "Fancy Decoration",
    image: "/village-items/decor/decor_5.png",
    category: "decor",
    subCategory: "general",
    price: 45,
    description: "A fancy decorative item",
  },
  {
    id: "decor-6",
    name: "Beautiful Ornament",
    image: "/village-items/decor/decor_6.png",
    category: "decor",
    subCategory: "general",
    price: 50,
    description: "A beautiful decorative piece",
  },
  {
    id: "decor-7",
    name: "Exquisite Decoration",
    image: "/village-items/decor/decor_7.png",
    category: "decor",
    subCategory: "general",
    price: 55,
    description: "An exquisite decorative item",
  },
  {
    id: "decor-8",
    name: "Luxurious Ornament",
    image: "/village-items/decor/decor_8.png",
    category: "decor",
    subCategory: "general",
    price: 60,
    description: "A luxurious decorative piece",
  },
  {
    id: "decor-9",
    name: "Premium Decoration",
    image: "/village-items/decor/decor_9.png",
    category: "decor",
    subCategory: "general",
    price: 65,
    description: "A premium decorative item",
  },
  {
    id: "decor-10",
    name: "Majestic Ornament",
    image: "/village-items/decor/decor_10.png",
    category: "decor",
    subCategory: "general",
    price: 70,
    description: "A majestic decorative piece",
  },
  {
    id: "decor-11",
    name: "Royal Decoration",
    image: "/village-items/decor/decor_11.png",
    category: "decor",
    subCategory: "general",
    price: 75,
    description: "A royal decorative item",
  },
  {
    id: "decor-12",
    name: "Imperial Ornament",
    image: "/village-items/decor/decor_12.png",
    category: "decor",
    subCategory: "general",
    price: 80,
    description: "An imperial decorative piece",
  },
  {
    id: "decor-13",
    name: "Mystical Decoration",
    image: "/village-items/decor/decor_13.png",
    category: "decor",
    subCategory: "general",
    price: 85,
    description: "A mystical decorative item",
  },
  {
    id: "decor-14",
    name: "Enchanted Ornament",
    image: "/village-items/decor/decor_14.png",
    category: "decor",
    subCategory: "general",
    price: 90,
    description: "An enchanted decorative piece",
  },
  {
    id: "decor-15",
    name: "Legendary Decoration",
    image: "/village-items/decor/decor_15.png",
    category: "decor",
    subCategory: "general",
    price: 95,
    description: "A legendary decorative item",
  },
  {
    id: "decor-16",
    name: "Divine Ornament",
    image: "/village-items/decor/decor_16.png",
    category: "decor",
    subCategory: "general",
    price: 100,
    description: "A divine decorative piece",
  },
  {
    id: "decor-17",
    name: "Celestial Decoration",
    image: "/village-items/decor/decor_17.png",
    category: "decor",
    subCategory: "general",
    price: 105,
    description: "A celestial decorative item",
  },
  {
    id: "decor-18",
    name: "Ethereal Ornament",
    image: "/village-items/decor/decor_18.png",
    category: "decor",
    subCategory: "general",
    price: 110,
    description: "An ethereal decorative piece",
  },
  {
    id: "decor-19",
    name: "Mystical Ornament",
    image: "/village-items/decor/decor_19.png",
    category: "decor",
    subCategory: "general",
    price: 115,
    description: "A mystical decorative item",
  },
  {
    id: "decor-20",
    name: "Enchanted Decoration",
    image: "/village-items/decor/decor_20.png",
    category: "decor",
    subCategory: "general",
    price: 120,
    description: "An enchanted decorative piece",
  },
  {
    id: "decor-21",
    name: "Legendary Ornament",
    image: "/village-items/decor/decor_21.png",
    category: "decor",
    subCategory: "general",
    price: 125,
    description: "A legendary decorative item",
  },

  // Trees - Based on size and visual complexity
  {
    id: "tree-1",
    name: "Majestic Tree",
    image: "/village-items/decor/tree_1.png",
    category: "decor",
    subCategory: "trees",
    price: 40,
    description: "A grand and majestic tree",
  },
  {
    id: "tree-2",
    name: "Ancient Tree",
    image: "/village-items/decor/tree_2.png",
    category: "decor",
    subCategory: "trees",
    price: 45,
    description: "An ancient and wise tree",
  },
  {
    id: "tree-3",
    name: "Mystical Tree",
    image: "/village-items/decor/tree_3.png",
    category: "decor",
    subCategory: "trees",
    price: 50,
    description: "A tree of mystical power",
  },
  {
    id: "tree-4",
    name: "Enchanted Tree",
    image: "/village-items/decor/tree_4.png",
    category: "decor",
    subCategory: "trees",
    price: 55,
    description: "A tree touched by magic",
  },
  {
    id: "tree-5",
    name: "Magical Tree",
    image: "/village-items/decor/tree_5.png",
    category: "decor",
    subCategory: "trees",
    price: 60,
    description: "A tree of magical essence",
  },
  {
    id: "tree-6",
    name: "Sacred Tree",
    image: "/village-items/decor/tree_6.png",
    category: "decor",
    subCategory: "trees",
    price: 65,
    description: "A tree of sacred power",
  },
  {
    id: "tree-7",
    name: "Divine Tree",
    image: "/village-items/decor/tree_7.png",
    category: "decor",
    subCategory: "trees",
    price: 70,
    description: "A tree blessed by divinity",
  },
  {
    id: "tree-8",
    name: "Celestial Tree",
    image: "/village-items/decor/tree_8.png",
    category: "decor",
    subCategory: "trees",
    price: 75,
    description: "A tree from the heavens",
  },
  {
    id: "tree-9",
    name: "Ethereal Tree",
    image: "/village-items/decor/tree_9.png",
    category: "decor",
    subCategory: "trees",
    price: 80,
    description: "A tree of ethereal beauty",
  },
  {
    id: "tree-10",
    name: "Mythical Tree",
    image: "/village-items/decor/tree_10.png",
    category: "decor",
    subCategory: "trees",
    price: 85,
    description: "A tree from myths",
  },
  {
    id: "tree-11",
    name: "Legendary Tree",
    image: "/village-items/decor/tree_11.png",
    category: "decor",
    subCategory: "trees",
    price: 90,
    description: "A tree of legendary status",
  },
  {
    id: "tree-12",
    name: "Primordial Tree",
    image: "/village-items/decor/tree_12.png",
    category: "decor",
    subCategory: "trees",
    price: 95,
    description: "A tree from the beginning of time",
  },
  {
    id: "tree-13",
    name: "World Tree",
    image: "/village-items/decor/tree_13.png",
    category: "decor",
    subCategory: "trees",
    price: 100,
    description: "A tree that holds the world",
  },
  {
    id: "tree-14",
    name: "Cosmic Tree",
    image: "/village-items/decor/tree_14.png",
    category: "decor",
    subCategory: "trees",
    price: 105,
    description: "A tree that spans the cosmos",
  },

  // Stones - Based on size and visual complexity
  {
    id: "stone-1",
    name: "Simple Stone",
    image: "/village-items/decor/stones_1.png",
    category: "decor",
    subCategory: "stones",
    price: 20,
    description: "A basic decorative stone",
  },
  {
    id: "stone-2",
    name: "Mystical Stone",
    image: "/village-items/decor/stones_2.png",
    category: "decor",
    subCategory: "stones",
    price: 25,
    description: "A stone of mystical power",
  },
  {
    id: "stone-3",
    name: "Ancient Stone",
    image: "/village-items/decor/stones_3.png",
    category: "decor",
    subCategory: "stones",
    price: 30,
    description: "A stone from ancient times",
  },
  {
    id: "stone-4",
    name: "Magical Stone",
    image: "/village-items/decor/stones_4.png",
    category: "decor",
    subCategory: "stones",
    price: 35,
    description: "A stone of magical essence",
  },
  {
    id: "stone-5",
    name: "Enchanted Stone",
    image: "/village-items/decor/stones_5.png",
    category: "decor",
    subCategory: "stones",
    price: 40,
    description: "A stone touched by magic",
  },
  {
    id: "stone-6",
    name: "Legendary Stone",
    image: "/village-items/decor/stones_6.png",
    category: "decor",
    subCategory: "stones",
    price: 45,
    description: "A stone of legendary power",
  },
  {
    id: "stone-7",
    name: "Divine Stone",
    image: "/village-items/decor/stones_7.png",
    category: "decor",
    subCategory: "stones",
    price: 50,
    description: "A stone blessed by divinity",
  },

  // Greenery - Based on visual complexity and rarity
  {
    id: "greenery-1",
    name: "Simple Plant",
    image: "/village-items/decor/greenery_1.png",
    category: "decor",
    subCategory: "greenery",
    price: 30,
    description: "A basic decorative plant",
  },
  {
    id: "greenery-2",
    name: "Vibrant Bush",
    image: "/village-items/decor/greenery_2.png",
    category: "decor",
    subCategory: "greenery",
    price: 35,
    description: "A colorful decorative bush",
  },
  {
    id: "greenery-3",
    name: "Exotic Plant",
    image: "/village-items/decor/greenery_3.png",
    category: "decor",
    subCategory: "greenery",
    price: 40,
    description: "An exotic decorative plant",
  },
  {
    id: "greenery-4",
    name: "Mystical Plant",
    image: "/village-items/decor/greenery_4.png",
    category: "decor",
    subCategory: "greenery",
    price: 45,
    description: "A plant of mystical power",
  },
  {
    id: "greenery-5",
    name: "Enchanted Plant",
    image: "/village-items/decor/greenery_5.png",
    category: "decor",
    subCategory: "greenery",
    price: 50,
    description: "A plant touched by magic",
  },
  {
    id: "greenery-6",
    name: "Rare Plant",
    image: "/village-items/decor/greenery_6.png",
    category: "decor",
    subCategory: "greenery",
    price: 55,
    description: "A rare decorative plant",
  },
  {
    id: "greenery-7",
    name: "Exotic Bush",
    image: "/village-items/decor/greenery_7.png",
    category: "decor",
    subCategory: "greenery",
    price: 60,
    description: "An exotic decorative bush",
  },
  {
    id: "greenery-8",
    name: "Magical Shrub",
    image: "/village-items/decor/greenery_8.png",
    category: "decor",
    subCategory: "greenery",
    price: 65,
    description: "A shrub of magical essence",
  },
  {
    id: "greenery-9",
    name: "Enchanted Bush",
    image: "/village-items/decor/greenery_9.png",
    category: "decor",
    subCategory: "greenery",
    price: 70,
    description: "A bush touched by magic",
  },
  {
    id: "greenery-10",
    name: "Mystical Plant",
    image: "/village-items/decor/greenery_10.png",
    category: "decor",
    subCategory: "greenery",
    price: 75,
    description: "A plant of mystical power",
  },
  {
    id: "greenery-11",
    name: "Sacred Bush",
    image: "/village-items/decor/greenery_11.png",
    category: "decor",
    subCategory: "greenery",
    price: 80,
    description: "A bush of sacred power",
  },
  {
    id: "greenery-12",
    name: "Divine Plant",
    image: "/village-items/decor/greenery_12.png",
    category: "decor",
    subCategory: "greenery",
    price: 85,
    description: "A plant blessed by divinity",
  },
  {
    id: "greenery-13",
    name: "Celestial Shrub",
    image: "/village-items/decor/greenery_13.png",
    category: "decor",
    subCategory: "greenery",
    price: 90,
    description: "A shrub from the heavens",
  },
  {
    id: "greenery-14",
    name: "Ethereal Plant",
    image: "/village-items/decor/greenery_14.png",
    category: "decor",
    subCategory: "greenery",
    price: 95,
    description: "A plant of ethereal beauty",
  },

  // Lake - Special feature
  {
    id: "lake-1",
    name: "Serene Lake",
    image: "/village-items/decor/lake.png",
    category: "decor",
    subCategory: "general",
    price: 200,
    description: "A peaceful lake for your village",
  },
];

function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<
    "houses" | "tents" | "decor" | "archer-towers" | "bundles"
  >("houses");
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    "greenery" | "stones" | "trees" | "general" | "all"
  >("all");
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());
  const [currentBundle, setCurrentBundle] = useState<Bundle | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1200]);
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name">(
    "name"
  );
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [pointsChange, setPointsChange] = useState<number | null>(null);
  const supabase = createClientComponentClient();

  // Load user data and points
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user, error } = await getCurrentUser();
        if (error) {
          console.error("Error getting user:", error);
          return;
        }
        if (user) {
          // First ensure user exists in profiles table
          const { data: profile, error: profileCheckError } = await supabase
            .from("profiles")
            .select("id, points")
            .eq("id", user.id)
            .single();

          if (profileCheckError) {
            // If profile doesn't exist, create it
            const { data: newProfile, error: createProfileError } =
              await supabase
                .from("profiles")
                .insert([
                  {
                    id: user.id,
                    points: 1000, // Starting points
                    updated_at: new Date().toISOString(),
                  },
                ])
                .select()
                .single();

            if (createProfileError) {
              console.error("Error creating profile:", createProfileError);
              return;
            }

            setPoints(1000); // Set initial points
            // Load owned items with the new profile id
            await loadOwnedItems(user.id);
          } else {
            setPoints(profile?.points || 0);
            // Load owned items with existing profile id
            await loadOwnedItems(profile.id);
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Add this function after loadOwnedItems
  const initializeStarterItems = async (userId: string) => {
    try {
      // Get all starter items
      const starterItems = initialItems.filter((item) => item.isStarter);

      // Insert starter items into owned_items table
      const { error } = await supabase.from("owned_items").insert(
        starterItems.map((item) => ({
          user_id: userId,
          item_id: item.id,
        }))
      );

      if (error) {
        console.error("Error initializing starter items:", error);
        return;
      }

      // Update owned items state
      setOwnedItems(new Set(starterItems.map((item) => item.id)));
    } catch (error) {
      console.error("Error initializing starter items:", error);
    }
  };

  // Modify loadOwnedItems to check if user needs starter items
  const loadOwnedItems = async (userId: string) => {
    try {
      // Get items from owned_items table
      const { data: ownedItemsData, error: ownedItemsError } = await supabase
        .from("owned_items")
        .select("item_id")
        .eq("user_id", userId);

      if (ownedItemsError) {
        console.error("Error loading owned items:", ownedItemsError);
        return;
      }

      // If user has no items, initialize starter items
      if (!ownedItemsData || ownedItemsData.length === 0) {
        await initializeStarterItems(userId);
        return;
      }

      // Create a set of owned item IDs
      const ownedItemIds = new Set<string>(
        ownedItemsData.map((item) => item.item_id)
      );
      setOwnedItems(ownedItemIds);
    } catch (error) {
      console.error("Error loading owned items:", error);
    }
  };

  // Generate weekly bundle
  useEffect(() => {
    const generateBundle = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(
        nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7)
      );
      nextMonday.setHours(0, 0, 0, 0);

      // Randomly select 3-5 items
      const numItems = Math.random() < 0.5 ? 3 : 5;
      const availableItems = items.filter((item) => !ownedItems.has(item.id));
      const selectedItems: ShopItem[] = [];
      const usedIds = new Set<string>();

      for (let i = 0; i < numItems; i++) {
        const available = availableItems.filter(
          (item) => !usedIds.has(item.id)
        );
        if (available.length === 0) break;
        const randomIndex = Math.floor(Math.random() * available.length);
        const item = available[randomIndex];
        selectedItems.push(item);
        usedIds.add(item.id);
      }

      if (selectedItems.length > 0) {
        const totalPrice = selectedItems.reduce(
          (sum, item) => sum + item.price,
          0
        );
        const discountedPrice = Math.round(totalPrice * 0.85); // 15% discount

        setCurrentBundle({
          id: `bundle-${now.getTime()}`,
          name: "Weekly Special Bundle",
          items: selectedItems,
          totalPrice,
          discountedPrice,
          expiresAt: nextMonday,
        });
      }
    };

    generateBundle();
  }, [items, ownedItems]);

  // Timer for bundle expiration
  useEffect(() => {
    if (!currentBundle) return;

    const timer = setInterval(() => {
      const now = new Date();
      if (now >= currentBundle.expiresAt) {
        setCurrentBundle(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBundle]);

  const handleBuy = async (item: ShopItem) => {
    if (points < item.price) {
      alert("Not enough points!");
      return;
    }

    try {
      const { user, error } = await getCurrentUser();
      if (error || !user) {
        alert("Please log in to buy items");
        return;
      }

      // Get profile id first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Profile not found");
      }

      // Check if item is already owned using profile id
      const { data: existingItem } = await supabase
        .from("owned_items")
        .select()
        .eq("user_id", profile.id)
        .eq("item_id", item.id)
        .single();

      if (existingItem) {
        alert("You already own this item!");
        return;
      }

      // Update points
      const { error: updatePointsError } = await supabase
        .from("profiles")
        .update({ points: points - item.price })
        .eq("id", profile.id);

      if (updatePointsError) {
        throw updatePointsError;
      }

      // Add to owned_items table using profile id
      const { error: ownedItemError } = await supabase
        .from("owned_items")
        .insert({ user_id: profile.id, item_id: item.id });

      if (ownedItemError) {
        // Rollback points if adding to owned_items fails
        await supabase
          .from("profiles")
          .update({ points: points })
          .eq("id", profile.id);
        throw ownedItemError;
      }

      setPoints(points - item.price);
      setPointsChange(-item.price);
      setOwnedItems((prev) => new Set([...prev, item.id]));

      // Reset points change animation after 2 seconds
      setTimeout(() => setPointsChange(null), 2000);

      alert("Item purchased successfully!");
    } catch (error) {
      console.error("Error buying item:", error);
      alert("Failed to purchase item");
    }
  };

  const handleSell = async (item: ShopItem) => {
    if (item.isStarter) {
      alert("Starter items cannot be sold!");
      return;
    }

    try {
      const { user, error } = await getCurrentUser();
      if (error || !user) {
        alert("Please log in to sell items");
        return;
      }

      // Get profile id first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Profile not found");
      }

      // Check if the item is placed in any village layout
      const { data: placedItems, error: placedItemsError } = await supabase
        .from("village_items")
        .select("layout_id")
        .eq("item_id", item.id)
        .eq(
          "layout_id",
          (
            await supabase
              .from("village_layouts")
              .select("id")
              .eq("user_id", profile.id)
              .single()
          ).data?.id
        );

      if (placedItemsError) {
        console.error("Error checking placed items:", placedItemsError);
        throw placedItemsError;
      }

      // If item is placed, show special confirmation
      if (placedItems && placedItems.length > 0) {
        if (
          !confirm(
            `This item is currently placed in your village. If you sell it, it will be removed from your village layout. Do you want to proceed?`
          )
        ) {
          return;
        }

        // Delete the item from village layout
        const { error: deleteLayoutError } = await supabase
          .from("village_items")
          .delete()
          .eq("item_id", item.id)
          .eq("layout_id", placedItems[0].layout_id);

        if (deleteLayoutError) {
          console.error("Error removing item from layout:", deleteLayoutError);
          throw deleteLayoutError;
        }
      } else {
        // Regular confirmation for unplaced items
        if (
          !confirm(
            `Are you sure you want to sell ${item.name} for ${Math.round(
              item.price * 0.8
            )} points?`
          )
        ) {
          return;
        }
      }

      const sellPrice = Math.round(item.price * 0.8);

      // Update points using profile id
      const { error: updatePointsError } = await supabase
        .from("profiles")
        .update({ points: points + sellPrice })
        .eq("id", profile.id);

      if (updatePointsError) {
        throw updatePointsError;
      }

      // Remove from owned_items table using profile id
      const { error: ownedItemError } = await supabase
        .from("owned_items")
        .delete()
        .eq("user_id", profile.id)
        .eq("item_id", item.id);

      if (ownedItemError) {
        // Rollback points if removing from owned_items fails
        await supabase
          .from("profiles")
          .update({ points: points })
          .eq("id", profile.id);
        throw ownedItemError;
      }

      setPoints(points + sellPrice);
      setPointsChange(sellPrice);

      setOwnedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });

      // Reset points change animation after 2 seconds
      setTimeout(() => setPointsChange(null), 2000);

      alert("Item sold successfully!");
    } catch (error) {
      console.error("Error selling item:", error);
      alert("Failed to sell item");
    }
  };

  const handleBuyBundle = async (bundle: Bundle) => {
    if (points < bundle.discountedPrice) {
      alert("Not enough points!");
      return;
    }

    try {
      const { user, error } = await getCurrentUser();
      if (error || !user) {
        alert("Please log in to buy items");
        return;
      }

      // Get profile id first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Profile not found");
      }

      // Check if any bundle item is already owned
      for (const item of bundle.items) {
        const { data: existingItem } = await supabase
          .from("owned_items")
          .select()
          .eq("user_id", profile.id)
          .eq("item_id", item.id)
          .single();

        if (existingItem) {
          alert(`You already own ${item.name}!`);
          return;
        }
      }

      // Update points with discounted price
      const { error: updatePointsError } = await supabase
        .from("profiles")
        .update({ points: points - bundle.discountedPrice })
        .eq("id", profile.id);

      if (updatePointsError) {
        throw updatePointsError;
      }

      // Add all bundle items to owned_items table
      const { error: ownedItemError } = await supabase
        .from("owned_items")
        .insert(
          bundle.items.map((item) => ({
            user_id: profile.id,
            item_id: item.id,
          }))
        );

      if (ownedItemError) {
        // Rollback points if adding to owned_items fails
        await supabase
          .from("profiles")
          .update({ points: points })
          .eq("id", profile.id);
        throw ownedItemError;
      }

      setPoints(points - bundle.discountedPrice);
      setPointsChange(-bundle.discountedPrice);

      // Update owned items state
      setOwnedItems((prev) => {
        const newSet = new Set(prev);
        bundle.items.forEach((item) => newSet.add(item.id));
        return newSet;
      });

      // Reset points change animation after 2 seconds
      setTimeout(() => setPointsChange(null), 2000);

      alert("Bundle purchased successfully!");
    } catch (error) {
      console.error("Error buying bundle:", error);
      alert("Failed to purchase bundle");
    }
  };

  const filteredItems = items
    .filter((item) => {
      if (selectedCategory === "bundles") return false;
      if (showOwnedOnly && !ownedItems.has(item.id)) return false;
      if (item.category === selectedCategory) {
        if (selectedCategory === "decor" && selectedSubCategory !== "all") {
          return item.subCategory === selectedSubCategory;
        }
        return true;
      }
      return false;
    })
    .filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      {/* Back Arrow */}
      <BackArrow href="/village" />

      {/* Points Display */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            JolliVille Shop
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Points:</span>
            <span
              className={`text-2xl font-bold ${
                pointsChange ? "animate-pulse" : ""
              }`}
            >
              {points}
              {pointsChange && (
                <span
                  className={`ml-2 ${
                    pointsChange > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {pointsChange > 0 ? `+${pointsChange}` : pointsChange}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Category Tabs - Reordered with bundles at the end */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(
            ["houses", "tents", "decor", "archer-towers", "bundles"] as const
          ).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                if (category === "decor") {
                  setSelectedSubCategory("all");
                }
              }}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-pink-100 text-pink-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category === "archer-towers"
                ? "Towers"
                : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Subcategory Tabs - Show only when Decor is selected */}
        {selectedCategory === "decor" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(["all", "general", "trees", "stones", "greenery"] as const).map(
              (subCategory) => (
                <button
                  key={subCategory}
                  onClick={() => setSelectedSubCategory(subCategory)}
                  className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                    selectedSubCategory === subCategory
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {subCategory === "all"
                    ? "All Decor"
                    : subCategory.charAt(0).toUpperCase() +
                      subCategory.slice(1)}
                </button>
              )
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
            <button
              onClick={() => {
                setPriceRange([0, 1200]);
                setShowOwnedOnly(false);
                setSortBy("name");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([parseInt(e.target.value), priceRange[1]])
                  }
                  className="w-20 px-2 py-1 border rounded"
                  min="0"
                  max="1200"
                />
                <span>to</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-20 px-2 py-1 border rounded"
                  min="0"
                  max="1200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show Owned Only
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOwnedOnly}
                  onChange={(e) => setShowOwnedOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">
                  Show only owned items
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "price-asc" | "price-desc" | "name"
                  )
                }
                className="w-full px-2 py-1 border rounded"
              >
                <option value="name">Name</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {selectedCategory === "bundles" ? (
            currentBundle ? (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-xl font-semibold mb-4">
                  {currentBundle.name}
                </h3>
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Expires in:</div>
                  <div className="text-lg font-semibold text-pink-600">
                    {Math.floor(
                      (currentBundle.expiresAt.getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </div>
                </div>
                <div className="space-y-4">
                  {currentBundle.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.price} points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Price:</span>
                    <span className="text-lg font-semibold">
                      {currentBundle.totalPrice} points
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bundle Price:</span>
                    <span className="text-xl font-bold text-green-600">
                      {currentBundle.discountedPrice} points
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Save{" "}
                    {currentBundle.totalPrice - currentBundle.discountedPrice}{" "}
                    points!
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (points < currentBundle.discountedPrice) {
                      alert("Not enough points!");
                      return;
                    }
                    handleBuyBundle(currentBundle);
                  }}
                  className="w-full mt-4 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Buy Bundle
                </button>
              </div>
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-xl font-semibold mb-2">
                  No Active Bundle
                </div>
                <div className="text-gray-600">
                  Check back next week for new bundles!
                </div>
              </div>
            )
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
              >
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                  {ownedItems.has(item.id) && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                      Owned
                    </div>
                  )}
                  {item.isStarter && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                      Starter
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-pink-600">
                    {item.price} points
                  </div>
                  {ownedItems.has(item.id) ? (
                    <button
                      onClick={() => handleSell(item)}
                      disabled={item.isStarter}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        item.isStarter
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {item.isStarter
                        ? "Starter Item"
                        : `Sell (${Math.round(item.price * 0.8)} points)`}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      Buy
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative w-full h-64 mb-4">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-lg font-semibold mb-2">
                  {selectedItem.price} points
                </div>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                {ownedItems.has(selectedItem.id) && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Selling Instructions:
                    </div>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                      <li>Click the "Sell" button below</li>
                      <li>Confirm the sale in the popup dialog</li>
                      <li>
                        You will receive 80% of the original price (
                        {Math.round(selectedItem.price * 0.8)} points)
                      </li>
                    </ol>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Preview in Village</h3>
                <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <Image
                        src={selectedItem.image}
                        alt={selectedItem.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              {ownedItems.has(selectedItem.id) ? (
                <button
                  onClick={() => {
                    handleSell(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sell ({Math.round(selectedItem.price * 0.8)} points)
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleBuy(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Buy ({selectedItem.price} points)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withUserOnly(ShopPage);
