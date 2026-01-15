import { motion, AnimatePresence } from "framer-motion";
import { Globe, Trophy, Loader2, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";

interface MatchmakingScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchFound: (opponents: { name: string; avatarUrl?: string }[]) => void;
  category: "battleRoyale" | "arena";
  teamSize: "1v1" | "2v2";
  teamPlayers: { name: string; avatarUrl?: string }[];
}

export const MatchmakingScreen = ({
  isOpen,
  onClose,
  onMatchFound,
  category,
  teamSize,
  teamPlayers,
}: MatchmakingScreenProps) => {
  const [searchPhase, setSearchPhase] = useState<
    "searching" | "found" | "starting"
  >("searching");
  const [searchTime, setSearchTime] = useState(0);
  const [foundOpponents, setFoundOpponents] = useState<
    { name: string; avatarUrl?: string }[]
  >([]);

  // Bot names for matching
  const botNames = [
    "ProPlayer99",
    "CardMaster",
    "ScopaKing",
    "LuckyAce",
    "GameWizard",
    "ElevenChamp",
    "CardShark",
    "RoyalFlush",
    "StarPlayer",
    "CardNinja",
  ];

  const getRandomBotName = (exclude: string[]) => {
    const available = botNames.filter((name) => !exclude.includes(name));
    return available[Math.floor(Math.random() * available.length)] || "Player";
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchPhase("searching");
      setSearchTime(0);
      setFoundOpponents([]);
      return;
    }

    // Search timer
    const timer = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);

    // Simulate finding opponents after 3-5 seconds
    const findDelay = 3000 + Math.random() * 2000;
    const findTimeout = setTimeout(() => {
      const opponentCount = teamSize === "2v2" ? 2 : 1;
      const opponents: { name: string; avatarUrl?: string }[] = [];
      const usedNames: string[] = [];

      for (let i = 0; i < opponentCount; i++) {
        const name = getRandomBotName(usedNames);
        usedNames.push(name);
        opponents.push({ name });
      }

      setFoundOpponents(opponents);
      setSearchPhase("found");

      // Start game after showing opponents for 2 seconds
      setTimeout(() => {
        setSearchPhase("starting");
        setTimeout(() => {
          onMatchFound(opponents);
        }, 1000);
      }, 2000);
    }, findDelay);

    return () => {
      clearInterval(timer);
      clearTimeout(findTimeout);
    };
  }, [isOpen, teamSize, onMatchFound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const categoryConfig = {
    battleRoyale: {
      icon: Globe,
      title: "Battle Royale",
      gradient: "from-orange-500 to-red-600",
      shadowColor: "rgba(249, 115, 22, 0.3)",
      bgGlow: "from-orange-500/20 to-red-500/20",
    },
    arena: {
      icon: Trophy,
      title: "Ranked Arena",
      gradient: "from-purple-500 to-pink-600",
      shadowColor: "rgba(168, 85, 247, 0.3)",
      bgGlow: "from-purple-500/20 to-pink-500/20",
    },
  };

  // Default config if category is not in categoryConfig
  const defaultConfig = {
    icon: Globe,
    title: "Match",
    gradient: "from-blue-500 to-indigo-600",
    shadowColor: "rgba(59, 130, 246, 0.3)",
    bgGlow: "from-blue-500/20 to-indigo-500/20",
  };

  const config = categoryConfig[category] || defaultConfig;
  const Icon = config.icon;

  // Player Card Component
  const PlayerCard = ({
    player,
    delay = 0,
    isSearching = false,
    isOpponent = false,
  }: {
    player?: { name: string; avatarUrl?: string };
    delay?: number;
    isSearching?: boolean;
    isOpponent?: boolean;
  }) => (
    <motion.div
      className={clsx(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-slate-800/90 to-slate-900/95",
        "border-2 backdrop-blur-md shadow-2xl",
        "transition-all duration-300",
        isSearching
          ? "border-dashed border-slate-600/50"
          : isOpponent
          ? `border-transparent bg-gradient-to-br ${config.gradient}`
          : "border-blue-500/50 shadow-blue-500/20"
      )}
      style={{
        width: "clamp(120px, 22vw, 200px)",
        aspectRatio: "3 / 4",
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    >
      {isSearching ? (
        /* Searching State */
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <motion.div
            className={clsx(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center",
              "bg-slate-700/50 border-2 border-dashed border-slate-500/50"
            )}
            animate={{
              borderColor: [
                "rgba(100,116,139,0.5)",
                "rgba(59,130,246,0.8)",
                "rgba(100,116,139,0.5)",
              ],
              rotate: 360,
            }}
            transition={{
              borderColor: { duration: 2, repeat: Infinity },
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
            </motion.div>
          </motion.div>
          <div className="text-center px-3">
            <span className="text-slate-400 font-medium text-xs sm:text-sm block">
              Searching...
            </span>
            <motion.div
              className="flex gap-1 mt-2 justify-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400/50"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      ) : player ? (
        /* Player State */
        <div className="w-full h-full flex flex-col">
          {/* Avatar Section */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            <motion.div
              className={clsx(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden",
                isOpponent
                  ? "bg-gradient-to-br from-red-500 to-orange-600"
                  : "bg-gradient-to-br from-blue-500 to-purple-600",
                "border-3 shadow-xl border-white/20"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
            >
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white">
                  {player.name.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>
          </div>

          {/* Info Section */}
          <div
            className={clsx(
              "p-3 border-t",
              isOpponent
                ? "bg-black/20 border-white/10"
                : "bg-slate-900/50 border-slate-700/50"
            )}
          >
            <h3 className="text-sm sm:text-base font-bold text-white text-center truncate">
              {player.name}
            </h3>
            <div
              className={clsx(
                "w-full py-1 mt-2 rounded-lg text-center text-xs font-medium",
                isOpponent
                  ? "bg-white/10 text-white/80"
                  : "bg-blue-500/20 text-blue-400"
              )}
            >
              {isOpponent ? "Opponent" : "You"}
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 bg-slate-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1605218427335-3a4dd384143e?q=80&w=2070&auto=format&fit=crop")`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900" />
          </motion.div>

          {/* Animated Glow Circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={clsx(
                  "absolute rounded-full blur-3xl",
                  `bg-gradient-to-br ${config.bgGlow}`
                )}
                style={{
                  width: `${300 + i * 150}px`,
                  height: `${300 + i * 150}px`,
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  x: "-50%",
                  y: "-50%",
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Cancel Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <X size={24} />
          </motion.button>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 p-6 text-center w-full max-w-4xl">
            {/* Mode Badge */}
            <motion.div
              className={clsx(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-white font-bold",
                `bg-gradient-to-r ${config.gradient}`
              )}
              style={{ boxShadow: `0 10px 40px ${config.shadowColor}` }}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Icon size={24} />
              {config.title} {teamSize}
            </motion.div>

            {/* Status Text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {searchPhase === "searching" && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Searching for Opponents...
                  </h2>
                  <p className="text-slate-400 text-lg">
                    {formatTime(searchTime)}
                  </p>
                </>
              )}
              {searchPhase === "found" && (
                <motion.h2
                  className="text-2xl sm:text-3xl font-bold text-emerald-400"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  🎉 Match Found! 🎉
                </motion.h2>
              )}
              {searchPhase === "starting" && (
                <motion.h2
                  className="text-3xl sm:text-4xl font-black text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  Starting Game...
                </motion.h2>
              )}
            </motion.div>

            {/* Cards Container */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              {/* Your Team Cards */}
              <div className="flex gap-2 sm:gap-4">
                {teamPlayers.map((player, index) => (
                  <PlayerCard
                    key={index}
                    player={player}
                    delay={0.3 + index * 0.1}
                    isOpponent={false}
                  />
                ))}
              </div>

              {/* VS Divider */}
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div
                  className={clsx(
                    "w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-lg sm:text-xl font-black text-white",
                    `bg-gradient-to-br ${config.gradient}`
                  )}
                  style={{ boxShadow: `0 0 40px ${config.shadowColor}` }}
                >
                  VS
                </div>
              </motion.div>

              {/* Opponent Cards */}
              <div className="flex gap-2 sm:gap-4">
                {searchPhase === "searching"
                  ? // Show searching card(s)
                    [...Array(teamSize === "2v2" ? 2 : 1)].map((_, index) => (
                      <PlayerCard
                        key={`search-${index}`}
                        delay={0.4 + index * 0.1}
                        isSearching={true}
                      />
                    ))
                  : // Show found opponents
                    foundOpponents.map((opponent, index) => (
                      <PlayerCard
                        key={index}
                        player={opponent}
                        delay={index * 0.15}
                        isOpponent={true}
                      />
                    ))}
              </div>
            </div>

            {/* Loading indicator */}
            {searchPhase === "searching" && (
              <motion.div
                className="flex items-center gap-3 text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">
                  Looking for players in your region...
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
