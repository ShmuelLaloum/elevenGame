import { motion } from "framer-motion";
import { Trophy, Medal, Star } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import clsx from "clsx";
import { useMemo } from "react";

export const Leaderboard = () => {
  const { leaderboard, score } = useUserStore();

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard]
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [leaderboard]);

  const myRank = sortedLeaderboard.find((u) => u.isMe)?.rank || 0;

  return (
    <div className="lobby-container flex flex-col items-center pt-32 px-4 overflow-hidden pb-10">
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
          <h1 className="lobby-title text-4xl sm:text-5xl">Leaderboard</h1>
        </div>

        <div className="flex-1 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto no-scrollbar p-1">
            <div className="divide-y divide-slate-800/50">
              {sortedLeaderboard.map((user, index) => {
                const isMe = user.isMe;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={clsx(
                      "flex items-center gap-4 p-4 transition-colors",
                      isMe
                        ? "bg-blue-600/20 border-y border-blue-500/30"
                        : "hover:bg-slate-800/50"
                    )}
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
                        <span
                          className={clsx(
                            "text-sm font-bold",
                            isMe ? "text-blue-400" : "text-slate-500"
                          )}
                        >
                          {user.rank}
                        </span>
                      )}
                    </div>

                    <div
                      className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 shrink-0",
                        isMe
                          ? "bg-blue-600 border-blue-400 text-white"
                          : "bg-gradient-to-br from-blue-500 to-purple-600 border-slate-700/50"
                      )}
                    >
                      {user.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={clsx(
                          "font-bold text-base truncate",
                          isMe ? "text-blue-400" : "text-white"
                        )}
                      >
                        {user.name} {isMe && "(You)"}
                      </div>
                      <div className="text-slate-500 text-xs flex items-center gap-1">
                        <Star size={10} className="text-yellow-500/50" />
                        Arena Rank: Master
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={clsx(
                          "text-xl font-black",
                          isMe
                            ? "text-blue-400"
                            : "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                        )}
                      >
                        {user.score.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                        Points
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM SUMMARY ROW */}
        <div className="mt-4 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-between shrink-0 mb-4 sm:mb-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
              Y
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Your Rank</div>
              <div className="text-slate-400 text-xs">#{myRank} Globally</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-black text-lg text-blue-400">
              {(
                sortedLeaderboard.find((u) => u.isMe)?.score ?? score
              ).toLocaleString()}
            </div>
            <div className="text-[9px] text-slate-500 uppercase font-bold text-right">
              Points
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500 text-xs gap-2 italic">
          <Trophy size={12} /> Keep playing matches to increase your rank!
        </div>
      </motion.div>
    </div>
  );
};
