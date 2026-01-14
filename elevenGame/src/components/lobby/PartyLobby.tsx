import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Settings,
  Play,
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
  onStartGame: (mode: string, teamSize: string, category: string) => void;
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
  const [invitedPlayers, setInvitedPlayers] = useState<PartyPlayer[]>([]);

  // Calculate total slots based on game mode
  const totalSlots = useMemo(() => {
    return gameConfig.teamSize === "1v1" ? 2 : 4;
  }, [gameConfig]);

  // Build party based on mode
  const buildParty = (): (PartyPlayer | null)[] => {
    const party: (PartyPlayer | null)[] = [];

    // Always add the local player first
    party.push({
      id: "local",
      name: "You",
      isReady: gameConfig.category === "computer" ? true : isReady,
      isHost: true,
    });

    if (gameConfig.category === "computer") {
      const botsNeeded = totalSlots - 1;
      for (let i = 0; i < botsNeeded; i++) {
        party.push({
          id: `bot-${i}`,
          name: `Bot ${i + 1}`,
          isReady: true,
          isHost: false,
          isBot: true,
        });
      }
    } else {
      for (const player of invitedPlayers) {
        if (party.length < totalSlots) {
          party.push(player);
        }
      }
      while (party.length < totalSlots) {
        party.push(null);
      }
    }

    return party;
  };

  const party = buildParty();

  const canStart = useMemo(() => {
    if (gameConfig.category === "computer") {
      return true;
    }
    const allFilled = party.every((p) => p !== null);
    const allReady = party.every((p) => p === null || p.isReady);
    return allFilled && allReady;
  }, [gameConfig, party]);

  const handleStartGame = () => {
    if (canStart) {
      onStartGame(
        gameConfig.category,
        gameConfig.teamSize,
        gameConfig.category
      );
    }
  };

  const handleInvite = (username: string) => {
    const newBot: PartyPlayer = {
      id: `invited-${Date.now()}`,
      name: username || `Player ${invitedPlayers.length + 2}`,
      isReady: true,
      isHost: false,
      isBot: true,
    };
    setInvitedPlayers((prev) => [...prev, newBot]);
    setShowInviteModal(false);
  };

  const handleModeChange = (config: GameModeConfig) => {
    setGameConfig(config);
    setIsReady(false);
    setInvitedPlayers([]);
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

  const team1 = party.slice(0, totalSlots / 2);
  const team2 = party.slice(totalSlots / 2);

  return (
    <div className="lobby-container">
      {/* Animated Background */}
      <div className="lobby-background">
        <div className="lobby-background-image" />
        <div className="lobby-background-overlay" />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="lobby-particle"
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

      {/* Scalable Content Wrapper */}
      <div className="lobby-scale-wrapper">
        <div className="lobby-content">
          {/* Header */}
          <motion.div
            className="lobby-header"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="lobby-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={14} className="text-yellow-400" />
              Party Lobby
            </motion.div>
            <h1 className="lobby-title">Eleven</h1>
            <p className="lobby-subtitle">
              The classic card game of strategy and luck
            </p>
          </motion.div>

          {/* Game Mode Badge */}
          <motion.button
            onClick={() => setShowModeSelect(true)}
            className={clsx(
              "lobby-mode-badge",
              "bg-gradient-to-r",
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
            <span className="lobby-mode-size">{gameConfig.teamSize}</span>
            <span className="lobby-mode-hint">• Tap to change</span>
          </motion.button>

          {/* Party Slots Container */}
          <motion.div
            className="lobby-slots-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Team 1 */}
            <div
              className={clsx(
                "lobby-team",
                gameConfig.teamSize === "2v2" && "lobby-team-2v2"
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
              className="lobby-vs-container"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <div
                className={clsx(
                  "lobby-vs-circle",
                  "bg-gradient-to-br",
                  modeColors[gameConfig.category]
                )}
              >
                <span className="lobby-vs-text">VS</span>
              </div>
            </motion.div>

            {/* Team 2 */}
            <div
              className={clsx(
                "lobby-team",
                gameConfig.teamSize === "2v2" && "lobby-team-2v2"
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
            className="lobby-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="lobby-settings-btn"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings size={24} />
            </motion.button>

            <motion.button
              onClick={handleStartGame}
              disabled={!canStart}
              className={clsx(
                "lobby-start-btn",
                canStart ? "lobby-start-btn-active" : "lobby-start-btn-disabled"
              )}
              whileHover={canStart ? { scale: 1.05 } : {}}
              whileTap={canStart ? { scale: 0.95 } : {}}
            >
              <Play size={24} fill={canStart ? "white" : "currentColor"} />
              {canStart ? "Start Game!" : "Waiting for Players..."}
            </motion.button>
          </motion.div>

          {/* Tip */}
          <motion.p
            className="lobby-tip"
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
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />

      <GameModeSelect
        isOpen={showModeSelect}
        onClose={() => setShowModeSelect(false)}
        onSelectMode={handleModeChange}
        currentConfig={gameConfig}
      />
    </div>
  );
};
