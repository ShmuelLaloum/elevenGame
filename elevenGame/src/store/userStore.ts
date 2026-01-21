import { create } from 'zustand';

export interface Item {
  id: string;
  name: string;
  type: 'cardBack' | 'reaction';
  image?: string;
  emoji?: string;
  price?: number;
}

interface UserStore {
  diamonds: number;
  lightning: number;
  score: number;
  lastClaimFree: number | null;
  lastWatchAd: number | null;
  inventory: {
    cardBacks: string[];
    reactions: string[];
  };
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
  setEquippedCardBack: (id: string) => void;
  toggleEquippedReaction: (id: string) => void;
  purchaseItem: (item: Item) => boolean;
  claimFreeLightning: () => boolean;
  watchAdLightning: () => boolean;
  updateScore: (newScore: number) => void;
  setLastGameConfig: (config: { category: string; teamSize: string }) => void;
}


export const useUserStore = create<UserStore>((set, get) => ({
  diamonds: 500,
  lightning: 5,
  score: 1350, // Updated to match user's manual change in leaderboard
  lastClaimFree: null,
  lastWatchAd: null,
  inventory: {
    cardBacks: ['original'],
    reactions: ['fire', 'target', 'crown', 'clown'],
  },
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

  setEquippedCardBack: (id) => set((state) => ({
    equipped: { ...state.equipped, cardBack: id }
  })),

  toggleEquippedReaction: (id) => set((state) => {
    const reactions = [...state.equipped.reactions];
    const index = reactions.indexOf(id);
    if (index > -1) {
      // Don't allow removal if only 4 left
      if (reactions.length <= 4) return state;
      reactions.splice(index, 1);
    } else {
      reactions.push(id);
    }
    return { equipped: { ...state.equipped, reactions } };
  }),

  purchaseItem: (item) => {
    const { diamonds, inventory, spendDiamonds } = get();
    if (item.price && diamonds >= item.price) {
      spendDiamonds(item.price);
      if (item.type === 'cardBack') {
        set({
          inventory: {
            ...inventory,
            cardBacks: [...inventory.cardBacks, item.id]
          }
        });
      } else {
        set({
          inventory: {
            ...inventory,
            reactions: [...inventory.reactions, item.id]
          }
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

  watchAdLightning: () => {
    const now = Date.now();
    const { lastWatchAd } = get();
    const twelveHours = 12 * 60 * 60 * 1000;
    
    if (!lastWatchAd || now - lastWatchAd >= twelveHours) {
      set((state) => ({ 
        lightning: state.lightning + 2,
        lastWatchAd: now
      }));
      return true;
    }
    return false;
  }
}));

