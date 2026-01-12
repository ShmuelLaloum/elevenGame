import type { GameState, Card, Player } from "../types";
import { getValidCaptures } from "./rules";
import { shuffleDeck, createDeck } from "../utils/deck";
import { determineWinnerPoints } from "./scoring";

export class GameEngine {
  /*
    Execute a move.
    move: { handCard: Card, capturedCards: Card[] | null }
    If capturedCards is null/empty, it's a "throw" (trailing the card).
  */
  static executeMove(
    state: GameState,
    handCardId: string,
    captureCardIds: string[]
  ): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const handCard = activePlayer.hand.find((c) => c.id === handCardId);

    if (!handCard) throw new Error("Card not in hand");

    const captureCards = state.board.filter((c) =>
      captureCardIds.includes(c.id)
    );

    const isCapture = captureCards.length > 0;
    let newBonusEvent: { playerId: string; timestamp: number } | undefined;

    const nextPlayers = state.players.map((p) => {
      if (p.id === activePlayer.id) {
        return {
          ...p,
          hand: p.hand.filter((c) => c.id !== handCardId),
          capturedCards: isCapture
            ? [...p.capturedCards, handCard, ...captureCards]
            : p.capturedCards,
        };
      }
      return p;
    });

    let nextBoard = state.board;
    if (isCapture) {
      nextBoard = nextBoard.filter((c) => !captureCardIds.includes(c.id));
    } else {
      nextBoard = [...nextBoard, handCard];
    }

    // Scopa Check
    // If board is empty after capture, AND it was NOT a Jack (Unless Jack matches Jack only, but broad Jack takes all rule usually doesn't count as Scopa)
    // User: "Not by Prince". So if handCard.rank === 'J', no Scopa.
    let nextActiveScopaIndex = state.activeScopaPlayerIndex;

    if (isCapture && nextBoard.length === 0 && handCard.rank !== "J") {
      // Scopa Event!
      // Offset Logic:
      // Opponent has bonus? Decrement them. Else increment me.

      const opponentIndex =
        (state.activePlayerIndex + 1) % state.players.length;
      const opponent = nextPlayers[opponentIndex];
      const me = nextPlayers[state.activePlayerIndex];

      if (opponent.roundScopas > 0) {
        // Offset! Remove 1 from opponent.
        nextPlayers[opponentIndex] = {
          ...opponent,
          roundScopas: opponent.roundScopas - 1,
        };
        // Me stays same.
      } else {
        // Add to me
        nextPlayers[state.activePlayerIndex] = {
          ...me,
          roundScopas: me.roundScopas + 1,
        };
      }

      // Trigger UI Event with unique timestamp
      newBonusEvent = { playerId: activePlayer.id, timestamp: Date.now() };

      // Update tracker
      nextActiveScopaIndex = state.activePlayerIndex;
    }

    // Last Capturer
    const lastCapturingPlayerIndex = isCapture
      ? state.activePlayerIndex
      : state.lastCapturingPlayerIndex;

    // Check for Round End
    const allHandsEmpty = nextPlayers.every((p) => p.hand.length === 0);
    let nextPhase = state.phase;
    let nextDeck = state.deck;
    let nextRound = state.round;

    if (allHandsEmpty) {
      if (nextDeck.length > 0) {
        // Deal more
        const dealSize = 4;
        const dealResult = this.dealCards(nextDeck, nextPlayers, dealSize);
        nextDeck = dealResult.deck;
        // Update players with new hands
        // Note: dealCards needs to return updated players
        // We can implement helper for dealing
        return {
          ...state,
          deck: nextDeck,
          players: dealResult.players,
          board: nextBoard,
          activePlayerIndex:
            (state.activePlayerIndex + 1) % state.players.length,
          lastCapturingPlayerIndex,
          round: state.round + 1, // technically sub-round
        };
      } else {
        // Deck empty, Round Over (Game Over or just End of Deal?)
        // If deck is empty and hands are empty, standard round is over.
        // Assign remaining board cards to last capturer
        if (nextBoard.length > 0 && lastCapturingPlayerIndex !== null) {
          const lastCapturer = nextPlayers[lastCapturingPlayerIndex];
          lastCapturer.capturedCards = [
            ...lastCapturer.capturedCards,
            ...nextBoard,
          ];
          nextBoard = [];
          // Update players array
          nextPlayers[lastCapturingPlayerIndex] = lastCapturer;
        }
        nextPhase = "scoring";

        // Calculate Round Scores and Update Total
        const p1 = nextPlayers[0];
        const p2 = nextPlayers[1];

        // Scopa Bonus Calculation
        // Now calculated within each player's structure via roundScopas
        const p1ScopaBonus = 0; // Handled internally now
        const p2ScopaBonus = 0; // Handled internally now

        // Calculate breakdown
        const results = determineWinnerPoints(p1, p2);

        // Update Players with new totals
        nextPlayers[0] = { ...p1, score: p1.score + results.p1.total };
        nextPlayers[1] = { ...p2, score: p2.score + results.p2.total };
      }
    }

    return {
      ...state,
      deck: nextDeck,
      players: nextPlayers,
      board: nextBoard,
      activePlayerIndex: allHandsEmpty
        ? state.activePlayerIndex
        : (state.activePlayerIndex + 1) % state.players.length, // Only switch if not dealing? Or dealing handles switching?
      // Usually after dealing, same player continues? Or dealer changes?
      // Simplified: Turn passes after every move.
      // Let's keep simple turn rotation.
      phase: nextPhase,
      lastCapturingPlayerIndex,
      activeScopaPlayerIndex: nextActiveScopaIndex,
      lastBonusEvent:
        typeof newBonusEvent !== "undefined"
          ? newBonusEvent
          : state.lastBonusEvent,
    };
  }

  static dealCards(
    deck: Card[],
    players: Player[],
    count: number
  ): { deck: Card[]; players: Player[] } {
    let currentDeck = [...deck];
    const newPlayers = players.map((p) => {
      const newHand = [...p.hand];
      for (let i = 0; i < count; i++) {
        if (currentDeck.length > 0) {
          newHand.push(currentDeck.shift()!);
        }
      }
      return { ...p, hand: newHand };
    });
    return { deck: currentDeck, players: newPlayers };
  }

  static initializeGame(playerNames: string[]): GameState {
    let deck = shuffleDeck(createDeck());
    // Deal 4 to board
    const board: Card[] = [];
    for (let i = 0; i < 4; i++) board.push(deck.shift()!);

    // Create Players
    let players: Player[] = playerNames.map((name) => ({
      id: name, // simplified
      name,
      hand: [],
      capturedCards: [],
      score: 0,
      isBot: name === "Bot",
      roundScopas: 0,
    }));

    // Deal 4 to each player
    const dealRes = this.dealCards(deck, players, 4);

    return {
      deck: dealRes.deck,
      players: dealRes.players,
      board,
      activePlayerIndex: 0,
      round: 1,
      phase: "playing",
      lastCapturingPlayerIndex: null,
      activeScopaPlayerIndex: null,
    };
  }
}
