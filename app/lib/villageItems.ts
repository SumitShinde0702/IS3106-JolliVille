export interface VillageItem {
  id: string;
  name: string;
  image: string;
  category: "houses" | "tents" | "decor" | "archer-towers";
  isStarter?: boolean;
}

export const initialItems: VillageItem[] = [
  // Houses - Based on visual complexity and luxury
  {
    id: "house-1",
    name: "Noble Manor",
    image: "/village-items/houses/1.png",
    category: "houses",
    isStarter: true,
  },
  {
    id: "house-2",
    name: "Cozy Cabin",
    image: "/village-items/houses/2.png",
    category: "houses",
    isStarter: true,
  },
  // ... rest of the items from village/page.tsx
]; 