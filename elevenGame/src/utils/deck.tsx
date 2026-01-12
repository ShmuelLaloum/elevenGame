import { v4 as uuidv4 } from 'uuid';
import type { Card, Rank, Suit } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: uuidv4(),
        suit,
        rank,
        value: getCardValue(rank),
      });
    }
  }

  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const getCardValue = (rank: Rank): number => {
  if (rank === 'A') return 1;
  if (['J', 'Q', 'K'].includes(rank)) {
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
  }
  return parseInt(rank);
};
