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

export const Diamonds = () => {
  const { addDiamonds } = useUserStore();

  const handlePurchase = (amount: number, price: string) => {
    addDiamonds(amount);
    alert(
      `Successfully purchased ${amount.toLocaleString()} Diamonds for ${price}! 💎`
    );
  };

  return (
    <div className="lobby-container flex flex-col items-center pt-24 px-4 overflow-y-auto pb-20 custom-scrollbar">
      <div className="lobby-background">
        <div className="lobby-background-image opacity-10" />
        <div className="lobby-background-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="lobby-badge inline-flex mb-2">
            <Gem size={14} className="text-blue-400 mr-2" />
            Premium Store
          </div>
          <h1 className="lobby-title text-5xl">Get Diamonds</h1>
          <p className="text-slate-400 max-w-md mx-auto mt-4">
            Diamonds can be used to purchase exclusive card backs, reactions,
            and special arena entries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              } p-8 rounded-[2rem] shadow-2xl flex flex-col items-center overflow-hidden group`}
            >
              {bundle.popular && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-tighter">
                  Most Popular
                </div>
              )}
              {bundle.bestValue && (
                <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-tighter">
                  Best Value
                </div>
              )}

              <div
                className={`p-6 rounded-full bg-gradient-to-br ${bundle.color} mb-6 group-hover:scale-110 transition-transform`}
              >
                <Gem size={48} className="text-blue-400" />
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-black text-white mb-1">
                  {bundle.amount.toLocaleString()}
                </div>
                <div className="text-blue-400 font-bold uppercase tracking-widest text-xs">
                  Diamonds
                </div>
                {bundle.bonus && (
                  <div className="mt-2 inline-block px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-lg uppercase">
                    {bundle.bonus}
                  </div>
                )}
              </div>

              <button
                onClick={() => handlePurchase(bundle.amount, bundle.price)}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
                  bundle.popular || bundle.bestValue
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                {bundle.price}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-slate-800/20 rounded-3xl border border-slate-700/30">
            <Zap className="text-yellow-400 mb-4" size={32} />
            <h4 className="font-bold mb-2">Instant Delivery</h4>
            <p className="text-sm text-slate-500">
              Your diamonds are added to your account immediately after
              purchase.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-slate-800/20 rounded-3xl border border-slate-700/30">
            <ShieldCheck className="text-emerald-400 mb-4" size={32} />
            <h4 className="font-bold mb-2">Secure Checkout</h4>
            <p className="text-sm text-slate-500">
              All transactions are encrypted and secured by industry standard
              protocols.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-slate-800/20 rounded-3xl border border-slate-700/30">
            <Star className="text-blue-400 mb-4" size={32} />
            <h4 className="font-bold mb-2">Premium Support</h4>
            <p className="text-sm text-slate-500">
              VIP buyers get access to our 24/7 priority support channel.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
