import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GameScreen } from "./components/GameScreen";
import { PartyLobby } from "./components/lobby";
import { Leaderboard } from "./components/pages/Leaderboard";
import { Locker } from "./components/pages/Locker";
import { Shop } from "./components/pages/Shop";
import { Store } from "./components/pages/Store";
import { Navbar } from "./components/navigation/Navbar";
import { GlobalModals } from "./components/modals/GlobalModals";
import { SwipeNavigation } from "./components/navigation/SwipeNavigation";
import { useGameStore } from "./store/gameStore";
import { useUIStore } from "./store/uiStore";
import type { GameMode } from "./types";

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const initializeGame = useGameStore((state) => state.initializeGame);
  const isNavbarVisible = useUIStore((state) => state.isNavbarVisible);

  const handleStart = (
    category: string,
    teamSize: string,
    opponentNames?: string[],
  ) => {
    // Set up players based on category and team size
    // For 2v2: Player order is [You, Opponent1, Teammate, Opponent2]
    // This ensures players 0,2 are on team 0 (diagonal) and 1,3 are on team 1 (diagonal)
    let players: string[] = [];

    if (category === "computer") {
      if (teamSize === "1v1") {
        players = ["Player 1", "Bot"];
      } else {
        // 2v2 vs computer: You and Teammate Bot vs Bot 1 and Bot 2
        // Order: [You, Bot1, Teammate Bot, Bot2] -> teams: 0:[0,2], 1:[1,3]
        players = ["Player 1", "Bot 1", "Teammate Bot", "Bot 2"];
      }
    } else if (category === "friends") {
      if (teamSize === "1v1") {
        players = ["Player 1", "Player 2"];
      } else {
        // 2v2 friends: [You, Opponent1, Teammate, Opponent2]
        players = ["Player 1", "Player 2", "Player 3", "Player 4"];
      }
    } else {
      // battleRoyale or arena - online modes
      if (teamSize === "1v1") {
        players = ["Player 1", "Opponent"];
      } else {
        // 2v2 online: [You, Opponent1, Teammate, Opponent2]
        players = ["Player 1", "Opponent 1", "Teammate", "Opponent 2"];
      }
    }

    // Pass teamSize as GameMode to properly initialize 2v2 game state
    const gameMode = teamSize as GameMode;
    initializeGame(players, category, opponentNames, gameMode);
    setHasStarted(true);
  };

  return (
    <BrowserRouter>
      <SwipeNavigation disabled={hasStarted}>
        <div className="relative w-full h-full bg-slate-900 overflow-hidden">
          {isNavbarVisible && !hasStarted && <Navbar />}
          <GlobalModals />
          <main className="w-full h-full">
            {hasStarted ? (
              <GameScreen onExit={() => setHasStarted(false)} />
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={<PartyLobby onStartGame={handleStart} />}
                />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/locker" element={<Locker />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/store" element={<Store />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </main>
        </div>
      </SwipeNavigation>
    </BrowserRouter>
  );
}

export default App;
