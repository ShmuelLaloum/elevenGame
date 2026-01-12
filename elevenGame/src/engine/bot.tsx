import type { Card, GameState } from "../types";
import { getValidCaptures } from "./rules";

export interface Move {
  handCardId: string;
  captureCardIds: string[]; // Empty if trailing
}

export const getBestMove = (
  gameState: GameState,
  botPlayerIndex: number
): Move => {
  const botPlayer = gameState.players[botPlayerIndex];
  const { hand } = botPlayer;
  const { board } = gameState;

  let bestMove: Move | null = null;
  let bestScore = -100;

  // Evaluate all possible moves
  for (const card of hand) {
    const validCaptures = getValidCaptures(card, board);

    if (validCaptures.length > 0) {
      // It's a capture move
      for (const captureSet of validCaptures) {
        const score = evaluateCapture(card, captureSet, board);
        if (score > bestScore) {
          bestScore = score;
          bestMove = {
            handCardId: card.id,
            captureCardIds: captureSet.map((c) => c.id),
          };
        }
      }
    } else {
      // It's a trail (throw) move
      const score = evaluateTrail(card, board);
      // Trailing is usually bad, so score should be low, but we want the "least bad"
      if (score > bestScore) {
        bestScore = score;
        bestMove = { handCardId: card.id, captureCardIds: [] };
      }
    }
  }

  // Fallback if something weird happens
  if (!bestMove && hand.length > 0) {
    return { handCardId: hand[0].id, captureCardIds: [] };
  }

  return bestMove!;
};

// Heuristic Scoring
const evaluateCapture = (
  handCard: Card,
  capturedCards: Card[],
  currentBoard: Card[]
): number => {
  let score = 10; // Base score for capturing (better than trailing)

  // Scopa Check (if board becomes empty)
  // Note: currentBoard includes the captured cards.
  // If capturedCards.length === currentBoard.length, it's a Scopa!
  if (capturedCards.length === currentBoard.length) {
    score += 50; // High priority for Scopa
  }

  // Cards Value Analysis
  const allCards = [handCard, ...capturedCards];

  for (const c of allCards) {
    // 10 of Diamonds (Big Casino)
    if (c.rank === "10" && c.suit === "diamonds") score += 20;
    // 2 of Spades (Little Casino)
    if (c.rank === "2" && c.suit === "spades") score += 15;
    // Aces
    if (c.rank === "A") score += 5;
    // Spades
    if (c.suit === "spades") score += 2;
  }

  // Quantity Bonus
  score += allCards.length;

  return score;
};

const evaluateTrail = (card: Card, _board: Card[]): number => {
  // Trailing is negative value generally
  let score = 0;

  // Avoid trailing high value cards or point cards
  if (card.rank === "10" && card.suit === "diamonds") score -= 20;
  if (card.rank === "2" && card.suit === "spades") score -= 15;
  if (card.rank === "A") score -= 10;

  // Prefer throwing cards that don't easily sum to 11 with board?
  // Simplified: Randomish preference for now, just save good cards.

  return score;
};
