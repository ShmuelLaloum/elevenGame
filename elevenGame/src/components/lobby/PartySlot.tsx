import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  UserPlus,
  Check,
  Bot,
  ArrowLeftRight,
  UserMinus,
  UserCog,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

interface PartySlotPlayer {
  name: string;
  avatarUrl?: string;
  isReady: boolean;
  isHost: boolean;
  isBot?: boolean;
}

interface PartySlotProps {
  player?: PartySlotPlayer;
  isLocalPlayer?: boolean;
  slotIndex: number;
  onInvite?: () => void;
  onKick?: () => void;
  onToggleReady?: () => void;
  onTransferLeadership?: () => void;
  onSwapClick?: () => void;
  isSelectedForSwap?: boolean;
  showReadyButton?: boolean;
  isLeader?: boolean;
}

export const PartySlot = ({
  player,
  isLocalPlayer = false,
  slotIndex: _slotIndex,
  onInvite,
  onKick,
  onToggleReady,
  onTransferLeadership,
  onSwapClick,
  isSelectedForSwap = false,
  showReadyButton = true,
  isLeader = false,
}: PartySlotProps) => {
  const isEmpty = !player;
  const [showMenu, setShowMenu] = useState(false);

  const handleSlotClick = () => {
    if (onSwapClick && player) {
      onSwapClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-slate-800/80 to-slate-900/90",
        "border-2 backdrop-blur-md shadow-2xl",
        "transition-all duration-200",
        isEmpty
          ? "border-slate-700/50 border-dashed hover:border-blue-400 hover:bg-blue-500/5"
          : player.isReady
          ? "border-emerald-500/70 shadow-emerald-500/20"
          : "border-blue-500/50 shadow-blue-500/10",
        isSelectedForSwap &&
          "ring-4 ring-yellow-400 ring-opacity-80 border-yellow-400",
        onSwapClick && player && "cursor-pointer hover:border-yellow-300"
      )}
      style={{
        width: "clamp(100px, 18vw, 180px)",
        aspectRatio: "3 / 4",
      }}
      onClick={handleSlotClick}
    >
      {/* Ready Pulse Ring */}
      {player?.isReady && !player.isBot && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
          animate={{ scale: [1, 1.03, 1], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Selected for Swap indicator */}
      {isSelectedForSwap && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-yellow-400/20 z-10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {isEmpty ? (
        /* Empty Slot */
        onInvite ? (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onInvite();
            }}
            className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4 group cursor-pointer active:scale-95 transition-transform"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Always visible invite circle */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500/20 border-2 border-blue-400/60 flex items-center justify-center transition-all group-hover:bg-blue-500/30 group-hover:border-blue-400 group-active:bg-blue-500/40">
              <UserPlus className="w-5 h-5 sm:w-7 sm:h-7 text-blue-400 transition-colors" />
            </div>
            <span className="text-blue-400 font-medium text-xs sm:text-sm transition-colors">
              Invite
            </span>
          </motion.button>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-700/30 border-2 border-dashed border-slate-600/50 flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-7 sm:h-7 text-slate-600" />
            </div>
            <span className="text-slate-500 font-medium text-xs sm:text-sm">
              Bot
            </span>
          </div>
        )
      ) : (
        /* Filled Slot */
        <div className="w-full h-full flex flex-col">
          {/* Avatar Section */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Leader Crown - Enhanced */}
            {isLeader && (
              <motion.div
                className="absolute top-5 left-1/2 -translate-x-1/2 z-20"
                initial={{ y: -20, opacity: 0, scale: 0 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-yellow-400/50 rounded-full blur-md"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative bg-gradient-to-b from-yellow-300 to-amber-500 rounded-full p-1.5 shadow-lg border border-yellow-300/50">
                    <Crown
                      className="w-5 h-5 text-yellow-900"
                      fill="currentColor"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Avatar */}
            <motion.div
              className={clsx(
                "w-20 h-20 rounded-full overflow-hidden",
                player.isBot
                  ? "bg-gradient-to-br from-slate-600 to-slate-700"
                  : "bg-gradient-to-br from-blue-500 to-purple-600",
                "border-3 shadow-xl",
                player.isReady ? "border-emerald-400" : "border-slate-600"
              )}
              whileHover={{ scale: 1.05 }}
            >
              {player.isBot ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Bot className="w-10 h-10 text-slate-300" />
                </div>
              ) : player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                  {player.name.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>

            {/* Player Menu Button (for leader actions) */}
            {!isLocalPlayer &&
              !player.isBot &&
              (onKick || onTransferLeadership) && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-all z-20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <UserCog size={14} />
                </motion.button>
              )}

            {/* Player Actions Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  className="absolute top-10 right-1 z-30 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onTransferLeadership && (
                    <button
                      onClick={() => {
                        onTransferLeadership();
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-yellow-400 transition-colors"
                    >
                      <Crown size={14} />
                      Make Leader
                    </button>
                  )}
                  {onKick && (
                    <button
                      onClick={() => {
                        onKick();
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <UserMinus size={14} />
                      Kick Player
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Swap Indicator */}
            {onSwapClick && player && !player.isBot && (
              <motion.div
                className="absolute bottom-2 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
              >
                <ArrowLeftRight size={14} className="text-slate-400" />
              </motion.div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-3 bg-slate-900/50 border-t border-slate-700/50">
            <h3 className="text-base font-bold text-white text-center truncate mb-2">
              {player.name}
              {isLeader && <span className="text-yellow-400 ml-1">★</span>}
            </h3>

            {/* Ready Status / Toggle */}
            {player.isBot ? (
              <div className="w-full py-1.5 rounded-lg bg-slate-700/50 text-slate-400 text-center text-sm font-medium">
                AI Opponent
              </div>
            ) : showReadyButton ? (
              isLocalPlayer ? (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleReady?.();
                  }}
                  className={clsx(
                    "w-full py-1.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                    player.isReady
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {player.isReady ? (
                    <>
                      <Check size={16} /> Ready!
                    </>
                  ) : (
                    "Not Ready"
                  )}
                </motion.button>
              ) : (
                <div
                  className={clsx(
                    "w-full py-1.5 rounded-lg text-center text-sm font-medium",
                    player.isReady
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-700/50 text-slate-400"
                  )}
                >
                  {player.isReady ? "Ready" : "Not Ready"}
                </div>
              )
            ) : (
              <div className="w-full py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-center text-sm font-medium">
                Player
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
