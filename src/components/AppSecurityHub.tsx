import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Lock,
  KeyRound,
  Globe,
  Radio,
  CloudUpload,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Play,
  Volume2
} from "lucide-react";
import { playClickSound } from "../utils/sound";

export default function AppSecurityHub() {
  const [activeTab, setActiveTab] = useState<
    "find_my_device" | "vpn" | "antivirus" | "passwords" | "backup"
  >("find_my_device");

  // VPN State
  const [isVpnConnected, setIsVpnConnected] = useState(false);
  const [vpnServer, setVpnServer] = useState("Tokyo, Japan (Ultra Fast)");

  // Antivirus State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [threatsCount, setThreatsCount] = useState(0);

  // Find My Device State
  const [isRinging, setIsRinging] = useState(false);
  const [isDeviceLocked, setIsDeviceLocked] = useState(false);

  // Password Vault State
  const [passwords, setPasswords] = useState([
    { service: "Google Account", username: "krishna@kkos.dev", pass: "••••••••••••", strength: "Strong" },
    { service: "GitHub Enterprise", username: "krishna-dev", pass: "••••••••••••", strength: "Strong" },
    { service: "State Bank UPI", username: "9876543210", pass: "••••••", strength: "Secure PIN" }
  ]);
  const [revealedPassIndex, setRevealedPassIndex] = useState<number | null>(null);

  // Backup State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState("Today, 04:30 AM");

  const handleScanNow = () => {
    playClickSound();
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setThreatsCount(0);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleBackupNow = () => {
    playClickSound();
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setLastBackupTime("Just now");
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-md">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">Security & Device Manager</h2>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 size={11} /> Knox & Play Protect Secured
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="p-2 bg-slate-950 border-b border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: "find_my_device", label: "Find My Device", icon: Smartphone },
          { id: "vpn", label: "Ultra VPN", icon: Globe },
          { id: "antivirus", label: "Antivirus & Scan", icon: Shield },
          { id: "passwords", label: "Password Vault", icon: KeyRound },
          { id: "backup", label: "Cloud Backup", icon: CloudUpload }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* FIND MY DEVICE */}
        {activeTab === "find_my_device" && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-blue-600 text-white">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white">KK-Mobile-OS Flagship</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Location: Mountain View, CA (GPS High Accuracy)</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  Online
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    playClickSound();
                    setIsRinging(!isRinging);
                  }}
                  className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isRinging
                      ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-black"
                      : "bg-slate-800 border-slate-700 text-slate-200"
                  }`}
                >
                  <Volume2 size={16} />
                  <span>{isRinging ? "Ringing Device..." : "Play Sound (Ring)"}</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setIsDeviceLocked(!isDeviceLocked);
                  }}
                  className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isDeviceLocked
                      ? "bg-rose-600 text-white border-rose-500"
                      : "bg-slate-800 border-slate-700 text-slate-200"
                  }`}
                >
                  <Lock size={16} />
                  <span>{isDeviceLocked ? "Device Locked" : "Secure & Lock"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ULTRA VPN */}
        {activeTab === "vpn" && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>PROTOCOL: WireGuard 2026</span>
              <span className={isVpnConnected ? "text-emerald-400 font-bold" : "text-slate-500"}>
                {isVpnConnected ? "ENCRYPTED" : "DISCONNECTED"}
              </span>
            </div>

            <div className="py-4">
              <button
                onClick={() => {
                  playClickSound();
                  setIsVpnConnected(!isVpnConnected);
                }}
                className={`h-28 w-28 mx-auto rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xl active:scale-95 ${
                  isVpnConnected
                    ? "bg-emerald-500 text-slate-950 shadow-[0_0_35px_#10b981]"
                    : "bg-slate-800 border-2 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <Globe size={28} className={isVpnConnected ? "animate-spin" : ""} />
                <span className="text-[11px] font-black">{isVpnConnected ? "DISCONNECT" : "CONNECT"}</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300">
              Server: <span className="font-bold text-white">{vpnServer}</span>
            </div>
          </div>
        )}

        {/* ANTIVIRUS SCANNER */}
        {activeTab === "antivirus" && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white">Full System Deep Scanner</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">{scanProgress}%</span>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300">
              Status: <span className="text-emerald-400 font-bold">0 Malicious Packages Found</span> across 52 installed apps.
            </div>

            <button
              onClick={handleScanNow}
              disabled={isScanning}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
              <span>{isScanning ? "Scanning Memory & System APKs..." : "Run Antivirus Scan"}</span>
            </button>
          </div>
        )}

        {/* PASSWORD VAULT */}
        {activeTab === "passwords" && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
              Encrypted Passwords Vault
            </h3>

            <div className="space-y-2">
              {passwords.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.service}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{item.username}</p>
                    <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                      {revealedPassIndex === idx ? "SecretPassword@2026!" : item.pass}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      playClickSound();
                      setRevealedPassIndex(revealedPassIndex === idx ? null : idx);
                    }}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    {revealedPassIndex === idx ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLOUD BACKUP */}
        {activeTab === "backup" && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-600 text-white">
                <CloudUpload size={20} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white">Google One & OS Cloud Backup</h3>
                <p className="text-[10px] text-slate-400 font-mono">Last successful snapshot: {lastBackupTime}</p>
              </div>
            </div>

            <button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <RefreshCw size={14} className={isBackingUp ? "animate-spin" : ""} />
              <span>{isBackingUp ? "Backing up Photos, Contacts & App State..." : "Backup Now"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
