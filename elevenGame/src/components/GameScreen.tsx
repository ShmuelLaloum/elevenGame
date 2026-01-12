import { useEffect, useState, useRef } from "react";
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
    // initializeGame,
    resetGame,
    restartMatch,
    nextRound,
    lastBonusEvent,
    round,
  } = useGameStore();

  const humanPlayer = players[0]; // Assuming P1 is human
  const botPlayer = players[1]; // Assuming P2 is Bot

  const isMyTurn = activePlayerIndex === 0;
  const [showCaptured, setShowCaptured] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* Staggered Deal Logic */
  const [dealPhase, setDealPhase] = useState<"init" | "hands" | "board">(
    "init"
  );
  const [isDealing, setIsDealing] = useState(true); // Start true to hide cards initially
  const [dealOrder, setDealOrder] = useState<number>(0);
  const [initialBoardAnimationDone, setInitialBoardAnimationDone] =
    useState(false);

  // Timing Configuration (Seconds)
  const INTRO_DELAY = 1.5;
  const DEAL_DURATION = 0.8; // 4 cards * 0.2s

  // Timestamps
  const t_start = INTRO_DELAY;
  const t_p1_abs = t_start + (dealOrder === 0 ? 0 : DEAL_DURATION);
  const t_p2_abs = t_start + (dealOrder === 1 ? 0 : DEAL_DURATION);
  const t_board_abs = t_start + DEAL_DURATION * 2;

  // Helper to detect if this is the very first deal of the round
  const isFirstDeal = round === 1;

  // Delays relative to the Phase Start (since elements mount at phase start)
  // Hands mount at t_start.
  const delay_p1 = t_p1_abs - t_start;
  const delay_p2 = t_p2_abs - t_start;

  // Board mounts at t_board_abs.
  const delay_board = 0;

  useEffect(() => {
    // Determine if this is a "New Game" or "Refill"
    // Triggers on Phase/Round change implies New Game/Round.
    // We also need to trigger on Refill (Deck change? Hand change?)
    // But this Effect only runs on [phase, round].

    // For Round 1 Start:
    setDealOrder(Math.random() > 0.5 ? 0 : 1);
    setIsDealing(true);

    if (isFirstDeal) {
      setDealPhase("init"); // Intro delay
      setInitialBoardAnimationDone(false); // Hide board initially
    } else {
      setDealPhase("hands"); // Skip intro, go straight to hands
      setInitialBoardAnimationDone(true); // Don't hide board
    }

    // Sequence
    // If First Deal: Init (1.5s) -> Hands -> Board
    // If Refill: Hands (Immediate) -> Done (Board skipped)

    let t1: any, t2: any, t3: any;

    if (isFirstDeal) {
      t1 = setTimeout(() => setDealPhase("hands"), t_start * 1000);
      t2 = setTimeout(() => setDealPhase("board"), t_board_abs * 1000);
      t3 = setTimeout(() => {
        setIsDealing(false);
        setInitialBoardAnimationDone(true);
      }, (t_board_abs + 1.5) * 1000);
    } else {
      // Refill Sequence (Just Audio + Delay for hands)
      // We set dealPhase='hands' immediately above.
      // We just need to turn off isDealing after the hand deal duration.
      // Duration = ~1.6s (2 players * 0.8)
      t3 = setTimeout(() => setIsDealing(false), 2000);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [phase, round]); // Removed deck.length to prevent refill animations

  // Audio Sync
  useEffect(() => {
    if (!isDealing) return;

    if (isFirstDeal) {
      // Full Sequence
      const startP1 = t_p1_abs * 1000;
      const startP2 = t_p2_abs * 1000;
      const startBoard = t_board_abs * 1000;

      for (let i = 0; i < 4; i++) {
        setTimeout(() => audio.playDeal(), startP1 + i * 200);
        setTimeout(() => audio.playDeal(), startP2 + i * 200);
        setTimeout(() => audio.playDeal(), startBoard + i * 200);
      }
    } else {
      // Refill Sequence (No Intro, No Board)
      // P1 + P2 only.
      // P1 starts at 0 relative to now? Or staggered?
      // Let's reuse the stagger logic but relative to 0.
      // However, renders might need the delay prop?
      // If we set dealPhase='hands', the components mount/update.
      // We can just play sound immediately.

      const startP1 = (dealOrder === 0 ? 0 : DEAL_DURATION) * 1000;
      const startP2 = (dealOrder === 1 ? 0 : DEAL_DURATION) * 1000;

      for (let i = 0; i < 4; i++) {
        setTimeout(() => audio.playDeal(), startP1 + i * 200);
        setTimeout(() => audio.playDeal(), startP2 + i * 200);
      }
    }
  }, [dealPhase, isDealing, isFirstDeal]); // Trigger ONCE when reset to init occurs.
  // Dependency: When we reset, we schedule everything.
  // Actually, better dependency is `round`.

  useEffect(() => {
    // Debug helper
    (window as any).gameStore = useGameStore;
  }, []);

  useEffect(() => {
    // Debug helper
    console.log(`Current Phase: ${phase}, Active: ${activePlayerIndex}`);
  }, [phase, activePlayerIndex]);

  /* Smart Move Logic (Double Click) */
  const handleSmartMove = (cardId: string) => {
    if (!isMyTurn) return;

    // Find the card object
    const handCard = humanPlayer.hand.find((c) => c.id === cardId);
    if (!handCard) return;

    // Check for valid captures
    const validCaptures = getValidCaptures(handCard, board);

    if (validCaptures.length > 0) {
      // Auto-capture the first valid option
      // If Jack, it returns [[all cards]], so we take all.
      // If number, it returns valid combinations. We pick the first one.
      const captureOption = validCaptures[0];
      const captureIds = captureOption.map((c) => c.id);
      playCard(cardId, captureIds);
      // audio.playCapture(); // REMOVED per request
    } else {
      // Throw card to board
      playCard(cardId, []);
      // audio.playPlace();   // REMOVED per request
    }
  };

  // Bonus Event Listener
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

    // We need to know the next state of selection to check validity
    // Current selection from store:
    const currentSelection = selectedBoardCardIds;
    const isAlreadySelected = currentSelection.includes(cardId);
    let newSelection = [];

    if (isAlreadySelected) {
      newSelection = currentSelection.filter((id) => id !== cardId);
    } else {
      newSelection = [...currentSelection, cardId];
    }

    // Optimistic Update / Check
    toggleBoardCard(cardId); // Update store visual

    // Check if this new selection forms a complete capture with the hand card
    const handCard = humanPlayer.hand.find((c) => c.id === selectedHandCardId);
    if (!handCard) return;

    // Check Logic
    // We can use getValidCaptures to see if this specific set is VALID.
    // getValidCaptures returns ALL valid sets. We just check if newSelection matches one of them.
    // However, getValidCaptures checks logic.
    // Faster check:
    // If Sum(newSelection) + handCard options...

    // Let's use getValidCaptures to get all valid options, then see if newSelection matches one.
    const validOptions = getValidCaptures(handCard, board);

    const isSelectionMatch = validOptions.some((option) => {
      // checkpoint: do IDs match?
      if (option.length !== newSelection.length) return false;
      const optionIds = option.map((c) => c.id).sort();
      const selectionIds = [...newSelection].sort();
      return optionIds.every((val, index) => val === selectionIds[index]);
    });

    if (isSelectionMatch) {
      // Auto Play!
      playCard(selectedHandCardId, newSelection);
      audio.playCapture();
    }
  };

  const isScoringOrGameOver = phase === "scoring" || phase === "game_over";

  // Removed unused validation logic for manual buttons

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden relative">
      {/* Top Bar / Bot Info */}
      <div className="h-24 flex items-center justify-between px-8 bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-red-500/20">
            B
          </div>
          <div>
            <h3 className="font-bold text-slate-200">Bot Opponent</h3>
            <p className="text-xs text-slate-400">
              Cards: {botPlayer?.hand.length} | Captures:{" "}
              {botPlayer?.capturedCards.length}
            </p>
          </div>
        </div>
      </div>

      {/* Top Bar / Menu */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <div className="bg-slate-900/90 px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-blue-500/30 text-blue-100 font-bold shadow-lg flex items-center gap-2 md:gap-4 backdrop-blur-md scale-90 md:scale-100 origin-right mr-8 md:mr-0">
          {/* Bonus Counter */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-yellow-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">
              Bonus
            </span>
            <div className="bg-yellow-500/20 px-1.5 py-0.5 rounded text-yellow-300 font-mono text-sm">
              {humanPlayer?.roundScopas || 0}
            </div>
          </div>

          <div className="w-px h-3 md:h-4 bg-slate-700"></div>

          <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">
            Score
          </span>
          <span className="text-lg md:text-xl font-black text-white">
            {humanPlayer?.score || 0}
          </span>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="bg-slate-800/80 p-3 rounded-full text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Game Menu
            </h2>
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
      )}

      {/* Opponent Hand (Top) */}
      {/* Opponent Hand (Top) */}
      <div className="flex-1 flex items-center justify-center -mt-12 transform scale-75 md:scale-100 transition-transform min-h-[140px]">
        {botPlayer && (
          <Hand
            cards={isFirstDeal && dealPhase === "init" ? [] : botPlayer.hand}
            isBot={true}
            baseDelay={isFirstDeal ? delay_p2 : 0}
          />
        )}
      </div>

      {/* Board (Center) */}
      <div className="flex-[2] flex items-center justify-center px-4 relative z-10 transform scale-75 md:scale-100 transition-transform duration-300">
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
      <div className="flex-1 flex flex-col items-center justify-end pb-24 md:pb-8 gap-4 md:gap-6 z-20 w-full mb-12 md:mb-0">
        {/* Raised mobile bottom padding significantly (pb-24 + mb-12) to ensure cards are clickable */}
        {/* No manual buttons - interactions are click based */}
        {/* We might want a "Cancel Selection" if they select a card but change mind? 
              Clicking background or another card usually handles it, but let's leave the 'Cancel' text link just in case
              or remove it if we want pure click. User said "Remove completely". 
              I'll remove the big buttons. I'll keep the small cancel link for now as it's useful for "Deselect".
              Actually user said "remove completely button of capture and throw". 
              Double click handles everything? Or single click handles everything? 
              "Single click allows dragging or clicking board... once clicked it takes automatically".
          */}
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
            <div className="absolute right-2 bottom-36 md:bottom-8 md:right-12 z-30">
              <button
                className="flex flex-col items-center bg-slate-800/80 p-2 md:p-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition shadow-xl scale-75 md:scale-100 origin-bottom-right"
                onClick={() => setShowCaptured(true)}
              >
                <span className="text-xl md:text-2xl font-bold text-slate-200">
                  {humanPlayer.capturedCards.length}
                </span>
                <span className="text-[10px] md:text-xs text-slate-400">
                  Captured
                </span>
              </button>
            </div>

            <div className="transform scale-75 md:scale-100 origin-bottom transition-transform duration-300">
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
          </div>
        )}
      </div>

      {/* Current Turn Indicator - Subtle Toast instead of full screen blocker */}
      {!isMyTurn && phase === "playing" && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-slate-900/80 text-blue-200 px-6 py-2 rounded-full border border-blue-500/30 backdrop-blur-md shadow-lg flex items-center gap-3 animate-pulse">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            <span className="text-sm font-medium">Bot is thinking...</span>
          </div>
        </div>
      )}
      {/* Scoring Modal Overlay */}
      <ScoringModal
        isOpen={isScoringOrGameOver}
        players={players}
        activeScopaPlayerIndex={useGameStore((s) => s.activeScopaPlayerIndex)}
        onNextRound={nextRound}
        onRestart={() => {
          // Force Immediate Restart
          restartMatch();
        }}
        onExit={() => {
          resetGame();
          onExit?.();
        }}
        gameOver={phase === "game_over"}
      />

      {/* Bonus Notification Overlay - 3D Float */}
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
            {/* Coin/Star Icon dummy */}
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
