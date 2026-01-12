import { motion } from "framer-motion";
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

  if (isFaceDown) {
    return (
      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={clsx(
          "relative w-24 h-36 bg-blue-800 rounded-xl shadow-xl border-2 border-blue-900 flex items-center justify-center overflow-hidden",
          className
        )}
      >
        <div className="absolute inset-2 border-2 border-blue-400/30 rounded-lg dashed opacity-50" />
        <div className="w-12 h-12 bg-blue-600 rounded-full opacity-20" />
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -5, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isSelected ? 1.1 : 1,
        y: isSelected ? -20 : 0,
        opacity: 1,
        boxShadow: isSelected
          ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
          : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={clsx(
        "relative w-24 h-36 bg-white rounded-xl shadow-md border border-slate-200 cursor-pointer select-none flex flex-col justify-between p-2",
        isSelected &&
          "ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-900",
        className
      )}
    >
      {/* Top Left */}
      <div className={clsx("flex flex-col items-center", colorClass)}>
        <span className="text-xl font-bold font-mono leading-none">
          {card.rank}
        </span>
        <Icon size={16} fill="currentColor" />
      </div>

      {/* Center Big Icon */}
      <div
        className={clsx(
          "absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none",
          colorClass
        )}
      >
        <Icon size={64} fill="currentColor" />
      </div>

      {/* Bottom Right (Rotated) */}
      <div
        className={clsx("flex flex-col items-center rotate-180", colorClass)}
      >
        <span className="text-xl font-bold font-mono leading-none">
          {card.rank}
        </span>
        <Icon size={16} fill="currentColor" />
      </div>
    </motion.div>
  );
};
