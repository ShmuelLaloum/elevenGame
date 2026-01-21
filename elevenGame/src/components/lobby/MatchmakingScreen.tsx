import { motion, AnimatePresence } from "framer-motion";
import { Globe, Trophy, Loader2, X, Zap } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
  const botNames = useMemo(
    () => [
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
    ],
    []
  );

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
  }, [isOpen, teamSize, onMatchFound, botNames]);

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
      accentColor: "orange",
    },
    arena: {
      icon: Trophy,
      title: "Ranked Arena",
      gradient: "from-purple-500 to-pink-600",
      shadowColor: "rgba(168, 85, 247, 0.3)",
      bgGlow: "from-purple-500/20 to-pink-500/20",
      accentColor: "purple",
    },
  };

  // Default config if category is not in categoryConfig
  const defaultConfig = {
    icon: Globe,
    title: "Match",
    gradient: "from-blue-500 to-indigo-600",
    shadowColor: "rgba(59, 130, 246, 0.3)",
    bgGlow: "from-blue-500/20 to-indigo-500/20",
    accentColor: "blue",
  };

  const config = categoryConfig[category] || defaultConfig;
  const Icon = config.icon;
  const opponentCount = teamSize === "2v2" ? 2 : 1;

  // Player Card Component - Stable, no re-rendering flicker
  const PlayerCard = ({
    player,
    isOpponent = false,
    isSearching = false,
  }: {
    player?: { name: string; avatarUrl?: string };
    isOpponent?: boolean;
    isSearching?: boolean;
  }) => (
    <div
      className={clsx(
        "relative rounded-2xl overflow-hidden",
        "border-2 backdrop-blur-md shadow-xl matchmaking-card",
        "w-[125px] h-[175px] flex-shrink-0",
        isSearching
          ? "bg-slate-800/80 border-dashed border-slate-600/50"
          : isOpponent
          ? `bg-gradient-to-br ${config.gradient} border-transparent`
          : "bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50"
      )}
    >
      <div className="w-full h-full flex flex-col">
        {/* Avatar Section */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 relative">
          {isSearching ? (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-700/50 border-2 border-dashed border-slate-500/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 animate-spin" />
            </div>
          ) : (
            <div
              className={clsx(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden",
                isOpponent
                  ? "bg-white/20"
                  : "bg-gradient-to-br from-blue-500 to-purple-600",
                "border-2 shadow-lg",
                isOpponent ? "border-white/30" : "border-white/20"
              )}
            >
              {player?.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
                  {player?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div
          className={clsx(
            "p-2 sm:p-3 border-t text-center",
            isSearching
              ? "bg-slate-900/50 border-slate-700/50"
              : isOpponent
              ? "bg-black/20 border-white/10"
              : "bg-slate-900/50 border-slate-700/50"
          )}
        >
          <h3 className="text-[10px] sm:text-xs font-bold text-white line-clamp-2 leading-tight min-h-[2.4em] flex items-center justify-center">
            {isSearching ? "Searching..." : player?.name || "Unknown"}
          </h3>
          <div
            className={clsx(
              "w-full py-1 mt-1.5 rounded text-center text-[10px] sm:text-xs font-medium",
              isSearching
                ? "bg-slate-700/50 text-slate-400"
                : isOpponent
                ? "bg-white/10 text-white/80"
                : "bg-blue-500/20 text-blue-400"
            )}
          >
            {isSearching ? "..." : isOpponent ? "Opponent" : "Your Team"}
          </div>
        </div>
      </div>
    </div>
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
          {/* Background */}
          <div className="absolute inset-0 bg-slate-900">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1605218427335-3a4dd384143e?q=80&w=2070&auto=format&fit=crop")`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-transparent to-slate-900/90" />

            {/* Static glow */}
            <div
              className={clsx(
                "absolute rounded-full blur-[100px] opacity-30",
                `bg-gradient-to-br ${config.bgGlow}`
              )}
              style={{
                width: "600px",
                height: "600px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          {/* Cancel Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-6 text-center w-full max-w-4xl">
            {/* Mode Badge */}
            <motion.div
              className={clsx(
                "flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base",
                `bg-gradient-to-r ${config.gradient}`
              )}
              style={{ boxShadow: `0 10px 40px ${config.shadowColor}` }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Icon size={20} />
              {config.title} {teamSize}
            </motion.div>

            {/* Status Text */}
            <motion.div
              className="text-center min-h-[60px] flex flex-col justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {searchPhase === "searching" && (
                <>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                    Finding Opponents
                  </h2>
                  <p className="text-slate-400 text-sm sm:text-base">
                    {formatTime(searchTime)}
                  </p>
                </>
              )}
              {searchPhase === "found" && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Zap className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400">
                    Match Found!
                  </h2>
                  <Zap className="w-6 h-6 text-emerald-400" />
                </motion.div>
              )}
              {searchPhase === "starting" && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white animate-pulse">
                  Starting Game...
                </h2>
              )}
            </motion.div>

            {/* Animated Radar Effect - Only during search */}
            {searchPhase === "searching" && (
              <div className="relative w-32 h-8 sm:w-40 sm:h-10 flex items-center justify-center">
                {/* Scanning line animation */}
                <div className="absolute inset-0 flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-1 rounded-full bg-gradient-to-t ${config.gradient}`}
                      animate={{
                        height: ["8px", "24px", "8px"],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cards Container */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              {/* Your Team Cards */}
              <div className="flex gap-2 sm:gap-3 justify-center order-1">
                {teamPlayers.map((player, index) => (
                  <PlayerCard
                    key={`team-${index}`}
                    player={player}
                    isOpponent={false}
                  />
                ))}
              </div>

              {/* VS Divider with pulse effect */}
              <motion.div
                className={clsx(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-sm sm:text-lg font-black text-white relative flex-shrink-0 order-2",
                  `bg-gradient-to-br ${config.gradient}`
                )}
                style={{ boxShadow: `0 0 30px ${config.shadowColor}` }}
                animate={
                  searchPhase === "searching" ? { scale: [1, 1.1, 1] } : {}
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* Pulse ring effect */}
                {searchPhase === "searching" && (
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient}`}
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <span className="relative z-10">VS</span>
              </motion.div>

              {/* Opponent Cards */}
              <div className="flex gap-2 sm:gap-3 justify-center order-3">
                {searchPhase === "searching"
                  ? [...Array(opponentCount)].map((_, index) => (
                      <PlayerCard key={`search-${index}`} isSearching={true} />
                    ))
                  : foundOpponents.map((opponent, index) => (
                      <PlayerCard
                        key={`opponent-${index}`}
                        player={opponent}
                        isOpponent={true}
                      />
                    ))}
              </div>
            </motion.div>

            {/* Animated dots indicator - Bottom */}
            {searchPhase === "searching" && (
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient}`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
