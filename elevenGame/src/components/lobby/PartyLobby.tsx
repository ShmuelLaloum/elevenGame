import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Settings, Users, Bot, Globe, Trophy, Check } from "lucide-react";
import { PartySlot } from "./PartySlot";
import { InviteModal } from "./InviteModal";
import {
  GameModeSelect,
  type GameModeConfig,
  type GameModeCategory,
} from "./GameModeSelect";
import { MatchmakingScreen } from "./MatchmakingScreen";
import { LobbyAlertModal } from "./LobbyAlertModal";
import { useUserStore } from "../../store/userStore";
import { useUIStore } from "../../store/uiStore";
import clsx from "clsx";
import { Zap } from "lucide-react";
import { usePartyStore, type PartyPlayer } from "../../store/usePartyStore";

interface PartyLobbyProps {
  onStartGame: (
    category: string,
    teamSize: string,
    playerNames: string[],
    opponentNames?: string[],
  ) => void;
}

export const PartyLobby = ({ onStartGame }: PartyLobbyProps) => {
  const lightning = useUserStore((s) => s.lightning);
  const spendLightning = useUserStore((s) => s.spendLightning);
  const lastGameConfig = useUserStore((s) => s.lastGameConfig);
  const setLastGameConfig = useUserStore((s) => s.setLastGameConfig);
  const leaderboard = useUserStore((s) => s.leaderboard);
  const userName = useMemo(
    () => leaderboard.find((p) => p.isMe)?.name || "You",
    [leaderboard],
  );

  const [gameConfig, setGameConfig] = useState<GameModeConfig>(
    (lastGameConfig as GameModeConfig) || {
      category: "computer",
      teamSize: "1v1",
    },
  );
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForSlotIndex, setInviteForSlotIndex] = useState<number | null>(
    null,
  );

  const [showModeSelect, setShowModeSelect] = useState(false);
  const {
    invitedPlayers,
    setInvitedPlayers,
    leaderId,
    setLeaderId,
    isReady,
    setIsReady,
    kickPlayer,
    addPlayer,
  } = usePartyStore();

  const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<number | null>(
    null,
  );
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState<{
    isOpen: boolean;
    mode: "tooManyPlayers";
  }>({ isOpen: false, mode: "tooManyPlayers" });
  const [pendingModeConfig, setPendingModeConfig] =
    useState<GameModeConfig | null>(null);
  const [isProcessingStart, setIsProcessingStart] = useState(false);
  const [isSubtractingLightning, setIsSubtractingLightning] = useState(false);

  const setNavbarVisible = useUIStore((s) => s.setNavbarVisible);
  const shouldRestartMatchmaking = useUIStore(
    (s) => s.shouldRestartMatchmaking,
  );
  const setShouldRestartMatchmaking = useUIStore(
    (s) => s.setShouldRestartMatchmaking,
  );
  const openAlertModal = useUIStore((s) => s.openAlertModal);

  // Immediate Matchmaking if requested from in-game menu
  useEffect(() => {
    if (shouldRestartMatchmaking) {
      setShouldRestartMatchmaking(false);

      const runDeductionAndStart = async () => {
        if (lightning >= 1) {
          setIsSubtractingLightning(true);
          await new Promise((resolve) => setTimeout(resolve, 1200));
          spendLightning(1);
          setIsSubtractingLightning(false);
          setShowMatchmaking(true);
        }
      };

      runDeductionAndStart();
    }
  }, [
    shouldRestartMatchmaking,
    setShouldRestartMatchmaking,
    lightning,
    spendLightning,
  ]);

  // Hide Navbar when certain views are active
  useEffect(() => {
    if (showModeSelect || showMatchmaking || isSubtractingLightning) {
      setNavbarVisible(false);
    } else {
      setNavbarVisible(true);
    }
    return () => setNavbarVisible(true);
  }, [
    showModeSelect,
    showMatchmaking,
    isSubtractingLightning,
    setNavbarVisible,
  ]);

  // Reset processing when ready state changes to false
  useEffect(() => {
    if (!isReady) {
      setIsProcessingStart(false);
    }
  }, [isReady]);

  // Current user is the leader
  const isCurrentUserLeader = leaderId === "local";

  // Calculate current human players in party (excluding bots)
  const currentHumanPlayerCount = useMemo(() => {
    const invitedHumans = invitedPlayers.filter((p) => p !== null).length;
    return 1 + invitedHumans; // +1 for local player
  }, [invitedPlayers]);

  // Persist game config changes automatically
  useEffect(() => {
    setLastGameConfig(gameConfig);
  }, [gameConfig, setLastGameConfig]);

  // Calculate max players based on game mode
  // UPDATED: VS Computer now respects party size
  const getMaxPlayersForMode = (
    category: GameModeCategory,
    teamSize: string,
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
      name: userName,
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
    // Check lightning for online modes
    if (
      !isReady &&
      (gameConfig.category === "battleRoyale" ||
        gameConfig.category === "arena")
    ) {
      if (lightning < 1) {
        openAlertModal(
          "No Lightning",
          "You need lightning to start a new game!",
          "error",
        );
        return;
      }
    }

    if (gameConfig.category === "computer") {
      // Security check: Block Ready in 2v2 if solo
      const humanPlayers = party.filter((p) => p !== null && !p.isBot);
      if (gameConfig.teamSize === "2v2" && humanPlayers.length < 2) {
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
          let playerNames = party.map((p, i) => p?.name || `Bot ${i + 1}`);

          // Reorder for 2v2 Engine: [You, Opp1, Teammate, Opp2]
          if (gameConfig.teamSize === "2v2") {
            const reordered = [
              playerNames[0], // You
              playerNames[2], // Bot 1 (Opponent)
              playerNames[1], // Teammate
              playerNames[3], // Bot 2 (Opponent)
            ];
            playerNames = reordered;
          }

          onStartGame(gameConfig.category, gameConfig.teamSize, playerNames);
        }
      }
    } else {
      setIsReady(!isReady);
    }
  };

  // Auto-start when everyone is ready
  useEffect(() => {
    if (!canStart || isSubtractingLightning || isProcessingStart) return;

    const startWithLightningCheck = async () => {
      if (
        gameConfig.category === "battleRoyale" ||
        gameConfig.category === "arena"
      ) {
        // Online modes: Spend 1 lightning
        if (lightning >= 1) {
          setIsProcessingStart(true);
          setIsSubtractingLightning(true);
          // Wait for effect
          await new Promise((resolve) => setTimeout(resolve, 1000));
          spendLightning(1);
          setIsSubtractingLightning(false);
          setShowMatchmaking(true);
        } else {
          setIsReady(false);
          openAlertModal(
            "No Lightning",
            "You need lightning to start a new game!",
            "error",
          );
        }
      } else if (gameConfig.category === "friends") {
        setIsProcessingStart(true);
        let playerNames = party.map((p, i) => p?.name || `Player ${i + 1}`);

        // Reorder for 2v2 Engine: [You, Opp1, Teammate, Opp2]
        // Party Lobby holds: [You, P2, P3, P4] where You+P2 are Team 1, P3+P4 are Team 2
        // Engine wants: [T1, T2, T1, T2]
        if (gameConfig.teamSize === "2v2") {
          const reordered = [
            playerNames[0], // P1 (T1)
            playerNames[2], // P3 (T2)
            playerNames[1], // P2 (T1)
            playerNames[3], // P4 (T2)
          ];
          playerNames = reordered;
        }

        onStartGame(gameConfig.category, gameConfig.teamSize, playerNames);
      }
    };

    startWithLightningCheck();
    // Computer mode is handled in handleReadyToggle
  }, [
    canStart,
    gameConfig,
    onStartGame,
    lightning,
    spendLightning,
    isSubtractingLightning,
    isProcessingStart,
  ]);

  const handleMatchFound = (
    opponents: { name: string; avatarUrl?: string }[],
  ) => {
    setShowMatchmaking(false);
    const playerNames = party
      .filter((p) => p !== null && !p.isBot)
      .map((p) => p!.name);

    // Fill remaining slots based on mode
    if (gameConfig.teamSize === "2v2") {
      // For 2v2 online, playerNames will be [You, Teammate]
      // We need to reorder to match the engine's [You, Opp1, Teammate, Opp2]
      const finalNames = [
        playerNames[0], // You
        opponents[0].name, // Opponent 1
        playerNames[1] || "Teammate", // Teammate
        opponents[1]?.name || "Opponent 2", // Opponent 2
      ];
      onStartGame(gameConfig.category, gameConfig.teamSize, finalNames);
    } else {
      // 1v1
      const finalNames = [playerNames[0], opponents[0].name];
      onStartGame(gameConfig.category, gameConfig.teamSize, finalNames);
    }
  };

  const handleInvite = (username: string) => {
    const newPlayer: PartyPlayer = {
      id: `invited-${Date.now()}`,
      name:
        username ||
        `Player ${invitedPlayers.filter((p) => p !== null).length + 2}`,
      isReady: true,
      isHost: false,
      isBot: false,
    };

    addPlayer(newPlayer, inviteForSlotIndex);
    setShowInviteModal(false);
    setInviteForSlotIndex(null);
  };

  const handleKickPlayer = (playerId: string) => {
    if (!isCurrentUserLeader) return;
    kickPlayer(playerId);
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

    const maxIdx = Math.max(idx1, idx2);
    const newPlayers: (PartyPlayer | null)[] = [...invitedPlayers];
    while (newPlayers.length <= maxIdx) {
      newPlayers.push(null);
    }
    const temp = newPlayers[idx1];
    newPlayers[idx1] = newPlayers[idx2];
    newPlayers[idx2] = temp;
    setInvitedPlayers(newPlayers);
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
      setShowAlertModal({ isOpen: true, mode: "tooManyPlayers" });
      return;
    }

    setGameConfig(config);
    setLastGameConfig(config);
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
          <div className="flex flex-col items-center gap-2 sm:gap-4 shrink-0 pt-10 sm:pt-14">
            <header className="lobby-header">
              <h1 className="lobby-title"> Eleven</h1>
            </header>

            {/* Game Mode Selector Button */}
            <motion.button
              onClick={() => setShowModeSelect(true)}
              className={clsx(
                "lobby-mode-badge bg-gradient-to-br",
                modeColors[gameConfig.category],
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
            transition={{ delay: 0 }}
          >
            {isWorldMode ? (
              // World mode: Show only team 1 players
              <div
                className={clsx(
                  "lobby-team",
                  gameConfig.teamSize === "2v2" && "lobby-team-2v2",
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
                    gameConfig.teamSize === "2v2" && "lobby-team-2v2",
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
                      modeColors[gameConfig.category],
                    )}
                  >
                    <span className="lobby-vs-text">VS</span>
                  </div>
                </motion.div>

                {/* Team 2 */}
                <div
                  className={clsx(
                    "lobby-team",
                    gameConfig.teamSize === "2v2" && "lobby-team-2v2",
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
              initial={{ opacity: 0, y: 20 }}
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
                    : "lobby-ready-btn-inactive",
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

      <LobbyAlertModal
        isOpen={showAlertModal.isOpen}
        onClose={() => {
          setShowAlertModal({ ...showAlertModal, isOpen: false });
          setPendingModeConfig(null);
        }}
        currentPlayerCount={currentHumanPlayerCount}
        maxPlayers={
          pendingModeConfig
            ? getMaxPlayersForMode(
                pendingModeConfig.category,
                pendingModeConfig.teamSize,
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

      {/* Lightning Subtraction Effect Overlay */}
      <AnimatePresence mode="wait">
        {isSubtractingLightning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: [0.5, 1.2, 1], y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -40 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <Zap
                  size={140}
                  className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.8)]"
                />
                <motion.span
                  initial={{ opacity: 0, x: 20, y: 20 }}
                  animate={{ opacity: 1, x: 50, y: 0 }}
                  className="absolute top-0 right-0 text-6xl font-black text-red-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                >
                  -1
                </motion.span>
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-2">
                  Preparing Arena
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
