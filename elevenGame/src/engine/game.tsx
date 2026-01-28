import type { GameState, Card, Player, GameMode, TeamInfo } from "../types";
import { shuffleDeck, createDeck } from "../utils/deck";
import { determineWinnerPoints, determineTeamWinnerPoints } from "./scoring";

// Helper to get team index for a player
const getPlayerTeamIndex = (
  playerIndex: number,
  playerCount: number,
): number => {
  // In 2v2: players 0,2 are on team 0, players 1,3 are on team 1
  // This places teammates diagonally opposite each other
  if (playerCount === 4) {
    return playerIndex % 2;
  }
  // In 1v1: each player is on their own "team"
  return playerIndex;
};

export class GameEngine {
  /*
    Execute a move.
    move: { handCard: Card, capturedCards: Card[] | null }
    If capturedCards is null/empty, it's a "throw" (trailing the card).
  */
  static executeMove(
    state: GameState,
    handCardId: string,
    captureCardIds: string[],
  ): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const handCard = activePlayer.hand.find((c) => c.id === handCardId);
    const is2v2 = state.gameMode === "2v2";

    if (!handCard) throw new Error("Card not in hand");

    const captureCards = state.board.filter((c) =>
      captureCardIds.includes(c.id),
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

    // Also update team captured cards in 2v2 mode
    let nextTeams = state.teams
      ? [
          ...state.teams.map((t) => ({
            ...t,
            capturedCards: [...t.capturedCards],
          })),
        ]
      : undefined;
    if (is2v2 && nextTeams && isCapture) {
      const teamIndex = getPlayerTeamIndex(
        state.activePlayerIndex,
        state.players.length,
      );
      nextTeams[teamIndex].capturedCards = [
        ...nextTeams[teamIndex].capturedCards,
        handCard,
        ...captureCards,
      ];
    }

    let nextBoard = state.board;
    if (isCapture) {
      nextBoard = nextBoard.filter((c) => !captureCardIds.includes(c.id));
    } else {
      nextBoard = [...nextBoard, handCard];
    }

    // Scopa Check
    // If board is empty after capture, AND it was NOT a Jack
    let nextActiveScopaIndex = state.activeScopaPlayerIndex;

    if (isCapture && nextBoard.length === 0 && handCard.rank !== "J") {
      // Scopa Event!
      if (is2v2 && nextTeams) {
        // 2v2 Mode: Team-based scopa logic (10 points per bonus)
        const myTeamIndex = getPlayerTeamIndex(
          state.activePlayerIndex,
          state.players.length,
        );
        const opponentTeamIndex = myTeamIndex === 0 ? 1 : 0;

        if (nextTeams[opponentTeamIndex].roundScopas > 0) {
          // Offset! Remove 1 from opponent team
          nextTeams[opponentTeamIndex] = {
            ...nextTeams[opponentTeamIndex],
            roundScopas: nextTeams[opponentTeamIndex].roundScopas - 1,
          };
        } else {
          // Add to my team
          nextTeams[myTeamIndex] = {
            ...nextTeams[myTeamIndex],
            roundScopas: nextTeams[myTeamIndex].roundScopas + 1,
          };
        }
      } else {
        // 1v1 Mode: Original per-player logic (5 points per bonus)
        const opponentIndex =
          (state.activePlayerIndex + 1) % state.players.length;
        const opponent = nextPlayers[opponentIndex];
        const me = nextPlayers[state.activePlayerIndex];

        if (opponent.roundScopas > 0) {
          nextPlayers[opponentIndex] = {
            ...opponent,
            roundScopas: opponent.roundScopas - 1,
          };
        } else {
          nextPlayers[state.activePlayerIndex] = {
            ...me,
            roundScopas: me.roundScopas + 1,
          };
        }
      }

      // Trigger UI Event with unique timestamp
      newBonusEvent = { playerId: activePlayer.id, timestamp: Date.now() };
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

    if (allHandsEmpty) {
      if (nextDeck.length > 0) {
        // Deal more
        const dealSize = 4;
        const dealResult = this.dealCards(
          nextDeck,
          nextPlayers,
          dealSize,
          state.dealOrder,
        );
        nextDeck = dealResult.deck;

        return {
          ...state,
          deck: nextDeck,
          players: dealResult.players,
          board: nextBoard,
          teams: nextTeams,
          activePlayerIndex: state.dealOrder ?? 0,
          lastCapturingPlayerIndex,
          round: state.round + 1,
          dealOrder: state.dealOrder,
        };
      } else {
        // Deck empty, Round Over
        // Assign remaining board cards to last capturer
        if (nextBoard.length > 0 && lastCapturingPlayerIndex !== null) {
          const lastCapturer = nextPlayers[lastCapturingPlayerIndex];
          lastCapturer.capturedCards = [
            ...lastCapturer.capturedCards,
            ...nextBoard,
          ];

          // Also add to team in 2v2
          if (is2v2 && nextTeams) {
            const teamIndex = getPlayerTeamIndex(
              lastCapturingPlayerIndex,
              state.players.length,
            );
            nextTeams[teamIndex].capturedCards = [
              ...nextTeams[teamIndex].capturedCards,
              ...nextBoard,
            ];
          }

          nextBoard = [];
          nextPlayers[lastCapturingPlayerIndex] = lastCapturer;
        }
        nextPhase = "scoring";

        // Calculate Round Scores
        if (is2v2 && nextTeams) {
          // 2v2: Calculate team scores
          const results = determineTeamWinnerPoints(nextTeams[0], nextTeams[1]);
          nextTeams[0] = {
            ...nextTeams[0],
            score: nextTeams[0].score + results.team1.total,
          };
          nextTeams[1] = {
            ...nextTeams[1],
            score: nextTeams[1].score + results.team2.total,
          };
        } else {
          // 1v1: Original per-player scoring
          const p1 = nextPlayers[0];
          const p2 = nextPlayers[1];
          const results = determineWinnerPoints(p1, p2);
          nextPlayers[0] = { ...p1, score: p1.score + results.p1.total };
          nextPlayers[1] = { ...p2, score: p2.score + results.p2.total };
        }
      }
    }

    return {
      ...state,
      deck: nextDeck,
      players: nextPlayers,
      board: nextBoard,
      teams: nextTeams,
      activePlayerIndex: allHandsEmpty
        ? state.activePlayerIndex
        : (state.activePlayerIndex + 1) % state.players.length,
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
    count: number,
    dealOrder: number = 0,
  ): { deck: Card[]; players: Player[] } {
    let currentDeck = [...deck];
    const newPlayers = [...players];

    // Sort player indices based on deal order
    const indices = players.map((_, i) => (i + dealOrder) % players.length);

    indices.forEach((idx) => {
      const p = newPlayers[idx];
      const newHand = [...p.hand];
      for (let i = 0; i < count; i++) {
        if (currentDeck.length > 0) {
          newHand.push(currentDeck.shift()!);
        }
      }
      newPlayers[idx] = { ...p, hand: newHand };
    });

    return { deck: currentDeck, players: newPlayers };
  }

  static initializeGame(
    playerNames: string[],
    forcedDealOrder?: number,
    gameMode?: GameMode,
  ): GameState {
    let deck = shuffleDeck(createDeck());
    const is2v2 = gameMode === "2v2" || playerNames.length === 4;
    const actualGameMode: GameMode = is2v2 ? "2v2" : "1v1";

    const dealOrder =
      forcedDealOrder !== undefined
        ? forcedDealOrder
        : Math.floor(Math.random() * playerNames.length);

    // Create players first (empty hands)
    let players: Player[] = playerNames.map((name, index) => ({
      id: name,
      name,
      hand: [],
      capturedCards: [],
      score: 0,
      isBot: name === "Bot" || name.includes("Bot"),
      roundScopas: 0,
      teamIndex: is2v2
        ? getPlayerTeamIndex(index, playerNames.length)
        : undefined,
    }));

    // Sequential Dealing for 2v2: Player by Player (4 cards each)
    const dealIndices = players.map((_, i) => (i + dealOrder) % players.length);

    dealIndices.forEach((idx) => {
      const p = players[idx];
      const newHand: Card[] = [];
      for (let i = 0; i < 4; i++) {
        if (deck.length > 0) newHand.push(deck.shift()!);
      }
      players[idx] = { ...p, hand: newHand };
    });

    // Deal 4 to board AFTER players (as requested)
    const board: Card[] = [];
    for (let i = 0; i < 4; i++) {
      if (deck.length > 0) board.push(deck.shift()!);
    }

    // Create teams for 2v2 mode
    let teams: TeamInfo[] | undefined;
    if (is2v2) {
      teams = [
        {
          teamIndex: 0,
          score: 0,
          roundScopas: 0,
          capturedCards: [],
          playerIds: players.filter((p) => p.teamIndex === 0).map((p) => p.id),
        },
        {
          teamIndex: 1,
          score: 0,
          roundScopas: 0,
          capturedCards: [],
          playerIds: players.filter((p) => p.teamIndex === 1).map((p) => p.id),
        },
      ];
    }

    return {
      deck: deck,
      players: players,
      board,
      activePlayerIndex: dealOrder,
      round: 1,
      phase: "playing",
      lastCapturingPlayerIndex: null,
      activeScopaPlayerIndex: null,
      dealOrder,
      gameMode: actualGameMode,
      teams,
    };
  }
}
