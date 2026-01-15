import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Users } from "lucide-react";

interface TooManyPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerCount: number;
  maxPlayers: number;
  targetMode: string;
}

export const TooManyPlayersModal = ({
  isOpen,
  onClose,
  currentPlayerCount,
  maxPlayers,
  targetMode,
}: TooManyPlayersModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Red glow at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-gradient-to-b from-red-500/30 to-transparent blur-2xl pointer-events-none" />

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
              {/* Warning Icon */}
              <motion.div
                className="mx-auto w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Too Many Players!
              </motion.h2>

              {/* Message */}
              <motion.p
                className="text-slate-400 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                You have{" "}
                <span className="text-white font-bold">
                  {currentPlayerCount}
                </span>{" "}
                players in your party, but{" "}
                <span className="text-white font-bold">{targetMode}</span> only
                supports up to{" "}
                <span className="text-white font-bold">{maxPlayers}</span>{" "}
                players.
              </motion.p>

              {/* Player Count Visual */}
              <motion.div
                className="flex items-center justify-center gap-4 p-4 bg-slate-800/50 rounded-xl mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-bold text-lg">
                    {currentPlayerCount}
                  </span>
                </div>
                <span className="text-slate-500">/</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-lg">
                    {maxPlayers}
                  </span>
                  <span className="text-slate-500 text-sm">max</span>
                </div>
              </motion.div>

              {/* Suggestion */}
              <motion.p
                className="text-slate-500 text-sm mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Please remove {currentPlayerCount - maxPlayers} player(s) from
                your party before switching to this mode.
              </motion.p>

              {/* OK Button */}
              <motion.button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
