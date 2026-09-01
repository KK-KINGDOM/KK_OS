import React, { useState, useEffect } from "react";
import PhoneShell from "./components/PhoneShell";
import { SystemToast, LogSeverity, AppID } from "./types";
import { playLowBatterySound, playLogSound } from "./utils/sound";

export default function App() {
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "[0.00] [PowerHAL] Power node bound to AC host interface.",
    "[0.01] [Bootloader] Verified secure boot keys. SHA256 matches.",
    "[0.02] [KernelCore] slab allocator initialized. Buddy allocator pages allocated: 8192MB.",
    "[0.03] [KernelCore] Completely Fair Scheduler (CFS) bounds configured successfully.",
    "[0.05] [ActivityManager] Initializing default application packages.",
    "[0.08] [PowerHAL] Battery daemon online. Initial charge: 95% (Healthy Optimization Profile)."
  ]);

  // Battery & Active App state for realistic OS-level power consumption
  const [activeApp, setActiveApp] = useState<AppID | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number>(95); // Default healthy battery charge (95%)
  const [isBatterySaver, setIsBatterySaver] = useState<boolean>(false);
  const [performanceMode, setPerformanceMode] = useState<"high_performance" | "power_efficient">("power_efficient");
  const [hasNotifiedLowBattery, setHasNotifiedLowBattery] = useState<boolean>(false);

  // Active toast notifications with initial interactive samples
  const [toasts, setToasts] = useState<SystemToast[]>([
    {
      id: "toast-init-msg",
      logText: "[Messages] Alex Morgan: Hey, are you ready to test the new KK OS Notification Center?",
      severity: "INFO",
      timestamp: "10:42",
      module: "Messages",
      sender: "Alex Morgan",
      message: "Hey, are you ready to test the new KK OS Notification Center? You can reply directly here!",
      category: "message",
      isRead: false,
      isArchived: false,
      appId: AppID.MESSAGES
    },
    {
      id: "toast-init-sec",
      logText: "[SecurityCore] [WARNING] SELinux Policy Engine: Background app sandboxing integrity verified.",
      severity: "WARNING",
      timestamp: "10:38",
      module: "SecurityCore",
      sender: "SELinux Shield",
      message: "Security status optimal. 0 permission anomalies detected in process memory.",
      category: "security",
      isRead: true,
      isArchived: false,
      appId: AppID.SECURITY
    }
  ]);

  const addSystemLog = (log: string, explicitSeverity?: LogSeverity) => {
    const timestampSec = (performance.now() / 1000).toFixed(2);
    const formattedLog = `[${timestampSec}] ${log}`;
    setSystemLogs((prev) => [...prev, formattedLog]);

    // Determine log severity
    let resolvedSeverity: LogSeverity = explicitSeverity || "INFO";

    if (!explicitSeverity) {
      const upperLog = log.toUpperCase();
      if (
        upperLog.includes("CRITICAL") ||
        upperLog.includes("FATAL") ||
        upperLog.includes("PANIC") ||
        upperLog.includes("EMERGENCY") ||
        upperLog.includes("SEVERITY: CRITICAL")
      ) {
        resolvedSeverity = "CRITICAL";
      } else if (
        upperLog.includes("WARNING") ||
        upperLog.includes("WARN") ||
        upperLog.includes("ALERT") ||
        upperLog.includes("SECURITY RISK") ||
        upperLog.includes("THROTTLING") ||
        upperLog.includes("SEVERITY: WARNING")
      ) {
        resolvedSeverity = "WARNING";
      }
    }

    // Play distinct notification audio according to severity
    playLogSound(resolvedSeverity);

    // Trigger toast notification if severity matches WARNING or CRITICAL
    if (resolvedSeverity === "WARNING" || resolvedSeverity === "CRITICAL") {
      const severity = resolvedSeverity;
      // Extract module name [Module] if present
      const moduleMatch = log.match(/\[([A-Za-z0-9_-]+)\]/);
      const module = moduleMatch ? moduleMatch[1] : undefined;

      // Clean message text by removing module bracket tags if present
      let cleanMessage = log;
      if (module) {
        cleanMessage = cleanMessage.replace(`[${module}]`, "").trim();
      }
      cleanMessage = cleanMessage.replace(/\[(WARNING|CRITICAL|WARN|FATAL|ERROR)\]/gi, "").trim();

      const newToast: SystemToast = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        logText: log,
        severity,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        module,
        message: cleanMessage || log,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5));
    }
  };

  // Interval-based battery drain script based on active app usage & power profile
  useEffect(() => {
    // Realistic OS battery drain rates:
    // When High Performance mode is active:
    //   - Intensive apps: 30s per 1%
    //   - Standard apps: 60s per 1%
    //   - Standby: 120s (2 min) per 1%
    // When Power Efficient mode is active:
    //   - Intensive apps: 90s per 1%
    //   - Standard apps: 180s (3 min) per 1%
    //   - Standby: 300s (5 min) per 1%
    // Battery Saver multiplier: 2x duration

    let intervalMs = performanceMode === "high_performance" ? 120000 : 300000;

    if (
      activeApp === AppID.CAMERA ||
      activeApp === AppID.AI_ASSISTANT ||
      activeApp === AppID.TERMINAL ||
      activeApp === AppID.TASK_MANAGER ||
      activeApp === AppID.BROWSER
    ) {
      intervalMs = performanceMode === "high_performance" ? 30000 : 90000;
    } else if (activeApp) {
      intervalMs = performanceMode === "high_performance" ? 60000 : 180000;
    }

    if (isBatterySaver) {
      intervalMs *= 2; // Battery Saver doubles standby/usage efficiency
    }

    const interval = setInterval(() => {
      setBatteryLevel((prevLevel) => {
        if (prevLevel <= 1) return 1;
        const nextLevel = prevLevel - 1;

        // Low-battery notification trigger at 15%
        if (nextLevel === 15 && !hasNotifiedLowBattery) {
          playLowBatterySound();
          addSystemLog(
            "[PowerHAL] [WARNING] Low Battery Alert: System battery capacity dropped to 15%! Connect charger immediately.",
            "WARNING"
          );
          setHasNotifiedLowBattery(true);
        }

        return nextLevel;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [activeApp, hasNotifiedLowBattery, isBatterySaver, performanceMode]);

  const handleBatteryChange = (newLevel: number) => {
    const clamped = Math.max(1, Math.min(100, newLevel));
    setBatteryLevel(clamped);

    if (clamped <= 15 && !hasNotifiedLowBattery) {
      playLowBatterySound();
      addSystemLog(
        "[PowerHAL] [WARNING] Low Battery Alert: System battery capacity dropped to 15%! Connect charger immediately.",
        "WARNING"
      );
      setHasNotifiedLowBattery(true);
    } else if (clamped > 15 && hasNotifiedLowBattery) {
      setHasNotifiedLowBattery(false);
      addSystemLog(`[PowerHAL] Charger connected. Battery level recharged to ${clamped}%.`, "INFO");
    }
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllToasts = () => {
    setToasts([]);
    addSystemLog("[NotificationManager] Cleared all notifications.", "INFO");
  };

  const handleMarkReadToast = (id: string, isRead: boolean = true) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRead } : t))
    );
    addSystemLog(`[NotificationManager] Notification ${id} marked as ${isRead ? "READ" : "UNREAD"}.`, "INFO");
  };

  const handleMarkAllReadToasts = () => {
    setToasts((prev) => prev.map((t) => ({ ...t, isRead: true })));
    addSystemLog("[NotificationManager] Marked all active notifications as READ.", "INFO");
  };

  const handleArchiveToast = (id: string, isArchived: boolean = true) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isArchived, isRead: true } : t))
    );
    addSystemLog(`[NotificationManager] Notification ${id} ${isArchived ? "archived" : "restored to active"}.`, "INFO");
  };

  const handleArchiveAllToasts = () => {
    setToasts((prev) => prev.map((t) => ({ ...t, isArchived: true, isRead: true })));
    addSystemLog("[NotificationManager] Archived all active notifications.", "INFO");
  };

  const handleReplyToast = (id: string, replyText: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setToasts((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              replyText,
              replySentAt: timeStr,
              isRead: true
            }
          : t
      )
    );
    addSystemLog(`[MessagesHAL] Direct Quick Reply transmitted for notification [${id}]: "${replyText}"`, "INFO");
  };

  const handleSimulateNotification = (sample: Partial<SystemToast>) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newToast: SystemToast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      logText: sample.message || "Simulated notification alert",
      severity: sample.severity || "INFO",
      timestamp: timeStr,
      module: sample.module || "System",
      sender: sample.sender || "System",
      message: sample.message || "New interactive notification",
      category: sample.category || "system",
      isRead: false,
      isArchived: false,
      appId: sample.appId,
      ...sample
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 10));
    addSystemLog(`[NotificationManager] Incoming alert dispatched: [${newToast.module || 'System'}] ${newToast.message}`, newToast.severity);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-6 font-sans overflow-y-auto selection:bg-teal-500 selection:text-black" id="app-root">
      {/* Mobile OS Phone Display Only */}
      <main className="w-full max-w-md flex flex-col items-center justify-center my-auto">
        <PhoneShell
          onSystemLog={addSystemLog}
          toasts={toasts}
          onDismissToast={handleDismissToast}
          onClearAllToasts={handleClearAllToasts}
          onMarkReadToast={handleMarkReadToast}
          onMarkAllReadToasts={handleMarkAllReadToasts}
          onArchiveToast={handleArchiveToast}
          onArchiveAllToasts={handleArchiveAllToasts}
          onReplyToast={handleReplyToast}
          onSimulateNotification={handleSimulateNotification}
          batteryLevel={batteryLevel}
          onBatteryChange={handleBatteryChange}
          isBatterySaver={isBatterySaver}
          onToggleBatterySaver={(saver) => setIsBatterySaver(saver)}
          performanceMode={performanceMode}
          onPerformanceModeChange={(mode) => {
            setPerformanceMode(mode);
            addSystemLog(`[PowerHAL] Performance profile changed to: ${mode === "high_performance" ? "High Performance" : "Power Efficient"}`);
          }}
          onActiveAppChange={(appId) => setActiveApp(appId)}
        />
      </main>
    </div>
  );
}


