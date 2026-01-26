import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScoringModal } from "./ScoringModal";
import { CapturedCardsModal } from "./CapturedCardsModal";
import { useGameStore } from "../store/gameStore";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { Hand } from "./Hand";
import { Board } from "./Board";
import { getValidCaptures } from "../engine/rules";
import { audio } from "../utils/audio";
import {
  Menu as MenuIcon,
  Sparkles,
  Trophy,
  RotateCcw,
  LogOut,
  X,
  Play,
} from "lucide-react";

export const GameScreen = ({ onExit }: { onExit?: () => void }) => {
  const {
    board,
    players,
    activePlayerIndex,
    selectedHandCardId,
    selectedBoardCardIds,
    phase,
    playCard,
    selectHandCard,
    toggleBoardCard,
    resetGame,
    restartMatch,
    nextRound,
    lastBonusEvent,
    round,
    category,
    revealingCardId,
    isAnimating,
    dealId,
  } = useGameStore();

  const { lightning } = useUserStore();
  const { setShouldRestartMatchmaking, openAlertModal } = useUIStore();

  const humanPlayer = players[0];
  const botPlayer = players[1];

  const isMyTurn = activePlayerIndex === 0;
  const isScoringOrGameOver = phase === "scoring" || phase === "game_over";
  const [showCaptured, setShowCaptured] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* Staggered Deal Logic */
  const [dealPhase, setDealPhase] = useState<"init" | "hands" | "board">(
    "init",
  );
  const [isDealing, setIsDealing] = useState(true);
  const [dealOrder, setDealOrder] = useState<number>(0);
  /* Game State & Animations */
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);

  const INTRO_DELAY = 1.5;
  const DEAL_DURATION = 0.8;

  const t_start = INTRO_DELAY;
  const t_p1_abs = t_start + (dealOrder === 0 ? 0 : DEAL_DURATION);
  const t_p2_abs = t_start + (dealOrder === 1 ? 0 : DEAL_DURATION);
  const t_board_abs = t_start + DEAL_DURATION * 2;

  const isFirstDeal = round === 1;

  const delay_p1 = t_p1_abs - t_start;
  const delay_p2 = t_p2_abs - t_start;
  const delay_board = 0;

  useEffect(() => {
    const currentDealOrder = Math.random() > 0.5 ? 0 : 1;
    setDealOrder(currentDealOrder);
    setIsDealing(true);

    if (isFirstDeal) {
      setDealPhase("init");
    } else {
      setDealPhase("hands");
    }

    let t1: any, t2: any, t3: any;
    const audioTimers: any[] = [];

    const scheduleAudio = (startDelay: number) => {
      for (let i = 0; i < 4; i++) {
        audioTimers.push(
          setTimeout(() => audio.playDeal(), startDelay + i * 200),
        );
      }
    };

    if (isFirstDeal) {
      t1 = setTimeout(() => setDealPhase("hands"), t_start * 1000);
      t2 = setTimeout(() => setDealPhase("board"), t_board_abs * 1000);
      t3 = setTimeout(
        () => {
          setIsDealing(false);
        },
        (t_board_abs + 1.5) * 1000,
      );

      const p1Start =
        (t_start + (currentDealOrder === 0 ? 0 : DEAL_DURATION)) * 1000;
      const p2Start =
        (t_start + (currentDealOrder === 1 ? 0 : DEAL_DURATION)) * 1000;
      const boardStart = t_board_abs * 1000;

      scheduleAudio(p1Start);
      scheduleAudio(p2Start);
      scheduleAudio(boardStart);
    } else {
      t3 = setTimeout(() => setIsDealing(false), 2000);

      const p1Start = (currentDealOrder === 0 ? 0 : DEAL_DURATION) * 1000;
      const p2Start = (currentDealOrder === 1 ? 0 : DEAL_DURATION) * 1000;

      scheduleAudio(p1Start);
      scheduleAudio(p2Start);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      audioTimers.forEach(clearTimeout);
    };
  }, [phase, round, dealId]);

  // Consolidated Turn Timer Mechanism
  useEffect(() => {
    // Reset timer to 10s on turn / phase / round change
    setTurnTimeLeft(10);

    // Stop timer if not in playing phase, dealing or scoring
    if (phase !== "playing" || isDealing || isScoringOrGameOver) {
      return;
    }

    const timer = setInterval(() => {
      setTurnTimeLeft((prev) => {
        // Pause countdown if an action animation is happening
        if (isAnimating || revealingCardId) return prev;

        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [
    phase,
    activePlayerIndex,
    isDealing,
    isScoringOrGameOver,
    round,
    isAnimating,
    revealingCardId,
  ]);

  // Handle Turn Expiry Logic
  useEffect(() => {
    if (
      turnTimeLeft <= 0 &&
      phase === "playing" &&
      !isDealing &&
      !isAnimating
    ) {
      const currentPlayer = players[activePlayerIndex];
      // HUMAN AUTO-PLAY on timeout - Now performs a SMART move
      if (activePlayerIndex === 0 && currentPlayer?.hand.length > 0) {
        // Find a card that can capture
        const playableCard =
          currentPlayer.hand[
            Math.floor(Math.random() * currentPlayer.hand.length)
          ];
        handleSmartMove(playableCard.id);
      }
    }
  }, [turnTimeLeft, phase, isDealing, isAnimating, activePlayerIndex]);

  const handleSmartMove = (cardId: string) => {
    if (!isMyTurn || isAnimating || isDealing) return;

    const handCard = humanPlayer.hand.find((c) => c.id === cardId);
    if (!handCard) return;

    const validCaptures = getValidCaptures(handCard, board);

    if (validCaptures.length > 0) {
      const captureOption = validCaptures[0];
      const captureIds = captureOption.map((c) => c.id);
      playCard(cardId, captureIds);
    } else {
      playCard(cardId, []);
    }
  };

  const [bonusNotif, setBonusNotif] = useState<string | null>(null);

  useEffect(() => {
    if (lastBonusEvent) {
      setBonusNotif("BONUS!");
      audio.playCapture();
      const timer = setTimeout(() => setBonusNotif(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastBonusEvent]);

  const handleHandCardClick = (cardId: string) => {
    if (!isMyTurn || isAnimating || isDealing) return;
    selectHandCard(cardId);
  };

  const handleBoardCardClick = (cardId: string) => {
    if (!isMyTurn || !selectedHandCardId || isAnimating || isDealing) return;

    const currentSelection = selectedBoardCardIds;
    const isAlreadySelected = currentSelection.includes(cardId);
    let newSelection = [];

    if (isAlreadySelected) {
      newSelection = currentSelection.filter((id) => id !== cardId);
    } else {
      newSelection = [...currentSelection, cardId];
    }

    toggleBoardCard(cardId);

    const handCard = humanPlayer.hand.find((c) => c.id === selectedHandCardId);
    if (!handCard) return;

    const validOptions = getValidCaptures(handCard, board);

    const isSelectionMatch = validOptions.some((option) => {
      if (option.length !== newSelection.length) return false;
      const optionIds = option.map((c) => c.id).sort();
      const selectionIds = [...newSelection].sort();
      return optionIds.every((val, index) => val === selectionIds[index]);
    });

    if (isSelectionMatch) {
      playCard(selectedHandCardId, newSelection);
    }
  };

  return (
    <div className="game-container">
      {/* Animated Background - Same as Lobby */}
      <div className="game-background">
        <div className="game-background-image" />
        <div className="game-background-overlay" />

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="game-particle"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="game-scale-wrapper">
        {/* Top Bar with Players */}
        <motion.div
          className="game-top-bar"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="game-player-info self-start">
            <div className="flex flex-col items-center gap-1">
              {/* Score badges - stacked above avatar */}
              <div className="flex gap-1 sm:gap-1.5 lg:gap-2">
                <motion.div
                  className="flex items-center gap-0.5 px-2 py-0.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-yellow-400/10 border border-yellow-400/30 rounded sm:rounded-md lg:rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles
                    size={12}
                    className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-400"
                  />
                  <span className="text-[11px] sm:text-sm lg:text-base font-bold text-yellow-400">
                    {botPlayer?.roundScopas || 0}
                  </span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-0.5 px-2 py-0.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-blue-400/10 border border-blue-400/30 rounded sm:rounded-md lg:rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Trophy
                    size={12}
                    className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-400"
                  />
                  <span className="text-[11px] sm:text-sm lg:text-base font-bold text-blue-400">
                    {botPlayer?.score || 0}
                  </span>
                </motion.div>
              </div>

              {/* Avatar */}
              <motion.div
                className="game-player-avatar-wrapper"
                whileHover={{ scale: 1.05 }}
              >
                <div className="game-player-avatar game-player-avatar-opponent !w-11 !h-11 sm:!w-15 sm:!h-15 lg:!w-18 lg:!h-18 text-base sm:text-xl lg:text-2xl">
                  {botPlayer?.name?.charAt(0).toUpperCase() || "🤖"}
                </div>
                {!isMyTurn && phase === "playing" && (
                  <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeDasharray="100"
                      strokeDashoffset={(turnTimeLeft / 10) * 100}
                      pathLength="100"
                      strokeLinecap="round"
                      className="transition-all duration-100 ease-linear"
                    />
                  </svg>
                )}
              </motion.div>

              {/* Name */}
              <h3 className="game-player-name font-bold w-full text-center truncate">
                {botPlayer?.name || "Opponent"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start mt-2">
            {/* Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(true)}
              className="game-menu-btn"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <MenuIcon size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Menu Modal */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="game-menu-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="game-menu-content"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                {/* Close Button */}
                <motion.button
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>

                <h2 className="game-menu-title">
                  <Sparkles className="text-yellow-400" size={24} />
                  Game Menu
                </h2>

                <div className="space-y-3 mt-6">
                  <motion.button
                    onClick={() => {
                      const isOnline =
                        category === "battleRoyale" || category === "arena";
                      if (isOnline) {
                        if (lightning < 1) {
                          openAlertModal(
                            "No Lightning",
                            "You need lightning to start a new game!",
                            "error",
                          );
                          return;
                        }
                        setShouldRestartMatchmaking(true);
                        setIsMenuOpen(false);
                        resetGame();
                        onExit?.();
                      } else {
                        setIsMenuOpen(false);
                        restartMatch();
                      }
                    }}
                    className="game-menu-option game-menu-option-primary"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw size={20} />
                    {category === "battleRoyale" || category === "arena"
                      ? "Start New Game"
                      : "Restart Game"}
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onExit?.();
                    }}
                    className="game-menu-option game-menu-option-danger"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={20} />
                    Quit to Lobby
                  </motion.button>

                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className="game-menu-option game-menu-option-secondary"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play size={20} />
                    Resume Game
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opponent Hand (Top) */}
        <motion.div
          className="game-opponent-hand"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {botPlayer && (
            <Hand
              cards={isFirstDeal && dealPhase === "init" ? [] : botPlayer.hand}
              isBot={true}
              revealingCardId={revealingCardId}
              revealDirection="down"
              baseDelay={isFirstDeal ? delay_p2 : 0}
            />
          )}
        </motion.div>

        {/* Board (Center) */}
        <motion.div
          className="game-board-area"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Board
            cards={
              isFirstDeal && (dealPhase === "init" || dealPhase === "hands")
                ? []
                : board
            }
            selectedCardIds={selectedBoardCardIds}
            onCardClick={handleBoardCardClick}
            baseDelay={delay_board}
            disableAnimation={!isDealing}
          />
        </motion.div>

        {/* Player Hand (Bottom) */}
        <motion.div
          className="game-player-hand"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {humanPlayer && (
            <div className="relative flex flex-col items-center gap-4 w-full px-4">
              {/* Reset Section for Bottom User HUD - Pinned to corner */}
              <div className="fixed right-2 sm:right-6 lg:right-10 bottom-2 sm:bottom-6 lg:bottom-10 flex flex-col items-center gap-1 z-[60] max-w-[80px] sm:max-w-[100px] lg:max-w-[120px]">
                {/* Score badges - stacked above avatar */}
                <div className="flex gap-1 sm:gap-1.5 lg:gap-2">
                  <motion.div
                    className="flex items-center gap-0.5 px-2 py-0.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-yellow-400/10 border border-yellow-400/30 rounded sm:rounded-md lg:rounded-lg shrink-0"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-[11px] sm:text-sm lg:text-base font-bold text-yellow-400">
                      {humanPlayer?.roundScopas || 0}
                    </span>
                    <Sparkles
                      size={12}
                      className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-400"
                    />
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-0.5 px-2 py-0.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-blue-400/10 border border-blue-400/30 rounded sm:rounded-md lg:rounded-lg shrink-0"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-[11px] sm:text-sm lg:text-base font-bold text-blue-400">
                      {humanPlayer?.score || 0}
                    </span>
                    <Trophy
                      size={12}
                      className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-400"
                    />
                  </motion.div>
                </div>

                {/* Avatar */}
                <motion.div className="game-player-avatar-wrapper">
                  <div className="game-player-avatar game-player-avatar-self !w-11 !h-11 sm:!w-15 sm:!h-15 lg:!w-18 lg:!h-18 text-base sm:text-xl lg:text-2xl">
                    {humanPlayer.name.charAt(0).toUpperCase()}
                  </div>
                  {isMyTurn && phase === "playing" && (
                    <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="100"
                        strokeDashoffset={(turnTimeLeft / 10) * 100}
                        pathLength="100"
                        strokeLinecap="round"
                        className="transition-all duration-100 ease-linear"
                      />
                    </svg>
                  )}
                </motion.div>

                {/* Name */}
                <span className="game-player-name font-bold w-full text-center truncate">
                  {humanPlayer.name}
                </span>
              </div>

              {/* Captured Cards - Keep bottom left */}
              <motion.button
                className="fixed left-2 sm:left-6 lg:left-10 bottom-2 sm:bottom-6 lg:bottom-10 flex flex-col items-center px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl z-[60]"
                onClick={() => {
                  if (!isAnimating) setShowCaptured(true);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs sm:text-lg lg:text-2xl font-black text-white">
                  {humanPlayer.capturedCards.length}
                </span>
                <span className="text-[8px] sm:text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Captured
                </span>
              </motion.button>

              <Hand
                cards={
                  isFirstDeal && dealPhase === "init" ? [] : humanPlayer.hand
                }
                selectedCardId={selectedHandCardId}
                revealingCardId={revealingCardId}
                onCardClick={handleHandCardClick}
                onCardDoubleClick={handleSmartMove}
                baseDelay={isFirstDeal ? delay_p1 : 0}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Scoring Modal Overlay */}
      <ScoringModal
        isOpen={isScoringOrGameOver}
        players={players}
        onNextRound={nextRound}
        onRestart={() => {
          const isOnline = category === "battleRoyale" || category === "arena";
          if (isOnline) {
            if (lightning < 1) {
              openAlertModal(
                "No Lightning",
                "You need lightning to start a new game!",
                "error",
              );
              return;
            }
            setShouldRestartMatchmaking(true);
            resetGame();
            onExit?.();
          } else {
            restartMatch();
          }
        }}
        onExit={() => {
          resetGame();
          onExit?.();
        }}
        gameOver={phase === "game_over"}
      />

      <CapturedCardsModal
        isOpen={showCaptured}
        onClose={() => setShowCaptured(false)}
        cards={humanPlayer?.capturedCards || []}
      />

      {/* Bonus Notification Overlay */}
      <AnimatePresence>
        {bonusNotif && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bonus-notification"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="bonus-star"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⭐
              </motion.div>
              <h1 className="bonus-text">{bonusNotif}</h1>
              <motion.div
                className="bonus-star"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⭐
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
