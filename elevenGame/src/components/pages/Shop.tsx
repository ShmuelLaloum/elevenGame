import { motion } from "framer-motion";
import {
  ShoppingBag,
  Gift,
  PlayCircle,
  Gem,
  Sparkles,
  Smile,
  Zap,
  Clock,
} from "lucide-react";
import { useUserStore, type Item } from "../../store/userStore";
import { useState, useEffect } from "react";
import clsx from "clsx";

const CARD_BACKS: Item[] = [
  {
    id: "royal-gold",
    name: "Royal Gold",
    type: "cardBack",
    price: 50,
    image: "bg-yellow-600",
  },
  {
    id: "neon-matrix",
    name: "Neon Matrix",
    type: "cardBack",
    price: 75,
    image: "bg-cyan-600",
  },
  {
    id: "void-purple",
    name: "Void Purple",
    type: "cardBack",
    price: 100,
    image: "bg-purple-600",
  },
  {
    id: "crimson-flame",
    name: "Crimson Flame",
    type: "cardBack",
    price: 125,
    image: "bg-red-600",
  },
];

const REACTIONS: Item[] = [
  { id: "diamond", emoji: "💎", name: "Diamond", type: "reaction", price: 25 },
  { id: "salt", emoji: "🧂", name: "Salty", type: "reaction", price: 25 },
];

const Timer = ({
  timestamp,
  duration,
}: {
  timestamp: number | null;
  duration: number;
}) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!timestamp) return;
    const update = () => {
      const now = Date.now();
      const elapsed = now - timestamp;
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timestamp, duration]);

  if (!timestamp || timeLeft <= 0) return null;

  const hours = Math.floor(timeLeft / (3600 * 1000));
  const minutes = Math.floor((timeLeft % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/50 rounded-full border border-slate-700/50 text-slate-400">
      <Clock size={12} className="text-slate-500" />
      <span className="text-[11px] font-black tabular-nums">
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

import { useUIStore } from "../../store/uiStore";

export const Shop = () => {
  const {
    purchaseItem,
    inventory,
    claimFreeLightning,
    watchAdLightning,
    lastClaimFree,
    lastWatchAd,
    diamonds,
  } = useUserStore();
  const { openPurchaseModal, openAlertModal } = useUIStore();
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;

  const handleClaimLightning = () => {
    claimFreeLightning();
  };

  const handleWatchAd = () => {
    watchAdLightning();
  };

  const isFreeClaimed = !!(
    lastClaimFree && Date.now() - lastClaimFree < TWELVE_HOURS
  );
  const isAdWatched = !!(
    lastWatchAd && Date.now() - lastWatchAd < TWELVE_HOURS
  );

  const handlePurchase = (item: Item) => {
    if (
      inventory.cardBacks.includes(item.id) ||
      inventory.reactions.includes(item.id)
    )
      return;

    if (diamonds < (item.price || 0)) {
      openAlertModal(
        "Insufficient Diamonds",
        "You don't have enough diamonds to purchase this item.",
        "error"
      );
      return;
    }

    openPurchaseModal(item, () => {
      const success = purchaseItem(item);
      if (success) {
        // Optional: show success modal
      }
    });
  };

  return (
    <div className="lobby-container flex flex-col items-center pt-32 px-4 overflow-hidden pb-10">
      <div className="lobby-background">
        <div className="lobby-background-image opacity-10" />
        <div className="lobby-background-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-10 flex flex-col h-full max-h-[85vh]"
      >
        <div className="text-center mb-6 sm:mb-8 shrink-0">
          <div className="lobby-badge inline-flex mb-2">
            <ShoppingBag size={14} className="text-pink-400 mr-2" />
            Special Offers Available
          </div>
          <h1 className="lobby-title text-4xl sm:text-5xl">Shop</h1>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-12 pr-1">
          {/* Daily Rewards Section - Always 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-900/40 backdrop-blur-md border border-emerald-500/30 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl flex flex-col sm:flex-row items-center sm:justify-between group overflow-hidden relative">
              <div className="relative z-10 flex-1 text-center sm:text-left">
                <h3 className="text-sm sm:text-2xl font-black text-emerald-400 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                  <Gift size={16} className="sm:w-6 sm:h-6" />{" "}
                  <span className="hidden sm:inline">Daily</span> Gift
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-sm mb-3 sm:mb-6 mx-auto sm:mx-0 max-w-[120px] sm:max-w-[200px]">
                  Free lightning bolt!
                </p>
                <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-4">
                  <button
                    disabled={isFreeClaimed}
                    onClick={handleClaimLightning}
                    className={clsx(
                      "font-black py-2 sm:py-3 px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-lg text-xs sm:text-base",
                      isFreeClaimed
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20"
                    )}
                  >
                    {isFreeClaimed ? "Done" : "Claim"}
                  </button>
                  <Timer timestamp={lastClaimFree} duration={TWELVE_HOURS} />
                </div>
              </div>
              <Zap
                size={80}
                className="text-emerald-500/10 absolute -right-4 -bottom-4 sm:-right-6 sm:-bottom-6 rotate-12 group-hover:rotate-6 transition-transform sm:w-[120px] sm:h-[120px]"
              />
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-900/40 backdrop-blur-md border border-blue-500/30 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl flex flex-col sm:flex-row items-center sm:justify-between group overflow-hidden relative">
              <div className="relative z-10 flex-1 text-center sm:text-left">
                <h3 className="text-sm sm:text-2xl font-black text-blue-400 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                  <PlayCircle size={16} className="sm:w-6 sm:h-6" />{" "}
                  <span className="hidden sm:inline">Watch</span> Ad
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-sm mb-3 sm:mb-6 mx-auto sm:mx-0 max-w-[120px] sm:max-w-[200px]">
                  Earn 2 lightning.
                </p>
                <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-4">
                  <button
                    disabled={isAdWatched}
                    onClick={handleWatchAd}
                    className={clsx(
                      "font-black py-2 sm:py-3 px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-lg text-xs sm:text-base",
                      isAdWatched
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20"
                    )}
                  >
                    {isAdWatched ? "Done" : "Watch"}
                  </button>
                  <Timer timestamp={lastWatchAd} duration={TWELVE_HOURS} />
                </div>
              </div>
              <PlayCircle
                size={80}
                className="text-blue-500/10 absolute -right-4 -bottom-4 sm:-right-6 sm:-bottom-6 -rotate-12 group-hover:-rotate-6 transition-transform sm:w-[120px] sm:h-[120px]"
              />
            </div>
          </div>

          {/* Card Backs Section - 2 or 3 columns on mobile */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-3xl font-black mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 px-2">
              <Sparkles className="text-yellow-400" size={20} /> Card Backs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {CARD_BACKS.map((item) => {
                const isOwned = inventory.cardBacks.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -8 }}
                    className="bg-slate-900/40 backdrop-blur-md border border-slate-700/30 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center group shadow-xl"
                  >
                    <div
                      className={clsx(
                        "w-full aspect-[2/3] rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-2xl border-2 sm:border-4 border-slate-800/50 flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]",
                        item.image
                      )}
                    >
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                      <Sparkles className="text-white/20" size={30} />
                    </div>
                    <h4 className="font-black text-sm sm:text-xl mb-3 sm:mb-4 truncate w-full text-center">
                      {item.name}
                    </h4>
                    <button
                      disabled={isOwned}
                      onClick={() => handlePurchase(item)}
                      className={clsx(
                        "w-full flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black transition-all border shadow-lg text-xs sm:text-base",
                        isOwned
                          ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white hover:shadow-blue-500/10"
                      )}
                    >
                      {isOwned ? (
                        "Owned"
                      ) : (
                        <>
                          <Gem
                            size={14}
                            className="sm:w-[18px] sm:h-[18px] text-blue-400"
                          />
                          <span>{item.price}</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Emotes Section - 3 columns on mobile */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-3xl font-black mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 px-2">
              <Smile className="text-pink-400" size={20} /> Reactions
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
              {REACTIONS.map((item) => {
                const isOwned = inventory.reactions.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !isOwned && handlePurchase(item)}
                    className={clsx(
                      "bg-slate-900/40 backdrop-blur-md border p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col items-center cursor-pointer transition-all shadow-xl",
                      isOwned
                        ? "border-slate-800/50 opacity-60"
                        : "border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60"
                    )}
                  >
                    <span className="text-3xl sm:text-5xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
                      {item.emoji}
                    </span>
                    <div
                      className={clsx(
                        "flex items-center gap-1 font-black text-[8px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-center transition-colors",
                        isOwned
                          ? "bg-slate-800 text-slate-600"
                          : "bg-blue-500/10 text-blue-400"
                      )}
                    >
                      {isOwned ? (
                        "Owned"
                      ) : (
                        <>
                          <Gem size={10} className="sm:w-3 sm:h-3" />{" "}
                          {item.price}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
