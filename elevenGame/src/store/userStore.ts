import { create } from 'zustand';
import type { Item } from './types';
import { ALL_SHOP_ITEMS } from '../constants/shopItems';

export type { Item };


interface UserStore {
  diamonds: number;
  lightning: number;
  coins: number;
  score: number;
  lastClaimFree: number | null;
  lastWatchAd: number | null;
  inventory: {
    cardBacks: string[];
    reactions: string[];
  };
  itemFragments: Record<string, number>; // itemId -> fragment count (out of 10)
  equipped: {
    cardBack: string;
    reactions: string[];
  };
  leaderboard: { id: string | number; name: string; score: number; avatar: string; isMe?: boolean }[];
  lastGameConfig: { category: string; teamSize: string } | null;
  
  // Actions
  addDiamonds: (amount: number) => void;
  spendDiamonds: (amount: number) => boolean;
  addLightning: (amount: number) => void;
  spendLightning: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addFragment: (itemId: string, amount: number) => void;
  setEquippedCardBack: (id: string) => void;
  toggleEquippedReaction: (id: string) => void;
  purchaseItem: (item: Item, isFree?: boolean, currency?: 'diamonds' | 'coins') => boolean;
  claimFreeLightning: () => boolean;
  watchAdCoins: () => boolean;
  updateScore: (newScore: number) => void;
  setLastGameConfig: (config: { category: string; teamSize: string }) => void;
}



export const useUserStore = create<UserStore>((set, get) => ({
  diamonds: 5,
  lightning: 5,
  coins: 500,
  score: 6500,
  lastClaimFree: null,
  lastWatchAd: null,
  inventory: {
    cardBacks: ['original'],
    reactions: ['fire', 'target', 'crown', 'clown'],
  },
  itemFragments: {},
  equipped: {
    cardBack: 'original',
    reactions: ['fire', 'target', 'crown', 'clown'],
  },
  leaderboard: [
    { id: 1, name: "NeonStriker", score: 2500, avatar: "N" },
    { id: 2, name: "CypherGhost", score: 2150, avatar: "C" },
    { id: 3, name: "VoidWalker", score: 1980, avatar: "V" },
    { id: 4, name: "LunaRay", score: 1850, avatar: "L" },
    { id: 5, name: "NovaBlast", score: 1720, avatar: "N" },
    { id: 6, name: "SonicWave", score: 1640, avatar: "S" },
    { id: 7, name: "ShadowStep", score: 1520, avatar: "S" },
    { id: 8, name: "AstraPlayer", score: 1480, avatar: "A" },
    { id: 9, name: "GlitchHero", score: 1390, avatar: "G" },
    { id: 10, name: "FrostByte", score: 1320, avatar: "F" },
    { id: 11, name: "PlasmaCore", score: 1270, avatar: "P" },
    { id: "me", name: "You", score: 6500, avatar: "Y", isMe: true },
    { id: 12, name: "SolarFlare", score: 1230, avatar: "S" },
  ],
  lastGameConfig: null,

  updateScore: (newScore) => set((state) => ({ 
    score: newScore,
    leaderboard: state.leaderboard.map(u => u.isMe ? { ...u, score: newScore } : u)
  })),

  setLastGameConfig: (config) => set({ lastGameConfig: config }),

  addDiamonds: (amount) => set((state) => ({ diamonds: state.diamonds + amount })),
  
  spendDiamonds: (amount) => {
    const { diamonds } = get();
    if (diamonds >= amount) {
      set({ diamonds: diamonds - amount });
      return true;
    }
    return false;
  },

  addLightning: (amount) => set((state) => ({ lightning: state.lightning + amount })),
  
  spendLightning: (amount) => {
    const { lightning } = get();
    if (lightning >= amount) {
      set({ lightning: lightning - amount });
      return true;
    }
    return false;
  },

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  spendCoins: (amount) => {
    const { coins } = get();
    if (coins >= amount) {
      set({ coins: coins - amount });
      return true;
    }
    return false;
  },

  addFragment: (itemId, amount) => set((state) => {
    const current = state.itemFragments[itemId] || 0;
    const next = Math.min(10, current + amount);
    
    // If we hit 10 fragments, give the item for free
    if (next >= 10) {
      // Find the item dynamically from the imported list
      const item = ALL_SHOP_ITEMS.find((i: any) => i.id === itemId);
      
      if (item) {
        // Defer purchase to next tick to avoid state update during render/set
        setTimeout(() => get().purchaseItem(item, true), 0);
      }

      
      const newFragments = { ...state.itemFragments };
      delete newFragments[itemId];
      return { itemFragments: newFragments };
    }
    
    return {
      itemFragments: {
        ...state.itemFragments,
        [itemId]: next
      }
    };
  }),

  setEquippedCardBack: (id) => set((state) => ({
    equipped: { ...state.equipped, cardBack: id }
  })),

  toggleEquippedReaction: (id) => set((state) => {
    const reactions = [...state.equipped.reactions];
    const index = reactions.indexOf(id);
    if (index > -1) {
      if (reactions.length <= 4) return state;
      reactions.splice(index, 1);
    } else {
      reactions.push(id);
    }
    return { equipped: { ...state.equipped, reactions } };
  }),

  purchaseItem: (item, isFree = false, currency = 'diamonds') => {
    const { diamonds, coins, inventory, spendDiamonds, spendCoins } = get();
    
    // Check if already owned
    if (item.type === 'cardBack' && inventory.cardBacks.includes(item.id)) return false;
    if (item.type === 'reaction' && inventory.reactions.includes(item.id)) return false;

    const price = item.price || 0;
    const finalPrice = currency === 'coins' ? price * 100 : price;
    const hasEnough = currency === 'coins' ? coins >= finalPrice : diamonds >= price;

    if (isFree || (price > 0 && hasEnough)) {
      if (!isFree) {
        if (currency === 'coins') spendCoins(finalPrice);
        else spendDiamonds(price);
      }
      
      if (item.type === 'cardBack') {
        set((state) => {
          const newFragments = { ...state.itemFragments };
          delete newFragments[item.id];
          return {
            inventory: {
              ...inventory,
              cardBacks: [...inventory.cardBacks, item.id]
            },
            itemFragments: newFragments
          };
        });
      } else {
        set((state) => {
          const newFragments = { ...state.itemFragments };
          delete newFragments[item.id];
          return {
            inventory: {
              ...inventory,
              reactions: [...inventory.reactions, item.id]
            },
            itemFragments: newFragments
          };
        });
      }
      return true;
    }
    return false;
  },


  claimFreeLightning: () => {
    const now = Date.now();
    const { lastClaimFree } = get();
    const twelveHours = 12 * 60 * 60 * 1000;
    
    if (!lastClaimFree || now - lastClaimFree >= twelveHours) {
      set((state) => ({ 
        lightning: state.lightning + 1,
        lastClaimFree: now
      }));
      return true;
    }
    return false;
  },

  watchAdCoins: () => {
    const now = Date.now();
    const { lastWatchAd } = get();
    const twelveHours = 12 * 60 * 60 * 1000;
    
    if (!lastWatchAd || now - lastWatchAd >= twelveHours) {
      set((state) => ({ 
        coins: state.coins + 50,
        lastWatchAd: now
      }));
      return true;
    }
    return false;
  }
}));


