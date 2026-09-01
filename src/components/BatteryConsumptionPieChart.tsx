import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Sector
} from "recharts";
import {
  Battery,
  BatteryCharging,
  Zap,
  Activity,
  Cpu,
  Globe,
  Camera,
  Music,
  MessageSquare,
  CloudSun,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Info,
  Power,
  RotateCcw,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Sun,
  Radio,
  Gamepad2,
  HardDrive
} from "lucide-react";
import { AppID, LogSeverity } from "../types";

export interface AppBatteryItem {
  id: string;
  name: string;
  pkg: string;
  appId?: AppID;
  category: "user_app" | "system_core" | "hardware_display" | "ai_service";
  drainPercent: number; // calculated percentage
  rawDrainUnits: number; // base weight
  mahConsumed: number;
  foregroundMinutes: number;
  backgroundMinutes: number;
  cpuPercent: number;
  wakeLocksCount: number;
  color: string;
  icon: any;
  isRestricted?: boolean;
  status: "high_drain" | "normal" | "optimized" | "restricted";
  description: string;
}

const INITIAL_BATTERY_APPS: AppBatteryItem[] = [
  {
    id: "chrome_browser",
    name: "Chrome Browser",
    pkg: "com.google.android.browser",
    appId: AppID.BROWSER,
    category: "user_app",
    drainPercent: 24.5,
    rawDrainUnits: 245,
    mahConsumed: 882,
    foregroundMinutes: 72,
    backgroundMinutes: 140,
    cpuPercent: 9.4,
    wakeLocksCount: 14,
    color: "#38bdf8", // Sky blue
    icon: Globe,
    status: "high_drain",
    description: "Active multi-tab web browsing & 120Hz canvas rendering"
  },
  {
    id: "gemini_ai",
    name: "KK Gemini AI Engine",
    pkg: "com.kkos.ai.gemini",
    appId: AppID.AI_ASSISTANT,
    category: "ai_service",
    drainPercent: 19.8,
    rawDrainUnits: 198,
    mahConsumed: 712,
    foregroundMinutes: 45,
    backgroundMinutes: 90,
    cpuPercent: 13.8,
    wakeLocksCount: 22,
    color: "#a855f7", // Purple
    icon: Sparkles,
    status: "high_drain",
    description: "Neural inference model execution & live voice synthesis"
  },
  {
    id: "display_hardware",
    name: "AMOLED Display & Backlight",
    pkg: "hw.display.panel",
    category: "hardware_display",
    drainPercent: 16.2,
    rawDrainUnits: 162,
    mahConsumed: 583,
    foregroundMinutes: 180,
    backgroundMinutes: 0,
    cpuPercent: 2.1,
    wakeLocksCount: 0,
    color: "#f59e0b", // Amber
    icon: Sun,
    status: "normal",
    description: "Hardware 120Hz high-refresh OLED panel illumination"
  },
  {
    id: "camera_pro",
    name: "KK Camera Pro",
    pkg: "com.kkos.camera",
    appId: AppID.CAMERA,
    category: "user_app",
    drainPercent: 11.4,
    rawDrainUnits: 114,
    mahConsumed: 410,
    foregroundMinutes: 28,
    backgroundMinutes: 15,
    cpuPercent: 6.8,
    wakeLocksCount: 6,
    color: "#ec4899", // Pink
    icon: Camera,
    status: "normal",
    description: "Live camera sensor preview, HDR processing & ISP pipeline"
  },
  {
    id: "music_player",
    name: "KK Music Player",
    pkg: "com.kkos.music",
    appId: AppID.MUSIC,
    category: "user_app",
    drainPercent: 9.1,
    rawDrainUnits: 91,
    mahConsumed: 327,
    foregroundMinutes: 35,
    backgroundMinutes: 165,
    cpuPercent: 3.2,
    wakeLocksCount: 38,
    color: "#10b981", // Emerald
    icon: Music,
    status: "normal",
    description: "Background audio codec decoding & equalizer audio HAL"
  },
  {
    id: "surfaceflinger_ui",
    name: "SurfaceFlinger & OS UI",
    pkg: "com.kkos.system.surfaceflinger",
    category: "system_core",
    drainPercent: 7.6,
    rawDrainUnits: 76,
    mahConsumed: 274,
    foregroundMinutes: 180,
    backgroundMinutes: 180,
    cpuPercent: 4.5,
    wakeLocksCount: 5,
    color: "#2dd4bf", // Teal
    icon: Layers,
    status: "optimized",
    description: "Window manager compositor & GPU layout rendering"
  },
  {
    id: "messages_sms",
    name: "Messages & SMS Daemon",
    pkg: "com.kkos.messaging",
    appId: AppID.MESSAGES,
    category: "user_app",
    drainPercent: 4.8,
    rawDrainUnits: 48,
    mahConsumed: 173,
    foregroundMinutes: 18,
    backgroundMinutes: 110,
    cpuPercent: 1.2,
    wakeLocksCount: 16,
    color: "#6366f1", // Indigo
    icon: MessageSquare,
    status: "optimized",
    description: "Push notifications listener & cellular dispatch service"
  },
  {
    id: "weather_service",
    name: "Live Weather Sync",
    pkg: "com.kkos.weather",
    appId: AppID.WEATHER,
    category: "user_app",
    drainPercent: 3.8,
    rawDrainUnits: 38,
    mahConsumed: 137,
    foregroundMinutes: 12,
    backgroundMinutes: 180,
    cpuPercent: 0.9,
    wakeLocksCount: 12,
    color: "#06b6d4", // Cyan
    icon: CloudSun,
    status: "optimized",
    description: "Periodic atmospheric API polling & GPS location queries"
  },
  {
    id: "security_selinux",
    name: "SELinux & Security Shield",
    pkg: "com.kkos.security.daemon",
    appId: AppID.SECURITY,
    category: "system_core",
    drainPercent: 2.8,
    rawDrainUnits: 28,
    mahConsumed: 101,
    foregroundMinutes: 180,
    backgroundMinutes: 180,
    cpuPercent: 1.1,
    wakeLocksCount: 2,
    color: "#e11d48", // Rose
    icon: Shield,
    status: "optimized",
    description: "Kernel policy enforcement, biometric encryption & sandbox integrity"
  }
];

interface BatteryConsumptionPieChartProps {
  batteryLevel?: number;
  isBatterySaver?: boolean;
  performanceMode?: "high_performance" | "power_efficient";
  onOpenApp?: (appId: AppID) => void;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
  onToggleBatterySaver?: (saver: boolean) => void;
}

// Active Shape custom highlight renderer
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent
  } = props;

  return (
    <g>
      {/* Outer glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
      {/* Main elevated slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function BatteryConsumptionPieChart({
  batteryLevel = 84,
  isBatterySaver = false,
  performanceMode = "power_efficient",
  onOpenApp,
  onSystemLog,
  onToggleBatterySaver
}: BatteryConsumptionPieChartProps) {
  const [appItems, setAppItems] = useState<AppBatteryItem[]>(INITIAL_BATTERY_APPS);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>("chrome_browser");
  const [chartType, setChartType] = useState<"donut" | "pie">("donut");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "user_app" | "system_core" | "hardware_display" | "ai_service">("all");
  const [timeRange, setTimeRange] = useState<"since_full_charge" | "last_24h" | "last_6h">("since_full_charge");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionToast, setActionToast] = useState<string | null>(null);

  const BATTERY_CAPACITY_MAH = 5000;

  // Dynamically compute normalized percentages based on active filter and restrictions
  const processedData = useMemo(() => {
    // Apply time-range multiplier
    const timeMultiplier = timeRange === "last_6h" ? 0.35 : timeRange === "last_24h" ? 0.75 : 1.0;

    // Filter items
    const filtered = appItems.filter((app) => {
      const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.pkg.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    const totalRawUnits = filtered.reduce((sum, item) => {
      const effectiveUnits = item.isRestricted ? item.rawDrainUnits * 0.45 : item.rawDrainUnits;
      return sum + effectiveUnits * timeMultiplier;
    }, 0);

    return filtered.map((item) => {
      const effectiveUnits = (item.isRestricted ? item.rawDrainUnits * 0.45 : item.rawDrainUnits) * timeMultiplier;
      const calculatedPct = totalRawUnits > 0 ? Number(((effectiveUnits / totalRawUnits) * 100).toFixed(1)) : 0;
      const effectiveMah = Math.round((calculatedPct / 100) * (BATTERY_CAPACITY_MAH * (1 - batteryLevel / 100 || 0.35)));

      return {
        ...item,
        drainPercent: calculatedPct,
        mahConsumed: Math.max(25, effectiveMah),
        value: calculatedPct
      };
    });
  }, [appItems, categoryFilter, searchQuery, timeRange, batteryLevel]);

  // Selected item object
  const activeSelectedApp = useMemo(() => {
    if (selectedAppId) {
      const found = processedData.find((a) => a.id === selectedAppId);
      if (found) return found;
    }
    return processedData[0] || null;
  }, [processedData, selectedAppId]);

  // Handle Restricting or Optimizing an App
  const handleToggleAppRestriction = (id: string) => {
    setAppItems((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const nextRestricted = !app.isRestricted;
          const msg = nextRestricted
            ? `⚡ Background restriction enabled for ${app.name}. CPU & WakeLock drain throttled by 55%.`
            : `Unrestricted power profile restored for ${app.name}.`;

          setActionToast(msg);
          setTimeout(() => setActionToast(null), 3500);

          if (onSystemLog) {
            onSystemLog(`[PowerHAL] ${msg}`, nextRestricted ? "WARNING" : "INFO");
          }

          return {
            ...app,
            isRestricted: nextRestricted,
            status: nextRestricted ? "restricted" : app.status === "restricted" ? "optimized" : app.status
          };
        }
        return app;
      })
    );
  };

  // Reset all optimizations
  const handleResetAllRestrictions = () => {
    setAppItems(INITIAL_BATTERY_APPS);
    setActionToast("Reset all app power profiles to factory default.");
    setTimeout(() => setActionToast(null), 3000);
    if (onSystemLog) {
      onSystemLog("[PowerHAL] Reset all app battery profiles.", "INFO");
    }
  };

  // Total Drain Summary
  const topApp = processedData[0];
  const totalMahDrained = processedData.reduce((acc, curr) => acc + curr.mahConsumed, 0);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-y-auto scrollbar-none p-3 space-y-3.5" id="battery-consumption-pie-chart">
      {/* TOP HEADER & BATTERY HEALTH METRIC */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/20 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-950 border border-amber-800/80 text-amber-400">
              <Battery size={20} className={batteryLevel <= 20 ? "text-rose-400 animate-pulse" : "text-amber-400"} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-white">Battery Consumption Analysis</h3>
                <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-bold">
                  {batteryLevel}% REMAINING
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                PowerHAL Energy Decomposition & System App Drain Breakdown
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono font-black text-amber-400">
              ~{Math.round((batteryLevel / 100) * 18.5)}h {Math.round(((batteryLevel % 10) / 10) * 60)}m
            </div>
            <span className="text-[8.5px] text-slate-400 font-mono">Est. Remaining</span>
          </div>
        </div>

        {/* Battery Stats Mini Row */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[8.5px] font-mono text-slate-400 block uppercase">Capacity</span>
            <span className="text-[11px] font-mono font-bold text-white">5,000 mAh</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[8.5px] font-mono text-slate-400 block uppercase">Active Drain</span>
            <span className="text-[11px] font-mono font-bold text-amber-300">{totalMahDrained} mAh</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[8.5px] font-mono text-slate-400 block uppercase">Profile</span>
            <span className={`text-[11px] font-mono font-bold ${performanceMode === "high_performance" ? "text-rose-400" : "text-emerald-400"}`}>
              {performanceMode === "high_performance" ? "HIGH PERF" : "POWER SAVER"}
            </span>
          </div>
        </div>
      </div>

      {/* ACTION TOAST NOTIFICATION */}
      {actionToast && (
        <div className="p-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-[10px] font-mono flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span>{actionToast}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* FILTER & TIMEFRAME CONTROLS */}
      <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        {/* Timeframe Chips & Chart Type Toggle */}
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono mr-1">Time:</span>
            {[
              { id: "since_full_charge", label: "Full Charge" },
              { id: "last_24h", label: "Last 24h" },
              { id: "last_6h", label: "Last 6h" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as any)}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer border ${
                  timeRange === t.id
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setChartType(chartType === "donut" ? "pie" : "donut")}
              className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-teal-300 text-[9px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Toggle between Donut & Full Pie visualizer"
            >
              <Sliders size={10} />
              <span>{chartType === "donut" ? "Donut Style" : "Solid Pie"}</span>
            </button>

            <button
              onClick={handleResetAllRestrictions}
              className="px-1.5 py-0.5 rounded-lg bg-slate-950 hover:bg-rose-950 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-rose-300 text-[9px] font-mono font-bold transition-colors cursor-pointer"
              title="Reset power restrictions"
            >
              <RotateCcw size={10} />
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-1 border-t border-slate-800/80">
          {[
            { id: "all", label: "All Active Apps" },
            { id: "user_app", label: "User Apps" },
            { id: "ai_service", label: "AI & Neural" },
            { id: "system_core", label: "System Core" },
            { id: "hardware_display", label: "Hardware/Screen" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
                categoryFilter === cat.id
                  ? "bg-teal-500 text-slate-950 border-teal-400 shadow-sm"
                  : "bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* INTERACTIVE PIE CHART VISUALIZATION CARD */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <Activity size={15} className="text-amber-400 animate-pulse" />
            <span>Active Power Consumption Pie</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            {processedData.length} Process{processedData.length !== 1 ? "es" : ""} Tracked
          </span>
        </div>

        {/* RECHARTS PIE CHART CONTAINER */}
        <div className="h-56 w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                innerRadius={chartType === "donut" ? 54 : 0}
                outerRadius={78}
                paddingAngle={chartType === "donut" ? 2.5 : 1}
                dataKey="value"
                nameKey="name"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(entry: any) => {
                  if (entry && entry.id) {
                    setSelectedAppId(entry.id);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.id}-${index}`}
                    fill={entry.color}
                    stroke="#020617"
                    strokeWidth={2}
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as AppBatteryItem;
                    return (
                      <div className="bg-slate-950/95 border border-slate-700 p-2.5 rounded-2xl text-[10px] font-mono shadow-2xl backdrop-blur-md space-y-1 z-50 text-white min-w-[150px]">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                          <span className="font-bold truncate" style={{ color: data.color }}>
                            {data.name}
                          </span>
                          <span className="font-black text-amber-300 font-mono">{data.drainPercent}%</span>
                        </div>
                        <div className="space-y-0.5 text-slate-300 text-[9px]">
                          <p>• Drain: <span className="text-white font-bold">{data.mahConsumed} mAh</span></p>
                          <p>• Foreground: <span className="text-white font-bold">{data.foregroundMinutes}m</span></p>
                          <p>• CPU Load: <span className="text-white font-bold">{data.cpuPercent}%</span></p>
                          {data.isRestricted && (
                            <span className="inline-block mt-1 text-[8px] bg-rose-950 text-rose-300 border border-rose-800 px-1 rounded font-bold">
                              THROTTLED (-55%)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Hub Label */}
          {chartType === "donut" && (
            <div className="absolute text-center pointer-events-none flex flex-col items-center justify-center">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-tight">
                Top Consumer
              </span>
              <span
                className="text-xs font-black truncate max-w-[85px]"
                style={{ color: topApp ? topApp.color : "#ffffff" }}
              >
                {topApp ? `${topApp.drainPercent}%` : "0%"}
              </span>
              <span className="text-[7.5px] font-mono text-slate-300 truncate max-w-[85px]">
                {topApp ? topApp.name : "None"}
              </span>
            </div>
          )}
        </div>

        {/* Quick Click Hint */}
        <p className="text-[9px] text-center text-slate-400 font-mono">
          💡 Tap any slice or list row to inspect telemetry & toggle power throttling
        </p>
      </div>

      {/* SELECTED APP DETAIL INSPECTOR & THROTTLE CARD */}
      {activeSelectedApp && (
        <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="p-2 rounded-xl border flex items-center justify-center shadow-md"
                style={{
                  backgroundColor: `${activeSelectedApp.color}20`,
                  borderColor: `${activeSelectedApp.color}60`,
                  color: activeSelectedApp.color
                }}
              >
                {React.createElement(activeSelectedApp.icon, { size: 18 })}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-extrabold text-white truncate">{activeSelectedApp.name}</h4>
                  {activeSelectedApp.isRestricted && (
                    <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      RESTRICTED
                    </span>
                  )}
                </div>
                <p className="text-[9.5px] font-mono text-slate-400 truncate">{activeSelectedApp.pkg}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-mono font-black" style={{ color: activeSelectedApp.color }}>
                {activeSelectedApp.drainPercent}%
              </span>
              <span className="text-[8.5px] font-mono text-slate-400 block">{activeSelectedApp.mahConsumed} mAh</span>
            </div>
          </div>

          <p className="text-[10.5px] text-slate-300 leading-snug">
            {activeSelectedApp.description}
          </p>

          {/* Metric Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">Foreground</span>
              <span className="text-[10.5px] font-mono font-bold text-white">{activeSelectedApp.foregroundMinutes} min</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">Background</span>
              <span className="text-[10.5px] font-mono font-bold text-amber-300">{activeSelectedApp.backgroundMinutes} min</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">WakeLocks</span>
              <span className="text-[10.5px] font-mono font-bold text-cyan-300">{activeSelectedApp.wakeLocksCount} hits</span>
            </div>
          </div>

          {/* Action Buttons for Selected App */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleToggleAppRestriction(activeSelectedApp.id)}
              className={`py-2 px-3 rounded-2xl font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 border ${
                activeSelectedApp.isRestricted
                  ? "bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300"
              }`}
            >
              <Zap size={13} />
              <span>{activeSelectedApp.isRestricted ? "Remove Throttle" : "Restrict Background"}</span>
            </button>

            {activeSelectedApp.appId && onOpenApp ? (
              <button
                onClick={() => onOpenApp(activeSelectedApp.appId!)}
                className="py-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-teal-300 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <ExternalLink size={13} />
                <span>Launch App</span>
              </button>
            ) : (
              <div className="py-2 px-3 rounded-2xl bg-slate-950 text-slate-500 font-mono text-[10px] flex items-center justify-center border border-slate-850">
                System Process
              </div>
            )}
          </div>
        </div>
      )}

      {/* ITEMIZED APPLICATION BREAKDOWN LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            All Active Battery Consumers
          </h4>
          <span className="text-[9px] font-mono text-slate-500">Sorted by % drain</span>
        </div>

        {/* Search Filter for Processes */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search processes..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* List items */}
        <div className="space-y-1.5">
          {processedData.map((app) => {
            const isSelected = selectedAppId === app.id;
            const IconComp = app.icon;

            return (
              <button
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                  isSelected
                    ? "bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40"
                    : "bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Swatch & Icon */}
                  <div
                    className="p-2 rounded-xl border flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${app.color}15`,
                      borderColor: `${app.color}50`,
                      color: app.color
                    }}
                  >
                    <IconComp size={15} />
                  </div>

                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-extrabold text-white truncate">{app.name}</h5>
                      {app.isRestricted && (
                        <span className="text-[7.5px] font-mono font-bold px-1 rounded bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                          THROTTLED
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 truncate">
                      {app.foregroundMinutes}m foreground • {app.backgroundMinutes}m background
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-xs font-mono font-black" style={{ color: app.color }}>
                      {app.drainPercent}%
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono text-slate-400 block">{app.mahConsumed} mAh</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
