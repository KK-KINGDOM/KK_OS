import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import {
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Radio,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Volume1,
  Flashlight,
  Camera,
  RotateCw,
  Lock,
  Settings as SettingsIcon,
  Zap,
  ZapOff,
  BellOff,
  Bell,
  Sparkles,
  RefreshCw,
  HardDrive,
  Cloud,
  Sunset,
  Trash2,
  ChevronUp,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sliders,
  ShieldCheck,
  Smartphone,
  Flame,
  Activity,
  Maximize2,
  Gauge
} from "lucide-react";
import { AppID, LogSeverity } from "../types";
import {
  playClickSound,
  playAppLaunchSound,
  setMuted,
  playVolumeTickSound,
  playVolumeMuteSound,
  playVolumeMaxSound
} from "../utils/sound";
import { captureScreen } from "../utils/screenCapture";

export interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  // Volume & Audio Mixer
  volume?: number;
  onVolumeChange?: (val: number) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenVolumeMixer?: () => void;
  // Radios & Network
  wifi: boolean;
  onToggleWifi: (enabled: boolean) => void;
  bluetooth: boolean;
  onToggleBluetooth: (enabled: boolean) => void;
  mobileData: boolean;
  onToggleMobileData: (enabled: boolean) => void;
  airplaneMode: boolean;
  onToggleAirplaneMode: (enabled: boolean) => void;
  signalBars?: number;
  // Display & Brightness
  brightness: number;
  onBrightnessChange: (val: number) => void;
  // Power & Battery Management
  batteryLevel: number;
  onBatteryChange?: (newLevel: number) => void;
  isCharging: boolean;
  onToggleCharging: (charging: boolean) => void;
  isBatterySaver: boolean;
  onToggleBatterySaver?: (saver: boolean) => void;
  performanceMode?: "high_performance" | "power_efficient";
  onPerformanceModeChange?: (mode: "high_performance" | "power_efficient") => void;
  // Dark Mode & Warm Low-Blue Filter
  darkModeScheduler?: {
    enabled: boolean;
    isWarmActive: boolean;
    warmIntensity: number;
    mode: string;
  };
  onToggleWarmMode?: () => void;
  onToggleDarkModeScheduler?: () => void;
  // System Tools & Navigation
  onOpenApp?: (appId: AppID) => void;
  onOpenStorageManager?: () => void;
  onOpenNotificationCenter?: () => void;
  onSystemLog: (log: string, severity?: LogSeverity) => void;
  triggerVibration: (intensity?: "light" | "medium" | "heavy") => void;
  currentTime?: string;
  onShowToast?: (message: string) => void;
  activeAppId?: AppID | null;
}

export default function ControlCenterOverlay({
  isOpen,
  onClose,
  volume: controlledVolume,
  onVolumeChange: onControlledVolumeChange,
  isMuted: controlledIsMuted,
  onToggleMute: onControlledToggleMute,
  onOpenVolumeMixer,
  wifi,
  onToggleWifi,
  bluetooth,
  onToggleBluetooth,
  mobileData,
  onToggleMobileData,
  airplaneMode,
  onToggleAirplaneMode,
  signalBars = 4,
  brightness,
  onBrightnessChange,
  batteryLevel,
  onBatteryChange,
  isCharging,
  onToggleCharging,
  isBatterySaver,
  onToggleBatterySaver,
  performanceMode = "power_efficient",
  onPerformanceModeChange,
  darkModeScheduler,
  onToggleWarmMode,
  onToggleDarkModeScheduler,
  onOpenApp,
  onOpenStorageManager,
  onOpenNotificationCenter,
  onSystemLog,
  triggerVibration,
  currentTime,
  onShowToast = () => {},
  activeAppId
}: ControlCenterProps) {
  // Local quick toggles state
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [rotationLock, setRotationLock] = useState(false);
  const [dndActive, setDndActive] = useState(false);
  const [hotspotActive, setHotspotActive] = useState(false);
  const [localVolume, setLocalVolume] = useState(75);
  const [localIsMuted, setLocalIsMuted] = useState(false);
  const [isPlayingMedia, setIsPlayingMedia] = useState(false);
  const [activeTab, setActiveTab] = useState<"controls" | "battery_health">("controls");

  const currentVolume = controlledVolume !== undefined ? controlledVolume : localVolume;
  const currentIsMuted = controlledIsMuted !== undefined ? controlledIsMuted : localIsMuted;

  // Long-press Bluetooth for expanded details
  const [isBtMenuOpen, setIsBtMenuOpen] = useState(false);
  const [isWifiMenuOpen, setIsWifiMenuOpen] = useState(false);

  // Drag-to-dismiss threshold tracker
  const handleDragEnd = (_: any, info: PanInfo) => {
    // If dragged UP by > 40px or with upward velocity -> close Control Center
    if (info.offset.y < -40 || info.velocity.y < -300) {
      playClickSound();
      triggerVibration("light");
      onClose();
    }
  };

  // Screenshot Action
  const handleTakeScreenshot = () => {
    playClickSound();
    triggerVibration("medium");
    onClose();
    setTimeout(() => {
      captureScreen({
        activeAppId,
        batteryLevel,
        currentTime: currentTime || "10:45",
        onSystemLog: (msg, sev) => onSystemLog(msg, sev)
      });
      onShowToast("📸 Screenshot captured from Control Center!");
    }, 150);
  };

  // Toggle Flashlight
  const handleToggleFlashlight = () => {
    const nextState = !flashlightOn;
    setFlashlightOn(nextState);
    triggerVibration("light");
    playClickSound();
    onShowToast(nextState ? "🔦 Flashlight: ON (High Output LED)" : "🔦 Flashlight: OFF");
    onSystemLog(`[HAL_Lights] Flashlight torch toggled ${nextState ? "ON" : "OFF"}`);
  };

  // Toggle Rotation Lock
  const handleToggleRotation = () => {
    const next = !rotationLock;
    setRotationLock(next);
    triggerVibration("light");
    playClickSound();
    onShowToast(next ? "🔒 Screen Rotation: Locked to Portrait" : "🔄 Screen Rotation: Auto-Rotate Enabled");
    onSystemLog(`[WindowManager] Rotation lock set to: ${next ? "PORTRAIT_LOCKED" : "SENSOR_AUTO"}`);
  };

  // Toggle Do Not Disturb
  const handleToggleDnd = () => {
    const next = !dndActive;
    setDndActive(next);
    triggerVibration("medium");
    playClickSound();
    onShowToast(next ? "🌙 Do Not Disturb: ACTIVE (Silent Mode)" : "🔔 Do Not Disturb: OFF (All Alerts Restored)");
    onSystemLog(`[AudioPolicy] DND mode switched to ${next ? "ACTIVE" : "DISABLED"}`);
  };

  // Toggle Hotspot
  const handleToggleHotspot = () => {
    const next = !hotspotActive;
    setHotspotActive(next);
    triggerVibration("light");
    playClickSound();
    onShowToast(next ? "📡 Personal Hotspot: ON (SSID: KK-OS-5G)" : "📡 Personal Hotspot: OFF");
    onSystemLog(`[TetheringDaemon] Wi-Fi Hotspot daemon ${next ? "started" : "stopped"}`);
  };

  // Volume Controller
  const handleVolumeChange = (newVal: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newVal)));
    if (onControlledVolumeChange) {
      onControlledVolumeChange(clamped);
    } else {
      setLocalVolume(clamped);
      if (clamped === 0) {
        setLocalIsMuted(true);
        setMuted(true);
      } else if (localIsMuted) {
        setLocalIsMuted(false);
        setMuted(false);
      }
    }

    // Audio and tactile feedback
    if (clamped === 0) {
      triggerVibration("heavy");
      playVolumeMuteSound();
    } else if (clamped === 100) {
      triggerVibration("medium");
      playVolumeMaxSound();
    } else {
      triggerVibration("light");
      playVolumeTickSound(clamped);
    }
  };

  const handleToggleMute = () => {
    if (onControlledToggleMute) {
      onControlledToggleMute();
    } else {
      const nextMuted = !currentIsMuted;
      setLocalIsMuted(nextMuted);
      setMuted(nextMuted);
      triggerVibration(nextMuted ? "heavy" : "light");
      if (nextMuted) playVolumeMuteSound();
      else playVolumeTickSound(currentVolume);
      onShowToast(nextMuted ? "🔇 Audio Muted" : "🔊 Audio Restored");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xl flex flex-col justify-between select-none overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Top interactive drag container */}
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          drag="y"
          dragConstraints={{ top: -300, bottom: 0 }}
          dragElastic={{ top: 0.15, bottom: 0 }}
          onDragEnd={handleDragEnd}
          className="w-full bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950/95 border-b border-slate-750 rounded-b-[32px] p-3.5 space-y-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[92%] overflow-y-auto scrollbar-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER BAR */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-teal-950/90 text-teal-400 border border-teal-800 shadow-inner">
                <Sliders size={14} className="text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-white tracking-wider uppercase font-sans">
                    Control Center
                  </span>
                  <span className="text-[7.5px] px-1 py-0.2 rounded font-mono font-bold bg-teal-950 text-teal-300 border border-teal-700">
                    KK-OS 1.4
                  </span>
                </div>
                <span className="text-[8.5px] text-slate-400 font-mono">
                  {currentTime || "10:45"} • {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-1.5">
              {onOpenNotificationCenter && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNotificationCenter();
                    triggerVibration("light");
                  }}
                  className="p-1.5 rounded-xl bg-teal-950 hover:bg-teal-900 text-teal-300 hover:text-white border border-teal-700/80 cursor-pointer transition-colors flex items-center gap-1"
                  title="Open Notification Center"
                >
                  <Bell size={13} />
                  <span className="text-[8.5px] font-bold hidden sm:inline">Alerts</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenApp?.(AppID.SETTINGS);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                title="Open Settings App"
              >
                <SettingsIcon size={13} />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  triggerVibration("light");
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-teal-900/60 text-teal-300 hover:text-teal-200 border border-slate-700 cursor-pointer transition-colors flex items-center gap-1 text-[9px] font-bold"
                title="Close Control Center (Swipe up)"
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          {/* 1. PRIMARY RADIO TILES (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Wi-Fi Tile */}
            <div
              className={`p-2.5 rounded-2xl border transition-all relative select-none cursor-pointer flex flex-col justify-between ${
                wifi
                  ? "bg-teal-600/90 border-teal-400 text-white shadow-[0_0_15px_rgba(20,184,166,0.35)]"
                  : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => {
                const next = !wifi;
                onToggleWifi(next);
                if (next && airplaneMode) {
                  onToggleAirplaneMode(false);
                }
                triggerVibration("light");
                onShowToast(next ? "📶 Wi-Fi Connected: KK-Fiber-5G" : "📶 Wi-Fi Disabled");
                onSystemLog(`[NetworkHAL] Wi-Fi state changed to ${next ? "ENABLED" : "DISABLED"}`);
              }}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${wifi ? "bg-teal-950 text-teal-200" : "bg-slate-900 text-slate-500"}`}>
                  <Wifi size={16} className={wifi ? "text-teal-300" : "text-slate-500"} />
                </div>
                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full ${wifi ? "bg-teal-950 text-teal-200 border border-teal-700" : "bg-slate-900 text-slate-500"}`}>
                  {wifi ? "ON" : "OFF"}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-[10.5px] font-extrabold block text-white">Wi-Fi</span>
                <span className="text-[8px] font-mono opacity-80 truncate block">
                  {wifi ? "KK-Fiber-5GHz" : "Disconnected"}
                </span>
              </div>
            </div>

            {/* Bluetooth Tile */}
            <div
              className={`p-2.5 rounded-2xl border transition-all relative select-none cursor-pointer flex flex-col justify-between ${
                bluetooth
                  ? "bg-cyan-500 border-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => {
                const next = !bluetooth;
                onToggleBluetooth(next);
                triggerVibration("light");
                onShowToast(next ? "🟦 Bluetooth: Scanning & Active" : "🟦 Bluetooth: Disabled");
                onSystemLog(`[BluetoothHAL] Bluetooth daemon switched to ${next ? "ENABLED" : "DISABLED"}`);
              }}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${bluetooth ? "bg-cyan-950 text-cyan-200" : "bg-slate-900 text-slate-500"}`}>
                  <Bluetooth size={16} className={bluetooth ? "text-cyan-300 animate-pulse" : "text-slate-500"} />
                </div>
                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full ${bluetooth ? "bg-cyan-950 text-cyan-200 border border-cyan-700" : "bg-slate-900 text-slate-500"}`}>
                  {bluetooth ? "ON" : "OFF"}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-[10.5px] font-extrabold block">Bluetooth</span>
                <span className="text-[8px] font-mono opacity-80 truncate block">
                  {bluetooth ? "KK Pods Pro" : "Disabled"}
                </span>
              </div>
            </div>

            {/* Cellular Mobile Data */}
            <div
              className={`p-2.5 rounded-2xl border transition-all relative select-none cursor-pointer flex flex-col justify-between ${
                mobileData
                  ? "bg-emerald-600/90 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => {
                const next = !mobileData;
                onToggleMobileData(next);
                triggerVibration("light");
                onShowToast(next ? "📶 Cellular Data: 5G NR Active" : "📶 Cellular Data: Disabled");
                onSystemLog(`[TelephonyHAL] Mobile data switched to ${next ? "ACTIVE" : "OFF"}`);
              }}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${mobileData ? "bg-emerald-950 text-emerald-200" : "bg-slate-900 text-slate-500"}`}>
                  <Signal size={16} className={mobileData ? "text-emerald-300" : "text-slate-500"} />
                </div>
                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full ${mobileData ? "bg-emerald-950 text-emerald-200 border border-emerald-700" : "bg-slate-900 text-slate-500"}`}>
                  {mobileData ? "5G" : "OFF"}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-[10.5px] font-extrabold block text-white">Mobile Data</span>
                <span className="text-[8px] font-mono opacity-80 truncate block">
                  {mobileData ? `${signalBars}/4 Bars • LTE+` : "Off"}
                </span>
              </div>
            </div>

            {/* Airplane Mode Tile */}
            <div
              className={`p-2.5 rounded-2xl border transition-all relative select-none cursor-pointer flex flex-col justify-between ${
                airplaneMode
                  ? "bg-amber-500 border-amber-300 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.45)]"
                  : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => {
                const next = !airplaneMode;
                onToggleAirplaneMode(next);
                if (next) {
                  onToggleWifi(false);
                  onToggleBluetooth(false);
                  onToggleMobileData(false);
                  onShowToast("✈️ Airplane Mode ON: Transmitters Powered Down");
                } else {
                  onToggleWifi(true);
                  onToggleMobileData(true);
                  onShowToast("✈️ Airplane Mode OFF: Transmitters Restored");
                }
                triggerVibration("medium");
                onSystemLog(`[RadioHAL] Airplane mode set to ${next ? "ENABLED" : "DISABLED"}`);
              }}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${airplaneMode ? "bg-amber-950 text-amber-300" : "bg-slate-900 text-slate-500"}`}>
                  <Radio size={16} className={airplaneMode ? "text-amber-300 animate-pulse" : "text-slate-500"} />
                </div>
                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full ${airplaneMode ? "bg-amber-950 text-amber-200 border border-amber-700" : "bg-slate-900 text-slate-500"}`}>
                  {airplaneMode ? "ACTIVE" : "OFF"}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-[10.5px] font-extrabold block">Airplane</span>
                <span className="text-[8px] font-mono opacity-80 truncate block">
                  {airplaneMode ? "Radios Disabled" : "All Links Online"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. BRIGHTNESS & VOLUME SLIDERS (Dual Interactive Controls) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Screen Backlight Brightness Slider */}
            <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Sun size={13} className="text-amber-400" />
                  <span>Brightness</span>
                </span>
                <span className="font-mono text-teal-400 font-extrabold">{brightness}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                value={brightness}
                onChange={(e) => onBrightnessChange(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 pt-0.5">
                <button
                  type="button"
                  onClick={() => onBrightnessChange(25)}
                  className="hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => onBrightnessChange(50)}
                  className="hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => onBrightnessChange(80)}
                  className="hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  80%
                </button>
                <button
                  type="button"
                  onClick={() => onBrightnessChange(100)}
                  className="hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Media Audio Volume Slider */}
            <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-300">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 cursor-pointer"
                >
                  {currentIsMuted || currentVolume === 0 ? (
                    <VolumeX size={13} className="text-rose-400" />
                  ) : currentVolume > 50 ? (
                    <Volume2 size={13} className="text-cyan-400" />
                  ) : (
                    <Volume1 size={13} className="text-cyan-400" />
                  )}
                  <span>Media Volume</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-extrabold">
                    {currentIsMuted ? "Muted" : `${currentVolume}%`}
                  </span>
                  {onOpenVolumeMixer && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenVolumeMixer();
                      }}
                      className="px-1.5 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[8.5px] font-bold text-cyan-300 flex items-center gap-1 cursor-pointer"
                      title="Open Multi-Stream Volume Mixer & Haptics"
                    >
                      <Sliders size={10} />
                      <span>Mixer</span>
                    </button>
                  )}
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={currentIsMuted ? 0 : currentVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleVolumeChange(0)}
                  className="hover:text-cyan-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  Mute
                </button>
                <button
                  type="button"
                  onClick={() => handleVolumeChange(40)}
                  className="hover:text-cyan-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  40%
                </button>
                <button
                  type="button"
                  onClick={() => handleVolumeChange(75)}
                  className="hover:text-cyan-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => handleVolumeChange(100)}
                  className="hover:text-cyan-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* 3. POWER & BATTERY MANAGEMENT (Consistent with existing Battery HAL) */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 text-white shadow-md">
            {/* Battery Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  isCharging
                    ? "bg-emerald-950 border-emerald-500/80 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                    : batteryLevel > 50
                    ? "bg-emerald-950/60 border-emerald-800"
                    : batteryLevel > 20
                    ? "bg-amber-950/60 border-amber-800"
                    : "bg-rose-950/80 border-rose-700 animate-pulse"
                }`}>
                  <Battery
                    size={20}
                    className={
                      isCharging
                        ? "text-emerald-300 animate-pulse"
                        : batteryLevel > 50
                        ? "text-emerald-400"
                        : batteryLevel > 20
                        ? "text-amber-400"
                        : "text-rose-400"
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-white">
                      Battery: {batteryLevel}%
                    </span>
                    {isCharging && (
                      <span className="text-[7.5px] px-1.5 py-0.2 rounded font-mono font-black bg-emerald-900/90 text-emerald-200 border border-emerald-500 animate-pulse">
                        ⚡ CHARGING (65W)
                      </span>
                    )}
                    {isBatterySaver && (
                      <span className="text-[7.5px] px-1.5 py-0.2 rounded font-mono font-black bg-amber-950 text-amber-300 border border-amber-700">
                        SAVER ON
                      </span>
                    )}
                  </div>
                  <span className="text-[8.5px] text-slate-400 font-mono block">
                    {isCharging
                      ? "Fast Charging • 32 min to 100%"
                      : isBatterySaver
                      ? "Power Saver Active • Est. 14h 20m remaining"
                      : "Optimized Discharge • Est. 9h 45m remaining"}
                  </span>
                </div>
              </div>

              {/* Battery Saver Button */}
              <button
                type="button"
                onClick={() => {
                  const nextSaver = !isBatterySaver;
                  onToggleBatterySaver?.(nextSaver);
                  triggerVibration("medium");
                  playClickSound();
                  onShowToast(nextSaver ? "🔋 Power Saver Mode: Activated" : "⚡ Power Saver Mode: Disabled");
                  onSystemLog(`[PowerHAL] Battery saver mode switched to ${nextSaver ? "ON" : "OFF"}`);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isBatterySaver
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750"
                }`}
              >
                <Zap size={12} className={isBatterySaver ? "fill-slate-950" : "text-amber-400"} />
                <span>{isBatterySaver ? "Saver Active" : "Power Saver"}</span>
              </button>
            </div>

            {/* Telemetry & Controls Row */}
            <div className="pt-2 border-t border-slate-850 grid grid-cols-3 gap-1.5 text-center text-[8px] font-mono">
              <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[7.5px]">TEMP</span>
                <span className="text-emerald-300 font-bold text-[9px]">31.4°C • Cool</span>
              </div>
              <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[7.5px]">HEALTH</span>
                <span className="text-teal-300 font-bold text-[9px]">Good (98%)</span>
              </div>
              <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[7.5px]">VOLTAGE</span>
                <span className="text-cyan-300 font-bold text-[9px]">4.12 V</span>
              </div>
            </div>

            {/* Charging & Battery Simulation Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-850 text-[9px]">
              <span className="text-slate-400 font-mono text-[8px]">Power Controls:</span>
              <div className="flex items-center gap-1">
                {/* Charger Plug Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const nextCharging = !isCharging;
                    onToggleCharging(nextCharging);
                    triggerVibration("medium");
                    playClickSound();
                    onShowToast(nextCharging ? "⚡ Charger Connected • Rapid 65W PD" : "🔌 Charger Unplugged");
                    onSystemLog(`[PowerHAL] Physical charger state: ${nextCharging ? "PLUGGED_IN" : "UNPLUGGED"}`);
                  }}
                  className={`px-2 py-1 rounded-lg border text-[8.5px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                    isCharging
                      ? "bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.7)] animate-pulse"
                      : "bg-emerald-950/80 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                  }`}
                  title="Toggle USB-C Charger connection"
                >
                  <Zap size={10} className={isCharging ? "fill-slate-950" : "fill-emerald-300"} />
                  <span>{isCharging ? "Charger ON" : "Plug Charger"}</span>
                </button>

                {/* Test Low Battery Alert */}
                <button
                  type="button"
                  onClick={() => {
                    onBatteryChange?.(15);
                    triggerVibration("heavy");
                    onShowToast("⚠️ Battery set to 15% (Low Battery Simulation)");
                    onSystemLog("[PowerHAL] Simulating 15% Low Battery threshold alert", "WARNING");
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-[8.5px] font-bold text-rose-300 cursor-pointer transition-all"
                  title="Simulate 15% Low Battery alert"
                >
                  Test 15%
                </button>

                {/* +25% Boost */}
                <button
                  type="button"
                  onClick={() => {
                    onBatteryChange?.(Math.min(100, batteryLevel + 25));
                    triggerVibration("light");
                    onShowToast("⚡ Battery level increased (+25%)");
                  }}
                  className="px-2 py-1 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-800 text-[8.5px] font-bold text-teal-300 cursor-pointer transition-all flex items-center gap-0.5"
                  title="Add 25% battery"
                >
                  <Zap size={10} className="fill-teal-300" />
                  <span>+25%</span>
                </button>

                {/* Open Battery Consumption Pie Chart */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApp?.(AppID.TASK_MANAGER);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-[8.5px] font-bold text-amber-300 cursor-pointer transition-all flex items-center gap-1"
                  title="View Battery Consumption Pie Chart & Per-App Breakdown"
                >
                  <Activity size={10} className="text-amber-400" />
                  <span>Battery Pie</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. QUICK UTILITY TOGGLES (6 Tiles in 3-column grid) */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {/* Flashlight Tile */}
            <button
              type="button"
              onClick={handleToggleFlashlight}
              className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer border active:scale-95 ${
                flashlightOn
                  ? "bg-amber-400 border-amber-300 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                  : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white"
              }`}
              title="Toggle Flashlight / LED Torch"
            >
              <Flashlight size={15} className={flashlightOn ? "fill-slate-950 animate-pulse" : "text-amber-400"} />
              <span className="text-[8.5px] font-extrabold">Flashlight</span>
              <span className={`text-[7px] font-mono font-bold px-1 rounded ${flashlightOn ? "bg-amber-950 text-amber-200" : "bg-slate-900 text-slate-500"}`}>
                {flashlightOn ? "ON" : "OFF"}
              </span>
            </button>

            {/* Instant Screenshot Tile */}
            <button
              type="button"
              onClick={handleTakeScreenshot}
              className="p-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer border bg-indigo-950/80 border-indigo-700 text-indigo-200 hover:bg-indigo-900 active:scale-95 shadow-sm"
              title="Take Screen Capture"
            >
              <Camera size={15} className="text-indigo-400" />
              <span className="text-[8.5px] font-extrabold">Capture</span>
              <span className="text-[7px] font-mono font-bold px-1 rounded bg-indigo-900 text-indigo-200">
                SNAP
              </span>
            </button>

            {/* Screen Rotation Lock */}
            <button
              type="button"
              onClick={handleToggleRotation}
              className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer border active:scale-95 ${
                rotationLock
                  ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white"
              }`}
              title="Toggle Screen Orientation Lock"
            >
              <RotateCw size={15} className={rotationLock ? "text-white" : "text-purple-400"} />
              <span className="text-[8.5px] font-extrabold">Auto-Rotate</span>
              <span className={`text-[7px] font-mono font-bold px-1 rounded ${rotationLock ? "bg-purple-950 text-purple-200" : "bg-slate-900 text-slate-500"}`}>
                {rotationLock ? "LOCKED" : "AUTO"}
              </span>
            </button>

            {/* Do Not Disturb Tile */}
            <button
              type="button"
              onClick={handleToggleDnd}
              className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer border active:scale-95 ${
                dndActive
                  ? "bg-rose-600 border-rose-400 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)]"
                  : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white"
              }`}
              title="Toggle Do Not Disturb Mode"
            >
              <BellOff size={15} className={dndActive ? "text-white animate-pulse" : "text-rose-400"} />
              <span className="text-[8.5px] font-extrabold">DND Mode</span>
              <span className={`text-[7px] font-mono font-bold px-1 rounded ${dndActive ? "bg-rose-950 text-rose-200" : "bg-slate-900 text-slate-500"}`}>
                {dndActive ? "SILENT" : "OFF"}
              </span>
            </button>

            {/* Personal Hotspot Tile */}
            <button
              type="button"
              onClick={handleToggleHotspot}
              className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer border active:scale-95 ${
                hotspotActive
                  ? "bg-teal-500 border-teal-300 text-slate-950 font-black shadow-[0_0_12px_rgba(20,184,166,0.5)]"
                  : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white"
              }`}
              title="Toggle Wi-Fi Hotspot"
            >
              <Radio size={15} className={hotspotActive ? "text-slate-950" : "text-teal-400"} />
              <span className="text-[8.5px] font-extrabold">Hotspot</span>
              <span className={`text-[7px] font-mono font-bold px-1 rounded ${hotspotActive ? "bg-teal-950 text-teal-200" : "bg-slate-900 text-slate-500"}`}>
                {hotspotActive ? "ON" : "OFF"}
              </span>
            </button>

            {/* Storage Manager / Cache Cleaner Tile */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStorageManager?.();
              }}
              className="p-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer border bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-teal-300 hover:text-white active:scale-95"
              title="Open Storage Cache Cleaner"
            >
              <Trash2 size={15} className="text-teal-400" />
              <span className="text-[8.5px] font-extrabold">Clean Storage</span>
              <span className="text-[7px] font-mono font-bold px-1 rounded bg-slate-900 text-slate-400">
                VFS
              </span>
            </button>
          </div>

          {/* 5. MINI MEDIA PLAYER WIDGET */}
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow">
                <Music size={15} className={isPlayingMedia ? "animate-bounce" : ""} />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-bold text-white block truncate">
                  {isPlayingMedia ? "Cyberpunk Neon - KK Synthwave" : "KK Audio Engine"}
                </span>
                <span className="text-[8px] text-slate-400 font-mono block">
                  {isPlayingMedia ? "Now Playing • 320kbps Hi-Res" : "Tap to start playback"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerVibration("light");
                  onShowToast("⏮️ Previous Track");
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Previous Track"
              >
                <SkipBack size={13} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextPlaying = !isPlayingMedia;
                  setIsPlayingMedia(nextPlaying);
                  triggerVibration("medium");
                  playClickSound();
                  onShowToast(nextPlaying ? "▶️ Resumed KK Synthwave Mix" : "⏸️ Paused Audio");
                }}
                className={`p-2 rounded-xl cursor-pointer transition-all ${
                  isPlayingMedia
                    ? "bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
                title={isPlayingMedia ? "Pause Audio" : "Play Audio"}
              >
                {isPlayingMedia ? <Pause size={13} /> : <Play size={13} className="translate-x-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerVibration("light");
                  onShowToast("⏭️ Next Track: Quantum Pulse");
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Next Track"
              >
                <SkipForward size={13} />
              </button>
            </div>
          </div>

          {/* BOTTOM PULL DISMISS INDICATOR */}
          <div
            onClick={onClose}
            className="pt-1 flex flex-col items-center justify-center cursor-pointer group hover:opacity-80 transition-opacity"
            title="Swipe up or tap to close Control Center"
          >
            <div className="w-10 h-1 bg-slate-650 group-hover:bg-teal-400 rounded-full transition-colors" />
            <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-widest mt-1">
              Swipe Up to Close
            </span>
          </div>
        </motion.div>

        {/* Lower transparent backdrop area (click to dismiss) */}
        <div className="flex-1 w-full" onClick={onClose} />
      </motion.div>
    </AnimatePresence>
  );
}
