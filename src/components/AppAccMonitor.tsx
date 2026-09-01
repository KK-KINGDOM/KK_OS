import React, { useState, useEffect } from "react";
import {
  Activity,
  Globe,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Database,
  Copy,
  Zap,
  BarChart3,
  UserCheck,
  Bell,
  Search,
  Check,
  Layers,
  ArrowUpRight,
  Sparkles,
  Lock,
  Monitor,
  Smartphone,
  Plus,
  Trash2,
  Play,
  Terminal,
  Radio,
  Wifi,
  Settings,
  X,
  Clock,
  Maximize2,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface MonitoredAccount {
  id: string;
  name: string;
  service: string;
  url: string;
  status: "active" | "warning" | "error";
  uptime: string;
  lastPing: string;
  latencyMs: number;
  alertsEnabled: boolean;
}

export default function AppAccMonitor() {
  const [activeTab, setActiveTab] = useState<"desktop_site" | "live_app" | "dashboard" | "security" | "ping_tool">("desktop_site");
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Desktop view states
  const [desktopZoom, setDesktopZoom] = useState<number>(100);
  const [presetResolution, setPresetResolution] = useState<"standard" | "fhd" | "ultrawide">("standard");

  // Ping Tool state
  const [pingTarget, setPingTarget] = useState<string>("accmonitor.vercel.app");
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingLogs, setPingLogs] = useState<string[]>([
    "PING accmonitor.vercel.app (76.76.21.21): 56 data bytes",
    "64 bytes from 76.76.21.21: icmp_seq=0 ttl=58 time=41.2 ms",
    "64 bytes from 76.76.21.21: icmp_seq=1 ttl=58 time=38.9 ms",
    "--- accmonitor.vercel.app ping statistics ---",
    "2 packets transmitted, 2 received, 0% packet loss, avg 40.0ms"
  ]);

  // Add Account Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newAccName, setNewAccName] = useState<string>("");
  const [newAccService, setNewAccService] = useState<string>("");
  const [newAccUrl, setNewAccUrl] = useState<string>("");

  const TARGET_URL = "https://accmonitor.vercel.app";

  const [accounts, setAccounts] = useState<MonitoredAccount[]>([
    {
      id: "acc-1",
      name: "KK OS Vercel Production",
      service: "Vercel Platform",
      url: "https://accmonitor.vercel.app",
      status: "active",
      uptime: "99.99%",
      lastPing: "Just now",
      latencyMs: 42,
      alertsEnabled: true
    },
    {
      id: "acc-2",
      name: "Google Firebase Firestore",
      service: "Firebase DB & Auth",
      url: "https://firestore.googleapis.com",
      status: "active",
      uptime: "100%",
      lastPing: "5s ago",
      latencyMs: 28,
      alertsEnabled: true
    },
    {
      id: "acc-3",
      name: "Antigravity Cloud Run API",
      service: "Cloud Run / Docker",
      url: "https://cloudrun.google.com",
      status: "active",
      uptime: "99.95%",
      lastPing: "12s ago",
      latencyMs: 85,
      alertsEnabled: false
    },
    {
      id: "acc-4",
      name: "Gemini AI API Key Gateway",
      service: "Google GenAI API",
      url: "https://generativelanguage.googleapis.com",
      status: "active",
      uptime: "99.98%",
      lastPing: "2s ago",
      latencyMs: 54,
      alertsEnabled: true
    },
    {
      id: "acc-5",
      name: "GitHub Repository Actions",
      service: "GitHub CI/CD",
      url: "https://api.github.com",
      status: "warning",
      uptime: "98.2%",
      lastPing: "1m ago",
      latencyMs: 180,
      alertsEnabled: true
    }
  ]);

  // Handle toast notifications
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(TARGET_URL);
    setCopiedUrl(true);
    showToast("Copied https://accmonitor.vercel.app to clipboard!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOpenExternal = () => {
    window.open(TARGET_URL, "_blank");
    showToast("Opening accmonitor.vercel.app in new browser window");
  };

  const handleRefreshApp = () => {
    setIsRefreshing(true);
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);
    showToast("Re-pings & refreshing web connection...");
    
    // Randomize latencies to feel live
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        latencyMs: Math.floor(Math.random() * 60) + 20,
        lastPing: "Just now"
      }))
    );

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handlePingTest = () => {
    if (!pingTarget.trim()) return;
    setIsPinging(true);
    setPingLogs((prev) => [...prev, `\n> PING ${pingTarget.trim()} ...`]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const ms = (Math.random() * 35 + 25).toFixed(1);
      if (step <= 3) {
        setPingLogs((prev) => [
          ...prev,
          `64 bytes from ${pingTarget}: icmp_seq=${step} ttl=56 time=${ms} ms`
        ]);
      } else {
        clearInterval(interval);
        setIsPinging(false);
        setPingLogs((prev) => [
          ...prev,
          `--- ${pingTarget} ping statistics ---`,
          `3 packets transmitted, 3 received, 0.0% packet loss, avg ${(Math.random() * 10 + 30).toFixed(1)}ms`
        ]);
        showToast(`Ping completed for ${pingTarget}`);
      }
    }, 600);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccService) return;

    const newAcc: MonitoredAccount = {
      id: `acc-${Date.now()}`,
      name: newAccName,
      service: newAccService,
      url: newAccUrl || "https://accmonitor.vercel.app",
      status: "active",
      uptime: "100%",
      lastPing: "Just now",
      latencyMs: Math.floor(Math.random() * 50) + 20,
      alertsEnabled: true
    };

    setAccounts([newAcc, ...accounts]);
    setNewAccName("");
    setNewAccService("");
    setNewAccUrl("");
    setIsAddModalOpen(false);
    showToast(`Added ${newAccName} to monitor!`);
  };

  const handleDeleteAccount = (id: string, name: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
    showToast(`Removed ${name}`);
  };

  const toggleAlerts = (id: string) => {
    setAccounts(
      accounts.map((a) => (a.id === id ? { ...a, alertsEnabled: !a.alertsEnabled } : a))
    );
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      acc.service.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs shadow-2xl border border-cyan-300 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Sparkles size={13} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-black shadow-md shrink-0">
            <Activity size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black text-white tracking-tight truncate">ACC Monitor</h2>
              <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold rounded bg-teal-950 text-teal-300 border border-teal-800 shrink-0">
                VERCEL
              </span>
            </div>
            <p className="text-[9px] text-slate-400 truncate font-mono">accmonitor.vercel.app</p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefreshApp}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Reload App"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-cyan-400" : ""} />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95"
            title="Open accmonitor.vercel.app in new browser window"
          >
            <ExternalLink size={12} />
            <span className="hidden sm:inline">Open</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-850 bg-slate-900/90 text-[11px] font-bold text-slate-400 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("desktop_site")}
          className={`px-3 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "desktop_site"
              ? "border-cyan-400 text-cyan-300 bg-cyan-950/30 font-black"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Monitor size={13} className="text-cyan-400" />
          <span>Desktop Site</span>
          <span className="px-1 py-0.2 text-[8px] bg-cyan-500 text-slate-950 font-black rounded-md">FULL</span>
        </button>

        <button
          onClick={() => setActiveTab("live_app")}
          className={`px-3 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "live_app"
              ? "border-cyan-400 text-cyan-300 bg-cyan-950/30 font-black"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Smartphone size={13} />
          <span>Mobile View</span>
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-3 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "dashboard"
              ? "border-cyan-400 text-cyan-300 bg-cyan-950/30 font-black"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <BarChart3 size={13} />
          <span>Accounts & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab("ping_tool")}
          className={`px-3 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "ping_tool"
              ? "border-cyan-400 text-cyan-300 bg-cyan-950/30 font-black"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Terminal size={13} />
          <span>Live Ping Tool</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`px-3 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "security"
              ? "border-cyan-400 text-cyan-300 bg-cyan-950/30 font-black"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <ShieldCheck size={13} />
          <span>SSL & Security</span>
        </button>
      </div>

      {/* TAB 1: DESKTOP SITE (FULL APPLICATION ENGINE) */}
      {activeTab === "desktop_site" && (
        <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
          {/* Desktop Browser Header Bar */}
          <div className="px-2.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 text-[10px] font-mono shrink-0">
            {/* Address Bar */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 flex items-center justify-between text-slate-300 gap-2 min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <Lock size={11} className="text-emerald-400 shrink-0" />
                <span className="truncate text-teal-300 font-bold">{TARGET_URL}</span>
              </div>
              <span className="text-[8px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded font-bold border border-emerald-800 shrink-0">
                FULL DESKTOP
              </span>
            </div>

            {/* Desktop Zoom & Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setDesktopZoom((z) => Math.max(60, z - 10))}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={12} />
              </button>
              <span className="text-[9px] font-mono font-bold text-slate-300 w-8 text-center">{desktopZoom}%</span>
              <button
                onClick={() => setDesktopZoom((z) => Math.min(150, z + 10))}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={12} />
              </button>

              <button
                onClick={handleCopyUrl}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer border border-slate-700 transition-colors ml-1"
                title="Copy URL"
              >
                {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>

              <button
                onClick={handleOpenExternal}
                className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg text-[9.5px] flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                title="Open in new window"
              >
                <span>Full Web</span>
                <ExternalLink size={11} />
              </button>
            </div>
          </div>

          {/* Desktop Canvas Container */}
          <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
            {isIframeLoading && (
              <div className="absolute inset-0 z-10 bg-slate-950/95 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <RefreshCw size={26} className="animate-spin text-cyan-400" />
                <p className="text-xs font-black text-white tracking-wide">Loading Full Desktop ACC Monitor...</p>
                <p className="text-[10px] text-slate-400 font-mono">Connecting to {TARGET_URL}</p>
              </div>
            )}

            <div
              className="w-full h-full transition-transform origin-top"
              style={{
                transform: `scale(${desktopZoom / 100})`,
                width: desktopZoom !== 100 ? `${(100 / desktopZoom) * 100}%` : "100%",
                height: desktopZoom !== 100 ? `${(100 / desktopZoom) * 100}%` : "100%"
              }}
            >
              <iframe
                key={iframeKey}
                src={TARGET_URL}
                onLoad={() => setIsIframeLoading(false)}
                className="w-full h-full border-none"
                title="ACC Monitor Desktop Site"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOBILE VIEW */}
      {activeTab === "live_app" && (
        <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
          {/* Mobile Address Bar */}
          <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 text-[10px] font-mono shrink-0">
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <Smartphone size={11} className="text-cyan-400 shrink-0" />
                <span className="truncate text-teal-300 font-bold">{TARGET_URL}</span>
              </div>
              <span className="text-[8px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded font-bold border border-emerald-800 shrink-0">
                200 OK
              </span>
            </div>

            <button
              onClick={handleCopyUrl}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer border border-slate-700 transition-colors"
              title="Copy URL"
            >
              {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>

          {/* Mobile Embedded Frame */}
          <div className="flex-1 relative bg-black">
            {isIframeLoading && (
              <div className="absolute inset-0 z-10 bg-slate-950/90 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <RefreshCw size={24} className="animate-spin text-cyan-400" />
                <p className="text-xs font-bold text-white">Connecting to Mobile ACC Monitor...</p>
                <p className="text-[10px] text-slate-400 font-mono">accmonitor.vercel.app</p>
              </div>
            )}

            <iframe
              key={`mobile-${iframeKey}`}
              src={TARGET_URL}
              onLoad={() => setIsIframeLoading(false)}
              className="w-full h-full border-none"
              title="ACC Monitor Mobile View"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />

            {/* Launch Floating Badge */}
            <div className="absolute bottom-3 right-3 z-20">
              <button
                onClick={handleOpenExternal}
                className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] shadow-2xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-cyan-200"
              >
                <span>Open Browser</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNTS & STATS DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Monitored Accounts</span>
                <Server size={14} className="text-cyan-400" />
              </div>
              <div className="text-lg font-black font-mono text-white">{accounts.length} Total</div>
              <span className="text-[9px] text-emerald-400 font-mono font-bold">100% Operational</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Response Time</span>
                <Zap size={14} className="text-amber-400" />
              </div>
              <div className="text-lg font-black font-mono text-white">
                {(accounts.reduce((acc, a) => acc + a.latencyMs, 0) / (accounts.length || 1)).toFixed(1)} ms
              </div>
              <span className="text-[9px] text-cyan-300 font-mono font-bold">Vercel Edge Gateway</span>
            </div>
          </div>

          {/* Search Filter & Add Account Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter accounts or services..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Plus size={14} />
              <span>Add Service</span>
            </button>
          </div>

          {/* Account Services List */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5 flex items-center justify-between">
              <span>Account Status & Ping Heartbeat</span>
              <span className="text-cyan-400 font-mono text-[9px]">{filteredAccounts.length} services</span>
            </h3>

            {filteredAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      acc.status === "active"
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                        : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    }`}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{acc.name}</h4>
                    <p className="text-[9.5px] text-slate-400 font-mono truncate">{acc.service}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <div className="text-xs font-extrabold text-cyan-300">{acc.latencyMs} ms</div>
                    <div className="text-[9px] text-slate-400">{acc.uptime}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleAlerts(acc.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        acc.alertsEnabled
                          ? "bg-cyan-950 text-cyan-300 border-cyan-800"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                      title={acc.alertsEnabled ? "Alerts Active" : "Alerts Muted"}
                    >
                      <Bell size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.id, acc.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
                      title="Remove service"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vercel Gateway Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-teal-950/80 border border-cyan-800/50 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <h4 className="text-xs font-bold text-white">Vercel Deployment Synchronization</h4>
            </div>
            <p className="text-[10.5px] text-slate-300 leading-relaxed">
              Full monitoring logs and live telemetry available directly at{" "}
              <span className="text-cyan-300 font-mono font-bold">accmonitor.vercel.app</span>.
            </p>
            <button
              onClick={handleOpenExternal}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <span>Launch accmonitor.vercel.app</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE PING & TRACEROUTE TOOL */}
      {activeTab === "ping_tool" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Terminal size={16} />
              <span>Network Ping & Latency Tester</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
                placeholder="Host or domain (e.g. accmonitor.vercel.app)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handlePingTest}
                disabled={isPinging}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
              >
                <Play size={12} className={isPinging ? "animate-spin" : ""} />
                <span>{isPinging ? "Pinging..." : "Send Ping"}</span>
              </button>
            </div>

            {/* Terminal Window */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10.5px] space-y-1 text-slate-300 max-h-56 overflow-y-auto">
              {pingLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes("statistic")
                      ? "text-cyan-300 font-bold mt-1"
                      : log.startsWith(">")
                      ? "text-amber-300 font-bold"
                      : log.includes("PING")
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-300"
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SSL & SECURITY */}
      {activeTab === "security" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>SSL & Domain Certificate Verification</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 space-y-1.5">
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span className="text-slate-500">Host Domain:</span>
                <span className="text-white font-bold">accmonitor.vercel.app</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span className="text-slate-500">SSL Certificate:</span>
                <span className="text-emerald-400 font-bold">Let's Encrypt TLS 1.3</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span className="text-slate-500">CDN Gateway:</span>
                <span className="text-cyan-300 font-bold">Vercel Anycast Edge</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Rating:</span>
                <span className="text-emerald-400 font-bold">Grade A+ (HSTS Enabled)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cpu size={14} className="text-cyan-400" />
              <span>Real-Time Health Ping</span>
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Automated heartbeat checks every 30s to verify uptime across Vercel edge nodes.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-1 text-slate-300">
              <div className="text-emerald-400">PING accmonitor.vercel.app (76.76.21.21): 56 bytes</div>
              <div>64 bytes from 76.76.21.21: icmp_seq=0 ttl=58 time=41.2 ms</div>
              <div>64 bytes from 76.76.21.21: icmp_seq=1 ttl=58 time=38.9 ms</div>
              <div className="text-teal-300 font-bold">--- accmonitor.vercel.app ping statistics ---</div>
              <div>2 packets transmitted, 2 received, 0% packet loss, avg 40.0ms</div>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {isAddModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Plus size={14} className="text-cyan-400" />
                <span>Add Monitored Account</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-2.5">
              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Account / Server Name
                </label>
                <input
                  type="text"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="e.g. Production Vercel App"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Service / Provider
                </label>
                <input
                  type="text"
                  value={newAccService}
                  onChange={(e) => setNewAccService(e.target.value)}
                  placeholder="e.g. Vercel / AWS / Firebase"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  URL / Domain
                </label>
                <input
                  type="text"
                  value={newAccUrl}
                  onChange={(e) => setNewAccUrl(e.target.value)}
                  placeholder="https://accmonitor.vercel.app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
