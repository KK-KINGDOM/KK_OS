import React, { useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  Table,
  Calculator,
  Save,
  Download,
  Share2,
  Check
} from "lucide-react";

export default function AppSheets() {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [formulaInput, setFormulaInput] = useState("Sales Summary 2026");

  // Spreadsheet state 8 rows x 4 columns (A, B, C, D)
  const [gridData, setGridData] = useState<string[][]>([
    ["Month", "Units Sold", "Price ($)", "Revenue ($)"],
    ["January", "150", "20", "3000"],
    ["February", "220", "20", "4400"],
    ["March", "310", "20", "6200"],
    ["April", "280", "25", "7000"],
    ["May", "400", "25", "10000"],
    ["Total", "1360", "-", "=SUM(D2:D6)"],
    ["", "", "", ""]
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setFormulaInput(gridData[row][col] || "");
  };

  const handleCellChange = (val: string) => {
    setFormulaInput(val);
    setGridData((prev) => {
      const next = prev.map((r) => [...r]);
      next[selectedCell.row][selectedCell.col] = val;
      return next;
    });
  };

  const addRow = () => {
    setGridData((prev) => [...prev, ["", "", "", ""]]);
    showToast("Added new row to sheet");
  };

  const cols = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Top Header */}
      <div className="p-2.5 bg-emerald-950/90 border-b border-emerald-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-600 text-white shadow">
            <FileSpreadsheet size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs text-white">Google Sheets</span>
            <span className="text-[9px] text-emerald-300 font-mono">Q3_Revenue_Report.xlsx</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => showToast("Sheet saved to Google Cloud")}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Save size={12} /> Save
          </button>
          <button
            onClick={addRow}
            className="p-1 bg-emerald-900 border border-emerald-700 rounded-lg text-emerald-300 hover:text-white"
            title="Add Row"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-xs shrink-0">
        <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {cols[selectedCell.col]}
          {selectedCell.row + 1}
        </span>
        <span className="font-mono font-black text-slate-400">fx</span>
        <input
          type="text"
          value={formulaInput}
          onChange={(e) => handleCellChange(e.target.value)}
          placeholder="Enter formula or value..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
        />
      </div>

      {/* Toast Banner */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg z-30">
          {toastMsg}
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto p-2 bg-slate-950">
        <table className="w-full border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <th className="w-8 p-1 text-center border-r border-slate-800 font-bold">#</th>
              {cols.map((col, idx) => (
                <th key={idx} className="p-1 text-center border-r border-slate-800 font-bold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridData.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-slate-900 hover:bg-slate-900/40">
                <td className="bg-slate-900/80 text-slate-500 text-center font-bold border-r border-slate-800 p-1 text-[10px]">
                  {rIdx + 1}
                </td>
                {row.map((cellVal, cIdx) => {
                  const isSelected = selectedCell.row === rIdx && selectedCell.col === cIdx;
                  return (
                    <td
                      key={cIdx}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      className={`p-1.5 border-r border-slate-850 text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-950/80 border-2 border-emerald-400 text-emerald-200 font-bold"
                          : rIdx === 0
                          ? "bg-slate-900 font-bold text-emerald-300"
                          : "text-slate-200"
                      }`}
                    >
                      {cellVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Sheet Tabs */}
      <div className="p-1.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded border border-emerald-700">
            Sheet1
          </span>
          <span className="px-2 py-0.5 hover:bg-slate-800 rounded">Analysis</span>
        </div>
        <span>4 Columns × {gridData.length} Rows</span>
      </div>
    </div>
  );
}
