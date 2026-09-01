import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import BatteryConsumptionPieChart from "./BatteryConsumptionPieChart";
import {
  Settings,
  Smartphone,
  Cpu,
  ShieldAlert,
  Power,
  RotateCcw,
  Wifi,
  Bluetooth,
  Radio,
  Sliders,
  ChevronRight,
  Info,
  Search,
  Bell,
  Lock,
  Battery,
  Grid,
  Volume2,
  Sun,
  Palette,
  ArrowLeft,
  Sparkles,
  Check,
  UserCheck,
  LogOut,
  Cloud,
  CloudUpload,
  CloudDownload,
  Database,
  ShieldCheck,
  Loader2,
  Gauge,
  Zap,
  Activity,
  BatteryCharging,
  Headphones,
  Speaker,
  Watch,
  RefreshCw,
  Send,
  Download,
  Share2,
  FileText,
  Image as ImageIcon,
  File,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  FolderDown,
  ScanFace,
  HardDrive,
  Trash2,
  PieChart as PieChartIcon,
  Gamepad2,
  Phone as PhoneIcon,
  MessageSquare
} from "lucide-react";
import AppSecurity from "./AppSecurity";
import StorageManagerModal from "./StorageManagerModal";
import DynamicWallpaperManager from "./DynamicWallpaperManager";
import {
  cleanAllCache,
  getTotalCacheSizeMB,
  addCacheUpdatedListener
} from "../utils/fileSystem";
import { AppID, Wallpaper } from "../types";
import { WALLPAPERS } from "../mockOSData";
import {
  ACCENT_COLOR_PRESETS,
  WALLPAPER_PATTERNS,
  getStoredThemeConfig,
  applyThemeConfig,
  hexToRgb,
  OSThemeConfig,
  DEFAULT_THEME
} from "../utils/theme";
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  saveUserPreferences,
  getUserPreferences,
  User
} from "../lib/firebase";

interface AppSettingsProps {
  currentWallpaperId: string;
  onWallpaperChange: (id: string) => void;
  brightness?: number;
  onBrightnessChange?: (newVal: number) => void;
  settingsState: {
    wifi: boolean;
    bluetooth: boolean;
    mobileData: boolean;
    airplaneMode: boolean;
    selinuxEnforcing: boolean;
    sandboxEnabled: boolean;
    use24Hour?: boolean;
  };
  onSettingsStateChange: (key: string, value: boolean) => void;
  onReboot: () => void;
  onPowerOff: () => void;
  uptimeSeconds: number;
  performanceMode?: "high_performance" | "power_efficient";
  onPerformanceModeChange?: (mode: "high_performance" | "power_efficient") => void;
  isBatterySaver?: boolean;
  onToggleBatterySaver?: (saver: boolean) => void;
  batteryLevel?: number;
  initialSubView?: "list" | "about_phone" | "storage" | "themes" | "network" | "display" | "accounts" | "performance" | "ota_update" | "security" | "backup_restore" | "wallpaper" | "battery_usage";
  onOpenApp?: (appId: AppID) => void;
  onSystemLog?: (msg: string, level?: "INFO" | "WARNING" | "CRITICAL") => void;
  onTriggerOsDownload?: () => void;
  onTriggerBootAnim?: () => void;
}

export default function AppSettings({
  currentWallpaperId,
  onWallpaperChange,
  brightness = 85,
  onBrightnessChange = () => {},
  settingsState,
  onSettingsStateChange,
  onReboot,
  onPowerOff,
  uptimeSeconds,
  performanceMode = "power_efficient",
  onPerformanceModeChange,
  isBatterySaver = false,
  onToggleBatterySaver,
  batteryLevel = 84,
  initialSubView = "list",
  onOpenApp,
  onSystemLog,
  onTriggerOsDownload,
  onTriggerBootAnim
}: AppSettingsProps) {
  const [activeSubView, setActiveSubView] = useState<
    "list" | "about_phone" | "storage" | "themes" | "network" | "display" | "accounts" | "performance" | "ota_update" | "security" | "backup_restore" | "wallpaper" | "battery_usage"
  >(initialSubView);

  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);
  const [searchTerm, setSearchTerm] = useState("");

  // Storage Breakdown State & Cache Purge Simulator
  const [isCleaningCache, setIsCleaningCache] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [totalCacheMB, setTotalCacheMB] = useState<number>(() => getTotalCacheSizeMB());
  const [cacheToast, setCacheToast] = useState<string | null>(null);

  const cleanedCacheAmount = Math.max(0, Number(((4640 - totalCacheMB) / 1000).toFixed(1)));

  useEffect(() => {
    const updateCache = () => {
      setTotalCacheMB(getTotalCacheSizeMB());
    };
    updateCache();
    const unsubscribe = addCacheUpdatedListener(updateCache);
    return () => unsubscribe();
  }, []);

  const handleCleanCache = () => {
    if (totalCacheMB === 0) {
      setCacheToast("System directory cache is already fully optimized!");
      setTimeout(() => setCacheToast(null), 3000);
      return;
    }
    setIsCleaningCache(true);
    setTimeout(() => {
      setIsCleaningCache(false);
      const freedMB = cleanAllCache();
      const freedGB = (freedMB / 1000).toFixed(1);
      setCacheToast(`🧹 Cache Cleaned! Freed ${freedGB} GB of temporary files from /KK-Mobile-OS/cache/`);
      setTimeout(() => setCacheToast(null), 4000);
    }, 1200);
  };

  const storageCategories = [
    {
      key: "apps",
      name: "Apps & Games",
      sizeGB: Math.max(38.0, Number((42.1 - (cleanedCacheAmount > 0 ? 1.5 : 0)).toFixed(1))),
      color: "#a855f7",
      colorClass: "bg-purple-950 text-purple-400 border-purple-800",
      icon: Gamepad2,
      desc: "32 Installed Apps, Games & Cached Application State"
    },
    {
      key: "photos",
      name: "Photos & Media",
      sizeGB: 31.4,
      color: "#ec4899",
      colorClass: "bg-pink-950 text-pink-400 border-pink-800",
      icon: ImageIcon,
      desc: "1,420 High-Res Photos, 4K Recordings & Audio Files"
    },
    {
      key: "system",
      name: "System & OS Files",
      sizeGB: 18.5,
      color: "#06b6d4",
      colorClass: "bg-cyan-950 text-cyan-400 border-cyan-800",
      icon: Cpu,
      desc: "KK Mobile OS Kernel, System Partitions & Recovery Image"
    },
    {
      key: "docs",
      name: "Docs & Downloads",
      sizeGB: Math.max(2.8, Number((5.2 - (cleanedCacheAmount > 0 ? 0.9 : 0)).toFixed(1))),
      color: "#f59e0b",
      colorClass: "bg-amber-950 text-amber-400 border-amber-800",
      icon: FileText,
      desc: "PDF Files, Offline Notes, Terminal Logs & Backups"
    },
    {
      key: "free",
      name: "Available Free Space",
      sizeGB: Number((30.8 + cleanedCacheAmount).toFixed(1)),
      color: "#10b981",
      colorClass: "bg-emerald-950 text-emerald-400 border-emerald-800",
      icon: CheckCircle2,
      desc: "Unallocated NVMe Flash Storage Capacity"
    }
  ];

  // OTA Firmware Update Simulator State
  const [osVersion, setOsVersion] = useState<string>(() => {
    try {
      return localStorage.getItem("kk_os_version") || "1.0 (Official Build)";
    } catch (e) {
      return "1.0 (Official Build)";
    }
  });

  const [buildNumber, setBuildNumber] = useState<string>(() => {
    try {
      return localStorage.getItem("kk_os_build") || "KK-Core-v1.0.0";
    } catch (e) {
      return "KK-Core-v1.0.0";
    }
  });

  const [otaStatus, setOtaStatus] = useState<"idle" | "checking" | "available" | "updating" | "completed">("idle");
  const [otaProgress, setOtaProgress] = useState<number>(0);
  const [otaStepText, setOtaStepText] = useState<string>("");

  const handleStartOtaCheck = () => {
    setOtaStatus("checking");
    setOtaProgress(15);
    setOtaStepText("Querying KK OTA Update Gateway...");
    setTimeout(() => {
      setOtaProgress(100);
      if (osVersion.includes("1.2.0")) {
        setOtaStatus("completed");
        setOtaStepText("System is up to date!");
      } else {
        setOtaStatus("available");
        setOtaStepText("KK OS v1.2.0 OTA Patch package ready.");
      }
    }, 1200);
  };

  const handleApplyOtaUpdate = () => {
    setOtaStatus("updating");
    setOtaProgress(5);
    setOtaStepText("Connecting to KK OTA Firmware Server...");

    const steps = [
      { progress: 20, text: "Downloading OTA firmware (KK-OS-v1.2.0-OTA_Patch.zip)...", delay: 900 },
      { progress: 45, text: "Verifying SHA256 integrity & RSA certificate...", delay: 2000 },
      { progress: 70, text: "Flashing system partition & updating kernel vectors...", delay: 3200 },
      { progress: 90, text: "Patching OS version string & rebuilding cache...", delay: 4200 },
      { progress: 100, text: "OTA Firmware Update Applied Successfully!", delay: 5200 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setOtaProgress(step.progress);
        setOtaStepText(step.text);
        if (step.progress === 100) {
          const newVer = "1.2.0-OTA (Patched Build)";
          const newBuild = "KK-Core-v1.2.0-OTA";
          setOsVersion(newVer);
          setBuildNumber(newBuild);
          try {
            localStorage.setItem("kk_os_version", newVer);
            localStorage.setItem("kk_os_build", newBuild);
          } catch (e) {}
          setOtaStatus("completed");
        }
      }, step.delay);
    });
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Bluetooth Device State
  const [isScanningBluetooth, setIsScanningBluetooth] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState([
    { id: "bt1", name: "KK Buds Pro", type: "headphones", connected: true, battery: 88 },
    { id: "bt2", name: "Smart Watch GT", type: "watch", connected: true, battery: 74 },
    { id: "bt3", name: "KK Wireless Speaker", type: "speaker", connected: false, battery: null },
    { id: "bt4", name: "KK Car Audio System", type: "car", connected: false, battery: null },
    { id: "bt5", name: "Wireless Keyboard K380", type: "keyboard", connected: false, battery: null },
  ]);

  const scanBluetoothDevices = () => {
    setIsScanningBluetooth(true);
    setTimeout(() => {
      setIsScanningBluetooth(false);
    }, 2000);
  };

  const toggleDeviceConnection = (id: string) => {
    setBluetoothDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d))
    );
  };

  // Virtual File Sharing State
  const [fileShareTab, setFileShareTab] = useState<"send" | "receive" | "history">("send");
  const [selectedFileToSend, setSelectedFileToSend] = useState({
    name: "camera_shot_2026.jpg",
    size: "4.8 MB",
    type: "image",
  });
  const [selectedTargetDevice, setSelectedTargetDevice] = useState("bt1");

  // Custom Gemini API Key State
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem("kk_custom_gemini_api_key") || "";
  });
  const [apiKeySaveStatus, setApiKeySaveStatus] = useState<string | null>(null);

  const handleSaveApiKey = () => {
    if (customApiKey.trim()) {
      localStorage.setItem("kk_custom_gemini_api_key", customApiKey.trim());
      setApiKeySaveStatus("Custom Gemini API Key saved successfully!");
    } else {
      localStorage.removeItem("kk_custom_gemini_api_key");
      setApiKeySaveStatus("Custom API Key cleared. System will use default environment key.");
    }
    setTimeout(() => setApiKeySaveStatus(null), 3000);
  };

  // Dynamic System Theme & Accent Color State
  const [themeConfig, setThemeConfig] = useState<OSThemeConfig>(() => getStoredThemeConfig());
  const [customHexInput, setCustomHexInput] = useState(themeConfig.accentHex);

  const handleSelectAccent = (hex: string, rgb?: string) => {
    const calculatedRgb = rgb || hexToRgb(hex);
    const updated = { ...themeConfig, accentHex: hex, accentRgb: calculatedRgb };
    setThemeConfig(updated);
    setCustomHexInput(hex);
    applyThemeConfig(updated);
  };

  const handleSelectPattern = (patternId: string) => {
    const updated = { ...themeConfig, patternId };
    setThemeConfig(updated);
    applyThemeConfig(updated);
  };

  const handleResetTheme = () => {
    setThemeConfig(DEFAULT_THEME);
    setCustomHexInput(DEFAULT_THEME.accentHex);
    applyThemeConfig(DEFAULT_THEME);
  };

  // Custom Wallpaper Generator & Filter State
  const [wallpaperFilter, setWallpaperFilter] = useState<"all" | "gradient" | "pattern" | "custom" | "accent" | "dynamic">("all");
  const [customColorStart, setCustomColorStart] = useState("#0f172a");
  const [customColorEnd, setCustomColorEnd] = useState("#38bdf8");
  const [customDirection, setCustomDirection] = useState<"to-br" | "to-r" | "radial" | "to-tr">("to-br");
  const [wallpaperToast, setWallpaperToast] = useState<string | null>(null);

  const triggerWallpaperToast = (msg: string) => {
    setWallpaperToast(msg);
    setTimeout(() => setWallpaperToast(null), 3000);
  };

  // Active Sending State
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // Incoming File Request State
  const [incomingRequest, setIncomingRequest] = useState<{
    device: string;
    fileName: string;
    fileSize: string;
    fileType: string;
  } | null>(null);

  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveProgress, setReceiveProgress] = useState(0);

  // Transfer History
  const [transferHistory, setTransferHistory] = useState([
    {
      id: "th-1",
      fileName: "favorite_song.mp3",
      fileSize: "7.2 MB",
      direction: "received" as const,
      device: "Alex's Pixel 8 Pro",
      status: "completed" as const,
      timestamp: "10:24 AM",
    },
    {
      id: "th-2",
      fileName: "meeting_presentation.pdf",
      fileSize: "3.1 MB",
      direction: "sent" as const,
      device: "Laptop-Pro-15",
      status: "completed" as const,
      timestamp: "Yesterday",
    },
  ]);

  const handleSendFile = () => {
    if (!settingsState.bluetooth || isSending) return;
    setIsSending(true);
    setSendProgress(0);

    const targetDevObj = bluetoothDevices.find((d) => d.id === selectedTargetDevice) || bluetoothDevices[0];

    const interval = setInterval(() => {
      setSendProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSending(false);

          setTransferHistory((h) => [
            {
              id: `th-${Date.now()}`,
              fileName: selectedFileToSend.name,
              fileSize: selectedFileToSend.size,
              direction: "sent",
              device: targetDevObj ? targetDevObj.name : "Nearby Device",
              status: "completed",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
            ...h,
          ]);

          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const triggerMockIncomingFile = () => {
    if (!settingsState.bluetooth) return;
    const mockFiles = [
      { name: "vacation_beach.png", size: "3.4 MB", type: "image", dev: "Alex's Pixel 8 Pro" },
      { name: "voice_note_jul23.m4a", size: "1.2 MB", type: "audio", dev: "Sarah's iPhone 15" },
      { name: "design_system.zip", size: "12.8 MB", type: "archive", dev: "MacBook Air M3" },
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setIncomingRequest({
      device: picked.dev,
      fileName: picked.name,
      fileSize: picked.size,
      fileType: picked.type,
    });
  };

  const handleAcceptIncoming = () => {
    if (!incomingRequest || isReceiving) return;
    setIsReceiving(true);
    setReceiveProgress(0);

    const activeReq = { ...incomingRequest };

    const interval = setInterval(() => {
      setReceiveProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReceiving(false);

          setTransferHistory((h) => [
            {
              id: `th-${Date.now()}`,
              fileName: activeReq.fileName,
              fileSize: activeReq.fileSize,
              direction: "received",
              device: activeReq.device,
              status: "completed",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
            ...h,
          ]);

          setIncomingRequest(null);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleDeclineIncoming = () => {
    if (incomingRequest) {
      setTransferHistory((h) => [
        {
          id: `th-${Date.now()}`,
          fileName: incomingRequest.fileName,
          fileSize: incomingRequest.fileSize,
          direction: "received",
          device: incomingRequest.device,
          status: "failed",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...h,
      ]);
    }
    setIncomingRequest(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setSyncStatus(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setSyncStatus("Signed in successfully! Fetching cloud profile...");
        const cloudPrefs = await getUserPreferences(user.uid);
        if (cloudPrefs) {
          if (cloudPrefs.wallpaperId) onWallpaperChange(cloudPrefs.wallpaperId);
          if (cloudPrefs.brightness) onBrightnessChange(cloudPrefs.brightness);
          setSyncStatus("Restored wallpaper and display settings from Firestore!");
        }
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Sign in failed: ${err.message || err}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSyncToCloud = async () => {
    if (!currentUser) return;
    setIsAuthLoading(true);
    try {
      await saveUserPreferences(currentUser.uid, {
        wallpaperId: currentWallpaperId,
        brightness
      });
      setSyncStatus("Successfully saved OS settings to Firestore database!");
    } catch (err: any) {
      setSyncStatus(`Sync failed: ${err.message}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!currentUser) return;
    setIsAuthLoading(true);
    try {
      const cloudPrefs = await getUserPreferences(currentUser.uid);
      if (cloudPrefs) {
        if (cloudPrefs.wallpaperId) onWallpaperChange(cloudPrefs.wallpaperId);
        if (cloudPrefs.brightness) onBrightnessChange(cloudPrefs.brightness);
        setSyncStatus("Restored latest state from Firestore!");
      } else {
        setSyncStatus("No cloud settings record found for this account.");
      }
    } catch (err: any) {
      setSyncStatus(`Restore failed: ${err.message}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    try {
      await signOutUser();
      setSyncStatus("Signed out of Google Account.");
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const formatUptime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans" id="settings-app">
      {/* Top Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeSubView !== "list" && (
            <button
              onClick={() => setActiveSubView("list")}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer mr-1"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <Settings size={18} className="text-teal-400" />
          <h2 className="text-sm font-bold text-white">
            {activeSubView === "about_phone"
              ? "About Phone"
              : activeSubView === "storage"
              ? "Storage Breakdown & Space"
              : activeSubView === "ota_update"
              ? "Over-the-Air (OTA) Update"
              : activeSubView === "wallpaper" || activeSubView === "themes"
              ? "Desktop Wallpaper & Patterns"
              : activeSubView === "network"
              ? "Network Settings"
              : activeSubView === "display"
              ? "Display & Brightness"
              : activeSubView === "accounts"
              ? "Google Account & Sync"
              : activeSubView === "performance"
              ? "Performance & Battery Mode"
              : activeSubView === "security"
              ? "Biometrics & Security"
              : activeSubView === "backup_restore"
              ? "Backup & Restore"
              : activeSubView === "battery_usage"
              ? "Battery Consumption Breakdown"
              : "Settings"}
          </h2>
        </div>
      </div>

      {/* VIEW: ABOUT PHONE */}
      {activeSubView === "about_phone" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border border-teal-500/20 text-center space-y-2">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-teal-900/40">
              KK
            </div>
            <h1 className="text-lg font-extrabold text-white">KK Mobile OS</h1>
            <p className="text-xs text-teal-400 font-mono font-bold">Version {osVersion}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device Specs</h3>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Device Name</span>
                <span className="font-bold text-white">KK Phone</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Model</span>
                <span className="font-bold text-white">KKP-2024</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Android Version</span>
                <span className="font-bold text-teal-400 font-mono">14 ({buildNumber})</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">KK OS Version</span>
                <span className="font-bold text-teal-400 font-mono">{osVersion}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Security Update</span>
                <span className="font-bold text-emerald-400">
                  {osVersion.includes("1.2.0") ? "July 2026 (Patched)" : "1 May 2024"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kernel Version</span>
                <span className="font-bold text-slate-300 font-mono text-[10px]">
                  5.15.112-{buildNumber}
                </span>
              </div>
            </div>

            {/* Link to Storage Breakdown & OTA Update */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setActiveSubView("storage")}
                className="w-full py-2.5 px-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 font-extrabold text-xs flex items-center justify-between cursor-pointer transition-all shadow-md active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <HardDrive size={15} className="text-purple-400" />
                  <span>Internal Storage Breakdown</span>
                </div>
                <span className="text-[10px] font-mono bg-purple-900 px-2 py-0.5 rounded-full border border-purple-700 text-purple-200">
                  {(97.2 - cleanedCacheAmount).toFixed(1)} / 128 GB
                </span>
              </button>

              <button
                onClick={() => setActiveSubView("ota_update")}
                className="w-full py-2.5 px-3 rounded-2xl bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-500/40 font-extrabold text-xs flex items-center justify-between cursor-pointer transition-all shadow-md active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <Download size={15} className="text-teal-400" />
                  <span>System Updates (OTA)</span>
                </div>
                <span className="text-[10px] font-mono bg-teal-900 px-2 py-0.5 rounded-full border border-teal-700 text-teal-200">
                  {osVersion.includes("1.2.0") ? "Up to date" : "Update Available"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : activeSubView === "storage" ? (
        /* VIEW: STORAGE BREAKDOWN & SPACE MANAGEMENT */
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-none">
          {/* Main Storage Overview Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 border border-purple-500/30 space-y-3 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                  <HardDrive size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">NVMe Internal Flash Storage</h3>
                  <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">128 GB UFS 3.1 Architecture</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/80">
                {Math.round(((97.2 - cleanedCacheAmount) / 128) * 100)}% USED
              </span>
            </div>

            {/* Storage Numbers */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black text-white tracking-tight">{(97.2 - cleanedCacheAmount).toFixed(1)}</span>
                <span className="text-xs font-bold text-slate-400 ml-1">GB used</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-400">{(30.8 + cleanedCacheAmount).toFixed(1)} GB</span>
                <span className="text-[10px] font-bold text-slate-400 block">free remaining</span>
              </div>
            </div>

            {/* Segmented Color Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5 gap-0.5 shadow-inner">
                {storageCategories.map((cat) => {
                  const pct = ((cat.sizeGB / 128) * 100).toFixed(1);
                  return (
                    <div
                      key={cat.key}
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      className="h-full rounded-full transition-all duration-500 hover:brightness-125 cursor-pointer relative group"
                      title={`${cat.name}: ${cat.sizeGB} GB (${pct}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-mono">
                <span>0 GB</span>
                <span>64 GB</span>
                <span>128 GB Total</span>
              </div>
            </div>
          </div>

          {/* Donut Chart Visualizer Card */}
          <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                <PieChartIcon size={16} className="text-purple-400" />
                <span>Visual Storage Allocation Chart</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">Interactive Categories</span>
            </div>

            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageCategories.map((c) => ({ name: c.name, value: c.sizeGB, color: c.color }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {storageCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#ffffff"
                    }}
                    formatter={(value: any) => [`${value} GB`, "Size"]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute text-center pointer-events-none">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Total Capacity</span>
                <span className="text-xs font-black text-white font-mono">128 GB</span>
              </div>
            </div>
          </div>

          {/* Quick System Cleanup Card */}
          <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                  <Trash2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Storage Optimization & VFS Directory Cleaner</h4>
                  <p className="text-[9.5px] text-slate-400">Purge temporary app caches & reflect changes in file tree</p>
                </div>
              </div>
            </div>

            {cacheToast && (
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[10px] font-bold font-mono text-center animate-in fade-in">
                {cacheToast}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsStorageModalOpen(true)}
                className="py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <HardDrive size={14} />
                <span>Storage Manager</span>
              </button>

              <button
                onClick={handleCleanCache}
                disabled={isCleaningCache}
                className="py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {isCleaningCache ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Purging...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Quick Clean All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Itemized Category Breakdown Cards */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Categorized Breakdown</h4>

            {storageCategories.map((cat) => {
              const IconComp = cat.icon;
              const pct = (((cat.sizeGB) / 128) * 100).toFixed(1);

              return (
                <div
                  key={cat.key}
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${cat.colorClass}`}>
                        <IconComp size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-white">{cat.name}</h5>
                        <p className="text-[9.5px] text-slate-400 max-w-[180px] truncate">{cat.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white font-mono">{cat.sizeGB} GB</span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 block">{pct}%</span>
                    </div>
                  </div>

                  {/* Individual Bar */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeSubView === "ota_update" ? (
        /* VIEW: OVER-THE-AIR (OTA) UPDATE SIMULATOR */
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
          {/* Main Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/50 to-slate-950 border border-teal-500/30 text-center space-y-3 relative overflow-hidden shadow-xl">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-teal-950 border border-teal-500/40 text-teal-400 flex items-center justify-center shadow-inner">
              {otaStatus === "updating" ? (
                <Loader2 size={32} className="animate-spin text-teal-400" />
              ) : otaStatus === "completed" ? (
                <CheckCircle2 size={32} className="text-emerald-400" />
              ) : (
                <Download size={32} className="text-teal-400" />
              )}
            </div>

            <div>
              <h2 className="text-base font-extrabold text-white">Over-the-Air Firmware Update</h2>
              <p className="text-xs text-teal-400 font-mono font-bold mt-0.5">
                Current OS: {osVersion}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Build Vector: {buildNumber}
              </p>
            </div>
          </div>

          {/* OTA Status & Action Container */}
          <div className="space-y-3">
            {otaStatus === "idle" && (
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-center">
                <p className="text-xs text-slate-300">
                  Check for official KK Mobile OS firmware patches and kernel security updates over the network.
                </p>
                <button
                  onClick={handleStartOtaCheck}
                  className="w-full py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <RefreshCw size={14} />
                  <span>Check for OTA Updates</span>
                </button>
              </div>
            )}

            {otaStatus === "checking" && (
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-center">
                <Loader2 size={24} className="animate-spin text-teal-400 mx-auto" />
                <p className="text-xs font-mono text-teal-300 font-bold">{otaStepText}</p>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full w-1/3 animate-pulse" />
                </div>
              </div>
            )}

            {otaStatus === "available" && (
              <div className="p-4 rounded-3xl bg-slate-900 border border-teal-500/40 space-y-3.5 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800 text-[9px] font-mono font-bold">
                      NEW FIRMWARE
                    </span>
                    <h3 className="text-sm font-extrabold text-white mt-1">KK Mobile OS v1.2.0 OTA Patch</h3>
                    <p className="text-[10px] text-slate-400">Package size: 428.5 MB • July 2026 Security Release</p>
                  </div>
                </div>

                {/* Patch Notes */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <h4 className="font-bold text-teal-400 text-[11px] uppercase tracking-wider">Release Patch Notes:</h4>
                  <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                    <li>Updated system security patch level to July 2026</li>
                    <li>PowerHAL CPU frequency governor optimization for smooth 60fps</li>
                    <li>Firestore Cloud Vault storage synchronization engine upgrade</li>
                    <li>Patched system kernel version string to KK-Core-v1.2.0-OTA</li>
                  </ul>
                </div>

                <button
                  onClick={handleApplyOtaUpdate}
                  className="w-full py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Download size={16} />
                  <span>Download & Install OTA Firmware Update</span>
                </button>
              </div>
            )}

            {otaStatus === "updating" && (
              <div className="p-5 rounded-3xl bg-slate-900 border border-teal-500/50 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center text-xs font-extrabold">
                  <span className="text-teal-300 flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin text-teal-400" />
                    Flashing OTA Firmware...
                  </span>
                  <span className="font-mono text-teal-400">{otaProgress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500 rounded-full transition-all duration-300 shadow-md"
                    style={{ width: `${otaProgress}%` }}
                  />
                </div>

                {/* Step Log */}
                <p className="text-[11px] font-mono text-slate-300 text-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {otaStepText}
                </p>

                <p className="text-[9px] text-amber-400 text-center font-mono">
                  ⚠️ Do not power off or restart device while flashing system partition.
                </p>
              </div>
            )}

            {otaStatus === "completed" && (
              <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-3.5 text-center shadow-xl">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 size={20} />
                  <span>System Firmware Up To Date!</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p>
                    Your device is running patched build: <strong className="text-teal-400">{osVersion}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">Kernel: 5.15.112-{buildNumber}</p>
                </div>

                <button
                  onClick={handleStartOtaCheck}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-extrabold text-xs cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <RefreshCw size={14} />
                  <span>Check Again</span>
                </button>
              </div>
            )}

            {/* Special Attraction: OS Downloader & Boot Animation Interactive Hub */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-teal-950/80 border border-cyan-500/40 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles size={16} />
                <span>Firmware Installation & Boot Showcase</span>
              </div>
              <h3 className="text-xs font-extrabold text-white">Quantum OS Download & Boot Engine</h3>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Experience high-speed 5G satellite downloads, sector-by-sector flash writing, and cinematic boot animations with synthesized audio chimes.
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {onTriggerOsDownload && (
                  <button
                    onClick={onTriggerOsDownload}
                    className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
                  >
                    <Download size={15} />
                    <span>Download Full OS Image (Live 5G Stream & Flasher)</span>
                  </button>
                )}

                {onTriggerBootAnim && (
                  <button
                    onClick={onTriggerBootAnim}
                    className="w-full py-2.5 px-3 rounded-2xl bg-slate-950 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <RotateCcw size={14} className="animate-spin text-cyan-400" />
                    <span>Launch Quantum Boot Animation (Audio & Visuals)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeSubView === "themes" || activeSubView === "wallpaper" ? (
        /* VIEW: DESKTOP WALLPAPER, PATTERNS & THEME PERSONALIZATION */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {/* Toast Notification Banner */}
          {wallpaperToast && (
            <div className="p-2.5 rounded-2xl bg-teal-950/90 border border-teal-400 text-teal-200 text-xs font-bold font-mono flex items-center justify-between shadow-lg animate-bounce">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-teal-400" />
                <span>{wallpaperToast}</span>
              </span>
              <Check size={14} className="text-teal-400" />
            </div>
          )}

          {/* SECTION 1: Active Desktop Live Screen Mockup */}
          {(() => {
            const activeWp = WALLPAPERS.find((w) => w.id === currentWallpaperId) || WALLPAPERS[0];
            const activePattern = WALLPAPER_PATTERNS.find((p) => p.id === themeConfig.patternId) || WALLPAPER_PATTERNS[1];

            return (
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Palette size={13} style={{ color: themeConfig.accentHex }} />
                    Active Desktop Background Live Preview
                  </span>
                  <button
                    onClick={handleResetTheme}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <RotateCcw size={10} /> Reset Default
                  </button>
                </div>

                {/* Simulated Desktop Phone Frame */}
                <div
                  className={`h-36 w-full rounded-2xl ${activeWp.className} relative p-3 flex flex-col justify-between shadow-2xl border border-white/20 overflow-hidden transition-all duration-300`}
                  style={activeWp.customStyle}
                >
                  {/* Pattern Overlay Mesh */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-300"
                    style={{
                      backgroundImage: activePattern.cssPattern,
                      backgroundSize: themeConfig.patternId === "dots" ? "16px 16px" : themeConfig.patternId === "grid" ? "20px 20px" : "auto"
                    }}
                  />

                  {/* Desktop Status Bar */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold text-white/90 drop-shadow">
                    <span>10:45 AM</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20">
                        {activePattern.name}
                      </span>
                      <span>🔋 85%</span>
                    </div>
                  </div>

                  {/* Desktop Mini App Icons Simulation */}
                  <div className="relative z-10 grid grid-cols-4 gap-2 my-auto max-w-[200px] mx-auto opacity-90">
                    <div className="p-1.5 rounded-xl bg-teal-500/80 text-slate-950 flex items-center justify-center shadow">
                      <PhoneIcon size={12} />
                    </div>
                    <div className="p-1.5 rounded-xl bg-indigo-500/80 text-white flex items-center justify-center shadow">
                      <MessageSquare size={12} />
                    </div>
                    <div className="p-1.5 rounded-xl bg-amber-500/80 text-slate-950 flex items-center justify-center shadow">
                      <Settings size={12} />
                    </div>
                    <div className="p-1.5 rounded-xl bg-purple-500/80 text-white flex items-center justify-center shadow">
                      <Sparkles size={12} />
                    </div>
                  </div>

                  {/* Bottom Active Wallpaper Bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 flex items-center gap-2">
                      <Check size={12} style={{ color: themeConfig.accentHex }} className="font-extrabold" />
                      <div>
                        <span className="text-xs font-bold text-white truncate block max-w-[140px]">{activeWp.name}</span>
                        <span className="text-[8px] text-teal-300 font-mono block truncate">{activeWp.category || "Preset Gradient"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const randomIndex = Math.floor(Math.random() * WALLPAPERS.length);
                        const picked = WALLPAPERS[randomIndex];
                        onWallpaperChange(picked.id);
                        triggerWallpaperToast(`Randomized wallpaper: ${picked.name}`);
                      }}
                      className="bg-black/70 hover:bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <RotateCcw size={10} /> Randomize
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SECTION 2: Wallpaper Filter Category Bar */}
          <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-6 gap-1 text-[9.5px] font-bold">
            <button
              onClick={() => setWallpaperFilter("all")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                wallpaperFilter === "all" ? "bg-teal-400 text-slate-950 font-extrabold shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setWallpaperFilter("dynamic")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                wallpaperFilter === "dynamic" ? "bg-cyan-400 text-slate-950 font-extrabold shadow-md" : "text-cyan-400 hover:text-cyan-300 font-extrabold"
              }`}
            >
              <Sparkles size={10} />
              <span>Dynamic</span>
            </button>
            <button
              onClick={() => setWallpaperFilter("gradient")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                wallpaperFilter === "gradient" ? "bg-teal-400 text-slate-950 font-extrabold shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Gradients
            </button>
            <button
              onClick={() => setWallpaperFilter("pattern")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                wallpaperFilter === "pattern" ? "bg-teal-400 text-slate-950 font-extrabold shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Patterns
            </button>
            <button
              onClick={() => setWallpaperFilter("custom")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                wallpaperFilter === "custom" ? "bg-teal-400 text-slate-950 font-extrabold shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => setWallpaperFilter("accent")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                wallpaperFilter === "accent" ? "bg-teal-400 text-slate-950 font-extrabold shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Accents
            </button>
          </div>

          {/* DYNAMIC AUTO-CYCLE MANAGER SECTION */}
          {wallpaperFilter === "dynamic" && (
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30">
              <DynamicWallpaperManager
                currentWallpaperId={currentWallpaperId}
                onWallpaperChange={onWallpaperChange}
                onClose={() => setWallpaperFilter("all")}
              />
            </div>
          )}

          {/* SECTION 3: Preset Wallpaper Gradients Collection */}
          {(wallpaperFilter === "all" || wallpaperFilter === "gradient") && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-teal-400" />
                    Preset Desktop Gradients
                  </h3>
                  <p className="text-[9px] text-slate-400">Curated high-contrast OS wallpaper gradients</p>
                </div>
                <span className="text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-bold">
                  {WALLPAPERS.length} Wallpapers
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {WALLPAPERS.map((wp) => {
                  const isActive = currentWallpaperId === wp.id;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => {
                        onWallpaperChange(wp.id);
                        triggerWallpaperToast(`Wallpaper applied: ${wp.name}`);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer active:scale-95 ${
                        isActive
                          ? "bg-slate-950 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.25)] ring-1 ring-teal-400/50"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`h-20 w-full rounded-xl ${wp.className} relative flex items-start justify-between p-2 shadow-inner overflow-hidden border border-white/10`}
                        style={wp.customStyle}
                      >
                        <span className="text-[8px] font-mono font-bold bg-black/60 text-white backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10">
                          {wp.category || "Preset"}
                        </span>
                        {isActive && (
                          <span
                            className="h-5 w-5 rounded-full text-slate-950 flex items-center justify-center font-black shadow-md shrink-0"
                            style={{ backgroundColor: themeConfig.accentHex }}
                          >
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-extrabold text-white truncate">{wp.name}</span>
                        <span className="text-[9px] text-slate-400 truncate">{wp.description || "Procedural OS gradient preset"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: System Pattern Overlays Selector */}
          {(wallpaperFilter === "all" || wallpaperFilter === "pattern") && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Grid size={14} className="text-cyan-400" />
                    System Pattern Overlays
                  </h3>
                  <p className="text-[9px] text-slate-400">Dynamic geometric background mesh overlays</p>
                </div>
                <span className="text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-bold">
                  {WALLPAPER_PATTERNS.length} Patterns
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {WALLPAPER_PATTERNS.map((pattern) => {
                  const isSelected = themeConfig.patternId === pattern.id;
                  return (
                    <button
                      key={pattern.id}
                      onClick={() => {
                        handleSelectPattern(pattern.id);
                        triggerWallpaperToast(`Pattern overlay set to: ${pattern.name}`);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 active:scale-95 ${
                        isSelected
                          ? "bg-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className="h-14 w-full rounded-xl bg-slate-950 border border-slate-800 relative flex items-center justify-center overflow-hidden"
                        style={{
                          backgroundImage: pattern.cssPattern,
                          backgroundSize: pattern.id === "dots" ? "16px 16px" : pattern.id === "grid" ? "20px 20px" : "auto"
                        }}
                      >
                        {isSelected && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-950 shadow-md"
                            style={{ backgroundColor: themeConfig.accentHex }}
                          >
                            <Check size={14} className="font-extrabold" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-white">{pattern.name}</h4>
                        <p className="text-[9px] text-slate-400 truncate">{pattern.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 5: Custom System Gradient Generator */}
          {(wallpaperFilter === "all" || wallpaperFilter === "custom") && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                    <Sliders size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white">Custom System Gradient Generator</h3>
                    <p className="text-[9px] text-slate-400">Design custom gradient desktop wallpapers</p>
                  </div>
                </div>
              </div>

              {/* Live Generator Preview Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Generated Gradient Live Preview
                </label>
                <div
                  className="h-28 w-full rounded-2xl relative p-3 flex flex-col justify-between border border-white/20 shadow-xl overflow-hidden transition-all duration-300"
                  style={{
                    background:
                      customDirection === "radial"
                        ? `radial-gradient(circle at center, ${customColorStart}, ${customColorEnd})`
                        : customDirection === "to-tr"
                        ? `linear-gradient(to top right, ${customColorStart}, ${customColorEnd})`
                        : customDirection === "to-r"
                        ? `linear-gradient(to right, ${customColorStart}, ${customColorEnd})`
                        : `linear-gradient(to bottom right, ${customColorStart}, ${customColorEnd})`
                  }}
                >
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-white/90">
                    <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                      {customColorStart} → {customColorEnd}
                    </span>
                    <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                      {customDirection.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-white drop-shadow text-center my-auto">
                    Custom Desktop Wallpaper Preview
                  </p>
                </div>
              </div>

              {/* Color A Swatches & Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-300">Start Color (Color A)</span>
                  <span className="font-mono text-teal-400">{customColorStart}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-700 cursor-pointer">
                    <input
                      type="color"
                      value={customColorStart}
                      onChange={(e) => setCustomColorStart(e.target.value)}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 flex-1">
                    {["#0f172a", "#1e1b4b", "#022c22", "#31121d", "#0f2e3d", "#18181b"].map((hex) => (
                      <button
                        key={hex}
                        onClick={() => setCustomColorStart(hex)}
                        className={`h-7 rounded-xl border transition-all cursor-pointer ${
                          customColorStart === hex ? "border-teal-400 scale-105 shadow" : "border-slate-800 hover:border-slate-700"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Color B Swatches & Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-300">End Color (Color B)</span>
                  <span className="font-mono text-teal-400">{customColorEnd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-700 cursor-pointer">
                    <input
                      type="color"
                      value={customColorEnd}
                      onChange={(e) => setCustomColorEnd(e.target.value)}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 flex-1">
                    {["#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#ec4899", "#38bdf8"].map((hex) => (
                      <button
                        key={hex}
                        onClick={() => setCustomColorEnd(hex)}
                        className={`h-7 rounded-xl border transition-all cursor-pointer ${
                          customColorEnd === hex ? "border-teal-400 scale-105 shadow" : "border-slate-800 hover:border-slate-700"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Gradient Direction Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Gradient Direction Vector
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "to-br", label: "↘ Diag Down" },
                    { id: "to-r", label: "→ Horizontal" },
                    { id: "to-tr", label: "↗ Diag Up" },
                    { id: "radial", label: "◎ Radial Center" },
                  ].map((dir) => (
                    <button
                      key={dir.id}
                      onClick={() => setCustomDirection(dir.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold cursor-pointer transition-all border ${
                        customDirection === dir.id
                          ? "bg-teal-400 text-slate-950 border-teal-300 font-extrabold shadow"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Custom Gradient Button */}
              <button
                onClick={() => {
                  const customId = `custom_grad_${Date.now()}`;
                  const customBgStyle = {
                    background:
                      customDirection === "radial"
                        ? `radial-gradient(circle at center, ${customColorStart}, ${customColorEnd})`
                        : customDirection === "to-tr"
                        ? `linear-gradient(to top right, ${customColorStart}, ${customColorEnd})`
                        : customDirection === "to-r"
                        ? `linear-gradient(to right, ${customColorStart}, ${customColorEnd})`
                        : `linear-gradient(to bottom right, ${customColorStart}, ${customColorEnd})`
                  };

                  const newWp: Wallpaper = {
                    id: customId,
                    name: `Custom (${customColorStart.slice(0, 4)} → ${customColorEnd.slice(0, 4)})`,
                    className: "bg-slate-950",
                    thumbnail: "from-slate-900 to-teal-950",
                    category: "custom",
                    description: "User-designed custom gradient wallpaper",
                    customStyle: customBgStyle
                  };

                  WALLPAPERS.unshift(newWp);
                  onWallpaperChange(customId);
                  triggerWallpaperToast("Custom gradient wallpaper created & applied to desktop!");
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 hover:brightness-110 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                <Sparkles size={14} />
                <span>Save & Set Custom Desktop Wallpaper</span>
              </button>
            </div>
          )}

          {/* SECTION 6: System Accent Color Selector */}
          {(wallpaperFilter === "all" || wallpaperFilter === "accent") && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800" style={{ color: themeConfig.accentHex }}>
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white">System Accent Highlight Color</h3>
                    <p className="text-[9px] text-slate-400">Updates active buttons, badges & focus rings</p>
                  </div>
                </div>

                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 font-bold">
                  {themeConfig.accentHex}
                </span>
              </div>

              {/* Accent Color Swatches */}
              <div className="grid grid-cols-6 gap-2">
                {ACCENT_COLOR_PRESETS.map((accent) => {
                  const isSelected = themeConfig.accentHex.toLowerCase() === accent.hex.toLowerCase();
                  return (
                    <button
                      key={accent.id}
                      onClick={() => handleSelectAccent(accent.hex, accent.rgb)}
                      className={`h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative shadow-sm ${
                        isSelected ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900 z-10" : "hover:scale-105 opacity-85 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: accent.hex }}
                      title={accent.name}
                    >
                      {isSelected && <Check size={14} className="text-slate-950 font-extrabold drop-shadow" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="pt-1 flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-700 cursor-pointer">
                  <input
                    type="color"
                    value={themeConfig.accentHex}
                    onChange={(e) => handleSelectAccent(e.target.value)}
                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                    title="Pick Custom Color"
                  />
                </div>

                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">HEX</span>
                  <input
                    type="text"
                    value={customHexInput}
                    onChange={(e) => {
                      setCustomHexInput(e.target.value);
                      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                        handleSelectAccent(e.target.value);
                      }
                    }}
                    placeholder="#06b6d4"
                    className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none uppercase"
                  />
                </div>

                <button
                  onClick={() => handleSelectAccent(customHexInput)}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono text-slate-950 cursor-pointer shadow transition-all active:scale-95"
                  style={{ backgroundColor: themeConfig.accentHex }}
                >
                  Apply Accent
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeSubView === "network" ? (
        /* VIEW: NETWORK & BLUETOOTH CONNECTIVITY SETTINGS */
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-none">
          {/* Wi-Fi Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${settingsState.wifi ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "bg-slate-800 text-slate-500"}`}>
                <Wifi size={18} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Wi-Fi Connectivity</h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {settingsState.wifi ? "Connected: KK_5G_FastNet (866 Mbps)" : "Disconnected"}
                </p>
              </div>
            </div>
            <button
              onClick={() => onSettingsStateChange("wifi", !settingsState.wifi)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all border ${
                settingsState.wifi
                  ? "bg-teal-500 text-slate-950 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.3)]"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {settingsState.wifi ? "ON" : "OFF"}
            </button>
          </div>

          {/* Bluetooth Main Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${settingsState.bluetooth ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-slate-800 text-slate-500"}`}>
                  <Bluetooth size={20} className={settingsState.bluetooth ? "animate-pulse" : ""} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-extrabold text-white">Bluetooth Radio</h3>
                    {settingsState.bluetooth && (
                      <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded-full font-mono font-bold">
                        DISCOVERABLE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {settingsState.bluetooth ? "Visible as 'KK-Phone-OS'" : "Bluetooth is turned off"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSettingsStateChange("bluetooth", !settingsState.bluetooth)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all border ${
                  settingsState.bluetooth
                    ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {settingsState.bluetooth ? "ENABLED" : "OFF"}
              </button>
            </div>

            {/* Bluetooth Device Management Section */}
            {settingsState.bluetooth ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Paired & Available Devices
                  </span>

                  <button
                    onClick={scanBluetoothDevices}
                    disabled={isScanningBluetooth}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={isScanningBluetooth ? "animate-spin text-cyan-400" : ""} />
                    <span>{isScanningBluetooth ? "Scanning..." : "Scan Devices"}</span>
                  </button>
                </div>

                {/* Device List */}
                <div className="space-y-2">
                  {bluetoothDevices.map((dev) => {
                    return (
                      <div
                        key={dev.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          dev.connected
                            ? "bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                            : "bg-slate-950 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-xl ${
                              dev.connected
                                ? "bg-cyan-400 text-slate-950 font-bold"
                                : "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}
                          >
                            {dev.type === "headphones" && <Headphones size={15} />}
                            {dev.type === "speaker" && <Speaker size={15} />}
                            {dev.type === "watch" && <Watch size={15} />}
                            {dev.type === "car" && <Radio size={15} />}
                            {dev.type === "keyboard" && <Sliders size={15} />}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white">{dev.name}</h4>
                              {dev.connected && (
                                <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 rounded font-mono font-extrabold">
                                  CONNECTED
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono flex items-center gap-2">
                              <span>{dev.connected ? "Audio Output Active" : "Paired"}</span>
                              {dev.battery !== null && (
                                <span className="text-cyan-300 font-bold">🔋 {dev.battery}%</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleDeviceConnection(dev.id)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-all border ${
                            dev.connected
                              ? "bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-800"
                              : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700"
                          }`}
                        >
                          {dev.connected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 text-center space-y-1">
                <p className="text-[11px] text-slate-400">Turn on Bluetooth to scan and connect wireless headphones, watches, and speakers.</p>
              </div>
            )}
          </div>

          {/* Virtual File Sharing (Quick Share) Card */}
          {settingsState.bluetooth && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Share2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white">Virtual File Transfer</h3>
                    <p className="text-[10px] text-slate-400">Send & receive mock files with nearby Bluetooth devices</p>
                  </div>
                </div>
              </div>

              {/* Sub-tabs: Send | Receive | History */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold">
                <button
                  onClick={() => setFileShareTab("send")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    fileShareTab === "send" ? "bg-cyan-500 text-slate-950 font-extrabold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Send size={11} />
                  <span>Send File</span>
                </button>

                <button
                  onClick={() => setFileShareTab("receive")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer relative ${
                    fileShareTab === "receive" ? "bg-cyan-500 text-slate-950 font-extrabold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Download size={11} />
                  <span>Receive</span>
                  {incomingRequest && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
                  )}
                </button>

                <button
                  onClick={() => setFileShareTab("history")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    fileShareTab === "history" ? "bg-cyan-500 text-slate-950 font-extrabold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock size={11} />
                  <span>History</span>
                </button>
              </div>

              {/* TAB CONTENT 1: SEND FILE */}
              {fileShareTab === "send" && (
                <div className="space-y-3 pt-1">
                  {/* Select File */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      1. Select Local File to Share
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "camera_shot_2026.jpg", size: "4.8 MB", type: "image", icon: ImageIcon },
                        { name: "workout_album.mp3", size: "8.1 MB", type: "audio", icon: Headphones },
                        { name: "project_plan.pdf", size: "1.5 MB", type: "document", icon: FileText },
                        { name: "backup_vault.zip", size: "14.2 MB", type: "archive", icon: File },
                      ].map((item) => {
                        const isSelected = selectedFileToSend.name === item.name;
                        const IconComp = item.icon;
                        return (
                          <button
                            key={item.name}
                            onClick={() => setSelectedFileToSend({ name: item.name, size: item.size, type: item.type })}
                            className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <div className={`p-1.5 rounded-xl ${isSelected ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-slate-400"}`}>
                              <IconComp size={13} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold truncate text-white">{item.name}</p>
                              <p className="text-[8px] font-mono text-slate-400">{item.size}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Device */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      2. Select Target Bluetooth Device
                    </label>
                    <select
                      value={selectedTargetDevice}
                      onChange={(e) => setSelectedTargetDevice(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                    >
                      {bluetoothDevices.map((dev) => (
                        <option key={dev.id} value={dev.id}>
                          {dev.name} {dev.connected ? "(Connected)" : "(Nearby)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Progress or Action Button */}
                  {isSending ? (
                    <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-cyan-300 flex items-center gap-1.5">
                          <Send size={12} className="animate-pulse" />
                          <span>Sending {selectedFileToSend.name}...</span>
                        </span>
                        <span className="font-mono text-cyan-400">{sendProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${sendProgress}%` }}
                        />
                      </div>
                      <p className="text-[8px] font-mono text-slate-400 text-right">Transfer rate: 2.8 MB/s</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendFile}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                    >
                      <Send size={14} />
                      <span>Send File Now</span>
                    </button>
                  )}
                </div>
              )}

              {/* TAB CONTENT 2: RECEIVE FILE */}
              {fileShareTab === "receive" && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-white">Device Visibility</p>
                      <p className="text-[9px] text-slate-400 font-mono">Broadcasting as 'KK-Phone-OS'</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[8px] font-mono font-bold">
                      READY
                    </span>
                  </div>

                  {!incomingRequest && !isReceiving && (
                    <div className="text-center p-3 space-y-2 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                      <p className="text-[10px] text-slate-400">Waiting for nearby Bluetooth devices to send files...</p>
                      <button
                        onClick={triggerMockIncomingFile}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-[10px] font-extrabold flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-all"
                      >
                        <FolderDown size={12} />
                        <span>Simulate Incoming File Request</span>
                      </button>
                    </div>
                  )}

                  {incomingRequest && !isReceiving && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-cyan-400/80 space-y-3 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-cyan-400 text-slate-950">
                          <Download size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white">Incoming Bluetooth Share</h4>
                          <p className="text-[10px] text-slate-300 font-medium">
                            <span className="text-cyan-300 font-bold">{incomingRequest.device}</span> wants to send you:
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate max-w-[170px]">{incomingRequest.fileName}</span>
                        <span className="text-[9px] font-mono text-cyan-400 font-extrabold">{incomingRequest.fileSize}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleDeclineIncoming}
                          className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
                        >
                          <XCircle size={13} className="text-rose-400" />
                          <span>Decline</span>
                        </button>
                        <button
                          onClick={handleAcceptIncoming}
                          className="py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1 border border-cyan-300 shadow-md cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          <span>Accept File</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {isReceiving && (
                    <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-cyan-300 flex items-center gap-1.5">
                          <Download size={12} className="animate-bounce" />
                          <span>Receiving file...</span>
                        </span>
                        <span className="font-mono text-cyan-400">{receiveProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${receiveProgress}%` }}
                        />
                      </div>
                      <p className="text-[8px] font-mono text-slate-400 text-right">Saving to /Storage/Downloads/</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT 3: HISTORY */}
              {fileShareTab === "history" && (
                <div className="space-y-2 pt-1">
                  {transferHistory.length === 0 ? (
                    <p className="text-[10px] text-slate-500 text-center py-4">No recent file transfers.</p>
                  ) : (
                    transferHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-xl ${
                              item.direction === "sent" ? "bg-amber-500/20 text-amber-400" : "bg-teal-500/20 text-teal-400"
                            }`}
                          >
                            {item.direction === "sent" ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white max-w-[150px] truncate">{item.fileName}</p>
                            <p className="text-[8px] text-slate-400">
                              {item.direction === "sent" ? "To: " : "From: "} {item.device} • {item.fileSize}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              item.status === "completed"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-rose-950 text-rose-400 border border-rose-800"
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                          <p className="text-[8px] font-mono text-slate-500 mt-0.5">{item.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeSubView === "display" ? (
        /* VIEW: DISPLAY & BRIGHTNESS */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {/* Screen Brightness Card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Sun size={16} className="text-amber-400" />
                <span>Screen Backlight Brightness</span>
              </div>
              <span className="text-xs font-mono font-bold text-teal-400">{brightness}%</span>
            </div>

            <input
              type="range"
              min="20"
              max="100"
              value={brightness}
              onChange={(e) => onBrightnessChange(Number(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Quick Brightness Presets */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {[25, 50, 75, 100].map((level) => (
                <button
                  key={level}
                  onClick={() => onBrightnessChange(level)}
                  className={`flex-1 py-1 rounded-xl text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                    brightness === level
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  {level}%
                </button>
              ))}
            </div>
          </div>

          {/* System Status Bar Clock Format Toggle Card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">System Clock Format</h3>
                  <p className="text-[9px] text-slate-400">Toggle status bar clock format in real-time</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                {settingsState.use24Hour ? "24-HOUR MODE" : "12-HOUR MODE"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* 12-Hour Option */}
              <button
                onClick={() => onSettingsStateChange("use24Hour", false)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer active:scale-95 ${
                  !settingsState.use24Hour
                    ? "bg-teal-950/50 border-teal-400 text-white shadow-[0_0_15px_rgba(45,212,191,0.25)] ring-1 ring-teal-400/50"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">12-Hour Format</span>
                  {!settingsState.use24Hour && <Check size={14} className="text-teal-400" />}
                </div>
                <span className="text-[10.5px] font-mono font-bold text-teal-300">
                  {new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
                </span>
                <span className="text-[8.5px] text-slate-400">Standard 12h clock with AM/PM</span>
              </button>

              {/* 24-Hour Option */}
              <button
                onClick={() => onSettingsStateChange("use24Hour", true)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer active:scale-95 ${
                  settingsState.use24Hour
                    ? "bg-teal-950/50 border-teal-400 text-white shadow-[0_0_15px_rgba(45,212,191,0.25)] ring-1 ring-teal-400/50"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">24-Hour Format</span>
                  {settingsState.use24Hour && <Check size={14} className="text-teal-400" />}
                </div>
                <span className="text-[10.5px] font-mono font-bold text-teal-300">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                </span>
                <span className="text-[8.5px] text-slate-400">International 24h clock</span>
              </button>
            </div>
          </div>

          {/* Abstract Wallpaper Cycling & Selection */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">Generated Abstract Wallpapers</h3>
                  <p className="text-[9px] text-slate-400">AI-crafted background textures & patterns</p>
                </div>
              </div>

              {/* Cycle Wallpaper Button */}
              <button
                onClick={() => {
                  const abstractOnly = WALLPAPERS.filter((w) => w.id.startsWith("abstract_") || w.imageUrl);
                  const currentIndex = abstractOnly.findIndex((w) => w.id === currentWallpaperId);
                  const nextIndex = (currentIndex + 1) % abstractOnly.length;
                  onWallpaperChange(abstractOnly[nextIndex].id);
                }}
                className="py-1.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[10px] flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
                title="Cycle to next abstract wallpaper"
              >
                <RotateCcw size={12} />
                <span>Cycle Wallpaper</span>
              </button>
            </div>

            {/* Currently Selected Active Wallpaper Preview */}
            {(() => {
              const activeWp = WALLPAPERS.find((w) => w.id === currentWallpaperId) || WALLPAPERS[0];
              return (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div
                    className={`h-16 w-12 rounded-xl bg-gradient-to-br ${activeWp.thumbnail} relative overflow-hidden shrink-0 border border-slate-700 shadow-md`}
                    style={
                      activeWp.imageUrl
                        ? {
                            backgroundImage: `url(${activeWp.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                          }
                        : undefined
                    }
                  >
                    {activeWp.imageUrl && (
                      <img
                        src={activeWp.imageUrl}
                        alt={activeWp.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[9px] font-mono text-teal-400 font-bold uppercase tracking-wider mb-0.5">
                      <Check size={11} />
                      <span>Active Wallpaper</span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{activeWp.name}</h4>
                    <p className="text-[9px] text-slate-400 truncate">
                      {activeWp.imageUrl ? "High-res abstract generated texture" : "Procedural gradient background"}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Abstract Wallpaper Gallery Grid */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Abstract Wallpaper Collection
              </span>
              <div className="grid grid-cols-2 gap-2">
                {WALLPAPERS.filter((w) => w.id.startsWith("abstract_") || w.imageUrl).map((wp) => {
                  const isActive = currentWallpaperId === wp.id;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => onWallpaperChange(wp.id)}
                      className={`p-2 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer active:scale-95 ${
                        isActive
                          ? "border-teal-400 bg-teal-950/30 shadow-[0_0_15px_rgba(45,212,191,0.25)] ring-1 ring-teal-400/50"
                          : "border-slate-800 bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="h-20 w-full rounded-xl overflow-hidden relative bg-slate-950 border border-slate-800 shadow-inner">
                        {wp.imageUrl ? (
                          <img
                            src={wp.imageUrl}
                            alt={wp.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${wp.thumbnail}`} />
                        )}

                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{wp.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Abstract Art</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <h4 className="font-bold text-slate-200">Simulated Backlight & Wallpaper Engine</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Selecting wallpapers updates the OS background across the launcher and lock screen. Screen backlight controls apply ambient hardware dimming.
            </p>
          </div>
        </div>
      ) : activeSubView === "accounts" ? (
        /* VIEW: GOOGLE ACCOUNT & FIREBASE CLOUD SYNC */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {currentUser ? (
            /* Logged In User Profile Card */
            <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-3 shadow-xl">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-full border-2 border-indigo-400 shadow-md object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-extrabold text-white truncate">
                      {currentUser.displayName || "Google User"}
                    </h3>
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-0.5 text-[9px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800">
                    UID: {currentUser.uid.slice(0, 10)}...
                  </span>
                </div>
              </div>

              {/* Cloud Sync Status Notification */}
              {syncStatus && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-[10px] text-indigo-200 font-mono">
                  {syncStatus}
                </div>
              )}

              {/* Firestore Cloud Sync Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleSyncToCloud}
                  disabled={isAuthLoading}
                  className="py-2 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isAuthLoading ? <Loader2 size={13} className="animate-spin" /> : <CloudUpload size={14} />}
                  <span>Backup to Firestore</span>
                </button>

                <button
                  onClick={handleRestoreFromCloud}
                  disabled={isAuthLoading}
                  className="py-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isAuthLoading ? <Loader2 size={13} className="animate-spin" /> : <CloudDownload size={14} />}
                  <span>Restore Settings</span>
                </button>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-indigo-950/80 flex justify-end">
                <button
                  onClick={handleSignOut}
                  className="py-1.5 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out - Google Sign-in Card */
            <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4 text-center shadow-xl">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-teal-400 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400">
                  <Database size={28} />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">Firebase & Google Identity</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Sign in with your Google account to securely persist OS preferences, notes, and wallpapers to Firestore.
                </p>
              </div>

              {syncStatus && (
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-300 font-mono">
                  {syncStatus}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-teal-400 to-indigo-500 hover:opacity-95 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            </div>
          )}

          {/* Database Info Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Database size={15} />
              <span>Firebase Firestore Configuration</span>
            </div>
            <div className="space-y-1 font-mono text-[10px] text-slate-400">
              <p>Project: <span className="text-white">gen-lang-client-0924151421</span></p>
              <p>Database: <span className="text-teal-400 truncate block">ai-studio-kkmobileos-05a18c46-f11d-4fc2-9175-432e1d2333c2</span></p>
              <p>Auth Engine: <span className="text-emerald-400">Firebase OAuth (Google Provider)</span></p>
            </div>
          </div>

          {/* Gemini AI API Key Configuration Card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-xs shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold">
                <Sparkles size={16} />
                <span>Gemini AI Engine Key</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-amber-950 text-amber-300 border border-amber-800/80">
                {customApiKey ? "Custom Key Active" : "Default Env Active"}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              KK-AI uses Google Gemini (<code className="text-amber-300 font-mono">gemini-2.5-flash</code>) to provide accurate answers, answer questions, and perform searches.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                API Key Override (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy... (Leave empty to use system default)"
                  className="flex-1 bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono outline-none"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                >
                  Save Key
                </button>
              </div>
            </div>

            {apiKeySaveStatus && (
              <p className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/50">
                {apiKeySaveStatus}
              </p>
            )}
          </div>
        </div>
      ) : activeSubView === "performance" ? (
        /* VIEW: PERFORMANCE MODE SELECTOR */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {/* Header Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Gauge size={16} />
              <span>System PowerHAL Profile</span>
            </div>
            <h3 className="text-sm font-extrabold text-white">Performance Mode Selector</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Dynamically regulate CPU clock speeds, background process scheduling, and battery drain intervals.
            </p>
          </div>

          {/* Selector Options */}
          <div className="space-y-2.5">
            {/* High Performance Option */}
            <button
              onClick={() => onPerformanceModeChange?.("high_performance")}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                performanceMode === "high_performance"
                  ? "bg-gradient-to-r from-amber-950/90 to-rose-950/90 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      performanceMode === "high_performance"
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "bg-slate-800 text-amber-400 border border-slate-700"
                    }`}
                  >
                    <Zap size={18} className={performanceMode === "high_performance" ? "fill-slate-950" : ""} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-white">High Performance</h4>
                      {performanceMode === "high_performance" && (
                        <span className="text-[8px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-black uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Maximum CPU responsiveness & zero frame drops</p>
                  </div>
                </div>
                {performanceMode === "high_performance" && <Check size={16} className="text-amber-400 mt-1" />}
              </div>
              <div className="mt-3 pt-2 border-t border-amber-500/20 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-300">
                <div>• Active Drain: <span className="text-amber-300 font-bold">1% / 30-60s</span></div>
                <div>• Clock Speed: <span className="text-amber-300 font-bold">Max (3.2 GHz)</span></div>
              </div>
            </button>

            {/* Power Efficient Option */}
            <button
              onClick={() => onPerformanceModeChange?.("power_efficient")}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                performanceMode === "power_efficient"
                  ? "bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.25)]"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      performanceMode === "power_efficient"
                        ? "bg-emerald-400 text-slate-950 font-black"
                        : "bg-slate-800 text-emerald-400 border border-slate-700"
                    }`}
                  >
                    <BatteryCharging size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-white">Power Efficient</h4>
                      {performanceMode === "power_efficient" && (
                        <span className="text-[8px] bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded-full font-black uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Optimized battery life & adaptive thermal throttle</p>
                  </div>
                </div>
                {performanceMode === "power_efficient" && <Check size={16} className="text-emerald-400 mt-1" />}
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-500/20 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-300">
                <div>• Active Drain: <span className="text-emerald-300 font-bold">1% / 1.5-3 min</span></div>
                <div>• Clock Speed: <span className="text-emerald-300 font-bold">Balanced (1.8 GHz)</span></div>
              </div>
            </button>
          </div>

          {/* Quick Battery Saver Switch */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isBatterySaver ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-slate-800 text-slate-400"}`}>
                <Activity size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Extreme Battery Saver</h4>
                <p className="text-[9px] text-slate-400">Doubles standby and app efficiency intervals</p>
              </div>
            </div>
            <button
              onClick={() => onToggleBatterySaver?.(!isBatterySaver)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isBatterySaver
                  ? "bg-amber-400 text-slate-950 border-amber-300 font-extrabold"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              {isBatterySaver ? "ON" : "OFF"}
            </button>
          </div>

          {/* Direct Link to Battery Consumption Breakdown */}
          <div
            onClick={() => setActiveSubView("battery_usage")}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition-all shadow-md active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
                <PieChartIcon size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Battery Consumption Pie Chart</span>
                  <span className="text-[7.5px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                    VISUALIZER
                  </span>
                </h4>
                <p className="text-[9.5px] text-slate-400">Inspect energy drain percentage per active system app</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-amber-400" />
          </div>
        </div>
      ) : activeSubView === "battery_usage" ? (
        /* VIEW: BATTERY CONSUMPTION PIE CHART BREAKDOWN */
        <div className="flex-1 overflow-hidden">
          <BatteryConsumptionPieChart
            batteryLevel={batteryLevel}
            isBatterySaver={isBatterySaver}
            performanceMode={performanceMode}
            onOpenApp={onOpenApp}
            onSystemLog={onSystemLog}
            onToggleBatterySaver={onToggleBatterySaver}
          />
        </div>
      ) : activeSubView === "backup_restore" ? (
        /* VIEW: BACKUP & RESTORE */
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Hero Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/40 space-y-2 shadow-xl">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
              <CloudUpload size={16} />
              <span>System Disaster Recovery</span>
            </div>
            <h3 className="text-sm font-extrabold text-white">System Backup & Restore Hub</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Create full snapshots of your OS preferences, notes, emergency contacts, wallpapers, and game records to local storage or Firestore cloud.
            </p>
          </div>

          {/* Backup Action Card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <Database size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Full System Backup</h4>
                  <p className="text-[10px] text-slate-400">Snapshot size: ~14.8 MB</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                READY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  const stateBlob = {
                    osVersion,
                    timestamp: new Date().toISOString(),
                    userSettings: settingsState,
                    notesCount: 8,
                    contactsCount: 2
                  };
                  const element = document.createElement("a");
                  const file = new Blob([JSON.stringify(stateBlob, null, 2)], { type: "application/json" });
                  element.href = URL.createObjectURL(file);
                  element.download = `KK_OS_Backup_${Date.now()}.json`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
              >
                <Download size={14} /> Export File
              </button>

              <button
                onClick={async () => {
                  if (currentUser) {
                    await saveUserPreferences(currentUser.uid, {
                      wallpaperId: currentWallpaperId,
                      brightness,
                      themeConfig,
                      backupTimestamp: new Date().toISOString()
                    });
                    alert("Backup synced to Firestore Cloud successfully!");
                  } else {
                    alert("Please sign in with Google in Settings -> Google Account to enable Cloud Backup.");
                  }
                }}
                className="py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-teal-300 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer active:scale-95 transition-all"
              >
                <CloudUpload size={14} /> Cloud Sync
              </button>
            </div>
          </div>

          {/* Restore Data Card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2.5">
              <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                <CloudDownload size={18} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Restore System Snapshot</h4>
                <p className="text-[10px] text-slate-400">Revert preferences from JSON backup or Firestore</p>
              </div>
            </div>

            <button
              onClick={() => {
                alert("System state restored successfully from latest snapshot!");
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-purple-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-purple-800/60 cursor-pointer shadow active:scale-95 transition-all"
            >
              <RotateCcw size={14} />
              <span>Restore from Snapshot</span>
            </button>
          </div>
        </div>
      ) : activeSubView === "security" ? (
        /* VIEW: BIOMETRICS & SECURITY HUB */
        <div className="flex-1 overflow-hidden relative">
          <AppSecurity isEmbedded={true} />
        </div>
      ) : (
        /* MAIN SETTINGS LIST VIEW */
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Search Bar */}
          <div className="relative mb-2">
            <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search settings..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Settings Items List with Live Search Filtering */}
          <div className="space-y-1.5">
            {(() => {
              const items = [
                {
                  id: "accounts" as const,
                  title: currentUser ? currentUser.displayName || "Google Account" : "Google Sign-In & Sync",
                  badge: currentUser ? "SYNCED" : "SIGN IN",
                  description: currentUser ? "Firestore Backup & Sync Active" : "Connect Google & Sync Firestore",
                  icon: UserCheck,
                  iconBg: "bg-indigo-950 text-indigo-400 border-indigo-800",
                  border: "border-indigo-500/40",
                  bg: "bg-gradient-to-r from-indigo-950/70 to-purple-950/70",
                  keywords: ["google", "account", "sync", "auth", "login", "firestore", "email", "profile", "user"]
                },
                {
                  id: "backup_restore" as const,
                  title: "Backup & Restore",
                  badge: "CLOUD & LOCAL",
                  description: "System snapshot export, local JSON & Firestore restore",
                  icon: CloudUpload,
                  iconBg: "bg-indigo-950 text-indigo-400 border-indigo-800",
                  border: "border-indigo-500/30",
                  bg: "bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30",
                  keywords: ["backup", "restore", "export", "import", "snapshot", "cloud", "data", "save"]
                },
                {
                  id: "security" as const,
                  title: "Biometrics & Security",
                  badge: "FACE ID & PIN",
                  description: "Camera face recognition, PIN code & security status",
                  icon: ScanFace,
                  iconBg: "bg-amber-950 text-amber-400 border-amber-800",
                  border: "border-amber-500/30",
                  bg: "bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20",
                  keywords: ["biometric", "biometrics", "security", "face", "faceid", "pin", "password", "lock", "lockscreen", "camera", "auth"]
                },
                {
                  id: "storage" as const,
                  title: "Storage & Space Breakdown",
                  badge: `${(97.2 - cleanedCacheAmount).toFixed(1)} / 128 GB`,
                  description: `${Math.round(((97.2 - cleanedCacheAmount) / 128) * 100)}% Used • Photos, Apps & System breakdown chart`,
                  icon: HardDrive,
                  iconBg: "bg-purple-950 text-purple-400 border-purple-800",
                  border: "border-purple-500/40",
                  bg: "bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40",
                  keywords: ["storage", "disk", "space", "memory", "photos", "apps", "system", "cache", "clean", "junk", "chart", "nvme", "files", "media"]
                },
                {
                  id: "performance" as const,
                  title: "Performance Mode",
                  badge: performanceMode === "high_performance" ? "HIGH PERF" : "POWER EFFICIENT",
                  description: "Regulate battery drain intervals & CPU clocks",
                  icon: Gauge,
                  iconBg: "bg-amber-950 text-amber-400 border-amber-800",
                  border: "border-amber-500/30",
                  bg: "bg-gradient-to-r from-slate-900 to-amber-950/40",
                  keywords: ["performance", "battery", "power", "cpu", "speed", "mode", "efficient"]
                },
                {
                  id: "battery_usage" as const,
                  title: "Battery Consumption & Usage",
                  badge: `${batteryLevel}% REMAINING`,
                  description: "Pie chart visualization of energy drain per system app & daemons",
                  icon: Battery,
                  iconBg: "bg-amber-950 text-amber-400 border-amber-800",
                  border: "border-amber-500/40",
                  bg: "bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30",
                  keywords: ["battery", "power", "drain", "consumption", "pie", "chart", "energy", "mah", "apps", "usage", "saver", "screen"]
                },
                {
                  id: "sound" as any,
                  title: "Sound, Volume & Haptics",
                  badge: "MULTI-STREAM",
                  description: "Media, Ringtone, Notifications, Alarms & Tactile Vibration Motor",
                  icon: Volume2,
                  iconBg: "bg-cyan-950 text-cyan-400 border-cyan-800",
                  border: "border-cyan-500/30",
                  bg: "bg-gradient-to-r from-slate-900 to-cyan-950/40",
                  keywords: ["sound", "volume", "haptic", "vibrate", "vibration", "ringtone", "media", "alarm", "notification", "audio", "mixer"]
                },
                {
                  id: "display" as const,
                  title: "Display & Clock Format",
                  badge: settingsState.use24Hour ? "24H CLOCK" : "12H CLOCK",
                  description: `Backlight ${brightness}% • Status Bar Clock: ${settingsState.use24Hour ? "24-Hour" : "12-Hour"}`,
                  icon: Sun,
                  iconBg: "bg-amber-950 text-amber-400 border-amber-800",
                  border: "border-slate-850",
                  bg: "bg-slate-900",
                  keywords: ["display", "screen", "brightness", "backlight", "dim", "light", "clock", "time", "12h", "24h", "format", "status bar"]
                },
                {
                  id: "network" as const,
                  title: "Wi-Fi Connectivity",
                  badge: settingsState.wifi ? "KK_5G" : "OFF",
                  description: settingsState.wifi ? "Connected: KK_5G_FastNet (866 Mbps)" : "Disabled",
                  icon: Wifi,
                  iconBg: "bg-teal-950 text-teal-400 border-teal-800",
                  border: "border-slate-850",
                  bg: "bg-slate-900",
                  keywords: ["wifi", "network", "internet", "wireless", "5g", "connectivity"]
                },
                {
                  id: "network" as const,
                  title: "Bluetooth Connectivity",
                  badge: settingsState.bluetooth ? "ACTIVE" : "OFF",
                  description: settingsState.bluetooth
                    ? `${bluetoothDevices.filter((d) => d.connected).length} Devices Connected`
                    : "Bluetooth is disabled",
                  icon: Bluetooth,
                  iconBg: "bg-cyan-950 text-cyan-400 border-cyan-800",
                  border: "border-cyan-500/20",
                  bg: "bg-gradient-to-r from-slate-900 to-cyan-950/30",
                  keywords: ["bluetooth", "audio", "headphones", "earbuds", "buds", "watch", "devices"]
                },
                {
                  id: "wallpaper" as const,
                  title: "Desktop Wallpaper & Patterns",
                  badge: "PRESETS & PATTERNS",
                  description: "Preset gradients, system-generated patterns & custom generator",
                  icon: Palette,
                  iconBg: "bg-purple-950 text-purple-400 border-purple-800",
                  border: "border-purple-500/40",
                  bg: "bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40",
                  keywords: ["wallpaper", "desktop", "gradient", "pattern", "theme", "background", "preset", "custom", "generator", "accent", "style"]
                },
                {
                  id: "ota_update" as const,
                  title: "Over-the-Air (OTA) Update",
                  badge: osVersion.includes("1.2.0") ? "v1.2.0 PATCHED" : "v1.0.0",
                  description: "Simulate firmware flashing & system version patching",
                  icon: Download,
                  iconBg: "bg-teal-950 text-teal-400 border-teal-800",
                  border: "border-teal-500/30",
                  bg: "bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900",
                  keywords: ["ota", "update", "firmware", "patch", "version", "system", "download"]
                },
                {
                  id: "about_phone" as const,
                  title: "About Phone",
                  badge: "ANDROID 14",
                  description: `KK Mobile OS ${osVersion} • Android 14`,
                  icon: Info,
                  iconBg: "bg-indigo-950 text-indigo-400 border-indigo-800",
                  border: "border-slate-850",
                  bg: "bg-slate-900",
                  keywords: ["about", "phone", "device", "specs", "model", "version", "kernel", "build"]
                }
              ];

              const filtered = items.filter((item) => {
                if (!searchTerm.trim()) return true;
                const term = searchTerm.toLowerCase();
                return (
                  item.title.toLowerCase().includes(term) ||
                  item.description.toLowerCase().includes(term) ||
                  item.keywords.some((k) => k.toLowerCase().includes(term))
                );
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-6 text-center space-y-2 bg-slate-900/50 rounded-2xl border border-slate-850">
                    <p className="text-xs font-bold text-slate-400">No settings found matching "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-teal-400 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                );
              }

              return filtered.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => {
                      if (item.id === "sound") {
                        window.dispatchEvent(new CustomEvent("kk_volume_change", { detail: { showHud: true } }));
                        onSystemLog?.("[AppSettings] Opened Floating Volume & Multi-Stream Audio Mixer");
                      } else {
                        setActiveSubView(item.id);
                      }
                    }}
                    className={`w-full p-2.5 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-between hover:border-teal-500/50 transition-colors cursor-pointer text-left`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.id === "accounts" && currentUser?.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 rounded-full border border-indigo-400 object-cover shrink-0"
                        />
                      ) : (
                        <div className={`p-2 rounded-xl border shrink-0 ${item.iconBg}`}>
                          <IconComponent size={16} />
                        </div>
                      )}
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          <span className="text-[8px] font-mono px-1.5 py-0.2 bg-slate-950/80 text-slate-300 border border-slate-700 rounded-md font-bold shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-500 shrink-0 ml-1" />
                  </button>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Storage Manager Utility Modal */}
      <StorageManagerModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        onOpenApp={onOpenApp}
        onSystemLog={onSystemLog}
      />
    </div>
  );
}
