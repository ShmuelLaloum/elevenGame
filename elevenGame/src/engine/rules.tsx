import type { Card } from "../types";
import { getCardValue } from "../utils/deck";

export const TARGET_SUM = 11;

/**
 * Determines valid capture combinations for a given hand card and board.
 *
 * Rules:
 * 1. Number cards (A-10) capture any subset of board cards that sum to (11 - card_value).
 *    e.g. Hand 7 captures 4, or 3+1, or 2+2.
 *
 * 2. Picture cards (J, Q, K) capture cards of the same Rank.
 *    e.g. Hand J captures J.
 *    - Variant: Can they capture multiple? Standard simple rule: Capture ALL matching pictures or ONE?
 *    - Let's implement: Capture ANY subset of matching ranks (usually just 1 or 2 exist).
 */
export const getValidCaptures = (handCard: Card, board: Card[]): Card[][] => {
  if (isPictureCard(handCard)) {
    // Picture cards
    if (handCard.rank === "J") {
      // Jack Rule: Takes ALL *Non-Q/K* cards on the board
      // User requested: "Take everything except Queen/King"
      const validBoardCards = board.filter(
        (c) => c.rank !== "Q" && c.rank !== "K"
      );

      if (validBoardCards.length > 0) {
        return [[...validBoardCards]];
      }
      return [];
    } else {
      // Q and K capture matching ranks
      const matches: Card[][] = [];
      board.forEach((card) => {
        if (card.rank === handCard.rank) {
          matches.push([card]);
        }
      });
      return matches;
    }
  } else {
    // Number card
    const handValid = getCardValue(handCard.rank);
    const targetSum = TARGET_SUM - handValid;

    // If targetSum <= 0, impossible (e.g. playing a card > 11? not possible with A-10)
    if (targetSum <= 0) return [];

    // Find all subsets of board that sum to targetSum
    const numberCardsOnBoard = board.filter((c) => !isPictureCard(c));

    return findSubsetsSummingTo(numberCardsOnBoard, targetSum);
  }
};

const isPictureCard = (card: Card): boolean => {
  return ["J", "Q", "K"].includes(card.rank);
};

// Helper to find all subsets of card summing to target
const findSubsetsSummingTo = (cards: Card[], target: number): Card[][] => {
  const results: Card[][] = [];

  const backtrack = (
    startIndex: number,
    currentSubset: Card[],
    currentSum: number
  ) => {
    if (currentSum === target) {
      results.push([...currentSubset]);
      return;
    }
    if (currentSum > target) return;

    for (let i = startIndex; i < cards.length; i++) {
      // Optimization: Handle duplicates or ordered logic if needed?
      // Cards are unique items, so standard subset sum.
      const val = getCardValue(cards[i].rank);
      backtrack(i + 1, [...currentSubset, cards[i]], currentSum + val);
    }
  };

  backtrack(0, [], 0);
  return results;
};
