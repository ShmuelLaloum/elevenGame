import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Zap } from "lucide-react";
import clsx from "clsx";

interface LobbyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "tooManyPlayers" | "noLightning";
  currentPlayerCount?: number;
  maxPlayers?: number;
  targetMode?: string;
}

export const LobbyAlertModal = ({
  isOpen,
  onClose,
  mode,
  currentPlayerCount = 0,
  maxPlayers = 0,
  targetMode = "",
}: LobbyAlertModalProps) => {
  const isLightning = mode === "noLightning";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={clsx(
              "relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border shadow-2xl overflow-hidden",
              isLightning ? "border-yellow-500/30" : "border-red-500/30"
            )}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Glow at top */}
            <div
              className={clsx(
                "absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-20 blur-2xl pointer-events-none",
                isLightning
                  ? "bg-gradient-to-b from-yellow-500/30 to-transparent"
                  : "bg-gradient-to-b from-red-500/30 to-transparent"
              )}
            />

            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-all z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>

            {/* Content */}
            <div className="relative p-6 text-center">
              {/* Icon */}
              <motion.div
                className={clsx(
                  "mx-auto w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4",
                  isLightning
                    ? "bg-yellow-500/20 border-yellow-500/50"
                    : "bg-red-500/20 border-red-500/50"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                {isLightning ? (
                  <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                )}
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-2xl font-black text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {isLightning ? "Out of Lightning!" : "Too Many Players!"}
              </motion.h2>

              {/* Message */}
              <motion.p
                className="text-slate-400 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isLightning ? (
                  <>
                    You need{" "}
                    <span className="text-white font-bold">
                      1 Lightning Bolt
                    </span>{" "}
                    to play online. Claim your daily gift or watch an ad in the
                    shop to get more!
                  </>
                ) : (
                  <>
                    You have{" "}
                    <span className="text-white font-bold">
                      {currentPlayerCount}
                    </span>{" "}
                    players, but
                    <span className="text-white font-bold ml-1">
                      {targetMode}
                    </span>{" "}
                    only supports up to
                    <span className="text-white font-bold ml-1">
                      {maxPlayers}
                    </span>
                    .
                  </>
                )}
              </motion.p>

              {/* Action Button */}
              <motion.button
                onClick={onClose}
                className={clsx(
                  "w-full py-4 rounded-xl text-white font-black shadow-lg transition-all",
                  isLightning
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-yellow-500/20"
                    : "bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/20"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {isLightning ? "Back to Lobby" : "Got it"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
