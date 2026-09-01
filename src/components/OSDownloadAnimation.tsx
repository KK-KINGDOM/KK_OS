import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  CloudDownload,
  HardDrive,
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Radio,
  Server,
  Activity,
  Terminal,
  Layers,
  FileCode,
  Volume2,
  VolumeX
} from "lucide-react";
import { playDownloadTickSound, playFlashSuccessSound } from "../utils/sound";

interface OSDownloadAnimationProps {
  onRebootToNewOS: () => void;
  onClose?: () => void;
  onSystemLog?: (msg: string, level?: "INFO" | "WARNING" | "CRITICAL") => void;
  versionName?: string;
  totalSizeGB?: number;
}

export default function OSDownloadAnimation({
  onRebootToNewOS,
  onClose,
  onSystemLog,
  versionName = "KK Mobile OS v2.5 (Quantum Edition)",
  totalSizeGB = 3.84
}: OSDownloadAnimationProps) {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeedMB, setDownloadSpeedMB] = useState(148.5);
  const [downloadPhase, setDownloadPhase] = useState<"connecting" | "downloading" | "verifying" | "flashing" | "ready">("connecting");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashedSectors, setFlashedSectors] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"visual" | "terminal" | "sectors">("visual");

  const [downloadLogLines, setDownloadLogLines] = useState<string[]>([
    "[DNS] Resolved cdn.kkos.deepmind.org -> 104.244.42.1 (5G Node)",
    "[TLS] Handshake established with TLSv1.3 & ChaCha20-Poly1305",
    "[HTTP/3] QUIC Stream #0 initialized: GET /firmware/kk-os-v2.5-quantum.img",
    "[STORAGE] Pre-allocating 3.84 GB NVMe Flash memory block..."
  ]);

  // Total sectors for flashing animation
  const totalSectors = 16;

  // Main download progression loop
  useEffect(() => {
    onSystemLog?.(`[OSDownloader] Commencing firmware package retrieval for ${versionName}`, "INFO");

    const timer1 = setTimeout(() => {
      setDownloadPhase("downloading");
    }, 800);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) return 100;
        const increment = Math.random() * 2.8 + 1.2;
        const next = Math.min(100, prev + increment);

        // Sound tick
        if (soundEnabled && Math.random() > 0.6) {
          playDownloadTickSound();
        }

        // Fluctuate download speed
        setDownloadSpeedMB((prevSpd) => {
          const delta = (Math.random() - 0.48) * 18;
          return Math.max(95, Math.min(265, Number((prevSpd + delta).toFixed(1))));
        });

        // Update sectors
        const sectorsDone = Math.floor((next / 100) * totalSectors);
        setFlashedSectors(Array.from({ length: sectorsDone }, (_, i) => i));

        // State phases
        if (next >= 100) {
          clearInterval(interval);
          setDownloadPhase("verifying");

          setDownloadLogLines((logs) => [
            ...logs,
            "[DOWNLOAD] 3.84 GB downloaded in 18.2s (Avg Speed: 210.8 MB/s)",
            "[SHA-256] Calculating hash integrity over 4,096 chunk trees...",
            "[RSA-4096] Digital signature validated: KK DeepMind Foundation OK"
          ]);

          setTimeout(() => {
            setDownloadPhase("flashing");
            setDownloadLogLines((logs) => [
              ...logs,
              "[FLASH] Writing bootloader and rootfs partitions to /dev/block/bootdevice/by-name/boot_a...",
              "[KERNEL] Updating microkernel boot vector to KK OS v2.5 Quantum..."
            ]);

            setTimeout(() => {
              setDownloadPhase("ready");
              if (soundEnabled) playFlashSuccessSound();
              onSystemLog?.(`[OSDownloader] Firmware successfully flashed to System Partition A! Ready for reboot.`, "INFO");
              setDownloadLogLines((logs) => [
                ...logs,
                "========================================",
                "✨ KK MOBILE OS V2.5 INSTALLATION COMPLETE!",
                "Device is primed for Quantum Boot sequence."
              ]);
            }, 1800);
          }, 1400);

          return 100;
        }

        return Number(next.toFixed(1));
      });
    }, 120);

    return () => {
      clearTimeout(timer1);
      clearInterval(interval);
    };
  }, [soundEnabled, versionName, onSystemLog]);

  const currentDownloadedGB = Number(((downloadProgress / 100) * totalSizeGB).toFixed(2));
  const etaSeconds = downloadProgress >= 100 ? 0 : Math.max(1, Math.round(((100 - downloadProgress) / 100) * 12));

  return (
    <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col p-3.5 select-none font-sans text-white overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "radial-gradient(#06b6d4 1px, transparent 0)",
            backgroundSize: "24px 24px"
          }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 shadow-md">
            <CloudDownload size={16} className="animate-bounce" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>OS Downloader & Flash Hub</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-900/60 text-cyan-300 text-[8px] font-mono border border-cyan-700">
                5G ULTRA
              </span>
            </h2>
            <p className="text-[9px] font-mono text-slate-400 truncate max-w-[190px]">
              {versionName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title={soundEnabled ? "Mute audio" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={13} className="text-cyan-400" /> : <VolumeX size={13} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-mono border border-slate-800 cursor-pointer"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="relative z-10 flex items-center justify-around bg-slate-900/80 rounded-xl p-1 my-2 border border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab("visual")}
          className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
            activeTab === "visual"
              ? "bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Hologram Visual
        </button>
        <button
          onClick={() => setActiveTab("sectors")}
          className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
            activeTab === "sectors"
              ? "bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Sector Flash ({flashedSectors.length}/{totalSectors})
        </button>
        <button
          onClick={() => setActiveTab("terminal")}
          className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
            activeTab === "terminal"
              ? "bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Flash Log
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-hidden">
        {activeTab === "visual" && (
          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            {/* 3D Holographic Spinning Cube / Satellite Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer Pulsing Aura */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse" />

              {/* Data Ingestion Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border border-teal-400/50 border-t-transparent border-b-transparent"
              />

              {/* Core Floating Node */}
              <motion.div
                animate={{ y: [-4, 4, -4], scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 p-0.5 shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center"
              >
                <div className="w-full h-full rounded-[14px] bg-slate-950/90 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
                  {downloadPhase === "ready" ? (
                    <CheckCircle2 size={36} className="text-emerald-400 animate-bounce" />
                  ) : downloadPhase === "flashing" ? (
                    <HardDrive size={34} className="text-cyan-400 animate-pulse" />
                  ) : (
                    <CloudDownload size={34} className="text-cyan-300 animate-pulse" />
                  )}
                  <span className="text-[8px] font-mono text-cyan-200 mt-1 font-bold">
                    {downloadProgress}%
                  </span>
                </div>
              </motion.div>

              {/* Streaming Download Photons from Satellite Node */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-40, 50],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeIn"
                  }}
                  className="absolute w-1.5 h-3 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
                  style={{
                    left: `${30 + i * 8}%`
                  }}
                />
              ))}
            </div>

            {/* Status Telemetry Text */}
            <div className="text-center space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center justify-center gap-1.5">
                {downloadPhase === "connecting" && "Establishing 5G Handshake..."}
                {downloadPhase === "downloading" && `Streaming Quantum Core Packages...`}
                {downloadPhase === "verifying" && "Verifying SHA-256 Checksums..."}
                {downloadPhase === "flashing" && "Writing to NVMe Partition A..."}
                {downloadPhase === "ready" && "OS Firmware Ready for Boot!"}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {downloadPhase === "ready"
                  ? "All 16 partition sectors updated to v2.5 Quantum"
                  : `${currentDownloadedGB} GB of ${totalSizeGB} GB (${etaSeconds}s remaining)`}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sectors" && (
          <div className="w-full h-full flex flex-col justify-center space-y-3 p-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Partition Matrix (/dev/nvme0n1p1)</span>
              <span className="text-cyan-400 font-bold">{flashedSectors.length} / {totalSectors} Written</span>
            </div>

            {/* 4x4 Flash Memory Grid */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: totalSectors }).map((_, idx) => {
                const isFlashed = flashedSectors.includes(idx);
                const isWriting = !isFlashed && idx === flashedSectors.length;

                return (
                  <div
                    key={idx}
                    className={`h-12 rounded-xl p-1.5 flex flex-col justify-between border transition-all duration-300 ${
                      isFlashed
                        ? "bg-cyan-950/80 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.3)] text-cyan-300"
                        : isWriting
                        ? "bg-slate-900 border-cyan-400 animate-pulse text-cyan-200"
                        : "bg-slate-950 border-slate-800/80 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[8px] font-mono">
                      <span>SEC_{idx + 1}</span>
                      {isFlashed ? <CheckCircle2 size={9} className="text-cyan-400" /> : <Layers size={8} />}
                    </div>
                    <div className="text-[7px] font-mono truncate">
                      {isFlashed ? "256MB OK" : isWriting ? "WRITING..." : "PENDING"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="w-full h-full bg-black/90 rounded-2xl p-2.5 border border-slate-800 font-mono text-[9px] text-cyan-400 overflow-y-auto space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 border-b border-slate-800 pb-1 mb-1">
              <Terminal size={11} className="text-cyan-400" />
              <span>KK OTA Daemon Output Stream</span>
            </div>
            {downloadLogLines.map((line, idx) => (
              <div key={idx} className={line.startsWith("✨") ? "text-emerald-300 font-bold" : "opacity-90"}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Control Bar & Progress */}
      <div className="relative z-10 w-full space-y-2.5 pt-2 border-t border-slate-800/80 shrink-0">
        {/* Speed & Protocol Telemetry */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-cyan-400" />
            <span className="text-white font-bold">{downloadSpeedMB} MB/s</span>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span>Latency: 12ms</span>
            <span className="text-cyan-400 font-semibold">QUIC / 5G SA</span>
          </div>
        </div>

        {/* Laser Progress Bar */}
        <div className="space-y-1">
          <div className="relative w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full relative"
              style={{
                width: `${downloadProgress}%`,
                background: "linear-gradient(90deg, #06b6d4 0%, #10b981 100%)",
                boxShadow: "0 0 14px rgba(6,182,212,0.8)"
              }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-[1px] rounded-full animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Action Button: Reboot into New OS */}
        {downloadPhase === "ready" ? (
          <button
            onClick={onRebootToNewOS}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,212,191,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={14} className="animate-spin" />
            <span>Reboot & Experience Quantum Boot Animation!</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDownloadProgress(100);
              }}
              className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-cyan-300 font-semibold cursor-pointer active:scale-95 transition-all"
            >
              ⚡ Fast Forward Download
            </button>
            <button
              onClick={onRebootToNewOS}
              className="flex-1 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-[10px] font-mono text-white font-semibold cursor-pointer active:scale-95 transition-all"
            >
              🚀 Direct Reboot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
