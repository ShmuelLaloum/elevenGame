import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Gem,
  ShoppingCart,
  AlertCircle,
  Info,
  AlertTriangle,
  Coins as CoinIcon,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import clsx from "clsx";

export const GlobalModals = () => {
  const { purchaseModal, closePurchaseModal, alertModal, closeAlertModal } =
    useUIStore();

  return (
    <>
      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {purchaseModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <button
                onClick={closePurchaseModal}
                className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>

              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <ShoppingCart className="text-blue-400" size={32} />
                </div>

                <h2 className="text-2xl font-black text-white mb-2">
                  Confirm Purchase
                </h2>
                <p className="text-slate-400 mb-6">
                  Are you sure you want to purchase{" "}
                  <span className="text-white font-bold">
                    {purchaseModal.item?.name}
                  </span>
                  ?
                </p>

                <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                    Price:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {purchaseModal.item?.currency === "coins" ? (
                      <CoinIcon size={18} className="text-yellow-500" />
                    ) : purchaseModal.item?.currency === "diamonds" ? (
                      <Gem size={18} className="text-blue-400" />
                    ) : null}
                    <span className="text-2xl font-black text-white">
                      {purchaseModal.item?.price || purchaseModal.item?.amount}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      purchaseModal.onConfirm?.();
                      closePurchaseModal();
                    }}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Confirm & Buy
                  </button>
                  <button
                    onClick={closePurchaseModal}
                    className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Modal (Error/Warning/Info) */}
      <AnimatePresence>
        {alertModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={clsx(
                "relative w-full max-w-sm bg-slate-900 border rounded-[2rem] shadow-2xl overflow-hidden",
                alertModal.type === "error"
                  ? "border-red-500/30"
                  : "border-slate-700"
              )}
            >
              <button
                onClick={closeAlertModal}
                className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>

              <div className="p-8 text-center">
                <div
                  className={clsx(
                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2",
                    alertModal.type === "error"
                      ? "bg-red-500/10 border-red-500/50"
                      : alertModal.type === "warning"
                      ? "bg-yellow-500/10 border-yellow-500/50"
                      : "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  {alertModal.type === "error" && (
                    <AlertCircle className="text-red-400" size={32} />
                  )}
                  {alertModal.type === "warning" && (
                    <AlertTriangle className="text-yellow-400" size={32} />
                  )}
                  {alertModal.type === "info" && (
                    <Info className="text-blue-400" size={32} />
                  )}
                </div>

                <h2 className="text-2xl font-black text-white mb-2">
                  {alertModal.title}
                </h2>
                <p className="text-slate-400 mb-8 whitespace-pre-line">
                  {alertModal.message}
                </p>

                <button
                  onClick={closeAlertModal}
                  className={clsx(
                    "w-full py-4 rounded-xl font-black transition-all shadow-lg",
                    alertModal.type === "error"
                      ? "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                      : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                  )}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
