import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Sparkles,
  X,
  Mic,
  ExternalLink,
  ArrowRight,
  Bot,
  Compass,
  Loader2,
  Zap,
  CornerDownLeft,
  ChevronRight
} from "lucide-react";
import { AppID } from "../types";
import { playClickSound, playAppLaunchSound } from "../utils/sound";
import { recordChildActivity } from "../utils/parentalControl";

interface GlobalSearchBarProps {
  allApps: Array<{
    id: AppID;
    name: string;
    icon: any;
    color: string;
    description?: string;
    category?: string;
  }>;
  onOpenApp: (appId: AppID) => void;
  onSystemLog?: (message: string, severity?: "INFO" | "WARNING" | "CRITICAL") => void;
}

interface SearchResult {
  quickAnswer: string;
  suggestedAppId: AppID | null;
  suggestionReason: string | null;
}

export default function GlobalSearchBar({ allApps, onOpenApp, onSystemLog }: GlobalSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<SearchResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Quick sample queries
  const sampleQueries = [
    "Take a high-res photo",
    "What is 128 multiplied by 32?",
    "Check system memory and logs",
    "What's the weather like?",
    "Listen to upbeat music",
    "Browse web for tech news"
  ];

  // Local app filtering
  const matchingApps = query.trim()
    ? allApps.filter(
        (app) =>
          app.name.toLowerCase().includes(query.toLowerCase()) ||
          (app.description || "").toLowerCase().includes(query.toLowerCase()) ||
          (app.category || "").toLowerCase().includes(query.toLowerCase()) ||
          app.id.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Focus input when search bar expands
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Execute Gemini AI Search
  const performAiSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsAiLoading(true);
    setAiResult(null);

    try {
      onSystemLog?.(`[GlobalSearch] Executing Gemini AI query: "${searchQuery}"`, "INFO");

      // Log for parental controls & live notification
      recordChildActivity(searchQuery, "Global Search", "search");

      const customKey = localStorage.getItem("kk_custom_gemini_api_key") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey) {
        headers["x-gemini-api-key"] = customKey;
      }

      const res = await fetch("/api/gemini/search", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: searchQuery,
          availableApps: allApps.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description || "",
            category: a.category || ""
          }))
        })
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data: SearchResult = await res.json();
      setAiResult(data);

      onSystemLog?.(
        `[GlobalSearch] Gemini AI search response received. Suggested App: ${data.suggestedAppId || "None"}`,
        "INFO"
      );
    } catch (err: any) {
      console.warn("Global Search Gemini Error:", err);
      // Fallback response if API fails or key is missing
      setAiResult({
        quickAnswer: `Here is information regarding "${searchQuery}". KK-Mobile-OS AI recommends launching relevant tools below.`,
        suggestedAppId: null,
        suggestionReason: null
      });
      onSystemLog?.(`[GlobalSearch] Gemini API notice: ${err?.message || "Using local fallback search"}`, "WARNING");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performAiSearch(query);
    }
  };

  const handleSelectSample = (sample: string) => {
    playClickSound();
    setQuery(sample);
    performAiSearch(sample);
  };

  const handleVoiceSimulate = () => {
    playClickSound();
    setIsListening(true);
    const simulatedPhrases = [
      "How do I clear system RAM?",
      "Open camera and record video",
      "Calculate square root of 144",
      "What is the capital of France?"
    ];
    const phrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];

    setTimeout(() => {
      setQuery(phrase);
      setIsListening(false);
      performAiSearch(phrase);
    }, 1200);
  };

  const handleLaunchApp = (appId: AppID) => {
    playAppLaunchSound();
    setIsExpanded(false);
    onOpenApp(appId);
  };

  const suggestedApp = aiResult?.suggestedAppId
    ? allApps.find((a) => a.id === aiResult.suggestedAppId)
    : null;

  return (
    <AnimatePresence mode="wait">
      {/* COLLAPSED HOMESCREEN WIDGET */}
      {!isExpanded ? (
        <motion.div
          key="collapsed-search-bar"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onClick={() => {
            playClickSound();
            setIsExpanded(true);
          }}
          className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-amber-400/50 rounded-full px-3.5 py-2 flex items-center justify-between text-white shadow-xl cursor-pointer hover:bg-black/60 transition-all duration-200 group select-none"
          title="Click to search apps or ask Gemini AI"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-full bg-gradient-to-r from-amber-400 via-teal-400 to-purple-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
              <Sparkles size={11} className="fill-slate-950" />
            </div>
            <span className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors">
              Search apps or ask AI...
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Mic size={13} className="hover:text-amber-400 transition-colors" />
            <Search size={13} className="hover:text-teal-400 transition-colors" />
          </div>
        </motion.div>
      ) : (
        /* EXPANDED FULL-SCREEN GLOBAL SEARCH OVERLAY */
        <motion.div
          key="expanded-search-overlay"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl z-50 flex flex-col p-3.5 text-white select-none"
        >
          {/* Top Search Header Bar */}
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="flex-1 relative flex items-center">
              <Search size={14} className="absolute left-3 text-amber-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search apps or ask Gemini AI..."
                className="w-full bg-slate-900 border border-slate-750 focus:border-amber-400/80 rounded-2xl pl-9 pr-20 py-2 text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setAiResult(null);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded-full cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}

                <button
                  onClick={handleVoiceSimulate}
                  className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                    isListening ? "bg-rose-500 text-white animate-pulse" : "text-slate-400 hover:text-amber-400"
                  }`}
                  title="Simulate Voice Search"
                >
                  <Mic size={13} />
                </button>

                <button
                  onClick={() => performAiSearch(query)}
                  disabled={!query.trim() || isAiLoading}
                  className="p-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold cursor-pointer transition-all shadow-sm"
                  title="Run AI Search"
                >
                  {isAiLoading ? <Loader2 size={13} className="animate-spin" /> : <CornerDownLeft size={13} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                setIsExpanded(false);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>

          {/* Search Content Body */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4 scrollbar-none">
            {/* Voice Listening Overlay Notification */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  key="listening-notification"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 to-purple-950/80 border border-amber-500/40 flex items-center gap-3 animate-pulse"
                >
                  <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
                    <Mic size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-200">Listening to voice input...</h4>
                    <p className="text-[10px] text-slate-300">Speech recognized into Gemini Search</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GEMINI AI QUICK ANSWER CARD */}
            <AnimatePresence mode="wait">
              {(isAiLoading || aiResult) && (
                <motion.div
                  key="ai-result-panel"
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="p-3.5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-purple-950/30 border border-amber-400/30 shadow-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-gradient-to-r from-amber-400 to-purple-500 text-slate-950">
                        <Sparkles size={12} className="fill-slate-950" />
                      </div>
                      <span className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-teal-300 to-purple-300">
                        Gemini AI Intelligence
                      </span>
                    </div>
                    {isAiLoading && (
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                        <Loader2 size={11} className="animate-spin" /> Thinking...
                      </span>
                    )}
                  </div>

                  {isAiLoading ? (
                    <div className="py-4 text-center space-y-2">
                      <Bot size={24} className="mx-auto text-amber-400/80 animate-bounce" />
                      <p className="text-xs text-slate-400 font-medium">Analyzing query & matching system apps...</p>
                    </div>
                  ) : (
                    aiResult && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {aiResult.quickAnswer}
                        </p>

                        {/* SUGGESTED APP CARD IF MATCHED BY AI */}
                        {suggestedApp && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${suggestedApp.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                                <suggestedApp.icon size={18} />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider block">
                                  Recommended App
                                </span>
                                <h4 className="text-xs font-bold text-white truncate">{suggestedApp.name}</h4>
                              </div>
                            </div>

                            <button
                              onClick={() => handleLaunchApp(suggestedApp.id)}
                              className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] cursor-pointer transition-all shrink-0 flex items-center gap-1 shadow-md active:scale-95"
                            >
                              <span>Open</span>
                              <ChevronRight size={13} />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* INSTANT MATCHING APPS GRID */}
            <AnimatePresence mode="wait">
              {query.trim() && (
                <motion.div
                  key="matching-apps-container"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block px-1">
                    Matching Apps ({matchingApps.length})
                  </span>

                  {matchingApps.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {matchingApps.map((app, index) => {
                        const IconComp = app.icon;
                        return (
                          <motion.button
                            key={app.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15, delay: index * 0.03 }}
                            onClick={() => handleLaunchApp(app.id)}
                            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 flex items-center gap-2.5 hover:bg-slate-850 transition-all cursor-pointer text-left group"
                          >
                            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                              <IconComp size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                                {app.name}
                              </h4>
                              <p className="text-[9px] text-slate-400 truncate">{app.category}</p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-xs rounded-2xl bg-slate-900/40 border border-slate-850">
                      No apps directly matching "{query}". Press Enter to ask Gemini AI!
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* SAMPLE SUGGESTIONS WHEN QUERY IS EMPTY */}
            <AnimatePresence mode="wait">
              {!query.trim() && !aiResult && (
                <motion.div
                  key="sample-suggestions-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 pt-1"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
                    <Compass size={12} className="text-amber-400" />
                    <span>Try Quick AI Queries</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sampleQueries.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(sample)}
                        className="py-1.5 px-3 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-400/50 text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 hover:bg-slate-850"
                      >
                        <Zap size={11} className="text-amber-400" />
                        <span>{sample}</span>
                      </button>
                    ))}
                  </div>

                  {/* All Installed Shortcuts Grid */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block px-1">
                      Quick App Launch
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {allApps.slice(0, 8).map((app) => {
                        const IconComponent = app.icon;
                        return (
                          <button
                            key={app.id}
                            onClick={() => handleLaunchApp(app.id)}
                            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center gap-1 text-center cursor-pointer transition-all group"
                          >
                            <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                              <IconComponent size={15} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 truncate max-w-full">
                              {app.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
