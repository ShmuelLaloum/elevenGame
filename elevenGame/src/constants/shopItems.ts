import type { Item } from "../store/types";

export const CARD_BACKS: Item[] = [
  {
    id: "royal-gold",
    name: "Royal Gold",
    type: "cardBack",
    price: 5, // 50 / 10 = 5 Diamonds
    image: "bg-yellow-600",
  },
  {
    id: "neon-matrix",
    name: "Neon Matrix",
    type: "cardBack",
    price: 8, // 75 / 10 = 7.5 -> 8 Diamonds
    image: "bg-cyan-600",
  },
  {
    id: "void-purple",
    name: "Void Purple",
    type: "cardBack",
    price: 10, // 100 / 10 = 10 Diamonds
    image: "bg-purple-600",
  },
  {
    id: "crimson-flame",
    name: "Crimson Flame",
    type: "cardBack",
    price: 13, // 125 / 10 = 12.5 -> 13 Diamonds
    image: "bg-red-600",
  },
];

export const REACTIONS: Item[] = [
  { id: "diamond", emoji: "💎", name: "Diamond", type: "reaction", price: 3 }, // 25 / 10 = 2.5 -> 3 Diamonds
  { id: "salt", emoji: "🧂", name: "Salty", type: "reaction", price: 3 },
];

export const ALL_SHOP_ITEMS = [...CARD_BACKS, ...REACTIONS];
