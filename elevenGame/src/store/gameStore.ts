import { create } from 'zustand';
import type { GameState } from '../types';
import { GameEngine } from '../engine/game';
import { audio } from '../utils/audio';

interface GameStore extends GameState {
  // Actions
  initializeGame: (playerNames: string[], category?: string, opponentNames?: string[]) => void;
  playCard: (handCardId: string, captureCardIds: string[]) => void;
  resetGame: () => void; // Go to Home
  restartMatch: () => void; // Restart with same players
  nextRound: () => void;
  
  // UI Specific State
  selectedHandCardId: string | null;
  selectedBoardCardIds: string[];
  
  // UI Actions
  selectHandCard: (cardId: string) => void;
  toggleBoardCard: (cardId: string) => void;
  clearSelection: () => void;
  setRevealingCardId: (cardId: string | null) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  isAnimating: boolean;
}

const initialState: GameState = {
  deck: [],
  board: [],
  players: [],
  activePlayerIndex: 0,
  round: 1,
  phase: 'game_over', // Start in game over state to show home screen
  lastCapturingPlayerIndex: null,
  activeScopaPlayerIndex: null,
  lastBonusEvent: undefined,
  category: undefined,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  selectedHandCardId: null,
  selectedBoardCardIds: [],
  isAnimating: false,

  initializeGame: (playerNames, category, opponentNames) => {
    const newState = GameEngine.initializeGame(playerNames);
    
    if (opponentNames && opponentNames.length > 0) {
      newState.players = newState.players.map((p, i) => {
        if (i > 0 && opponentNames[i - 1]) {
          return { ...p, name: opponentNames[i - 1] };
        }
        return p;
      });
    }

    set({ ...newState, category, selectedHandCardId: null, selectedBoardCardIds: [], isAnimating: false, dealId: Date.now() });
  },

  playCard: async (handCardId, captureCardIds) => {
    const { isAnimating, phase } = get();
    if (isAnimating || phase !== 'playing') return;

    const isCapture = captureCardIds.length > 0;
    
    try {
      // 1. Lock UI and Start Animation sequence if needed
      set({ isAnimating: true });
      
      if (isCapture) {
        set({ revealingCardId: handCardId });
        // Wait for reveal flip (1.2s + extra for processing)
        await new Promise(resolve => setTimeout(resolve, 1400));
        audio.playCapture();
      } else {
        // Small defensive delay even for non-captures to prevent rapid clicks/re-renders
        await new Promise(resolve => setTimeout(resolve, 300));
        audio.playPlace();
      }

      // 2. Execute Logic using the state at execution time
      const currentState = get();
      const newState = GameEngine.executeMove(currentState, handCardId, captureCardIds);
      
      // 3. Finalize State
      set({ 
        ...newState, 
        selectedHandCardId: null, 
        selectedBoardCardIds: [], 
        revealingCardId: null,
        isAnimating: false 
      });

      // Bot trigger removed - now handled by effect in GameScreen.tsx for better UI/Logic separation
    } catch (error) {
      console.error("Game Error:", error);
      // Fallback: Unlock UI so game doesn't freeze
      set({ isAnimating: false, revealingCardId: null });
    }
  },

  setRevealingCardId: (cardId) => set({ revealingCardId: cardId }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),

  resetGame: () => {
    set({ ...initialState });
  },

  restartMatch: () => {
    const { players } = get();
    // Start fresh match with same player names
    const playerNames = players.map(p => p.name);
    
    // 1. Create new deck/board with random dealer
    const newState = GameEngine.initializeGame(playerNames);
    
    // 2. Ensure scores are RESET to 0
    const resetPlayers = newState.players.map(p => ({
        ...p,
        score: 0
    }));

    set({ 
        ...newState, 
        players: resetPlayers,
        phase: 'playing',
        round: 1,
        dealId: Date.now(),
        selectedHandCardId: null, 
        selectedBoardCardIds: [],
        revealingCardId: null,
        isAnimating: false
    });
  },

  nextRound: () => {
    const { players, dealOrder: oldDealOrder } = get();
    
    // Rotate dealer for the next deck cycle
    const nextDealOrder = ((oldDealOrder ?? 0) + 1) % players.length;
    const playerNames = players.map(p => p.name);
    
    // 1. Create new deck/board with rotated dealer
    const newState = GameEngine.initializeGame(playerNames, nextDealOrder);
    
    // 2. Restore previous scores 
    const continuedPlayers = newState.players.map((p, i) => ({
        ...p,
        score: players[i].score // Keep cumulative score
    }));

    set({
        ...newState,
        players: continuedPlayers,
        round: 1,
        dealId: Date.now(),
        selectedHandCardId: null,
        selectedBoardCardIds: [],
        revealingCardId: null,
        isAnimating: false
    });
  },

  selectHandCard: (cardId) => {
    const { players, activePlayerIndex, selectedHandCardId } = get();
    const activePlayer = players[activePlayerIndex];
    
    // Only allow active player to select (if not bot)
    if (activePlayer.isBot) return;

    if (selectedHandCardId === cardId) {
      set({ selectedHandCardId: null });
    } else {
      set({ selectedHandCardId: cardId, selectedBoardCardIds: [] });
    }
  },

  toggleBoardCard: (cardId) => {
    const { selectedBoardCardIds, players, activePlayerIndex } = get();
    if (players[activePlayerIndex].isBot) return;

    if (selectedBoardCardIds.includes(cardId)) {
      set({ selectedBoardCardIds: selectedBoardCardIds.filter(id => id !== cardId) });
    } else {
      set({ selectedBoardCardIds: [...selectedBoardCardIds, cardId] });
    }
  },

  clearSelection: () => {
    set({ selectedHandCardId: null, selectedBoardCardIds: [] });
  }
}));
