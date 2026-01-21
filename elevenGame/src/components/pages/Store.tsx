import { motion } from "framer-motion";
import { Gem, Star, Coins as CoinIcon, ShieldCheck, Zap } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { useUIStore } from "../../store/uiStore";

const DIAMOND_BUNDLES = [
  {
    id: "d1",
    amount: 10,
    price: "$0.99",
    color: "from-blue-500/20 to-blue-600/20",
    icon: Gem,
  },
  {
    id: "d2",
    amount: 60,
    price: "$4.99",
    bonus: "20% Bonus",
    color: "from-purple-500/20 to-purple-600/20",
    icon: Gem,
    popular: true,
  },
  {
    id: "d3",
    amount: 150,
    price: "$9.99",
    bonus: "50% Bonus",
    color: "from-indigo-500/20 to-indigo-600/20",
    icon: Gem,
    bestValue: true,
  },
];

const COIN_BUNDLES = [
  {
    id: "c1",
    amount: 100,
    price: "$0.49",
    color: "from-yellow-500/20 to-amber-600/20",
    icon: CoinIcon,
  },
  {
    id: "c2",
    amount: 600,
    price: "$2.49",
    bonus: "20% Bonus",
    color: "from-orange-500/20 to-orange-600/20",
    icon: CoinIcon,
    popular: true,
  },
  {
    id: "c3",
    amount: 1500,
    price: "$4.99",
    bonus: "50% Bonus",
    color: "from-yellow-400/20 to-yellow-600/20",
    icon: CoinIcon,
    bestValue: true,
  },
];

export const Store = () => {
  const { addDiamonds, addCoins } = useUserStore();
  const { openPurchaseModal } = useUIStore();

  const handleBuyDiamonds = (amount: number, price: string) => {
    openPurchaseModal(
      {
        id: "diamonds",
        name: `${amount.toLocaleString()} Diamonds`,
        price: price,
        type: "cardBack",
      },
      () => {
        addDiamonds(amount);
      }
    );
  };

  const handleBuyCoins = (amount: number, price: string) => {
    openPurchaseModal(
      {
        id: "coins",
        name: `${amount.toLocaleString()} Coins`,
        price: price,
        type: "reaction",
      },
      () => {
        addCoins(amount);
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
        className="w-full max-w-5xl relative z-10 flex flex-col h-full max-h-[85vh]"
      >
        <div className="text-center mb-6 sm:mb-10 shrink-0">
          <div className="lobby-badge inline-flex mb-2">
            <Star size={14} className="text-blue-400 mr-2" />
            Official Store
          </div>
          <h1 className="lobby-title text-3xl sm:text-5xl uppercase">Store</h1>
          <p className="text-slate-400 text-[10px] sm:text-sm max-w-md mx-auto mt-2 sm:mt-4">
            Get Diamonds and Coins to upgrade your experience and collect
            exclusive items.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-12 pr-1">
          {/* Diamond Packs */}
          <h2 className="text-lg sm:text-2xl font-black mb-6 px-2 flex items-center gap-3 uppercase">
            <Gem className="text-blue-400" /> Diamond Packs
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-12">
            {DIAMOND_BUNDLES.map((bundle) => (
              <motion.div
                key={bundle.id}
                whileHover={{ y: -5 }}
                className={`relative bg-slate-900/60 backdrop-blur-md border ${
                  bundle.popular
                    ? "border-purple-500/50"
                    : bundle.bestValue
                    ? "border-amber-500/50"
                    : "border-slate-700/50"
                } p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col items-center group overflow-hidden`}
              >
                {bundle.popular && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-[7px] sm:text-[10px] px-2 sm:px-4 py-1 rounded-bl-xl font-black uppercase tracking-tighter">
                    Most Popular
                  </div>
                )}
                {bundle.bestValue && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[7px] sm:text-[10px] px-2 sm:px-4 py-1 rounded-bl-xl font-black uppercase tracking-tighter">
                    Best Value
                  </div>
                )}
                <div
                  className={`p-3 sm:p-5 rounded-full bg-gradient-to-br ${bundle.color} mb-3 sm:mb-5 group-hover:scale-110 transition-transform`}
                >
                  <bundle.icon
                    size={20}
                    className="sm:w-10 sm:h-10 text-blue-400"
                  />
                </div>
                <div className="text-center mb-3 sm:mb-6 flex-1">
                  <div className="text-sm sm:text-3xl font-black text-white">
                    {bundle.amount.toLocaleString()}
                  </div>
                  <div className="text-blue-400 font-bold uppercase tracking-widest text-[8px] sm:text-[10px]">
                    Diamonds
                  </div>
                  {bundle.bonus && (
                    <div className="mt-1 sm:mt-2 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-green-500/20 text-green-400 text-[6px] sm:text-[10px] font-bold rounded-lg uppercase">
                      {bundle.bonus}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleBuyDiamonds(bundle.amount, bundle.price)}
                  className="w-full py-2 sm:py-4 rounded-xl sm:rounded-2xl font-black transition-all bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white border border-slate-700/50 text-[10px] sm:text-base"
                >
                  {bundle.price}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Coin Packs */}
          <h2 className="text-lg sm:text-2xl font-black mb-6 px-2 flex items-center gap-3 uppercase">
            <CoinIcon className="text-yellow-500" /> Coin Packs
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-12">
            {COIN_BUNDLES.map((bundle) => (
              <motion.div
                key={bundle.id}
                whileHover={{ y: -5 }}
                className={`relative bg-slate-900/60 backdrop-blur-md border ${
                  bundle.popular
                    ? "border-orange-500/50"
                    : bundle.bestValue
                    ? "border-yellow-500/50"
                    : "border-slate-700/50"
                } p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col items-center group overflow-hidden`}
              >
                {bundle.popular && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[7px] sm:text-[10px] px-2 sm:px-4 py-1 rounded-bl-xl font-black uppercase tracking-tighter">
                    Most Popular
                  </div>
                )}
                {bundle.bestValue && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[7px] sm:text-[10px] px-2 sm:px-4 py-1 rounded-bl-xl font-black uppercase tracking-tighter">
                    Best Value
                  </div>
                )}
                <div
                  className={`p-3 sm:p-5 rounded-full bg-gradient-to-br ${bundle.color} mb-3 sm:mb-5 group-hover:scale-110 transition-transform`}
                >
                  <bundle.icon
                    size={20}
                    className="sm:w-10 sm:h-10 text-yellow-500"
                  />
                </div>
                <div className="text-center mb-3 sm:mb-6 flex-1">
                  <div className="text-sm sm:text-3xl font-black text-white">
                    {bundle.amount.toLocaleString()}
                  </div>
                  <div className="text-yellow-500 font-bold uppercase tracking-widest text-[8px] sm:text-[10px]">
                    Coins
                  </div>
                  {bundle.bonus && (
                    <div className="mt-1 sm:mt-2 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-green-500/20 text-green-400 text-[6px] sm:text-[10px] font-bold rounded-lg uppercase">
                      {bundle.bonus}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleBuyCoins(bundle.amount, bundle.price)}
                  className="w-full py-2 sm:py-4 rounded-xl sm:rounded-2xl font-black transition-all bg-slate-800 text-slate-400 group-hover:bg-yellow-600 group-hover:text-white border border-slate-700/50 text-[10px] sm:text-base"
                >
                  {bundle.price}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Trust Footer */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-8 pb-8 border-t border-slate-700/50 pt-10 sm:pt-12 mt-8">
            <div className="flex flex-col items-center text-center px-1 py-4 sm:p-8 bg-slate-800/20 rounded-2xl sm:rounded-[2.5rem] border border-slate-700/30 group hover:border-blue-500/30 transition-colors">
              <div className="p-2 sm:p-4 rounded-full bg-yellow-500/10 text-yellow-400 mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
                <Zap size={16} className="sm:w-7 sm:h-7" />
              </div>
              <h4 className="font-bold text-[8px] sm:text-lg mb-0.5 sm:mb-2 text-white uppercase leading-tight">
                Instant Delivery
              </h4>
              <p className="text-[7px] sm:text-xs text-slate-500 leading-tight sm:leading-relaxed">
                Added to account immediately after purchase.
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-1 py-4 sm:p-8 bg-slate-800/20 rounded-2xl sm:rounded-[2.5rem] border border-slate-700/30 group hover:border-emerald-500/30 transition-colors">
              <div className="p-2 sm:p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck size={16} className="sm:w-7 sm:h-7" />
              </div>
              <h4 className="font-bold text-[8px] sm:text-lg mb-0.5 sm:mb-2 text-white uppercase leading-tight">
                Secure Payment
              </h4>
              <p className="text-[7px] sm:text-xs text-slate-500 leading-tight sm:leading-relaxed">
                Encrypted and secured transactions.
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-1 py-4 sm:p-8 bg-slate-800/20 rounded-2xl sm:rounded-[2.5rem] border border-slate-700/30 group hover:border-blue-500/30 transition-colors">
              <div className="p-2 sm:p-4 rounded-full bg-blue-500/10 text-blue-400 mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
                <Star size={16} className="sm:w-7 sm:h-7" />
              </div>
              <h4 className="font-bold text-[8px] sm:text-lg mb-0.5 sm:mb-2 text-white uppercase leading-tight">
                Premium Support
              </h4>
              <p className="text-[7px] sm:text-xs text-slate-500 leading-tight sm:leading-relaxed">
                24/7 priority support channels.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
