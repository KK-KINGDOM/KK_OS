import React, { useState, useEffect } from "react";
import {
  Cpu,
  HardDrive,
  Trash2,
  RefreshCw,
  Zap,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Search,
  Play,
  XCircle,
  Sparkles,
  Battery,
  TrendingUp,
  BarChart2,
  Eye,
  EyeOff,
  Info,
  Clock,
  Sliders,
  X,
  Server,
  Terminal,
  ShieldCheck,
  Layers,
  Database,
  PieChart as PieChartIcon
} from "lucide-react";
import BatteryConsumptionPieChart from "./BatteryConsumptionPieChart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { AppID, LogSeverity } from "../types";

export interface ProcessItem {
  pid: number;
  name: string;
  pkg: string;
  appId?: AppID;
  ramMB: number;
  cpuPercent: number;
  isSystem: boolean;
  status: "running" | "sleeping" | "suspended";
  uptimeSeconds?: number;
  niceValue?: number;
  cacheMB?: number;
}

export interface TelemetryPoint {
  time: string;
  cpu: number;
  ram: number;
  ramMB: number;
}

const generateInitialTelemetry = (initialRamMB: number): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  const totalRamMB = 8192;
  const initialRamPct = Math.min(100, Math.round((initialRamMB / totalRamMB) * 100));

  for (let i = 9; i >= 0; i--) {
    const t = new Date(now - i * 2000);
    const timeStr = t.toTimeString().split(" ")[0];
    const jitterCpu = Math.min(95, Math.max(6, Math.round((16 + (Math.random() - 0.5) * 8) * 10) / 10));
    const jitterRamPct = Math.min(100, Math.max(10, Math.round((initialRamPct + (Math.random() - 0.5) * 2) * 10) / 10));
    points.push({
      time: timeStr,
      cpu: jitterCpu,
      ram: jitterRamPct,
      ramMB: initialRamMB
    });
  }
  return points;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-750 p-2 rounded-xl text-[10px] font-mono shadow-2xl backdrop-blur-md space-y-1 z-50">
        <p className="text-slate-400 font-bold border-b border-slate-800 pb-1 flex items-center justify-between gap-2">
          <span>TIME</span>
          <span className="text-cyan-300 font-mono">{label}</span>
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1 font-semibold" style={{ color: entry.color }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white">
              {entry.value}% {entry.dataKey === "ram" ? `(${entry.payload.ramMB} MB)` : ""}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface AppTaskManagerProps {
  ramUsedMB: number;
  onUpdateRamUsed?: (newRamMB: number) => void;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
  onOpenApp?: (appId: AppID) => void;
  batteryLevel?: number;
  isBatterySaver?: boolean;
  performanceMode?: "high_performance" | "power_efficient";
  onToggleBatterySaver?: (saver: boolean) => void;
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 101, name: "System Core (init)", pkg: "com.kkos.system.init", ramMB: 128, cpuPercent: 0.8, isSystem: true, status: "running", cacheMB: 45 },
  { pid: 112, name: "SurfaceFlinger UI", pkg: "com.kkos.system.surfaceflinger", ramMB: 310, cpuPercent: 3.4, isSystem: true, status: "running", cacheMB: 120 },
  { pid: 124, name: "Security Framework", pkg: "com.kkos.security.daemon", ramMB: 185, cpuPercent: 1.1, isSystem: true, status: "running", cacheMB: 30 },
  { pid: 204, name: "Google Chrome Browser", pkg: "com.google.android.browser", appId: AppID.BROWSER, ramMB: 680, cpuPercent: 8.5, isSystem: false, status: "running", cacheMB: 580 },
  { pid: 215, name: "KK Gemini AI Engine", pkg: "com.kkos.ai.gemini", appId: AppID.AI_ASSISTANT, ramMB: 840, cpuPercent: 12.2, isSystem: false, status: "running", cacheMB: 410 },
  { pid: 228, name: "KK Camera Pro", pkg: "com.kkos.camera", appId: AppID.CAMERA, ramMB: 420, cpuPercent: 4.1, isSystem: false, status: "sleeping", cacheMB: 280 },
  { pid: 236, name: "KK Music Player", pkg: "com.kkos.music", appId: AppID.MUSIC, ramMB: 290, cpuPercent: 2.3, isSystem: false, status: "running", cacheMB: 350 },
  { pid: 249, name: "Messages & SMS Daemon", pkg: "com.kkos.messaging", appId: AppID.MESSAGES, ramMB: 175, cpuPercent: 0.5, isSystem: false, status: "sleeping", cacheMB: 65 },
  { pid: 258, name: "Live Weather Service", pkg: "com.kkos.weather", appId: AppID.WEATHER, ramMB: 210, cpuPercent: 1.0, isSystem: false, status: "sleeping", cacheMB: 85 },
  { pid: 271, name: "File Manager Pro", pkg: "com.kkos.filemanager", appId: AppID.FILE_MANAGER, ramMB: 260, cpuPercent: 1.4, isSystem: false, status: "sleeping", cacheMB: 190 },
  { pid: 283, name: "Photo Gallery Engine", pkg: "com.kkos.gallery", appId: AppID.GALLERY, ramMB: 380, cpuPercent: 2.0, isSystem: false, status: "sleeping", cacheMB: 620 },
];

export default function AppTaskManager({
  ramUsedMB,
  onUpdateRamUsed,
  onSystemLog,
  onOpenApp,
  batteryLevel = 84,
  isBatterySaver = false,
  performanceMode = "power_efficient",
  onToggleBatterySaver
}: AppTaskManagerProps) {
  const [taskManagerTab, setTaskManagerTab] = useState<"processes" | "battery_pie">("processes");
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  const [filter, setFilter] = useState<"all" | "user" | "system">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cpuUsage, setCpuUsage] = useState(18.4);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [isBoosting, setIsBoosting] = useState(false);
  const [chartMetric, setChartMetric] = useState<"both" | "cpu" | "ram">("both");
  const [isChartVisible, setIsChartVisible] = useState(true);

  const TOTAL_RAM_MB = 8192; // 8 GB total RAM

  // Calculate actual RAM used by current processes
  const totalProcessRam = processes.reduce((acc, proc) => acc + proc.ramMB, 0);
  const currentRamMB = Math.max(1200, totalProcessRam + 800); // Base OS overhead

  // Chart data state
  const [chartData, setChartData] = useState<TelemetryPoint[]>(() =>
    generateInitialTelemetry(currentRamMB)
  );

  // Keep parent RAM stat updated
  useEffect(() => {
    if (onUpdateRamUsed) {
      onUpdateRamUsed(currentRamMB);
    }
  }, [currentRamMB, onUpdateRamUsed]);

  // Simulated CPU fluctuation & telemetry chart update
  useEffect(() => {
    const timer = setInterval(() => {
      const activeProcCount = processes.filter((p) => p.status === "running").length;
      const baseCpu = activeProcCount * 2.2;
      const jitter = (Math.random() - 0.5) * 4;
      const nextCpu = Math.min(98, Math.max(4, Math.round((baseCpu + jitter) * 10) / 10));
      setCpuUsage(nextCpu);

      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const nextRamPct = Math.min(100, Math.round((currentRamMB / TOTAL_RAM_MB) * 100));

      setChartData((prev) => {
        const nextData = [
          ...prev,
          {
            time: timeStr,
            cpu: nextCpu,
            ram: nextRamPct,
            ramMB: currentRamMB,
          },
        ];
        return nextData.slice(-15);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [processes, currentRamMB]);

  // Kill a single process
  const killProcess = (pid: number) => {
    const targetProc = processes.find((p) => p.pid === pid);
    if (!targetProc) return;

    setProcesses((prev) => prev.filter((p) => p.pid !== pid));

    const logMsg = `[ProcessManager] SIGKILL (9) sent to PID ${pid} (${targetProc.name}). Freed ${targetProc.ramMB} MB RAM.`;
    if (onSystemLog) {
      onSystemLog(logMsg, targetProc.isSystem ? "WARNING" : "INFO");
    }

    setBoostMessage(`Terminated PID ${pid} (${targetProc.name}). Freed ${targetProc.ramMB} MB RAM!`);
    setTimeout(() => setBoostMessage(null), 3000);
  };

  // Boost Memory / Kill All User Background Tasks
  const boostMemory = () => {
    setIsBoosting(true);
    const userProcs = processes.filter((p) => !p.isSystem);
    const freedRam = userProcs.reduce((acc, p) => acc + p.ramMB, 0);

    setTimeout(() => {
      setProcesses((prev) => prev.filter((p) => p.isSystem));
      setIsBoosting(false);

      const logMsg = `[MemoryManager] RAM Optimization complete. Closed ${userProcs.length} background apps, reclaiming ${freedRam} MB RAM.`;
      if (onSystemLog) {
        onSystemLog(logMsg, "INFO");
      }

      setBoostMessage(`Memory Cleaned! Closed ${userProcs.length} apps and reclaimed ${freedRam} MB RAM.`);
      setTimeout(() => setBoostMessage(null), 4000);
    }, 600);
  };

  // Kill Background Apps specifically for battery saver / power optimization
  const killBackgroundApps = () => {
    setIsBoosting(true);
    const userProcs = processes.filter((p) => !p.isSystem);
    const freedRam = userProcs.reduce((acc, p) => acc + p.ramMB, 0);

    setTimeout(() => {
      setProcesses((prev) => prev.filter((p) => p.isSystem));
      setIsBoosting(false);

      const logMsg = `[PowerHAL] Force-closed ${userProcs.length} background processes. Reduced battery drain & freed ${freedRam} MB RAM.`;
      if (onSystemLog) {
        onSystemLog(logMsg, "WARNING");
      }

      setBoostMessage(`🔋 Battery Saver Active! Terminated ${userProcs.length} background apps (${freedRam} MB RAM freed). Battery drain minimized!`);
      setTimeout(() => setBoostMessage(null), 4500);
    }, 500);
  };

  // Restore Default Processes
  const restoreProcesses = () => {
    setProcesses(INITIAL_PROCESSES);
    if (onSystemLog) {
      onSystemLog("[ProcessManager] System background processes re-initialized.", "INFO");
    }
    setBoostMessage("Background processes restored!");
    setTimeout(() => setBoostMessage(null), 2500);
  };

  // Filtered processes list
  const filteredProcesses = processes.filter((p) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "user" && !p.isSystem) ||
      (filter === "system" && p.isSystem);

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pkg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toString().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  const ramPercentage = Math.min(100, Math.round((currentRamMB / TOTAL_RAM_MB) * 100));

  // App Cache calculation across processes
  const totalCacheMB = processes.reduce((acc, p) => acc + (p.cacheMB || 0), 0);

  // Clear All App Caches
  const clearAllAppCaches = () => {
    setIsBoosting(true);
    const freedCacheMB = totalCacheMB;
    const freedGB = (freedCacheMB / 1024).toFixed(2);

    setTimeout(() => {
      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          cacheMB: Math.min(2, p.cacheMB ? 2 : 0),
        }))
      );
      setIsBoosting(false);

      const logMsg = `[StorageManager] App cache cleanup completed. Cleared ${freedCacheMB} MB (${freedGB} GB) of temporary app cache.`;
      if (onSystemLog) {
        onSystemLog(logMsg, "INFO");
      }

      setBoostMessage(`🧹 App Cache Cleared! Reclaimed ${freedGB} GB (${freedCacheMB} MB) of system storage space.`);
      setTimeout(() => setBoostMessage(null), 4500);
    }, 600);
  };

  // Clear Single App Cache
  const clearSingleAppCache = (pid: number) => {
    const target = processes.find((p) => p.pid === pid);
    if (!target || !target.cacheMB) return;

    const cleared = target.cacheMB;
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid ? { ...p, cacheMB: 0 } : p))
    );

    const logMsg = `[StorageManager] Cleared ${cleared} MB cache for ${target.name}.`;
    if (onSystemLog) {
      onSystemLog(logMsg, "INFO");
    }

    setBoostMessage(`Cleared ${cleared} MB cache for ${target.name}!`);
    setTimeout(() => setBoostMessage(null), 3000);

    if (selectedProcess && selectedProcess.pid === pid) {
      setSelectedProcess({ ...selectedProcess, cacheMB: 0 });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden" id="app-task-manager">
      {/* Header Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">Task Manager Pro</h2>
            <p className="text-[9px] text-slate-400 font-mono">Process Monitor, Battery & Cache Cleaner</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearAllAppCaches}
            disabled={isBoosting || totalCacheMB === 0}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800/80 disabled:bg-slate-900 text-purple-300 font-bold text-[11px] cursor-pointer flex items-center gap-1 transition-all active:scale-95"
            title="Clear all application temporary cache files to reclaim storage"
          >
            <Database size={12} className={isBoosting ? "animate-spin text-purple-400" : "text-purple-400"} />
            <span>Clear Cache ({totalCacheMB > 1024 ? `${(totalCacheMB / 1024).toFixed(1)} GB` : `${totalCacheMB} MB`})</span>
          </button>

          <button
            onClick={killBackgroundApps}
            disabled={isBoosting}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:bg-slate-800 text-slate-950 font-extrabold text-[11px] shadow-md cursor-pointer flex items-center gap-1 transition-all active:scale-95"
            title="Force-close non-essential background processes to instantly improve battery life"
          >
            <Battery size={13} className={isBoosting ? "animate-spin" : "fill-slate-950"} />
            <span>Kill Background Apps</span>
          </button>

          <button
            onClick={boostMemory}
            disabled={isBoosting}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] border border-slate-700 cursor-pointer flex items-center gap-1 transition-all active:scale-95"
            title="Clean RAM memory"
          >
            <Zap size={12} className={isBoosting ? "animate-spin" : ""} />
            <span>Clean RAM</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 gap-2 shrink-0">
        <button
          onClick={() => setTaskManagerTab("processes")}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            taskManagerTab === "processes"
              ? "bg-cyan-950 text-cyan-300 border-cyan-800 shadow-sm"
              : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
          }`}
        >
          <Activity size={13} className={taskManagerTab === "processes" ? "text-cyan-400" : "text-slate-500"} />
          <span>Active Processes ({processes.length})</span>
        </button>

        <button
          onClick={() => setTaskManagerTab("battery_pie")}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            taskManagerTab === "battery_pie"
              ? "bg-amber-950 text-amber-300 border-amber-800 shadow-sm"
              : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
          }`}
        >
          <PieChartIcon size={13} className={taskManagerTab === "battery_pie" ? "text-amber-400" : "text-slate-500"} />
          <span>Battery Consumption Pie</span>
          <span className="text-[8px] font-mono px-1 rounded bg-amber-900/80 text-amber-300 font-extrabold">
            {batteryLevel}%
          </span>
        </button>
      </div>

      {taskManagerTab === "battery_pie" ? (
        /* BATTERY CONSUMPTION PIE CHART VIEW */
        <div className="flex-1 overflow-hidden">
          <BatteryConsumptionPieChart
            batteryLevel={batteryLevel}
            isBatterySaver={isBatterySaver}
            performanceMode={performanceMode}
            onOpenApp={onOpenApp}
            onSystemLog={onSystemLog}
            onToggleBatterySaver={onToggleBatterySaver}
          />
        </div>
      ) : (
        /* PROCESSES & TELEMETRY STREAM VIEW */
        <>
      {/* Boost Notification Banner */}
      {boostMessage && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 px-3 py-1.5 text-[10px] text-emerald-300 font-mono flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>{boostMessage}</span>
          </div>
          <button onClick={() => setBoostMessage(null)} className="text-emerald-500 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Live Hardware Telemetry Chart (Recharts) */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-400" />
              Live Telemetry Stream
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Metric Selector */}
            <div className="flex gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[9px] font-mono">
              <button
                onClick={() => setChartMetric("both")}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  chartMetric === "both" ? "bg-cyan-950 text-cyan-300 border border-cyan-800/80" : "text-slate-400 hover:text-white"
                }`}
              >
                BOTH
              </button>
              <button
                onClick={() => setChartMetric("cpu")}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  chartMetric === "cpu" ? "bg-indigo-950 text-indigo-300 border border-indigo-800/80" : "text-slate-400 hover:text-white"
                }`}
              >
                CPU
              </button>
              <button
                onClick={() => setChartMetric("ram")}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  chartMetric === "ram" ? "bg-emerald-950 text-emerald-300 border border-emerald-800/80" : "text-slate-400 hover:text-white"
                }`}
              >
                RAM
              </button>
            </div>

            <button
              onClick={() => setIsChartVisible(!isChartVisible)}
              className="p-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              title={isChartVisible ? "Minimize Chart" : "Expand Chart"}
            >
              {isChartVisible ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
          </div>
        </div>

        {isChartVisible && (
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 p-2 pt-2.5 relative shadow-inner">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#64748b", fontSize: 8, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#334155" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 8, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#334155" }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {(chartMetric === "both" || chartMetric === "cpu") && (
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      name="CPU Load"
                      stroke="#818cf8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#cpuGradient)"
                      isAnimationActive={false}
                    />
                  )}
                  {(chartMetric === "both" || chartMetric === "ram") && (
                    <Area
                      type="monotone"
                      dataKey="ram"
                      name="RAM Usage"
                      stroke="#34d399"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#ramGradient)"
                      isAnimationActive={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Legend & Stats summary */}
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 border-t border-slate-900 pt-1.5 mt-1">
              <div className="flex items-center gap-3">
                {(chartMetric === "both" || chartMetric === "cpu") && (
                  <span className="flex items-center gap-1 font-bold text-indigo-300">
                    <span className="w-2 h-2 rounded-sm bg-indigo-400 inline-block" />
                    CPU: {cpuUsage}%
                  </span>
                )}
                {(chartMetric === "both" || chartMetric === "ram") && (
                  <span className="flex items-center gap-1 font-bold text-emerald-300">
                    <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />
                    RAM: {ramPercentage}% ({currentRamMB} MB)
                  </span>
                )}
              </div>

              <span className="text-slate-500">15s Live Window</span>
            </div>
          </div>
        )}
      </div>

      {/* System Resource Gauges */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-850 grid grid-cols-3 gap-2 shrink-0">
        {/* RAM Usage Gauge */}
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <HardDrive size={12} className="text-cyan-400" /> RAM Used
            </span>
            <span className="font-mono font-bold text-cyan-300">{ramPercentage}%</span>
          </div>
          <div className="my-1.5 h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ramPercentage > 80
                  ? "bg-rose-500"
                  : ramPercentage > 60
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${ramPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-slate-500">
            <span>{currentRamMB} MB</span>
            <span>{TOTAL_RAM_MB} MB</span>
          </div>
        </div>

        {/* CPU Usage Gauge */}
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Cpu size={12} className="text-indigo-400" /> CPU Load
            </span>
            <span className="font-mono font-bold text-indigo-300">{cpuUsage}%</span>
          </div>
          <div className="my-1.5 h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                cpuUsage > 75 ? "bg-rose-500" : cpuUsage > 40 ? "bg-indigo-400" : "bg-cyan-400"
              }`}
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-slate-500">
            <span>{processes.length} Processes</span>
            <span>{processes.filter((p) => p.status === "running").length} Active</span>
          </div>
        </div>

        {/* App Cache Storage Gauge */}
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold flex items-center gap-1 truncate">
              <Database size={12} className="text-purple-400 shrink-0" /> App Cache
            </span>
            <span className="font-mono font-bold text-purple-300">
              {totalCacheMB > 1024 ? `${(totalCacheMB / 1024).toFixed(1)} GB` : `${totalCacheMB} MB`}
            </span>
          </div>
          <div className="my-1.5 h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalCacheMB > 2000 ? "bg-amber-400" : "bg-purple-400"
              }`}
              style={{ width: `${Math.min(100, Math.round((totalCacheMB / 4096) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
            <span>{processes.filter((p) => (p.cacheMB || 0) > 0).length} Apps cached</span>
            {totalCacheMB > 0 ? (
              <button
                onClick={clearAllAppCaches}
                className="text-purple-400 hover:text-purple-200 font-bold underline cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <span className="text-emerald-400 font-bold">Clean</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-3 bg-slate-950 border-b border-slate-850 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-1">
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-850 text-[10px]">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                filter === "all" ? "bg-cyan-600 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({processes.length})
            </button>
            <button
              onClick={() => setFilter("user")}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                filter === "user" ? "bg-cyan-600 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Apps ({processes.filter((p) => !p.isSystem).length})
            </button>
            <button
              onClick={() => setFilter("system")}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                filter === "system" ? "bg-cyan-600 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              System ({processes.filter((p) => p.isSystem).length})
            </button>
          </div>

          <button
            onClick={restoreProcesses}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer"
            title="Reset / Reload processes"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search process by name or PID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Active Process List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {filteredProcesses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <XCircle size={28} className="mx-auto opacity-40 text-slate-400" />
            <p className="text-xs font-bold">No active processes match your filter.</p>
            <button
              onClick={restoreProcesses}
              className="text-[10px] text-cyan-400 hover:underline font-mono"
            >
              Click here to reload processes
            </button>
          </div>
        ) : (
          filteredProcesses.map((proc) => (
            <div
              key={proc.pid}
              onClick={() => setSelectedProcess(proc)}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-850 hover:border-slate-700 flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-105 ${
                    proc.isSystem
                      ? "bg-slate-950 border-slate-800 text-slate-400 group-hover:border-slate-700"
                      : "bg-cyan-950 border-cyan-800 text-cyan-400 group-hover:border-cyan-600"
                  }`}
                >
                  {proc.isSystem ? <Shield size={14} /> : <Activity size={14} />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white truncate max-w-[130px] group-hover:text-cyan-300 transition-colors">
                      {proc.name}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500 font-bold">
                      PID {proc.pid}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono truncate max-w-[150px]">
                    {proc.pkg}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-mono mt-0.5">
                    <span className="text-cyan-400 font-bold">{proc.ramMB} MB</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-indigo-300">{proc.cpuPercent}% CPU</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-purple-300 font-bold">{proc.cacheMB || 0} MB Cache</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedProcess(proc)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  title="Inspect Process Details"
                >
                  <Info size={12} />
                </button>

                {proc.appId && onOpenApp && (
                  <button
                    onClick={() => onOpenApp(proc.appId!)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Switch to App"
                  >
                    <Play size={12} />
                  </button>
                )}

                {proc.isSystem ? (
                  <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[9px] font-mono font-bold text-slate-500">
                    Protected
                  </span>
                ) : (
                  <button
                    onClick={() => killProcess(proc.pid)}
                    className="px-2.5 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-rose-100 text-[10px] font-bold font-mono cursor-pointer transition-all flex items-center gap-1 shadow-sm active:scale-95"
                    title="Send SIGKILL to terminate this task"
                  >
                    <Trash2 size={11} />
                    <span>Kill</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="p-2 bg-slate-900 border-t border-slate-800 text-[9px] font-mono text-slate-400 flex justify-between items-center shrink-0">
        <span className="flex items-center gap-1">
          <Sparkles size={10} className="text-cyan-400" /> Kernel OOM Killer Active
        </span>
        <span className="text-slate-500">PID range: 100 - 999</span>
      </div>

      {/* Advanced Process Detail Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative overflow-hidden text-slate-200">
            {/* Glow background accent */}
            <div
              className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
                selectedProcess.isSystem ? "bg-cyan-500/10" : "bg-indigo-500/15"
              }`}
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2.5 rounded-2xl border ${
                    selectedProcess.isSystem
                      ? "bg-slate-950 border-slate-800 text-slate-400"
                      : "bg-cyan-950 border-cyan-800 text-cyan-400"
                  }`}
                >
                  {selectedProcess.isSystem ? <Shield size={20} /> : <Activity size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{selectedProcess.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                        selectedProcess.status === "running"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800/80"
                          : "bg-amber-950 text-amber-400 border-amber-800/80"
                      }`}
                    >
                      {selectedProcess.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">{selectedProcess.pkg}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProcess(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Core Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <Terminal size={11} className="text-cyan-400" /> Process ID (PID)
                </span>
                <p className="text-xs font-bold text-cyan-300">#{selectedProcess.pid}</p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <Clock size={11} className="text-indigo-400" /> Uptime
                </span>
                <p className="text-xs font-bold text-indigo-300">
                  {Math.floor((selectedProcess.pid * 19) / 60)}m {(selectedProcess.pid * 19) % 60}s
                </p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <Sliders size={11} className="text-emerald-400" /> Priority Level
                </span>
                <p className="text-xs font-bold text-emerald-300">
                  {selectedProcess.isSystem ? "CRITICAL (-10)" : "NORMAL (0)"}
                </p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <Battery size={11} className="text-amber-400" /> Power Drain
                </span>
                <p className="text-xs font-bold text-amber-300">
                  {selectedProcess.cpuPercent > 5 ? "High Drain" : "Optimized"}
                </p>
              </div>
            </div>

            {/* Resource Memory Breakdown */}
            <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Cpu size={12} className="text-cyan-400" /> Memory Footprint
              </h4>

              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Allocated Physical RAM:</span>
                  <span className="text-cyan-300 font-bold">{selectedProcess.ramMB} MB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Resident Set Size (RSS):</span>
                  <span className="text-slate-300 font-bold">{Math.round(selectedProcess.ramMB * 0.88)} MB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Virtual Size (VSS):</span>
                  <span className="text-slate-300 font-bold">{Math.round(selectedProcess.ramMB * 1.75)} MB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Share of System RAM:</span>
                  <span className="text-emerald-400 font-bold">
                    {((selectedProcess.ramMB / 8192) * 100).toFixed(1)}% of 8 GB
                  </span>
                </div>
              </div>
            </div>

            {/* App Cache Footprint */}
            <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Database size={12} className="text-purple-400" /> Storage & Temporary Cache
                </h4>
                {(selectedProcess.cacheMB || 0) > 0 && (
                  <button
                    onClick={() => clearSingleAppCache(selectedProcess.pid)}
                    className="px-2 py-0.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[9px] font-mono font-bold cursor-pointer transition-all active:scale-95"
                  >
                    Clear App Cache
                  </button>
                )}
              </div>

              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Temp Cache Allocation:</span>
                  <span className="text-purple-300 font-bold">{selectedProcess.cacheMB || 0} MB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Storage Footprint Status:</span>
                  <span className={(selectedProcess.cacheMB || 0) > 300 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                    {(selectedProcess.cacheMB || 0) > 300 ? "Heavy Cache" : "Normal"}
                  </span>
                </div>
              </div>
            </div>

            {/* Kernel Security & Sandbox */}
            <div className="space-y-1 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-[10px] font-mono">
              <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" /> Security & Isolation
              </h4>
              <div className="flex justify-between text-slate-400">
                <span>Linux UID:</span>
                <span className="text-slate-200 font-bold">
                  {selectedProcess.isSystem ? "1000 (system)" : `10${selectedProcess.pid % 100} (u0_a${selectedProcess.pid % 100})`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SELinux Domain:</span>
                <span className="text-slate-200 font-mono">
                  {selectedProcess.isSystem ? "u:r:system_app:s0" : "u:r:untrusted_app:s0"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cgroups Container:</span>
                <span className="text-emerald-400 font-mono">/sys/fs/cgroup/v2</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              {selectedProcess.appId && onOpenApp && (
                <button
                  onClick={() => {
                    const targetApp = selectedProcess.appId!;
                    setSelectedProcess(null);
                    onOpenApp(targetApp);
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                >
                  <Play size={13} />
                  <span>Open App</span>
                </button>
              )}

              {!selectedProcess.isSystem ? (
                <button
                  onClick={() => {
                    killProcess(selectedProcess.pid);
                    setSelectedProcess(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-200 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>SIGKILL</span>
                </button>
              ) : (
                <span className="flex-1 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 font-bold text-xs">
                  System Protected
                </span>
              )}

              <button
                onClick={() => setSelectedProcess(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
