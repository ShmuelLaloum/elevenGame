import type { Player } from "../types";

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

export const calculateScore = (
  player: Player
): ScoreBreakdown => {
  const { capturedCards } = player;

  const clubsCount = capturedCards.filter((c) => c.suit === "clubs").length;
  const aces = capturedCards.filter((c) => c.rank === "A").length;
  const jacks = capturedCards.filter((c) => c.rank === "J").length;

  const bigCasino = capturedCards.some(
    (c) => c.rank === "10" && c.suit === "diamonds"
  )
    ? 3
    : 0;
  // User specified 2 CLUBS for 2 points (usually it's 2 Spades, but following user request for 2 Clubs)
  const littleCasino = capturedCards.some(
    (c) => c.rank === "2" && c.suit === "clubs"
  )
    ? 2
    : 0;

  // Clubs Majority Points ( > 7 clubs) -> 7 points
  // Wait, standard deck has 13 clubs. 7 is majority.
  // We calculate this point *here* or relative to opponent?
  // User said "The player/team with 7+ clubs gets 7 points".
  // So if I have 7, I get 7.

  // Clubs Majority Points ( > 7 clubs) -> 7 points
  const clubsPoints = clubsCount >= 7 ? 7 : 0;

  // Scopa Calculation
  // We use the stored roundScopas from the player object
  const currentScopas = player.roundScopas || 0;
  const scopaPoints = currentScopas * 5; // User said "bonus... add 5" (implied per bonus)

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

export const determineWinnerPoints = (p1: Player, p2: Player) => {
  // We no longer pass explicit scopa points, as they are part of the Player state now
  const s1 = calculateScore(p1); // Second arg ignored or remove from sig
  const s2 = calculateScore(p2);

  return {
    p1: { ...s1, grandTotal: s1.total },
    p2: { ...s2, grandTotal: s2.total },
  };
};
