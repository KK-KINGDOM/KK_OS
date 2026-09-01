import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Bot,
  Terminal,
  ShieldCheck,
  Cpu,
  Zap,
  Volume2,
  VolumeX,
  FastForward,
  Layers,
  Radio,
  HardDrive,
  Activity,
  CheckCircle2
} from "lucide-react";
import { playCinematicBootChime } from "../utils/sound";

export type BootTheme = "quantum_neon" | "cyber_matrix" | "cosmic_aurora" | "hyper_titanium" | "solar_flare";

interface BootAnimationProps {
  onComplete: () => void;
  onSystemLog?: (msg: string, level?: "INFO" | "WARNING" | "CRITICAL") => void;
  initialTheme?: BootTheme;
  autoPlaySound?: boolean;
}

export default function BootAnimation({
  onComplete,
  onSystemLog,
  initialTheme = "quantum_neon",
  autoPlaySound = true
}: BootAnimationProps) {
  const [theme, setTheme] = useState<BootTheme>(initialTheme);
  const [soundEnabled, setSoundEnabled] = useState(autoPlaySound);
  const [progress, setProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState<"bios" | "hologram" | "subsystems" | "ready">("bios");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const bootSteps = [
    { label: "ARM64 Microkernel HAL & Vector Registers", code: "HAL_V8_OK", icon: Cpu },
    { label: "Gemini Neural NPU & Multimodal Weights", code: "NEURAL_INIT", icon: Sparkles },
    { label: "SELinux Hardware Sandbox & RSA-4096 Keyring", code: "SEC_ENFORCED", icon: ShieldCheck },
    { label: "Vulkan 3D Compositor & 120Hz Display Pipeline", code: "GPU_VULKAN", icon: Zap },
    { label: "5G Ultra-Wideband & Starlink Satellite Mesh", code: "MODEM_LOCKED", icon: Radio },
    { label: "Mounting NVMe Storage & Encrypted User Space", code: "NVME_MOUNTED", icon: HardDrive }
  ];

  // Theme styling configurations
  const themeStyles = {
    quantum_neon: {
      name: "Quantum Neon",
      bg: "from-slate-950 via-teal-950 to-slate-950",
      accent: "#2dd4bf",
      accentGlow: "rgba(45, 212, 191, 0.4)",
      border: "border-teal-500/40",
      textGrad: "from-teal-200 via-cyan-100 to-emerald-300",
      coreColor: "from-teal-500 to-cyan-600",
      ring1: "border-teal-400/30",
      ring2: "border-cyan-400/40",
      ring3: "border-emerald-400/30"
    },
    cyber_matrix: {
      name: "Cyber Matrix",
      bg: "from-black via-emerald-950/80 to-black",
      accent: "#10b981",
      accentGlow: "rgba(16, 185, 129, 0.45)",
      border: "border-emerald-500/40",
      textGrad: "from-emerald-300 via-green-100 to-teal-200",
      coreColor: "from-emerald-600 to-green-500",
      ring1: "border-emerald-400/40",
      ring2: "border-green-400/30",
      ring3: "border-teal-400/40"
    },
    cosmic_aurora: {
      name: "Cosmic Aurora",
      bg: "from-slate-950 via-purple-950/70 to-indigo-950",
      accent: "#a855f7",
      accentGlow: "rgba(168, 85, 247, 0.45)",
      border: "border-purple-500/40",
      textGrad: "from-purple-200 via-pink-200 to-cyan-200",
      coreColor: "from-purple-600 via-pink-600 to-indigo-600",
      ring1: "border-purple-400/40",
      ring2: "border-pink-400/30",
      ring3: "border-indigo-400/40"
    },
    hyper_titanium: {
      name: "Hyper Titanium",
      bg: "from-slate-950 via-sky-950/60 to-slate-900",
      accent: "#38bdf8",
      accentGlow: "rgba(56, 189, 248, 0.45)",
      border: "border-sky-500/40",
      textGrad: "from-sky-200 via-white to-blue-200",
      coreColor: "from-sky-500 to-blue-600",
      ring1: "border-sky-400/40",
      ring2: "border-blue-400/30",
      ring3: "border-cyan-400/40"
    },
    solar_flare: {
      name: "Solar Flare",
      bg: "from-slate-950 via-amber-950/70 to-red-950/50",
      accent: "#f59e0b",
      accentGlow: "rgba(245, 158, 11, 0.45)",
      border: "border-amber-500/40",
      textGrad: "from-amber-200 via-orange-100 to-yellow-300",
      coreColor: "from-amber-500 via-orange-600 to-red-600",
      ring1: "border-amber-400/40",
      ring2: "border-orange-400/30",
      ring3: "border-yellow-400/40"
    }
  };

  const curStyle = themeStyles[theme];

  // Play audio boot chime
  useEffect(() => {
    if (soundEnabled) {
      const timer = setTimeout(() => {
        playCinematicBootChime();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [soundEnabled]);

  // Main boot progression sequencer
  useEffect(() => {
    onSystemLog?.("[BootEngine] Initializing ultra-fast cinematic boot pipeline...", "INFO");

    const phase1Timer = setTimeout(() => {
      setBootPhase("hologram");
    }, 600);

    const phase2Timer = setTimeout(() => {
      setBootPhase("subsystems");
    }, 1400);

    // Progress counter
    const startTime = Date.now();
    const duration = 3600; // 3.6s full boot

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      // Trigger subsystem steps sequentially
      const stepIdx = Math.floor((pct / 100) * bootSteps.length);
      setCompletedSteps((prev) => {
        const next = [];
        for (let i = 0; i < stepIdx; i++) next.push(i);
        return next;
      });

      if (pct >= 100) {
        clearInterval(interval);
        setBootPhase("ready");
        setTimeout(() => {
          onSystemLog?.("[BootEngine] System boot successful -> Entering Lock Screen", "INFO");
          onComplete();
        }, 500);
      }
    }, 45);

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearInterval(interval);
    };
  }, []);

  const handleSkip = () => {
    onSystemLog?.("[BootEngine] Fast-boot requested -> Bypassing animation", "INFO");
    onComplete();
  };

  return (
    <div
      className={`absolute inset-0 z-50 bg-gradient-to-b ${curStyle.bg} flex flex-col items-center justify-between p-4 overflow-hidden select-none font-sans text-white`}
    >
      {/* Background Animated Particle Grid & Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing Nebula Plasma Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, 90, 180]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: curStyle.accentGlow }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            rotate: [180, 270, 360]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: curStyle.accentGlow }}
        />

        {/* Matrix / Cyber Grid Scanlines */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${curStyle.accent} 1px, transparent 0)`,
            backgroundSize: "20px 20px"
          }}
        />

        {/* Laser Scanning Beam */}
        <motion.div
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent pointer-events-none"
        />
      </div>

      {/* Top Header: Telemetry & Controls */}
      <div className="relative z-20 w-full flex items-center justify-between pt-3 px-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300 backdrop-blur-md shadow-lg">
          <Activity size={12} className="animate-pulse" style={{ color: curStyle.accent }} />
          <span>KK SECURE BOOT v2.5</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playCinematicBootChime();
            }}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
            title={soundEnabled ? "Mute Boot Audio" : "Unmute Boot Audio"}
          >
            {soundEnabled ? <Volume2 size={13} style={{ color: curStyle.accent }} /> : <VolumeX size={13} />}
          </button>

          {/* Fast Boot / Skip */}
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span>Skip</span>
            <FastForward size={11} />
          </button>
        </div>
      </div>

      {/* Center: Holographic 3D Orbital Rings & Glowing KK Crest */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto">
        <div className="relative w-44 h-44 flex items-center justify-center">
          
          {/* Outer Orbital Ring 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 rounded-full border-2 border-dashed ${curStyle.ring1} pointer-events-none`}
            style={{ boxShadow: `0 0 20px ${curStyle.accentGlow}` }}
          />

          {/* Middle Orbital Ring 2 (Counter-clockwise tilt) */}
          <motion.div
            animate={{ rotate: -360, scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute inset-3 rounded-full border-2 ${curStyle.ring2} border-t-transparent border-b-transparent pointer-events-none`}
          />

          {/* Inner High-Speed Particle Ring 3 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-7 rounded-full border border-dashed ${curStyle.ring3} pointer-events-none`}
          />

          {/* Central Holographic Plasma Node */}
          <motion.div
            animate={{
              scale: [0.92, 1.08, 0.92],
              boxShadow: [
                `0 0 25px ${curStyle.accentGlow}`,
                `0 0 50px ${curStyle.accent}`,
                `0 0 25px ${curStyle.accentGlow}`
              ]
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className={`relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-tr ${curStyle.coreColor} p-[2px] shadow-2xl flex items-center justify-center`}
          >
            <div className="w-full h-full rounded-[22px] bg-slate-950/90 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
              {/* Inner energetic particle pulse */}
              <div
                className="absolute inset-0 opacity-40 blur-md pointer-events-none"
                style={{ background: `radial-gradient(circle, ${curStyle.accent} 0%, transparent 70%)` }}
              />

              {/* Bot / KK Monogram Logo */}
              <Bot size={42} className="relative z-10 drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" style={{ color: curStyle.accent }} />
              <Sparkles size={16} className="absolute top-2 right-2 text-white animate-pulse" />
            </div>
          </motion.div>

          {/* 4 Orbiting Satellite Photon Sparks */}
          {[0, 90, 180, 270].map((deg, idx) => (
            <motion.div
              key={idx}
              animate={{ rotate: [deg, deg + 360] }}
              transition={{ duration: 4 + idx * 0.8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-start justify-center pointer-events-none"
            >
              <div
                className="w-2.5 h-2.5 rounded-full -mt-1 shadow-lg"
                style={{
                  backgroundColor: curStyle.accent,
                  boxShadow: `0 0 10px ${curStyle.accent}`
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Title & Brand Typography */}
        <div className="mt-5 text-center space-y-1">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl font-black tracking-widest uppercase bg-gradient-to-r ${curStyle.textGrad} bg-clip-text text-transparent drop-shadow-md`}
          >
            KK MOBILE OS
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-widest"
          >
            <span style={{ color: curStyle.accent }}>●</span>
            <span>Quantum Microkernel Architecture</span>
            <span style={{ color: curStyle.accent }}>●</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom: Subsystems Checklist & Laser Progress Bar */}
      <div className="relative z-20 w-full space-y-3 pb-2">
        {/* Real-time Subsystem Initialization Checklist */}
        <div className="w-full bg-slate-950/85 border border-slate-800/80 rounded-2xl p-2.5 backdrop-blur-xl shadow-xl space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Terminal size={11} style={{ color: curStyle.accent }} />
              Subsystem Handshake
            </span>
            <span className="text-[9px] font-bold" style={{ color: curStyle.accent }}>
              {completedSteps.length} / {bootSteps.length} Verified
            </span>
          </div>

          <div className="space-y-1 max-h-20 overflow-hidden">
            {bootSteps.map((step, idx) => {
              const isDone = completedSteps.includes(idx);
              const isCurrent = !isDone && (idx === 0 || completedSteps.includes(idx - 1));
              const StepIcon = step.icon;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between text-[9px] font-mono transition-all duration-200 ${
                    isDone
                      ? "text-emerald-400 font-medium"
                      : isCurrent
                      ? "text-cyan-300 animate-pulse font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <StepIcon size={10} className={isDone ? "text-emerald-400" : isCurrent ? "text-cyan-300" : "text-slate-600"} />
                    <span className="truncate">{step.label}</span>
                  </div>
                  <span className="shrink-0 text-[8px] uppercase tracking-wider">
                    {isDone ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-400">
                        <CheckCircle2 size={9} /> OK
                      </span>
                    ) : isCurrent ? (
                      <span className="text-cyan-300 font-bold">INIT...</span>
                    ) : (
                      "WAIT"
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Laser Progress Bar & Numeric Readout */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap size={11} style={{ color: curStyle.accent }} />
              {progress < 100 ? "Booting System Vectors..." : "User Environment Ready"}
            </span>
            <span className="font-bold font-mono tracking-wider text-sm" style={{ color: curStyle.accent }}>
              {progress}%
            </span>
          </div>

          {/* Glowing Track */}
          <div className="relative w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full relative"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${curStyle.accent} 0%, #38bdf8 100%)`,
                boxShadow: `0 0 12px ${curStyle.accent}`
              }}
            >
              {/* Animated Laser Spark Head */}
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-[1px] rounded-full animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Theme Selector Palette Pills */}
        <div className="flex items-center justify-center gap-1 pt-1">
          {(Object.keys(themeStyles) as BootTheme[]).map((tKey) => {
            const t = themeStyles[tKey];
            const active = theme === tKey;
            return (
              <button
                key={tKey}
                onClick={() => setTheme(tKey)}
                className={`px-2 py-0.5 rounded-full text-[8px] font-mono transition-all cursor-pointer ${
                  active
                    ? "bg-white/20 text-white font-bold border border-white/40 shadow-sm"
                    : "bg-slate-900/60 text-slate-500 hover:text-slate-300 border border-slate-800/60"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
