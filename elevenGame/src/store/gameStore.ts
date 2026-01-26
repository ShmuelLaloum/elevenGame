import { create } from 'zustand';
import type { GameState } from '../types';
import { GameEngine } from '../engine/game';
import { getBestMove } from '../engine/bot';
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

      // 4. Trigger Bot if it's currently the bot's turn
      const nextPlayerIndex = newState.activePlayerIndex;
      const nextPlayer = newState.players[nextPlayerIndex];

      if (nextPlayer.isBot && newState.phase === 'playing') {
        setTimeout(() => {
          const botState = get(); // Re-check state inside timeout
          if (botState.activePlayerIndex === nextPlayerIndex && botState.phase === 'playing' && !botState.isAnimating) {
            const move = getBestMove(botState, nextPlayerIndex);
            get().playCard(move.handCardId, move.captureCardIds);
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Game Error:", error);
      // Fallback: Unlock UI so game doesn't freeze
      set({ isAnimating: false, revealingCardId: null });
    } finally {
       // Just in case
    }
  },

  setRevealingCardId: (cardId) => set({ revealingCardId: cardId }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),

  resetGame: () => {
    set({ ...initialState });
  },

  restartMatch: () => {
    const { players } = get();
    // Re-init with same names
    const playerNames = players.map(p => p.name);
    const newState = GameEngine.initializeGame(playerNames);
    
    // Ensure scores are 0 (initializeGame does this, but let's be sure)
    // And phase is 'playing'
    set({ 
        ...newState, 
        phase: 'playing',
        round: 1,
        dealId: Date.now(),
        selectedHandCardId: null, 
        selectedBoardCardIds: [] 
    });
  },

  nextRound: () => {
    const { players } = get();
    // Initialize new game layout
    // We want to KEEP players' names and scores, but reset hands/captured.
    
    // 1. Create new deck/board (resets p.hand and p.capturedCards internally)
    const newState = GameEngine.initializeGame(players.map(p => p.name));
    
    // 2. Restore previous scores 
    const continuedPlayers = newState.players.map((p, i) => ({
        ...p,
        score: players[i].score // Keep cumulative score
    }));

    set({
        ...newState,
        players: continuedPlayers,
        round: 1, // Start at sub-round 1 for deal animation
        dealId: Date.now(), // Trigger new animation
        selectedHandCardId: null,
        selectedBoardCardIds: []
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
