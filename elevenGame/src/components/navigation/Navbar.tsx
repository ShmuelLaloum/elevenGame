import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  ShoppingBag,
  Gem,
  Zap,
  Archive,
  Coins as CoinIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../../store/userStore";
import clsx from "clsx";

const navItems = [
  { id: "lobby", label: "Lobby", path: "/", icon: LayoutDashboard },
  {
    id: "leaderboard",
    label: "Leaderboard",
    path: "/leaderboard",
    icon: Trophy,
  },
  { id: "locker", label: "Locker", path: "/locker", icon: Archive },
  { id: "shop", label: "Shop", path: "/shop", icon: ShoppingBag },
  { id: "diamonds", label: "Store", path: "/store", icon: Gem },
];

export const Navbar = () => {
  const location = useLocation();
  const { diamonds, lightning, coins } = useUserStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
      <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
        {/* Currency Display - Left Side */}
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl scale-90 sm:scale-100">
          <div className="flex items-center gap-1 sm:gap-1.5 border-r border-slate-700/50 pr-1 sm:pr-2">
            <Zap size={14} className="text-yellow-400 fill-yellow-400/20" />
            <span className="text-xs sm:text-sm font-bold text-white">
              {lightning}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 border-r border-slate-700/50 pr-1 sm:pr-2">
            <CoinIcon
              size={14}
              className="text-yellow-500 fill-yellow-500/20"
            />
            <span className="text-xs sm:text-sm font-bold text-white">
              {coins}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Gem size={14} className="text-blue-400 fill-blue-400/20" />
            <span className="text-xs sm:text-sm font-bold text-white">
              {diamonds}
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Center/Right Side */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 border bg-slate-900/80 backdrop-blur-xl border-slate-700/50 rounded-2xl shadow-2xl scale-90 sm:scale-100">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={clsx(
                  "relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 group",
                  isActive ? "text-white" : "text-slate-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  size={16}
                  className={clsx(
                    "sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:scale-110",
                    isActive
                      ? "text-blue-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap hidden sm:block">
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
