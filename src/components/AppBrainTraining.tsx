import React, { useState, useEffect } from "react";
import {
  Brain,
  Zap,
  Target,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Activity
} from "lucide-react";

export default function AppBrainTraining() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "math" | "stroop">("dashboard");
  const [brainScore, setBrainScore] = useState<number>(() => {
    return Number(localStorage.getItem("kk_brain_score") || 850);
  });
  const [dailyStreak, setDailyStreak] = useState(5);

  // Math Sprint State
  const [mathNum1, setMathNum1] = useState(7);
  const [mathNum2, setMathNum2] = useState(8);
  const [mathOp, setMathOp] = useState<"+" | "-" | "*">("+");
  const [userMathInput, setUserMathInput] = useState("");
  const [mathScore, setMathScore] = useState(0);
  const [mathTimeLeft, setMathTimeLeft] = useState(20);
  const [isMathActive, setIsMathActive] = useState(false);

  // Stroop Test State
  const [stroopWord, setStroopWord] = useState("RED");
  const [stroopColor, setStroopColor] = useState("#ef4444");
  const [stroopScore, setStroopScore] = useState(0);

  // Math Sprint Generator
  const generateMathQuestion = () => {
    const ops: ("+" | "-" | "*")[] = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const n1 = Math.floor(Math.random() * 12) + 2;
    const n2 = Math.floor(Math.random() * 10) + 1;

    setMathNum1(n1);
    setMathNum2(n2);
    setMathOp(op);
    setUserMathInput("");
  };

  const startMathSprint = () => {
    setMathScore(0);
    setMathTimeLeft(20);
    setIsMathActive(true);
    generateMathQuestion();
  };

  useEffect(() => {
    let timer: any = null;
    if (isMathActive && mathTimeLeft > 0) {
      timer = setInterval(() => setMathTimeLeft((t) => t - 1), 1000);
    } else if (isMathActive && mathTimeLeft === 0) {
      setIsMathActive(false);
      const newScore = brainScore + mathScore * 10;
      setBrainScore(newScore);
      localStorage.setItem("kk_brain_score", String(newScore));
    }
    return () => clearInterval(timer);
  }, [isMathActive, mathTimeLeft]);

  const handleCheckMathAnswer = (val: string) => {
    setUserMathInput(val);
    let expected = 0;
    if (mathOp === "+") expected = mathNum1 + mathNum2;
    else if (mathOp === "-") expected = mathNum1 - mathNum2;
    else expected = mathNum1 * mathNum2;

    if (parseInt(val) === expected) {
      setMathScore((s) => s + 1);
      generateMathQuestion();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
            <Brain size={18} />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">Brain Gym & Memory</h2>
            <p className="text-[9px] text-slate-400 font-mono">Cognitive Fitness Exercises</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab("math");
              startMathSprint();
            }}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "math" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Speed Math
          </button>
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Main Brain Score Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 border border-teal-500/30 text-center space-y-2 shadow-xl">
            <Brain size={36} className="text-teal-400 mx-auto animate-pulse" />
            <h1 className="text-3xl font-black text-white font-mono">{brainScore}</h1>
            <p className="text-xs text-teal-300 font-bold uppercase tracking-wider">
              Overall Brain Fitness Index
            </p>

            <div className="pt-2 flex justify-center gap-4 text-[10px] font-mono text-slate-400 border-t border-teal-500/20">
              <div>Streak: <strong className="text-amber-400">{dailyStreak} Days</strong></div>
              <div>Percentile: <strong className="text-teal-300">Top 5%</strong></div>
            </div>
          </div>

          {/* Cognitive Breakdown Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                <span>Speed Math</span>
                <Zap size={12} />
              </div>
              <h4 className="text-base font-extrabold text-white">92 / 100</h4>
              <p className="text-[9px] text-slate-400">Mental Calculation Velocity</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-teal-400">
                <span>Memory Retain</span>
                <Target size={12} />
              </div>
              <h4 className="text-base font-extrabold text-white">88 / 100</h4>
              <p className="text-[9px] text-slate-400">Pattern Spatial Memory</p>
            </div>
          </div>

          {/* Launch Math Exercise Button */}
          <button
            onClick={() => {
              setActiveTab("math");
              startMathSprint();
            }}
            className="w-full py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Sparkles size={16} />
            <span>Start 20-Second Mental Math Challenge</span>
          </button>
        </div>
      )}

      {activeTab === "math" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-between">
          <div className="w-full flex justify-between items-center text-xs font-mono font-bold text-slate-400 bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
            <span>Score: <strong className="text-teal-400">{mathScore}</strong></span>
            <span>Time Left: <strong className="text-amber-400">{mathTimeLeft}s</strong></span>
          </div>

          {isMathActive ? (
            <div className="space-y-4 text-center my-4">
              <span className="text-xs font-mono text-teal-400 uppercase tracking-wider block">
                Solve as fast as you can!
              </span>

              <h1 className="text-4xl font-black text-white font-mono">
                {mathNum1} {mathOp} {mathNum2} = ?
              </h1>

              <input
                type="number"
                autoFocus
                value={userMathInput}
                onChange={(e) => handleCheckMathAnswer(e.target.value)}
                placeholder="Answer..."
                className="w-36 bg-slate-900 border-2 border-teal-500 rounded-2xl px-3 py-2 text-2xl font-black text-center text-teal-300 outline-none font-mono"
              />
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 shadow-xl my-4">
              <Trophy size={40} className="text-amber-400 mx-auto" />
              <h2 className="text-lg font-black text-white">SPRINT COMPLETED!</h2>
              <p className="text-xs text-slate-300">You solved {mathScore} questions in 20 seconds!</p>
              <button
                onClick={startMathSprint}
                className="px-6 py-2.5 rounded-2xl bg-teal-500 text-slate-950 font-extrabold text-xs cursor-pointer shadow"
              >
                TRY AGAIN
              </button>
            </div>
          )}

          <div />
        </div>
      )}
    </div>
  );
}
