import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Radio,
  MapPin,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  Copy,
  Terminal,
  Activity
} from "lucide-react";
import {
  stopLostDeviceBeacon,
  addLostDeviceBeaconListener,
  getIsLostDeviceBeaconActive,
  getLostDeviceBeaconRemainingSec
} from "../utils/lostDeviceBeacon";
import { AppID, LogSeverity } from "../types";

interface LostDeviceBeaconOverlayProps {
  onOpenApp?: (appId: AppID) => void;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
}

export default function LostDeviceBeaconOverlay({
  onOpenApp,
  onSystemLog
}: LostDeviceBeaconOverlayProps) {
  const [isActive, setIsActive] = useState(() => getIsLostDeviceBeaconActive());
  const [remainingSec, setRemainingSec] = useState(() => getLostDeviceBeaconRemainingSec());
  const [strobeColor, setStrobeColor] = useState<"white" | "cyan" | "amber">("white");
  const [copied, setCopied] = useState(false);

  // Subscribe to beacon status events
  useEffect(() => {
    const unsub = addLostDeviceBeaconListener((detail) => {
      setIsActive(detail.active);
      setRemainingSec(detail.remainingSeconds);
    });
    return () => unsub();
  }, []);

  // Screen Strobe Flash Interval
  useEffect(() => {
    if (!isActive) return;

    const strobeInterval = setInterval(() => {
      setStrobeColor((prev) => {
        if (prev === "white") return "cyan";
        if (prev === "cyan") return "amber";
        return "white";
      });
    }, 250);

    return () => clearInterval(strobeInterval);
  }, [isActive]);

  const handleDismiss = () => {
    stopLostDeviceBeacon();
    onSystemLog?.("[SecurityDaemon] Lost device recovery beacon silenced by user gesture", "INFO");
  };

  const handleCopyGps = () => {
    const coords = "37.7749° N, -122.4194° W (Altitude: 42m, Accuracy: ±1.2m)";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(coords).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="lost-device-beacon-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-between p-4 select-none"
        id="lost-device-beacon-screen-strobe"
      >
        {/* STROBE SCREEN FLASH BACKGROUND LAYER */}
        <motion.div
          animate={{
            opacity: [0.35, 0.95, 0.35],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 pointer-events-none transition-colors duration-150 ${
            strobeColor === "white"
              ? "bg-white/40 shadow-[inset_0_0_80px_rgba(255,255,255,0.9)]"
              : strobeColor === "cyan"
              ? "bg-cyan-500/35 shadow-[inset_0_0_80px_rgba(6,182,212,0.9)]"
              : "bg-amber-500/35 shadow-[inset_0_0_80px_rgba(245,158,11,0.9)]"
          }`}
        />

        {/* Ambient Darkened Backdrop with Sonar Ripple */}
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md -z-1" />

        {/* TOP ALERT HEADER */}
        <div className="relative z-10 space-y-2">
          <div className="p-3 rounded-2xl bg-rose-950/90 border border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.6)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-rose-400 opacity-75" />
                <div className="p-2 rounded-xl bg-rose-600 text-white relative z-10 shadow-md">
                  <ShieldAlert size={20} className="animate-bounce" />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                  LOST DEVICE RECOVERY BEACON
                  <span className="bg-rose-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded font-mono uppercase animate-pulse">
                    ACTIVE
                  </span>
                </h3>
                <p className="text-[9.5px] font-mono text-rose-200">
                  Acoustic siren emitting & screen strobe flashing
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-rose-500/60 font-mono text-right shrink-0">
              <span className="text-[8px] text-rose-300 block uppercase font-bold">Timeout</span>
              <span className="text-xs font-black text-white">{remainingSec}s</span>
            </div>
          </div>
        </div>

        {/* CENTER RADAR & ACOUSTIC SONAR VISUALIZER */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
          {/* Radar Ripple Container */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Concentric expanding acoustic sonar rings */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                animate={{
                  scale: [1, 2.2],
                  opacity: [0.8, 0]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: (ring - 1) * 0.6,
                  ease: "easeOut"
                }}
                className="absolute w-28 h-28 rounded-full border-2 border-cyan-400 pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.8)]"
              />
            ))}

            {/* Pulsating Center Acoustic Core */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                boxShadow: [
                  "0 0 20px rgba(6,182,212,0.6)",
                  "0 0 40px rgba(244,63,94,0.9)",
                  "0 0 20px rgba(6,182,212,0.6)"
                ]
              }}
              transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 via-amber-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-2xl relative z-10"
            >
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center text-cyan-300">
                <Radio size={28} className="animate-pulse text-cyan-400" />
                <span className="text-[8px] font-mono font-black uppercase text-white mt-1">105 dB</span>
              </div>
            </motion.div>
          </div>

          {/* Telemetry HUD Panel */}
          <div className="w-full mt-3 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-2 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[9px] font-mono font-bold text-cyan-300 flex items-center gap-1">
                <MapPin size={11} className="text-rose-400" />
                Triangulated GPS Beacon
              </span>
              <button
                onClick={handleCopyGps}
                className="text-[8.5px] font-mono text-cyan-400 hover:text-white flex items-center gap-1 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 cursor-pointer"
              >
                {copied ? <CheckCircle2 size={10} className="text-emerald-400" /> : <Copy size={10} />}
                <span>{copied ? "Copied" : "Copy GPS"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[8px]">Coordinates</span>
                <span className="text-white font-black">37.7749° N, -122.4194° W</span>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[8px]">Accuracy & Alt</span>
                <span className="text-emerald-300 font-bold">±1.2m • 42m MSL</span>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[8px]">Strobe Flash</span>
                <span className="text-amber-300 font-bold">4 Hz High-Vis Pulse</span>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[8px]">Siren Output</span>
                <span className="text-cyan-300 font-bold">Dual-Harmonic 105dB</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="relative z-10 space-y-2 pt-2">
          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.7)] active:scale-95 transition-all"
          >
            <VolumeX size={16} />
            <span>SILENCE SIREN & DISMISS BEACON</span>
          </button>

          {onOpenApp && (
            <div className="flex items-center justify-center gap-2 text-[9.5px] font-mono text-slate-300">
              <span>Terminal command:</span>
              <button
                onClick={() => {
                  stopLostDeviceBeacon();
                  onOpenApp(AppID.TERMINAL);
                }}
                className="text-cyan-300 hover:text-cyan-200 underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <Terminal size={10} />
                <span>Open Terminal</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
