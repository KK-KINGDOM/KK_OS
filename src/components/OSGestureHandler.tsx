import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles, RotateCcw, Sliders, ChevronDown, Layers, ChevronUp } from "lucide-react";
import { AppID, LogSeverity } from "../types";
import { playClickSound, playAppLaunchSound } from "../utils/sound";

interface OSGestureHandlerProps {
  children: React.ReactNode;
  activeApp: AppID | null;
  appDrawerOpen: boolean;
  appSwitcherOpen: boolean;
  quickSettingsOpen: boolean;
  onSwipeBack: () => void;
  onPullRefresh: () => void;
  onOpenControlCenter?: () => void;
  onOpenRecents?: () => void;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
}

export default function OSGestureHandler({
  children,
  activeApp,
  appDrawerOpen,
  appSwitcherOpen,
  quickSettingsOpen,
  onSwipeBack,
  onPullRefresh,
  onOpenControlCenter,
  onOpenRecents,
  onSystemLog
}: OSGestureHandlerProps) {
  // Edge Swipe-to-Back State
  const [backDrag, setBackDrag] = useState<{
    side: "left" | "right" | null;
    distance: number;
    active: boolean;
  }>({ side: null, distance: 0, active: false });

  // Pull-Down-to-Refresh State
  const [pullDrag, setPullDrag] = useState<{
    distance: number;
    active: boolean;
    isRefreshing: boolean;
  }>({ distance: 0, active: false, isRefreshing: false });

  // Swipe-Down for Control Center State (from top edge)
  const [controlCenterDrag, setControlCenterDrag] = useState<{
    distance: number;
    active: boolean;
  }>({ distance: 0, active: false });

  // Swipe-Up for Recent Apps State (from bottom edge)
  const [recentsDrag, setRecentsDrag] = useState<{
    distance: number;
    active: boolean;
  }>({ distance: 0, active: false });

  // Pointer drag trackers
  const startPosRef = useRef<{
    x: number;
    y: number;
    time: number;
    side: "left" | "right" | "top" | "bottom" | "center";
    isTopEdge: boolean;
    isBottomEdge: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_BACK_THRESHOLD = 50; // px inward
  const PULL_REFRESH_THRESHOLD = 60; // px downward
  const CONTROL_CENTER_THRESHOLD = 40; // px downward from top edge
  const SWIPE_RECENTS_THRESHOLD = 38; // px upward from bottom edge

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't intercept if clicking on inputs/buttons unless dragged
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let side: "left" | "right" | "top" | "bottom" | "center" = "center";
    const isTopEdge = y < 55;
    const isBottomEdge = y > rect.height - 75;

    if (x < 32) {
      side = "left";
    } else if (x > rect.width - 32) {
      side = "right";
    } else if (isTopEdge || y < 90) {
      side = "top";
    } else if (isBottomEdge) {
      side = "bottom";
    }

    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      side,
      isTopEdge,
      isBottomEdge
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startPosRef.current) return;

    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    const { side, isTopEdge, isBottomEdge } = startPosRef.current;

    // 1. SWIPE-TO-BACK GESTURE (From left or right edge)
    if ((side === "left" && dx > 5) || (side === "right" && dx < -5)) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Verify horizontal direction dominant
      if (absDx > absDy) {
        setBackDrag({
          side: side === "left" ? "left" : "right",
          distance: Math.min(100, absDx),
          active: true
        });
        return;
      }
    }

    // 2. SWIPE-UP FOR RECENT APPS (From bottom edge < 75px from bottom)
    if (isBottomEdge && dy < -6 && Math.abs(dx) < Math.abs(dy)) {
      setRecentsDrag({
        distance: Math.min(90, Math.abs(dy)),
        active: true
      });
      return;
    }

    // 3. SWIPE-DOWN FOR CONTROL CENTER (From top edge < 55px)
    if (isTopEdge && dy > 8 && Math.abs(dx) < dy) {
      setControlCenterDrag({
        distance: Math.min(90, dy),
        active: true
      });
      return;
    }

    // 4. PULL-DOWN-TO-REFRESH GESTURE (From non-edge top area when dy > 8)
    if (!isTopEdge && side === "top" && dy > 8 && Math.abs(dx) < dy) {
      if (!pullDrag.isRefreshing) {
        setPullDrag((prev) => ({
          ...prev,
          distance: Math.min(110, dy),
          active: true
        }));
      }
    }
  };

  const handlePointerUp = () => {
    if (!startPosRef.current) return;

    // Evaluate Recent Apps Swipe-Up
    if (recentsDrag.active && recentsDrag.distance >= SWIPE_RECENTS_THRESHOLD) {
      playClickSound();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(20); } catch (e) {}
      }
      onOpenRecents?.();
      onSystemLog?.(`[GestureEngine] Swipe-up gesture detected from bottom edge -> Recent Apps overview triggered`, "INFO");
    }

    // Evaluate Control Center Swipe-Down
    if (controlCenterDrag.active && controlCenterDrag.distance >= CONTROL_CENTER_THRESHOLD) {
      playClickSound();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(15); } catch (e) {}
      }
      onOpenControlCenter?.();
      onSystemLog?.(`[GestureEngine] Swipe-down gesture detected from top edge -> Control Center triggered`, "INFO");
    }

    // Evaluate Swipe-to-Back
    if (backDrag.active && backDrag.distance >= SWIPE_BACK_THRESHOLD) {
      playClickSound();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(20); } catch (e) {}
      }
      onSwipeBack();
      onSystemLog?.(`[GestureEngine] Swipe-to-Back gesture executed (${backDrag.side} edge -> ${Math.round(backDrag.distance)}px)`, "INFO");
    }

    // Evaluate Pull-Down-to-Refresh
    if (pullDrag.active && pullDrag.distance >= PULL_REFRESH_THRESHOLD && !pullDrag.isRefreshing) {
      playAppLaunchSound();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate([15, 20, 15]); } catch (e) {}
      }
      setPullDrag({ distance: 65, active: false, isRefreshing: true });
      onSystemLog?.(`[GestureEngine] Pull-down-to-refresh triggered (${Math.round(pullDrag.distance)}px pull)`, "INFO");

      onPullRefresh();

      setTimeout(() => {
        setPullDrag({ distance: 0, active: false, isRefreshing: false });
      }, 800);
    } else {
      setPullDrag({ distance: 0, active: false, isRefreshing: false });
    }

    setBackDrag({ side: null, distance: 0, active: false });
    setControlCenterDrag({ distance: 0, active: false });
    setRecentsDrag({ distance: 0, active: false });
    startPosRef.current = null;
  };

  const isBackReady = backDrag.distance >= SWIPE_BACK_THRESHOLD;
  const isPullReady = pullDrag.distance >= PULL_REFRESH_THRESHOLD;
  const isControlCenterReady = controlCenterDrag.distance >= CONTROL_CENTER_THRESHOLD;
  const isRecentsReady = recentsDrag.distance >= SWIPE_RECENTS_THRESHOLD;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-full overflow-hidden select-none touch-none"
    >
      {/* 0. VISUAL PULL-DOWN-FOR-CONTROL-CENTER INDICATOR */}
      <AnimatePresence>
        {controlCenterDrag.active && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: Math.min(45, controlCenterDrag.distance * 0.5) }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute top-1 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div
              className={`px-3 py-1.5 rounded-full border shadow-2xl flex items-center gap-2 backdrop-blur-xl transition-all ${
                isControlCenterReady
                  ? "bg-teal-950/95 border-teal-400 text-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.7)] scale-105"
                  : "bg-slate-900/90 border-slate-700 text-slate-300"
              }`}
            >
              <Sliders size={13} className={isControlCenterReady ? "text-teal-300 animate-pulse" : "text-slate-400"} />
              <span className="text-[9.5px] font-mono font-bold tracking-tight">
                {isControlCenterReady ? "Release for Control Center" : "Pull for Control Center..."}
              </span>
              <ChevronDown size={12} className={isControlCenterReady ? "text-teal-400 translate-y-0.5" : "text-slate-500"} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. VISUAL PULL-DOWN-TO-REFRESH INDICATOR */}
      <AnimatePresence>
        {(pullDrag.active || pullDrag.isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: Math.min(50, pullDrag.distance * 0.5) }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div
              className={`px-3 py-1.5 rounded-full border shadow-2xl flex items-center gap-2 backdrop-blur-xl transition-all ${
                pullDrag.isRefreshing
                  ? "bg-teal-950/95 border-teal-400 text-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.6)]"
                  : isPullReady
                  ? "bg-emerald-950/95 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-105"
                  : "bg-slate-900/90 border-slate-700 text-slate-300"
              }`}
            >
              <motion.div
                animate={pullDrag.isRefreshing ? { rotate: 360 } : { rotate: pullDrag.distance * 4 }}
                transition={pullDrag.isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
              >
                <RefreshCw size={13} className={isPullReady || pullDrag.isRefreshing ? "text-teal-300" : "text-slate-400"} />
              </motion.div>

              <span className="text-[9.5px] font-mono font-bold tracking-tight">
                {pullDrag.isRefreshing
                  ? "Refreshing System State..."
                  : isPullReady
                  ? "Release to Refresh"
                  : "Pull down to refresh..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. VISUAL SWIPE-TO-BACK EDGE INDICATOR */}
      <AnimatePresence>
        {backDrag.active && backDrag.side && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-1.5 px-2.5 py-2 rounded-full border backdrop-blur-2xl shadow-2xl ${
              backDrag.side === "left" ? "left-2" : "right-2 flex-row-reverse"
            } ${
              isBackReady
                ? "bg-teal-950/95 border-teal-400 text-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.6)] scale-110"
                : "bg-slate-900/90 border-slate-700 text-slate-300"
            }`}
            style={{
              transform: `translateY(-50%) translateX(${
                backDrag.side === "left"
                  ? Math.min(30, backDrag.distance * 0.3)
                  : -Math.min(30, backDrag.distance * 0.3)
              }px)`
            }}
          >
            <div className={`p-1 rounded-full ${isBackReady ? "bg-teal-400 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
              {backDrag.side === "left" ? (
                <ChevronLeft size={16} className={isBackReady ? "font-bold" : ""} />
              ) : (
                <ChevronRight size={16} className={isBackReady ? "font-bold" : ""} />
              )}
            </div>

            <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider">
              {isBackReady ? "Back" : `${Math.round(backDrag.distance)}px`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. VISUAL SWIPE-UP-FOR-RECENT-APPS INDICATOR */}
      <AnimatePresence>
        {recentsDrag.active && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: -Math.min(45, recentsDrag.distance * 0.5) }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div
              className={`px-3.5 py-1.5 rounded-full border shadow-2xl flex items-center gap-2 backdrop-blur-xl transition-all ${
                isRecentsReady
                  ? "bg-teal-950/95 border-teal-400 text-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.7)] scale-105"
                  : "bg-slate-900/90 border-slate-700 text-slate-300"
              }`}
            >
              <Layers size={13} className={isRecentsReady ? "text-teal-300 animate-pulse" : "text-slate-400"} />
              <span className="text-[9.5px] font-mono font-bold tracking-tight">
                {isRecentsReady ? "Release for Recent Apps" : "Swipe up for Recent Apps..."}
              </span>
              <ChevronUp size={12} className={isRecentsReady ? "text-teal-400 -translate-y-0.5" : "text-slate-500"} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INNER APP DISPLAY / HOME CONTAINER */}
      {children}
    </div>
  );
}
