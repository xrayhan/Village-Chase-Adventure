
import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import GameCanvas from './components/GameCanvas';
import { generateRuralBackground, generateGameCommentary } from './services/gemini';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [commentary, setCommentary] = useState("শীঘ্রই শুরু হচ্ছে এক রোমাঞ্চকর দৌড়!");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAssets = async () => {
      const img = await generateRuralBackground();
      if (img) setBgImage(img);
      setLoading(false);
    };
    initAssets();
  }, []);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setCommentary("সাবধানে! সামনে অনেক বাধা!");
  };

  const endGame = useCallback(async (finalScore: number) => {
    setGameState(GameState.GAMEOVER);
    setScore(finalScore);
    if (finalScore > highScore) setHighScore(finalScore);
    const newComm = await generateGameCommentary(finalScore);
    setCommentary(newComm);
  }, [highScore]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col font-sans select-none">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[100] bg-emerald-950">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-400"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">🏃‍♀️</div>
            </div>
            <h1 className="text-3xl font-bold mt-8 text-emerald-400 animate-pulse">লোড হচ্ছে...</h1>
            <p className="mt-4 text-emerald-200/60 font-medium">AI গ্রামের পরিবেশ সাজাচ্ছে</p>
        </div>
      ) : (
        <>
          {/* Header Score - HIGH VISIBILITY */}
          <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col gap-2">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
                 <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">Score</p>
                 <p className="text-4xl game-font text-white">{score}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-xl text-right">
               <p className="text-[10px] uppercase font-black text-amber-400 tracking-widest">High Score</p>
               <p className="text-2xl game-font text-white">{highScore}</p>
            </div>
          </div>

          <GameCanvas 
            state={gameState} 
            onGameOver={endGame} 
            updateScore={setScore} 
            bgImage={bgImage}
          />

          {gameState === GameState.PLAYING && (
            <div className="absolute bottom-6 right-6 z-40 animate-bounce pointer-events-none">
              <div className="bg-white/20 p-4 rounded-full border border-white/30 backdrop-blur-sm">
                <span className="text-2xl text-white">👆 TAP TO JUMP</span>
              </div>
            </div>
          )}

          {gameState === GameState.START && (
            <div className="absolute inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl border-b-8 border-emerald-600 text-center transform transition-all scale-100">
                <div className="mb-6 relative">
                   <div className="text-7xl mb-2">🏃‍♀️🎋</div>
                   <h1 className="text-5xl game-font text-emerald-700">গ্ৰামের দৌড়</h1>
                </div>
                
                <p className="text-slate-600 mb-8 font-semibold leading-relaxed">
                   বাঁশ হাতে তাড়া করছে প্রতিপক্ষ! <br/>
                   <span className="text-emerald-600">Space</span> বা <span className="text-emerald-600">Tap</span> করে বাধাগুলো টপকে যান।
                </p>

                <button 
                  onClick={startGame}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white game-font text-3xl py-6 rounded-3xl shadow-[0_10px_0_rgb(5,150,105)] active:translate-y-2 active:shadow-none transition-all"
                >
                  START GAME
                </button>
              </div>
            </div>
          )}

          {gameState === GameState.GAMEOVER && (
            <div className="absolute inset-0 z-50 bg-red-950/90 flex items-center justify-center p-4 backdrop-blur-xl">
              <div className="bg-white p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl border-b-8 border-red-600 text-center animate-in zoom-in duration-300">
                <h2 className="text-5xl game-font text-red-600 mb-6">ধরা পড়েছেন!</h2>
                
                <div className="bg-slate-100 p-6 rounded-3xl mb-8 flex justify-between items-center px-10">
                  <div>
                    <p className="text-slate-500 uppercase font-black text-xs tracking-widest">Score</p>
                    <p className="text-5xl game-font text-slate-800">{score}</p>
                  </div>
                  <div className="w-px h-12 bg-slate-300"></div>
                  <div>
                    <p className="text-slate-500 uppercase font-black text-xs tracking-widest">Best</p>
                    <p className="text-5xl game-font text-emerald-600">{highScore}</p>
                  </div>
                </div>

                <div className="mb-8 px-4">
                  <p className="text-slate-700 font-bold italic text-lg leading-tight">"{commentary}"</p>
                </div>

                <button 
                  onClick={startGame}
                  className="w-full bg-red-600 hover:bg-red-500 text-white game-font text-3xl py-6 rounded-3xl shadow-[0_10px_0_rgb(220,38,38)] active:translate-y-2 active:shadow-none transition-all"
                >
                  TRY AGAIN
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
