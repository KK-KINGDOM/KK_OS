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
    <div className="w-full mt-4 mb-2 select-none px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-slate-800 flex flex-col gap-4 relative overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div
            onClick={() => onOpenApp?.(AppID.CLOCK)}
            className="flex flex-col cursor-pointer"
          >
            <span className="text-4xl font-light tracking-tight text-slate-900 leading-none">
              {currentTime || dateInfo.timeString || "10:45"}
            </span>
            <div className="flex items-center gap-1 text-sm font-medium text-slate-700 mt-1">
              <span>{dateInfo.dayName || "Friday"}</span>
              <span>,</span>
              <span>{dateInfo.formattedDate || "Jul 24"}</span>
            </div>
          </div>

          <div
            onClick={() => onOpenApp?.(AppID.WEATHER)}
            className="flex flex-col items-end cursor-pointer"
          >
            <Sun size={28} className="text-amber-500 mb-1" />
            <span className="text-lg font-medium text-slate-900 leading-none">26°</span>
            <span className="text-xs font-medium text-slate-600">Sunny</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-900/10">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            {isChargingActive ? (
              <BatteryCharging size={14} className="text-emerald-600" />
            ) : (
              <Battery size={14} className={batteryLevel <= 20 ? "text-red-500" : "text-slate-700"} />
            )}
            <span>{batteryLevel}%</span>
          </div>
          
          <div className="w-px h-3 bg-slate-400" />
          
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <Activity size={14} />
            <span>Battery health: Good</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
