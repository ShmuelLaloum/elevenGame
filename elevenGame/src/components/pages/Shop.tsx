import { motion } from "framer-motion";
import {
  ShoppingBag,
  Gift,
  PlayCircle,
  Gem,
  Sparkles,
  Smile,
  Zap,
} from "lucide-react";
import { useUserStore, type Item } from "../../store/userStore";
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

export const Shop = () => {
  const { addLightning, purchaseItem, inventory } = useUserStore();

  const handleClaimLightning = () => {
    addLightning(1); // Gain 1 free lightning
    alert("Claimed 1 free Lightning Bolt! ⚡");
  };

  const handleWatchAd = () => {
    addLightning(2); // Earn 2 extra by watching video
    alert("Watched ad! Earned 2 Lightning Bolts! ⚡");
  };

  const handlePurchase = (item: Item) => {
    if (
      inventory.cardBacks.includes(item.id) ||
      inventory.reactions.includes(item.id)
    ) {
      alert("You already own this item!");
      return;
    }
    const success = purchaseItem(item);
    if (success) {
      alert(`Successfully purchased ${item.name}!`);
    } else {
      alert("Not enough Diamonds! 💎");
    }
  };

  return (
    <div className="lobby-container flex flex-col items-center pt-24 px-4 overflow-y-auto pb-20 custom-scrollbar">
      <div className="lobby-background">
        <div className="lobby-background-image opacity-10" />
        <div className="lobby-background-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="lobby-badge inline-flex mb-2">
            <ShoppingBag size={14} className="text-pink-400 mr-2" />
            Special Offers Available
          </div>
          <h1 className="lobby-title text-5xl">The Shop</h1>
        </div>

        {/* Daily Rewards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-900/40 backdrop-blur-md border border-emerald-500/30 p-6 rounded-3xl shadow-xl flex items-center justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-emerald-400 mb-1 flex items-center gap-2">
                <Gift size={20} /> Daily Free Gift
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Claim your daily free lightning bolt!
              </p>
              <button
                onClick={handleClaimLightning}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Claim Now
              </button>
            </div>
            <Zap
              size={80}
              className="text-emerald-500/20 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-110 transition-transform"
            />
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-900/40 backdrop-blur-md border border-blue-500/30 p-6 rounded-3xl shadow-xl flex items-center justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-blue-400 mb-1 flex items-center gap-2">
                <PlayCircle size={20} /> Watch Ad
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Earn 2 lightning bolts by watching a video.
              </p>
              <button
                onClick={handleWatchAd}
                className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                Watch Now
              </button>
            </div>
            <PlayCircle
              size={80}
              className="text-blue-500/20 absolute -right-4 -bottom-4 -rotate-12 group-hover:scale-110 transition-transform"
            />
          </div>
        </div>

        {/* Card Packs Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 px-2">
            <Sparkles className="text-yellow-400" size={24} /> Card Backs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {CARD_BACKS.map((item) => {
              const isOwned = inventory.cardBacks.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -5 }}
                  className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-3xl flex flex-col items-center group"
                >
                  <div
                    className={`w-full aspect-[2/3] ${item.image} rounded-2xl mb-4 shadow-xl border-4 border-slate-800 flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                    <Sparkles className="text-white/30" size={40} />
                  </div>
                  <h4 className="font-bold text-center mb-2">{item.name}</h4>
                  <button
                    disabled={isOwned}
                    onClick={() => handlePurchase(item)}
                    className={clsx(
                      "w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-colors border",
                      isOwned
                        ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
                    )}
                  >
                    {isOwned ? (
                      "Owned"
                    ) : (
                      <>
                        <Gem size={14} className="text-blue-400" />
                        <span>{item.price}</span>
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Emotes Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 px-2">
            <Smile className="text-pink-400" size={24} /> Reactions & Emotes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {REACTIONS.map((item) => {
              const isOwned = inventory.reactions.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isOwned && handlePurchase(item)}
                  className={clsx(
                    "bg-slate-900/50 border p-4 rounded-3xl flex flex-col items-center cursor-pointer transition-all",
                    isOwned
                      ? "border-slate-800 opacity-60"
                      : "border-slate-700/50 hover:border-slate-600"
                  )}
                >
                  <span className="text-4xl mb-3">{item.emoji}</span>
                  <div className="flex items-center gap-1 text-blue-400 font-bold text-xs bg-blue-500/10 px-2 py-1 rounded-full text-center">
                    {isOwned ? (
                      "Owned"
                    ) : (
                      <>
                        <Gem size={10} /> {item.price}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
