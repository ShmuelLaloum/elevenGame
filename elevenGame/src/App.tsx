import { useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { Button } from "./components/Button";
import { useGameStore } from "./store/gameStore";
import { UserPlus, Search, Share2, X } from "lucide-react";

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const initializeGame = useGameStore((state) => state.initializeGame);

  const handleStart = (mode: string) => {
    // For now we default to Bot unless local is chosen, but we'll just pass placeholder names
    const opponents =
      mode === "local" ? ["Player 1", "Player 2"] : ["Player 1", "Bot"];
    initializeGame(opponents);
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-8 bg-[url('https://images.unsplash.com/photo-1605218427335-3a4dd384143e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay">
        <div className="bg-slate-900/80 p-12 rounded-3xl backdrop-blur-sm shadow-2xl border border-slate-700 text-center animate-in fade-in zoom-in duration-500">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-tr from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Eleven
          </h1>
          <p className="text-slate-300 text-xl mb-8 font-light">
            The classic card game of strategy and luck.
          </p>
          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button
              onClick={() => handleStart("bot")}
              className="text-xl px-12 py-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              VS Computer
            </Button>
            <Button
              onClick={() => handleStart("local")}
              className="text-xl px-12 py-4 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              2 Players (Local)
            </Button>
            <Button
              onClick={() => handleStart("online")}
              className="text-xl px-12 py-4 w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 opacity-50 cursor-not-allowed"
              disabled
            >
              Online (Coming Soon)
            </Button>
          </div>

          {/* Social Section */}
          <div className="mt-8 pt-8 border-t border-slate-700 w-full max-w-md">
            <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-4">
              Social
            </h3>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setShowSocial(true)}
              >
                <UserPlus size={18} />
                Add Friend
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setShowSocial(true)}
              >
                <Share2 size={18} />
                Invite
              </Button>
            </div>
          </div>
        </div>

        {/* Social Modal */}
        {showSocial && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-6 rounded-2xl relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowSocial(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X />
              </button>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <UserPlus className="text-blue-400" />
                Friends & Invites
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search username..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="py-4 text-center text-slate-500 text-sm">
                  <p>No friends online.</p>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Send Invite Link
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <GameScreen onExit={() => setHasStarted(false)} />
    </>
  );
}

export default App;
