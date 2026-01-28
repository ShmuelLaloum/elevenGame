import { create } from 'zustand';

export interface PartyPlayer {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  isBot?: boolean;
  avatarUrl?: string;
  team?: number; // 1 or 2
  position?: number; // position within team
}

interface PartyStore {
  invitedPlayers: (PartyPlayer | null)[];
  leaderId: string;
  isReady: boolean;
  
  // Actions
  setInvitedPlayers: (players: (PartyPlayer | null)[]) => void;
  setLeaderId: (id: string) => void;
  setIsReady: (ready: boolean) => void;
  kickPlayer: (playerId: string) => void;
  addPlayer: (player: PartyPlayer, slotIndex?: number | null) => void;
  resetParty: () => void;
}

export const usePartyStore = create<PartyStore>((set) => ({
  invitedPlayers: [],
  leaderId: 'local',
  isReady: false,

  setInvitedPlayers: (players) => set({ invitedPlayers: players }),
  setLeaderId: (id) => set({ leaderId: id }),
  setIsReady: (ready) => set({ isReady: ready }),
  
  kickPlayer: (playerId) => set((state) => ({
    invitedPlayers: state.invitedPlayers.map(p => p && p.id === playerId ? null : p)
  })),

  addPlayer: (player, slotIndex) => set((state) => {
    const newPlayers = [...state.invitedPlayers];
    if (slotIndex !== undefined && slotIndex !== null) {
      const insertIndex = slotIndex > 0 ? slotIndex - 1 : 0;
      while (newPlayers.length <= insertIndex) {
        newPlayers.push(null);
      }
      newPlayers[insertIndex] = player;
    } else {
      const emptyIndex = newPlayers.findIndex(p => p === null);
      if (emptyIndex >= 0) {
        newPlayers[emptyIndex] = player;
      } else {
        newPlayers.push(player);
      }
    }
    return { invitedPlayers: newPlayers };
  }),

  resetParty: () => set({ invitedPlayers: [], leaderId: 'local', isReady: false }),
}));
