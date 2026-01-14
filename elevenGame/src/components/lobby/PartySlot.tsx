import { motion } from "framer-motion";
import { Crown, UserPlus, X, Check, Bot } from "lucide-react";
import clsx from "clsx";

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
  showReadyButton?: boolean;
}

export const PartySlot = ({
  player,
  isLocalPlayer = false,
  slotIndex,
  onInvite,
  onKick,
  onToggleReady,
  showReadyButton = true,
}: PartySlotProps) => {
  const isEmpty = !player;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: slotIndex * 0.1, type: "spring", stiffness: 100 }}
      className={clsx(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-slate-800/80 to-slate-900/90",
        "border-2 backdrop-blur-md shadow-2xl",
        "transition-all duration-300",
        isEmpty
          ? "border-slate-700/50 border-dashed"
          : player.isReady
          ? "border-emerald-500/70 shadow-emerald-500/20"
          : "border-blue-500/50 shadow-blue-500/10"
      )}
      style={{
        width: "clamp(120px, 15vw, 200px)",
        aspectRatio: "3 / 4",
      }}
    >
      {/* Ready Pulse Ring */}
      {player?.isReady && !player.isBot && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
          animate={{ scale: [1, 1.03, 1], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {isEmpty ? (
        /* Empty Slot */
        <motion.button
          onClick={onInvite}
          className="w-full h-full flex flex-col items-center justify-center gap-4 group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 rounded-full bg-slate-700/50 border-2 border-dashed border-slate-600 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-500/10 transition-all">
            <UserPlus className="w-7 h-7 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-slate-400 font-medium text-sm group-hover:text-blue-300 transition-colors">
            Invite Player
          </span>
        </motion.button>
      ) : (
        /* Filled Slot */
        <div className="w-full h-full flex flex-col">
          {/* Avatar Section */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Host Crown */}
            {player.isHost && (
              <motion.div
                className="absolute top-2 left-1/2 -translate-x-1/2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
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

            {/* Kick Button (only for host viewing non-local players) */}
            {!isLocalPlayer && !player.isBot && onKick && (
              <motion.button
                onClick={onKick}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={14} />
              </motion.button>
            )}
          </div>

          {/* Info Section */}
          <div className="p-3 bg-slate-900/50 border-t border-slate-700/50">
            <h3 className="text-base font-bold text-white text-center truncate mb-2">
              {player.name}
            </h3>

            {/* Ready Status / Toggle */}
            {player.isBot ? (
              <div className="w-full py-1.5 rounded-lg bg-slate-700/50 text-slate-400 text-center text-sm font-medium">
                AI Opponent
              </div>
            ) : showReadyButton ? (
              isLocalPlayer ? (
                <motion.button
                  onClick={onToggleReady}
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
                    "Click to Ready"
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
