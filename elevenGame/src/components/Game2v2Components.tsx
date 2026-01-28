import { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import type { Player, TeamInfo } from "../types";

// Props for 2v2 Player Corner component
interface PlayerCornerProps {
  player: Player;
  team: TeamInfo;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  isActivePlayer: boolean;
  isLocalPlayer: boolean;
  dealPhase: "init" | "hands" | "board";
  isFirstDeal: boolean;
  dealDelay: number;
  revealingCardId?: string | null;
  isPaused: boolean;
  phase: string;
  isDealing: boolean;
  isAnimating: boolean;
}

// Turn Timer Circle for 2v2 players
const TurnTimerCircle2v2 = memo(
  ({
    isActive,
    isPaused,
    color,
  }: {
    isActive: boolean;
    isPaused: boolean;
    color: string;
  }) => {
    if (!isActive || isPaused) return null;

    return (
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          boxShadow: `0 0 0 3px ${color}, 0 0 15px ${color}`,
        }}
      />
    );
  },
);

// Single player corner display for 2v2 layout
export const PlayerCorner2v2 = memo(
  ({
    player,
    team,
    position,
    isActivePlayer,
    isLocalPlayer,
    dealPhase,
    isFirstDeal,
    dealDelay,
    revealingCardId,
    isPaused,
    phase,
    isDealing,
    isAnimating,
  }: PlayerCornerProps) => {
    // Position classes for each corner
    const positionClasses = {
      "top-left": "top-2 left-2 sm:top-4 sm:left-4",
      "top-right": "top-2 right-2 sm:top-4 sm:right-4",
      "bottom-left": "bottom-20 left-2 sm:bottom-24 sm:left-4",
      "bottom-right": "bottom-20 right-2 sm:bottom-24 sm:right-4",
    };

    // Team colors
    const isTeam1 = team.teamIndex === 0;
    const teamBorderColor = isTeam1
      ? "border-blue-500/50"
      : "border-red-500/50";
    const teamBgColor = isTeam1 ? "bg-blue-500/10" : "bg-red-500/10";

    return (
      <motion.div
        className={`fixed ${positionClasses[position]} z-30 flex flex-col items-center gap-1`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Player Avatar & Info */}
        <div
          className={`relative flex flex-col items-center gap-0.5 p-1.5 sm:p-2 rounded-lg ${teamBgColor} border ${teamBorderColor}`}
        >
          {/* Avatar */}
          <div className="relative">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${
                isLocalPlayer
                  ? "bg-gradient-to-br from-emerald-400 to-teal-600"
                  : player.isBot
                    ? "bg-gradient-to-br from-orange-400 to-red-500"
                    : "bg-gradient-to-br from-purple-400 to-pink-500"
              }`}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <TurnTimerCircle2v2
              isActive={
                isActivePlayer &&
                phase === "playing" &&
                !isDealing &&
                !isAnimating &&
                !revealingCardId
              }
              isPaused={isPaused}
              color={isLocalPlayer ? "#10b981" : "#ef4444"}
            />
          </div>

          {/* Name */}
          <span className="text-[10px] sm:text-xs text-white font-medium truncate max-w-[60px] sm:max-w-[80px]">
            {isLocalPlayer ? "You" : player.name}
          </span>

          {/* Card Count Indicator */}
          <span className="text-[9px] sm:text-[10px] text-slate-400">
            🃏 {player.hand.length}
          </span>
        </div>

        {/* Hand (only show for non-local players as small card icons) */}
        {!isLocalPlayer && (
          <div className="flex gap-0.5 mt-1">
            {player.hand.map((card, idx) => (
              <motion.div
                key={card.id}
                className="w-3 h-4 sm:w-4 sm:h-5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm border border-blue-400/50"
                initial={
                  isFirstDeal && dealPhase === "init"
                    ? { opacity: 0, scale: 0 }
                    : { opacity: 1, scale: 1 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: dealDelay + idx * 0.1 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  },
);

// Team Score Panel for 2v2
interface TeamScorePanelProps {
  team: TeamInfo;
  teamPlayers: Player[];
  position: "left" | "right";
}

export const TeamScorePanel = memo(
  ({ team, teamPlayers, position }: TeamScorePanelProps) => {
    const isLeft = position === "left";
    const positionClass = isLeft ? "left-2 sm:left-4" : "right-2 sm:right-4";
    const bgClass = isLeft
      ? "bg-gradient-to-r from-blue-900/80 to-blue-800/60"
      : "bg-gradient-to-l from-red-900/80 to-red-800/60";
    const borderClass = isLeft ? "border-blue-500/50" : "border-red-500/50";

    return (
      <motion.div
        className={`fixed top-1/2 -translate-y-1/2 ${positionClass} z-20`}
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className={`${bgClass} border ${borderClass} rounded-xl p-2 sm:p-3 flex flex-col items-center gap-2`}
        >
          {/* Team Label */}
          <span className="text-[10px] sm:text-xs text-white/70 font-medium uppercase tracking-wider">
            {isLeft ? "Team 1" : "Team 2"}
          </span>

          {/* Team Score */}
          <div className="flex items-center gap-1">
            <Trophy
              size={14}
              className={isLeft ? "text-blue-400" : "text-red-400"}
            />
            <span className="text-lg sm:text-xl font-black text-white">
              {team.score}
            </span>
          </div>

          {/* Team Scopas/Bonuses */}
          <div className="flex items-center gap-1">
            <Sparkles size={12} className="text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">
              {team.roundScopas}
            </span>
          </div>

          {/* Team Captured Cards */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-slate-400">Captured</span>
            <span className="text-sm font-bold text-white">
              {team.capturedCards.length}
            </span>
          </div>

          {/* Player Names */}
          <div className="flex flex-col items-center gap-0.5 mt-1 border-t border-white/10 pt-1">
            {teamPlayers.map((p) => (
              <span
                key={p.id}
                className="text-[9px] sm:text-[10px] text-white/60 truncate max-w-[50px]"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  },
);
