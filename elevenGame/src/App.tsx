import { useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { PartyLobby } from "./components/lobby";
import { useGameStore } from "./store/gameStore";

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const initializeGame = useGameStore((state) => state.initializeGame);

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

  if (!hasStarted) {
    return <PartyLobby onStartGame={handleStart} />;
  }

  return (
    <>
      <GameScreen onExit={() => setHasStarted(false)} />
    </>
  );
}

export default App;
