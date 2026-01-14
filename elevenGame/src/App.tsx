import { useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { PartyLobby } from "./components/lobby";
import { useGameStore } from "./store/gameStore";

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const initializeGame = useGameStore((state) => state.initializeGame);

  const handleStart = (mode: string) => {
    // For now we default to Bot unless local is chosen, but we'll just pass placeholder names
    const opponents =
      mode === "local" ? ["Player 1", "Player 2"] : ["Player 1", "Bot"];
    initializeGame(opponents);
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
