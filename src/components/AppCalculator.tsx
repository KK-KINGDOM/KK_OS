import React, { useState } from "react";
import { Plus, Minus, X, Equal, Hash, RotateCcw } from "lucide-react";

export default function AppCalculator() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [clearOnNextInput, setClearOnNextInput] = useState(false);

  const handleNum = (num: string) => {
    if (display === "0" || clearOnNextInput) {
      setDisplay(num);
      setClearOnNextInput(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setEquation(display + " " + op + " ");
    setClearOnNextInput(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setClearOnNextInput(false);
  };

  const handleEqual = () => {
    if (!equation) return;
    
    const fullEq = equation + display;
    try {
      // Safe parsing of basic maths
      const sanitized = fullEq.replace(/x/g, "*").replace(/[^0-9+\-*/.]/g, "");
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      
      setDisplay(Number(result.toFixed(6)).toString());
      setEquation("");
      setClearOnNextInput(true);
    } catch {
      setDisplay("Error");
      setEquation("");
      setClearOnNextInput(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono select-none" id="calculator-app">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center gap-1.5 shrink-0">
        <div className="p-1.5 rounded-lg bg-orange-950/40 text-orange-400">
          <Hash size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Calculator</h2>
        </div>
      </div>

      {/* Screen */}
      <div className="flex-1 flex flex-col justify-end p-4 text-right bg-slate-900/40 min-h-[100px]">
        <div className="text-xs text-slate-500 font-semibold h-4 mb-1 tracking-tight select-all">
          {equation}
        </div>
        <div className="text-2xl font-bold text-white tracking-tight overflow-x-auto select-all">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950 shrink-0">
        <button
          onClick={handleClear}
          className="col-span-3 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-orange-400 transition-all cursor-pointer active:scale-95"
        >
          CLEAR
        </button>
        <button
          onClick={() => handleOp("/")}
          className="py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-orange-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          /
        </button>

        <button
          onClick={() => handleNum("7")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          7
        </button>
        <button
          onClick={() => handleNum("8")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          8
        </button>
        <button
          onClick={() => handleNum("9")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          9
        </button>
        <button
          onClick={() => handleOp("x")}
          className="py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-orange-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <X size={14} />
        </button>

        <button
          onClick={() => handleNum("4")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          4
        </button>
        <button
          onClick={() => handleNum("5")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          5
        </button>
        <button
          onClick={() => handleNum("6")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          6
        </button>
        <button
          onClick={() => handleOp("-")}
          className="py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-orange-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <Minus size={14} />
        </button>

        <button
          onClick={() => handleNum("1")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          1
        </button>
        <button
          onClick={() => handleNum("2")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          2
        </button>
        <button
          onClick={() => handleNum("3")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          3
        </button>
        <button
          onClick={() => handleOp("+")}
          className="py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-orange-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <Plus size={14} />
        </button>

        <button
          onClick={() => handleNum("0")}
          className="col-span-2 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          0
        </button>
        <button
          onClick={() => handleNum(".")}
          className="py-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-sm font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="py-3.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg shadow-orange-500/10"
        >
          <Equal size={14} />
        </button>
      </div>
    </div>
  );
}
