import { motion } from "framer-motion";
import { Gem, ArrowRight, Zap, Star, ShieldCheck } from "lucide-react";
import { useUserStore } from "../../store/userStore";

const DIAMOND_BUNDLES = [
  {
    id: 1,
    amount: 100,
    price: "$0.99",
    bonus: null,
    color: "from-blue-500/20 to-blue-600/20",
    icon: Gem,
  },
  {
    id: 2,
    amount: 550,
    price: "$4.99",
    bonus: "10% Bonus",
    color: "from-purple-500/20 to-purple-600/20",
    icon: Gem,
    popular: true,
  },
  {
    id: 3,
    amount: 1200,
    price: "$9.99",
    bonus: "20% Bonus",
    color: "from-indigo-500/20 to-indigo-600/20",
    icon: Gem,
  },
  {
    id: 4,
    amount: 2500,
    price: "$19.99",
    bonus: "25% Bonus",
    color: "from-pink-500/20 to-pink-600/20",
    icon: Gem,
    bestValue: true,
  },
  {
    id: 5,
    amount: 6500,
    price: "$49.99",
    bonus: "30% Bonus",
    color: "from-amber-500/20 to-amber-600/20",
    icon: Gem,
  },
  {
    id: 6,
    amount: 15000,
    price: "$99.99",
    bonus: "50% Bonus",
    color: "from-red-500/20 to-red-600/20",
    icon: Gem,
  },
];

import { useUIStore } from "../../store/uiStore";

export const Diamonds = () => {
  const { addDiamonds } = useUserStore();
  const { openPurchaseModal } = useUIStore();

  const handlePurchase = (amount: number, price: string) => {
    openPurchaseModal(
      {
        name: `${amount.toLocaleString()} Diamonds`,
        price: price,
        amount: amount,
      },
      () => {
        addDiamonds(amount);
      }
    );
  };

  return (
    <div className="lobby-container flex flex-col items-center pt-32 px-4 overflow-hidden pb-10">
      <div className="lobby-background">
        <div className="lobby-background-image opacity-10" />
        <div className="lobby-background-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10 flex flex-col h-full max-h-[85vh]"
      >
        <div className="text-center mb-6 sm:mb-10 shrink-0">
          <div className="lobby-badge inline-flex mb-2">
            <Gem size={14} className="text-blue-400 mr-2" />
            Premium Store
          </div>
          <h1 className="lobby-title text-3xl sm:text-5xl">Get Diamonds</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mt-2 sm:mt-4">
            Diamonds can be used to purchase exclusive card backs, reactions,
            and special arena entries.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-12 pr-1">
          {/* Always 2 columns on small screens to avoid reflowing to huge stacked sections */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-12">
            {DIAMOND_BUNDLES.map((bundle, i) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`relative bg-slate-900/60 backdrop-blur-md border ${
                  bundle.popular
                    ? "border-purple-500/50"
                    : bundle.bestValue
                    ? "border-amber-500/50"
                    : "border-slate-700/50"
                } p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col items-center overflow-hidden group min-h-[220px] sm:min-h-[300px]`}
              >
                {bundle.popular && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-1 rounded-bl-xl uppercase tracking-tighter shadow-lg z-20">
                    Popular
                  </div>
                )}
                {bundle.bestValue && (
                  <div className="absolute top-0 right-0 bg-amber-600 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-1 rounded-bl-xl uppercase tracking-tighter shadow-lg z-20">
                    Best Value
                  </div>
                )}

                <div
                  className={`p-3 sm:p-5 rounded-full bg-gradient-to-br ${bundle.color} mb-3 sm:mb-5 group-hover:scale-110 transition-transform`}
                >
                  <Gem
                    size={24}
                    className="sm:w-[40px] sm:h-[40px] text-blue-400"
                  />
                </div>

                <div className="text-center mb-4 flex-1 flex flex-col items-center justify-center">
                  <div className="text-xl sm:text-3xl font-black text-white mb-0.5">
                    {bundle.amount.toLocaleString()}
                  </div>
                  <div className="text-blue-400 font-bold uppercase tracking-widest text-[8px] sm:text-[10px]">
                    Diamonds
                  </div>
                  <div className="h-4 sm:h-6 mt-1 flex items-center justify-center">
                    {bundle.bonus && (
                      <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500/20 text-green-400 text-[8px] sm:text-[9px] font-bold rounded-lg uppercase whitespace-nowrap">
                        {bundle.bonus}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(bundle.amount, bundle.price);
                  }}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-1 sm:gap-2 bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white border border-slate-700/50 group-hover:border-blue-400/50"
                >
                  {bundle.price}
                  <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 pb-8">
            <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-slate-800/20 rounded-2xl sm:rounded-3xl border border-slate-700/30">
              <Zap className="text-yellow-400 mb-2 sm:mb-4" size={24} />
              <h4 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">
                Instant Delivery
              </h4>
              <p className="text-[10px] sm:text-sm text-slate-500">
                Added immediately after purchase.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-slate-800/20 rounded-2xl sm:rounded-3xl border border-slate-700/30">
              <ShieldCheck
                className="text-emerald-400 mb-2 sm:mb-4"
                size={24}
              />
              <h4 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">
                Secure Checkout
              </h4>
              <p className="text-[10px] sm:text-sm text-slate-500">
                Encrypted and secured transactions.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-slate-800/20 rounded-2xl sm:rounded-3xl border border-slate-700/30">
              <Star className="text-blue-400 mb-2 sm:mb-4" size={24} />
              <h4 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">
                Premium Support
              </h4>
              <p className="text-[10px] sm:text-sm text-slate-500">
                24/7 priority support channel.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
