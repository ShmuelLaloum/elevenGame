import type { Card as CardType } from "../types";
import { motion } from "framer-motion";
import { Card } from "./Card";
import { clsx } from "clsx";

interface BoardProps {
  cards: CardType[];
  selectedCardIds: string[];
  onCardClick: (cardId: string) => void;
}

export const Board = ({ cards, selectedCardIds, onCardClick }: BoardProps) => {
  const getLayoutConfig = (count: number) => {
    if (count > 15) return { cols: "grid-cols-6", scale: 0.55, gap: "gap-1" };
    if (count > 10) return { cols: "grid-cols-5", scale: 0.7, gap: "gap-1" }; // Reduced from gap-2
    return { cols: "grid-cols-4", scale: 0.9, gap: "gap-2" }; // Reduced from gap-4
  };

  const { cols, scale, gap } = getLayoutConfig(cards.length);

  return (
    <div
      className={clsx(
        "relative w-full max-w-4xl h-[450px] rounded-3xl border-[6px] border-emerald-900/40 bg-emerald-800/90 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300"
      )}
    >
      <div
        className={clsx(
          "grid transition-all duration-300 w-full justify-items-center items-center content-center",
          cols,
          gap
        )}
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layoutId={card.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: scale, opacity: 1 }}
            className="transition-all duration-300 flex justify-center items-center origin-center"
            style={{
              // Ensure the div itself doesn't take up full space if scaled down,
              // allowing grid to pack tighter visually if needed,
              // though grid cell size is determined by cols.
              width: "100%",
              height: "100%",
              maxHeight: "140px", // cap height
            }}
          >
            <div
              style={{ transform: `scale(${scale})` }}
              className="origin-center"
            >
              <Card
                card={card}
                isSelected={selectedCardIds.includes(card.id)}
                onClick={() => onCardClick(card.id)}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-emerald-950/20 font-black text-6xl uppercase tracking-widest rotate-12 select-none">
            Empty
          </span>
        </div>
      )}
    </div>
  );
};
