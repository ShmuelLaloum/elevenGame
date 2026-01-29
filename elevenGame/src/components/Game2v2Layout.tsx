import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import clsx from "clsx";
import { Hand } from "./Hand";
import { Board } from "./Board";
import { TurnTimerCircle } from "./GameScreen";
import type { Player, TeamInfo } from "../types";

// Props for the complete 2v2 game layout
interface Game2v2LayoutProps {
  players: Player[];
  teams: TeamInfo[];
  board: any[];
  activePlayerIndex: number;
  humanPlayerIndex: number;
  selectedHandCardId: string | null;
  selectedBoardCardIds: string[];
  isDealing: boolean;
  dealPhase: string;
  isFirstDeal: boolean;
  dealId: number | undefined;
  isAnimating: boolean;
  revealingCardId: string | null | undefined;
  isPaused: boolean;
  phase: string;
  dealOrder: number;
  onHandCardClick: (cardId: string) => void;
  onHandCardDoubleClick: (cardId: string) => void;
  onBoardCardClick: (cardId: string) => void;
  onTimeout: () => void;
  onShowCaptured: () => void;
  showCaptured: boolean;
  isMenuOpen: boolean;
}

// Turn Timer indicator for 2v2
const TurnIndicator = memo(
  ({
    isActive,
    isPaused,
    teamIndex,
    onTimeout,
  }: {
    isActive: boolean;
    isPaused: boolean;
    teamIndex: number;
    onTimeout: () => void;
  }) => {
    if (!isActive) return null;

    // Use requested colors: Blue for Team 1 (index 0), Red for Team 2 (index 1)
    const color = teamIndex === 0 ? "#60a5fa" : "#f87171";

    return (
      <TurnTimerCircle
        isActive={isActive}
        isPaused={isPaused}
        color={color}
        onExpire={onTimeout}
      />
    );
  },
);

// Small player avatar for corners
const PlayerAvatar2v2 = memo(
  ({
    player,
    isActive,
    isLocal,
    teamIndex,
    isPaused,
    onTimeout,
  }: {
    player: Player;
    isActive: boolean;
    isLocal: boolean;
    teamIndex: number;
    isPaused: boolean;
    onTimeout: () => void;
  }) => {
    const teamColors =
      teamIndex === 0
        ? "from-blue-500 to-indigo-600 border-blue-400/50"
        : "from-red-500 to-orange-600 border-red-400/50";

    const bgGradient = isLocal
      ? "from-emerald-400 to-teal-600"
      : player.isBot
        ? "from-orange-400 to-red-500"
        : teamColors;

    return (
      <div className="relative">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg bg-gradient-to-br ${bgGradient} border-2 ${teamIndex === 0 ? "border-blue-400/50" : "border-red-400/50"}`}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        <TurnIndicator
          isActive={isActive && !isPaused}
          isPaused={isPaused}
          teamIndex={teamIndex}
          onTimeout={onTimeout}
        />
      </div>
    );
  },
);

// Team Score Display for Sidebar
const TeamScoreInSidebar = memo(
  ({ team, isMyTeam }: { team: TeamInfo; isMyTeam: boolean }) => {
    const textColor = isMyTeam ? "text-blue-400" : "text-red-400";

    return (
      <div
        className={clsx("game-2v2-team-score", isMyTeam ? "team-0" : "team-1")}
      >
        <span className="label">TEAM {team.teamIndex + 1}</span>
        <div className="flex items-center gap-0.5">
          <Trophy size={10} className={textColor} />
          <div className={clsx("score-val", textColor)}>{team.score}</div>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles size={8} className="text-yellow-400" />
          <span className="bonus-val text-yellow-500">{team.roundScopas}</span>
        </div>
      </div>
    );
  },
);

// Complete 2v2 game layout component
export const Game2v2Layout = memo(
  ({
    players,
    teams,
    board,
    activePlayerIndex,
    humanPlayerIndex,
    selectedHandCardId,
    selectedBoardCardIds,
    revealingCardId,
    dealPhase,
    isFirstDeal,
    isDealing,
    isAnimating,
    dealId,
    dealOrder,
    onHandCardClick,
    onHandCardDoubleClick,
    onBoardCardClick,
    onTimeout,
    onShowCaptured,
    showCaptured,
    isPaused,
    isMenuOpen,
  }: Game2v2LayoutProps) => {
    // Layout: [You (0)] Bottom-Right, [Opponent1 (1)] Bottom-Left, [Teammate (2)] Top-Right, [Opponent2 (3)] Top-Left
    // This places teammates opposite each other vertically on the right side
    const positionedPlayers = useMemo(() => {
      return {
        bottomRight: players[0], // You
        topLeft: players[2], // Teammate (Diagonal)
        bottomLeft: players[1], // Opponent 1
        topRight: players[3], // Opponent 2
      };
    }, [players]);

    const team1 = teams[0];
    const team2 = teams[1];
    const humanPlayer = players[humanPlayerIndex];

    const PLAYER_DEAL_GAP = 1.1;
    const getPlayerDelay = (playerIndex: number) => {
      // Calculate deal delay based on deal order [0,1,2,3]
      // (playerIndex - dealOrder + players.length) % players.length gives the relative order in the deal sequence
      const orderOffset =
        (playerIndex - dealOrder + players.length) % players.length;
      return orderOffset * PLAYER_DEAL_GAP;
    };

    return (
      <>
        {/* Right Sidebar for Scores and Captured Pile - ONLY show in main game screen */}
        {!showCaptured && !isPaused && !isMenuOpen && (
          <div className="game-2v2-sidebar">
            <TeamScoreInSidebar team={team1} isMyTeam={true} />
            <TeamScoreInSidebar team={team2} isMyTeam={false} />

            <div className="h-px bg-slate-700/50 my-1" />

            {/* Team captured cards button */}
            <button className="game-2v2-captured-btn" onClick={onShowCaptured}>
              <span className="label">Captured</span>
              <span className="count">{team1?.capturedCards.length || 0}</span>
            </button>
          </div>
        )}

        {/* Top-Left: Teammate (Diagonal from You) */}
        <motion.div
          className="fixed top-2 left-2 sm:top-4 sm:left-4 z-30 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PlayerAvatar2v2
            player={positionedPlayers.topLeft}
            isActive={
              activePlayerIndex === 2 &&
              !isDealing &&
              !isAnimating &&
              !revealingCardId
            }
            isLocal={false}
            teamIndex={0}
            isPaused={isPaused}
            onTimeout={onTimeout}
          />
          <span className="text-[9px] sm:text-xs text-blue-400 font-bold mb-1">
            {positionedPlayers.topLeft?.name || "Teammate"}
          </span>
          {/* Fixed container for hand to prevent profile jump */}
          <div className="h-16 w-32 flex items-start justify-center">
            <Hand
              cards={
                isFirstDeal && dealPhase === "init"
                  ? []
                  : positionedPlayers.topLeft?.hand || []
              }
              isBot={true}
              revealingCardId={revealingCardId}
              revealDirection="down"
              className="game-hand-2v2 !min-h-0"
              baseDelay={getPlayerDelay(2)}
              dealId={dealId}
            />
          </div>
        </motion.div>

        {/* Top-Right: Opponent 2 (Aligned with table edge, clearing sidebar) */}
        <motion.div
          className="fixed top-2 right-[10px] sm:top-4 sm:right-[15px] z-30 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PlayerAvatar2v2
            player={positionedPlayers.topRight}
            isActive={
              activePlayerIndex === 3 &&
              !isDealing &&
              !isAnimating &&
              !revealingCardId
            }
            isLocal={false}
            teamIndex={1}
            isPaused={isPaused}
            onTimeout={onTimeout}
          />
          <span className="text-[9px] sm:text-xs text-white/60 font-medium mb-1">
            {positionedPlayers.topRight?.name || "Opponent 2"}
          </span>
          <div className="h-16 w-32 flex items-start justify-center">
            <Hand
              cards={
                isFirstDeal && dealPhase === "init"
                  ? []
                  : positionedPlayers.topRight?.hand || []
              }
              isBot={true}
              revealingCardId={revealingCardId}
              revealDirection="down"
              className="game-hand-2v2 !min-h-0"
              baseDelay={getPlayerDelay(3)}
              dealId={dealId}
            />
          </div>
        </motion.div>

        {/* Bottom-Left: Opponent 1 */}
        <motion.div
          className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-30 flex flex-col-reverse items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PlayerAvatar2v2
            player={positionedPlayers.bottomLeft}
            isActive={
              activePlayerIndex === 1 &&
              !isDealing &&
              !isAnimating &&
              !revealingCardId
            }
            isLocal={false}
            teamIndex={1}
            isPaused={isPaused}
            onTimeout={onTimeout}
          />
          <span className="text-[9px] sm:text-xs text-white/60 font-medium mt-1">
            {positionedPlayers.bottomLeft?.name || "Opponent 1"}
          </span>
          <div className="h-16 w-32 flex items-end justify-center">
            <Hand
              cards={
                isFirstDeal && dealPhase === "init"
                  ? []
                  : positionedPlayers.bottomLeft?.hand || []
              }
              isBot={true}
              revealingCardId={revealingCardId}
              revealDirection="up"
              className="game-hand-2v2 !min-h-0"
              baseDelay={getPlayerDelay(1)}
              dealId={dealId}
            />
          </div>
        </motion.div>

        {/* Board - Center (STRICT 2V2 MODE) */}
        <motion.div
          className="game-board-area is-2v2-active"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="w-full h-full flex items-center justify-center p-4">
            <Board
              cards={
                isFirstDeal && (dealPhase === "init" || dealPhase === "hands")
                  ? []
                  : board
              }
              selectedCardIds={selectedBoardCardIds}
              onCardClick={onBoardCardClick}
              baseDelay={0}
              dealId={dealId}
              disableAnimation={!isDealing}
            />
          </div>
        </motion.div>

        {/* Bottom-Right: Local Player (You) Aligned with table edge */}
        <motion.div
          className="fixed bottom-2 right-[10px] sm:bottom-4 sm:right-[15px] z-50 flex flex-col-reverse items-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {humanPlayer && (
            <>
              <PlayerAvatar2v2
                player={humanPlayer}
                isActive={
                  activePlayerIndex === humanPlayerIndex &&
                  !isDealing &&
                  !isAnimating &&
                  !revealingCardId
                }
                isLocal={true}
                teamIndex={0}
                isPaused={isPaused}
                onTimeout={onTimeout}
              />
              <span className="text-[9px] sm:text-xs font-bold text-emerald-400 mt-1 mb-1">
                You
              </span>
              <div className="h-16 w-32 flex items-end justify-center">
                <Hand
                  cards={
                    isFirstDeal && dealPhase === "init" ? [] : humanPlayer.hand
                  }
                  selectedCardId={selectedHandCardId}
                  revealingCardId={revealingCardId}
                  onCardClick={onHandCardClick}
                  onCardDoubleClick={onHandCardDoubleClick}
                  baseDelay={getPlayerDelay(0)}
                  dealId={dealId}
                  revealDirection="up"
                  className="game-hand-2v2 !min-h-0"
                />
              </div>
            </>
          )}
        </motion.div>
      </>
    );
  },
);
