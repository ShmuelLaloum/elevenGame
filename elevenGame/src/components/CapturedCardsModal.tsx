import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Card as CardType } from "../types";
import { Card } from "./Card";

interface CapturedCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardType[];
}

export const CapturedCardsModal = ({
  isOpen,
  onClose,
  cards,
}: CapturedCardsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <h2 className="text-2xl font-bold text-slate-100">
            Your Captured Cards ({cards.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
          {cards.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              No cards captured yet.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {cards.map((card) => (
                <div key={card.id} className="relative group">
                  <Card
                    card={card}
                    className="w-full h-auto aspect-[2/3] text-xs"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
