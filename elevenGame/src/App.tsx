import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GameScreen } from "./components/GameScreen";
import { PartyLobby } from "./components/lobby";
import { Leaderboard } from "./components/pages/Leaderboard";
import { Locker } from "./components/pages/Locker";
import { Shop } from "./components/pages/Shop";
import { Diamonds } from "./components/pages/Diamonds";
import { Navbar } from "./components/navigation/Navbar";
import { GlobalModals } from "./components/modals/GlobalModals";
import { useGameStore } from "./store/gameStore";
import { useUIStore } from "./store/uiStore";

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const initializeGame = useGameStore((state) => state.initializeGame);
  const isNavbarVisible = useUIStore((state) => state.isNavbarVisible);

  const handleStart = (category: string, teamSize: string) => {
    // Set up players based on category and team size
    let players: string[] = [];

    if (category === "computer") {
      if (teamSize === "1v1") {
        players = ["Player 1", "Bot"];
      } else {
        // 2v2 vs computer
        players = ["Player 1", "Bot 1", "Player 1 Teammate", "Bot 2"];
      }
    } else if (category === "friends") {
      if (teamSize === "1v1") {
        players = ["Player 1", "Player 2"];
      } else {
        players = ["Player 1", "Player 2", "Player 3", "Player 4"];
      }
    } else {
      // battleRoyale or arena - online modes
      if (teamSize === "1v1") {
        players = ["Player 1", "Opponent"];
      } else {
        players = ["Player 1", "Teammate", "Opponent 1", "Opponent 2"];
      }
    }

    initializeGame(players);
    setHasStarted(true);
  };

  if (hasStarted) {
    return <GameScreen onExit={() => setHasStarted(false)} />;
  }

  return (
    <BrowserRouter>
      <div className="relative w-full h-full bg-slate-900 overflow-hidden">
        {isNavbarVisible && <Navbar />}
        <GlobalModals />
        <main className="w-full h-full">
          <Routes>
            <Route
              path="/"
              element={<PartyLobby onStartGame={handleStart} />}
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/locker" element={<Locker />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/diamonds" element={<Diamonds />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
