import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Mic, MicOff, Volume2, Sparkles, AlertCircle, Radio, VolumeX, ShieldAlert, Camera } from "lucide-react";
import { TerminalLog, OSFile, LogSeverity, AppID } from "../types";
import { KK_OS_FILE_TREE, NEOFETCH_ASCII, DMESG_LOGS } from "../mockOSData";
import { getSecurityLogs, recordSecurityLog } from "../utils/securityLogs";
import {
  startLostDeviceBeacon,
  stopLostDeviceBeacon,
  getIsLostDeviceBeaconActive,
  addLostDeviceBeaconListener
} from "../utils/lostDeviceBeacon";
import { captureScreen } from "../utils/screenCapture";
import { useDictation } from "../hooks/useDictation";

interface AppTerminalProps {
  onReboot: () => void;
  onPowerOff: () => void;
  uptimeSeconds: number;
  ramUsedMB: number;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
  onOpenApp?: (appId: AppID) => void;
  onTriggerOsDownload?: () => void;
  onTriggerBootAnim?: () => void;
}

interface AppInfo {
  id: AppID;
  name: string;
  pkg: string;
  version: string;
  status: string;
  category: string;
}

const SYSTEM_APPS: AppInfo[] = [
  { id: AppID.BROWSER, name: "Google Chrome Browser", pkg: "com.google.android.browser", version: "126.0.2", status: "READY", category: "Web & Network" },
  { id: AppID.PHONE, name: "Phone & Dialer", pkg: "com.kkos.dialer", version: "2.4.1", status: "READY", category: "Communication" },
  { id: AppID.MESSAGES, name: "Messages & SMS", pkg: "com.kkos.messaging", version: "2.1.0", status: "READY", category: "Communication" },
  { id: AppID.CAMERA, name: "HD Camera & Scanner", pkg: "com.kkos.camera", version: "3.0.1", status: "READY", category: "Media & Tools" },
  { id: AppID.SECURITY, name: "Security & Antivirus Center", pkg: "com.kkos.security", version: "1.9.4", status: "READY", category: "System & Security" },
  { id: AppID.TASK_MANAGER, name: "Task Manager Pro", pkg: "com.kkos.taskmanager", version: "1.0.0", status: "READY", category: "System & Performance" },
  { id: AppID.FILE_MANAGER, name: "File Manager Pro", pkg: "com.kkos.filemanager", version: "2.2.0", status: "READY", category: "System & Tools" },
  { id: AppID.AI_ASSISTANT, name: "KK Gemini AI Assistant", pkg: "com.kkos.ai.gemini", version: "1.5.0", status: "READY", category: "Intelligence" },
  { id: AppID.GALLERY, name: "Photo Gallery", pkg: "com.kkos.gallery", version: "2.0.2", status: "READY", category: "Media" },
  { id: AppID.MUSIC, name: "KK Music Player", pkg: "com.kkos.music", version: "1.8.3", status: "READY", category: "Media" },
  { id: AppID.WEATHER, name: "Live Weather Radar", pkg: "com.kkos.weather", version: "2.0.0", status: "READY", category: "Information" },
  { id: AppID.CLOCK, name: "World Clock & Alarm", pkg: "com.kkos.clock", version: "1.5.1", status: "READY", category: "Utilities" },
  { id: AppID.CALCULATOR, name: "Scientific Calculator", pkg: "com.kkos.calculator", version: "1.2.0", status: "READY", category: "Utilities" },
  { id: AppID.SETTINGS, name: "System Settings", pkg: "com.kkos.settings", version: "2.5.0", status: "RUNNING", category: "System" },
  { id: AppID.TERMINAL, name: "KK Shell Terminal", pkg: "com.kkos.terminal", version: "2.1.7", status: "ACTIVE", category: "System Developer" },
];

export default function AppTerminal({
  onReboot,
  onPowerOff,
  uptimeSeconds,
  ramUsedMB,
  onSystemLog,
  onOpenApp,
  onTriggerOsDownload,
  onTriggerBootAnim
}: AppTerminalProps) {
  const [history, setHistory] = useState<TerminalLog[]>([
    {
      text: "KK-sh (Core Shell) v2.1-v7\nType 'help' for available commands or 'apps' to list system applications.",
      type: "system",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [currentPath, setCurrentPath] = useState<string>("/KK-Mobile-OS");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dictation Mode Hook
  const {
    isListening,
    interimTranscript,
    micVolume,
    error: dictationError,
    toggleListening,
    stopListening
  } = useDictation({
    onTranscriptChange: (text) => {
      const cleanText = text.trim();
      if (cleanText.toLowerCase().endsWith(" execute") || cleanText.toLowerCase().endsWith(" run")) {
        const cmdOnly = cleanText.replace(/\s+(execute|run)$/i, "");
        setInput(cmdOnly);
        handleCommand(cmdOnly);
        stopListening();
      } else {
        setInput(cleanText);
      }
    }
  });

  const [isBeaconActive, setIsBeaconActive] = useState(() => getIsLostDeviceBeaconActive());
  const [beaconRemainingSec, setBeaconRemainingSec] = useState(0);

  // Subscribe to beacon status events
  useEffect(() => {
    const unsub = addLostDeviceBeaconListener((detail) => {
      setIsBeaconActive(detail.active);
      setBeaconRemainingSec(detail.remainingSeconds);
    });
    return () => unsub();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Focus terminal on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${s}s`;
  };

  const findNodeByPath = (path: string): OSFile | null => {
    if (path === "/KK-Mobile-OS") return KK_OS_FILE_TREE;
    
    const parts = path.split("/").filter(Boolean);
    if (parts[0] !== "KK-Mobile-OS") return null;

    let currentNode = KK_OS_FILE_TREE;
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!currentNode.children) return null;
      const found = currentNode.children.find((child) => child.name === part);
      if (!found) return null;
      currentNode = found;
    }
    return currentNode;
  };

  const mapAliasToAppId = (term: string): AppID | null => {
    const lower = term.toLowerCase().trim();
    if (lower === "browser" || lower === "google" || lower === "chrome" || lower === "web") return AppID.BROWSER;
    if (lower === "phone" || lower === "dialer" || lower === "call") return AppID.PHONE;
    if (lower === "messages" || lower === "message" || lower === "sms") return AppID.MESSAGES;
    if (lower === "camera" || lower === "cam") return AppID.CAMERA;
    if (lower === "security" || lower === "antivirus") return AppID.SECURITY;
    if (lower === "file_manager" || lower === "file" || lower === "files") return AppID.FILE_MANAGER;
    if (lower === "ai_assistant" || lower === "ai" || lower === "gemini" || lower === "assistant") return AppID.AI_ASSISTANT;
    if (lower === "gallery" || lower === "photos") return AppID.GALLERY;
    if (lower === "music" || lower === "audio") return AppID.MUSIC;
    if (lower === "weather") return AppID.WEATHER;
    if (lower === "clock" || lower === "alarm") return AppID.CLOCK;
    if (lower === "calculator" || lower === "calc") return AppID.CALCULATOR;
    if (lower === "task_manager" || lower === "tasks" || lower === "processes" || lower === "ps") return AppID.TASK_MANAGER;
    if (lower === "settings" || lower === "config") return AppID.SETTINGS;
    if (lower === "terminal" || lower === "shell") return AppID.TERMINAL;

    const matched = SYSTEM_APPS.find(
      (a) => a.id === lower || a.name.toLowerCase().includes(lower) || a.pkg.toLowerCase().includes(lower)
    );
    return matched ? matched.id : null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIdx < cmdHistory.length - 1 ? historyIdx + 1 : historyIdx;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const commandLog: TerminalLog = {
      text: `kk-sh:${currentPath}$ ${trimmed}`,
      type: "input",
      timestamp: new Date().toLocaleTimeString(),
    };

    const newLogs: TerminalLog[] = [commandLog];
    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();
    const target = args[1];

    switch (cmd) {
      case "help":
        newLogs.push({
          text: `AVAILABLE KK-SH SYSTEM COMMANDS:
=====================================================
  apps / pm list     - List all installed KK OS applications & packages
  open <app>         - Launch an app (e.g., 'open browser', 'open camera', 'open settings')
  check <app|all>    - Run real-time diagnostic health check on app(s)
  test <app|all>     - Run functional test suite for system modules
  screenshot         - Capture current screen view, flash screen, save to Gallery & display toast
  chargelog / battery- View historical record of battery charging events & health metrics
  security-logs      - View 'Security' log category (Face Unlock & Lost Device Recovery events)
  sysinfo / neofetch - Print complete hardware and kernel specifications
  top / ps           - View active processes and RAM/CPU metrics
  free / mem         - Memory heap usage statistics
  df / storage       - Filesystem disk allocation report
  ping [device|host] - Trigger lost device acoustic siren & screen strobe ('ping' or 'ping device'), or test network latency ('ping google.com')
  ping stop          - Silence and deactivate lost device recovery siren & screen strobe
  locate / finddevice- Alias for lost device recovery acoustic ping beacon
  curl <url>         - Send HTTP request and print header/payload response
  ls [path]          - List files in current or target directory
  cd <dir>           - Navigate file system directory
  cat <file>         - Display file contents
  pwd                - Print current working directory
  whoami             - Print current user privileges
  date               - Print current clock timestamp
  dmesg              - View system kernel ring buffer logs
  warn <message>     - Trigger system warning alert
  critical <message> - Trigger system critical error alert
  clear              - Clear terminal display buffer
  reboot             - Perform hardware cold boot
  poweroff           - Shutdown device runtime`,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;

      case "screenshot":
      case "screencap":
      case "capture":
      case "scrot": {
        const item = captureScreen({
          title: target ? `Screenshot_${target}` : undefined,
          openToastImmediately: true
        });

        onSystemLog?.(`[SurfaceFlinger] Framebuffer captured & stored: ${item.title} (${item.filePath})`, "INFO");

        let scrotOutput = `================================================================================\n`;
        scrotOutput += `             KK OS SCREEN FRAMEBUFFER CAPTURE DAEMON (screencap)                \n`;
        scrotOutput += `================================================================================\n`;
        scrotOutput += `[HARDWARE] Display SurfaceFlinger rendered to RGBA32\n`;
        scrotOutput += `[OPTICS]   High-intensity visual flash and shutter audio triggered\n`;
        scrotOutput += `[STORAGE]  Saved to: ${item.filePath}\n`;
        scrotOutput += `[METRICS]  Resolution: ${item.dimensions} | Color Space: sRGB HDR | Size: ${item.size}\n`;
        scrotOutput += `[UI]       Persistent action toast notification posted to screen\n`;
        scrotOutput += `================================================================================\n`;
        scrotOutput += `SUCCESS: Thumbnail indexed in simulated Gallery storage under 'Screenshots' category.`;

        newLogs.push({
          text: scrotOutput,
          type: "success",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "chargelog":
      case "chargehistory":
      case "battery-history":
      case "battery":
      case "batteryhealth": {
        let chargeOutput = `================================================================================\n`;
        chargeOutput += `                KK OS POWER & BATTERY HEALTH HISTORICAL DAEMON                  \n`;
        chargeOutput += `================================================================================\n`;
        chargeOutput += `Battery Model      : KK-LiPo-5000mAh (Dual-Cell Stacked Architecture)\n`;
        chargeOutput += `Health Index       : 98.4% (GOOD / EXCELLENT)\n`;
        chargeOutput += `Cycle Count        : 42 Complete Cycles\n`;
        chargeOutput += `Nominal Capacity   : 5000 mAh (Design) / 4920 mAh (Current Full)\n`;
        chargeOutput += `Battery Temp       : 31.2°C (Optimal Operating Range)\n`;
        chargeOutput += `Smart Saver Mode   : ACTIVE (Adaptive Thermal & Voltage Management)\n`;
        chargeOutput += `--------------------------------------------------------------------------------\n`;
        chargeOutput += `HISTORICAL CHARGING EVENTS LOG (Recent 5 Sessions):\n`;
        chargeOutput += `--------------------------------------------------------------------------------\n`;
        chargeOutput += `DATE / TIME       EVENT TYPE       RANGE      DURATION   ADDED     CHARGER / TEMP\n`;
        chargeOutput += `--------------------------------------------------------------------------------\n`;
        chargeOutput += `2026-07-23 07:15  CHARGE COMPLETE  15%->100%  38m 20s    +4250mAh  65W GaN / 34.1°C\n`;
        chargeOutput += `2026-07-22 22:30  OVERNIGHT DOCK   22%->100%  44m 10s    +3900mAh  15W Qi  / 32.8°C\n`;
        chargeOutput += `2026-07-22 14:05  QUICK TOP-UP     40%-> 85%  18m 45s    +2250mAh  65W GaN / 35.0°C\n`;
        chargeOutput += `2026-07-21 08:00  CHARGE COMPLETE  18%->100%  41m 00s    +4100mAh  65W GaN / 33.5°C\n`;
        chargeOutput += `2026-07-20 23:15  SMART TRICKLE    12%->100%  52m 15s    +4400mAh  USB-PD  / 29.5°C\n`;
        chargeOutput += `--------------------------------------------------------------------------------\n`;
        chargeOutput += `POWER HEALTH METRICS:\n`;
        chargeOutput += `  • Avg Charging Speed : 110.5 mAh / minute\n`;
        chargeOutput += `  • Fast Charge Efficiency: 96.8%\n`;
        chargeOutput += `  • Max Peak Temp Recorded: 35.0°C (Safe threshold: 45.0°C)\n`;
        chargeOutput += `  • Health Recommendation: Battery degradation rate < 0.2%/month. No service required.`;

        newLogs.push({
          text: chargeOutput,
          type: "success",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "seclog":
      case "seclogs":
      case "securitylog":
      case "security-logs":
      case "securitylogs": {
        const logs = getSecurityLogs();
        let secOutput = `================================================================================\n`;
        secOutput += `                KK OS SYSTEM LOGS — CATEGORY: SECURITY                          \n`;
        secOutput += `================================================================================\n`;
        secOutput += `CATEGORY   EVENT TYPE      STATUS     TIMESTAMP              CONFIDENCE DETAILS\n`;
        secOutput += `--------------------------------------------------------------------------------\n`;
        logs.forEach((item) => {
          const cat = item.category.padEnd(10, " ");
          const evt = item.eventType.padEnd(15, " ");
          const st = item.status.padEnd(10, " ");
          const ts = item.timestamp.padEnd(22, " ");
          const conf = (item.confidence || "N/A").padEnd(10, " ");
          secOutput += `${cat} ${evt} ${st} ${ts} ${conf} ${item.details}\n`;
        });
        secOutput += `--------------------------------------------------------------------------------\n`;
        secOutput += `Total Security Log Entries: ${logs.length} | Real-Time Biometric Audit Daemon Online`;

        newLogs.push({
          text: secOutput,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "apps":
      case "pm":
      case "applist": {
        let appOutput = "INSTALLED SYSTEM APPLICATIONS (KK OS v2.5):\n";
        appOutput += "-----------------------------------------------------\n";
        appOutput += "ID               STATUS  VERSION   PACKAGE NAME\n";
        appOutput += "-----------------------------------------------------\n";
        SYSTEM_APPS.forEach((app) => {
          const padId = app.id.padEnd(16, " ");
          const padStatus = app.status.padEnd(8, " ");
          const padVer = app.version.padEnd(10, " ");
          appOutput += `${padId} ${padStatus} ${padVer} ${app.pkg}\n`;
        });
        appOutput += "\nTip: Type 'open <id>' to launch or 'check <id>' to test any app.";
        newLogs.push({
          text: appOutput,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "open":
      case "launch":
      case "start": {
        if (!target) {
          newLogs.push({
            text: "Usage: open <app_id>\nExample: open browser, open camera, open weather, open settings",
            type: "error",
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          const appId = mapAliasToAppId(target);
          if (!appId) {
            newLogs.push({
              text: `open: unknown app '${target}'. Type 'apps' to see valid application IDs.`,
              type: "error",
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            const appObj = SYSTEM_APPS.find((a) => a.id === appId);
            newLogs.push({
              text: `[ActivityManager] Launching ${appObj?.name || appId} (${appObj?.pkg || "com.kkos"})...`,
              type: "success",
              timestamp: new Date().toLocaleTimeString(),
            });

            if (onSystemLog) {
              onSystemLog(`[ActivityManager] Terminal shell launched app: ${appId}`, "INFO");
            }

            if (onOpenApp) {
              setTimeout(() => {
                onOpenApp(appId);
              }, 400);
            } else {
              newLogs.push({
                text: `[ActivityManager] Launching UI callback registered for '${appId}'.`,
                type: "system",
                timestamp: new Date().toLocaleTimeString(),
              });
            }
          }
        }
        break;
      }

      case "check":
      case "test": {
        const query = target ? target.toLowerCase() : "all";
        
        if (query === "all") {
          let testReport = "EXECUTING KK OS SYSTEM-WIDE DIAGNOSTIC SUITE...\n";
          testReport += "=====================================================\n";
          let passCount = 0;

          SYSTEM_APPS.forEach((app, i) => {
            const num = (i + 1).toString().padStart(2, "0");
            testReport += `[TEST ${num}/14] ${app.name} (${app.pkg}):\n`;
            testReport += `   - UI Component Integrity: PASS [OK]\n`;
            testReport += `   - Memory Allocation: ${Math.floor(12 + Math.random() * 25)}MB [OK]\n`;
            testReport += `   - Permissions Verification: GRANTED [OK]\n`;
            testReport += `   - Core Health Status: 200 ACTIVE [OK]\n\n`;
            passCount++;
          });

          testReport += "=====================================================\n";
          testReport += `DIAGNOSTIC RESULT: ${passCount}/14 APPS PASSED ALL TESTS (100% HEALTHY)`;

          newLogs.push({
            text: testReport,
            type: "success",
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          const appId = mapAliasToAppId(query);
          if (!appId) {
            newLogs.push({
              text: `check: unknown app or component '${query}'. Type 'apps' or 'check all'.`,
              type: "error",
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            const appObj = SYSTEM_APPS.find((a) => a.id === appId);
            let singleReport = `RUNNING DIAGNOSTICS FOR: ${appObj?.name.toUpperCase()} (${appObj?.pkg})\n`;
            singleReport += "-----------------------------------------------------\n";
            singleReport += "✓ Layout Component Tree: VERIFIED\n";
            singleReport += "✓ State Machine Engine: STABLE\n";
            singleReport += "✓ Heap Footprint: 24.8 MB (Allocated)\n";
            singleReport += "✓ IPC Bindings: CONNECTED\n";
            singleReport += "✓ System Permissions: FULL ACCESS\n";
            singleReport += "-----------------------------------------------------\n";
            singleReport += "STATUS: ALL DIAGNOSTIC CHECKS PASSED (200 OK)";

            newLogs.push({
              text: singleReport,
              type: "success",
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        }
        break;
      }

      case "locate":
      case "finddevice":
      case "find-device":
      case "find-my-device":
      case "beacon":
      case "ping": {
        const sub = (target || "").toLowerCase();

        // 1. Check for Stop / Silence commands
        if (["stop", "--stop", "-s", "off", "silence", "kill", "cancel", "mute"].includes(sub)) {
          stopLostDeviceBeacon();
          onSystemLog?.("[SecurityDaemon] Lost device recovery beacon manually silenced from terminal shell", "INFO");
          
          let stopOutput = `================================================================================\n`;
          stopOutput += `             KK OS LOST DEVICE RECOVERY BEACON: SILENCED / DEACTIVATED         \n`;
          stopOutput += `================================================================================\n`;
          stopOutput += `[SECURITY] Acoustic sonar pulses terminated.\n`;
          stopOutput += `[HARDWARE] High-visibility screen strobe flash disengaged.\n`;
          stopOutput += `[STATUS]   Device returned to normal operating mode.\n`;
          stopOutput += `================================================================================`;

          newLogs.push({
            text: stopOutput,
            type: "output",
            timestamp: new Date().toLocaleTimeString(),
          });
          break;
        }

        // 2. Check if user specified a remote domain / IP for traditional ICMP ping
        const isRemoteHost = sub.includes(".") || sub.startsWith("http") || sub === "localhost" || sub === "127.0.0.1";
        const isExplicitDeviceTarget = !target || ["device", "phone", "lost", "me", "here", "local", "alarm", "-a", "-f", "-l", "--find", "--locate", "find", "locate", "beacon", "sos"].includes(sub);

        if (isRemoteHost && !isExplicitDeviceTarget) {
          const host = target || "google.com";
          const ip = "142.250.190.46";
          let pingOutput = `PING ${host} (${ip}): 56 data bytes\n`;
          pingOutput += `64 bytes from ${ip}: icmp_seq=0 ttl=118 time=12.4 ms\n`;
          pingOutput += `64 bytes from ${ip}: icmp_seq=1 ttl=118 time=11.8 ms\n`;
          pingOutput += `64 bytes from ${ip}: icmp_seq=2 ttl=118 time=13.2 ms\n`;
          pingOutput += `64 bytes from ${ip}: icmp_seq=3 ttl=118 time=10.9 ms\n\n`;
          pingOutput += `--- ${host} ping statistics ---\n`;
          pingOutput += `4 packets transmitted, 4 packets received, 0.0% packet loss\n`;
          pingOutput += `round-trip min/avg/max = 10.9/12.0/13.2 ms\n\n`;
          pingOutput += `[💡 Security Tip]: Run 'ping' (or 'ping device') to trigger the Lost Device Recovery acoustic siren and high-visibility screen strobe!`;

          newLogs.push({
            text: pingOutput,
            type: "output",
            timestamp: new Date().toLocaleTimeString(),
          });
          break;
        }

        // 3. Trigger Lost Device Recovery Acoustic Siren & Screen Strobe Flash
        startLostDeviceBeacon(30);

        recordSecurityLog(
          "Lost Device Recovery",
          "ACCEPTED",
          "High-intensity acoustic ping siren and screen strobe beacon triggered from terminal shell",
          "CRITICAL",
          "100.0%"
        );

        onSystemLog?.(
          "[SecurityDaemon] LOST DEVICE RECOVERY: High-priority acoustic ping and visual strobe beacon triggered from terminal shell",
          "CRITICAL"
        );

        let beaconOutput = `🚨 =============================================================================\n`;
        beaconOutput += `        KK OS LOST DEVICE RECOVERY: ACOUSTIC BEACON & SCREEN STROBE ACTIVE       \n`;
        beaconOutput += `=================================================================================\n`;
        beaconOutput += `[🔊 ACOUSTIC SIREN]  : Dual-Harmonic 105 dB Sonar Sweep (Web Audio Pulse)\n`;
        beaconOutput += `[💡 SCREEN STROBE]   : Multi-Color High-Visibility 4 Hz Optical Flash\n`;
        beaconOutput += `[📍 GPS TELEMETRY]   : 37.7749° N, -122.4194° W (Accuracy: ±1.2m, Alt: 42m)\n`;
        beaconOutput += `[📶 CELLULAR MODEM]  : 5G SA Connected (Signal: -62 dBm, Tower #40921)\n`;
        beaconOutput += `[🔋 HARDWARE STATE]  : Battery Normal, Core Temp 31.2°C, Uptime ${uptimeSeconds}s\n`;
        beaconOutput += `[⏱️ AUTO-TIMEOUT]    : 30 Seconds Safety Timer\n`;
        beaconOutput += `---------------------------------------------------------------------------------\n`;
        beaconOutput += `Type 'ping stop' or tap the on-screen emergency banner to silence the alarm.\n`;
        beaconOutput += `=================================================================================`;

        newLogs.push({
          text: beaconOutput,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "curl":
      case "http": {
        const url = target || "https://api.google.com/health";
        let curlOutput = `HTTP/2 200 OK\n`;
        curlOutput += `date: ${new Date().toUTCString()}\n`;
        curlOutput += `content-type: application/json; charset=utf-8\n`;
        curlOutput += `server: Google Frontend / KK OS Gateway\n\n`;
        curlOutput += `{\n  "status": "online",\n  "system": "KK Mobile OS",\n  "latency_ms": 11.4,\n  "sandbox_secure": true\n}`;

        newLogs.push({
          text: curlOutput,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "free":
      case "mem": {
        const freeMem = 8192 - ramUsedMB;
        let memOutput = "              total        used        free      shared  buff/cache   available\n";
        memOutput += `Mem:           8192MB      ${ramUsedMB}MB      ${freeMem}MB        24MB       120MB      ${freeMem - 120}MB\n`;
        memOutput += `Swap:          2048MB         0MB      2048MB`;

        newLogs.push({
          text: memOutput,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "df":
      case "storage": {
        let dfOutput = "Filesystem     1K-blocks      Used Available Use% Mounted on\n";
        dfOutput += "/dev/root       67108864  24117248  42991616  36% /\n";
        dfOutput += "/dev/block/sdc  33554432   8388608  25165824  25% /KK-Mobile-OS\n";
        dfOutput += "tmpfs            4194304    262144   3932160   6% /tmp";

        newLogs.push({
          text: dfOutput,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "pwd":
        newLogs.push({
          text: currentPath,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;

      case "whoami":
        newLogs.push({
          text: "root@kk-mobile-os (UID: 0, GID: 0, Groups: root, sudo, system)",
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;

      case "date":
        newLogs.push({
          text: new Date().toString(),
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;

      case "uptime":
        newLogs.push({
          text: `System uptime: ${formatUptime(uptimeSeconds)} (Load average: 0.12, 0.08, 0.04)`,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;

      case "echo": {
        const echoMsg = args.slice(1).join(" ");
        newLogs.push({
          text: echoMsg,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "warn":
      case "warning": {
        const msg = args.slice(1).join(" ") || "System resource threshold warning triggered from shell.";
        newLogs.push({
          text: `[WARNING] ${msg}`,
          type: "system",
          timestamp: new Date().toLocaleTimeString(),
        });
        if (onSystemLog) {
          onSystemLog(`[ShellTerminal] [WARNING] ${msg}`, "WARNING");
        }
        break;
      }

      case "critical":
      case "panic": {
        const msg = args.slice(1).join(" ") || "Kernel process panic / critical fault triggered from shell!";
        newLogs.push({
          text: `[CRITICAL] ${msg}`,
          type: "error",
          timestamp: new Date().toLocaleTimeString(),
        });
        if (onSystemLog) {
          onSystemLog(`[ShellTerminal] [CRITICAL] ${msg}`, "CRITICAL");
        }
        break;
      }

      case "clear":
        setHistory([]);
        setInput("");
        return;

      case "ls":
      case "dir": {
        const queryPath = target 
          ? (target.startsWith("/") ? target : `${currentPath}/${target}`).replace(/\/+/g, "/")
          : currentPath;
        
        const node = findNodeByPath(queryPath);
        if (!node) {
          newLogs.push({
            text: `ls: cannot access '${target}': No such file or directory`,
            type: "error",
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (node.type === "file") {
          newLogs.push({
            text: `${node.name}   [File: ${node.size || "Unknown"}]`,
            type: "success",
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          const contents = node.children && node.children.length > 0
            ? node.children.map(child => `${child.type === "directory" ? "📁" : "📄"} ${child.name}`).join("   ")
            : "(empty directory)";
          newLogs.push({
            text: contents,
            type: "output",
            timestamp: new Date().toLocaleTimeString(),
          });
        }
        break;
      }

      case "cd": {
        if (!target || target === "~" || target === "/") {
          setCurrentPath("/KK-Mobile-OS");
          newLogs.push({
            text: "Navigated to home storage root (/KK-Mobile-OS)",
            type: "output",
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (target === "..") {
          if (currentPath === "/KK-Mobile-OS") {
            newLogs.push({
              text: "Cannot exit /KK-Mobile-OS sandbox (permission boundary reached)",
              type: "error",
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            const index = currentPath.lastIndexOf("/");
            const parent = currentPath.substring(0, index);
            setCurrentPath(parent || "/KK-Mobile-OS");
          }
        } else {
          const queryPath = target.startsWith("/")
            ? target
            : `${currentPath}/${target}`.replace(/\/+/g, "/");

          const node = findNodeByPath(queryPath);
          if (!node) {
            newLogs.push({
              text: `cd: no such file or directory: ${target}`,
              type: "error",
              timestamp: new Date().toLocaleTimeString(),
            });
          } else if (node.type !== "directory") {
            newLogs.push({
              text: `cd: not a directory: ${target}`,
              type: "error",
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setCurrentPath(queryPath);
          }
        }
        break;
      }

      case "cat": {
        if (!target) {
          newLogs.push({
            text: "Usage: cat <filename>",
            type: "error",
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          const queryPath = target.startsWith("/")
            ? target
            : `${currentPath}/${target}`.replace(/\/+/g, "/");

          const node = findNodeByPath(queryPath);
          if (!node) {
            newLogs.push({
              text: `cat: ${target}: No such file or directory`,
              type: "error",
              timestamp: new Date().toLocaleTimeString(),
            });
          } else if (node.type === "directory") {
            newLogs.push({
              text: `cat: ${target}: Is a directory`,
              type: "error",
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            newLogs.push({
              text: node.content || "(file empty)",
              type: "success",
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        }
        break;
      }

      case "neofetch":
      case "sysinfo": {
        const fetchOutput = NEOFETCH_ASCII
          .replace("%UPTIME%", formatUptime(uptimeSeconds))
          .replace("%RAM_USED%", ramUsedMB.toString());
        newLogs.push({
          text: fetchOutput,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "uname":
        newLogs.push({
          text: "Linux KK-Core-Container 4.19.12-ts-kk-mobile #1 SMP PREEMPT Mon Jul 20 2026 arm64 GNU/Linux",
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;

      case "dmesg":
        DMESG_LOGS.forEach((log) => {
          newLogs.push({
            text: log,
            type: "system",
            timestamp: new Date().toLocaleTimeString(),
          });
        });
        break;

      case "top":
      case "ps": {
        const topOutput = `Tasks: 18 total, 2 running, 16 sleeping
Cpu(s): 12.4%us,  4.2%sy,  0.0%ni, 83.4%id
Memory: 8192MB total, ${ramUsedMB}MB used, ${8192 - ramUsedMB}MB free

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
    1 root      20   0   45.2M  12.4M   4.1M S   0.0  0.1   0:01.45 init
   12 system    20   0  310.4M  95.8M  34.2M S   1.2  1.1   0:12.40 frameworkd
   42 launcher  20   0  180.2M  54.2M  24.5M S   0.4  0.6   0:08.12 launcher_app
  105 shell     20   0   12.1M   4.5M   1.8M R   4.5  0.0   0:00.22 kk-sh (top)
  241 ai_user   20   0  420.5M 180.2M  52.1M S   8.2  2.2   0:04.11 ai_assistant
  311 kernel    20   0    0.0M   0.0M   0.0M R   1.4  0.0   0:10.51 scheduler_fair`;
        newLogs.push({
          text: topOutput,
          type: "output",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }

      case "download-os":
      case "os-download":
      case "download":
      case "install-os":
      case "firmware": {
        newLogs.push({
          text: "[OSDownloader] Launching Quantum 5G Firmware Downloader & Flasher UI...",
          type: "success",
          timestamp: new Date().toLocaleTimeString(),
        });
        if (onSystemLog) {
          onSystemLog("[Terminal] Triggered Quantum OS Download Engine via CLI", "INFO");
        }
        if (onTriggerOsDownload) {
          setTimeout(() => {
            onTriggerOsDownload();
          }, 300);
        }
        break;
      }

      case "boot-anim":
      case "boot":
      case "bootanim":
      case "splash": {
        newLogs.push({
          text: "[BootEngine] Initiating Quantum Boot Animation Sequence...",
          type: "success",
          timestamp: new Date().toLocaleTimeString(),
        });
        if (onSystemLog) {
          onSystemLog("[Terminal] Triggered Quantum Boot Animation preview via CLI", "INFO");
        }
        if (onTriggerBootAnim) {
          setTimeout(() => {
            onTriggerBootAnim();
          }, 300);
        }
        break;
      }

      case "reboot":
        newLogs.push({
          text: "Triggering kernel soft reboot. Closing shell descriptors...",
          type: "system",
          timestamp: new Date().toLocaleTimeString(),
        });
        setHistory((prev) => [...prev, ...newLogs]);
        setTimeout(() => {
          onReboot();
        }, 800);
        setInput("");
        return;

      case "poweroff":
        newLogs.push({
          text: "Shutting down physical battery nodes. HAL poweroff...",
          type: "system",
          timestamp: new Date().toLocaleTimeString(),
        });
        setHistory((prev) => [...prev, ...newLogs]);
        setTimeout(() => {
          onPowerOff();
        }, 800);
        setInput("");
        return;

      default:
        newLogs.push({
          text: `kk-sh: command not found: ${cmd}. Type 'help' or 'apps'.`,
          type: "error",
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
    }

    setHistory((prev) => [...prev, ...newLogs]);
    setInput("");
  };

  const handleCommandSuggest = (suggested: string) => {
    setInput(suggested);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-black text-emerald-400 font-mono text-xs select-none p-2" id="terminal-app">
      {/* Tab bar header */}
      <div className="flex items-center justify-between pb-1 border-b border-emerald-950 mb-2">
        <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
          <Terminal size={12} />
          <span>sh - kk-sh v2.1</span>
        </div>
        <div className="text-[10px] text-emerald-700 select-all font-sans">{currentPath}</div>
      </div>

      {/* Console output buffer */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin select-text">
        {history.map((log, index) => {
          let textClass = "text-emerald-400";
          if (log.type === "input") textClass = "text-white font-bold";
          if (log.type === "error") textClass = "text-rose-400";
          if (log.type === "system") textClass = "text-yellow-400/90";
          if (log.type === "success") textClass = "text-cyan-400";

          return (
            <div key={index} className="whitespace-pre-wrap leading-tight font-mono break-all">
              <span className={textClass}>{log.text}</span>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Voice Dictation Active Overlay/Banner */}
      {isListening && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 rounded-lg p-2 mb-1.5 flex items-center justify-between text-[11px] animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
              <Mic size={14} className="text-rose-400 relative z-10" />
            </div>
            <div>
              <span className="font-bold text-white">Terminal Dictation Active...</span>
              {interimTranscript && (
                <span className="text-emerald-300 ml-1.5 italic font-mono">"{interimTranscript}"</span>
              )}
            </div>
          </div>

          {/* Audio volume visualizer meter */}
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <Volume2 size={12} className="text-emerald-400" />
            <div className="w-12 h-1.5 bg-emerald-900/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-100"
                style={{ width: `${Math.max(12, micVolume)}%` }}
              />
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-[9px] text-rose-300 hover:text-white bg-rose-950 border border-rose-800 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-bold"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {dictationError && (
        <div className="bg-rose-950/80 border border-rose-800 rounded-lg p-1.5 mb-1.5 text-[10px] text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={12} className="text-rose-400 shrink-0" />
            <span>{dictationError}</span>
          </div>
          <button
            onClick={() => toggleListening()}
            className="text-[9px] text-emerald-400 underline hover:text-white ml-2 cursor-pointer font-bold"
          >
            Retry Mic
          </button>
        </div>
      )}

      {/* Suggested quick commands & Dictation trigger */}
      <div className="py-1 px-0.5 border-t border-emerald-950 mt-1 flex flex-wrap gap-1.5 items-center">
        <button
          type="button"
          onClick={toggleListening}
          className={`text-[10px] py-0.5 px-2 rounded border font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
            isListening
              ? "bg-rose-950 text-rose-300 border-rose-600 animate-pulse"
              : "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border-emerald-700"
          }`}
          title="Toggle Terminal Voice Dictation Mode"
        >
          {isListening ? <MicOff size={10} /> : <Mic size={10} />}
          <span>{isListening ? "Listening..." : "Dictation Mode"}</span>
        </button>

        {/* Lost Device Beacon Status & Quick Trigger Button */}
        {isBeaconActive ? (
          <button
            type="button"
            onClick={() => handleCommand("ping stop")}
            className="text-[10px] bg-rose-600 hover:bg-rose-500 text-slate-950 font-black py-0.5 px-2 rounded border border-rose-400 font-mono transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse"
            title="Silence Lost Device Recovery Siren"
          >
            <VolumeX size={11} />
            <span>ping stop ({beaconRemainingSec}s)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleCommand("ping device")}
            className="text-[10px] bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-white py-0.5 px-2 rounded border border-cyan-500/70 font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:border-cyan-400"
            title="Trigger Lost Device Recovery Acoustic Alarm & Screen Strobe"
          >
            <Radio size={11} className="text-cyan-400 animate-pulse" />
            <span>ping device</span>
          </button>
        )}

        {[
          "help",
          "screenshot",
          "chargelog",
          "apps",
          "check all",
          "security-logs",
          "neofetch",
          "top",
          "ping google.com"
        ].map((suggested, i) => (
          <button
            key={i}
            onClick={() => handleCommandSuggest(suggested)}
            className="text-[10px] bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 hover:text-white py-0.5 px-1.5 rounded border border-emerald-900/60 font-mono transition-colors cursor-pointer"
          >
            {suggested}
          </button>
        ))}
      </div>

      {/* Console Prompt Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommand(input);
        }}
        className="flex items-center gap-1 bg-black/50 border-t border-emerald-950/80 pt-1.5"
      >
        <span className="text-white shrink-0 font-bold">kk-sh$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... speak command or 'execute'..." : "Type command or dictation..."}
          className="flex-1 bg-transparent text-white caret-emerald-400 focus:outline-none placeholder-emerald-900 select-text font-mono font-medium text-xs border-none p-0 focus:ring-0"
          autoFocus
        />
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? "Stop Voice Dictation" : "Start Voice Dictation Mode"}
          className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center ${
            isListening
              ? "bg-rose-600 text-white animate-pulse"
              : "bg-emerald-950 text-emerald-400 hover:bg-emerald-900 hover:text-white"
          }`}
        >
          {isListening ? <MicOff size={10} /> : <Mic size={10} />}
        </button>
        <button
          type="submit"
          className="p-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 hover:text-white transition-colors cursor-pointer"
        >
          <Send size={10} />
        </button>
      </form>
    </div>
  );
}
