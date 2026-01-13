import { motion } from "framer-motion";
import { Button } from "./Button";
import type { Player } from "../types";
import { calculateScore } from "../engine/scoring";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";

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
  if (!isOpen) return null;

  // Check for Game Winner (First to 60)
  const winner = players.find((p) => p.score >= 60);
  const isGrandVictory = !!winner;
  const finalGameOver = gameOver || isGrandVictory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
      >
        {/* Victory Header */}
        <div
          className={clsx(
            "p-6 text-center border-b border-slate-800",
            isGrandVictory ? "bg-yellow-900/40" : "bg-slate-950"
          )}
        >
          <h2
            className={clsx(
              "text-3xl font-bold bg-clip-text text-transparent",
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

        <div className="p-8 grid md:grid-cols-2 gap-8">
          {players.map((p) => {
            // We need to calculate THIS ROUND's breakdown.
            // But 'p.score' is the Total Score.
            // We can recalculate the breakdown for display.
            const breakdown = calculateScore(p);
            const isWinner = p.id === winner?.id;

            return (
              <div
                key={p.id}
                className={clsx(
                  "rounded-xl p-6 border transition-all duration-500",
                  isWinner
                    ? "border-yellow-500 bg-yellow-900/20 shadow-[0_0_30px_rgba(234,179,8,0.3)] transform scale-105"
                    : p.isBot
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-blue-900/20 border-blue-500/30"
                )}
              >
                <h3
                  className={clsx(
                    "text-xl font-bold mb-2",
                    isWinner ? "text-yellow-400" : "text-slate-200"
                  )}
                >
                  {p.name}
                  {isWinner && " 👑"}
                </h3>
                <div className="text-5xl font-black text-white mb-4">
                  <AnimatedNumber value={p.score} />{" "}
                  <span className="text-sm font-normal text-slate-500">
                    Total
                  </span>
                </div>

                <div className="w-full text-sm text-slate-400 flex flex-col gap-2 bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex justify-between border-b border-slate-700 pb-1">
                    <span>Aces ({breakdown.aces})</span>
                    <span className="text-emerald-400">+{breakdown.aces}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-1">
                    <span>Jacks ({breakdown.jacks})</span>
                    <span className="text-emerald-400">+{breakdown.jacks}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-1">
                    <span>10 ♦</span>
                    <span className="text-emerald-400">
                      +{breakdown.bigCasino}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-1">
                    <span>2 ♣</span>
                    <span className="text-emerald-400">
                      +{breakdown.littleCasino}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-1">
                    <span>Clubs ({breakdown.clubsCount})</span>
                    <span className="text-emerald-400">
                      +{breakdown.clubsPoints}
                    </span>
                  </div>
                  {/* Scopa Bonus Row */}
                  {breakdown.scopas > 0 && (
                    <div className="flex justify-between border-b border-slate-700 pb-1 font-bold bg-yellow-900/20 px-1 -mx-1 rounded">
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

        <div className="flex justify-center pb-8">
          <div className="flex justify-center pb-8 gap-4">
            {finalGameOver ? (
              <>
                <Button
                  onClick={onExit}
                  variant="outline"
                  className="px-8 py-4 text-xl"
                >
                  Return to Menu
                </Button>
                <Button
                  onClick={onRestart}
                  className="px-8 py-4 text-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Restart Game
                </Button>
              </>
            ) : (
              <Button
                onClick={onNextRound}
                className="px-12 py-4 text-xl shadow-lg hover:shadow-xl transition-all"
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
