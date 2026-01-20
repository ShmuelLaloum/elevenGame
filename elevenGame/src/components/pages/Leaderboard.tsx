import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const MOCK_LEADERBOARD = [
  { id: 1, name: "Alpha_Player", score: 2540, rank: 1, avatar: "A" },
  { id: 2, name: "CardMaster99", score: 2120, rank: 2, avatar: "C" },
  { id: 3, name: "LuckyStriker", score: 1980, rank: 3, avatar: "L" },
  { id: 4, name: "ZenGamer", score: 1850, rank: 4, avatar: "Z" },
  { id: 5, name: "TheWizard", score: 1720, rank: 5, avatar: "W" },
  { id: 6, name: "ShadowDancer", score: 1650, rank: 6, avatar: "S" },
  { id: 7, name: "MysticVoid", score: 1580, rank: 7, avatar: "M" },
  { id: 8, name: "IronHeart", score: 1510, rank: 8, avatar: "I" },
  { id: 9, name: "SwiftBlade", score: 1440, rank: 9, avatar: "S" },
  { id: 10, name: "Nebula", score: 1370, rank: 10, avatar: "N" },
  { id: 11, name: "FrostBite", score: 1300, rank: 11, avatar: "F" },
  { id: 12, name: "SolarFlare", score: 1230, rank: 12, avatar: "S" },
];

export const Leaderboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="lobby-container flex flex-col items-center pt-24 px-4 overflow-y-auto pb-20 custom-scrollbar">
      <div className="lobby-background">
        <div className="lobby-background-image opacity-10" />
        <div className="lobby-background-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10 flex flex-col h-full max-h-[85vh]"
      >
        <div className="text-center mb-6 shrink-0">
          <div className="lobby-badge inline-flex mb-2">
            <Trophy size={14} className="text-yellow-400 mr-2" />
            Global Rankings
          </div>
          <h1 className="lobby-title text-5xl">Leaderboard</h1>
        </div>

        <div className="flex-1 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full flex flex-col items-center justify-center py-20"
                >
                  <Loader2
                    className="animate-spin text-blue-500 mb-4"
                    size={40}
                  />
                  <p className="text-slate-400 font-medium animate-pulse">
                    Gathering rankings...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="divide-y divide-slate-800/50"
                >
                  {MOCK_LEADERBOARD.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="w-8 h-8 flex items-center justify-center font-bold">
                        {user.rank === 1 && (
                          <Medal className="text-yellow-400" size={20} />
                        )}
                        {user.rank === 2 && (
                          <Medal className="text-slate-300" size={20} />
                        )}
                        {user.rank === 3 && (
                          <Medal className="text-amber-600" size={20} />
                        )}
                        {user.rank > 3 && (
                          <span className="text-slate-500 text-sm">
                            {user.rank}
                          </span>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg border-2 border-slate-700/50 shrink-0">
                        {user.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-base truncate">
                          {user.name}
                        </div>
                        <div className="text-slate-500 text-xs flex items-center gap-1">
                          <Star size={10} className="text-yellow-500/50" />
                          Arena Rank: Master
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                          {user.score.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                          Points
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 p-5 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-between shrink-0 mb-4 sm:mb-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
              Y
            </div>
            <div>
              <div className="font-bold text-sm">Your Rank</div>
              <div className="text-slate-400 text-xs">#14,204 Globally</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-black text-lg text-blue-400">1,240</div>
            <div className="text-[9px] text-slate-500 uppercase font-bold">
              Points
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
