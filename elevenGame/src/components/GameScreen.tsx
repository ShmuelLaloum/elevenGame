import { useEffect, useState } from "react";
import { ScoringModal } from "./ScoringModal";
import { CapturedCardsModal } from "./CapturedCardsModal";
import { useGameStore } from "../store/gameStore";
import { Hand } from "./Hand";
import { Board } from "./Board";
import { Button } from "./Button";
import { getValidCaptures } from "../engine/rules";
import { audio } from "../utils/audio";
import { Menu as MenuIcon } from "lucide-react";

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
    clearSelection,
    resetGame,
    restartMatch,
    nextRound,
    lastBonusEvent,
    round,
  } = useGameStore();

  const humanPlayer = players[0];
  const botPlayer = players[1];

  const isMyTurn = activePlayerIndex === 0;
  const [showCaptured, setShowCaptured] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* Staggered Deal Logic */
  const [dealPhase, setDealPhase] = useState<"init" | "hands" | "board">(
    "init"
  );
  const [isDealing, setIsDealing] = useState(true);
  const [dealOrder, setDealOrder] = useState<number>(0);
  const [initialBoardAnimationDone, setInitialBoardAnimationDone] =
    useState(false);

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
      setInitialBoardAnimationDone(false);
    } else {
      setDealPhase("hands");
      setInitialBoardAnimationDone(true);
    }

    let t1: any, t2: any, t3: any;
    const audioTimers: any[] = [];

    const scheduleAudio = (startDelay: number) => {
      for (let i = 0; i < 4; i++) {
        audioTimers.push(
          setTimeout(() => audio.playDeal(), startDelay + i * 200)
        );
      }
    };

    if (isFirstDeal) {
      t1 = setTimeout(() => setDealPhase("hands"), t_start * 1000);
      t2 = setTimeout(() => setDealPhase("board"), t_board_abs * 1000);
      t3 = setTimeout(() => {
        setIsDealing(false);
        setInitialBoardAnimationDone(true);
      }, (t_board_abs + 1.5) * 1000);

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
  }, [phase, round]);

  useEffect(() => {
    (window as any).gameStore = useGameStore;
  }, []);

  useEffect(() => {
    console.log(`Current Phase: ${phase}, Active: ${activePlayerIndex}`);
  }, [phase, activePlayerIndex]);

  const handleSmartMove = (cardId: string) => {
    if (!isMyTurn) return;

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
    if (!isMyTurn) return;
    selectHandCard(cardId);
  };

  const handleBoardCardClick = (cardId: string) => {
    if (!isMyTurn || !selectedHandCardId) return;

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
      audio.playCapture();
    }
  };

  const isScoringOrGameOver = phase === "scoring" || phase === "game_over";

  return (
    <div className="game-container">
      {/* Scalable Game Wrapper */}
      <div className="game-scale-wrapper">
        {/* Top Bar / Bot Info */}
        <div className="game-top-bar">
          <div className="game-player-info">
            <div className="game-player-avatar bg-red-600">B</div>
            <div>
              <h3 className="game-player-name">Bot Opponent</h3>
              <p className="game-player-stats">
                Cards: {botPlayer?.hand.length} | Captures:{" "}
                {botPlayer?.capturedCards.length}
              </p>
            </div>
          </div>
        </div>

        {/* Top Bar / Menu */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
          <div className="game-score-display">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xs uppercase tracking-wider font-bold">
                Bonus
              </span>
              <div className="bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-300 font-mono text-sm">
                {humanPlayer?.roundScopas || 0}
              </div>
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <span className="game-score-label">Score</span>
            <span className="game-score-value">{humanPlayer?.score || 0}</span>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="game-menu-btn">
            <MenuIcon />
          </button>
        </div>

        {/* Menu Modal */}
        {isMenuOpen && (
          <div className="game-menu-modal">
            <div className="game-menu-content modal-scale-wrapper">
              <h2 className="game-menu-title">Game Menu</h2>
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    restartMatch();
                  }}
                  className="w-full"
                >
                  Restart Game
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onExit?.();
                  }}
                  className="w-full"
                >
                  Quit to Main Menu
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full"
                >
                  Resume
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Opponent Hand (Top) */}
        <div className="game-opponent-hand">
          {botPlayer && (
            <Hand
              cards={isFirstDeal && dealPhase === "init" ? [] : botPlayer.hand}
              isBot={true}
              baseDelay={isFirstDeal ? delay_p2 : 0}
            />
          )}
        </div>

        {/* Board (Center) */}
        <div className="game-board-area">
          <Board
            cards={
              !initialBoardAnimationDone && isDealing && dealPhase !== "board"
                ? []
                : board
            }
            selectedCardIds={selectedBoardCardIds}
            onCardClick={handleBoardCardClick}
            baseDelay={delay_board}
            disableAnimation={!isDealing}
          />
        </div>

        {/* Player Hand (Bottom) */}
        <div className="game-player-hand">
          {selectedHandCardId && isMyTurn && (
            <button
              onClick={clearSelection}
              className="text-slate-400 text-sm hover:text-white underline"
            >
              Cancel Selection
            </button>
          )}

          {humanPlayer && (
            <div className="relative flex flex-col items-center gap-4 w-full px-4">
              {/* Captured Cards Button */}
              <div className="absolute right-4 bottom-32 z-30">
                <button
                  className="game-captured-btn"
                  onClick={() => setShowCaptured(true)}
                >
                  <span className="game-captured-count">
                    {humanPlayer.capturedCards.length}
                  </span>
                  <span className="game-captured-label">Captured</span>
                </button>
              </div>

              <Hand
                cards={
                  isFirstDeal && dealPhase === "init" ? [] : humanPlayer.hand
                }
                selectedCardId={selectedHandCardId}
                onCardClick={handleHandCardClick}
                onCardDoubleClick={handleSmartMove}
                baseDelay={isFirstDeal ? delay_p1 : 0}
              />
            </div>
          )}
        </div>

        {/* Current Turn Indicator */}
        {!isMyTurn && phase === "playing" && (
          <div className="game-turn-indicator">
            <div className="game-turn-toast animate-pulse">
              <div className="game-turn-dot" />
              <span>Bot is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Scoring Modal Overlay */}
      <ScoringModal
        isOpen={isScoringOrGameOver}
        players={players}
        activeScopaPlayerIndex={useGameStore((s) => s.activeScopaPlayerIndex)}
        onNextRound={nextRound}
        onRestart={() => {
          restartMatch();
        }}
        onExit={() => {
          resetGame();
          onExit?.();
        }}
        gameOver={phase === "game_over"}
      />

      {/* Bonus Notification Overlay */}
      {bonusNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none perspective-[1000px]">
          <div
            className="animate-[float_3s_ease-in-out_forwards] transform-style-3d bg-gradient-to-br from-yellow-400 to-amber-600 text-white px-12 py-6 rounded-3xl border-4 border-yellow-200 shadow-[0_20px_50px_rgba(234,179,8,0.5)] flex flex-col items-center"
            style={{
              backfaceVisibility: "hidden",
              animation:
                "floatUpsurge 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
            }}
          >
            <div className="text-6xl mb-2">🌟</div>
            <h1 className="text-6xl font-black tracking-tighter drop-shadow-md outline-4 outline-black">
              {bonusNotif}
            </h1>
          </div>
          <style>{`
            @keyframes floatUpsurge {
                0% { opacity: 0; transform: translateY(100px) rotateX(20deg) scale(0.5); }
                20% { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1.2); }
                40% { transform: translateY(-20px) rotateX(-10deg) scale(1); }
                80% { opacity: 1; transform: translateY(-40px) scale(1); }
                100% { opacity: 0; transform: translateY(-100px) scale(0.8); }
            }
          `}</style>
        </div>
      )}

      <CapturedCardsModal
        isOpen={showCaptured}
        onClose={() => setShowCaptured(false)}
        cards={humanPlayer?.capturedCards || []}
      />
    </div>
  );
};
