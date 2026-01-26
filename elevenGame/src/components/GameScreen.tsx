import { useEffect, useState, useMemo, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScoringModal } from "./ScoringModal";
import { CapturedCardsModal } from "./CapturedCardsModal";
import { useGameStore } from "../store/gameStore";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { Hand } from "./Hand";
import { Board } from "./Board";
import { getValidCaptures } from "../engine/rules";
import { getBestMove } from "../engine/bot";
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

// Optimized sub-component to isolate timer updates from the main game loop
const TurnTimerCircle = memo(
  ({
    isActive,
    color,
    onExpire,
  }: {
    isActive: boolean;
    color: string;
    onExpire: () => void;
  }) => {
    const [timeLeft, setTimeLeft] = useState(10);
    const frameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
      if (!isActive) {
        setTimeLeft(10);
        return;
      }

      startTimeRef.current = performance.now();

      const tick = (now: number) => {
        const elapsed = (now - startTimeRef.current) / 1000;
        const remaining = Math.max(0, 10 - elapsed);

        setTimeLeft(remaining);

        if (remaining <= 0) {
          onExpire();
        } else {
          frameRef.current = requestAnimationFrame(tick);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameRef.current);
    }, [isActive, onExpire]);

    if (!isActive) return null;

    return (
      <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray="100"
          strokeDashoffset={(timeLeft / 10) * 100}
          pathLength="100"
          strokeLinecap="round"
          style={{ transition: "none" }} // Animation handled by RAF
        />
      </svg>
    );
  },
);

export const GameScreen = ({ onExit }: { onExit?: () => void }) => {
  // Selectors to minimize re-renders
  const board = useGameStore((s) => s.board);
  const players = useGameStore((s) => s.players);
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex);
  const selectedHandCardId = useGameStore((s) => s.selectedHandCardId);
  const selectedBoardCardIds = useGameStore((s) => s.selectedBoardCardIds);
  const phase = useGameStore((s) => s.phase);
  const playCard = useGameStore((s) => s.playCard);
  const selectHandCard = useGameStore((s) => s.selectHandCard);
  const toggleBoardCard = useGameStore((s) => s.toggleBoardCard);
  const resetGame = useGameStore((s) => s.resetGame);
  const restartMatch = useGameStore((s) => s.restartMatch);
  const nextRound = useGameStore((s) => s.nextRound);
  const lastBonusEvent = useGameStore((s) => s.lastBonusEvent);
  const round = useGameStore((s) => s.round);
  const category = useGameStore((s) => s.category);
  const revealingCardId = useGameStore((s) => s.revealingCardId);
  const isAnimating = useGameStore((s) => s.isAnimating);
  const dealId = useGameStore((s) => s.dealId);
  const storeDealOrder = useGameStore((s) => s.dealOrder);

  const lightning = useUserStore((s) => s.lightning);
  const setShouldRestartMatchmaking = useUIStore(
    (s) => s.setShouldRestartMatchmaking,
  );
  const openAlertModal = useUIStore((s) => s.openAlertModal);

  const humanPlayer = players[0];
  const botPlayer = players[1];

  const isMyTurn = activePlayerIndex === 0;

  const [showCaptured, setShowCaptured] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);

  // Sync ScoringModal state in an effect to avoid "update during render" warnings
  useEffect(() => {
    const shouldBeOpen = phase === "scoring" || phase === "game_over";
    if (shouldBeOpen !== isScoringModalOpen) {
      setIsScoringModalOpen(shouldBeOpen);
    }
  }, [phase, isScoringModalOpen]);

  /* Staggered Deal Logic */
  const [dealPhase, setDealPhase] = useState<"init" | "hands" | "board">(
    "init",
  );
  const [isDealing, setIsDealing] = useState(true);
  const dealOrder = storeDealOrder ?? 0;

  const INTRO_DELAY = 1.5;
  const DEAL_DURATION = 0.8;

  const t_start = INTRO_DELAY;
  const t_board_abs = t_start + DEAL_DURATION * 2;
  const isFirstDeal = round === 1;

  const delay_p1 = dealOrder === 0 ? 0 : DEAL_DURATION;
  const delay_p2 = dealOrder === 1 ? 0 : DEAL_DURATION;

  useEffect(() => {
    setIsDealing(true);
    if (isFirstDeal) {
      setDealPhase("init");
    } else {
      setDealPhase("hands");
    }

    const t_timeouts: ReturnType<typeof setTimeout>[] = [];

    const scheduleAudio = (startDelay: number) => {
      for (let i = 0; i < 4; i++) {
        const timeoutId = setTimeout(
          () => {
            const currentPhase = useGameStore.getState().phase;
            if (currentPhase === "playing") audio.playDeal();
          },
          startDelay + i * 200,
        );
        t_timeouts.push(timeoutId);
      }
    };

    if (isFirstDeal) {
      t_timeouts.push(setTimeout(() => setDealPhase("hands"), t_start * 1000));
      t_timeouts.push(
        setTimeout(() => setDealPhase("board"), t_board_abs * 1000),
      );
      t_timeouts.push(
        setTimeout(
          () => {
            setIsDealing(false);
          },
          (t_board_abs + 1.5) * 1000,
        ),
      );

      const p1Start = (t_start + (dealOrder === 0 ? 0 : DEAL_DURATION)) * 1000;
      const p2Start = (t_start + (dealOrder === 1 ? 0 : DEAL_DURATION)) * 1000;
      const boardStart = t_board_abs * 1000;

      scheduleAudio(p1Start);
      scheduleAudio(p2Start);
      scheduleAudio(boardStart);
    } else {
      t_timeouts.push(setTimeout(() => setIsDealing(false), 2500));
      const p1Start = (dealOrder === 0 ? 0 : DEAL_DURATION) * 1000;
      const p2Start = (dealOrder === 1 ? 0 : DEAL_DURATION) * 1000;
      scheduleAudio(p1Start);
      scheduleAudio(p2Start);
    }

    return () => {
      t_timeouts.forEach(clearTimeout);
    };
  }, [phase, round, dealId, dealOrder, isFirstDeal, t_start, t_board_abs]);

  const handleSmartMove = (cardId: string) => {
    if (!isMyTurn || isAnimating || isDealing) return;
    const handCard = humanPlayer.hand.find((c) => c.id === cardId);
    if (!handCard) return;
    const validCaptures = getValidCaptures(handCard, board);
    if (validCaptures.length > 0) {
      playCard(
        cardId,
        validCaptures[0].map((c) => c.id),
      );
    } else {
      playCard(cardId, []);
    }
  };

  const handleTimeout = () => {
    if (
      activePlayerIndex === 0 &&
      humanPlayer?.hand.length > 0 &&
      phase === "playing" &&
      !isDealing &&
      !isAnimating
    ) {
      const playableCard =
        humanPlayer.hand[Math.floor(Math.random() * humanPlayer.hand.length)];
      handleSmartMove(playableCard.id);
    }
  };

  const activePlayerIsBot = players[activePlayerIndex]?.isBot;

  // Bot Turn Trigger
  useEffect(() => {
    if (
      !isDealing &&
      !isAnimating &&
      phase === "playing" &&
      activePlayerIsBot
    ) {
      const timer = setTimeout(() => {
        const state = useGameStore.getState();
        if (
          state.phase === "playing" &&
          !state.isAnimating &&
          state.players[state.activePlayerIndex]?.isBot
        ) {
          const move = getBestMove(state, state.activePlayerIndex);
          playCard(move.handCardId, move.captureCardIds);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [
    isDealing,
    isAnimating,
    activePlayerIndex,
    phase,
    activePlayerIsBot,
    playCard,
  ]);

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
    let newSelection = isAlreadySelected
      ? currentSelection.filter((id) => id !== cardId)
      : [...currentSelection, cardId];
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

  const particles = useMemo(
    () =>
      [...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="game-particle"
          style={{ left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%` }}
          animate={{ y: [0, -60, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )),
    [],
  );

  return (
    <div className="game-container" key={dealId}>
      <div className="game-background">
        <div className="game-background-image" />
        <div className="game-background-overlay" />
        {particles}
      </div>

      <div className="game-scale-wrapper">
        <motion.div
          className="game-top-bar"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="game-player-info self-start">
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1 sm:gap-1.5 lg:gap-2">
                <div className="flex items-center gap-0.5 px-2 py-0.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-yellow-400/10 border border-yellow-400/30 rounded sm:rounded-md lg:rounded-lg">
                  <Sparkles size={12} className="text-yellow-400" />
                  <span className="text-[11px] sm:text-sm lg:text-base font-bold text-yellow-400">
                    {botPlayer?.roundScopas || 0}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 px-2 py-0.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-blue-400/10 border border-blue-400/30 rounded sm:rounded-md lg:rounded-lg">
                  <Trophy size={12} className="text-blue-400" />
                  <span className="text-[11px] sm:text-sm lg:text-base font-bold text-blue-400">
                    {botPlayer?.score || 0}
                  </span>
                </div>
              </div>
              <div className="game-player-avatar-wrapper">
                <div className="game-player-avatar game-player-avatar-opponent !w-11 !h-11 sm:!w-15 sm:!h-15 lg:!w-18 lg:!h-18 text-base sm:text-xl lg:text-2xl">
                  {botPlayer?.name?.charAt(0).toUpperCase() || "🤖"}
                </div>
                <TurnTimerCircle
                  isActive={
                    !isMyTurn &&
                    phase === "playing" &&
                    !isDealing &&
                    !isAnimating &&
                    !revealingCardId
                  }
                  color="#ef4444"
                  onExpire={handleTimeout}
                />
              </div>
              <h3 className="game-player-name font-bold w-full text-center truncate">
                {botPlayer?.name || "Opponent"}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start mt-2">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="game-menu-btn"
            >
              <MenuIcon size={20} />
            </button>
          </div>
        </motion.div>

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
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400"
                >
                  <X size={18} />
                </button>
                <h2 className="game-menu-title">
                  <Sparkles className="text-yellow-400" size={24} /> Game Menu
                </h2>
                <div className="space-y-3 mt-6">
                  <button
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
                  >
                    <RotateCcw size={20} />{" "}
                    {category === "battleRoyale" || category === "arena"
                      ? "Start New Game"
                      : "Restart Game"}
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onExit?.();
                    }}
                    className="game-menu-option game-menu-option-danger"
                  >
                    <LogOut size={20} /> Quit to Lobby
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="game-menu-option game-menu-option-secondary"
                  >
                    <Play size={20} /> Resume Game
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              baseDelay={delay_p2}
              dealId={dealId}
            />
          )}
        </motion.div>

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
            baseDelay={0}
            dealId={dealId}
            disableAnimation={!isDealing}
          />
        </motion.div>

        <motion.div
          className="game-player-hand"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {humanPlayer && (
            <div className="relative flex flex-col items-center gap-4 w-full px-4">
              <div className="fixed right-2 sm:right-6 lg:right-10 bottom-2 sm:bottom-6 lg:bottom-10 flex flex-col items-center gap-1 z-[60] max-w-[80px] sm:max-w-[100px] lg:max-w-[120px]">
                <div className="flex gap-1 sm:gap-1.5 lg:gap-2">
                  <div className="flex items-center gap-0.5 px-2 py-0.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-yellow-400/10 border border-yellow-400/30 rounded sm:rounded-md lg:rounded-lg shrink-0">
                    <span className="text-[11px] sm:text-sm lg:text-base font-bold text-yellow-400">
                      {humanPlayer?.roundScopas || 0}
                    </span>
                    <Sparkles size={12} className="text-yellow-400" />
                  </div>
                  <div className="flex items-center gap-0.5 px-2 py-0.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-blue-400/10 border border-blue-400/30 rounded sm:rounded-md lg:rounded-lg shrink-0">
                    <span className="text-[11px] sm:text-sm lg:text-base font-bold text-blue-400">
                      {humanPlayer?.score || 0}
                    </span>
                    <Trophy size={12} className="text-blue-400" />
                  </div>
                </div>
                <div className="game-player-avatar-wrapper">
                  <div className="game-player-avatar game-player-avatar-self !w-11 !h-11 sm:!w-15 sm:!h-15 lg:!w-18 lg:!h-18 text-base sm:text-xl lg:text-2xl">
                    {humanPlayer.name.charAt(0).toUpperCase()}
                  </div>
                  <TurnTimerCircle
                    isActive={
                      isMyTurn &&
                      phase === "playing" &&
                      !isDealing &&
                      !isAnimating &&
                      !revealingCardId
                    }
                    color="#10b981"
                    onExpire={handleTimeout}
                  />
                </div>
                <span className="game-player-name font-bold w-full text-center truncate">
                  {humanPlayer.name}
                </span>
              </div>
              <button
                className="fixed left-2 sm:left-6 lg:left-10 bottom-2 sm:bottom-6 lg:bottom-10 flex flex-col items-center px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl z-[60]"
                onClick={() => {
                  if (!isAnimating) setShowCaptured(true);
                }}
              >
                <span className="text-xs sm:text-lg lg:text-2xl font-black text-white">
                  {humanPlayer.capturedCards.length}
                </span>
                <span className="text-[8px] sm:text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Captured
                </span>
              </button>
              <Hand
                cards={
                  isFirstDeal && dealPhase === "init" ? [] : humanPlayer.hand
                }
                selectedCardId={selectedHandCardId}
                revealingCardId={revealingCardId}
                onCardClick={handleHandCardClick}
                onCardDoubleClick={handleSmartMove}
                baseDelay={delay_p1}
                dealId={dealId}
              />
            </div>
          )}
        </motion.div>
      </div>

      <ScoringModal
        isOpen={isScoringModalOpen}
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
