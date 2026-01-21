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
  Package,
  Coins as CoinIcon,
} from "lucide-react";

import { useUserStore, type Item } from "../../store/userStore";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { CARD_BACKS, REACTIONS } from "../../constants/shopItems";
import { useUIStore } from "../../store/uiStore";
import { PackOpeningModal } from "../modals/PackOpeningModal";
import {
  UNIFIED_PACK_PRICE,
  UNIFIED_PACK_DIAMOND_PRICE,
  type PackRarity,
  type PackReward,
} from "../../constants/packs";
import { rollPackRarity, generatePackReward } from "../../utils/packLogic";

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

export const Shop = () => {
  const {
    purchaseItem,
    inventory,
    claimFreeLightning,
    watchAdCoins,
    lastClaimFree,
    lastWatchAd,
    diamonds,
    coins,
    spendCoins,
    spendDiamonds,
    addLightning,
    addCoins,
    addDiamonds,
    addFragment,
    itemFragments,
  } = useUserStore();
  const { openPurchaseModal, openAlertModal } = useUIStore();

  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [activePackRarity, setActivePackRarity] =
    useState<PackRarity>("simple");
  const [activePackReward, setActivePackReward] = useState<PackReward | null>(
    null
  );

  const TWELVE_HOURS = 12 * 60 * 60 * 1000;

  const handleClaimLightning = () => {
    claimFreeLightning();
  };

  const handleWatchAd = () => {
    watchAdCoins();
  };

  const isFreeClaimed = !!(
    lastClaimFree && Date.now() - lastClaimFree < TWELVE_HOURS
  );
  const isAdWatched = !!(
    lastWatchAd && Date.now() - lastWatchAd < TWELVE_HOURS
  );

  const handlePurchase = (item: Item, currency: "diamonds" | "coins") => {
    if (
      inventory.cardBacks.includes(item.id) ||
      inventory.reactions.includes(item.id)
    )
      return;

    const progress = itemFragments[item.id] || 0;
    const isFree = progress >= 10;
    const price = item.price || 0;
    const finalPriceInCurrency = currency === "coins" ? price * 100 : price;

    if (!isFree) {
      if (currency === "coins" && coins < finalPriceInCurrency) {
        openAlertModal(
          "Insufficient Coins",
          `You need ${finalPriceInCurrency} coins to buy this.`,
          "error"
        );
        return;
      }
      if (currency === "diamonds" && diamonds < price) {
        openAlertModal(
          "Insufficient Diamonds",
          `You need ${price} diamonds to buy this.`,
          "error"
        );
        return;
      }
    }

    openPurchaseModal(
      {
        ...item,
        price: isFree ? 0 : finalPriceInCurrency,
        name: isFree ? `Claim ${item.name}` : item.name,
        currency: currency,
      },
      () => {
        purchaseItem(item, isFree, currency);
      }
    );
  };

  const handleBuyPack = (currency: "diamonds" | "coins") => {
    const price =
      currency === "coins" ? UNIFIED_PACK_PRICE : UNIFIED_PACK_DIAMOND_PRICE;

    if (currency === "coins" && coins < price) {
      openAlertModal(
        "Insufficient Coins",
        "You don't have enough coins!",
        "error"
      );
      return;
    }
    if (currency === "diamonds" && diamonds < price) {
      openAlertModal(
        "Insufficient Diamonds",
        "You don't have enough diamonds!",
        "error"
      );
      return;
    }

    openPurchaseModal(
      {
        id: "pack",
        name: "Mystery Pack",
        price: price,
        type: "cardBack",
        currency: currency,
      },
      () => {
        if (currency === "coins") spendCoins(price);
        else spendDiamonds(price);

        const rarity = rollPackRarity();
        const reward = generatePackReward(rarity, inventory);
        setActivePackRarity(rarity);
        setActivePackReward(reward);
        setIsPackModalOpen(true);
      }
    );
  };

  const handlePackModalClose = () => {
    if (!activePackReward) {
      setIsPackModalOpen(false);
      return;
    }
    switch (activePackReward.type) {
      case "lightning":
        addLightning(activePackReward.amount);
        break;
      case "coins":
        addCoins(activePackReward.amount);
        break;
      case "diamonds":
        addDiamonds(activePackReward.amount);
        break;
      case "fragment":
        if (activePackReward.itemId) {
          addFragment(activePackReward.itemId, activePackReward.amount);
        }
        break;
    }
    setIsPackModalOpen(false);
    setActivePackReward(null);
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
          {/* Daily Rewards Section */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-900/40 backdrop-blur-md border border-emerald-500/30 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl flex flex-col sm:flex-row items-center sm:justify-between group overflow-hidden relative">
              <div className="relative z-10 flex-1 text-center sm:text-left">
                <h3 className="text-sm sm:text-2xl font-black text-emerald-400 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                  <Gift size={16} className="sm:w-6 sm:h-6" /> Gift
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-sm mb-3 sm:mb-6">
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
                        : "bg-emerald-500 hover:bg-emerald-400 text-white"
                    )}
                  >
                    {isFreeClaimed ? "Done" : "Claim"}
                  </button>
                  <Timer timestamp={lastClaimFree} duration={TWELVE_HOURS} />
                </div>
              </div>
              <Zap
                size={80}
                className="text-emerald-500/10 absolute -right-4 -bottom-4 rotate-12"
              />
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-900/40 backdrop-blur-md border border-blue-500/30 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl flex flex-col sm:flex-row items-center sm:justify-between group overflow-hidden relative">
              <div className="relative z-10 flex-1 text-center sm:text-left">
                <h3 className="text-sm sm:text-2xl font-black text-blue-400 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                  <PlayCircle size={16} className="sm:w-6 sm:h-6" /> Ad
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-sm mb-3 sm:mb-6">
                  Earn 50 coins.
                </p>
                <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-4">
                  <button
                    disabled={isAdWatched}
                    onClick={handleWatchAd}
                    className={clsx(
                      "font-black py-2 sm:py-3 px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-lg text-xs sm:text-base",
                      isAdWatched
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : "bg-blue-500 hover:bg-blue-400 text-white"
                    )}
                  >
                    {isAdWatched ? "Done" : "Watch"}
                  </button>
                  <Timer timestamp={lastWatchAd} duration={TWELVE_HOURS} />
                </div>
              </div>
              <PlayCircle
                size={80}
                className="text-blue-500/10 absolute -right-4 -bottom-4 -rotate-12"
              />
            </div>
          </div>

          {/* Mystery Pack Section */}
          <div className="mb-12 px-2">
            <h2 className="text-xl sm:text-3xl font-black mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
              <Sparkles className="text-purple-400" size={20} /> Reward Packs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-700/30 p-4 sm:p-6 rounded-[2rem] flex flex-col items-center group shadow-xl relative overflow-hidden"
              >
                <div className="w-full aspect-[2/3] rounded-2xl mb-4 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                    animate={{ translateX: ["100%", "-100%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <Package
                    className="text-white group-hover:scale-110 transition-transform"
                    size={48}
                  />
                </div>

                <h4 className="font-black text-sm sm:text-lg mb-1 uppercase tracking-wider text-white text-center">
                  Mystery Pack
                </h4>
                <p className="text-slate-500 text-[8px] mb-4 font-bold uppercase tracking-widest text-center">
                  Random Rewards
                </p>

                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => handleBuyPack("coins")}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-slate-900 font-black hover:bg-yellow-500 hover:text-white transition-all text-xs"
                  >
                    <CoinIcon
                      size={14}
                      className="text-yellow-600 group-hover:text-white"
                    />
                    {UNIFIED_PACK_PRICE}
                  </button>
                  <button
                    onClick={() => handleBuyPack("diamonds")}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 text-white font-black hover:bg-blue-600 transition-all text-xs border border-slate-700"
                  >
                    <Gem size={14} className="text-blue-400" />
                    {UNIFIED_PACK_DIAMOND_PRICE}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Items Sections */}
          {[
            {
              title: "Card Backs",
              icon: <Sparkles size={20} className="text-yellow-400" />,
              items: CARD_BACKS,
              inv: inventory.cardBacks,
            },
            {
              title: "Reactions",
              icon: <Smile size={20} className="text-pink-400" />,
              items: REACTIONS,
              inv: inventory.reactions,
            },
          ].map((section) => (
            <div key={section.title} className="mb-12 px-2">
              <h2 className="text-xl sm:text-3xl font-black mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                {section.icon} {section.title}
              </h2>
              <div
                className={clsx(
                  "grid gap-4 sm:gap-6",
                  section.title === "Card Backs"
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
                )}
              >
                {section.items.map((item) => {
                  const isOwned = section.inv.includes(item.id);
                  const progress = itemFragments[item.id] || 0;
                  const isReady = progress >= 10;

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={!isOwned ? { y: -5 } : {}}
                      className={clsx(
                        "bg-slate-900/40 backdrop-blur-md border border-slate-700/30 p-4 sm:p-6 rounded-[2rem] flex flex-col items-center group shadow-xl",
                        section.title === "Reactions" &&
                          isReady &&
                          "border-emerald-500/30 bg-emerald-500/5"
                      )}
                    >
                      {section.title === "Card Backs" ? (
                        <div
                          className={clsx(
                            "w-full aspect-[2/3] rounded-xl sm:rounded-2xl mb-4 shadow-2xl border-2 border-slate-800/50 relative overflow-hidden",
                            item.image
                          )}
                        >
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_via_transparent_to_transparent)]" />
                        </div>
                      ) : (
                        <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                          {item.emoji}
                        </span>
                      )}

                      <h4 className="font-black text-xs sm:text-sm mb-3 text-center text-slate-300 leading-tight min-h-[2.5rem] flex items-center justify-center">
                        {item.name.split(" ").length > 3
                          ? item.name.split(" ").slice(0, 2).join(" ")
                          : item.name}
                      </h4>

                      <div className="w-full h-10 mb-3 flex flex-col justify-end">
                        {!isOwned && progress > 0 && (
                          <div className="w-full px-1">
                            <div className="flex items-center justify-between text-[9px] font-black text-slate-500 mb-1 uppercase tracking-tighter">
                              <span className="hidden sm:inline">Progress</span>
                              <span
                                className={isReady ? "text-emerald-400" : ""}
                              >
                                {progress}/10
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                className={clsx(
                                  "h-full rounded-full bg-gradient-to-r",
                                  isReady
                                    ? "from-emerald-400 to-emerald-600"
                                    : "from-blue-400 to-blue-600"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${(progress / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-full flex flex-col gap-2">
                        {isOwned ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-600 font-black text-[10px] uppercase"
                          >
                            Owned
                          </button>
                        ) : isReady ? (
                          <button
                            onClick={() => handlePurchase(item, "diamonds")}
                            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase border border-emerald-400 animate-pulse"
                          >
                            Collect Free
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handlePurchase(item, "coins")}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-slate-900 font-black hover:bg-yellow-500 hover:text-white transition-all text-[10px]"
                            >
                              <CoinIcon
                                size={12}
                                className="text-yellow-600 group-hover:text-white"
                              />
                              {item.price ? item.price * 100 : 0}
                            </button>
                            <button
                              onClick={() => handlePurchase(item, "diamonds")}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 text-white font-black hover:bg-blue-600 transition-all text-[10px] border border-slate-700"
                            >
                              <Gem size={12} className="text-blue-400" />
                              {item.price}
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <PackOpeningModal
        isOpen={isPackModalOpen}
        onClose={handlePackModalClose}
        rarity={activePackRarity}
        reward={activePackReward}
      />
    </div>
  );
};
