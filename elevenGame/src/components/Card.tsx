import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Card as CardType } from "../types";
import { Heart, Diamond, Club, Spade } from "lucide-react";
import { clsx } from "clsx";

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isRevealing?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isFaceDown?: boolean;
  revealDirection?: "up" | "down";
  className?: string;
}

const suitIcons = {
  hearts: Heart,
  diamonds: Diamond,
  clubs: Club,
  spades: Spade,
};

const suitColors = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-slate-900",
  spades: "text-slate-900",
};

export const Card = ({
  card,
  isSelected,
  isRevealing,
  onClick,
  onDoubleClick,
  isFaceDown = false,
  revealDirection = "up",
  className,
}: CardProps) => {
  const Icon = suitIcons[card.suit];
  const colorClass = suitColors[card.suit];

  // Animation Variants
  const variants: Variants = {
    initial: { scale: 0.5, rotateY: 0, y: 600, x: -200, opacity: 0 },
    animate: {
      scale: isRevealing ? 1.25 : isSelected ? 1.1 : 1,
      y: isRevealing
        ? revealDirection === "down"
          ? 60
          : -60
        : isSelected
          ? -20
          : 0,
      opacity: 1,
      zIndex: isRevealing ? 100 : isSelected ? 50 : 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
    exit: {
      scale: 0.2,
      opacity: 0,
      rotate: 360,
      // Move roughly towards "bottom right" (player pile)
      // We can't know exact screen coords easily without context, but a generic "down-right" drift helps.
      x: 100,
      y: 200,
      transition: { duration: 0.8, ease: "easeInOut" },
    },
    hover: { y: -10, scale: 1.05, zIndex: 10 },
  };

  return (
    <motion.div
      layoutId={`card-${card.id}`}
      variants={variants}
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ perspective: 1500 }}
      className={clsx(
        "relative w-14 h-20 sm:w-20 sm:h-28 lg:w-24 lg:h-36 cursor-pointer select-none transform-style-3d",
        className,
      )}
    >
      {/* Container that actually rotates */}
      <motion.div
        className="w-full h-full relative transform-style-3d shadow-xl"
        animate={{
          rotateY: isRevealing ? [180, 0] : isFaceDown ? 180 : 0,
        }}
        transition={
          isRevealing
            ? {
                rotateY: { duration: 1.2, ease: "easeInOut" },
              }
            : { type: "spring", stiffness: 260, damping: 20 }
        }
      >
        {/* FRONT FACE */}
        <div
          className={clsx(
            "absolute inset-0 bg-white rounded-lg sm:rounded-xl shadow-md border border-slate-200 flex flex-col justify-between p-1 sm:p-2 backface-hidden",
            isSelected &&
              "ring-2 sm:ring-4 ring-blue-500 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900",
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {(!isFaceDown || isRevealing) && (
            <>
              {/* Top Left */}
              <div className={clsx("flex flex-col items-center", colorClass)}>
                <span className="text-sm sm:text-lg lg:text-xl font-bold font-mono leading-none">
                  {card.rank}
                </span>
                <Icon
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4"
                  fill="currentColor"
                />
              </div>

              {/* Center Big Icon */}
              <div
                className={clsx(
                  "absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none",
                  colorClass,
                )}
              >
                <Icon
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16"
                  fill="currentColor"
                />
              </div>

              {/* Bottom Right (Rotated) */}
              <div
                className={clsx(
                  "flex flex-col items-center rotate-180",
                  colorClass,
                )}
              >
                <span className="text-sm sm:text-lg lg:text-xl font-bold font-mono leading-none">
                  {card.rank}
                </span>
                <Icon
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4"
                  fill="currentColor"
                />
              </div>
            </>
          )}
        </div>

        {/* BACK FACE (Face down state) */}
        <div
          className="absolute inset-0 bg-blue-800 rounded-lg sm:rounded-xl shadow-xl border-2 border-blue-900 flex items-center justify-center overflow-hidden backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute inset-1 sm:inset-2 border-2 border-blue-400/30 rounded sm:rounded-lg dashed opacity-50" />
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-full opacity-20" />
        </div>
      </motion.div>
    </motion.div>
  );
};
