import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Clock,
  Sliders,
  Layers,
  Palette,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Grid,
  Zap,
  CheckCircle2,
  X,
  Flame,
  Radio,
  Compass,
  Maximize2
} from "lucide-react";
import { Wallpaper, LogSeverity } from "../types";
import {
  DynamicWallpaperConfig,
  getStoredDynamicConfig,
  saveDynamicConfig,
  getAllAvailableWallpapers,
  getWallpaperById,
  getNextWallpaperId,
  CustomGradient,
  TransitionStyle,
  ParticleEffect
} from "../utils/dynamicWallpaperEngine";
import { WALLPAPER_PATTERNS } from "../utils/theme";
import DynamicWallpaperCanvas from "./DynamicWallpaperCanvas";
import { playClickSound } from "../utils/sound";

interface DynamicWallpaperManagerProps {
  currentWallpaperId: string;
  onWallpaperChange: (id: string) => void;
  onClose?: () => void;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
}

export default function DynamicWallpaperManager({
  currentWallpaperId,
  onWallpaperChange,
  onClose,
  onSystemLog
}: DynamicWallpaperManagerProps) {
  const [config, setConfig] = useState<DynamicWallpaperConfig>(() => getStoredDynamicConfig());
  const [activeTab, setActiveTab] = useState<"presets" | "custom_studio" | "settings">("presets");
  const [filterCategory, setFilterCategory] = useState<"all" | "abstract" | "gradient" | "custom">("all");
  const [countdown, setCountdown] = useState<number>(config.intervalSeconds);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Custom Gradient Studio State
  const [studioName, setStudioName] = useState("My Abstract Aurora");
  const [studioType, setStudioType] = useState<"linear" | "radial" | "conic">("linear");
  const [studioAngle, setStudioAngle] = useState<number>(135);
  const [studioColorStart, setStudioColorStart] = useState("#0f172a");
  const [studioColorMid, setStudioColorMid] = useState("#581c87");
  const [studioColorEnd, setStudioColorEnd] = useState("#0369a1");
  const [studioPattern, setStudioPattern] = useState("grid");

  // Save config changes whenever updated
  const updateConfig = (newConfig: Partial<DynamicWallpaperConfig>) => {
    setConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      saveDynamicConfig(merged);
      return merged;
    });
  };

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 2600);
  };

  // Auto-Cycle Timer Hook
  useEffect(() => {
    if (!config.enabled || config.isPaused) {
      setCountdown(config.intervalSeconds);
      return;
    }

    setCountdown(config.intervalSeconds);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger next wallpaper transition
          const nextId = getNextWallpaperId(currentWallpaperId, config, "next");
          if (nextId && nextId !== currentWallpaperId) {
            onWallpaperChange(nextId);
            const wp = getWallpaperById(nextId, config.customGradients);
            onSystemLog?.(`[DynamicWallpaper] Auto-cycled wallpaper to: ${wp.name} (${wp.category})`, "INFO");
          }
          return config.intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    config.enabled,
    config.isPaused,
    config.intervalSeconds,
    config.shuffle,
    config.activePlaylist,
    config.categoryFilter,
    config.customGradients,
    currentWallpaperId,
    onWallpaperChange,
    onSystemLog
  ]);

  // All Available Wallpapers
  const allWallpapers = useMemo(() => {
    return getAllAvailableWallpapers(config.customGradients);
  }, [config.customGradients]);

  // Filtered Wallpapers
  const filteredWallpapers = useMemo(() => {
    if (filterCategory === "all") return allWallpapers;
    return allWallpapers.filter((w) => w.category === filterCategory);
  }, [allWallpapers, filterCategory]);

  const activeWallpaper = useMemo(() => {
    return getWallpaperById(currentWallpaperId, config.customGradients);
  }, [currentWallpaperId, config.customGradients]);

  // Manual Transition Controls
  const handleCycleNext = () => {
    playClickSound();
    const nextId = getNextWallpaperId(currentWallpaperId, config, "next");
    onWallpaperChange(nextId);
    setCountdown(config.intervalSeconds);
    const wp = getWallpaperById(nextId, config.customGradients);
    showToast(`⏩ Cycled to: ${wp.name}`);
    onSystemLog?.(`[DynamicWallpaper] Manually cycled forward to: ${wp.name}`, "INFO");
  };

  const handleCyclePrev = () => {
    playClickSound();
    const prevId = getNextWallpaperId(currentWallpaperId, config, "prev");
    onWallpaperChange(prevId);
    setCountdown(config.intervalSeconds);
    const wp = getWallpaperById(prevId, config.customGradients);
    showToast(`⏪ Cycled to: ${wp.name}`);
    onSystemLog?.(`[DynamicWallpaper] Manually cycled backward to: ${wp.name}`, "INFO");
  };

  const handleTogglePlaylistMembership = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const inPlaylist = config.activePlaylist.includes(id);
    let newPlaylist: string[];
    if (inPlaylist) {
      if (config.activePlaylist.length <= 1) {
        showToast("⚠️ Playlist must contain at least 1 wallpaper!");
        return;
      }
      newPlaylist = config.activePlaylist.filter((wId) => wId !== id);
      showToast("Removed from cycle playlist");
    } else {
      newPlaylist = [...config.activePlaylist, id];
      showToast("Added to cycle playlist");
    }
    updateConfig({ activePlaylist: newPlaylist });
  };

  const handleSelectAllToPlaylist = () => {
    playClickSound();
    const allIds = allWallpapers.map((w) => w.id);
    updateConfig({ activePlaylist: allIds });
    showToast(`✨ Added all ${allIds.length} wallpapers to cycle!`);
  };

  const handleSaveCustomGradient = () => {
    playClickSound();
    const newGradient: CustomGradient = {
      id: `custom_gradient_${Date.now()}`,
      name: studioName.trim() || "Custom Gradient",
      type: studioType,
      angle: studioAngle,
      colorStart: studioColorStart,
      colorMid: studioColorMid || undefined,
      colorEnd: studioColorEnd,
      patternId: studioPattern,
      createdAt: Date.now()
    };

    const updatedCustomList = [newGradient, ...config.customGradients];
    const updatedPlaylist = [newGradient.id, ...config.activePlaylist];

    updateConfig({
      customGradients: updatedCustomList,
      activePlaylist: updatedPlaylist
    });

    onWallpaperChange(newGradient.id);
    showToast(`🎨 Created & applied "${newGradient.name}"!`);
    onSystemLog?.(`[DynamicWallpaper] Created custom abstract wallpaper "${newGradient.name}"`, "INFO");
    setActiveTab("presets");
  };

  const handleDeleteCustomGradient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const updatedCustom = config.customGradients.filter((cg) => cg.id !== id);
    const updatedPlaylist = config.activePlaylist.filter((wId) => wId !== id);
    updateConfig({
      customGradients: updatedCustom,
      activePlaylist: updatedPlaylist
    });

    if (currentWallpaperId === id) {
      onWallpaperChange("cosmic_slate");
    }
    showToast("Deleted custom wallpaper");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden" id="dynamic-wallpaper-manager">
      {/* HEADER BAR */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <Sparkles size={16} className="animate-spin" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              Dynamic Wallpaper Engine
              <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-mono font-bold uppercase border ${
                config.enabled
                  ? "bg-emerald-950 text-emerald-300 border-emerald-700 animate-pulse"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}>
                {config.enabled ? (config.isPaused ? "PAUSED" : "ACTIVE") : "MANUAL"}
              </span>
            </h2>
            <p className="text-[9.5px] text-slate-400 font-mono">
              Smooth cross-fade transitions & abstract pattern cycler
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-750 cursor-pointer transition-colors"
            title="Close Wallpaper Manager"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* QUICK TOAST BANNER */}
      {actionMessage && (
        <div className="bg-cyan-950/90 border-b border-cyan-500/50 py-1 px-3 text-center text-[10px] font-bold text-cyan-200 font-mono animate-in fade-in duration-150 shrink-0">
          {actionMessage}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-none">
        {/* HERO INTERACTIVE PHONE PREVIEW & PLAYBACK CONTROLLER */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={12} className="text-cyan-400" />
              Live Screen Cross-fade Preview
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                {config.transitionStyle} ({config.transitionDurationSec}s)
              </span>
            </div>
          </div>

          {/* Mini Phone Canvas Container */}
          <div className="h-44 w-full rounded-2xl relative overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between p-3">
            {/* Embedded Live Wallpaper Canvas */}
            <div className="absolute inset-0">
              <DynamicWallpaperCanvas
                currentWallpaperId={currentWallpaperId}
                config={config}
                patternOverlayId={config.patternOverlayId}
              />
            </div>

            {/* Top Status Simulation */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-extrabold text-white drop-shadow-md">
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                <Clock size={11} className="text-cyan-300" />
                <span>10:45</span>
              </div>

              {/* Countdown Circular Badge */}
              {config.enabled && !config.isPaused && (
                <div className="flex items-center gap-1.5 bg-cyan-950/90 backdrop-blur-md border border-cyan-500/80 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[9px] text-cyan-200 font-mono font-black">
                    Next in {countdown}s
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Wallpaper Info & Instant Controls */}
            <div className="relative z-10 flex items-center justify-between bg-black/75 backdrop-blur-md p-2 rounded-xl border border-white/15">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-black text-white truncate block">
                  {activeWallpaper.name}
                </span>
                <span className="text-[8.5px] font-mono text-cyan-300 capitalize truncate block">
                  {activeWallpaper.category || "Preset Gradient"} • {config.activePlaylist.length} in cycle
                </span>
              </div>

              {/* Playback Button Deck */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleCyclePrev}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer active:scale-95 transition-all"
                  title="Previous Wallpaper"
                >
                  <SkipBack size={13} />
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    updateConfig({ isPaused: !config.isPaused });
                    showToast(config.isPaused ? "▶️ Dynamic Cycle Resumed" : "⏸️ Dynamic Cycle Paused");
                  }}
                  className={`p-1.5 rounded-lg border cursor-pointer active:scale-95 transition-all font-bold ${
                    !config.isPaused && config.enabled
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                  title={config.isPaused ? "Resume Cycle" : "Pause Cycle"}
                >
                  {!config.isPaused && config.enabled ? <Pause size={13} /> : <Play size={13} />}
                </button>

                <button
                  onClick={handleCycleNext}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer active:scale-95 transition-all"
                  title="Next Wallpaper"
                >
                  <SkipForward size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Master Auto-Cycle Toggle Bar */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${config.enabled ? "bg-cyan-950 text-cyan-400 border-cyan-800" : "bg-slate-900 text-slate-500 border-slate-800"}`}>
                <RefreshCw size={15} className={config.enabled && !config.isPaused ? "animate-spin" : ""} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Automatic Wallpaper Rotation</h4>
                <p className="text-[9px] text-slate-400">
                  {config.enabled
                    ? `Cycles every ${config.intervalSeconds}s • ${config.shuffle ? "Randomized" : "Sequential"}`
                    : "Automatic cycle is currently turned off"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                const nextState = !config.enabled;
                updateConfig({ enabled: nextState });
                showToast(nextState ? "✨ Dynamic Auto-Cycle ENABLED" : "Dynamic Auto-Cycle Disabled");
                onSystemLog?.(`[DynamicWallpaper] Auto-cycle toggled ${nextState ? "ON" : "OFF"}`, "INFO");
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                config.enabled
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Zap size={12} className={config.enabled ? "fill-slate-950" : ""} />
              <span>{config.enabled ? "Active" : "Enable"}</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("presets")}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "presets"
                ? "bg-cyan-500 text-slate-950 font-extrabold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers size={13} />
            <span>Playlist & Presets</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-cyan-500 text-slate-950 font-extrabold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders size={13} />
            <span>Transition & FX</span>
          </button>

          <button
            onClick={() => setActiveTab("custom_studio")}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "custom_studio"
                ? "bg-cyan-500 text-slate-950 font-extrabold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Palette size={13} />
            <span>Gradient Studio</span>
          </button>
        </div>

        {/* TAB 1: PRESETS & PLAYLIST EXPLORER */}
        {activeTab === "presets" && (
          <div className="space-y-3">
            {/* Category Filter Pills & Bulk Controls */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none text-[9.5px]">
              <div className="flex items-center gap-1">
                {(["all", "abstract", "gradient", "custom"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg border font-bold capitalize transition-all cursor-pointer ${
                      filterCategory === cat
                        ? "bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat === "all" ? `All (${allWallpapers.length})` : cat}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSelectAllToPlaylist}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 font-bold shrink-0 cursor-pointer transition-colors"
                title="Select all wallpapers into cycle playlist"
              >
                + Add All to Cycle
              </button>
            </div>

            {/* Wallpaper Grid Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredWallpapers.map((wp) => {
                const isActive = currentWallpaperId === wp.id;
                const isInPlaylist = config.activePlaylist.includes(wp.id);

                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      playClickSound();
                      onWallpaperChange(wp.id);
                      setCountdown(config.intervalSeconds);
                      showToast(`Applied: ${wp.name}`);
                      onSystemLog?.(`[DynamicWallpaper] Applied wallpaper: ${wp.name}`, "INFO");
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer relative group active:scale-98 ${
                      isActive
                        ? "bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Visual Card Artwork */}
                    <div
                      className={`h-24 w-full rounded-xl ${wp.className} relative flex flex-col justify-between p-2 shadow-inner overflow-hidden border border-white/10`}
                      style={{
                        ...(wp.imageUrl
                          ? {
                              backgroundImage: `url(${wp.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center"
                            }
                          : wp.customStyle || {})
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono font-bold bg-black/70 text-white backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 capitalize">
                          {wp.category || "Preset"}
                        </span>

                        {/* Playlist Toggle Checkbox Button */}
                        <button
                          onClick={(e) => handleTogglePlaylistMembership(wp.id, e)}
                          className={`p-1 rounded-md border backdrop-blur-md cursor-pointer transition-transform active:scale-90 ${
                            isInPlaylist
                              ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow"
                              : "bg-black/60 text-slate-400 border-white/20 hover:text-white"
                          }`}
                          title={isInPlaylist ? "In Auto-Cycle Playlist" : "Click to add to cycle playlist"}
                        >
                          <Check size={11} className={isInPlaylist ? "stroke-[3]" : "opacity-40"} />
                        </button>
                      </div>

                      {/* Active Indicator Badge */}
                      {isActive && (
                        <div className="self-start px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[8px] font-black uppercase tracking-tight shadow-md flex items-center gap-1">
                          <Check size={10} className="font-extrabold" />
                          <span>CURRENT</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between min-w-0">
                      <div className="min-w-0 pr-1">
                        <h4 className="text-xs font-extrabold text-white truncate">{wp.name}</h4>
                        <p className="text-[9px] text-slate-400 truncate">{wp.description || "Procedural wallpaper"}</p>
                      </div>

                      {wp.category === "custom" && (
                        <button
                          onClick={(e) => handleDeleteCustomGradient(wp.id, e)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 cursor-pointer transition-colors"
                          title="Delete Custom Wallpaper"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TRANSITION SETTINGS & FX CONTROLS */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            {/* 1. Cycle Interval Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Clock size={14} className="text-cyan-400" />
                  Auto-Cycle Frequency
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">
                  {config.intervalSeconds} seconds
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1 text-[9.5px] font-mono font-bold">
                {[5, 10, 30, 60, 300, 900].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      playClickSound();
                      updateConfig({ intervalSeconds: sec });
                      setCountdown(sec);
                      showToast(`Interval set to ${sec}s`);
                    }}
                    className={`py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      config.intervalSeconds === sec
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                  </button>
                ))}
              </div>
              <p className="text-[8.5px] font-mono text-slate-400">
                Tip: Choose <strong className="text-cyan-300 font-mono">5s</strong> or <strong className="text-cyan-300 font-mono">10s</strong> for fast live cycling demonstrations.
              </p>
            </div>

            {/* 2. Transition Animation Style */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  Fade Transition Style
                </span>
                <span className="text-[9.5px] font-mono text-amber-300 capitalize font-bold">
                  {config.transitionStyle}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                {[
                  { id: "crossfade", name: "Smooth Cross-fade", desc: "Soft opacity dissolve" },
                  { id: "zoom-fade", name: "Zoom & Fade", desc: "Scale bloom transition" },
                  { id: "drift", name: "Cinematic Drift", desc: "Horizontal pan slide" },
                  { id: "blur-fade", name: "Ambient Blur Fade", desc: "Gaussian optical dissolve" }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      playClickSound();
                      updateConfig({ transitionStyle: style.id as TransitionStyle });
                      showToast(`Transition set: ${style.name}`);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      config.transitionStyle === style.id
                        ? "bg-amber-950/80 border-amber-500 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-white font-extrabold">{style.name}</div>
                    <div className="text-[8.5px] text-slate-400">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Transition Duration Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-white">
                <span>Transition Duration Speed</span>
                <span className="font-mono text-cyan-400">{config.transitionDurationSec}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={config.transitionDurationSec}
                onChange={(e) => updateConfig({ transitionDurationSec: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                <span>Fast (0.5s)</span>
                <span>Smooth (1.2s)</span>
                <span>Cinematic (2.5s)</span>
              </div>
            </div>

            {/* 4. Pattern Overlay Mesh Picker */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Grid size={14} className="text-teal-400" />
                  Pattern Mesh Overlay
                </span>
                <span className="text-[9.5px] font-mono text-teal-300">
                  {WALLPAPER_PATTERNS.find((p) => p.id === config.patternOverlayId)?.name || "Grid"}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold">
                {WALLPAPER_PATTERNS.slice(0, 8).map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => {
                      playClickSound();
                      updateConfig({ patternOverlayId: pattern.id });
                      showToast(`Pattern: ${pattern.name}`);
                    }}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer truncate ${
                      config.patternOverlayId === pattern.id
                        ? "bg-teal-950 border-teal-400 text-teal-200 font-black shadow"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {pattern.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Particle Atmosphere Layer */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-400" />
                  Ambient Particle Atmosphere
                </span>
                <span className="text-[9.5px] font-mono text-purple-300 capitalize font-bold">
                  {config.particleEffect}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-[9.5px] font-bold">
                {[
                  { id: "none", name: "Clean None" },
                  { id: "sparkles", name: "Cosmic Stars" },
                  { id: "orbs", name: "Floating Orbs" },
                  { id: "cyber-grid", name: "Cyber Matrix" },
                  { id: "aurora", name: "Aurora Shimmer" }
                ].map((fx) => (
                  <button
                    key={fx.id}
                    onClick={() => {
                      playClickSound();
                      updateConfig({ particleEffect: fx.id as ParticleEffect });
                      showToast(`Ambient FX: ${fx.name}`);
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      config.particleEffect === fx.id
                        ? "bg-purple-950 border-purple-400 text-purple-200 font-extrabold shadow"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {fx.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Shuffle Switch */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle size={15} className={config.shuffle ? "text-cyan-400" : "text-slate-500"} />
                <div>
                  <h5 className="text-xs font-bold text-white">Shuffle Mode</h5>
                  <p className="text-[8.5px] text-slate-400">Randomize cycle order instead of sequential list</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  updateConfig({ shuffle: !config.shuffle });
                  showToast(config.shuffle ? "Sequential mode enabled" : "🔀 Shuffle mode enabled");
                }}
                className={`px-3 py-1 rounded-xl text-[9.5px] font-bold border transition-all cursor-pointer ${
                  config.shuffle
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow"
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}
              >
                {config.shuffle ? "Shuffled" : "Sequential"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM GRADIENT & ABSTRACT STUDIO */}
        {activeTab === "custom_studio" && (
          <div className="space-y-4">
            {/* Live Studio Canvas Preview */}
            <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Live Studio Generator Preview
              </span>

              <div
                className="h-32 w-full rounded-2xl relative p-3 flex flex-col justify-between border border-white/20 shadow-xl overflow-hidden"
                style={{
                  background:
                    studioType === "radial"
                      ? `radial-gradient(circle at center, ${studioColorStart}, ${studioColorMid ? `${studioColorMid}, ` : ""}${studioColorEnd})`
                      : studioType === "conic"
                      ? `conic-gradient(from ${studioAngle}deg at 50% 50%, ${studioColorStart}, ${studioColorMid ? `${studioColorMid}, ` : ""}${studioColorEnd})`
                      : `linear-gradient(${studioAngle}deg, ${studioColorStart}, ${studioColorMid ? `${studioColorMid}, ` : ""}${studioColorEnd})`
                }}
              >
                {/* Pattern preview overlay */}
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: WALLPAPER_PATTERNS.find((p) => p.id === studioPattern)?.cssPattern
                  }}
                />

                <div className="relative z-10 flex justify-between items-center text-[9px] font-mono font-bold text-white/90">
                  <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">{studioName}</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs uppercase">{studioType} {studioAngle}°</span>
                </div>
              </div>
            </div>

            {/* Controls Form */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              {/* Wallpaper Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Wallpaper Title</label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Neon Horizon Surge"
                />
              </div>

              {/* Gradient Geometry Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Geometry Mode</label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  {(["linear", "radial", "conic"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setStudioType(t)}
                      className={`py-1.5 rounded-xl border capitalize transition-all cursor-pointer ${
                        studioType === t
                          ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Stops Pickers */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 block truncate">Color 1 (Start)</label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={studioColorStart}
                      onChange={(e) => setStudioColorStart(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[9px] font-mono text-slate-300 truncate">{studioColorStart}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 block truncate">Color 2 (Mid)</label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={studioColorMid}
                      onChange={(e) => setStudioColorMid(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[9px] font-mono text-slate-300 truncate">{studioColorMid}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 block truncate">Color 3 (End)</label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={studioColorEnd}
                      onChange={(e) => setStudioColorEnd(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[9px] font-mono text-slate-300 truncate">{studioColorEnd}</span>
                  </div>
                </div>
              </div>

              {/* Angle Slider */}
              {studioType !== "radial" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span>Angle Direction</span>
                    <span className="font-bold text-cyan-400">{studioAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={studioAngle}
                    onChange={(e) => setStudioAngle(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Action Save Button */}
              <button
                onClick={handleSaveCustomGradient}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all mt-2"
              >
                <Plus size={15} />
                <span>Save to Collection & Add to Cycle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
