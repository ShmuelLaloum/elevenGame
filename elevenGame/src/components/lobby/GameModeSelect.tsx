import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bot,
  Users,
  Globe,
  Trophy,
  Swords,
  Check,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import { useState, useMemo } from "react";

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
  currentPlayerCount?: number; // Number of players currently in party
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
    maxPlayersPerTeamSize: { "1v1": 2, "2v2": 4 }, // All bots fill, so any count works
    allowsAnyPartySize: true, // Computer mode fills with bots
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
    maxPlayersPerTeamSize: { "1v1": 2, "2v2": 4 },
    allowsAnyPartySize: false,
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
    maxPlayersPerTeamSize: { "1v1": 1, "2v2": 2 }, // Only your team, opponents are matched
    allowsAnyPartySize: false,
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
    maxPlayersPerTeamSize: { "1v1": 1, "2v2": 2 }, // Only your team, opponents are matched
    allowsAnyPartySize: false,
  },
];

export const GameModeSelect = ({
  isOpen,
  onClose,
  onSelectMode,
  currentConfig,
  currentPlayerCount = 1,
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

  // Check if a mode+teamSize combination is valid for current party size
  const isModeAvailable = (
    modeId: GameModeCategory,
    teamSize: TeamSize
  ): boolean => {
    const mode = gameModeCategories.find((m) => m.id === modeId);
    if (!mode) return false;
    if (mode.allowsAnyPartySize) return true;

    const maxPlayers = mode.maxPlayersPerTeamSize[teamSize];
    return currentPlayerCount <= maxPlayers;
  };

  // Check if any team size is available for a mode
  const isAnyTeamSizeAvailable = (modeId: GameModeCategory): boolean => {
    const mode = gameModeCategories.find((m) => m.id === modeId);
    if (!mode) return false;
    if (mode.allowsAnyPartySize) return true;

    return mode.teamSizes.some((size) => isModeAvailable(modeId, size));
  };

  // Get why a mode is blocked
  const getBlockedReason = (modeId: GameModeCategory): string | null => {
    const mode = gameModeCategories.find((m) => m.id === modeId);
    if (!mode || mode.allowsAnyPartySize) return null;

    const maxForAnySize = Math.max(
      ...Object.values(mode.maxPlayersPerTeamSize)
    );
    if (currentPlayerCount > maxForAnySize) {
      return `Max ${maxForAnySize} players`;
    }
    return null;
  };

  // Get available team sizes for current mode and party
  const validTeamSizes = useMemo(() => {
    if (!selectedModeData) return [];
    return selectedModeData.teamSizes.filter((size) =>
      isModeAvailable(selectedCategory, size)
    );
  }, [selectedCategory, currentPlayerCount, selectedModeData]);

  const handleConfirm = () => {
    if (!isModeAvailable(selectedCategory, selectedTeamSize)) {
      return; // Don't allow confirming invalid selection
    }
    onSelectMode({ category: selectedCategory, teamSize: selectedTeamSize });
    onClose();
  };

  const handleCategorySelect = (categoryId: GameModeCategory) => {
    if (!isAnyTeamSizeAvailable(categoryId)) return; // Block if no valid sizes

    setSelectedCategory(categoryId);
    const modeData = gameModeCategories.find((m) => m.id === categoryId);

    // Find a valid team size for this mode
    if (modeData) {
      const validSizes = modeData.teamSizes.filter((size) =>
        isModeAvailable(categoryId, size)
      );

      // Prefer current team size if valid, otherwise pick first valid
      if (validSizes.includes(selectedTeamSize)) {
        // Keep current
      } else if (validSizes.length > 0) {
        setSelectedTeamSize(validSizes[0]);
      }
    }
  };

  const handleTeamSizeSelect = (size: TeamSize) => {
    if (!isModeAvailable(selectedCategory, size)) return;
    setSelectedTeamSize(size);
  };

  // Check if confirm button should be enabled
  const canConfirm = isModeAvailable(selectedCategory, selectedTeamSize);

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
            className="modal-scale-wrapper relative w-full max-w-3xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Header Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative p-4 pb-2 text-center">
              <motion.button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
              <h2 className="text-2xl font-black text-white mb-1">
                Choose Game Mode
              </h2>
              <p className="text-slate-400 text-sm">
                Select how you want to play
              </p>
              {/* Party size indicator */}
              {currentPlayerCount > 1 && (
                <motion.div
                  className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-xs font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Users size={12} />
                  {currentPlayerCount} players in party
                </motion.div>
              )}
            </div>

            {/* Mode Cards */}
            <div className="p-4 pt-2 grid grid-cols-2 gap-3">
              {gameModeCategories.map((mode, index) => {
                const Icon = mode.icon;
                const isSelected = selectedCategory === mode.id;
                const isAvailable = isAnyTeamSizeAvailable(mode.id);
                const blockedReason = getBlockedReason(mode.id);

                return (
                  <motion.button
                    key={mode.id}
                    onClick={() =>
                      mode.available &&
                      isAvailable &&
                      handleCategorySelect(mode.id)
                    }
                    className={clsx(
                      "relative p-4 rounded-xl text-left transition-all",
                      "border-2 overflow-hidden group",
                      !mode.available || !isAvailable
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer",
                      isSelected && isAvailable
                        ? `border-transparent bg-gradient-to-br ${mode.gradient} ${mode.shadowColor} shadow-lg`
                        : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={
                      mode.available && isAvailable
                        ? { scale: 1.02, y: -2 }
                        : {}
                    }
                    whileTap={
                      mode.available && isAvailable ? { scale: 0.98 } : {}
                    }
                  >
                    {/* Blocked Overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-1">
                          <Lock size={20} className="text-slate-400" />
                          {blockedReason && (
                            <span className="text-xs text-slate-400 font-medium">
                              {blockedReason}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selected Check */}
                    {isSelected && isAvailable && (
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
                      {mode.teamSizes.map((size) => {
                        const sizeAvailable = isModeAvailable(mode.id, size);
                        return (
                          <span
                            key={size}
                            className={clsx(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              !sizeAvailable && "line-through opacity-50",
                              isSelected && sizeAvailable
                                ? "bg-white/20 text-white"
                                : "bg-slate-700/50 text-slate-400"
                            )}
                          >
                            {size}
                          </span>
                        );
                      })}
                    </div>

                    {/* Icon */}
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors",
                        isSelected && isAvailable
                          ? "bg-white/20"
                          : `bg-gradient-to-br ${mode.gradient} group-hover:scale-110`
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Text */}
                    <h3
                      className={clsx(
                        "text-base font-bold",
                        isSelected && isAvailable
                          ? "text-white"
                          : "text-slate-200"
                      )}
                    >
                      {mode.title}
                    </h3>
                    <p
                      className={clsx(
                        "text-xs leading-tight mt-0.5",
                        isSelected && isAvailable
                          ? "text-white/70"
                          : "text-slate-400"
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
              <div className="px-4 pb-3">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="text-slate-400" size={16} />
                    <span className="text-slate-300 font-medium text-sm">
                      Team Size
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {availableTeamSizes.map((size) => {
                      const sizeAvailable = isModeAvailable(
                        selectedCategory,
                        size
                      );
                      return (
                        <motion.button
                          key={size}
                          onClick={() => handleTeamSizeSelect(size)}
                          disabled={!sizeAvailable}
                          className={clsx(
                            "flex-1 py-2 rounded-lg font-bold text-base transition-all relative",
                            !sizeAvailable && "cursor-not-allowed opacity-50",
                            selectedTeamSize === size && sizeAvailable
                              ? `bg-gradient-to-r ${selectedModeData?.gradient} text-white shadow-lg`
                              : "bg-slate-700/50 text-slate-400 hover:bg-slate-600"
                          )}
                          whileHover={sizeAvailable ? { scale: 1.02 } : {}}
                          whileTap={sizeAvailable ? { scale: 0.98 } : {}}
                        >
                          {size}
                          {!sizeAvailable && (
                            <Lock
                              size={12}
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  {/* Show why sizes are blocked */}
                  {validTeamSizes.length < availableTeamSizes.length && (
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Some sizes unavailable due to party size (
                      {currentPlayerCount} players)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 pt-2 flex justify-end gap-2">
              <motion.button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-700/50 text-slate-300 font-medium hover:bg-slate-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={clsx(
                  "px-6 py-2 rounded-lg text-white font-bold transition-colors",
                  canConfirm
                    ? `bg-gradient-to-r ${selectedModeData?.gradient} hover:shadow-lg`
                    : "bg-slate-600 cursor-not-allowed opacity-50"
                )}
                whileHover={canConfirm ? { scale: 1.02 } : {}}
                whileTap={canConfirm ? { scale: 0.98 } : {}}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
