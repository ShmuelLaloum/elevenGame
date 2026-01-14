import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Users, Globe, Trophy, Swords, Check } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

export type GameModeCategory =
  | "computer"
  | "friends"
  | "battleRoyale"
  | "arena";
export type TeamSize = "1v1" | "2v2";

export interface GameModeConfig {
  category: GameModeCategory;
  teamSize: TeamSize;
}

interface GameModeSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (config: GameModeConfig) => void;
  currentConfig: GameModeConfig;
}

const gameModeCategories = [
  {
    id: "computer" as GameModeCategory,
    title: "VS Computer",
    description: "Challenge our AI opponents",
    icon: Bot,
    gradient: "from-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-500/30",
    available: true,
    teamSizes: ["1v1", "2v2"] as TeamSize[],
  },
  {
    id: "friends" as GameModeCategory,
    title: "VS Friends",
    description: "Play with friends in private matches",
    icon: Users,
    gradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/30",
    available: true,
    teamSizes: ["1v1", "2v2"] as TeamSize[],
  },
  {
    id: "battleRoyale" as GameModeCategory,
    title: "Battle Royale",
    description: "Casual matches with random players",
    icon: Globe,
    gradient: "from-orange-500 to-red-600",
    shadowColor: "shadow-orange-500/30",
    available: true,
    teamSizes: ["1v1", "2v2"] as TeamSize[],
  },
  {
    id: "arena" as GameModeCategory,
    title: "Arena",
    description: "Ranked competitive with global leaderboard",
    icon: Trophy,
    gradient: "from-purple-500 to-pink-600",
    shadowColor: "shadow-purple-500/30",
    available: true,
    teamSizes: ["1v1", "2v2"] as TeamSize[],
  },
];

export const GameModeSelect = ({
  isOpen,
  onClose,
  onSelectMode,
  currentConfig,
}: GameModeSelectProps) => {
  const [selectedCategory, setSelectedCategory] = useState<GameModeCategory>(
    currentConfig.category
  );
  const [selectedTeamSize, setSelectedTeamSize] = useState<TeamSize>(
    currentConfig.teamSize
  );

  const selectedModeData = gameModeCategories.find(
    (m) => m.id === selectedCategory
  );
  const availableTeamSizes = selectedModeData?.teamSizes || ["1v1"];

  const handleConfirm = () => {
    onSelectMode({ category: selectedCategory, teamSize: selectedTeamSize });
    onClose();
  };

  const handleCategorySelect = (categoryId: GameModeCategory) => {
    setSelectedCategory(categoryId);
    const modeData = gameModeCategories.find((m) => m.id === categoryId);
    // Reset team size if current one isn't available
    if (modeData && !modeData.teamSizes.includes(selectedTeamSize)) {
      setSelectedTeamSize(modeData.teamSizes[0]);
    }
  };

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
            className="modal-scale-wrapper relative w-full max-w-3xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Header Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative p-6 pb-4 text-center">
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
              <h2 className="text-3xl font-black text-white mb-2">
                Choose Game Mode
              </h2>
              <p className="text-slate-400">Select how you want to play</p>
            </div>

            {/* Mode Cards */}
            <div className="p-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gameModeCategories.map((mode, index) => {
                const Icon = mode.icon;
                const isSelected = selectedCategory === mode.id;

                return (
                  <motion.button
                    key={mode.id}
                    onClick={() =>
                      mode.available && handleCategorySelect(mode.id)
                    }
                    className={clsx(
                      "relative p-5 rounded-2xl text-left transition-all",
                      "border-2 overflow-hidden group",
                      mode.available
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60",
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${mode.gradient} ${mode.shadowColor} shadow-lg`
                        : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={mode.available ? { scale: 1.02, y: -2 } : {}}
                    whileTap={mode.available ? { scale: 0.98 } : {}}
                  >
                    {/* Selected Check */}
                    {isSelected && (
                      <motion.div
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check size={14} className="text-white" />
                      </motion.div>
                    )}

                    {/* Team Size Badges */}
                    <div className="absolute top-3 right-12 flex gap-1">
                      {mode.teamSizes.map((size) => (
                        <span
                          key={size}
                          className={clsx(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-700/50 text-slate-400"
                          )}
                        >
                          {size}
                        </span>
                      ))}
                    </div>

                    {/* Icon */}
                    <div
                      className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors",
                        isSelected
                          ? "bg-white/20"
                          : `bg-gradient-to-br ${mode.gradient} group-hover:scale-110`
                      )}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Text */}
                    <h3
                      className={clsx(
                        "text-lg font-bold mb-1",
                        isSelected ? "text-white" : "text-slate-200"
                      )}
                    >
                      {mode.title}
                    </h3>
                    <p
                      className={clsx(
                        "text-sm leading-relaxed",
                        isSelected ? "text-white/80" : "text-slate-400"
                      )}
                    >
                      {mode.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Team Size Selection */}
            {availableTeamSizes.length > 1 && (
              <div className="px-6 pb-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Swords className="text-slate-400" size={18} />
                    <span className="text-slate-300 font-medium">
                      Team Size
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {availableTeamSizes.map((size) => (
                      <motion.button
                        key={size}
                        onClick={() => setSelectedTeamSize(size)}
                        className={clsx(
                          "flex-1 py-3 rounded-xl font-bold text-lg transition-all",
                          selectedTeamSize === size
                            ? `bg-gradient-to-r ${selectedModeData?.gradient} text-white shadow-lg`
                            : "bg-slate-700/50 text-slate-400 hover:bg-slate-600"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mode Info */}
            <div className="px-6 pb-4">
              <motion.div
                key={`${selectedCategory}-${selectedTeamSize}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30"
              >
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="text-yellow-400">ℹ️</span>
                  {selectedCategory === "computer" && (
                    <span>
                      Play against our AI bot. No waiting, instant match!
                    </span>
                  )}
                  {selectedCategory === "friends" && (
                    <span>
                      Invite friends to your party. All players must be ready to
                      start.
                    </span>
                  )}
                  {selectedCategory === "battleRoyale" && (
                    <span>
                      Casual matches with random players. No rank, just fun!
                    </span>
                  )}
                  {selectedCategory === "arena" && (
                    <span>
                      Competitive ranked mode. Win to climb the global
                      leaderboard!
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-2 flex justify-end gap-3">
              <motion.button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-700/50 text-slate-300 font-medium hover:bg-slate-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                className={clsx(
                  "px-8 py-3 rounded-xl text-white font-bold transition-colors",
                  `bg-gradient-to-r ${selectedModeData?.gradient} hover:shadow-lg`
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirm Selection
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
