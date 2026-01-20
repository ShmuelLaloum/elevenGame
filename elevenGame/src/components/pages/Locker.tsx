import { motion } from "framer-motion";
import { Archive, CheckCircle2, Sparkles, Smile } from "lucide-react";
import { useUserStore } from "../../store/userStore";
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

  const ownedCardBacks = ALL_CARD_BACKS.filter((cb) =>
    inventory.cardBacks.includes(cb.id)
  );
  const ownedReactions = ALL_REACTIONS.filter((r) =>
    inventory.reactions.includes(r.id)
  );

  return (
    <div className="lobby-container flex flex-col items-center pt-24 px-4 overflow-y-auto pb-20 custom-scrollbar">
      <div className="lobby-background">
        <div className="lobby-background-image opacity-10" />
        <div className="lobby-background-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="lobby-badge inline-flex mb-2">
            <Archive size={14} className="text-blue-400 mr-2" />
            Your Collection
          </div>
          <h1 className="lobby-title text-5xl">The Locker</h1>
          <p className="text-slate-400 mt-2">
            Personalize your game with your collected items.
          </p>
        </div>

        {/* Card Backs Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 px-2">
            <Sparkles className="text-yellow-400" size={24} /> Card Backs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ownedCardBacks.map((cb) => (
              <motion.div
                key={cb.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEquippedCardBack(cb.id)}
                className={clsx(
                  "relative bg-slate-900/50 border rounded-3xl p-3 cursor-pointer transition-all duration-300",
                  equipped.cardBack === cb.id
                    ? "border-blue-500 shadow-lg shadow-blue-500/20"
                    : "border-slate-700/50 hover:border-slate-600"
                )}
              >
                <div
                  className={clsx(
                    "w-full aspect-[2/3] rounded-xl mb-3 shadow-inner flex items-center justify-center relative overflow-hidden",
                    cb.color
                  )}
                >
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                  <div className="text-white/20 font-black text-4xl rotate-45 select-none">
                    11
                  </div>
                </div>
                <div className="text-center font-bold text-sm truncate">
                  {cb.name}
                </div>
                {equipped.cardBack === cb.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reactions Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 px-2">
            <Smile className="text-pink-400" size={24} /> Reactions
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {ownedReactions.map((r) => {
              const isEquipped = equipped.reactions.includes(r.id);
              return (
                <motion.div
                  key={r.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleEquippedReaction(r.id)}
                  className={clsx(
                    "relative bg-slate-900/50 border rounded-2xl p-4 cursor-pointer transition-all duration-300 flex flex-col items-center",
                    isEquipped
                      ? "border-pink-500 shadow-lg shadow-pink-500/20"
                      : "border-slate-700/50 hover:border-slate-600"
                  )}
                >
                  <span className="text-4xl mb-2">{r.emoji}</span>
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    {r.name}
                  </div>
                  {isEquipped && (
                    <div className="absolute top-1 right-1 bg-pink-500 rounded-full p-0.5 shadow-lg">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
