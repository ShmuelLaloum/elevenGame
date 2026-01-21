export type PackRarity = 'simple' | 'nice' | 'epic';

export interface PackReward {
  type: 'lightning' | 'coins' | 'diamonds' | 'fragment';
  amount: number;
  itemId?: string;
  itemName?: string;
  rarity: PackRarity;
}

export const UNIFIED_PACK_PRICE = 300;
export const UNIFIED_PACK_DIAMOND_PRICE = 3;

export const RARITY_CHANCES: { rarity: PackRarity; chance: number; color: string }[] = [
  { rarity: 'simple', chance: 0.65, color: 'from-slate-400 to-slate-600' },
  { rarity: 'nice', chance: 0.25, color: 'from-blue-400 to-blue-600' },
  { rarity: 'epic', chance: 0.10, color: 'from-purple-500 to-purple-700' },
];

export const REWARD_TYPES: { type: PackReward['type']; chance: number }[] = [
  { type: 'lightning', chance: 0.40 },
  { type: 'coins', chance: 0.30 },
  { type: 'fragment', chance: 0.25 },
  { type: 'diamonds', chance: 0.05 },
];

export const REWARDS_BY_RARITY: Record<PackRarity, Record<PackReward['type'], { min: number; max: number }>> = {
  simple: {
    lightning: { min: 1, max: 1 },
    coins: { min: 50, max: 50 },
    fragment: { min: 1, max: 1 },
    diamonds: { min: 5, max: 5 },
  },
  nice: {
    lightning: { min: 2, max: 2 },
    coins: { min: 100, max: 100 },
    fragment: { min: 2, max: 2 },
    diamonds: { min: 10, max: 10 },
  },
  epic: {
    lightning: { min: 4, max: 4 },
    coins: { min: 200, max: 200 },
    fragment: { min: 4, max: 4 },
    diamonds: { min: 20, max: 20 },
  },
};
