import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  RotateCcw,
  Trophy,
  Sparkles,
  Clock,
  Zap,
  CheckCircle2
} from "lucide-react";

export default function AppPuzzleGame() {
  const [gridSize, setGridSize] = useState<3 | 4>(3);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem("kk_puzzle_highscore") || 0);
  });

  const totalTiles = gridSize * gridSize;

  const initGame = (size: 3 | 4 = gridSize) => {
    // Generate solved state: 1, 2, ..., N-1, 0
    let arr = Array.from({ length: size * size }, (_, i) => (i + 1) % (size * size));

    // Perform valid random swaps from empty tile to guarantee solvability
    let emptyIdx = size * size - 1;
    for (let i = 0; i < 100; i++) {
      const neighbors = [];
      const row = Math.floor(emptyIdx / size);
      const col = emptyIdx % size;

      if (row > 0) neighbors.push(emptyIdx - size);
      if (row < size - 1) neighbors.push(emptyIdx + size);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < size - 1) neighbors.push(emptyIdx + 1);

      const picked = neighbors[Math.floor(Math.random() * neighbors.length)];
      arr[emptyIdx] = arr[picked];
      arr[picked] = 0;
      emptyIdx = picked;
    }

    setTiles(arr);
    setMoves(0);
    setSeconds(0);
    setIsPlaying(true);
    setIsWon(false);
  };

  useEffect(() => {
    initGame(gridSize);
  }, [gridSize]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isWon) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isWon]);

  const handleTileClick = (idx: number) => {
    if (isWon) return;

    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    const emptyRow = Math.floor(emptyIdx / gridSize);
    const emptyCol = emptyIdx % gridSize;

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const nextTiles = [...tiles];
      nextTiles[emptyIdx] = nextTiles[idx];
      nextTiles[idx] = 0;

      setTiles(nextTiles);
      setMoves((m) => m + 1);

      // Check win condition
      const isSolved = nextTiles.every((val, i) => (i === totalTiles - 1 ? val === 0 : val === i + 1));
      if (isSolved) {
        setIsWon(true);
        setIsPlaying(false);
        if (!highScore || moves + 1 < highScore) {
          setHighScore(moves + 1);
          localStorage.setItem("kk_puzzle_highscore", String(moves + 1));
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
            <Gamepad2 size={18} />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">Sliding Tile Puzzle</h2>
            <p className="text-[9px] text-slate-400 font-mono">Logic & Spatial Challenge</p>
          </div>
        </div>

        {/* Size Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
          <button
            onClick={() => setGridSize(3)}
            className={`px-2 py-0.5 rounded-lg cursor-pointer ${
              gridSize === 3 ? "bg-purple-500 text-white" : "text-slate-400"
            }`}
          >
            3x3
          </button>
          <button
            onClick={() => setGridSize(4)}
            className={`px-2 py-0.5 rounded-lg cursor-pointer ${
              gridSize === 4 ? "bg-purple-500 text-white" : "text-slate-400"
            }`}
          >
            4x4
          </button>
        </div>
      </div>

      {/* DASHBOARD & STATS */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-4 font-mono font-bold">
          <span className="flex items-center gap-1 text-purple-400">
            <Zap size={14} /> Moves: {moves}
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <Clock size={14} /> {seconds}s
          </span>
        </div>

        <button
          onClick={() => initGame()}
          className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow active:scale-95"
        >
          <RotateCcw size={13} /> Shuffle
        </button>
      </div>

      {/* PUZZLE CANVAS GRID */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        <div
          className="w-full max-w-xs aspect-square bg-slate-900 rounded-3xl border-4 border-slate-800 p-2 grid gap-2 shadow-2xl relative"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {tiles.map((num, idx) => {
            if (num === 0) {
              return <div key={idx} className="bg-slate-950/60 rounded-2xl border border-slate-850/40" />;
            }

            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-black text-xl shadow-lg border border-purple-400/30 flex items-center justify-center cursor-pointer hover:scale-98 active:scale-90 transition-transform select-none"
              >
                {num}
              </button>
            );
          })}

          {/* Victory Overlay */}
          {isWon && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-3 p-4 animate-fade-in text-center">
              <Trophy size={48} className="text-amber-400 animate-bounce" />
              <h2 className="text-lg font-black text-white">PUZZLE SOLVED!</h2>
              <p className="text-xs text-purple-300 font-mono">Completed in {moves} moves ({seconds}s)</p>
              <button
                onClick={() => initGame()}
                className="px-5 py-2 rounded-xl bg-purple-500 text-white font-extrabold text-xs cursor-pointer shadow"
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
