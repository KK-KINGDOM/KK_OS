import React, { useState } from "react";
import {
  Trophy,
  RotateCcw,
  Undo2,
  Bot,
  User,
  Crown,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

type PieceType = "p" | "r" | "n" | "b" | "q" | "k" | "P" | "R" | "N" | "B" | "Q" | "K"; // lower = black, UPPER = white
type BoardState = (PieceType | null)[][];

const INITIAL_BOARD: BoardState = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

const PIECE_SYMBOLS: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
};

export default function AppChess() {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [vsAi, setVsAi] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  const isWhite = (piece: PieceType | null) => !!piece && piece === piece.toUpperCase();
  const isBlack = (piece: PieceType | null) => !!piece && piece === piece.toLowerCase();

  // Basic move generator logic
  const calculateValidMoves = (r: number, c: number, piece: PieceType) => {
    const moves: [number, number][] = [];
    const color = isWhite(piece) ? "white" : "black";

    if (piece.toLowerCase() === "p") {
      const dir = color === "white" ? -1 : 1;
      const startRow = color === "white" ? 6 : 1;

      // Move forward 1
      if (r + dir >= 0 && r + dir < 8 && !board[r + dir][c]) {
        moves.push([r + dir, c]);
        // Move forward 2 from start
        if (r === startRow && !board[r + dir * 2][c]) {
          moves.push([r + dir * 2, c]);
        }
      }
      // Captures
      if (c - 1 >= 0 && board[r + dir][c - 1] && (color === "white" ? isBlack(board[r + dir][c - 1]) : isWhite(board[r + dir][c - 1]))) {
        moves.push([r + dir, c - 1]);
      }
      if (c + 1 < 8 && board[r + dir][c + 1] && (color === "white" ? isBlack(board[r + dir][c + 1]) : isWhite(board[r + dir][c + 1]))) {
        moves.push([r + dir, c + 1]);
      }
    } else if (piece.toLowerCase() === "n") {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightOffsets.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target || (color === "white" ? isBlack(target) : isWhite(target))) {
            moves.push([nr, nc]);
          }
        }
      });
    } else {
      // General sliding or step moves (Rook, Bishop, Queen, King)
      const directions =
        piece.toLowerCase() === "r"
          ? [[-1, 0], [1, 0], [0, -1], [0, 1]]
          : piece.toLowerCase() === "b"
          ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
          : [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

      const maxSteps = piece.toLowerCase() === "k" ? 1 : 7;

      directions.forEach(([dr, dc]) => {
        for (let step = 1; step <= maxSteps; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
          const target = board[nr][nc];
          if (!target) {
            moves.push([nr, nc]);
          } else {
            if (color === "white" ? isBlack(target) : isWhite(target)) {
              moves.push([nr, nc]);
            }
            break;
          }
        }
      });
    }

    return moves;
  };

  const handleCellClick = (r: number, c: number) => {
    if (winner) return;
    const piece = board[r][c];

    if (selectedCell) {
      const [sr, sc] = selectedCell;
      // Is move valid?
      const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);

      if (isValid) {
        // Execute move
        const newBoard = board.map((row) => [...row]);
        const movingPiece = newBoard[sr][sc]!;
        const captured = newBoard[r][c];

        newBoard[r][c] = movingPiece;
        newBoard[sr][sc] = null;

        if (captured) {
          if (isWhite(captured)) setCapturedWhite((prev) => [...prev, PIECE_SYMBOLS[captured]]);
          else setCapturedBlack((prev) => [...prev, PIECE_SYMBOLS[captured]]);

          if (captured.toLowerCase() === "k") {
            setWinner(turn === "white" ? "White" : "Black");
          }
        }

        setBoard(newBoard);
        setSelectedCell(null);
        setValidMoves([]);
        const nextTurn = turn === "white" ? "black" : "white";
        setTurn(nextTurn);
        setMoveHistory((prev) => [
          `${movingPiece.toUpperCase()} to ${String.fromCharCode(97 + c)}${8 - r}`,
          ...prev
        ]);

        // Trigger AI Turn if enabled
        if (vsAi && nextTurn === "black" && !winner) {
          setTimeout(() => triggerAiMove(newBoard), 500);
        }
        return;
      }
    }

    // Select new piece
    if (piece && ((turn === "white" && isWhite(piece)) || (turn === "black" && isBlack(piece)))) {
      setSelectedCell([r, c]);
      setValidMoves(calculateValidMoves(r, c, piece));
    } else {
      setSelectedCell(null);
      setValidMoves([]);
    }
  };

  const triggerAiMove = (currentBoard: BoardState) => {
    const allBlackPieces: { r: number; c: number; piece: PieceType }[] = [];
    currentBoard.forEach((row, r) => {
      row.forEach((piece, c) => {
        if (piece && isBlack(piece)) {
          allBlackPieces.push({ r, c, piece });
        }
      });
    });

    const possibleMoves: { from: [number, number]; to: [number, number]; piece: PieceType }[] = [];
    allBlackPieces.forEach((p) => {
      const moves = calculateValidMoves(p.r, p.c, p.piece);
      moves.forEach((to) => possibleMoves.push({ from: [p.r, p.c], to, piece: p.piece }));
    });

    if (possibleMoves.length > 0) {
      // Pick capture move if available, else random
      const captureMove = possibleMoves.find((m) => currentBoard[m.to[0]][m.to[1]] !== null);
      const chosen = captureMove || possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

      const newBoard = currentBoard.map((row) => [...row]);
      const captured = newBoard[chosen.to[0]][chosen.to[1]];
      newBoard[chosen.to[0]][chosen.to[1]] = chosen.piece;
      newBoard[chosen.from[0]][chosen.from[1]] = null;

      if (captured) {
        setCapturedWhite((prev) => [...prev, PIECE_SYMBOLS[captured]]);
        if (captured.toLowerCase() === "k") setWinner("Black");
      }

      setBoard(newBoard);
      setTurn("white");
    }
  };

  const handleResetGame = () => {
    setBoard(INITIAL_BOARD);
    setTurn("white");
    setSelectedCell(null);
    setValidMoves([]);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setWinner(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
            <Crown size={18} />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">KK Grandmaster Chess</h2>
            <p className="text-[9px] text-slate-400 font-mono">
              {vsAi ? `VS Bot (${aiDifficulty.toUpperCase()})` : "2-Player Local"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVsAi(!vsAi)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            {vsAi ? <Bot size={13} /> : <User size={13} />}
            <span>{vsAi ? "AI Mode" : "2P Mode"}</span>
          </button>

          <button
            onClick={handleResetGame}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* CHESS CANVAS BOARD */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col items-center justify-center space-y-3">
        {/* Turn Status Banner */}
        <div className="flex items-center justify-between w-full max-w-sm px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <span className="flex items-center gap-1.5 font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${turn === "white" ? "bg-amber-400" : "bg-slate-500"}`} />
            <span>Turn: {turn === "white" ? "White (You)" : vsAi ? "Black (Bot thinking...)" : "Black"}</span>
          </span>

          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
            <span>Captured:</span>
            <span className="text-amber-300">{capturedBlack.join("")}</span>
          </div>
        </div>

        {/* 8x8 Grid */}
        <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-2xl border-4 border-amber-950 p-1.5 grid grid-cols-8 gap-0 shadow-2xl relative">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isDarkSquare = (r + c) % 2 === 1;
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isValidMove = validMoves.some(([vr, vc]) => vr === r && vc === c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex items-center justify-center text-2xl font-bold cursor-pointer transition-all select-none ${
                    isDarkSquare ? "bg-amber-900/40" : "bg-amber-200/10"
                  } ${isSelected ? "ring-4 ring-amber-400 z-10" : ""}`}
                >
                  {/* Highlight Valid Target Dot */}
                  {isValidMove && (
                    <div className="absolute w-3 h-3 rounded-full bg-emerald-400/80 shadow-[0_0_8px_#34d399] z-20" />
                  )}

                  {piece && (
                    <span className={isWhite(piece) ? "text-amber-200 drop-shadow" : "text-slate-950 drop-shadow-md"}>
                      {PIECE_SYMBOLS[piece]}
                    </span>
                  )}
                </button>
              );
            })
          )}

          {/* Winner Screen Banner Overlay */}
          {winner && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center space-y-3 z-30 p-4 animate-fade-in text-center">
              <Trophy size={48} className="text-amber-400 animate-bounce" />
              <h2 className="text-xl font-black text-white">{winner} Checkmate Victory!</h2>
              <button
                onClick={handleResetGame}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer hover:bg-amber-400"
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
