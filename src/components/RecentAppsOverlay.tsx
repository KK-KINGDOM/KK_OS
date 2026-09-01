import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trash2,
  Search,
  Sparkles,
  Layers,
  LayoutGrid,
  Maximize2,
  Pin,
  PinOff,
  Cpu,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  ExternalLink,
  Split,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { AppID, LogSeverity } from "../types";
import AppThumbnailPreview from "./AppThumbnailPreview";
import { playClickSound, playAppLaunchSound } from "../utils/sound";

export interface RecentAppsOverlayProps {
  isOpen: boolean;
  recentApps: AppID[];
  activeApp: AppID | null;
  allApps: {
    id: AppID;
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    category?: string;
  }[];
  onSelectApp: (appId: AppID) => void;
  onCloseApp: (appId: AppID) => void;
  onClearAll: () => void;
  onClose: () => void;
  ramUsedMB?: number;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
}

// Estimated RAM usage map for thumbnail cards
const APP_RAM_USAGE: Partial<Record<AppID, number>> = {
  [AppID.CHATGPT]: 185,
  [AppID.CLAUDE]: 190,
  [AppID.GEMINI]: 210,
  [AppID.GROK]: 175,
  [AppID.BROWSER]: 280,
  [AppID.DRIVE]: 160,
  [AppID.SHEETS]: 145,
  [AppID.SLIDES]: 170,
  [AppID.DOCS]: 130,
  [AppID.MEET]: 320,
  [AppID.CAMERA]: 240,
  [AppID.GALLERY]: 210,
  [AppID.MUSIC]: 120,
  [AppID.TASK_MANAGER]: 95,
  [AppID.TERMINAL]: 65,
  [AppID.SETTINGS]: 85,
  [AppID.SECURITY]: 75,
  [AppID.MESSAGES]: 60,
  [AppID.PHONE]: 45,
  [AppID.WEATHER]: 50,
  [AppID.CLOCK]: 35,
  [AppID.CALCULATOR]: 25,
  [AppID.CHESS]: 90,
  [AppID.PUZZLE_GAME]: 85,
  [AppID.BRAIN_TRAINING]: 95,
  [AppID.ACC_MONITOR]: 70,
  [AppID.NOTES]: 40,
  [AppID.PDF_READER]: 110,
  [AppID.TRANSLATOR]: 65,
  [AppID.VOICE_RECORDER]: 55,
  [AppID.DICTIONARY]: 50,
  [AppID.EMERGENCY_SOS]: 35,
  [AppID.QR_SCANNER]: 80
};

export default function RecentAppsOverlay({
  isOpen,
  recentApps,
  activeApp,
  allApps,
  onSelectApp,
  onCloseApp,
  onClearAll,
  onClose,
  ramUsedMB = 3840,
  onSystemLog
}: RecentAppsOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "grid" | "list">("cards");
  const [pinnedAppIds, setPinnedAppIds] = useState<AppID[]>([]);
  const [clearingAnim, setClearingAnim] = useState(false);
  const [swipedAppId, setSwipedAppId] = useState<AppID | null>(null);

  if (!isOpen) return null;

  // Map recent app IDs to full app objects
  const recentAppObjects = recentApps
    .map((id) => allApps.find((app) => app.id === id))
    .filter((app): app is NonNullable<typeof app> => app !== undefined);

  const filteredRecents = recentAppObjects.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.category && app.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const togglePinApp = (e: React.MouseEvent, appId: AppID) => {
    e.stopPropagation();
    playClickSound();
    if (pinnedAppIds.includes(appId)) {
      setPinnedAppIds((prev) => prev.filter((id) => id !== appId));
      onSystemLog?.(`[RecentApps] Unlocked ${appId} from memory pin.`, "INFO");
    } else {
      setPinnedAppIds((prev) => [...prev, appId]);
      onSystemLog?.(`[RecentApps] Pinned ${appId} in active background memory.`, "INFO");
    }
  };

  const handleClearAllProtected = () => {
    playClickSound();
    setClearingAnim(true);
    onSystemLog?.(`[RecentApps] Clearing background tasks (preserving ${pinnedAppIds.length} locked apps)...`, "INFO");

    setTimeout(() => {
      const unpinned = recentApps.filter((id) => !pinnedAppIds.includes(id));
      unpinned.forEach((id) => onCloseApp(id));
      setClearingAnim(false);
      if (pinnedAppIds.length === 0) {
        onClearAll();
      }
    }, 350);
  };

  const handleDragEnd = (appId: AppID, info: { offset: { y: number } }) => {
    // If swiped UP more than 55px, kill/close the app card
    if (info.offset.y < -55) {
      playClickSound();
      setSwipedAppId(appId);
      onSystemLog?.(`[RecentApps] Swipe gesture closed background app: ${appId}`, "INFO");
      setTimeout(() => {
        onCloseApp(appId);
        setSwipedAppId(null);
      }, 180);
    }
  };

  const getRelativeTimeString = (index: number) => {
    if (index === 0) return "Active now";
    if (index === 1) return "1m ago";
    if (index === 2) return "4m ago";
    if (index === 3) return "12m ago";
    return `${index * 5}m ago`;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="recent-apps-overlay"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="absolute inset-0 bg-slate-950/92 backdrop-blur-2xl z-45 flex flex-col justify-between p-3 select-none overflow-hidden"
        id="recent-apps-overlay"
      >
        {/* TOP HEADER: Task Switcher Navigation Bar & RAM Meter */}
        <div className="flex flex-col gap-2 pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-teal-950 border border-teal-500/50 text-teal-300 shadow-xs">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                  <span>Recent Apps</span>
                  <span className="text-[8.5px] bg-teal-950/90 border border-teal-700/80 text-teal-300 font-mono px-1.5 py-0.2 rounded font-bold">
                    {recentApps.length} OPEN
                  </span>
                </h3>
                <p className="text-[8.5px] text-slate-400 font-mono">
                  Swipe up to close • Tap card to switch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* View Mode Layout Switcher */}
              <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setViewMode("cards");
                  }}
                  className={`p-1 rounded-lg text-[10px] transition-colors cursor-pointer ${
                    viewMode === "cards" ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                  title="Card Deck Carousel View"
                >
                  <Layers size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setViewMode("grid");
                  }}
                  className={`p-1 rounded-lg text-[10px] transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                  title="2-Column Grid View"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setViewMode("list");
                  }}
                  className={`p-1 rounded-lg text-[10px] transition-colors cursor-pointer ${
                    viewMode === "list" ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                  title="Compact List View"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              {/* Close Overlay */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
                title="Dismiss Recent Apps"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* System Memory & Active Tasks Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 flex items-center justify-between text-[9px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Cpu size={12} className="text-teal-400" />
              <span>RAM in use:</span>
              <span className="text-teal-300 font-bold">{(ramUsedMB / 1024).toFixed(1)} GB / 8.0 GB</span>
            </div>
            <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(15, (ramUsedMB / 8192) * 100))}%` }}
              />
            </div>
            <span className="text-slate-400 text-[8px]">
              {Math.round(100 - (ramUsedMB / 8192) * 100)}% Free
            </span>
          </div>
        </div>

        {/* SEARCH BAR (Visible if more than 2 apps) */}
        {recentApps.length > 2 && (
          <div className="my-1.5 relative shrink-0">
            <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search open applications..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500 font-mono"
            />
          </div>
        )}

        {/* CARD CONTAINER / SWITCHER BODY */}
        <div className="flex-1 overflow-y-auto my-1.5 pr-0.5 scrollbar-thin flex flex-col justify-center">
          {filteredRecents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 text-slate-500 shadow-inner">
                <Layers size={32} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-200">No Recent Applications</h4>
                <p className="text-[10px] text-slate-400 max-w-[220px] mt-1 font-mono">
                  Launch applications from your home screen or drawer to switch between them here.
                </p>
              </div>
            </div>
          ) : viewMode === "cards" ? (
            /* 1. HORIZONTAL CAROUSEL CARD DECK VIEW (DEFAULT MULTITASKING) */
            <div className="flex gap-3.5 overflow-x-auto py-3 px-2 snap-x snap-mandatory scrollbar-none items-center">
              <AnimatePresence>
                {filteredRecents.map((app, index) => {
                  const IconComp = app.icon;
                  const isActive = activeApp === app.id;
                  const isPinned = pinnedAppIds.includes(app.id);
                  const ramMB = APP_RAM_USAGE[app.id] ?? 85;

                  return (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, y: -70, scale: 0.8 }}
                      drag="y"
                      dragConstraints={{ top: -140, bottom: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(_, info) => handleDragEnd(app.id, info)}
                      className={`snap-center shrink-0 w-[205px] h-[285px] rounded-3xl border bg-slate-900/95 overflow-hidden flex flex-col shadow-2xl transition-all duration-200 cursor-pointer relative group ${
                        swipedAppId === app.id ? "opacity-25 scale-90" : ""
                      } ${
                        isActive
                          ? "border-teal-400 ring-2 ring-teal-400/50 shadow-[0_0_25px_rgba(45,212,191,0.35)]"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                      onClick={() => {
                        playAppLaunchSound();
                        onSelectApp(app.id);
                      }}
                    >
                      {/* Card Header Bar */}
                      <div className="p-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`h-6 w-6 rounded-xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                            <IconComp size={13} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-bold text-white truncate max-w-[85px]">
                              {app.name}
                            </span>
                            <span className="text-[7.5px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock size={8} />
                              <span>{getRelativeTimeString(index)}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Pin / Lock Button */}
                          <button
                            type="button"
                            onClick={(e) => togglePinApp(e, app.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isPinned
                                ? "bg-amber-950 border border-amber-500/50 text-amber-300"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-850"
                            }`}
                            title={isPinned ? "Locked in RAM" : "Lock in RAM"}
                          >
                            {isPinned ? <Pin size={11} className="fill-amber-300" /> : <Pin size={11} />}
                          </button>

                          {/* Close / Dismiss Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playClickSound();
                              onCloseApp(app.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Close app task"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Card Visual Preview Canvas */}
                      <div className="flex-1 relative overflow-hidden bg-slate-950">
                        <AppThumbnailPreview appId={app.id} appName={app.name} color={app.color} />

                        {/* Quick Switch Overlay on Hover */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                          <span className="px-3 py-1.5 rounded-full bg-teal-400 text-slate-950 text-[10px] font-extrabold shadow-lg flex items-center gap-1.5 active:scale-95">
                            <Play size={11} className="fill-slate-950" />
                            <span>Switch to App</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Bar */}
                      <div className="p-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Zap size={9.5} className="text-teal-400" />
                          <span>{ramMB} MB</span>
                        </span>
                        <span className="text-teal-300 font-bold flex items-center gap-0.5 group-hover:underline">
                          <span>RESUME</span>
                          <ArrowRight size={10} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : viewMode === "grid" ? (
            /* 2. 2-COLUMN GRID VIEW */
            <div className="grid grid-cols-2 gap-3 pb-2">
              <AnimatePresence>
                {filteredRecents.map((app) => {
                  const IconComp = app.icon;
                  const isActive = activeApp === app.id;
                  const isPinned = pinnedAppIds.includes(app.id);
                  const ramMB = APP_RAM_USAGE[app.id] ?? 90;

                  return (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, y: -40, scale: 0.8 }}
                      drag="y"
                      dragConstraints={{ top: -120, bottom: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(_, info) => handleDragEnd(app.id, info)}
                      className={`group relative rounded-2xl border bg-slate-900/90 overflow-hidden flex flex-col shadow-xl transition-all duration-200 cursor-pointer ${
                        swipedAppId === app.id ? "opacity-30 scale-90" : ""
                      } ${
                        isActive
                          ? "border-teal-400 ring-2 ring-teal-400/40 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                      onClick={() => {
                        playAppLaunchSound();
                        onSelectApp(app.id);
                      }}
                    >
                      {/* Card Header */}
                      <div className="p-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`h-5 w-5 rounded-lg bg-gradient-to-br ${app.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                            <IconComp size={11} />
                          </div>
                          <span className="text-[10px] font-bold text-white truncate max-w-[70px]">
                            {app.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => togglePinApp(e, app.id)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              isPinned
                                ? "bg-amber-950 border border-amber-500/50 text-amber-300"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                            title={isPinned ? "Pinned in RAM" : "Pin application"}
                          >
                            {isPinned ? <Pin size={10} className="fill-amber-300" /> : <Pin size={10} />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playClickSound();
                              onCloseApp(app.id);
                            }}
                            className="p-1 rounded-md hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Kill task"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Live Thumbnail Canvas */}
                      <div className="h-28 relative overflow-hidden bg-slate-950 border-b border-slate-850">
                        <AppThumbnailPreview appId={app.id} appName={app.name} color={app.color} />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                          <span className="px-2.5 py-1 rounded-full bg-teal-400 text-slate-950 text-[9.5px] font-extrabold shadow-lg flex items-center gap-1 active:scale-95">
                            <Play size={10} className="fill-slate-950" />
                            <span>Switch</span>
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-1.5 bg-slate-900/90 flex items-center justify-between text-[8.5px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Zap size={9} className="text-teal-400" />
                          <span>{ramMB} MB</span>
                        </span>
                        <span className="text-teal-300 font-bold group-hover:underline">
                          RESUME
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            /* 3. COMPACT LIST VIEW */
            <div className="flex flex-col gap-2 py-1">
              <AnimatePresence>
                {filteredRecents.map((app) => {
                  const IconComp = app.icon;
                  const isActive = activeApp === app.id;
                  const isPinned = pinnedAppIds.includes(app.id);
                  const ramMB = APP_RAM_USAGE[app.id] ?? 90;

                  return (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      onClick={() => {
                        playAppLaunchSound();
                        onSelectApp(app.id);
                      }}
                      className={`p-2 rounded-2xl border bg-slate-900/90 hover:bg-slate-850 flex items-center justify-between gap-2 shadow transition-all cursor-pointer ${
                        isActive
                          ? "border-teal-400 ring-2 ring-teal-400/30"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                          <IconComp size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">
                            {app.name}
                          </span>
                          <span className="text-[8.5px] font-mono text-slate-400">
                            {app.category || "Utility"} • {ramMB} MB RAM
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => togglePinApp(e, app.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isPinned
                              ? "bg-amber-950 border border-amber-500/50 text-amber-300"
                              : "text-slate-500 hover:text-slate-300 bg-slate-800/60"
                          }`}
                        >
                          <Pin size={12} className={isPinned ? "fill-amber-300" : ""} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playClickSound();
                            onCloseApp(app.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION FOOTER: Clear All & Switch Controls */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          {recentApps.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllProtected}
              disabled={clearingAnim}
              className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-extrabold text-[10.5px] cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Clear all unpinned background tasks"
            >
              <Trash2 size={13} className={clearingAnim ? "animate-spin" : ""} />
              <span>Clear All ({recentApps.filter((id) => !pinnedAppIds.includes(id)).length})</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[9px] font-mono text-slate-400">
              {pinnedAppIds.length > 0 ? `🔒 ${pinnedAppIds.length} locked` : "Tip: Tap card to switch"}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
