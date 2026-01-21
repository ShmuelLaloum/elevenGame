import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Card as CardType } from "../types";
import { Heart, Diamond, Club, Spade } from "lucide-react";
import { clsx } from "clsx";

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isFaceDown?: boolean;
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
  onClick,
  onDoubleClick,
  isFaceDown = false,
  className,
}: CardProps) => {
  const Icon = suitIcons[card.suit];
  const colorClass = suitColors[card.suit];

  // Animation Variants
  const variants: Variants = {
    initial: { scale: 0.5, rotateY: 0, y: 600, x: -200, opacity: 0 },
    animate: {
      scale: isSelected ? 1.1 : 1,
      rotateY: isFaceDown ? 180 : 0,
      y: isSelected ? -20 : 0,
      opacity: 1,
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

  if (isFaceDown) {
    return (
      <motion.div
        layoutId={`card-${card.id}`}
        initial={{ scale: 0.5, y: -200, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={clsx(
          "relative w-14 h-20 sm:w-20 sm:h-28 lg:w-24 lg:h-36 bg-blue-800 rounded-lg sm:rounded-xl shadow-xl border-2 border-blue-900 flex items-center justify-center overflow-hidden backface-hidden",
          className
        )}
      >
        <div className="absolute inset-1 sm:inset-2 border-2 border-blue-400/30 rounded sm:rounded-lg dashed opacity-50" />
        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-full opacity-20" />
      </motion.div>
    );
  }

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
      className={clsx(
        "relative w-14 h-20 sm:w-20 sm:h-28 lg:w-24 lg:h-36 bg-white rounded-lg sm:rounded-xl shadow-md border border-slate-200 cursor-pointer select-none flex flex-col justify-between p-1 sm:p-2 transform-style-3d backface-hidden",
        isSelected &&
          "ring-2 sm:ring-4 ring-blue-500 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900",
        className
      )}
      transition={{
        layout: { duration: 0.3, ease: "easeInOut" }, // Make the move (Hand->Board) snappy (0.3s)
        default: { type: "spring", stiffness: 180, damping: 30 },
      }}
    >
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
          colorClass
        )}
      >
        <Icon
          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16"
          fill="currentColor"
        />
      </div>

      {/* Bottom Right (Rotated) */}
      <div
        className={clsx("flex flex-col items-center rotate-180", colorClass)}
      >
        <span className="text-sm sm:text-lg lg:text-xl font-bold font-mono leading-none">
          {card.rank}
        </span>
        <Icon
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4"
          fill="currentColor"
        />
      </div>
    </motion.div>
  );
};
