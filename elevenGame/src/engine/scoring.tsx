import type { Player, TeamInfo, Card } from "../types";

export interface ScoreBreakdown {
  clubsCount: number;
  jacks: number;
  aces: number;
  bigCasino: number; // 10 Diamonds
  littleCasino: number; // 2 Clubs
  scopas: number;
  total: number;
  clubsPoints: number; // Added to distinguish the bonus
}

// Calculate score from a set of captured cards (shared by player and team scoring)
const calculateScoreFromCards = (
  capturedCards: Card[],
  roundScopas: number,
  bonusMultiplier: number = 5, // 5 for 1v1, 10 for 2v2
): ScoreBreakdown => {
  const clubsCount = capturedCards.filter((c) => c.suit === "clubs").length;
  const aces = capturedCards.filter((c) => c.rank === "A").length;
  const jacks = capturedCards.filter((c) => c.rank === "J").length;

  const bigCasino = capturedCards.some(
    (c) => c.rank === "10" && c.suit === "diamonds",
  )
    ? 3
    : 0;
  const littleCasino = capturedCards.some(
    (c) => c.rank === "2" && c.suit === "clubs",
  )
    ? 2
    : 0;

  // Clubs Majority Points (>= 7 clubs) -> 7 points
  const clubsPoints = clubsCount >= 7 ? 7 : 0;

  // Scopa Points: 5 points per bonus in 1v1, 10 points in 2v2
  const currentScopas = roundScopas || 0;
  const scopaPoints = currentScopas * bonusMultiplier;

  // Total Score
  const total =
    aces + jacks + bigCasino + littleCasino + clubsPoints + scopaPoints;

  return {
    clubsCount,
    aces,
    jacks,
    bigCasino,
    littleCasino,
    scopas: currentScopas,
    clubsPoints,
    total,
  };
};

export const calculateScore = (player: Player): ScoreBreakdown => {
  return calculateScoreFromCards(player.capturedCards, player.roundScopas, 5);
};

export const calculateTeamScore = (team: TeamInfo): ScoreBreakdown => {
  // Teams use 10 points per scopa bonus
  return calculateScoreFromCards(team.capturedCards, team.roundScopas, 10);
};

export const determineWinnerPoints = (p1: Player, p2: Player) => {
  const s1 = calculateScore(p1);
  const s2 = calculateScore(p2);

  return {
    p1: { ...s1, grandTotal: s1.total },
    p2: { ...s2, grandTotal: s2.total },
  };
};

export const determineTeamWinnerPoints = (team1: TeamInfo, team2: TeamInfo) => {
  const s1 = calculateTeamScore(team1);
  const s2 = calculateTeamScore(team2);

  return {
    team1: { ...s1, grandTotal: s1.total },
    team2: { ...s2, grandTotal: s2.total },
  };
};
