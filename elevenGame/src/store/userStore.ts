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
  inventory: {
    cardBacks: string[]; // IDs of owned card backs
    reactions: string[]; // IDs of owned reactions
  };
  equipped: {
    cardBack: string;
    reactions: string[]; // Up to 4 or multiple
  };
  
  // Actions
  addDiamonds: (amount: number) => void;
  spendDiamonds: (amount: number) => boolean;
  addLightning: (amount: number) => void;
  spendLightning: (amount: number) => boolean;
  setEquippedCardBack: (id: string) => void;
  toggleEquippedReaction: (id: string) => void;
  purchaseItem: (item: Item) => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  diamonds: 500, // Starting amount for demo
  lightning: 5,
  inventory: {
    cardBacks: ['original'],
    reactions: ['fire', 'target', 'crown', 'clown'],
  },
  equipped: {
    cardBack: 'original',
    reactions: ['fire', 'target', 'crown', 'clown'],
  },

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
      reactions.splice(index, 1);
    } else {
      if (reactions.length < 4) { // Limit to 4 active reactions maybe?
        reactions.push(id);
      }
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
  }
}));
