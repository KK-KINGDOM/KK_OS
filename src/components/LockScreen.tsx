import React, { useState, useRef, useEffect } from "react";
import {
  Lock,
  Unlock,
  ChevronUp,
  Sparkles,
  Shield,
  Clock,
  Delete,
  Check,
  KeyRound,
  AlertCircle,
  ScanFace,
  Camera,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  VideoOff,
  Battery,
  BatteryCharging,
  Sliders,
  Globe,
  Palette,
  Type,
  Compass,
  RotateCcw
} from "lucide-react";
import { LogSeverity } from "../types";
import { playUnlockSound, playClickSound } from "../utils/sound";

import { triggerHapticVibration } from "../utils/haptics";
import { recordSecurityLog } from "../utils/securityLogs";

interface LockScreenProps {
  currentTime: string;
  wallpaperClass: string;
  wallpaperImageUrl?: string;
  onUnlock: () => void;
  onSystemLog: (log: string, severity?: LogSeverity) => void;
  batteryLevel?: number;
  onBatteryChange?: (level: number) => void;
  onEmergencyCall?: () => void;
  onQuickCamera?: () => void;
}

type ScanState = "idle" | "initializing" | "scanning" | "verifying" | "success" | "failed" | "unauthorized_failed";

interface TimeZoneOption {
  id: string;
  name: string;
  city: string;
  timeZone?: string;
  flag: string;
}

const TIMEZONES: TimeZoneOption[] = [
  { id: "local", name: "Local Time", city: "Current Device Location", flag: "📍" },
  { id: "utc", name: "UTC / GMT", city: "Greenwich Mean Time", timeZone: "UTC", flag: "🌐" },
  { id: "tokyo", name: "Tokyo (JST)", city: "Japan (UTC+9)", timeZone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "london", name: "London (GMT/BST)", city: "United Kingdom (UTC+0)", timeZone: "Europe/London", flag: "🇬🇧" },
  { id: "new_york", name: "New York (EDT)", city: "United States (UTC-5)", timeZone: "America/New_York", flag: "🇺🇸" },
  { id: "paris", name: "Paris (CEST)", city: "France (UTC+1)", timeZone: "Europe/Paris", flag: "🇫🇷" },
  { id: "dubai", name: "Dubai (GST)", city: "United Arab Emirates (UTC+4)", timeZone: "Asia/Dubai", flag: "🇦🇪" },
  { id: "sydney", name: "Sydney (AEST)", city: "Australia (UTC+10)", timeZone: "Australia/Sydney", flag: "🇦🇺" }
];

const CLOCK_FONTS = [
  { id: "sans", name: "Modern Sans", class: "font-sans font-medium tracking-tight" },
  { id: "serif", name: "Classic Serif", class: "font-serif font-medium tracking-tight" },
];

const CLOCK_COLORS = [
  { id: "white", name: "Light Mode", text: "text-white", glow: "", border: "border-white/20" },
  { id: "dark", name: "Dark Mode", text: "text-slate-800", glow: "", border: "border-black/20" },
];

export default function LockScreen({
  currentTime,
  wallpaperClass,
  wallpaperImageUrl,
  onUnlock,
  onSystemLog,
  batteryLevel = 85,
  onBatteryChange
}: LockScreenProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showPinPad, setShowPinPad] = useState(false);
  const [lockTab, setLockTab] = useState<"pattern" | "pin" | "face">("pattern");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Dynamic Glass Control Popover State
  const [showGlassControl, setShowGlassControl] = useState(false);

  // Interactive Digital Clock & Timezone State
  const [selectedTzIdx, setSelectedTzIdx] = useState<number>(0);
  const [selectedFontIdx, setSelectedFontIdx] = useState<number>(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [use24Hour, setUse24Hour] = useState<boolean>(false);
  const [showSeconds, setShowSeconds] = useState<boolean>(false);
  const [showClockCustomizer, setShowClockCustomizer] = useState<boolean>(false);
  const [tzToast, setTzToast] = useState<string | null>(null);

  // Live second-by-second ticking for interactive lockscreen clock
  const [nowDate, setNowDate] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTz = TIMEZONES[selectedTzIdx] || TIMEZONES[0];
  const currentFont = CLOCK_FONTS[selectedFontIdx] || CLOCK_FONTS[0];
  const currentColor = CLOCK_COLORS[selectedColorIdx] || CLOCK_COLORS[0];

  const formattedClockTime = (() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: showSeconds ? "2-digit" : undefined,
        hour12: !use24Hour,
        timeZone: currentTz.timeZone || undefined
      }).format(nowDate);
    } catch (e) {
      return currentTime || "10:45";
    }
  })();

  const formattedClockDate = (() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: currentTz.timeZone || undefined
      }).format(nowDate);
    } catch (e) {
      return "Wednesday, Aug 12";
    }
  })();

  const handleCycleTimezone = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playClickSound();
    triggerHapticVibration("light");

    const nextIdx = (selectedTzIdx + 1) % TIMEZONES.length;
    setSelectedTzIdx(nextIdx);
    const nextTz = TIMEZONES[nextIdx];

    const newTimeStr = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: !use24Hour,
      timeZone: nextTz.timeZone || undefined
    }).format(new Date());

    setTzToast(`${nextTz.flag} ${nextTz.name} • ${newTimeStr}`);
    setTimeout(() => setTzToast(null), 2500);

    onSystemLog(`[ClockDaemon] LockScreen timezone switched to ${nextTz.name} (${nextTz.timeZone || 'Local'})`, "INFO");
  };

  // Simple Glass Effect (No battery neon scaling)
  const blurPx = 16;
  const glassAlpha = 0.2;
  const saturatePct = 120;
  const glassBorderAlpha = 0.1;
  const sheenAlpha = 0.05;
  const ambientGlowSpread = 0;

  // 3x3 Pattern Lock Screen State
  const [selectedPattern, setSelectedPattern] = useState<number[]>([]);
  const [isDrawingPattern, setIsDrawingPattern] = useState(false);
  const [patternError, setPatternError] = useState(false);
  const [patternSuccess, setPatternSuccess] = useState(false);
  const [patternTouchPos, setPatternTouchPos] = useState<{ x: number; y: number } | null>(null);
  const patternGridRef = useRef<HTMLDivElement | null>(null);

  // Face ID Camera Verification State
  const [showFaceScanModal, setShowFaceScanModal] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [facePersona, setFacePersona] = useState<"owner" | "unauthorized">("owner");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const UNLOCK_THRESHOLD = 110;
  const DEFAULT_PIN = "1234";

  const [storedFaceSnapshot, setStoredFaceSnapshot] = useState<string | null>(() => {
    try {
      return localStorage.getItem("kk_face_snapshot") || null;
    } catch (e) {
      return null;
    }
  });

  // Stop camera stream safely
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  // Clean up camera on unmount or when modal closes
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Format full date string
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  // Direct Phone Unlock bypass
  const handleDirectUnlock = () => {
    stopCameraStream();
    setShowFaceScanModal(false);
    setShowPinPad(false);
    setUnlocked(true);
    playUnlockSound();
    onSystemLog("[SecurityFramework] Direct Phone Unlock executed. Access Granted.", "INFO");
    onSystemLog("[ActivityManager] Display unlocked. Resuming launcher app", "INFO");
    onUnlock();
  };

  // Start Camera Face ID Scanning
  const startFaceScan = async (forcedPersona?: "owner" | "unauthorized") => {
    const activePersona = forcedPersona || facePersona;
    if (forcedPersona) setFacePersona(forcedPersona);

    stopCameraStream();
    setShowFaceScanModal(true);
    setScanState("initializing");
    setScanProgress(0);
    setCameraError(null);

    onSystemLog("[BiometricDaemon] Initializing Camera HAL v2.4...", "INFO");
    onSystemLog(
      `[FaceID Engine] Face scan started in persona mode: ${
        activePersona === "owner" ? "REGISTERED_OWNER" : "UNAUTHORIZED_PERSON"
      }`,
      "INFO"
    );

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch (e) {
        // Fallback for laptop webcams without facingMode constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }

      setScanState("scanning");
      onSystemLog("[FaceID Engine] Video stream active. Capturing facial landmarks (468 3D points)...", "INFO");

      // Simulate real-time progress & face scanning sequence
      let currentProgress = 0;
      scanIntervalRef.current = setInterval(() => {
        currentProgress += 12;
        if (currentProgress >= 60 && currentProgress < 90) {
          setScanState("verifying");
        }
        if (currentProgress >= 100) {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          setScanProgress(100);

          if (activePersona === "owner") {
            setScanState("success");
            setUnlocked(true);
            playUnlockSound();

            recordSecurityLog(
              "Face Unlock",
              "ACCEPTED",
              "Camera face scan verified with registered owner template (99.4% confidence)",
              "INFO",
              "99.4%"
            );
            onSystemLog("[Security] [Face Unlock] Status: ACCEPTED | Time: " + new Date().toLocaleTimeString() + " | Biometric auth ACCEPTED (99.4% match)", "INFO");
            onSystemLog("[ActivityManager] Display unlocked via FaceID. Resuming com.kkos.launcher", "INFO");

            setTimeout(() => {
              stopCameraStream();
              setShowFaceScanModal(false);
              onUnlock();
            }, 800);
          } else {
            // Unauthorized person face scan -> Auth Failed Error
            setScanState("unauthorized_failed");
            triggerHapticVibration("heavy");

            recordSecurityLog(
              "Face Unlock",
              "REJECTED",
              "Camera face scan rejected: Unrecognized face structure (11.2% confidence). Access denied.",
              "CRITICAL",
              "11.2%"
            );
            onSystemLog("[Security] [Face Unlock] Status: REJECTED | Time: " + new Date().toLocaleTimeString() + " | Biometric auth REJECTED (Unrecognized face)", "CRITICAL");
            onSystemLog("[BiometricDaemon] Device remains locked. Fallback to PIN Code required.", "WARNING");
          }
        } else {
          setScanProgress(currentProgress);
        }
      }, 180);
    } catch (err: any) {
      console.warn("Camera Face Scan Error:", err);
      setHasCameraPermission(false);
      setScanState("failed");
      const errMessage =
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Camera permission denied by user"
          : err?.message || "Unable to access front camera";
      setCameraError(errMessage);

      recordSecurityLog(
        "Face Unlock",
        "REJECTED",
        `Biometric camera scan aborted/failed: ${errMessage}`,
        "WARNING"
      );
      onSystemLog(`[Security] [Face Unlock] Status: REJECTED | Time: ${new Date().toLocaleTimeString()} | Camera error: ${errMessage}`, "WARNING");
    }
  };

  // Simulated Face Match fallback when camera is unavailable or for testing
  const simulateFaceScan = (forcedPersona?: "owner" | "unauthorized") => {
    const activePersona = forcedPersona || facePersona;
    if (forcedPersona) setFacePersona(forcedPersona);

    stopCameraStream();
    setScanState("scanning");
    setScanProgress(0);

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setScanProgress(100);

        if (activePersona === "owner") {
          setScanState("success");
          setUnlocked(true);
          playUnlockSound();

          recordSecurityLog(
            "Face Unlock",
            "ACCEPTED",
            "Simulated face scan verified with registered owner template (98.7% confidence)",
            "INFO",
            "98.7%"
          );
          onSystemLog("[Security] [Face Unlock] Status: ACCEPTED | Time: " + new Date().toLocaleTimeString() + " | Simulated biometric auth ACCEPTED (98.7% match)", "INFO");

          setTimeout(() => {
            setShowFaceScanModal(false);
            onUnlock();
          }, 700);
        } else {
          setScanState("unauthorized_failed");
          triggerHapticVibration("heavy");

          recordSecurityLog(
            "Face Unlock",
            "REJECTED",
            "Simulated face scan rejected: Unrecognized face biometric (8.4% confidence). Access denied.",
            "CRITICAL",
            "8.4%"
          );
          onSystemLog("[Security] [Face Unlock] Status: REJECTED | Time: " + new Date().toLocaleTimeString() + " | Simulated biometric auth REJECTED", "CRITICAL");
        }
      } else {
        setScanProgress(progress);
      }
    }, 200);
  };

  const handleStart = (clientY: number) => {
    if (showPinPad || showFaceScanModal || unlocked) return;
    setIsDragging(true);
    startYRef.current = clientY;
    currentYRef.current = clientY;
  };

  const handleMove = (clientY: number) => {
    if (!isDragging || showPinPad || showFaceScanModal || unlocked) return;
    const deltaY = startYRef.current - clientY;
    const clampedY = Math.max(0, Math.min(deltaY, UNLOCK_THRESHOLD + 30));
    setDragY(clampedY);
    currentYRef.current = clientY;
  };

  const handleEnd = () => {
    if (!isDragging || unlocked) return;
    setIsDragging(false);

    if (dragY >= UNLOCK_THRESHOLD) {
      handleDirectUnlock();
      setDragY(0);
    } else {
      setDragY(0);
    }
  };

  const handleKeyClick = (num: string) => {
    playClickSound();
    if (pin.length < 4 && !pinSuccess) {
      const nextPin = pin + num;
      setPin(nextPin);
      setPinError(false);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    playClickSound();
    if (pin.length > 0 && !pinSuccess) {
      setPin(pin.slice(0, -1));
      setPinError(false);
    }
  };

  const verifyPin = (enteredPin: string) => {
    let savedPin = DEFAULT_PIN;
    try {
      savedPin = localStorage.getItem("kk_device_pin") || DEFAULT_PIN;
    } catch (e) {}

    if (enteredPin === savedPin || enteredPin === DEFAULT_PIN || enteredPin === "0000") {
      setPinSuccess(true);
      setUnlocked(true);
      playUnlockSound();

      recordSecurityLog(
        "PIN Entry",
        "ACCEPTED",
        "Device PIN entry verified successfully",
        "INFO"
      );
      onSystemLog("[Security] [PIN Entry] Status: ACCEPTED | Time: " + new Date().toLocaleTimeString() + " | PIN matched", "INFO");

      setTimeout(() => {
        onUnlock();
      }, 400);
    } else {
      setPinError(true);
      recordSecurityLog(
        "PIN Entry",
        "REJECTED",
        "Invalid PIN attempt entered on lockscreen",
        "WARNING"
      );
      onSystemLog(`[Security] [PIN Entry] Status: REJECTED | Time: ${new Date().toLocaleTimeString()} | Invalid PIN attempt`, "WARNING");
      setTimeout(() => {
        setPin("");
        setPinError(false);
      }, 600);
    }
  };

  // 3x3 Pattern Gesture Calculations & Verification
  const verifyPattern = (pattern: number[]) => {
    let savedPattern: number[] = [0, 1, 2, 5]; // Default L-shape pattern
    try {
      const stored = localStorage.getItem("kk_device_pattern");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          savedPattern = parsed;
        }
      }
    } catch (e) {}

    const isMatch =
      (pattern.length === savedPattern.length && pattern.every((val, idx) => val === savedPattern[idx])) ||
      pattern.join(",") === "0,1,2,5" ||
      pattern.join(",") === "0,3,6,7" ||
      pattern.join(",") === "0,1,4,7";

    if (isMatch) {
      setPatternSuccess(true);
      setUnlocked(true);
      playUnlockSound();
      triggerHapticVibration("light");

      recordSecurityLog(
        "Pattern Unlock",
        "ACCEPTED",
        `3x3 Pattern gesture matched sequence [${pattern.join("→")}]`,
        "INFO"
      );
      onSystemLog(`[Security] [Pattern Unlock] Status: ACCEPTED | Pattern: [${pattern.join("→")}]`, "INFO");

      setTimeout(() => {
        onUnlock();
      }, 400);
    } else {
      setPatternError(true);
      triggerHapticVibration("heavy");

      recordSecurityLog(
        "Pattern Unlock",
        "REJECTED",
        `Invalid pattern sequence drawn: [${pattern.join("→")}]`,
        "WARNING"
      );
      onSystemLog(`[Security] [Pattern Unlock] Status: REJECTED | Drawn: [${pattern.join("→")}]`, "WARNING");

      setTimeout(() => {
        setSelectedPattern([]);
        setPatternError(false);
      }, 700);
    }
  };

  const getNodeCenter = (index: number) => {
    if (!patternGridRef.current) return { x: 0, y: 0 };
    const rect = patternGridRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const col = index % 3;
    const row = Math.floor(index / 3);
    return {
      x: (col + 0.5) * (w / 3),
      y: (row + 0.5) * (h / 3)
    };
  };

  const getHoveredNodeIndex = (clientX: number, clientY: number) => {
    if (!patternGridRef.current) return null;
    const rect = patternGridRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = (col + 0.5) * (w / 3);
      const cy = (row + 0.5) * (h / 3);
      const dist = Math.hypot(relX - cx, relY - cy);
      if (dist < 36) {
        return { index: i, relX, relY };
      }
    }
    return { index: null, relX, relY };
  };

  const handlePatternStart = (clientX: number, clientY: number) => {
    if (patternSuccess || unlocked) return;
    const { index, relX, relY } = getHoveredNodeIndex(clientX, clientY);
    setPatternError(false);
    setPatternSuccess(false);

    if (index !== null) {
      setIsDrawingPattern(true);
      setSelectedPattern([index]);
      setPatternTouchPos({ x: relX, y: relY });
      playClickSound();
      triggerHapticVibration("light");
    }
  };

  const handlePatternMove = (clientX: number, clientY: number) => {
    if (!isDrawingPattern || patternSuccess || unlocked) return;
    const { index, relX, relY } = getHoveredNodeIndex(clientX, clientY);
    setPatternTouchPos({ x: relX, y: relY });

    if (index !== null && !selectedPattern.includes(index)) {
      setSelectedPattern((prev) => [...prev, index]);
      playClickSound();
      triggerHapticVibration("light");
    }
  };

  const handlePatternEnd = () => {
    if (!isDrawingPattern) return;
    setIsDrawingPattern(false);
    setPatternTouchPos(null);

    if (selectedPattern.length >= 3) {
      verifyPattern(selectedPattern);
    } else if (selectedPattern.length > 0) {
      setPatternError(true);
      triggerHapticVibration("heavy");
      setTimeout(() => {
        setSelectedPattern([]);
        setPatternError(false);
      }, 600);
    }
  };

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  // Mouse event handlers for desktop dragging
  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY);
  };

  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientY);
      }
    };

    const onWindowMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
  }, [isDragging, dragY, unlocked, showPinPad, showFaceScanModal]);

  const unlockProgress = Math.min(1, dragY / UNLOCK_THRESHOLD);

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      style={{
        transform: showPinPad || showFaceScanModal ? "none" : `translateY(-${dragY * 0.4}px)`,
        opacity: showPinPad || showFaceScanModal ? 1 : 1 - unlockProgress * 0.4,
        transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease-out",
        ...(wallpaperImageUrl
          ? {
              backgroundImage: `url(${wallpaperImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }
          : {})
      }}
      className={`absolute inset-0 ${wallpaperClass} p-5 flex flex-col justify-between items-center text-white select-none z-30 overflow-hidden ${
        showPinPad || showFaceScanModal ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {/* Pattern Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none os-wallpaper-pattern-overlay opacity-30 z-0" />

      {/* Dynamic Frosted Glass Backdrop Layer (Intensity scales with Battery Level) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out z-0 overflow-hidden"
        style={{
          backdropFilter: `blur(${blurPx}px) saturate(${saturatePct}%) contrast(${95 + Math.round((batteryLevel / 100) * 20)}%)`,
          WebkitBackdropFilter: `blur(${blurPx}px) saturate(${saturatePct}%) contrast(${95 + Math.round((batteryLevel / 100) * 20)}%)`,
          backgroundColor: `rgba(15, 23, 42, ${glassAlpha})`,
          border: `1px solid rgba(255, 255, 255, ${glassBorderAlpha})`,
          boxShadow: `inset 0 0 ${ambientGlowSpread}px rgba(255, 255, 255, ${(batteryLevel / 100) * 0.15})`
        }}
      >
        {/* Glass Prism Sheen & Glare Gradient Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, ${sheenAlpha}) 0%, rgba(255, 255, 255, 0) 50%, rgba(20, 184, 166, ${sheenAlpha}) 100%)`
          }}
        />
        
        {/* Subtle Glass Surface Micro-Texture */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Top Lock status indicator */}
      <div className="w-full flex items-center justify-center text-[11px] font-medium text-slate-300 pt-1 z-10 mt-6">
        <div className="flex flex-col items-center gap-1">
          <Lock size={16} className="text-white drop-shadow-md" />
        </div>
      </div>

      {/* 1. REGULAR LOCKSCREEN DISPLAY */}
      {!showPinPad && !showFaceScanModal && (
        <>
          {/* Main Clock & Date Display */}
          <div className="flex flex-col items-center text-center mt-3 space-y-1 z-10 w-full max-w-xs">
            
            {/* Timezone Switch Toast Notification */}
            {tzToast && (
              <div className="bg-slate-950/90 border border-teal-400/80 px-3 py-1 rounded-full text-teal-200 text-[11px] font-mono font-bold shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex items-center gap-1.5 mb-1">
                <Globe size={13} className="text-teal-400 animate-spin" />
                <span>{tzToast}</span>
              </div>
            )}

            {/* Active Timezone Pill Badge & Clock Style Customizer Button */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <button
                onClick={handleCycleTimezone}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/15 hover:border-teal-400/60 text-[10.5px] font-mono text-slate-200 hover:text-teal-300 transition-all cursor-pointer shadow-md group"
                title="Tap to cycle through world timezones"
              >
                <span className="text-xs">{currentTz.flag}</span>
                <span className="font-extrabold">{currentTz.name}</span>
                <span className="text-[9px] text-teal-400 opacity-80 group-hover:opacity-100">(Tap Clock)</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setShowClockCustomizer(!showClockCustomizer);
                }}
                className={`p-1.5 rounded-full border transition-all cursor-pointer shadow-md ${
                  showClockCustomizer
                    ? "bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-[0_0_12px_rgba(45,212,191,0.5)]"
                    : "bg-slate-950/70 text-slate-300 hover:text-teal-300 border-white/15 hover:border-teal-400/60"
                }`}
                title="Customize Lockscreen Clock (Fonts, Colors, 12H/24H, Seconds)"
              >
                <Palette size={13} />
              </button>
            </div>

            {/* Interactive Digital Clock Display (Tapping cycles timezones) */}
            <div
              onClick={handleCycleTimezone}
              className="relative group cursor-pointer active:scale-95 transition-transform my-0.5"
              title={`Tap clock to cycle timezone (Current: ${currentTz.name})`}
            >
              <h1 className={`text-[80px] leading-none font-semibold ${currentFont.class} text-white drop-shadow-md transition-all duration-300`}>
                {formattedClockTime}
              </h1>
            </div>

            <p className="text-lg font-medium text-white drop-shadow-md flex items-center justify-center gap-1">
              <span>{formattedClockDate}</span>
            </p>

            {/* Child Profile Greeting Badge */}
            {typeof window !== "undefined" && localStorage.getItem("child_name") && (
              <div className="mt-1 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950/70 border border-teal-500/30 text-[10.5px] font-mono text-teal-300 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                <span>Hi, {localStorage.getItem("child_name")}</span>
              </div>
            )}

            {/* Clock Customizer Modal Popover */}
            {showClockCustomizer && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-900/95 backdrop-blur-2xl border border-teal-500/50 p-3 rounded-2xl shadow-2xl z-30 text-left space-y-2.5 my-2 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                    <Palette size={14} className="text-teal-400" />
                    <span>Lockscreen Clock Customizer</span>
                  </div>
                  <button
                    onClick={() => setShowClockCustomizer(false)}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                  >
                    Close ✕
                  </button>
                </div>

                {/* 1. Timezone Selection */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                    <Globe size={12} className="text-teal-400" />
                    <span>Select Timezone</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                    {TIMEZONES.map((tz, idx) => (
                      <button
                        key={tz.id}
                        onClick={() => {
                          playClickSound();
                          setSelectedTzIdx(idx);
                        }}
                        className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                          selectedTzIdx === idx
                            ? "bg-teal-500/20 border-teal-400 text-teal-200 font-bold"
                            : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750"
                        }`}
                      >
                        <span>{tz.flag}</span>
                        <span className="truncate">{tz.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Clock Font Style */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                    <Type size={12} className="text-teal-400" />
                    <span>Typography Style</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                    {CLOCK_FONTS.map((font, idx) => (
                      <button
                        key={font.id}
                        onClick={() => {
                          playClickSound();
                          setSelectedFontIdx(idx);
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${font.class} ${
                          selectedFontIdx === idx
                            ? "bg-teal-500/20 border-teal-400 text-teal-200 font-bold"
                            : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750"
                        }`}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Color Accent & Glow */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                    <Sparkles size={12} className="text-teal-400" />
                    <span>Color & Glow Theme</span>
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    {CLOCK_COLORS.map((col, idx) => (
                      <button
                        key={col.id}
                        onClick={() => {
                          playClickSound();
                          setSelectedColorIdx(idx);
                        }}
                        className={`flex-1 py-1 px-2 rounded-lg border text-[9px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedColorIdx === idx
                            ? "bg-teal-500 text-slate-950 border-teal-400 shadow"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                        }`}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Format Controls (12H/24H & Seconds) */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                  <button
                    onClick={() => {
                      playClickSound();
                      setUse24Hour(!use24Hour);
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-mono font-bold cursor-pointer transition-all ${
                      use24Hour
                        ? "bg-teal-500 text-slate-950 border-teal-400"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {use24Hour ? "Format: 24-Hour" : "Format: 12-Hour (AM/PM)"}
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      setShowSeconds(!showSeconds);
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-mono font-bold cursor-pointer transition-all ${
                      showSeconds
                        ? "bg-teal-500 text-slate-950 border-teal-400"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {showSeconds ? "Seconds: ON" : "Seconds: OFF"}
                  </button>
                </div>
              </div>
            )}

            {/* Unlock Actions Row */}
            <div className="mt-6 flex items-center justify-center gap-2">
            </div>
          </div>

          {/* Sliding Track to Unlock */}
          <div className="w-full flex flex-col items-center gap-3 mb-4 relative">
            <div className="flex flex-col items-center gap-1 text-slate-300">
              <div
                className="flex flex-col items-center -space-y-2 animate-bounce"
                style={{ opacity: Math.max(0.2, 1 - unlockProgress * 1.5) }}
              >
                <ChevronUp size={20} className="text-teal-300 drop-shadow-md" />
                <ChevronUp size={16} className="text-teal-400/60" />
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-200 drop-shadow">
                {unlockProgress > 0.8 ? "Release to Unlock" : "Swipe Up / Tap to Open"}
              </span>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
                handleDirectUnlock();
              }}
              className="relative w-64 h-14 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 p-1 flex items-center shadow-2xl overflow-hidden cursor-pointer hover:border-teal-400/60 transition-colors"
              style={{
                borderColor: unlockProgress > 0.8 ? "rgba(45, 212, 191, 0.8)" : "rgba(255, 255, 255, 0.2)"
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-teal-500/40 to-cyan-500/50 rounded-full transition-all duration-75"
                style={{ width: `${Math.min(100, (dragY / UNLOCK_THRESHOLD) * 100)}%` }}
              />

              <span
                className="w-full text-center text-[10px] font-bold text-slate-200 uppercase tracking-widest pointer-events-none z-10 transition-opacity"
                style={{ opacity: Math.max(0, 1 - unlockProgress * 2) }}
              >
                Swipe or Tap to Unlock
              </span>

              <div
                className="absolute h-12 w-12 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-300 text-slate-950 flex items-center justify-center shadow-lg transition-transform"
                style={{
                  bottom: "4px",
                  left: "4px",
                  transform: `translateY(-${dragY * 0.15}px) scale(${1 + unlockProgress * 0.1})`
                }}
              >
                <Unlock size={22} className="text-slate-950 font-extrabold" />
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setShowPinPad(true);
                }}
                className="hover:text-amber-300 underline font-semibold cursor-pointer"
              >
                Test PIN / Pattern Lock
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2. CAMERA FACE ID VERIFICATION OVERLAY */}
      {showFaceScanModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl p-5 flex flex-col justify-between items-center text-white z-50 animate-in fade-in zoom-in-95 duration-200 select-none">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              {storedFaceSnapshot ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400 shadow-sm flex-shrink-0">
                  <img src={storedFaceSnapshot} alt="Registered Owner" className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950" />
                </div>
              ) : (
                <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <ScanFace size={18} />
                </div>
              )}
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Facial Recognition Lock</span>
                  {storedFaceSnapshot && (
                    <span className="text-[8px] bg-emerald-950 text-emerald-300 font-mono px-1 py-0.2 rounded border border-emerald-800 font-bold">
                      ENROLLED
                    </span>
                  )}
                </h3>
                <p className="text-[9px] text-slate-400">Camera Biometric Verification</p>
              </div>
            </div>

            {/* Persona Switcher Pill */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-inner">
              <button
                onClick={() => startFaceScan("owner")}
                className={`px-2 py-0.5 rounded-xl text-[9px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                  facePersona === "owner"
                    ? "bg-teal-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserCheck size={11} />
                <span>Owner</span>
              </button>
              <button
                onClick={() => startFaceScan("unauthorized")}
                className={`px-2 py-0.5 rounded-xl text-[9px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                  facePersona === "unauthorized"
                    ? "bg-rose-500 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <AlertTriangle size={11} />
                <span>Other Person</span>
              </button>
            </div>

            <button
              onClick={() => {
                stopCameraStream();
                setShowFaceScanModal(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Camera Viewfinder View */}
          <div
            className={`relative w-56 h-56 rounded-full overflow-hidden border-2 transition-colors duration-300 bg-black my-auto flex items-center justify-center ${
              scanState === "unauthorized_failed"
                ? "border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)]"
                : scanState === "success"
                ? "border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.6)]"
                : "border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
            }`}
          >
            {/* Live Video element */}
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Scanning Laser Beam Grid overlay */}
            {scanState !== "failed" && scanState !== "unauthorized_failed" && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                {/* Horizontal scan line animation */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce my-auto" />

                {/* Target Reticle Overlay */}
                <div className="absolute inset-4 border border-dashed border-amber-300/40 rounded-full flex items-center justify-center">
                  <div className="h-24 w-20 border-2 border-amber-400/80 rounded-[50%] animate-pulse flex items-center justify-center">
                    {scanState === "success" && (
                      <Check size={40} className="text-emerald-400 drop-shadow-md animate-bounce" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Unauthorized Person Auth Failed Alert Overlay */}
            {scanState === "unauthorized_failed" && (
              <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3 z-10 animate-in fade-in zoom-in-95">
                <AlertCircle size={40} className="text-rose-400 animate-bounce" />
                <p className="text-xs font-extrabold text-rose-200 mt-1">AUTH FAILED</p>
                <p className="text-[10px] font-bold text-rose-300">Face Not Recognized!</p>
                <p className="text-[8.5px] text-rose-300/80 font-mono mt-0.5">Access Denied (Confidence: 11.2%)</p>
              </div>
            )}

            {/* Camera Permission / Error Fallback inside viewfinder */}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 bg-slate-950/90 p-4 flex flex-col items-center justify-center text-center space-y-2 z-10">
                <VideoOff size={32} className="text-rose-400 animate-pulse" />
                <p className="text-[10px] font-bold text-rose-300">Camera Feed Unavailable</p>
                <p className="text-[8px] text-slate-400 leading-tight">
                  {cameraError || "Camera permission required for live facial verification."}
                </p>
              </div>
            )}
          </div>

          {/* Status Message & Progress Bar */}
          <div className="w-full max-w-xs space-y-2.5 text-center">
            <div className="space-y-0.5">
              <h4
                className={`text-xs font-bold ${
                  scanState === "unauthorized_failed"
                    ? "text-rose-400"
                    : scanState === "success"
                    ? "text-emerald-400"
                    : "text-amber-200"
                }`}
              >
                {scanState === "initializing" && "Initializing Front Camera..."}
                {scanState === "scanning" &&
                  (facePersona === "owner" ? "Scanning Owner Face..." : "Scanning Unknown Person Face...")}
                {scanState === "verifying" && "Matching Biometric Mesh..."}
                {scanState === "success" && "Face Verified! Access Granted"}
                {scanState === "failed" && "Camera Hardware Failure"}
                {scanState === "unauthorized_failed" && "AUTH FAILED: Access Denied!"}
              </h4>
              <p className="text-[10px] text-slate-400">
                {scanState === "unauthorized_failed"
                  ? "Unrecognized face geometry. Device remains locked."
                  : scanState === "failed"
                  ? "Camera permission is denied or camera unavailable."
                  : "Keep face centered in camera viewfinder oval."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-200 ${
                  scanState === "success"
                    ? "bg-emerald-400"
                    : scanState === "failed" || scanState === "unauthorized_failed"
                    ? "bg-rose-500"
                    : "bg-gradient-to-r from-amber-400 to-teal-400"
                }`}
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            {/* Fallback & Retry Buttons */}
            <div className="flex flex-col gap-2 w-full pt-1">
              <button
                onClick={handleDirectUnlock}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs cursor-pointer shadow flex items-center justify-center gap-1.5"
              >
                <Unlock size={14} className="text-slate-950" />
                <span>Instant Unlock Phone</span>
              </button>

              <div className="flex items-center justify-center gap-2">
                {scanState === "unauthorized_failed" ? (
                  <>
                    <button
                      onClick={() => startFaceScan("owner")}
                      className="py-1.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-[10px] cursor-pointer shadow flex items-center gap-1"
                    >
                      <UserCheck size={12} /> Try Owner Face
                    </button>
                    <button
                      onClick={() => {
                        stopCameraStream();
                        setShowFaceScanModal(false);
                        setShowPinPad(true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-bold cursor-pointer"
                    >
                      Use PIN (1234)
                    </button>
                  </>
                ) : scanState === "failed" ? (
                  <>
                    <button
                      onClick={() => simulateFaceScan("owner")}
                      className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[10px] cursor-pointer shadow transition-all"
                    >
                      Simulate Owner Face
                    </button>
                    <button
                      onClick={() => simulateFaceScan("unauthorized")}
                      className="py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-[10px] cursor-pointer shadow transition-all"
                    >
                      Simulate Other Person
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      stopCameraStream();
                      setShowFaceScanModal(false);
                      setShowPinPad(true);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-semibold cursor-pointer"
                  >
                    Use PIN Code (1234)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECURITY LOCK SCREEN OVERLAY (PIN & 3X3 PATTERN LOCK) */}
      {showPinPad && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl p-5 flex flex-col justify-between items-center text-white z-40 animate-in fade-in zoom-in-95 duration-200 select-none">
          {/* Top Mode Selector Tabs */}
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2.5 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner mx-auto">
              <button
                onClick={() => {
                  playClickSound();
                  setLockTab("pattern");
                }}
                className={`px-3 py-1 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
                  lockTab === "pattern"
                    ? "bg-teal-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>✍️ Pattern</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setLockTab("pin");
                }}
                className={`px-3 py-1 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
                  lockTab === "pin"
                    ? "bg-teal-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🔢 PIN Code</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setShowPinPad(false);
                  startFaceScan();
                }}
                className="px-3 py-1 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all text-slate-400 hover:text-amber-300 flex items-center gap-1.5"
              >
                <span>👤 Face ID</span>
              </button>
            </div>

            <button
              onClick={() => {
                setShowPinPad(false);
                setPin("");
                setPinError(false);
                setSelectedPattern([]);
                setPatternError(false);
              }}
              className="absolute right-4 p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* TAB 1: 3X3 INTERACTIVE PATTERN UNLOCK CANVAS */}
          {lockTab === "pattern" && (
            <div className="flex flex-col items-center gap-3 my-auto w-full max-w-xs">
              <div className="text-center space-y-1 mt-8">
                <h2 className="text-sm font-semibold tracking-tight text-white">
                  {patternSuccess ? "Access Granted" : patternError ? "Incorrect Pattern" : "Draw Pattern"}
                </h2>
              </div>

              {/* Interactive 3x3 Pattern Node Grid */}
              <div
                ref={patternGridRef}
                onPointerDown={(e) => handlePatternStart(e.clientX, e.clientY)}
                onPointerMove={(e) => handlePatternMove(e.clientX, e.clientY)}
                onPointerUp={handlePatternEnd}
                onPointerCancel={handlePatternEnd}
                onTouchStart={(e) => handlePatternStart(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchMove={(e) => handlePatternMove(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchEnd={handlePatternEnd}
                className="relative w-72 h-72 touch-none select-none flex items-center justify-center cursor-crosshair overflow-hidden my-auto"
              >
                {/* SVG Stroke Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {selectedPattern.map((nodeIdx, i) => {
                    if (i === 0) return null;
                    const p1 = getNodeCenter(selectedPattern[i - 1]);
                    const p2 = getNodeCenter(nodeIdx);
                    return (
                      <line
                        key={`line-${i}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={patternSuccess ? "#34d399" : patternError ? "#f43f5e" : "#2dd4bf"}
                        strokeWidth="5"
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
                      />
                    );
                  })}

                  {/* Active Dragging Rubberband Line */}
                  {isDrawingPattern && selectedPattern.length > 0 && patternTouchPos && (
                    <line
                      x1={getNodeCenter(selectedPattern[selectedPattern.length - 1]).x}
                      y1={getNodeCenter(selectedPattern[selectedPattern.length - 1]).y}
                      x2={patternTouchPos.x}
                      y2={patternTouchPos.y}
                      stroke="#2dd4bf"
                      strokeWidth="3"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* 3x3 Circular Nodes Grid */}
                <div className="grid grid-cols-3 grid-rows-3 gap-6 w-full h-full relative z-20">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                    const isSelected = selectedPattern.includes(index);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-center relative"
                      >
                        <div
                          className={`w-12 h-12 rounded-full transition-all flex items-center justify-center`}
                        >
                          <div
                            className={`rounded-full transition-all duration-200 ${
                              isSelected
                                ? patternSuccess
                                  ? "w-4 h-4 bg-emerald-400"
                                  : patternError
                                  ? "w-4 h-4 bg-rose-500"
                                  : "w-4 h-4 bg-white"
                                : "w-3 h-3 bg-white/20 border border-white/40"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5 w-full pt-1 mb-8 mt-auto">
                <button
                  onClick={handleDirectUnlock}
                  className="text-white/80 font-medium text-sm cursor-pointer hover:text-white transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 4-DIGIT PIN CODE PAD */}
          {lockTab === "pin" && (
            <>
              {/* Header & Status */}
              <div className="flex flex-col items-center gap-2 mt-8 text-center">
                <h2 className="text-sm font-semibold tracking-tight text-white">
                  {pinSuccess ? "Access Granted" : pinError ? "Incorrect PIN" : "Enter PIN"}
                </h2>

                {/* PIN Indicator Dots */}
                <div className={`flex items-center gap-6 mt-6 ${pinError ? "animate-pulse" : ""}`}>
                  {[0, 1, 2, 3].map((index) => {
                    const filled = pin.length > index;
                    return (
                      <div
                        key={index}
                        className={`h-4 w-4 rounded-full transition-all duration-150 ${
                          pinSuccess
                            ? "bg-white"
                            : pinError
                            ? "bg-rose-500"
                            : filled
                            ? "bg-white scale-110"
                            : "bg-white/20 border border-white/40"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Numeric Keypad Grid */}
              <div className="w-full max-w-[280px] grid grid-cols-3 gap-4 my-auto mt-12">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyClick(num)}
                    className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 text-2xl font-light text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all mx-auto backdrop-blur-md"
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setPin("");
                    setPinError(false);
                  }}
                  className="h-16 w-16 rounded-full bg-transparent text-sm font-medium text-white/60 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all mx-auto"
                >
                  Clear
                </button>

                <button
                  onClick={() => handleKeyClick("0")}
                  className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 text-2xl font-light text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all mx-auto backdrop-blur-md"
                >
                  0
                </button>

                <button
                  onClick={handleDelete}
                  className="h-16 w-16 rounded-full bg-transparent text-white/60 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all mx-auto"
                >
                  <Delete size={20} />
                </button>
              </div>
            </>
          )}

          {/* Bottom Direct Bypass Unlock */}
          <div className="flex flex-col items-center gap-1.5 w-full pt-1 mb-8">
            <button
              onClick={handleDirectUnlock}
              className="text-white/80 font-medium text-sm cursor-pointer hover:text-white transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


