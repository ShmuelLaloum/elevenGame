import type { Card as CardType } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card";
import { clsx } from "clsx";

interface BoardProps {
  cards: CardType[];
  selectedCardIds: string[];
  onCardClick: (cardId: string) => void;
  baseDelay?: number;
  disableAnimation?: boolean;
  className?: string;
}

export const Board = ({
  cards,
  selectedCardIds,
  onCardClick,
  baseDelay = 0,
  disableAnimation = false,
  className,
}: BoardProps) => {
  const getLayoutConfig = (count: number) => {
    // Determine screen size category
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const isTablet =
      typeof window !== "undefined" &&
      window.innerWidth >= 640 &&
      window.innerWidth < 1024;

    let baseScale = 1.0;
    if (isMobile) baseScale = 0.82;
    else if (isTablet) baseScale = 0.92;

    if (count > 15)
      return { cols: "grid-cols-6", scale: baseScale * 0.6, gap: "gap-1" };
    if (count > 10)
      return { cols: "grid-cols-5", scale: baseScale * 0.75, gap: "gap-1" };
    return {
      cols: "grid-cols-4",
      scale: baseScale * 1.0,
      gap: "gap-1 sm:gap-2",
    };
  };

  const { cols, scale, gap } = getLayoutConfig(cards.length);

  return (
    <div
      className={clsx(
        "relative w-full max-w-4xl h-[280px] sm:h-[380px] lg:h-[480px] rounded-2xl sm:rounded-3xl border-[4px] sm:border-[6px] border-emerald-900/40 bg-emerald-800/90 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] sm:shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 transition-all duration-300",
        className,
      )}
    >
      <div
        className={clsx(
          "grid transition-all duration-300 w-full justify-items-center items-center content-center",
          cols,
          gap,
        )}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={disableAnimation ? false : { scale: 0.5, opacity: 0 }}
              animate={{ scale: scale, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                delay: disableAnimation
                  ? 0
                  : baseDelay +
                    0.2 *
                      (cards.indexOf(card) !== -1 ? cards.indexOf(card) : 0),
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="transition-all duration-300 flex justify-center items-center origin-center"
              style={{
                width: "100%",
                height: "100%",
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
        </AnimatePresence>
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
