import { motion } from "framer-motion";
import { Button } from "./Button";
import type { Player, TeamInfo } from "../types";
import { calculateScore, calculateTeamScore } from "../engine/scoring";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import { useGameStore } from "../store/gameStore";

interface ScoringModalProps {
  isOpen: boolean;
  players: Player[];
  activeScopaPlayerIndex?: number | null;
  onNextRound: () => void;
  onRestart?: () => void;
  onExit?: () => void;
  gameOver: boolean;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = previousValueRef.current;
    const end = value;

    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1000;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const current = start + (end - start) * progress;
      setDisplayValue(Math.floor(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      } else {
        setDisplayValue(end);
      }
    };

    rafRef.current = requestAnimationFrame(update);
    previousValueRef.current = value;

    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{displayValue}</>;
};

// Team Score Card Component for 2v2
const TeamScoreCard = ({
  team,
  teamPlayers,
  isWinner,
  bonusMultiplier,
}: {
  team: TeamInfo;
  teamPlayers: Player[];
  isWinner: boolean;
  bonusMultiplier: number;
}) => {
  const breakdown = calculateTeamScore(team);

  return (
    <div
      className={clsx(
        "rounded-2xl p-3 sm:p-6 border transition-all duration-500 flex flex-col",
        isWinner
          ? "border-yellow-500 bg-yellow-900/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          : "bg-slate-800/50 border-slate-700",
      )}
    >
      <h3
        className={clsx(
          "text-xs sm:text-xl font-bold mb-1 sm:mb-2",
          isWinner ? "text-yellow-400" : "text-slate-200",
        )}
      >
        Team {team.teamIndex + 1}
        {isWinner && " 👑"}
      </h3>

      {/* Team Players */}
      <div className="flex gap-1 mb-2">
        {teamPlayers.map((p) => (
          <span
            key={p.id}
            className="text-[9px] sm:text-xs px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300"
          >
            {p.name}
          </span>
        ))}
      </div>

      <div className="text-2xl sm:text-5xl font-black text-white mb-2 sm:mb-4">
        <AnimatedNumber value={team.score} />{" "}
        <span className="text-[10px] sm:text-sm font-normal text-slate-500 block sm:inline">
          Total
        </span>
      </div>

      <div className="w-full text-[10px] sm:text-sm text-slate-400 flex flex-col gap-1 sm:gap-2 bg-slate-900/50 p-2 sm:p-4 rounded-xl">
        <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
          <span className="truncate">Aces ({breakdown.aces})</span>
          <span className="text-emerald-400">+{breakdown.aces}</span>
        </div>
        <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
          <span className="truncate">Jacks ({breakdown.jacks})</span>
          <span className="text-emerald-400">+{breakdown.jacks}</span>
        </div>
        <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
          <span>10 ♦</span>
          <span className="text-emerald-400">+{breakdown.bigCasino}</span>
        </div>
        <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
          <span>2 ♣</span>
          <span className="text-emerald-400">+{breakdown.littleCasino}</span>
        </div>
        <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
          <span className="truncate">Clubs ({breakdown.clubsCount})</span>
          <span className="text-emerald-400">+{breakdown.clubsPoints}</span>
        </div>
        {breakdown.scopas > 0 && (
          <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1 font-bold bg-yellow-900/20 px-1 -mx-0.5 sm:-mx-1 rounded">
            <span className="text-yellow-400">Bonus x{breakdown.scopas}</span>
            <span className="text-yellow-400">
              +{breakdown.scopas * bonusMultiplier}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ScoringModal = ({
  isOpen,
  players,
  onNextRound,
  onRestart,
  onExit,
  gameOver,
}: ScoringModalProps) => {
  const { category, gameMode, teams } = useGameStore();
  const is2v2 = gameMode === "2v2" && teams && teams.length === 2;

  if (!isOpen) return null;

  // Determine winning threshold based on game mode
  const winThreshold = is2v2 ? 124 : 62;
  const bonusMultiplier = is2v2 ? 10 : 5;

  // Check for Game Winner
  const winner = (() => {
    if (is2v2 && teams) {
      // 2v2: Check team scores
      const t1 = teams[0];
      const t2 = teams[1];
      if (t1.score < winThreshold && t2.score < winThreshold) return null;
      if (t1.score === t2.score) return null;
      return t1.score > t2.score
        ? { type: "team" as const, team: t1, teamIndex: 0 }
        : { type: "team" as const, team: t2, teamIndex: 1 };
    } else {
      // 1v1: Check player scores
      const p1 = players[0];
      const p2 = players[1];
      if (!p1 || !p2) return null;
      if (p1.score < winThreshold && p2.score < winThreshold) return null;
      if (p1.score === p2.score) return null;
      return { type: "player" as const, player: p1.score > p2.score ? p1 : p2 };
    }
  })();

  const isGrandVictory = !!winner;
  const finalGameOver = gameOver || isGrandVictory;

  // Get winner name for display
  const getWinnerName = () => {
    if (!winner) return "";
    if (winner.type === "team") {
      const teamPlayers = players.filter(
        (p) => p.teamIndex === winner.teamIndex,
      );
      return `Team ${winner.teamIndex + 1} (${teamPlayers.map((p) => p.name).join(" & ")})`;
    }
    if (winner.type === "player") {
      return winner.player.name;
    }
    return "";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[95vh]"
      >
        {/* Victory Header */}
        <div
          className={clsx(
            "p-4 sm:p-6 text-center border-b border-slate-800 shrink-0",
            isGrandVictory ? "bg-yellow-900/40" : "bg-slate-950",
          )}
        >
          <h2
            className={clsx(
              "text-xl sm:text-3xl font-black bg-clip-text text-transparent",
              isGrandVictory
                ? "bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-pulse uppercase tracking-wider"
                : "bg-gradient-to-r from-blue-400 to-purple-400",
            )}
          >
            {isGrandVictory
              ? `🏆 ${getWinnerName()} Wins! 🏆`
              : gameOver
                ? "Game Over"
                : "Round Complete"}
          </h2>
          {is2v2 && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              First to {winThreshold} points wins • {bonusMultiplier} pts per
              bonus
            </p>
          )}
        </div>

        <div className="p-3 sm:p-8 grid grid-cols-2 gap-3 sm:gap-8 overflow-y-auto no-scrollbar">
          {is2v2 && teams ? (
            // 2v2 Mode: Show team scores
            <>
              <TeamScoreCard
                team={teams[0]}
                teamPlayers={players.filter((p) => p.teamIndex === 0)}
                isWinner={winner?.type === "team" && winner.teamIndex === 0}
                bonusMultiplier={bonusMultiplier}
              />
              <TeamScoreCard
                team={teams[1]}
                teamPlayers={players.filter((p) => p.teamIndex === 1)}
                isWinner={winner?.type === "team" && winner.teamIndex === 1}
                bonusMultiplier={bonusMultiplier}
              />
            </>
          ) : (
            // 1v1 Mode: Original player-based scoring (UNCHANGED)
            players.map((p) => {
              const breakdown = calculateScore(p);
              const isWinner =
                winner?.type === "player" && p.id === winner.player.id;

              return (
                <div
                  key={p.id}
                  className={clsx(
                    "rounded-2xl p-3 sm:p-6 border transition-all duration-500 flex flex-col",
                    isWinner
                      ? "border-yellow-500 bg-yellow-900/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                      : p.isBot
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-blue-900/20 border-blue-500/30",
                  )}
                >
                  <h3
                    className={clsx(
                      "text-xs sm:text-xl font-bold mb-1 sm:mb-2 break-words line-clamp-2",
                      isWinner ? "text-yellow-400" : "text-slate-200",
                    )}
                  >
                    {p.name}
                    {isWinner && " 👑"}
                  </h3>
                  <div className="text-2xl sm:text-5xl font-black text-white mb-2 sm:mb-4">
                    <AnimatedNumber value={p.score} />{" "}
                    <span className="text-[10px] sm:text-sm font-normal text-slate-500 block sm:inline">
                      Total
                    </span>
                  </div>

                  <div className="w-full text-[10px] sm:text-sm text-slate-400 flex flex-col gap-1 sm:gap-2 bg-slate-900/50 p-2 sm:p-4 rounded-xl">
                    <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
                      <span className="truncate">Aces ({breakdown.aces})</span>
                      <span className="text-emerald-400">
                        +{breakdown.aces}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
                      <span className="truncate">
                        Jacks ({breakdown.jacks})
                      </span>
                      <span className="text-emerald-400">
                        +{breakdown.jacks}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
                      <span>10 ♦</span>
                      <span className="text-emerald-400">
                        +{breakdown.bigCasino}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
                      <span>2 ♣</span>
                      <span className="text-emerald-400">
                        +{breakdown.littleCasino}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
                      <span className="truncate">
                        Clubs ({breakdown.clubsCount})
                      </span>
                      <span className="text-emerald-400">
                        +{breakdown.clubsPoints}
                      </span>
                    </div>
                    {breakdown.scopas > 0 && (
                      <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1 font-bold bg-yellow-900/20 px-1 -mx-0.5 sm:-mx-1 rounded">
                        <span className="text-yellow-400">
                          Bonus x{breakdown.scopas}
                        </span>
                        <span className="text-yellow-400">
                          +{breakdown.scopas * bonusMultiplier}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 sm:p-8 pt-0 flex justify-center shrink-0">
          <div className="flex gap-2 sm:gap-4 w-full justify-center">
            {finalGameOver ? (
              <>
                <Button
                  onClick={onExit}
                  variant="outline"
                  className="px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-xl flex-1 max-w-[200px]"
                >
                  Return to Lobby
                </Button>
                <Button
                  onClick={onRestart}
                  className="px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-xl shadow-lg hover:shadow-xl transition-all flex-1 max-w-[200px]"
                >
                  {category === "battleRoyale" || category === "arena"
                    ? "Start New Game"
                    : "Restart Game"}
                </Button>
              </>
            ) : (
              <Button
                onClick={onNextRound}
                className="px-10 sm:px-12 py-3 sm:py-4 text-xs sm:text-xl shadow-lg hover:shadow-xl transition-all w-full max-w-sm"
              >
                Next Round
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
