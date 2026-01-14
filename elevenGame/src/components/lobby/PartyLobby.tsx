import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Settings,
  Play,
  Gamepad2,
  Sparkles,
  Users,
  Bot,
  Globe,
  Trophy,
} from "lucide-react";
import { PartySlot } from "./PartySlot";
import { InviteModal } from "./InviteModal";
import {
  GameModeSelect,
  type GameModeConfig,
  type GameModeCategory,
} from "./GameModeSelect";
import clsx from "clsx";

interface PartyLobbyProps {
  onStartGame: (mode: string) => void;
}

interface PartyPlayer {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  isBot?: boolean;
  avatarUrl?: string;
}

export const PartyLobby = ({ onStartGame }: PartyLobbyProps) => {
  const [gameConfig, setGameConfig] = useState<GameModeConfig>({
    category: "computer",
    teamSize: "1v1",
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Calculate total slots based on game mode
  const totalSlots = useMemo(() => {
    if (gameConfig.category === "computer") return 2; // 1 player + 1 bot
    return gameConfig.teamSize === "1v1" ? 2 : 4; // 2 or 4 players
  }, [gameConfig]);

  // Build party based on mode
  const buildParty = (): (PartyPlayer | null)[] => {
    const party: (PartyPlayer | null)[] = [];

    // Always add the local player first
    party.push({
      id: "local",
      name: "You",
      isReady: isReady,
      isHost: true,
    });

    if (gameConfig.category === "computer") {
      // Add bot for computer mode
      party.push({
        id: "bot",
        name: "Bot",
        isReady: true,
        isHost: false,
        isBot: true,
      });
    } else {
      // Add empty slots for other modes
      for (let i = 1; i < totalSlots; i++) {
        party.push(null); // Empty slot
      }
    }

    return party;
  };

  const party = buildParty();

  // Check if can start
  const canStart = useMemo(() => {
    if (gameConfig.category === "computer") {
      // VS Computer doesn't require ready
      return true;
    }
    // All other modes require all players to be ready
    return party.every((p) => p === null || p.isReady);
  }, [gameConfig, party]);

  const handleStartGame = () => {
    if (canStart) {
      // Convert to legacy mode string for compatibility
      const modeString =
        gameConfig.category === "computer"
          ? "bot"
          : gameConfig.category === "friends"
          ? "local"
          : "online";
      onStartGame(modeString);
    }
  };

  const modeLabels: Record<GameModeCategory, string> = {
    computer: "VS Computer",
    friends: "VS Friends",
    battleRoyale: "Battle Royale",
    arena: "Arena",
  };

  const modeIcons: Record<GameModeCategory, typeof Bot> = {
    computer: Bot,
    friends: Users,
    battleRoyale: Globe,
    arena: Trophy,
  };

  const modeColors: Record<GameModeCategory, string> = {
    computer: "from-blue-500 to-indigo-600",
    friends: "from-emerald-500 to-teal-600",
    battleRoyale: "from-orange-500 to-red-600",
    arena: "from-purple-500 to-pink-600",
  };

  const ModeIcon = modeIcons[gameConfig.category];

  // Separate teams for 2v2
  const team1 = party.slice(0, totalSlots / 2);
  const team2 = party.slice(totalSlots / 2);

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605218427335-3a4dd384143e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900" />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={14} className="text-yellow-400" />
            Party Lobby
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Eleven
          </h1>
          <p className="text-slate-400 text-lg">
            The classic card game of strategy and luck
          </p>
        </motion.div>

        {/* Game Mode Badge */}
        <motion.button
          onClick={() => setShowModeSelect(true)}
          className={clsx(
            "mb-8 px-6 py-3 rounded-2xl font-bold text-white flex items-center gap-3",
            "bg-gradient-to-r shadow-lg hover:shadow-xl transition-all",
            modeColors[gameConfig.category]
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ModeIcon size={20} />
          {modeLabels[gameConfig.category]}
          {gameConfig.category !== "computer" && (
            <span className="px-2 py-0.5 bg-white/20 rounded-lg text-sm">
              {gameConfig.teamSize}
            </span>
          )}
          <span className="text-white/60 text-sm">• Tap to change</span>
        </motion.button>

        {/* Party Slots Container */}
        <motion.div
          className={clsx(
            "flex items-center justify-center gap-6 mb-8",
            gameConfig.teamSize === "2v2" ? "flex-wrap" : ""
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Team 1 */}
          <div
            className={clsx(
              "flex items-center gap-4",
              gameConfig.teamSize === "2v2" ? "flex-col sm:flex-row" : ""
            )}
          >
            {team1.map((player, index) => (
              <PartySlot
                key={player?.id || `empty-1-${index}`}
                player={player || undefined}
                isLocalPlayer={player?.id === "local"}
                slotIndex={index}
                onToggleReady={() => setIsReady(!isReady)}
                onInvite={() => setShowInviteModal(true)}
                showReadyButton={gameConfig.category !== "computer"}
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
                "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
                "bg-gradient-to-br",
                modeColors[gameConfig.category]
              )}
            >
              <span className="text-2xl font-black text-white">VS</span>
            </div>
          </motion.div>

          {/* Team 2 */}
          <div
            className={clsx(
              "flex items-center gap-4",
              gameConfig.teamSize === "2v2" ? "flex-col sm:flex-row" : ""
            )}
          >
            {team2.map((player, index) => (
              <PartySlot
                key={player?.id || `empty-2-${index}`}
                player={player || undefined}
                isLocalPlayer={player?.id === "local"}
                slotIndex={team1.length + index}
                onToggleReady={() => {}}
                onInvite={() => setShowInviteModal(true)}
                showReadyButton={gameConfig.category !== "computer"}
              />
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={24} />
          </motion.button>

          <motion.button
            onClick={handleStartGame}
            disabled={!canStart}
            className={clsx(
              "px-12 py-4 rounded-2xl font-bold text-xl flex items-center gap-3 transition-all",
              canStart
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            )}
            whileHover={canStart ? { scale: 1.05 } : {}}
            whileTap={canStart ? { scale: 0.95 } : {}}
          >
            <Play size={24} fill={canStart ? "white" : "currentColor"} />
            {gameConfig.category === "computer"
              ? "Start Game!"
              : canStart
              ? "Start Game!"
              : "Waiting for Players..."}
          </motion.button>
        </motion.div>

        {/* Tip */}
        <motion.p
          className="mt-8 text-slate-500 text-sm text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {gameConfig.category === "computer" &&
            "🤖 Ready to play against the AI? Press Start Game!"}
          {gameConfig.category === "friends" &&
            "👥 Invite friends and wait for everyone to be ready"}
          {gameConfig.category === "battleRoyale" &&
            "🌍 Find random opponents for casual matches"}
          {gameConfig.category === "arena" &&
            "🏆 Compete in ranked matches to climb the leaderboard"}
        </motion.p>
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={(username) => {
          console.log("Invited:", username);
          setShowInviteModal(false);
        }}
      />

      <GameModeSelect
        isOpen={showModeSelect}
        onClose={() => setShowModeSelect(false)}
        onSelectMode={(config) => {
          setGameConfig(config);
          setIsReady(false); // Reset ready when mode changes
        }}
        currentConfig={gameConfig}
      />
    </div>
  );
};
