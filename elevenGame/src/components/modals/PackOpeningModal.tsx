import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Sparkles,
  Zap,
  Gem,
  Coins as CoinIcon,
  Layers,
  ChevronRight,
} from "lucide-react";
import { RARITY_CHANCES } from "../../constants/packs";
import type { PackRarity, PackReward } from "../../constants/packs";
import clsx from "clsx";
import { useUIStore } from "../../store/uiStore";
import { ALL_SHOP_ITEMS } from "../../constants/shopItems";

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  rarity: PackRarity;
  reward: PackReward | null;
}

export const PackOpeningModal = ({
  isOpen,
  onClose,
  rarity,
  reward,
}: PackOpeningModalProps) => {
  const { setNavbarVisible } = useUIStore();
  const [tapCount, setTapCount] = useState(0); // 0, 1, 2, 3
  const [currentVisualRarity, setCurrentVisualRarity] =
    useState<PackRarity>("simple");
  const [isOpened, setIsOpened] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNavbarVisible(false);
      setTapCount(0);
      setCurrentVisualRarity("simple");
      setIsOpened(false);
      setShowReward(false);
      setIsUpgrading(false);
    } else {
      setNavbarVisible(true);
    }
  }, [isOpen, setNavbarVisible]);

  const handleTap = () => {
    if (isOpened) return;

    const nextTap = tapCount + 1;
    setTapCount(nextTap);

    let nextVisualRarity: PackRarity = "simple";

    if (nextTap === 2) {
      if (rarity === "nice" || rarity === "epic") {
        nextVisualRarity = "nice";
      }
    } else if (nextTap === 3) {
      if (rarity === "nice") nextVisualRarity = "nice";
      if (rarity === "epic") nextVisualRarity = "epic";
    }

    if (nextVisualRarity !== currentVisualRarity) {
      setIsUpgrading(true);
      setTimeout(() => setIsUpgrading(false), 500);
      setCurrentVisualRarity(nextVisualRarity);
    }

    if (nextTap === 3) {
      setTimeout(() => {
        setIsOpened(true);
        setTimeout(() => setShowReward(true), 600);
      }, 400);
    }
  };

  const packConfig =
    RARITY_CHANCES.find((p) => p.rarity === currentVisualRarity) ||
    RARITY_CHANCES[0];
  const finalPackConfig =
    RARITY_CHANCES.find((p) => p.rarity === rarity) || RARITY_CHANCES[0];

  const getRewardIcon = () => {
    if (!reward) return null;
    if (reward.type === "fragment" && reward.itemId) {
      const item = ALL_SHOP_ITEMS.find((i) => i.id === reward.itemId);
      if (item) {
        if (item.type === "cardBack") {
          return (
            <div
              className={clsx(
                "w-16 h-24 rounded-lg shadow-2xl border-2 border-white/30 relative overflow-hidden",
                item.image
              )}
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_via_transparent_to_transparent)]" />
              <div className="flex items-center justify-center h-full">
                <div className="text-white/20 font-black text-xl rotate-45 select-none">
                  11
                </div>
              </div>
            </div>
          );
        }
        if (item.type === "reaction") {
          return <span className="text-6xl drop-shadow-2xl">{item.emoji}</span>;
        }
      }
    }

    switch (reward.type) {
      case "lightning":
        return <Zap className="text-yellow-400 fill-yellow-400" size={48} />;
      case "coins":
        return <CoinIcon className="text-yellow-500" size={48} />;
      case "diamonds":
        return <Gem className="text-blue-400 fill-blue-400" size={48} />;
      case "fragment":
        return <Layers className="text-purple-400" size={48} />;
      default:
        return null;
    }
  };

  const getRewardColor = () => {
    if (!reward) return "from-slate-400 to-slate-600";
    switch (reward.type) {
      case "lightning":
        return "from-yellow-400 to-orange-500 text-yellow-500";
      case "coins":
        return "from-yellow-500 to-amber-600 text-yellow-600";
      case "diamonds":
        return "from-blue-400 to-indigo-600 text-blue-500";
      case "fragment":
        return "from-purple-400 to-pink-600 text-purple-500";
      default:
        return "from-slate-400 to-slate-600 text-slate-500";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Rarity Glow Wall */}
          <motion.div
            className={clsx(
              "absolute inset-0 opacity-20 bg-gradient-to-at-center",
              packConfig.color
            )}
            animate={{
              scale: isUpgrading ? [1, 1.2, 1] : 1,
              opacity: isUpgrading ? [0.2, 0.4, 0.2] : 0.2,
            }}
          />

          <div className="relative z-[305] flex flex-col items-center w-full max-w-lg px-4">
            {!showReward ? (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-16"
              >
                <motion.div
                  key={currentVisualRarity}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={clsx(
                    "text-3xl font-black uppercase tracking-[0.3em] mb-4 bg-clip-text text-transparent bg-gradient-to-r",
                    packConfig.color
                  )}
                >
                  {currentVisualRarity} Pack
                </motion.div>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={clsx(
                        "w-12 h-1.5 rounded-full transition-all duration-500",
                        tapCount >= step
                          ? `bg-gradient-to-r ${packConfig.color}`
                          : "bg-slate-800"
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mb-12"
              >
                <div
                  className={clsx(
                    "text-xs font-black uppercase tracking-[0.4em] mb-2",
                    finalPackConfig.color
                      .split(" ")
                      .slice(-1)[0]
                      .replace("to-", "text-")
                  )}
                >
                  {rarity} Reward Found
                </div>
                <h2 className="text-5xl font-black text-white uppercase tracking-widest">
                  BOOM!
                </h2>
              </motion.div>
            )}

            <div className="relative w-full aspect-square flex items-center justify-center">
              <AnimatePresence mode="wait">
                {!isOpened ? (
                  <motion.div
                    key="pack"
                    className={clsx(
                      "w-56 h-56 rounded-[2.5rem] bg-gradient-to-br border-4 shadow-[0_0_80px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer relative",
                      packConfig.color,
                      "border-white/30"
                    )}
                    onClick={handleTap}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9, rotate: [0, -8, 8, 0] }}
                    animate={{
                      y: [0, -15, 0],
                      rotate: isUpgrading
                        ? [0, -10, 10, -10, 0]
                        : tapCount > 0
                        ? [-2, 2, -2]
                        : 0,
                      scale: isUpgrading ? [1, 1.15, 1] : 1,
                    }}
                    transition={{
                      y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      rotate: {
                        duration: isUpgrading ? 0.3 : 0.15,
                        repeat: isUpgrading ? 0 : tapCount > 0 ? Infinity : 0,
                      },
                    }}
                  >
                    <Package
                      className="text-white drop-shadow-2xl"
                      size={100}
                    />
                    <AnimatePresence>
                      {isUpgrading && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 bg-white rounded-full"
                              initial={{ x: "50%", y: "50%" }}
                              animate={{
                                x: `${50 + (Math.random() - 0.5) * 200}%`,
                                y: `${50 + (Math.random() - 0.5) * 200}%`,
                                opacity: 0,
                                scale: 0,
                              }}
                              transition={{ duration: 0.5 }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {tapCount === 0 && (
                      <motion.div
                        className="absolute -bottom-16 text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Tap to reveal <ChevronRight size={14} />
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="reward"
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 120 }}
                    className="flex flex-col items-center w-full"
                  >
                    <motion.div
                      className={clsx(
                        "w-64 h-80 bg-slate-900 border-2 rounded-[3rem] p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between relative overflow-hidden",
                        getRewardColor()
                          .split(" ")
                          .slice(-1)[0]
                          .replace("text-", "border-")
                          .replace("600", "500")
                          .replace("500", "400")
                      )}
                    >
                      <div
                        className={clsx(
                          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[70px] opacity-30 rounded-full",
                          getRewardColor().split(" ")[0]
                        )}
                      />
                      <motion.div
                        className="scale-[2] relative z-10"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {getRewardIcon()}
                      </motion.div>
                      <div className="text-center relative z-10">
                        <motion.div
                          className="text-4xl font-black text-white mb-1"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          {reward?.type === "fragment"
                            ? `${reward.amount}/10`
                            : `+${reward?.amount}`}
                        </motion.div>
                        <div
                          className={clsx(
                            "text-sm font-black uppercase tracking-[0.2em]",
                            getRewardColor().split(" ").slice(-1)[0]
                          )}
                        >
                          {reward?.type === "fragment"
                            ? reward.itemName
                            : reward?.type}
                        </div>
                      </div>
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-white/40"
                          style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            rotate: 180,
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2 + Math.random(),
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                        >
                          <Sparkles size={16} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              {isOpened && !showReward && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={clsx(
                      "w-32 h-32 rounded-full border-8 border-white",
                      finalPackConfig.color
                    )}
                  />
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={clsx(
                        "absolute w-4 h-4 rounded-full bg-white",
                        finalPackConfig.color
                      )}
                      initial={{ x: 0, y: 0, scale: 1 }}
                      animate={{
                        x: (Math.random() - 0.5) * 600,
                        y: (Math.random() - 0.5) * 600,
                        scale: 0,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  ))}
                </div>
              )}
            </div>
            {showReward && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={onClose}
                className="mt-16 w-full py-5 bg-white text-slate-900 font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] text-sm"
              >
                Collect & Continue
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
