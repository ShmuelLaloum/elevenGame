import { motion } from "framer-motion";
import type { Card as CardType } from "../types";
import React, { useState } from "react";
import { Card } from "./Card";

interface HandProps {
  cards: CardType[];
  isBot?: boolean;
  selectedCardId?: string | null;
  onCardClick?: (cardId: string) => void;
  onCardDoubleClick?: (cardId: string) => void;
  className?: string;
}

// Helper component to handle taps
const TapHandler = ({
  card,
  isBot,
  isSelected,
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
      <Card card={card} isFaceDown={isBot} isSelected={isSelected} />
    </div>
  );
};

export const Hand = ({
  cards,
  isBot,
  selectedCardId,
  onCardClick,
  onCardDoubleClick,
  className,
}: HandProps) => {
  return (
    <div className={`flex justify-center -space-x-8 ${className}`}>
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          style={{ zIndex: index }}
        >
          <TapHandler
            card={card}
            isBot={isBot}
            isSelected={selectedCardId === card.id}
            onSingleTap={() => onCardClick?.(card.id)}
            onDoubleTap={() => onCardDoubleClick?.(card.id)}
          />
        </motion.div>
      ))}
    </div>
  );
};
