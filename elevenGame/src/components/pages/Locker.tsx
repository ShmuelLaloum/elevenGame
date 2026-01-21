import { motion, AnimatePresence } from "framer-motion";
import { Archive, Sparkles, Smile, X, Check } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { useState } from "react";
import clsx from "clsx";

const ALL_CARD_BACKS = [
  { id: "original", name: "Original", color: "bg-slate-700" },
  { id: "royal-gold", name: "Royal Gold", color: "bg-yellow-600" },
  { id: "neon-matrix", name: "Neon Matrix", color: "bg-cyan-600" },
  { id: "void-purple", name: "Void Purple", color: "bg-purple-600" },
  { id: "crimson-flame", name: "Crimson Flame", color: "bg-red-600" },
];

const ALL_REACTIONS = [
  { id: "fire", emoji: "🔥", name: "Fire" },
  { id: "target", emoji: "🎯", name: "Target" },
  { id: "crown", emoji: "👑", name: "Crown" },
  { id: "clown", emoji: "🤡", name: "Clown" },
  { id: "diamond", emoji: "💎", name: "Diamond" },
  { id: "salt", emoji: "🧂", name: "Salty" },
];

export const Locker = () => {
  const { inventory, equipped, setEquippedCardBack, toggleEquippedReaction } =
    useUserStore();
  const [activePanel, setActivePanel] = useState<
    "cardBacks" | "reactions" | null
  >(null);

  const ownedCardBacks = ALL_CARD_BACKS.filter((cb) =>
    inventory.cardBacks.includes(cb.id)
  );
  const ownedReactions = ALL_REACTIONS.filter((r) =>
    inventory.reactions.includes(r.id)
  );
  const currentCardBack =
    ALL_CARD_BACKS.find((cb) => cb.id === equipped.cardBack) ||
    ALL_CARD_BACKS[0];

  return (
    <div className="lobby-container flex flex-col items-center pt-32 px-4 overflow-hidden pb-10">
      <div className="lobby-background">
        <div className="lobby-background-image opacity-10" />
        <div className="lobby-background-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-6 sm:mb-10">
          <div className="lobby-badge inline-flex mb-2">
            <Archive size={14} className="text-blue-400 mr-2" />
            Your Collection
          </div>
          <h1 className="lobby-title text-4xl sm:text-5xl">Locker</h1>
        </div>

        {/* Main Interface: Two Big Selection Cards - Forced 2 columns for a consistent look */}
        <div className="grid grid-cols-2 gap-3 sm:gap-8 max-w-3xl mx-auto">
          {/* Card Back Selection Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setActivePanel("cardBacks")}
            className="group relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 cursor-pointer shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-10 h-10 sm:w-20 sm:h-20 text-blue-400" />
            </div>

            <h3 className="text-xs sm:text-xl font-bold mb-3 sm:mb-6 flex items-center gap-1 sm:gap-2 text-slate-200">
              <Sparkles size={14} className="sm:w-5 sm:h-5 text-blue-400" />{" "}
              Card Style
            </h3>

            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  "w-16 h-24 sm:w-32 sm:h-48 rounded-lg sm:rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 border-2 sm:border-4 border-slate-800",
                  currentCardBack.color
                )}
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="text-white/20 font-black text-2xl sm:text-5xl rotate-45 select-none">
                  11
                </div>
              </div>
              <div className="mt-3 sm:mt-6 text-sm sm:text-2xl font-black text-white text-center truncate w-full">
                {currentCardBack.name}
              </div>
              <div className="text-blue-400 text-[8px] sm:text-xs uppercase tracking-widest font-bold mt-1">
                Tap to Change
              </div>
            </div>
          </motion.div>

          {/* Reactions Selection Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setActivePanel("reactions")}
            className="group relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 cursor-pointer shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Smile className="w-10 h-10 sm:w-20 sm:h-20 text-pink-400" />
            </div>

            <h3 className="text-xs sm:text-xl font-bold mb-3 sm:mb-6 flex items-center gap-1 sm:gap-2 text-slate-200">
              <Smile size={14} className="sm:w-5 sm:h-5 text-pink-400" />{" "}
              Reactions
            </h3>

            <div className="flex flex-col items-center justify-center h-full">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {equipped.reactions.slice(0, 4).map((id, idx) => {
                  const r = ALL_REACTIONS.find((item) => item.id === id);
                  return (
                    <div
                      key={idx}
                      className="w-8 h-8 sm:w-16 sm:h-16 bg-slate-800/80 rounded-lg sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl shadow-lg border border-slate-700/50"
                    >
                      {r?.emoji || "❓"}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 sm:mt-8 text-sm sm:text-2xl font-black text-white truncate w-full text-center">
                {equipped.reactions.length} Active
              </div>
              <div className="text-pink-400 text-[8px] sm:text-xs uppercase tracking-widest font-bold mt-1">
                Tap to Change
              </div>
            </div>
          </motion.div>
        </div>

        {/* Selection Overlay Panels */}
        <AnimatePresence>
          {activePanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[2rem] sm:rounded-[3rem] shadow-full p-6 sm:p-8 relative max-h-[90vh] overflow-hidden flex flex-col"
              >
                <button
                  onClick={() => setActivePanel(null)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} className="sm:w-6 sm:h-6 text-slate-400" />
                </button>

                <h2 className="text-xl sm:text-3xl font-black mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                  {activePanel === "cardBacks" ? (
                    <>
                      <Sparkles className="text-blue-400" size={20} /> Select
                      Card Back
                    </>
                  ) : (
                    <>
                      <Smile className="text-pink-400" size={20} /> Select
                      Reactions
                    </>
                  )}
                </h2>

                <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                  {activePanel === "cardBacks" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                      {ownedCardBacks.map((cb) => (
                        <div
                          key={cb.id}
                          onClick={() => setEquippedCardBack(cb.id)}
                          className={clsx(
                            "relative flex flex-col items-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl cursor-pointer transition-all border-2",
                            equipped.cardBack === cb.id
                              ? "bg-blue-500/10 border-blue-500"
                              : "bg-slate-800/50 border-transparent hover:border-slate-600"
                          )}
                        >
                          <div
                            className={clsx(
                              "w-14 h-20 sm:w-20 sm:h-28 rounded-lg sm:rounded-xl mb-2 sm:mb-3 shadow-lg",
                              cb.color
                            )}
                          />
                          <span className="font-bold text-xs sm:text-base">
                            {cb.name}
                          </span>
                          {equipped.cardBack === cb.id && (
                            <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                              <Check
                                size={10}
                                className="sm:w-3 sm:h-3 text-white"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <p className="text-slate-400 text-[10px] sm:text-sm bg-slate-800/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-700/50 italic">
                        Select at least 4 items for your game reactions.
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                        {ownedReactions.map((r) => {
                          const isEquipped = equipped.reactions.includes(r.id);
                          return (
                            <div
                              key={r.id}
                              onClick={() => toggleEquippedReaction(r.id)}
                              className={clsx(
                                "relative flex flex-col items-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer transition-all border-2",
                                isEquipped
                                  ? "bg-pink-500/10 border-pink-500"
                                  : "bg-slate-800/50 border-transparent hover:border-slate-600"
                              )}
                            >
                              <span className="text-2xl sm:text-4xl mb-1 sm:mb-2">
                                {r.emoji}
                              </span>
                              <span className="font-bold text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-400">
                                {r.name}
                              </span>
                              {isEquipped && (
                                <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1">
                                  <Check
                                    size={8}
                                    className="sm:w-2.5 sm:h-2.5 text-white"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setActivePanel(null)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-blue-500/20 text-sm sm:text-base"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
