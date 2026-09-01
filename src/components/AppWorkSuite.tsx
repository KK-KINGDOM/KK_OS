import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  FileText,
  FileSpreadsheet,
  Presentation,
  MessageSquare,
  Trello,
  CheckSquare,
  Cloud,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Share2,
  CheckCircle2,
  Hash,
  Send,
  Sliders
} from "lucide-react";
import { playClickSound } from "../utils/sound";

export default function AppWorkSuite() {
  const [activeModule, setActiveModule] = useState<
    "word" | "excel" | "powerpoint" | "slack" | "trello" | "todoist" | "cloud"
  >("word");

  // Word Editor State
  const [docTitle, setDocTitle] = useState("Project_Roadmap_2026.docx");
  const [docContent, setDocContent] = useState(
    "# KK-Mobile-OS Enterprise Architecture Review\n\n1. Executive Summary: High-performance sandboxed Android/Linux simulation.\n2. PowerHAL & Battery Consumption Pie Chart visualization.\n3. Multimodal Search with Gemini 2.5 Flash.\n4. Real-time UPI Payments & Audio DSP Engine."
  );

  // Excel Spreadsheet State
  const [spreadsheetData, setSpreadsheetData] = useState([
    ["App Module", "RAM Usage (MB)", "Power Drain (mA)", "Status"],
    ["Global Search Engine", "140", "45", "OPTIMAL"],
    ["PowerHAL Daemon", "35", "12", "EFFICIENT"],
    ["Battery Pie Chart DSP", "55", "18", "ACTIVE"],
    ["Google Play Services", "210", "65", "BACKGROUND"]
  ]);

  // Slack Channel Chat State
  const [slackMessages, setSlackMessages] = useState([
    { user: "Sundar P.", time: "10:04 AM", text: "KK-Mobile-OS battery pie chart visualization looks incredible!" },
    { user: "Demis H.", time: "10:12 AM", text: "Gemini 2.5 Flash search latency is under 180ms. Ready for production rollouts." },
    { user: "Krishna (You)", time: "10:15 AM", text: "All 50+ applications verified and compiled green." }
  ]);
  const [newSlackMsg, setNewSlackMsg] = useState("");

  // Trello Kanban State
  const [trelloCards, setTrelloCards] = useState({
    todo: ["Conduct Security Audit", "Tune FM Radio RDS Decoders"],
    inProgress: ["Optimize Multimodal Voice Latency"],
    done: ["Integrate Battery Pie Chart", "Build Universal UPI Suite"]
  });

  // Todoist Checklist State
  const [todos, setTodos] = useState([
    { id: "t1", text: "Verify Play Protect certification", done: true },
    { id: "t2", text: "Test FM frequency scanning (87.5-108 MHz)", done: true },
    { id: "t3", text: "Inspect Google Maps navigation HUD", done: true },
    { id: "t4", text: "Check UPI Soundbox voice alert", done: true }
  ]);
  const [newTodo, setNewTodo] = useState("");

  const toggleTodo = (id: string) => {
    playClickSound();
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    playClickSound();
    setTodos([...todos, { id: `t-${Date.now()}`, text: newTodo.trim(), done: false }]);
    setNewTodo("");
  };

  const handleSendSlack = () => {
    if (!newSlackMsg.trim()) return;
    playClickSound();
    setSlackMessages([
      ...slackMessages,
      { user: "Krishna (You)", time: "Just now", text: newSlackMsg.trim() }
    ]);
    setNewSlackMsg("");
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md">
            <Briefcase size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">Work & Productivity Suite</h2>
            <span className="text-[10px] text-slate-400 font-mono">Microsoft 365 • Slack • Trello • Notion</span>
          </div>
        </div>
      </div>

      {/* Module Switcher Bar */}
      <div className="p-2 bg-slate-950 border-b border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: "word", label: "Word / Docs", icon: FileText, color: "bg-blue-600" },
          { id: "excel", label: "Excel / Sheets", icon: FileSpreadsheet, color: "bg-emerald-600" },
          { id: "powerpoint", label: "PowerPoint", icon: Presentation, color: "bg-orange-600" },
          { id: "slack", label: "Slack Chat", icon: MessageSquare, color: "bg-purple-600" },
          { id: "trello", label: "Trello Kanban", icon: Trello, color: "bg-sky-600" },
          { id: "todoist", label: "Todoist", icon: CheckSquare, color: "bg-red-600" },
          { id: "cloud", label: "OneDrive / Dropbox", icon: Cloud, color: "bg-teal-600" }
        ].map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => {
                playClickSound();
                setActiveModule(mod.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all ${
                activeModule === mod.id
                  ? `${mod.color} text-white shadow-md`
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Module Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* WORD DOCUMENT MODULE */}
        {activeModule === "word" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs font-mono font-bold text-blue-400 outline-none focus:border-blue-500"
              />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Auto-Saved to Cloud</span>
            </div>

            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full h-80 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 text-xs text-slate-200 placeholder-slate-500 outline-none font-sans leading-relaxed resize-none focus:border-blue-500 shadow-inner"
            />
          </div>
        )}

        {/* EXCEL SPREADSHEET MODULE */}
        {activeModule === "excel" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Financial & Telemetry Grid (Excel)</span>
              <span className="text-[10px] font-mono text-slate-400">Formula Bar: =SUM(B2:B5)</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700 text-[10px] font-mono uppercase text-slate-300">
                    {spreadsheetData[0].map((cell, idx) => (
                      <th key={idx} className="p-2.5 font-extrabold">{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {spreadsheetData.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-850">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 font-mono text-slate-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLACK CHAT MODULE */}
        {activeModule === "slack" && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 border-b border-slate-800 pb-2">
              <Hash size={14} />
              <span>engineering-general</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {slackMessages.map((msg, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{msg.user}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSlackMsg}
                onChange={(e) => setNewSlackMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendSlack()}
                placeholder="Message #engineering-general..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendSlack}
                className="px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TRELLO KANBAN MODULE */}
        {activeModule === "trello" && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Sprint Roadmap (Trello Board)
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {/* To Do */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold font-mono text-amber-400 uppercase block">
                  To Do ({trelloCards.todo.length})
                </span>
                {trelloCards.todo.map((c, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-800 text-[11px] text-white font-medium shadow">
                    {c}
                  </div>
                ))}
              </div>

              {/* In Progress */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase block">
                  In Progress ({trelloCards.inProgress.length})
                </span>
                {trelloCards.inProgress.map((c, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-800 text-[11px] text-white font-medium shadow">
                    {c}
                  </div>
                ))}
              </div>

              {/* Done */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase block">
                  Done ({trelloCards.done.length})
                </span>
                {trelloCards.done.map((c, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-800 text-[11px] text-white font-medium shadow">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TODOIST CHECKLIST MODULE */}
        {activeModule === "todoist" && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Daily Action Items (Todoist)
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                placeholder="Add a new task..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500"
              />
              <button
                onClick={handleAddTodo}
                className="px-3 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => toggleTodo(todo.id)}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-lg border flex items-center justify-center ${
                      todo.done ? "bg-red-600 border-red-500 text-white" : "border-slate-600"
                    }`}>
                      {todo.done && <CheckCircle2 size={13} />}
                    </div>
                    <span className={`text-xs ${todo.done ? "line-through text-slate-500" : "text-white font-medium"}`}>
                      {todo.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLOUD DRIVE MODULE */}
        {(activeModule === "cloud" || activeModule === "powerpoint") && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
              <Cloud size={16} />
              <span>OneDrive & Dropbox Cloud Storage Sync</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All documents, PowerPoint slide decks, and spreadsheets are backed up automatically to encrypted cloud vaults with zero data loss.
            </p>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Used: 4.8 GB / 100 GB</span>
              <span className="text-emerald-400 font-bold">100% Synced</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
