import { create } from 'zustand';
import type { GameState } from '../types';
import { GameEngine } from '../engine/game';
import { getBestMove } from '../engine/bot';

interface GameStore extends GameState {
  // Actions
  initializeGame: (playerNames: string[]) => void;
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
}

const initialState: GameState = {
  deck: [],
  board: [],
  players: [],
  activePlayerIndex: 0,
  round: 1,
  phase: 'game_over', // Start in game over state to show home screen
  lastCapturingPlayerIndex: null,
  activeScopaPlayerIndex: null
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  selectedHandCardId: null,
  selectedBoardCardIds: [],

  initializeGame: (playerNames) => {
    const newState = GameEngine.initializeGame(playerNames);
    set({ ...newState, selectedHandCardId: null, selectedBoardCardIds: [] });
  },

  playCard: (handCardId, captureCardIds) => {
    const state = get();
    // Execute move
    const newState = GameEngine.executeMove(state, handCardId, captureCardIds);
    set({ ...newState, selectedHandCardId: null, selectedBoardCardIds: [] });

    // Check if next player is Bot
    const nextPlayerIndex = newState.activePlayerIndex;
    const nextPlayer = newState.players[nextPlayerIndex];

    if (nextPlayer.isBot && newState.phase === 'playing') {
      // Trigger Bot Move with delay
      setTimeout(() => {
        const botState = get(); // Get latest state
        // Verify it's still bot's turn (in case of restarts)
        if (botState.activePlayerIndex === nextPlayerIndex && botState.phase === 'playing') {
            const move = getBestMove(botState, nextPlayerIndex);
            // Recursively call playCard for Bot
            get().playCard(move.handCardId, move.captureCardIds);
        }
      }, 1000);
    }
  },

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
        selectedHandCardId: null, 
        selectedBoardCardIds: [] 
    });
  },

  nextRound: () => {
    const { players, round } = get();
    // Initialize new game layout
    // We want to KEEP players' names and scores, but reset hands/captured.
    // Actually GameEngine.initializeGame resets everything.
    // Let's manually do what initializeGame does but reusing player objects.
    
    // 1. Create new deck/board
    const newState = GameEngine.initializeGame(players.map(p => p.name));
    
    // 2. Restore previous scores and update round number
    const continuedPlayers = newState.players.map((p, i) => ({
        ...p,
        score: players[i].score // Keep old score
    }));

    set({
        ...newState,
        players: continuedPlayers,
        round: round + 1,
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
