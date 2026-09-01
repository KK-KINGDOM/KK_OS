import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Battery,
  BatteryCharging,
  Zap,
  Calendar,
  Clock,
  ZapOff,
  Sparkles,
  ShieldAlert,
  Sun,
  Activity,
  Palette,
  RefreshCw
} from "lucide-react";
import { AppID, LogSeverity } from "../types";

export interface HomeScreenWidgetProps {
  currentTime?: string;
  batteryLevel: number;
  isChargingActive: boolean;
  isBatterySaver?: boolean;
  onToggleBatterySaver?: (saver: boolean) => void;
  onToggleCharging?: () => void;
  onOpenApp?: (appId: AppID) => void;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
  onCycleWallpaper?: () => void;
  onOpenWallpaperManager?: () => void;
  currentWallpaperName?: string;
  dynamicAutoCycleActive?: boolean;
}

export default function HomeScreenWidget({
  currentTime,
  batteryLevel,
  isChargingActive,
  isBatterySaver = false,
  onToggleBatterySaver,
  onToggleCharging,
  onOpenApp,
  onSystemLog,
  onCycleWallpaper,
  onOpenWallpaperManager,
  currentWallpaperName,
  dynamicAutoCycleActive = false
}: HomeScreenWidgetProps) {
  const [dateInfo, setDateInfo] = useState<{
    dayName: string;
    formattedDate: string;
    monthYear: string;
    timeString: string;
  }>({
    dayName: "",
    formattedDate: "",
    monthYear: "",
    timeString: ""
  });

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
      const formattedDate = now.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      });
      const monthYear = now.toLocaleDateString(undefined, {
        year: "numeric"
      });
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      setDateInfo({
        dayName,
        formattedDate,
        monthYear,
        timeString
      });
    };

    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate estimated battery time remaining based on level and saver mode
  const estimatedHours = Math.max(
    0.5,
    Math.round((batteryLevel * (isBatterySaver ? 0.22 : 0.16)) * 10) / 10
  );

  // Dynamic colors based on battery level
  const getBatteryColor = () => {
    if (isChargingActive) return "from-cyan-500 to-teal-400 text-cyan-300 border-cyan-400/80 shadow-cyan-500/30";
    if (batteryLevel > 50) return "from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20";
    if (batteryLevel > 20) return "from-amber-500 to-orange-500 text-amber-300 border-amber-500/50 shadow-amber-500/20";
    return "from-rose-500 to-red-600 text-rose-300 border-rose-500/60 shadow-rose-500/30";
  };

  const getGaugeBg = () => {
    if (isChargingActive) return "bg-cyan-400 shadow-[0_0_12px_#22d3ee]";
    if (batteryLevel > 50) return "bg-emerald-400 shadow-[0_0_8px_#34d399]";
    if (batteryLevel > 20) return "bg-amber-400 shadow-[0_0_8px_#fbbf24]";
    return "bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse";
  };

  return (
    <div className="w-full my-auto select-none px-1 py-1">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-3xl p-3.5 shadow-xl text-slate-100 relative overflow-hidden flex flex-col gap-3 group"
      >
        {/* Decorative background glow based on battery/charging state */}
        <div
          className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-700 ${
            isChargingActive
              ? "bg-cyan-400 opacity-30"
              : batteryLevel <= 20
              ? "bg-rose-500 opacity-30"
              : "bg-teal-400"
          }`}
        />

        {/* TOP SECTION: Clock & Live Date Display */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
          <div
            onClick={() => onOpenApp?.(AppID.CLOCK)}
            className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
            title="Tap to open Clock app"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-white font-sans drop-shadow-sm">
                {currentTime || dateInfo.timeString || "10:45"}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-md">
                KK OS
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-0.5">
              <Calendar size={13} className="text-cyan-400 shrink-0" />
              <span>{dateInfo.dayName || "Friday"}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-200 font-bold">{dateInfo.formattedDate || "Jul 24"}</span>
              <span className="text-slate-500 text-[10px]">{dateInfo.monthYear}</span>
            </div>
          </div>

          {/* Quick Weather / Outdoor Snapshot pill */}
          <div
            onClick={() => onOpenApp?.(AppID.WEATHER)}
            className="flex flex-col items-end cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-2xl px-2.5 py-1.5 transition-all active:scale-95 shadow-sm"
            title="Tap to open Weather app"
          >
            <div className="flex items-center gap-1 text-xs font-extrabold text-amber-300">
              <Sun size={13} className="text-amber-400 animate-spin-slow" />
              <span>26°C</span>
            </div>
            <span className="text-[9px] font-medium text-slate-400">Sunny</span>
          </div>
        </div>

        {/* BOTTOM SECTION: Real-Time Battery Status & Controls */}
        <div className="flex flex-col gap-2">
          {/* Header Row: Battery Gauge Header & Quick Toggles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isChargingActive ? (
                <BatteryCharging size={16} className="text-cyan-400 animate-pulse" />
              ) : (
                <Battery
                  size={16}
                  className={
                    batteryLevel > 50
                      ? "text-emerald-400"
                      : batteryLevel > 20
                      ? "text-amber-400"
                      : "text-rose-400 animate-pulse"
                  }
                />
              )}
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Real-Time Battery
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Charger Toggle Button */}
              {onToggleCharging && (
                <button
                  onClick={() => {
                    onToggleCharging();
                    onSystemLog?.(`[PowerHAL] Toggled charger simulation state from Home Widget`, "INFO");
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-extrabold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                    isChargingActive
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                  title={isChargingActive ? "Disconnect Charger" : "Connect Charger Simulation"}
                >
                  <Zap size={10} className={isChargingActive ? "text-cyan-400 animate-bounce" : "text-slate-500"} />
                  <span>{isChargingActive ? "Plugged" : "Charge"}</span>
                </button>
              )}

              {/* Battery Saver Quick Toggle */}
              {onToggleBatterySaver && (
                <button
                  onClick={() => {
                    const nextSaver = !isBatterySaver;
                    onToggleBatterySaver(nextSaver);
                    onSystemLog?.(
                      `[PowerHAL] Battery Saver ${nextSaver ? "ENABLED" : "DISABLED"} via Home Widget`,
                      "INFO"
                    );
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-extrabold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                    isBatterySaver
                      ? "bg-amber-950 text-amber-300 border border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                  title={isBatterySaver ? "Disable Battery Saver Mode" : "Enable Power Saving Mode"}
                >
                  {isBatterySaver ? <ShieldAlert size={10} className="text-amber-400" /> : <ZapOff size={10} />}
                  <span>{isBatterySaver ? "Saver ON" : "Saver"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Visual Battery Capacity Bar / Gauge */}
          <div
            onClick={() => onOpenApp?.(AppID.TASK_MANAGER)}
            className="w-full bg-slate-900 rounded-full h-3.5 p-0.5 border border-slate-800 relative cursor-pointer overflow-hidden group/bar"
            title="Tap to view Task Manager & Power Monitor"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(2, batteryLevel))}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full transition-all duration-300 ${getGaugeBg()}`}
            />

            {/* Glowing shine line animation if charging */}
            {isChargingActive && (
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
              />
            )}
          </div>

          {/* Battery Status Info Row */}
          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-extrabold ${isChargingActive ? "text-cyan-300" : batteryLevel > 50 ? "text-emerald-400" : batteryLevel > 20 ? "text-amber-400" : "text-rose-400"}`}>
                {batteryLevel}%
              </span>

              {isChargingActive ? (
                <span className="text-cyan-400 flex items-center gap-0.5 font-sans font-semibold">
                  <Sparkles size={11} className="animate-spin" /> Charging...
                </span>
              ) : isBatterySaver ? (
                <span className="text-amber-400 font-sans font-semibold">Power Saver Mode</span>
              ) : batteryLevel <= 20 ? (
                <span className="text-rose-400 font-sans font-semibold animate-pulse">Low Battery</span>
              ) : (
                <span className="text-slate-400 font-sans font-normal">Normal Discharge</span>
              )}
            </div>

            <div className="text-slate-400 flex items-center gap-1">
              <Activity size={10} className="text-slate-500" />
              <span>
                {isChargingActive
                  ? "Full in ~35m"
                  : `~${estimatedHours}h remaining`}
              </span>
            </div>
          </div>

          {/* DYNAMIC WALLPAPER QUICK SWITCH BAR */}
          {(onCycleWallpaper || onOpenWallpaperManager) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-850/80 text-[9.5px]">
              <div
                onClick={onOpenWallpaperManager}
                className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-cyan-300 transition-colors truncate pr-2 group/wp"
                title="Tap to configure Dynamic Wallpapers & Auto-Cycle"
              >
                <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 group-hover/wp:border-cyan-400 transition-colors">
                  <Palette size={11} />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-white truncate group-hover/wp:text-cyan-300">
                    {currentWallpaperName || "Dynamic Theme"}
                  </span>
                  <span className="text-[8px] font-mono text-cyan-400/80 truncate">
                    {dynamicAutoCycleActive ? "Auto-Cycling Active" : "Dynamic Wallpaper Engine"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onCycleWallpaper && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCycleWallpaper();
                    }}
                    className="px-2 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-cyan-200 border border-cyan-700/80 text-[9px] font-mono font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                    title="Cycle to next wallpaper with smooth cross-fade animation"
                  >
                    <RefreshCw size={9} />
                    <span>Cycle</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
