import { motion } from "framer-motion";
import { useState, useMemo, useCallback, useEffect } from "react";
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
import { MatchmakingScreen } from "./MatchmakingScreen";
import { TooManyPlayersModal } from "./TooManyPlayersModal";
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
  team?: number; // 1 or 2
  position?: number; // position within team
}

export const PartyLobby = ({ onStartGame }: PartyLobbyProps) => {
  const [gameConfig, setGameConfig] = useState<GameModeConfig>({
    category: "computer",
    teamSize: "1v1",
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForSlotIndex, setInviteForSlotIndex] = useState<number | null>(
    null
  );
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [invitedPlayers, setInvitedPlayers] = useState<(PartyPlayer | null)[]>(
    []
  );
  const [leaderId, setLeaderId] = useState<string>("local"); // Track who is the leader
  const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<number | null>(
    null
  );
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showTooManyPlayersModal, setShowTooManyPlayersModal] = useState(false);
  const [pendingModeConfig, setPendingModeConfig] =
    useState<GameModeConfig | null>(null);

  // Current user is the leader
  const isCurrentUserLeader = leaderId === "local";

  // Calculate max players based on game mode
  const getMaxPlayersForMode = (
    category: GameModeCategory,
    teamSize: string
  ): number => {
    if (category === "battleRoyale" || category === "arena") {
      // World modes only allow team 1 players (1 or 2)
      return teamSize === "2v2" ? 2 : 1;
    }
    return teamSize === "1v1" ? 2 : 4;
  };

  // Calculate current human players in party (excluding bots)
  const currentHumanPlayerCount = useMemo(() => {
    const invitedHumans = invitedPlayers.filter((p) => p !== null).length;
    return 1 + invitedHumans; // +1 for local player
  }, [invitedPlayers]);

  // Calculate total slots based on game mode
  // For world modes, we show only team 1 slots (opponents are not shown)
  const totalSlots = useMemo(() => {
    if (
      gameConfig.category === "battleRoyale" ||
      gameConfig.category === "arena"
    ) {
      return gameConfig.teamSize === "2v2" ? 2 : 1;
    }
    return gameConfig.teamSize === "1v1" ? 2 : 4;
  }, [gameConfig]);

  // Build party based on mode
  const buildParty = useCallback((): (PartyPlayer | null)[] => {
    const party: (PartyPlayer | null)[] = [];

    // Always add the local player first
    party.push({
      id: "local",
      name: "You",
      isReady: gameConfig.category === "computer" ? true : isReady,
      isHost: leaderId === "local",
      team: 1,
      position: 0,
    });

    if (gameConfig.category === "computer") {
      // VS Computer - all opponents are bots
      const botsNeeded = totalSlots - 1;
      for (let i = 0; i < botsNeeded; i++) {
        party.push({
          id: `bot-${i}`,
          name: `Bot ${i + 1}`,
          isReady: true,
          isHost: false,
          isBot: true,
          team: i < Math.floor(botsNeeded / 2) ? 1 : 2,
          position: i,
        });
      }
    } else if (
      gameConfig.category === "battleRoyale" ||
      gameConfig.category === "arena"
    ) {
      // Battle Royale / Arena - Only show team 1 (ourselves)
      // Opponents will be found via matchmaking
      if (gameConfig.teamSize === "2v2") {
        // Team 1: local player + 1 more slot (can invite teammate)
        const firstInvited = invitedPlayers[0];
        if (firstInvited) {
          party.push({
            ...firstInvited,
            isHost: leaderId === firstInvited.id,
            team: 1,
            position: 1,
          });
        } else {
          party.push(null);
        }
      }
      // Don't add team 2 - opponents will be matched
    } else if (gameConfig.category === "friends") {
      // VS Friends - all slots can be invited/swapped
      for (let i = 0; i < totalSlots - 1; i++) {
        const player = invitedPlayers[i];
        if (player && player.id) {
          party.push({
            ...player,
            isHost: leaderId === player.id,
            team: i < Math.floor((totalSlots - 1) / 2) ? 1 : 2,
            position: i % Math.ceil((totalSlots - 1) / 2),
          });
        } else {
          party.push(null);
        }
      }
    }

    return party;
  }, [gameConfig, totalSlots, invitedPlayers, isReady, leaderId]);

  const party = buildParty();

  const canStart = useMemo(() => {
    if (gameConfig.category === "computer") {
      return true;
    }
    if (
      gameConfig.category === "battleRoyale" ||
      gameConfig.category === "arena"
    ) {
      // For battle royale / arena, all team 1 players need to be ready
      const team1Players = party.filter((p) => p !== null && !p.isBot);
      if (gameConfig.teamSize === "2v2") {
        // In 2v2, both slots must be filled and ready
        return (
          team1Players.length === 2 && team1Players.every((p) => p?.isReady)
        );
      }
      // In 1v1, just the local player needs to be ready
      return party[0]?.isReady || false;
    }
    // For friends mode, all must be filled and ready
    const allFilled = party.every((p) => p !== null);
    const allReady = party.every((p) => p === null || p.isReady);
    return allFilled && allReady;
  }, [gameConfig, party]);

  // Auto-start when everyone is ready (except for computer mode which starts immediately)
  useEffect(() => {
    if (gameConfig.category === "computer") return;

    if (canStart) {
      if (
        gameConfig.category === "battleRoyale" ||
        gameConfig.category === "arena"
      ) {
        // For world modes, show matchmaking screen
        setShowMatchmaking(true);
      } else if (gameConfig.category === "friends") {
        // For friends mode, auto-start after a brief delay
        const timer = setTimeout(() => {
          onStartGame(
            gameConfig.category,
            gameConfig.teamSize,
            gameConfig.category
          );
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [canStart, gameConfig, onStartGame]);

  const handleStartGame = () => {
    if (gameConfig.category === "computer") {
      onStartGame(
        gameConfig.category,
        gameConfig.teamSize,
        gameConfig.category
      );
    }
    // Other modes auto-start when everyone is ready
  };

  const handleMatchFound = (
    _opponents: { name: string; avatarUrl?: string }[]
  ) => {
    setShowMatchmaking(false);
    onStartGame(gameConfig.category, gameConfig.teamSize, gameConfig.category);
  };

  const handleInvite = (username: string) => {
    const newPlayer: PartyPlayer = {
      id: `invited-${Date.now()}`,
      name:
        username ||
        `Player ${invitedPlayers.filter((p) => p !== null).length + 2}`,
      isReady: false,
      isHost: false,
      isBot: false,
    };

    // Insert at specific slot position
    if (inviteForSlotIndex !== null) {
      const insertIndex = inviteForSlotIndex > 0 ? inviteForSlotIndex - 1 : 0;
      setInvitedPlayers((prev) => {
        const newPlayers = [...prev];
        // Extend array if needed
        while (newPlayers.length <= insertIndex) {
          newPlayers.push(null);
        }
        newPlayers[insertIndex] = newPlayer;
        return newPlayers;
      });
    } else {
      // Find first empty slot or append
      setInvitedPlayers((prev) => {
        const emptyIndex = prev.findIndex((p) => p === null);
        if (emptyIndex >= 0) {
          const newPlayers = [...prev];
          newPlayers[emptyIndex] = newPlayer;
          return newPlayers;
        }
        return [...prev, newPlayer];
      });
    }
    setShowInviteModal(false);
    setInviteForSlotIndex(null);
  };

  const handleKickPlayer = (playerId: string) => {
    if (!isCurrentUserLeader) return;
    // Replace with null instead of removing - keeps positions intact
    setInvitedPlayers((prev) =>
      prev.map((p) => (p && p.id === playerId ? null : p))
    );
  };

  const handleTransferLeadership = (playerId: string) => {
    if (!isCurrentUserLeader) return;
    setLeaderId(playerId);
  };

  const handleSwapPlayers = (slotIndex1: number, slotIndex2: number) => {
    if (!isCurrentUserLeader || gameConfig.category !== "friends") return;
    if (slotIndex1 === slotIndex2) return;
    if (slotIndex1 === 0 || slotIndex2 === 0) {
      // Cannot swap with local player (slot 0)
      setSelectedSlotForSwap(null);
      return;
    }

    // Convert slot indices to invitedPlayers indices (slot 0 is local player)
    const idx1 = slotIndex1 - 1;
    const idx2 = slotIndex2 - 1;

    setInvitedPlayers((prev) => {
      // Ensure array is long enough
      const maxIdx = Math.max(idx1, idx2);
      const newPlayers: (PartyPlayer | null)[] = [...prev];
      while (newPlayers.length <= maxIdx) {
        newPlayers.push(null);
      }

      // Swap the players (even if one or both are null)
      const temp = newPlayers[idx1];
      newPlayers[idx1] = newPlayers[idx2];
      newPlayers[idx2] = temp;

      return newPlayers;
    });
    setSelectedSlotForSwap(null);
  };

  const handleSlotClick = (slotIndex: number) => {
    if (gameConfig.category !== "friends" || !isCurrentUserLeader) return;

    if (selectedSlotForSwap === null) {
      // First click - select this slot
      setSelectedSlotForSwap(slotIndex);
    } else {
      // Second click - swap with selected slot
      if (selectedSlotForSwap !== slotIndex) {
        handleSwapPlayers(selectedSlotForSwap, slotIndex);
      }
      setSelectedSlotForSwap(null);
    }
  };

  const handleModeChange = (config: GameModeConfig) => {
    if (!isCurrentUserLeader) return; // Only leader can change mode

    // Check if there are too many players for the new mode
    const maxPlayers = getMaxPlayersForMode(config.category, config.teamSize);
    if (currentHumanPlayerCount > maxPlayers) {
      setPendingModeConfig(config);
      setShowTooManyPlayersModal(true);
      return;
    }

    setGameConfig(config);
    setIsReady(false);
    // Don't reset invited players - they stay in party!
    setSelectedSlotForSwap(null);
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

  // For world modes, we don't split into team1/team2 - just show all team 1 players
  const isWorldMode =
    gameConfig.category === "battleRoyale" || gameConfig.category === "arena";

  // Check if we should show invite button on a slot
  const canInviteAtSlot = (slotIndex: number): boolean => {
    if (gameConfig.category === "computer") return false;
    if (isWorldMode) {
      // Can only invite teammate (slot 1) in 2v2
      return gameConfig.teamSize === "2v2" && slotIndex === 1;
    }
    // Friends mode - can invite any empty slot
    return true;
  };

  // Get team players for matchmaking display
  const teamPlayersForMatchmaking = useMemo(() => {
    return party
      .filter((p) => p !== null && !p.isBot)
      .map((p) => ({ name: p!.name, avatarUrl: p!.avatarUrl }));
  }, [party]);

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
            onClick={() => isCurrentUserLeader && setShowModeSelect(true)}
            className={clsx(
              "lobby-mode-badge",
              "bg-gradient-to-r",
              modeColors[gameConfig.category],
              !isCurrentUserLeader && "opacity-70 cursor-not-allowed"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={isCurrentUserLeader ? { scale: 1.05 } : {}}
            whileTap={isCurrentUserLeader ? { scale: 0.95 } : {}}
          >
            <ModeIcon size={20} />
            {modeLabels[gameConfig.category]}
            <span className="lobby-mode-size">{gameConfig.teamSize}</span>
            {isCurrentUserLeader && (
              <span className="lobby-mode-hint">• Tap to change</span>
            )}
          </motion.button>

          {/* Party Slots Container */}
          <motion.div
            className="lobby-slots-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isWorldMode ? (
              // World mode: Show only team 1 players in a simple layout
              <div
                className={clsx(
                  "lobby-team",
                  gameConfig.teamSize === "2v2" && "lobby-team-2v2"
                )}
              >
                {party.map((player, index) => (
                  <PartySlot
                    key={player?.id || `empty-${index}`}
                    player={player || undefined}
                    isLocalPlayer={player?.id === "local"}
                    slotIndex={index}
                    onToggleReady={() => setIsReady(!isReady)}
                    onInvite={
                      canInviteAtSlot(index)
                        ? () => {
                            setInviteForSlotIndex(index);
                            setShowInviteModal(true);
                          }
                        : undefined
                    }
                    onKick={
                      player &&
                      !player.isBot &&
                      player.id !== "local" &&
                      isCurrentUserLeader
                        ? () => handleKickPlayer(player.id)
                        : undefined
                    }
                    onTransferLeadership={
                      player &&
                      !player.isBot &&
                      player.id !== "local" &&
                      isCurrentUserLeader
                        ? () => handleTransferLeadership(player.id)
                        : undefined
                    }
                    isSelectedForSwap={false}
                    showReadyButton={true}
                    isLeader={player?.isHost}
                  />
                ))}
              </div>
            ) : (
              // Friends/Computer mode: Show both teams with VS divider
              <>
                {/* Team 1 */}
                <div
                  className={clsx(
                    "lobby-team",
                    gameConfig.teamSize === "2v2" && "lobby-team-2v2"
                  )}
                >
                  {party.slice(0, totalSlots / 2).map((player, index) => (
                    <PartySlot
                      key={player?.id || `empty-1-${index}`}
                      player={player || undefined}
                      isLocalPlayer={player?.id === "local"}
                      slotIndex={index}
                      onToggleReady={() => setIsReady(!isReady)}
                      onInvite={
                        canInviteAtSlot(index)
                          ? () => {
                              setInviteForSlotIndex(index);
                              setShowInviteModal(true);
                            }
                          : undefined
                      }
                      onKick={
                        player &&
                        !player.isBot &&
                        player.id !== "local" &&
                        isCurrentUserLeader
                          ? () => handleKickPlayer(player.id)
                          : undefined
                      }
                      onTransferLeadership={
                        player &&
                        !player.isBot &&
                        player.id !== "local" &&
                        isCurrentUserLeader
                          ? () => handleTransferLeadership(player.id)
                          : undefined
                      }
                      onSwapClick={
                        gameConfig.category === "friends" &&
                        isCurrentUserLeader &&
                        player
                          ? () => handleSlotClick(index)
                          : undefined
                      }
                      isSelectedForSwap={selectedSlotForSwap === index}
                      showReadyButton={gameConfig.category !== "computer"}
                      isLeader={player?.isHost}
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
                  {party.slice(totalSlots / 2).map((player, index) => (
                    <PartySlot
                      key={player?.id || `empty-2-${index}`}
                      player={player || undefined}
                      isLocalPlayer={player?.id === "local"}
                      slotIndex={totalSlots / 2 + index}
                      onToggleReady={() => {}}
                      onInvite={
                        canInviteAtSlot(totalSlots / 2 + index)
                          ? () => {
                              setInviteForSlotIndex(totalSlots / 2 + index);
                              setShowInviteModal(true);
                            }
                          : undefined
                      }
                      onKick={
                        player &&
                        !player.isBot &&
                        player.id !== "local" &&
                        isCurrentUserLeader
                          ? () => handleKickPlayer(player.id)
                          : undefined
                      }
                      onTransferLeadership={
                        player &&
                        !player.isBot &&
                        player.id !== "local" &&
                        isCurrentUserLeader
                          ? () => handleTransferLeadership(player.id)
                          : undefined
                      }
                      onSwapClick={
                        gameConfig.category === "friends" &&
                        isCurrentUserLeader &&
                        player
                          ? () => handleSlotClick(totalSlots / 2 + index)
                          : undefined
                      }
                      isSelectedForSwap={
                        selectedSlotForSwap === totalSlots / 2 + index
                      }
                      showReadyButton={gameConfig.category !== "computer"}
                      isLeader={player?.isHost}
                    />
                  ))}
                </div>
              </>
            )}
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

            {gameConfig.category === "computer" ? (
              <motion.button
                onClick={handleStartGame}
                className="lobby-start-btn lobby-start-btn-active"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={24} fill="white" />
                Start Game!
              </motion.button>
            ) : (
              <div
                className={clsx(
                  "lobby-ready-status",
                  canStart ? "text-emerald-400" : "text-slate-400"
                )}
              >
                {canStart ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Starting...
                  </span>
                ) : (
                  "Waiting for all players to be ready..."
                )}
              </div>
            )}
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
              "👥 Invite friends - game starts when everyone is ready"}
            {gameConfig.category === "battleRoyale" &&
              "🌍 Looking for opponents - get ready to start matchmaking!"}
            {gameConfig.category === "arena" &&
              "🏆 Ranked match - get ready to find opponents!"}
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
        currentPlayerCount={currentHumanPlayerCount}
      />

      <MatchmakingScreen
        isOpen={showMatchmaking}
        onClose={() => {
          setShowMatchmaking(false);
          setIsReady(false);
        }}
        onMatchFound={handleMatchFound}
        category={gameConfig.category as "battleRoyale" | "arena"}
        teamSize={gameConfig.teamSize}
        teamPlayers={teamPlayersForMatchmaking}
      />

      <TooManyPlayersModal
        isOpen={showTooManyPlayersModal}
        onClose={() => {
          setShowTooManyPlayersModal(false);
          setPendingModeConfig(null);
        }}
        currentPlayerCount={currentHumanPlayerCount}
        maxPlayers={
          pendingModeConfig
            ? getMaxPlayersForMode(
                pendingModeConfig.category,
                pendingModeConfig.teamSize
              )
            : 2
        }
        targetMode={
          pendingModeConfig
            ? `${modeLabels[pendingModeConfig.category]} ${
                pendingModeConfig.teamSize
              }`
            : ""
        }
      />
    </div>
  );
};
