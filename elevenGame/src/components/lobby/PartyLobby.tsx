import { motion } from "framer-motion";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Settings,
  Sparkles,
  Users,
  Bot,
  Globe,
  Trophy,
  Check,
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

  // Calculate current human players in party (excluding bots)
  const currentHumanPlayerCount = useMemo(() => {
    const invitedHumans = invitedPlayers.filter((p) => p !== null).length;
    return 1 + invitedHumans; // +1 for local player
  }, [invitedPlayers]);

  // Calculate max players based on game mode
  // UPDATED: VS Computer now respects party size
  const getMaxPlayersForMode = (
    category: GameModeCategory,
    teamSize: string
  ): number => {
    if (category === "battleRoyale" || category === "arena") {
      return teamSize === "2v2" ? 2 : 1;
    }
    if (category === "computer") {
      // VS Computer: party players go to team 1, bots fill team 2
      // 1v1 = max 1 party player, 2v2 = max 2 party players
      return teamSize === "2v2" ? 2 : 1;
    }
    // Friends mode
    return teamSize === "1v1" ? 2 : 4;
  };

  // Calculate total DISPLAY slots based on game mode
  const totalSlots = useMemo(() => {
    if (
      gameConfig.category === "battleRoyale" ||
      gameConfig.category === "arena"
    ) {
      return gameConfig.teamSize === "2v2" ? 2 : 1;
    }
    if (gameConfig.category === "computer") {
      // For computer mode: show party players + bots
      const teamSize = gameConfig.teamSize === "2v2" ? 4 : 2;
      return teamSize;
    }
    return gameConfig.teamSize === "1v1" ? 2 : 4;
  }, [gameConfig]);

  // Build party based on mode - UPDATED for VS Computer with party players
  const buildParty = useCallback((): (PartyPlayer | null)[] => {
    const party: (PartyPlayer | null)[] = [];

    // Always add the local player first
    party.push({
      id: "local",
      name: "You",
      isReady: isReady,
      isHost: leaderId === "local",
      team: 1,
      position: 0,
    });

    if (gameConfig.category === "computer") {
      // VS Computer - party players on team 1, bots on team 2
      const playersPerTeam = gameConfig.teamSize === "2v2" ? 2 : 1;

      // Add party players or empty invite slots to team 1 (for 2v2)
      for (let i = 0; i < playersPerTeam - 1; i++) {
        const player = invitedPlayers[i];
        if (player && player.id) {
          party.push({
            ...player,
            isHost: false,
            team: 1,
            position: i + 1,
          });
        } else {
          // Show empty invite slot for 2v2 computer mode
          party.push(null);
        }
      }

      // Add bots to team 2
      for (let i = 0; i < playersPerTeam; i++) {
        party.push({
          id: `bot-${i}`,
          name: `Bot ${i + 1}`,
          isReady: true,
          isHost: false,
          isBot: true,
          team: 2,
          position: i,
        });
      }
    } else if (
      gameConfig.category === "battleRoyale" ||
      gameConfig.category === "arena"
    ) {
      // Battle Royale / Arena - Only show team 1 (ourselves)
      if (gameConfig.teamSize === "2v2") {
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

  // Can start logic - UPDATED
  const canStart = useMemo(() => {
    if (gameConfig.category === "computer") {
      // For computer mode, party players must be ready
      const humanPlayers = party.filter((p) => p !== null && !p.isBot);

      // For 2v2 vs Computer, MUST have 2 human players (you + friend)
      if (gameConfig.teamSize === "2v2" && humanPlayers.length < 2) {
        return false;
      }

      return humanPlayers.every((p) => p?.isReady);
    }
    if (
      gameConfig.category === "battleRoyale" ||
      gameConfig.category === "arena"
    ) {
      const team1Players = party.filter((p) => p !== null && !p.isBot);
      if (gameConfig.teamSize === "2v2") {
        return (
          team1Players.length === 2 && team1Players.every((p) => p?.isReady)
        );
      }
      return party[0]?.isReady || false;
    }
    // For friends mode, all must be filled and ready
    const allFilled = party.every((p) => p !== null);
    const allReady = party.every((p) => p === null || p.isReady);
    return allFilled && allReady;
  }, [gameConfig, party]);

  // Handle ready toggle for bottom button
  const handleReadyToggle = () => {
    if (gameConfig.category === "computer") {
      // Security check: Block Ready in 2v2 if solo
      const humanPlayers = party.filter((p) => p !== null && !p.isBot);
      if (gameConfig.teamSize === "2v2" && humanPlayers.length < 2) {
        // OPTIONAL: You could add a toast/notification here telling the user why
        // For now, simply do nothing or maybe shake the card (handled in UI)
        return;
      }

      // For computer mode, toggle ready and if all ready, start game
      const newReadyState = !isReady;
      setIsReady(newReadyState);

      // Check if we can start after this toggle
      if (newReadyState) {
        const allOthersReady = humanPlayers
          .filter((p) => p?.id !== "local")
          .every((p) => p?.isReady);

        if (allOthersReady || humanPlayers.length === 1) {
          // Start game immediately - NO DELAY
          onStartGame(
            gameConfig.category,
            gameConfig.teamSize,
            gameConfig.category
          );
        }
      }
    } else {
      setIsReady(!isReady);
    }
  };

  // Auto-start when everyone is ready
  useEffect(() => {
    if (!canStart) return;

    if (
      gameConfig.category === "battleRoyale" ||
      gameConfig.category === "arena"
    ) {
      // For world modes, show matchmaking screen
      setShowMatchmaking(true);
    } else if (gameConfig.category === "friends") {
      // For friends mode, auto-start after a brief delay
      // For friends mode, auto-start immediately
      onStartGame(
        gameConfig.category,
        gameConfig.teamSize,
        gameConfig.category
      );
      return;
    }
    // Computer mode is handled in handleReadyToggle
  }, [canStart, gameConfig, onStartGame]);

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

    if (inviteForSlotIndex !== null) {
      const insertIndex = inviteForSlotIndex > 0 ? inviteForSlotIndex - 1 : 0;
      setInvitedPlayers((prev) => {
        const newPlayers = [...prev];
        while (newPlayers.length <= insertIndex) {
          newPlayers.push(null);
        }
        newPlayers[insertIndex] = newPlayer;
        return newPlayers;
      });
    } else {
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
      setSelectedSlotForSwap(null);
      return;
    }

    const idx1 = slotIndex1 - 1;
    const idx2 = slotIndex2 - 1;

    setInvitedPlayers((prev) => {
      const maxIdx = Math.max(idx1, idx2);
      const newPlayers: (PartyPlayer | null)[] = [...prev];
      while (newPlayers.length <= maxIdx) {
        newPlayers.push(null);
      }
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
      setSelectedSlotForSwap(slotIndex);
    } else {
      if (selectedSlotForSwap !== slotIndex) {
        handleSwapPlayers(selectedSlotForSwap, slotIndex);
      }
      setSelectedSlotForSwap(null);
    }
  };

  const handleModeChange = (config: GameModeConfig) => {
    if (!isCurrentUserLeader) return;

    const maxPlayers = getMaxPlayersForMode(config.category, config.teamSize);
    if (currentHumanPlayerCount > maxPlayers) {
      setPendingModeConfig(config);
      setShowTooManyPlayersModal(true);
      return;
    }

    setGameConfig(config);
    setIsReady(false);
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

  const isWorldMode =
    gameConfig.category === "battleRoyale" || gameConfig.category === "arena";

  const canInviteAtSlot = (slotIndex: number): boolean => {
    // In computer mode 2v2, allow invite for the second slot (teammate)
    if (gameConfig.category === "computer") {
      return gameConfig.teamSize === "2v2" && slotIndex === 1;
    }
    if (isWorldMode) {
      return gameConfig.teamSize === "2v2" && slotIndex === 1;
    }
    return true;
  };

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
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="lobby-scale-wrapper">
        <div className="lobby-content">
          {/* TOP SECTION: Header & Mode Selection */}
          <div className="flex flex-col items-center gap-2 sm:gap-4 shrink-0">
            <header className="lobby-header">
              <motion.div
                className="lobby-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0 }}
              >
                <Sparkles size={14} className="text-yellow-400" />
                Party Lobby
              </motion.div>
              <h1 className="lobby-title"> Eleven</h1>
            </header>

            {/* Game Mode Selector Button */}
            <motion.button
              onClick={() => setShowModeSelect(true)}
              className={clsx(
                "lobby-mode-badge bg-gradient-to-br",
                modeColors[gameConfig.category]
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0 }}
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
          </div>

          {/* CENTER SECTION: Player Slots (Sandwiched) */}
          <motion.div
            className="lobby-slots-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {isWorldMode ? (
              // World mode: Show only team 1 players
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
                    showReadyButton={false}
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
                      showReadyButton={false}
                      isLeader={player?.isHost}
                    />
                  ))}
                </div>

                {/* VS Divider */}
                <motion.div
                  className="lobby-vs-container"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0, type: "spring" }}
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
                      showReadyButton={false}
                      isLeader={player?.isHost}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Action Buttons - Now with Ready Button */}
          {/* BOTTOM SECTION: Actions & Tip */}
          <div className="flex flex-col items-center w-full shrink-0">
            <motion.div
              className="lobby-actions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <motion.button
                className="lobby-settings-btn"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Settings size={24} />
              </motion.button>

              {/* Ready Button - replaces Start Game */}
              <motion.button
                onClick={handleReadyToggle}
                className={clsx(
                  "lobby-ready-btn",
                  isReady
                    ? "lobby-ready-btn-active"
                    : "lobby-ready-btn-inactive"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isReady ? (
                  <>
                    <Check size={24} />
                    Ready
                  </>
                ) : (
                  "Not Ready"
                )}
              </motion.button>
            </motion.div>

            {/* Status Message */}
            <motion.p
              className="lobby-tip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {canStart && gameConfig.category !== "computer" ? (
                <span className="text-emerald-400 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isWorldMode ? "Starting matchmaking..." : "Starting game..."}
                </span>
              ) : (
                <>
                  {gameConfig.category === "computer" &&
                    "🤖 Ready to play against the AI? Click Ready!"}
                  {gameConfig.category === "friends" &&
                    "👥 Invite friends - game starts when everyone is ready"}
                  {gameConfig.category === "battleRoyale" &&
                    "🌍 Click Ready to start searching for opponents!"}
                  {gameConfig.category === "arena" &&
                    "🏆 Click Ready to find ranked opponents!"}
                </>
              )}
            </motion.p>
          </div>
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
