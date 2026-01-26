export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = 
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' 
  | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // 1-10 for numbers, 11/12/13 for J/Q/K (or specific game values)
  imageUrl?: string; // For later UI
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  capturedCards: Card[];
  score: number;
  isBot: boolean;
  roundScopas: number; // Cumulative bonuses for the current round
}

export interface GameState {
  deck: Card[];
  board: Card[];
  players: Player[];
  activePlayerIndex: number;
  round: number; // 1-6 (assuming 4 cards dealings)
  phase: 'dealing' | 'playing' | 'scoring' | 'game_over';
  category?: string;
  lastCapturingPlayerIndex: number | null; // For assigning remaining cards at end
  activeScopaPlayerIndex: number | null; // Tracks who currently has the Scopa bonus (5 pts)
  revealingCardId?: string | null; // For synchronization of capture-reveal animations
  isAnimating?: boolean; // Global flag to lock UI/Timers during animations
  lastBonusEvent?: { playerId: string; timestamp: number }; // Unique trigger for UI animations
  dealId?: number; // Unique ID to trigger deal animations
  dealOrder?: number; // 0 or 1, identifies who gets cards first this round
}
