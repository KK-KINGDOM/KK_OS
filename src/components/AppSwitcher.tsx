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
  RotateCcw,
  CheckCircle2,
  Info
} from "lucide-react";
import { AppID, LogSeverity } from "../types";
import AppThumbnailPreview from "./AppThumbnailPreview";
import { playClickSound, playAppLaunchSound } from "../utils/sound";

interface AppSwitcherProps {
  recentApps: AppID[];
  activeApp: AppID | null;
  allApps: {
    id: AppID;
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
  }[];
  onSelectApp: (appId: AppID) => void;
  onCloseApp: (appId: AppID) => void;
  onClearAll: () => void;
  onCloseSwitcher: () => void;
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
  [AppID.CALCULATOR]: 25
};

export default function AppSwitcher({
  recentApps,
  activeApp,
  allApps,
  onSelectApp,
  onCloseApp,
  onClearAll,
  onCloseSwitcher,
  ramUsedMB = 3840,
  onSystemLog
}: AppSwitcherProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "stack" | "list">("grid");
  const [pinnedAppIds, setPinnedAppIds] = useState<AppID[]>([]);
  const [clearingAnim, setClearingAnim] = useState(false);
  const [swipedAppId, setSwipedAppId] = useState<AppID | null>(null);

  // Map recent app IDs to full app objects
  const recentAppObjects = recentApps
    .map((id) => allApps.find((app) => app.id === id))
    .filter((app): app is NonNullable<typeof app> => app !== undefined);

  const filteredRecents = recentAppObjects.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePinApp = (e: React.MouseEvent, appId: AppID) => {
    e.stopPropagation();
    playClickSound();
    if (pinnedAppIds.includes(appId)) {
      setPinnedAppIds((prev) => prev.filter((id) => id !== appId));
      onSystemLog?.(`[ActivityManager] Unpinned ${appId} from memory locking.`, "INFO");
    } else {
      setPinnedAppIds((prev) => [...prev, appId]);
      onSystemLog?.(`[ActivityManager] Pinned ${appId} in active memory state.`, "INFO");
    }
  };

  const handleClearAllProtected = () => {
    playClickSound();
    setClearingAnim(true);
    onSystemLog?.(`[ActivityManager] Clearing background tasks (preserving ${pinnedAppIds.length} pinned apps)...`, "INFO");

    setTimeout(() => {
      // Keep pinned apps in recents
      const unpinned = recentApps.filter((id) => !pinnedAppIds.includes(id));
      unpinned.forEach((id) => onCloseApp(id));
      setClearingAnim(false);
      if (pinnedAppIds.length === 0) {
        onClearAll();
      }
    }, 400);
  };

  const handleDragEnd = (appId: AppID, info: { offset: { y: number } }) => {
    // If swiped UP more than 60px, kill/close the app
    if (info.offset.y < -60) {
      playClickSound();
      setSwipedAppId(appId);
      onSystemLog?.(`[ActivityManager] Swipe-up gesture: Killed background task ${appId}`, "INFO");
      setTimeout(() => {
        onCloseApp(appId);
        setSwipedAppId(null);
      }, 200);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl z-45 flex flex-col justify-between p-3 select-none overflow-hidden"
      id="app-switcher-overlay"
    >
      {/* 1. TOP HEADER & RAM MONITOR BAR */}
      <div className="flex flex-col gap-2 pb-2 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-950 border border-teal-500/40 text-teal-400 shadow-sm">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white tracking-wide flex items-center gap-1.5">
                <span>Task Switcher</span>
                <span className="text-[9px] bg-teal-950 border border-teal-800 text-teal-300 font-mono px-1.5 py-0.2 rounded font-bold">
                  {recentApps.length} OPEN
                </span>
              </h3>
              <p className="text-[9px] text-slate-400 font-mono">
                Visual thumbnail previews & task controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => {
                  playClickSound();
                  setViewMode("grid");
                }}
                className={`p-1 rounded-lg text-[10px] transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setViewMode("stack");
                }}
                className={`p-1 rounded-lg text-[10px] transition-colors cursor-pointer ${
                  viewMode === "stack" ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
                title="Deck Stack View"
              >
                <Layers size={13} />
              </button>
              <button
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

            {/* Clear All Apps */}
            {recentApps.length > 0 && (
              <button
                onClick={handleClearAllProtected}
                disabled={clearingAnim}
                className="px-2.5 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-extrabold text-[10px] cursor-pointer transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                title="Clear all unpinned background tasks"
              >
                <Trash2 size={12} className={clearingAnim ? "animate-spin" : ""} />
                <span>Clear All</span>
              </button>
            )}

            {/* Close Switcher */}
            <button
              onClick={() => {
                playClickSound();
                onCloseSwitcher();
              }}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
              title="Close Task Switcher"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* System Memory Usage HUD Meter */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 flex items-center justify-between text-[9px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu size={12} className="text-teal-400" />
            <span>RAM Memory:</span>
            <span className="text-teal-300 font-bold">{(ramUsedMB / 1024).toFixed(1)} GB / 8.0 GB</span>
          </div>
          <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(15, (ramUsedMB / 8192) * 100))}%` }}
            />
          </div>
          <span className="text-slate-400 text-[8.5px]">
            {Math.round(100 - (ramUsedMB / 8192) * 100)}% Free
          </span>
        </div>
      </div>

      {/* 2. OPTIONAL APP SEARCH BAR */}
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

      {/* 3. VISUAL APP THUMBNAIL CARDS CONTAINER */}
      <div className="flex-1 overflow-y-auto my-1.5 pr-0.5 scrollbar-thin">
        {filteredRecents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 shadow-inner">
              <Layers size={32} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-200">No Open Background Applications</h4>
              <p className="text-[10px] text-slate-400 max-w-[210px] mt-1 font-mono">
                Launch apps from the launcher home screen to see visual live thumbnails here.
              </p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
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
                  >
                    {/* Card Top Header */}
                    <div className="p-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className={`h-5 w-5 rounded-lg bg-gradient-to-br ${app.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                          <IconComp size={11} />
                        </div>
                        <span className="text-[10px] font-bold text-white truncate max-w-[70px]">
                          {app.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[7.5px] font-mono text-slate-400 bg-slate-900 px-1 rounded border border-slate-800">
                          {ramMB} MB
                        </span>

                        {/* Pin Button */}
                        <button
                          onClick={(e) => togglePinApp(e, app.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isPinned
                              ? "bg-amber-950 border border-amber-500/50 text-amber-300"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                          title={isPinned ? "Pinned in memory" : "Pin application"}
                        >
                          {isPinned ? <Pin size={10} className="fill-amber-300" /> : <Pin size={10} />}
                        </button>

                        {/* Close Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClickSound();
                            onCloseApp(app.id);
                          }}
                          className="p-1 rounded-md hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Kill process"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Visual Live Thumbnail Canvas Preview */}
                    <div
                      onClick={() => {
                        playAppLaunchSound();
                        onSelectApp(app.id);
                      }}
                      className="h-28 relative overflow-hidden bg-slate-950 border-b border-slate-850 group-hover:brightness-110 transition-all"
                    >
                      <AppThumbnailPreview appId={app.id} appName={app.name} color={app.color} />

                      {/* Hover Resume Action Button */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                        <span className="px-3 py-1 rounded-full bg-teal-400 text-slate-950 text-[10px] font-extrabold shadow-lg flex items-center gap-1 active:scale-95">
                          <Play size={10} className="fill-slate-950" />
                          <span>Resume App</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Bottom Footer */}
                    <div
                      onClick={() => {
                        playAppLaunchSound();
                        onSelectApp(app.id);
                      }}
                      className="p-1.5 bg-slate-900/90 flex items-center justify-between text-[8.5px] font-mono text-slate-400"
                    >
                      <span className="flex items-center gap-1">
                        <Zap size={9} className="text-teal-400" />
                        <span>{isActive ? "Active Now" : "Background"}</span>
                      </span>

                      <span className="text-teal-300 font-bold group-hover:underline flex items-center gap-0.5">
                        <span>TAP TO OPEN</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : viewMode === "stack" ? (
          /* DECK / CAROUSEL STACK VIEW */
          <div className="flex flex-col gap-3 py-2 px-1 items-center">
            <AnimatePresence>
              {filteredRecents.map((app, index) => {
                const IconComp = app.icon;
                const isActive = activeApp === app.id;
                const isPinned = pinnedAppIds.includes(app.id);
                const ramMB = APP_RAM_USAGE[app.id] ?? 90;

                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    drag="y"
                    dragConstraints={{ top: -100, bottom: 0 }}
                    onDragEnd={(_, info) => handleDragEnd(app.id, info)}
                    className={`w-full max-w-xs rounded-2xl border bg-slate-900/95 overflow-hidden flex flex-col shadow-2xl transition-all cursor-pointer ${
                      isActive
                        ? "border-teal-400 ring-2 ring-teal-400/40 shadow-[0_0_25px_rgba(45,212,191,0.35)]"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${app.color} text-white flex items-center justify-center shrink-0`}>
                          <IconComp size={13} />
                        </div>
                        <span className="text-xs font-extrabold text-white">{app.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-mono text-teal-300 bg-teal-950 border border-teal-800 px-1.5 py-0.5 rounded">
                          {ramMB} MB
                        </span>

                        <button
                          onClick={(e) => togglePinApp(e, app.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isPinned ? "text-amber-300" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <Pin size={12} className={isPinned ? "fill-amber-300" : ""} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClickSound();
                            onCloseApp(app.id);
                          }}
                          className="p-1 rounded-md hover:bg-rose-950 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        playAppLaunchSound();
                        onSelectApp(app.id);
                      }}
                      className="h-32 relative bg-slate-950"
                    >
                      <AppThumbnailPreview appId={app.id} appName={app.name} color={app.color} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* COMPACT LIST VIEW */
          <div className="space-y-1.5 pb-2">
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    onClick={() => {
                      playAppLaunchSound();
                      onSelectApp(app.id);
                    }}
                    className={`p-2 rounded-2xl border bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition-all ${
                      isActive ? "border-teal-400 ring-1 ring-teal-400/40" : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shrink-0 shadow`}>
                        <IconComp size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{app.name}</span>
                          {isActive && (
                            <span className="text-[7.5px] bg-teal-950 border border-teal-800 text-teal-300 font-mono px-1 rounded font-bold">
                              ACTIVE
                            </span>
                          )}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-mono">
                          Process: com.kkos.{app.id} • {ramMB} MB RAM
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => togglePinApp(e, app.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isPinned ? "text-amber-300 bg-amber-950" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <Pin size={12} className={isPinned ? "fill-amber-300" : ""} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          onCloseApp(app.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 4. FOOTER SWIPE & INSTRUCTION BAR */}
      <div className="shrink-0 pt-2 border-t border-slate-800 flex flex-col items-center justify-center gap-1 text-[9px] font-mono text-slate-400">
        <div className="w-14 h-1 rounded-full bg-slate-700" />
        <span className="flex items-center gap-1">
          <Sparkles size={10} className="text-teal-400" />
          <span>Swipe up on any card or tap outside to return</span>
        </span>
      </div>
    </motion.div>
  );
}
