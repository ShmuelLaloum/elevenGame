import { motion, AnimatePresence } from "framer-motion";
import type { Card as CardType } from "../types";
import { useState } from "react";
import { Card } from "./Card";

interface HandProps {
  cards: CardType[];
  isBot?: boolean;
  selectedCardId?: string | null;
  revealingCardId?: string | null;
  onCardClick?: (cardId: string) => void;
  onCardDoubleClick?: (cardId: string) => void;
  revealDirection?: "up" | "down";
  className?: string;
  baseDelay?: number;
}

// Helper component to handle taps
const TapHandler = ({
  card,
  isBot,
  isSelected,
  isRevealing,
  revealDirection,
  onSingleTap,
  onDoubleTap,
}: any) => {
  const [lastTap, setLastTap] = useState(0);

  const handleTap = () => {
    if (isBot) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      onDoubleTap();
      setLastTap(0); // Reset
    } else {
      setLastTap(now);
      onSingleTap();
    }
  };

  return (
    <div onClick={handleTap}>
      <Card
        card={card}
        isFaceDown={isBot}
        isSelected={isSelected}
        isRevealing={isRevealing}
        revealDirection={revealDirection}
      />
    </div>
  );
};

export const Hand = ({
  cards,
  isBot,
  selectedCardId,
  revealingCardId,
  onCardClick,
  onCardDoubleClick,
  revealDirection,
  className,
  baseDelay = 0,
}: HandProps) => {
  return (
    <div
      className={`flex justify-center -space-x-4 sm:-space-x-6 lg:-space-x-8 min-h-[80px] sm:min-h-[112px] lg:min-h-[144px] ${className}`}
    >
      <AnimatePresence>
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ y: 600, x: 400, rotate: 0, opacity: 0 }}
            animate={{
              y: 0,
              x: 0,
              rotate: (index - cards.length / 2) * 2,
              opacity: 1,
            }}
            exit={{ y: 200, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: (baseDelay || 0) + index * 0.2, // Sequential deal
            }}
            style={{ zIndex: index }}
          >
            <TapHandler
              card={card}
              isBot={isBot}
              isSelected={selectedCardId === card.id}
              isRevealing={revealingCardId === card.id}
              revealDirection={revealDirection}
              onSingleTap={() => onCardClick?.(card.id)}
              onDoubleTap={() => onCardDoubleClick?.(card.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
