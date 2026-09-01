import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  Volume1,
  VolumeX,
  Bell,
  BellOff,
  Vibrate,
  Music,
  Clock,
  Sliders,
  ChevronRight,
  ChevronDown,
  Pin,
  PinOff,
  Headphones,
  Radio,
  Speaker,
  Sparkles,
  AlertTriangle,
  X,
  Plus,
  Minus
} from "lucide-react";
import {
  playVolumeTickSound,
  playVolumeMuteSound,
  playVolumeMaxSound,
  playVibrateHapticTone,
  playClickSound
} from "../utils/sound";

export type SoundProfile = "ring" | "vibrate" | "silent";
export type AudioStreamType = "media" | "ringtone" | "notification" | "alarm";
export type AudioOutputDevice = "speaker" | "bluetooth" | "usbc";

export interface VolumeLevels {
  media: number;
  ringtone: number;
  notification: number;
  alarm: number;
}

export interface FloatingVolumeSliderProps {
  isVisible: boolean;
  onClose: () => void;
  volumeLevels: VolumeLevels;
  onVolumeChange: (stream: AudioStreamType, level: number) => void;
  soundProfile: SoundProfile;
  onSoundProfileChange: (profile: SoundProfile) => void;
  outputDevice?: AudioOutputDevice;
  onOutputDeviceChange?: (device: AudioOutputDevice) => void;
  onSystemLog?: (msg: string, level?: "INFO" | "WARNING" | "CRITICAL") => void;
  triggerVibration?: (intensity?: "light" | "medium" | "heavy") => void;
  activeStream?: AudioStreamType;
  onActiveStreamChange?: (stream: AudioStreamType) => void;
}

export default function FloatingVolumeSlider({
  isVisible,
  onClose,
  volumeLevels,
  onVolumeChange,
  soundProfile,
  onSoundProfileChange,
  outputDevice = "speaker",
  onOutputDeviceChange,
  onSystemLog,
  triggerVibration = () => {},
  activeStream: controlledActiveStream,
  onActiveStreamChange
}: FloatingVolumeSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [localActiveStream, setLocalActiveStream] = useState<AudioStreamType>("media");
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hapticPulseWave, setHapticPulseWave] = useState(0);

  const activeStream = controlledActiveStream ?? localActiveStream;
  const setActiveStream = (stream: AudioStreamType) => {
    setLocalActiveStream(stream);
    onActiveStreamChange?.(stream);
  };

  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderTrackRef = useRef<HTMLDivElement | null>(null);
  const prevLevelRef = useRef<number>(volumeLevels[activeStream]);

  // Reset auto-dismiss timer whenever volume levels change or HUD becomes visible
  const resetTimer = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
    if (!isPinned && !isExpanded && !isDragging) {
      autoDismissTimerRef.current = setTimeout(() => {
        onClose();
      }, 3500);
    }
  }, [isPinned, isExpanded, isDragging, onClose]);

  useEffect(() => {
    if (isVisible) {
      resetTimer();
    }
    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, [isVisible, resetTimer]);

  // Execute tactile haptic and synthesized sound feedback on volume change
  const handleLevelStep = (stream: AudioStreamType, nextVal: number, fromInteractive = true) => {
    const clamped = Math.max(0, Math.min(100, Math.round(nextVal)));
    const prev = volumeLevels[stream];

    if (clamped !== prev) {
      onVolumeChange(stream, clamped);

      if (fromInteractive) {
        resetTimer();
        // Haptic feedback simulation
        if (hapticsEnabled) {
          setHapticPulseWave((p) => p + 1);
          if (clamped === 0) {
            triggerVibration("heavy");
            playVolumeMuteSound();
            onSystemLog?.(`[AudioHAL] Stream [${stream}] muted (0%) with heavy haptic dampener`, "INFO");
          } else if (clamped === 100) {
            triggerVibration("medium");
            playVolumeMaxSound();
            onSystemLog?.(`[AudioHAL] Stream [${stream}] maximum volume (100%) hearing protection threshold reached`, "WARNING");
          } else if (Math.abs(clamped - prev) >= 4 || clamped % 10 === 0) {
            triggerVibration("light");
            playVolumeTickSound(clamped);
          }
        }
      }
    }
  };

  // Direct vertical drag handling on compact slider
  const handleVerticalDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const touchY = e.clientY;
    const trackHeight = rect.height;
    // Bottom is 0%, Top is 100%
    const relativeY = rect.bottom - touchY;
    const ratio = Math.max(0, Math.min(1, relativeY / trackHeight));
    const nextVal = Math.round(ratio * 100);
    handleLevelStep(activeStream, nextVal, true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handleVerticalDrag(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleVerticalDrag(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
    resetTimer();
  };

  // Quick mute toggle for active stream
  const handleToggleMuteStream = (stream: AudioStreamType) => {
    const current = volumeLevels[stream];
    if (current > 0) {
      prevLevelRef.current = current;
      handleLevelStep(stream, 0, true);
    } else {
      const restored = prevLevelRef.current > 0 ? prevLevelRef.current : 65;
      handleLevelStep(stream, restored, true);
    }
  };

  // Sound profile changer (Ring -> Vibrate -> Silent)
  const handleCycleProfile = () => {
    let nextProfile: SoundProfile = "ring";
    if (soundProfile === "ring") nextProfile = "vibrate";
    else if (soundProfile === "vibrate") nextProfile = "silent";
    else nextProfile = "ring";

    onSoundProfileChange(nextProfile);
    resetTimer();

    if (nextProfile === "vibrate") {
      triggerVibration("heavy");
      playVibrateHapticTone();
      onSystemLog?.("[AudioHAL] Profile changed to VIBRATE (Haptic motor active)", "INFO");
    } else if (nextProfile === "silent") {
      triggerVibration("medium");
      playVolumeMuteSound();
      onSystemLog?.("[AudioHAL] Profile changed to SILENT (DND alerts suppressed)", "INFO");
    } else {
      triggerVibration("light");
      playClickSound();
      onSystemLog?.("[AudioHAL] Profile changed to NORMAL RING", "INFO");
    }
  };

  if (!isVisible) return null;

  const currentLevel = volumeLevels[activeStream];
  const isMuted = currentLevel === 0 || soundProfile === "silent";
  const isHighVolumeWarning = activeStream === "media" && currentLevel > 80;

  return (
    <AnimatePresence>
      <motion.div
        key="floating-volume-hud"
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        onMouseEnter={() => {
          if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
        }}
        onMouseLeave={resetTimer}
        className={`absolute z-50 select-none ${
          isExpanded
            ? "inset-x-3 top-10 max-h-[580px] overflow-hidden"
            : "right-2.5 top-16"
        }`}
        id="floating-volume-control-hud"
      >
        {!isExpanded ? (
          /* ============================================================ */
          /* COMPACT FLOATING SLIDER PILL (MODERN SIDE DYNAMIC BAR)        */
          /* ============================================================ */
          <div className="relative flex flex-col items-center gap-1.5 p-1.5 rounded-[28px] bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85)] ring-1 ring-white/10 group">
            {/* Stream Icon / Profile Indicator Button (Top) */}
            <button
              type="button"
              onClick={() => handleToggleMuteStream(activeStream)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isMuted
                  ? "bg-rose-950/90 text-rose-400 border border-rose-600/40"
                  : soundProfile === "vibrate"
                  ? "bg-amber-950/90 text-amber-400 border border-amber-600/40"
                  : "bg-slate-900 text-cyan-300 hover:bg-slate-800 border border-slate-800"
              }`}
              title={`Tap to ${isMuted ? 'Unmute' : 'Mute'} ${activeStream}`}
            >
              {isMuted ? (
                <VolumeX size={16} />
              ) : soundProfile === "vibrate" ? (
                <Vibrate size={16} className="animate-pulse" />
              ) : currentLevel > 60 ? (
                <Volume2 size={16} />
              ) : (
                <Volume1 size={16} />
              )}
            </button>

            {/* Vertical Interactive Volume Capsule Bar */}
            <div
              ref={sliderTrackRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative w-9 h-36 rounded-full bg-slate-900/90 border border-slate-800/90 overflow-hidden cursor-ns-resize touch-none flex flex-col justify-end p-0.5"
              title="Drag up or down to adjust volume"
            >
              {/* Fill Track */}
              <motion.div
                className={`w-full rounded-full transition-all duration-75 relative overflow-hidden ${
                  isMuted
                    ? "bg-rose-500/50"
                    : isHighVolumeWarning
                    ? "bg-gradient-to-t from-cyan-500 via-teal-400 to-amber-400"
                    : "bg-gradient-to-t from-cyan-500 to-teal-400"
                }`}
                style={{ height: `${currentLevel}%` }}
              >
                {/* Visual Glass Sheen on Fill */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/20" />
              </motion.div>

              {/* Dynamic Percentage Badge floating inside/over track */}
              <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
                <span
                  className={`text-[9px] font-mono font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
                    currentLevel > 40 ? "text-slate-950" : "text-cyan-300"
                  }`}
                >
                  {isMuted ? "0" : `${currentLevel}%`}
                </span>
              </div>

              {/* Hearing safety icon indicator */}
              {isHighVolumeWarning && (
                <div className="absolute top-1.5 inset-x-0 flex justify-center pointer-events-none">
                  <AlertTriangle size={10} className="text-amber-300 animate-bounce" />
                </div>
              )}
            </div>

            {/* Quick Increment / Decrement Stepper Buttons */}
            <div className="flex flex-col gap-1 w-full items-center">
              <button
                type="button"
                onClick={() => handleLevelStep(activeStream, currentLevel + 5, true)}
                className="w-7 h-5 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-cyan-950 text-slate-300 hover:text-cyan-300 flex items-center justify-center border border-slate-800 transition-colors cursor-pointer"
                title="Volume Up (+5%)"
              >
                <Plus size={11} />
              </button>
              <button
                type="button"
                onClick={() => handleLevelStep(activeStream, currentLevel - 5, true)}
                className="w-7 h-5 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-cyan-950 text-slate-300 hover:text-cyan-300 flex items-center justify-center border border-slate-800 transition-colors cursor-pointer"
                title="Volume Down (-5%)"
              >
                <Minus size={11} />
              </button>
            </div>

            {/* Expand 3-Dots / Mixer Mode Button */}
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                playClickSound();
                triggerVibration("light");
              }}
              className="w-9 h-7 rounded-xl bg-slate-900/90 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
              title="Expand Multi-Stream Volume Mixer"
            >
              <Sliders size={13} />
            </button>
          </div>
        ) : (
          /* ============================================================ */
          /* EXPANDED MULTI-STREAM AUDIO MIXER & HAPTIC CONTROL CENTER    */
          /* ============================================================ */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/10 flex flex-col gap-3.5 text-white"
          >
            {/* Header with Title, Sound Profile Switcher, and Pin/Close */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <Sliders size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-wide">Sound & Volume Mixer</h3>
                  <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-slate-400">
                    <span>Active:</span>
                    <span className="text-cyan-300 font-bold uppercase">{activeStream}</span>
                    <span>•</span>
                    <span className="text-teal-300">{outputDevice === "bluetooth" ? "KK Pods Pro" : outputDevice === "usbc" ? "USB-C DAC" : "Phone Speaker"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Pin & Close) */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinned(!isPinned);
                    triggerVibration("light");
                    playClickSound();
                  }}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isPinned
                      ? "bg-teal-950 text-teal-300 border border-teal-500/60"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                  title={isPinned ? "Unpin HUD (Auto-dismiss enabled)" : "Pin HUD (Keep persistent on screen)"}
                >
                  {isPinned ? <Pin size={13} /> : <PinOff size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    playClickSound();
                    triggerVibration("light");
                  }}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                  title="Collapse to compact side slider"
                >
                  <ChevronDown size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    playClickSound();
                  }}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                  title="Close Volume HUD"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Sound Profile Switcher Segmented Control */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onSoundProfileChange("ring");
                  triggerVibration("light");
                  playClickSound();
                  resetTimer();
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  soundProfile === "ring"
                    ? "bg-teal-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bell size={12} />
                <span>Ring</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSoundProfileChange("vibrate");
                  triggerVibration("heavy");
                  playVibrateHapticTone();
                  resetTimer();
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  soundProfile === "vibrate"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Vibrate size={12} />
                <span>Vibrate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSoundProfileChange("silent");
                  triggerVibration("medium");
                  playVolumeMuteSound();
                  resetTimer();
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  soundProfile === "silent"
                    ? "bg-rose-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BellOff size={12} />
                <span>Silent</span>
              </button>
            </div>

            {/* 4 INDEPENDENT STREAM SLIDERS */}
            <div className="space-y-2.5">
              {/* 1. MEDIA VOLUME */}
              <div
                onClick={() => setActiveStream("media")}
                className={`p-2.5 rounded-2xl border transition-all ${
                  activeStream === "media"
                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/20"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMuteStream("media");
                      }}
                      className="p-1 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 cursor-pointer"
                    >
                      {volumeLevels.media === 0 ? <VolumeX size={13} className="text-rose-400" /> : <Music size={13} />}
                    </button>
                    <div>
                      <span className="text-[10.5px] font-extrabold text-white">Media Volume</span>
                      <span className="text-[8px] font-mono text-slate-400 block">Music, Videos, Gaming</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-cyan-400">
                    {volumeLevels.media}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevels.media}
                  onChange={(e) => handleLevelStep("media", Number(e.target.value), true)}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* 2. RINGTONE & CALLS */}
              <div
                onClick={() => setActiveStream("ringtone")}
                className={`p-2.5 rounded-2xl border transition-all ${
                  activeStream === "ringtone"
                    ? "bg-teal-950/40 border-teal-500/50 shadow-sm ring-1 ring-teal-500/20"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMuteStream("ringtone");
                      }}
                      className="p-1 rounded-lg bg-teal-950 text-teal-300 hover:bg-teal-900 cursor-pointer"
                    >
                      {volumeLevels.ringtone === 0 ? <VolumeX size={13} className="text-rose-400" /> : <Bell size={13} />}
                    </button>
                    <div>
                      <span className="text-[10.5px] font-extrabold text-white">Ringtone & Calls</span>
                      <span className="text-[8px] font-mono text-slate-400 block">Incoming Cellular & VoIP Calls</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-teal-400">
                    {volumeLevels.ringtone}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevels.ringtone}
                  onChange={(e) => handleLevelStep("ringtone", Number(e.target.value), true)}
                  className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* 3. NOTIFICATIONS */}
              <div
                onClick={() => setActiveStream("notification")}
                className={`p-2.5 rounded-2xl border transition-all ${
                  activeStream === "notification"
                    ? "bg-blue-950/40 border-blue-500/50 shadow-sm ring-1 ring-blue-500/20"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMuteStream("notification");
                      }}
                      className="p-1 rounded-lg bg-blue-950 text-blue-300 hover:bg-blue-900 cursor-pointer"
                    >
                      {volumeLevels.notification === 0 ? <VolumeX size={13} className="text-rose-400" /> : <Volume1 size={13} />}
                    </button>
                    <div>
                      <span className="text-[10.5px] font-extrabold text-white">Notifications</span>
                      <span className="text-[8px] font-mono text-slate-400 block">Messages & System Alerts</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-blue-400">
                    {volumeLevels.notification}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevels.notification}
                  onChange={(e) => handleLevelStep("notification", Number(e.target.value), true)}
                  className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* 4. ALARMS & TIMERS */}
              <div
                onClick={() => setActiveStream("alarm")}
                className={`p-2.5 rounded-2xl border transition-all ${
                  activeStream === "alarm"
                    ? "bg-purple-950/40 border-purple-500/50 shadow-sm ring-1 ring-purple-500/20"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMuteStream("alarm");
                      }}
                      className="p-1 rounded-lg bg-purple-950 text-purple-300 hover:bg-purple-900 cursor-pointer"
                    >
                      {volumeLevels.alarm === 0 ? <VolumeX size={13} className="text-rose-400" /> : <Clock size={13} />}
                    </button>
                    <div>
                      <span className="text-[10.5px] font-extrabold text-white">Alarm & Timer</span>
                      <span className="text-[8px] font-mono text-slate-400 block">Wake-up Alarms & Calendar</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-purple-400">
                    {volumeLevels.alarm}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevels.alarm}
                  onChange={(e) => handleLevelStep("alarm", Number(e.target.value), true)}
                  className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* HAPTIC FEEDBACK SIMULATION BAR & LIVE TEST */}
            <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  key={hapticPulseWave}
                  className={`w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 transition-all ${
                    hapticPulseWave > 0 ? "scale-115 shadow-[0_0_10px_rgba(6,182,212,0.8)]" : ""
                  }`}
                >
                  <Vibrate size={13} className={hapticPulseWave > 0 ? "animate-pulse text-cyan-200" : ""} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-white block">Haptic Feedback Sim</span>
                  <span className="text-[8px] font-mono text-slate-400 block">
                    {hapticsEnabled ? "Tactile vibration & audio tick active" : "Silent feedback mode"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerVibration("heavy");
                    playVibrateHapticTone();
                    setHapticPulseWave((p) => p + 1);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[8.5px] font-bold text-cyan-300 border border-slate-700 cursor-pointer"
                >
                  Test Pulse
                </button>
                <input
                  type="checkbox"
                  checked={hapticsEnabled}
                  onChange={(e) => setHapticsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
                />
              </div>
            </div>

            {/* Quick Level Presets */}
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 pt-0.5">
              <button
                type="button"
                onClick={() => handleLevelStep(activeStream, 0, true)}
                className="hover:text-rose-400 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                Mute
              </button>
              <button
                type="button"
                onClick={() => handleLevelStep(activeStream, 25, true)}
                className="hover:text-cyan-300 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleLevelStep(activeStream, 50, true)}
                className="hover:text-cyan-300 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleLevelStep(activeStream, 75, true)}
                className="hover:text-cyan-300 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handleLevelStep(activeStream, 100, true)}
                className="hover:text-cyan-300 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                100%
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
