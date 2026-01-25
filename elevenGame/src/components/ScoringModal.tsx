import { motion } from "framer-motion";
import { Button } from "./Button";
import type { Player } from "../types";
import { calculateScore } from "../engine/scoring";
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
  const previousValueRef = useRef(value); // Store the previous value

  useEffect(() => {
    const start = previousValueRef.current;
    const end = value;

    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1000;
    const incrementTime = 20; // 50fps
    const steps = duration / incrementTime;
    const increment = (end - start) / steps;

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      // Check if we've passed the target value, considering both increasing and decreasing
      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, incrementTime);

    previousValueRef.current = value; // Update previous value for the next render

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue}</>;
};

export const ScoringModal = ({
  isOpen,
  players,
  onNextRound,
  onRestart,
  onExit,
  gameOver,
}: ScoringModalProps) => {
  const { category } = useGameStore();

  if (!isOpen) return null;

  // Check for Game Winner (First to 60)
  const winner = players.find((p) => p.score >= 60);
  const isGrandVictory = !!winner;
  const finalGameOver = gameOver || isGrandVictory;

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
            isGrandVictory ? "bg-yellow-900/40" : "bg-slate-950"
          )}
        >
          <h2
            className={clsx(
              "text-xl sm:text-3xl font-black bg-clip-text text-transparent",
              isGrandVictory
                ? "bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-pulse uppercase tracking-wider"
                : "bg-gradient-to-r from-blue-400 to-purple-400"
            )}
          >
            {isGrandVictory
              ? `🏆 ${winner?.name} Wins! 🏆`
              : gameOver
              ? "Game Over"
              : "Round Complete"}
          </h2>
        </div>

        <div className="p-3 sm:p-8 grid grid-cols-2 gap-3 sm:gap-8 overflow-y-auto no-scrollbar">
          {players.map((p) => {
            const breakdown = calculateScore(p);
            const isWinner = p.id === winner?.id;

            return (
              <div
                key={p.id}
                className={clsx(
                  "rounded-2xl p-3 sm:p-6 border transition-all duration-500 flex flex-col",
                  isWinner
                    ? "border-yellow-500 bg-yellow-900/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                    : p.isBot
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-blue-900/20 border-blue-500/30"
                )}
              >
                <h3
                  className={clsx(
                    "text-xs sm:text-xl font-bold mb-1 sm:mb-2 break-words line-clamp-2",
                    isWinner ? "text-yellow-400" : "text-slate-200"
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
                    <span className="text-emerald-400">+{breakdown.aces}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-0.5 sm:pb-1">
                    <span className="truncate">Jacks ({breakdown.jacks})</span>
                    <span className="text-emerald-400">+{breakdown.jacks}</span>
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
                        +{(breakdown.scopas || 0) * 5}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
