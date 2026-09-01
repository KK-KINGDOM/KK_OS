import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Home,
  ChevronLeft,
  Square,
  Bot,
  Terminal as TerminalIcon,
  HardDrive,
  Settings as SettingsIcon,
  Calculator as CalcIcon,
  Lock,
  Power,
  Moon,
  ChevronDown,
  Sun,
  Shield,
  Clock as ClockIcon,
  Radio,
  Phone as PhoneIcon,
  MessageSquare,
  Camera as CameraIcon,
  ShieldCheck,
  Image as ImageIcon,
  Music as MusicIcon,
  CloudSun,
  Search,
  Grid,
  Mic,
  Sparkles,
  Globe as GlobeIcon,
  Cpu as CpuIcon,
  Zap,
  Bell,
  BellOff,
  Database,
  EyeOff,
  Play,
  Info,
  ZapOff,
  X,
  FileSpreadsheet,
  Presentation,
  FileText,
  Calendar,
  Video,
  Briefcase,
  Cloud,
  RefreshCw,
  CloudCheck,
  Sunset,
  Sunrise,
  Languages,
  Disc,
  BookOpen,
  Edit3,
  Siren,
  QrCode,
  Crown,
  Gamepad2,
  Brain,
  Activity,
  Trash2,
  MicOff,
  Volume2,
  Folder,
  FolderPlus,
  FolderOpen,
  Plus,
  Pencil,
  Move,
  Mail,
  MapPin,
  ShoppingBag,
  Youtube,
  CreditCard,
  GraduationCap
} from "lucide-react";
import StorageManagerModal from "./StorageManagerModal";
import { AppID, LogSeverity, SystemToast } from "../types";
import { WALLPAPERS } from "../mockOSData";
import { getStoredThemeConfig, applyThemeConfig } from "../utils/theme";
import { useDictation } from "../hooks/useDictation";
import ToastNotification from "./ToastNotification";
import OSGestureHandler from "./OSGestureHandler";
import ControlCenterOverlay from "./ControlCenterOverlay";
import NotificationCenterOverlay from "./NotificationCenterOverlay";
import {
  playUnlockSound,
  playAppLaunchSound,
  playChargingSound,
  playClickSound,
  setMuted,
  playVolumeTickSound,
  playVolumeMuteSound,
  playVolumeMaxSound,
  playVibrateHapticTone
} from "../utils/sound";

// Import system apps
import LockScreen from "./LockScreen";
import AppAIAssistant from "./AppAIAssistant";
import AppTerminal from "./AppTerminal";
import AppSettings from "./AppSettings";
import AppCalculator from "./AppCalculator";
import AppFileManager from "./AppFileManager";
import AppPhone from "./AppPhone";
import AppMessages from "./AppMessages";
import AppCamera from "./AppCamera";
import AppSecurity from "./AppSecurity";
import AppGallery from "./AppGallery";
import AppMusic from "./AppMusic";
import AppWeather from "./AppWeather";
import AppClock from "./AppClock";
import AppBrowser from "./AppBrowser";
import AppTaskManager from "./AppTaskManager";
import AppSwitcher from "./AppSwitcher";
import RecentAppsOverlay from "./RecentAppsOverlay";
import GlobalSearchBar from "./GlobalSearchBar";
import HomeScreenWidget from "./HomeScreenWidget";
import DynamicWallpaperCanvas from "./DynamicWallpaperCanvas";
import DynamicWallpaperManager from "./DynamicWallpaperManager";
import LostDeviceBeaconOverlay from "./LostDeviceBeaconOverlay";
import {
  DynamicWallpaperConfig,
  getStoredDynamicConfig,
  addDynamicWallpaperListener,
  addCycleEventListener,
  cycleToNextWallpaper,
  getWallpaperById
} from "../utils/dynamicWallpaperEngine";

// Import Extended Workspace & AI Apps
import AppChatGPT from "./AppChatGPT";
import AppClaude from "./AppClaude";
import AppGemini from "./AppGemini";
import AppGrok from "./AppGrok";
import AppDrive from "./AppDrive";
import AppSheets from "./AppSheets";
import AppSlides from "./AppSlides";
import AppDocs from "./AppDocs";
import AppCalendar from "./AppCalendar";
import AppMeet from "./AppMeet";
import AppLinkedIn from "./AppLinkedIn";

// Import New System Utilities, Media, Learning, Productivity & Security Hubs
import AppTranslator from "./AppTranslator";
import AppVoiceRecorder from "./AppVoiceRecorder";
import AppDictionary from "./AppDictionary";
import AppNotes from "./AppNotes";
import AppPdfReader from "./AppPdfReader";
import AppEmergencySOS from "./AppEmergencySOS";
import AppQrScanner from "./AppQrScanner";
import AppChess from "./AppChess";
import AppPuzzleGame from "./AppPuzzleGame";
import AppBrainTraining from "./AppBrainTraining";
import AppAccMonitor from "./AppAccMonitor";
import AppFMRadio from "./AppFMRadio";
import AppEmail from "./AppEmail";
import AppMaps from "./AppMaps";
import AppPlayStore from "./AppPlayStore";
import AppYouTubeSuite from "./AppYouTubeSuite";
import AppPaymentSuite from "./AppPaymentSuite";
import AppLearningHub from "./AppLearningHub";
import AppWorkSuite from "./AppWorkSuite";
import AppSecurityHub from "./AppSecurityHub";
import BootAnimation, { BootTheme } from "./BootAnimation";
import OSDownloadAnimation from "./OSDownloadAnimation";
import FloatingVolumeSlider, {
  VolumeLevels,
  SoundProfile,
  AudioStreamType,
  AudioOutputDevice
} from "./FloatingVolumeSlider";

export interface HomescreenFolder {
  id: string;
  name: string;
  appIds: AppID[];
  color?: string;
}

interface AppIconButtonProps {
  key?: React.Key;
  app: { id: AppID; name: string; icon: React.ElementType; color: string };
  onOpen: (appId: AppID) => void;
  onLongPress: (app: any) => void;
  cacheMB?: number;
  draggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, appId: AppID) => void;
  onDragOver?: (e: React.DragEvent, appId: AppID) => void;
  onDragLeave?: (e: React.DragEvent, appId: AppID) => void;
  onDrop?: (e: React.DragEvent, targetAppId: AppID) => void;
}

function AppIconButton({
  app,
  onOpen,
  onLongPress,
  cacheMB,
  draggable = true,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}: AppIconButtonProps) {
  const IconComponent = app.icon;
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = React.useRef(false);

  const startPress = () => {
    isLongPressRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress(app);
    }, 600);
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    endPress();
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    onOpen(app.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    endPress();
    onLongPress(app);
  };

  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, app.id)}
      onDragOver={(e) => onDragOver?.(e, app.id)}
      onDragLeave={(e) => onDragLeave?.(e, app.id)}
      onDrop={(e) => onDrop?.(e, app.id)}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={endPress}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      className={`flex flex-col items-center gap-1 text-center cursor-pointer group select-none relative focus:outline-none rounded-2xl p-0.5 transition-all ${
        isDragging
          ? "opacity-40 scale-90"
          : isDragOver
          ? "scale-110"
          : "active:scale-95"
      }`}
      title={`Drag onto another icon to merge into a folder | Tap to open ${app.name}`}
    >
      <div
        className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all relative ${
          isDragOver
            ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-[0_0_20px_rgba(45,212,191,0.9)]"
            : ""
        }`}
      >
        <IconComponent size={20} />
        {cacheMB !== undefined && cacheMB > 300 && (
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 border border-slate-950 animate-pulse"
            title="High cache storage usage"
          />
        )}
        {isDragOver && (
          <div className="absolute inset-0 bg-teal-500/80 rounded-2xl flex items-center justify-center text-[7px] font-black text-slate-950 uppercase tracking-tighter">
            MERGE
          </div>
        )}
      </div>
      <span className="text-[9px] font-bold text-slate-100 drop-shadow-md truncate max-w-full">
        {app.name}
      </span>
    </button>
  );
}

interface FolderIconButtonProps {
  key?: React.Key;
  folder: HomescreenFolder;
  allApps: Array<{ id: AppID; name: string; icon: React.ElementType; color: string }>;
  onOpenFolder: (folderId: string) => void;
  onLongPressFolder?: (folder: HomescreenFolder) => void;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent, folderId: string) => void;
  onDragLeave?: (e: React.DragEvent, folderId: string) => void;
  onDrop?: (e: React.DragEvent, folderId: string) => void;
}

function FolderIconButton({
  folder,
  allApps,
  onOpenFolder,
  onLongPressFolder,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop
}: FolderIconButtonProps) {
  const folderApps = folder.appIds
    .map((id) => allApps.find((a) => a.id === id))
    .filter(Boolean) as Array<{ id: AppID; name: string; icon: React.ElementType; color: string }>;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenFolder(folder.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onLongPressFolder?.(folder);
      }}
      onDragOver={(e) => onDragOver?.(e, folder.id)}
      onDragLeave={(e) => onDragLeave?.(e, folder.id)}
      onDrop={(e) => onDrop?.(e, folder.id)}
      className={`flex flex-col items-center gap-1 text-center cursor-pointer group select-none relative focus:outline-none rounded-2xl p-0.5 transition-all ${
        isDragOver ? "scale-110" : "active:scale-95"
      }`}
      title={`Folder: ${folder.name} (${folderApps.length} apps) • Drag apps here to categorize`}
    >
      <div
        className={`h-11 w-11 rounded-2xl bg-slate-900/80 backdrop-blur-md p-1 border grid grid-cols-2 gap-0.5 shadow-md group-hover:scale-105 transition-all relative overflow-hidden ${
          isDragOver
            ? "border-teal-400 bg-teal-950/80 shadow-[0_0_20px_rgba(45,212,191,0.9)] ring-2 ring-teal-400"
            : "border-white/20 group-hover:border-teal-400/60"
        }`}
      >
        {folderApps.slice(0, 4).map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className={`rounded-md bg-gradient-to-br ${app.color} flex items-center justify-center text-white text-[10px] h-full w-full`}
            >
              <Icon size={10} />
            </div>
          );
        })}
        {folderApps.length < 4 && (
          <div className="rounded-md bg-slate-800/50 border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
            <Plus size={8} />
          </div>
        )}

        {isDragOver && (
          <div className="absolute inset-0 bg-teal-500/80 backdrop-blur-xs flex items-center justify-center">
            <span className="text-[7.5px] font-black text-slate-950 uppercase tracking-tighter">DROP</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 max-w-full">
        <Folder size={10} className="text-teal-400 shrink-0" />
        <span className="text-[9px] font-bold text-slate-100 drop-shadow-md truncate">
          {folder.name}
        </span>
      </div>
    </button>
  );
}

interface PhoneShellProps {
  onSystemLog: (log: string, severity?: LogSeverity) => void;
  toasts?: SystemToast[];
  onDismissToast?: (id: string) => void;
  onClearAllToasts?: () => void;
  onMarkReadToast?: (id: string, isRead?: boolean) => void;
  onMarkAllReadToasts?: () => void;
  onArchiveToast?: (id: string, isArchived?: boolean) => void;
  onArchiveAllToasts?: () => void;
  onReplyToast?: (id: string, replyText: string) => void;
  onSimulateNotification?: (sample: Partial<SystemToast>) => void;
  batteryLevel?: number;
  onBatteryChange?: (newLevel: number) => void;
  isBatterySaver?: boolean;
  onToggleBatterySaver?: (saver: boolean) => void;
  performanceMode?: "high_performance" | "power_efficient";
  onPerformanceModeChange?: (mode: "high_performance" | "power_efficient") => void;
  onActiveAppChange?: (appId: AppID | null) => void;
}

export default function PhoneShell({
  onSystemLog,
  toasts = [],
  onDismissToast = () => {},
  onClearAllToasts,
  onMarkReadToast,
  onMarkAllReadToasts,
  onArchiveToast,
  onArchiveAllToasts,
  onReplyToast,
  onSimulateNotification,
  batteryLevel: externalBatteryLevel,
  onBatteryChange,
  isBatterySaver = false,
  onToggleBatterySaver,
  performanceMode = "power_efficient",
  onPerformanceModeChange,
  onActiveAppChange
}: PhoneShellProps) {
  // Boot state
  const [bootState, setBootState] = useState<"off" | "boot_loader" | "boot_splash" | "boot_anim" | "quantum_boot" | "lockscreen" | "launcher">("lockscreen");
  const [isOsDownloadOpen, setIsOsDownloadOpen] = useState(false);
  const [bootTheme, setBootTheme] = useState<BootTheme>("quantum_neon");
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Initial boot log and theme initialization on mount
  useEffect(() => {
    applyThemeConfig(getStoredThemeConfig());
    onSystemLog("[PowerHAL] Initializing KK OS secure boot daemon...", "INFO");
    onSystemLog("[Kernel] System booted to Lock Screen page.", "INFO");
  }, []);
  
  // Visual Tactile Vibration Feedback State
  const [vibrateTrigger, setVibrateTrigger] = useState(0);
  const [vibrateIntensity, setVibrateIntensity] = useState<"light" | "medium" | "heavy">("light");

  const triggerVibration = (intensity: "light" | "medium" | "heavy" = "light") => {
    setVibrateIntensity(intensity);
    setVibrateTrigger((prev) => prev + 1);
    playClickSound();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        if (intensity === "heavy") navigator.vibrate([30, 20, 30]);
        else if (intensity === "medium") navigator.vibrate(25);
        else navigator.vibrate(15);
      } catch (e) {}
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const clickable = target.closest("button, input[type='checkbox'], input[type='range'], [role='button'], .cursor-pointer");
      if (clickable) {
        triggerVibration("light");
      }
    };

    const handleCustomVibrate = (e: Event) => {
      const customEvent = e as CustomEvent<{ intensity?: "light" | "medium" | "heavy" }>;
      triggerVibration(customEvent.detail?.intensity || "medium");
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("kk_vibrate", handleCustomVibrate);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("kk_vibrate", handleCustomVibrate);
    };
  }, []);

  // UI Panels
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const [isStorageManagerOpen, setIsStorageManagerOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState("");
  const [drawerCategory, setDrawerCategory] = useState<"All" | "AI & Workspace" | "Tools & System" | "Media & Comm" | "Games & Health">("All");
  const [brightness, setBrightness] = useState(85);
  const [settingsSubView, setSettingsSubView] = useState<"list" | "network" | "about_phone" | "themes" | "display" | "accounts" | "performance" | "ota_update" | "security">("list");

  // Floating Volume Control & Multi-Stream State
  const [volumeLevels, setVolumeLevels] = useState<VolumeLevels>({
    media: 75,
    ringtone: 80,
    notification: 70,
    alarm: 85
  });
  const [soundProfile, setSoundProfile] = useState<SoundProfile>("ring");
  const [activeAudioStream, setActiveAudioStream] = useState<AudioStreamType>("media");
  const [audioOutputDevice, setAudioOutputDevice] = useState<AudioOutputDevice>("speaker");
  const [isVolumeHudVisible, setIsVolumeHudVisible] = useState(false);

  // Set stream volume with tactile feedback
  const handleVolumeStreamChange = (stream: AudioStreamType, newLevel: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newLevel)));
    setVolumeLevels((prev) => ({
      ...prev,
      [stream]: clamped
    }));
    if (stream === "media") {
      setMuted(clamped === 0 || soundProfile === "silent");
    }
  };

  // Step volume for active stream (hardware keys / keyboard shortcuts)
  const stepVolume = (delta: number, targetStream?: AudioStreamType) => {
    const stream = targetStream || activeAudioStream;
    const current = volumeLevels[stream];
    const nextVal = Math.max(0, Math.min(100, current + delta));
    handleVolumeStreamChange(stream, nextVal);
    setIsVolumeHudVisible(true);

    if (nextVal === 0) {
      triggerVibration("heavy");
      playVolumeMuteSound();
      showActionToast(`🔇 ${stream.toUpperCase()} Muted`);
      onSystemLog(`[AudioHAL] Hardware Volume Down -> ${stream} 0% (Muted)`, "INFO");
    } else if (nextVal === 100) {
      triggerVibration("medium");
      playVolumeMaxSound();
      showActionToast(`🔊 ${stream.toUpperCase()} Max Volume (100%)`);
      onSystemLog(`[AudioHAL] Hardware Volume Up -> ${stream} 100% (Safety threshold reached)`, "WARNING");
    } else {
      triggerVibration("light");
      playVolumeTickSound(nextVal);
      onSystemLog(`[AudioHAL] Hardware Volume ${delta > 0 ? 'Up' : 'Down'} -> ${stream} ${nextVal}%`, "INFO");
    }
  };

  const toggleSoundProfile = () => {
    let nextProfile: SoundProfile = "ring";
    if (soundProfile === "ring") nextProfile = "vibrate";
    else if (soundProfile === "vibrate") nextProfile = "silent";
    else nextProfile = "ring";

    setSoundProfile(nextProfile);
    setIsVolumeHudVisible(true);

    if (nextProfile === "vibrate") {
      triggerVibration("heavy");
      playVibrateHapticTone();
      showActionToast("📳 Alert Slider: Vibrate Mode");
      onSystemLog("[AudioHAL] Alert Slider switched to VIBRATE (Haptic motor active)", "INFO");
    } else if (nextProfile === "silent") {
      triggerVibration("medium");
      playVolumeMuteSound();
      showActionToast("🔇 Alert Slider: Silent Mode");
      onSystemLog("[AudioHAL] Alert Slider switched to SILENT (DND enabled)", "INFO");
    } else {
      triggerVibration("light");
      playClickSound();
      showActionToast("🔔 Alert Slider: Ring Mode");
      onSystemLog("[AudioHAL] Alert Slider switched to RING", "INFO");
    }
  };

  // Keyboard Shortcuts & Custom Event Handlers for Volume HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      if ((e.key === "]" && !isInput) || (e.altKey && (e.key === "ArrowUp" || e.key === "+"))) {
        e.preventDefault();
        stepVolume(5);
      } else if ((e.key === "[" && !isInput) || (e.altKey && (e.key === "ArrowDown" || e.key === "-"))) {
        e.preventDefault();
        stepVolume(-5);
      } else if (e.altKey && (e.key === "m" || e.key === "M")) {
        e.preventDefault();
        toggleSoundProfile();
      } else if (e.key === "v" && !isInput && e.altKey) {
        e.preventDefault();
        setIsVolumeHudVisible((prev) => !prev);
      }
    };

    const handleCustomVolumeEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ stream?: AudioStreamType; level?: number; delta?: number; showHud?: boolean }>).detail;
      if (!detail) return;
      if (detail.stream) {
        setActiveAudioStream(detail.stream);
      }
      if (detail.level !== undefined) {
        handleVolumeStreamChange(detail.stream || "media", detail.level);
      } else if (detail.delta !== undefined) {
        stepVolume(detail.delta, detail.stream);
      }
      if (detail.showHud !== false) {
        setIsVolumeHudVisible(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("kk_volume_change", handleCustomVolumeEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("kk_volume_change", handleCustomVolumeEvent);
    };
  }, [activeAudioStream, volumeLevels, soundProfile]);

  // Homescreen Grid & Folder Categorization State
  const [homescreenAppIds, setHomescreenAppIds] = useState<AppID[]>([
    AppID.DRIVE,
    AppID.DOCS,
    AppID.CAMERA,
    AppID.SETTINGS,
    AppID.GALLERY,
    AppID.MUSIC
  ]);

  const [folders, setFolders] = useState<HomescreenFolder[]>([
    {
      id: "folder-ai-suite",
      name: "AI Suite",
      appIds: [AppID.CHATGPT, AppID.CLAUDE, AppID.GEMINI]
    }
  ]);

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [editingFolderNameId, setEditingFolderNameId] = useState<string | null>(null);
  const [newFolderNameInput, setNewFolderNameInput] = useState("");

  // Drag & Drop State for Homescreen Icons
  const [draggedAppId, setDraggedAppId] = useState<AppID | null>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);

  const handleDragStartApp = (e: React.DragEvent, appId: AppID) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData("text/app-id", appId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverItem = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragTargetId !== targetId) {
      setDragTargetId(targetId);
    }
  };

  const handleDragLeaveItem = (e: React.DragEvent, targetId: string) => {
    if (dragTargetId === targetId) {
      setDragTargetId(null);
    }
  };

  const handleDropOnApp = (e: React.DragEvent, targetAppId: AppID) => {
    e.preventDefault();
    setDragTargetId(null);
    const sourceId = draggedAppId || (e.dataTransfer.getData("text/app-id") as AppID);
    if (!sourceId || sourceId === targetAppId) {
      setDraggedAppId(null);
      return;
    }

    const sourceApp = allApps.find((a) => a.id === sourceId);
    const targetApp = allApps.find((a) => a.id === targetAppId);

    let folderName = "New Folder";
    if (sourceApp && targetApp && sourceApp.category === targetApp.category) {
      folderName = sourceApp.category;
    } else if (sourceApp && targetApp) {
      folderName = `${sourceApp.name} & ${targetApp.name}`;
    }

    const newFolder: HomescreenFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      appIds: [targetAppId, sourceId]
    };

    setFolders((prev) => [...prev, newFolder]);
    setHomescreenAppIds((prev) => prev.filter((id) => id !== sourceId && id !== targetAppId));
    setDraggedAppId(null);

    playClickSound();
    triggerVibration("heavy");
    showActionToast(`📁 Created "${folderName}" folder with ${sourceApp?.name || sourceId} & ${targetApp?.name || targetAppId}!`);
    onSystemLog(`[Launcher] Created homescreen folder "${folderName}" containing [${targetAppId}, ${sourceId}]`, "INFO");
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragTargetId(null);
    const sourceId = draggedAppId || (e.dataTransfer.getData("text/app-id") as AppID);
    if (!sourceId) {
      setDraggedAppId(null);
      return;
    }

    const sourceApp = allApps.find((a) => a.id === sourceId);
    const targetFolder = folders.find((f) => f.id === folderId);

    setFolders((prev) =>
      prev.map((f) => {
        if (f.id === folderId) {
          if (f.appIds.includes(sourceId)) return f;
          return { ...f, appIds: [...f.appIds, sourceId] };
        }
        return f;
      })
    );

    setHomescreenAppIds((prev) => prev.filter((id) => id !== sourceId));
    setDraggedAppId(null);

    playClickSound();
    triggerVibration("medium");
    showActionToast(`📁 Added ${sourceApp?.name || sourceId} to "${targetFolder?.name || 'Folder'}"!`);
    onSystemLog(`[Launcher] Moved app [${sourceId}] into folder "${targetFolder?.name}"`, "INFO");
  };

  const handleAutoOrganizeFolders = () => {
    const categories: Record<string, AppID[]> = {
      "AI & Workspace": [],
      "Tools & System": [],
      "Media & Comm": [],
      "Games & Health": []
    };

    allApps.forEach((app) => {
      if (categories[app.category]) {
        categories[app.category].push(app.id);
      }
    });

    const newFolders: HomescreenFolder[] = Object.entries(categories).map(([catName, ids], index) => ({
      id: `folder-auto-${index}`,
      name: catName,
      appIds: ids.slice(0, 6)
    }));

    setFolders(newFolders);
    setHomescreenAppIds([]);
    playClickSound();
    triggerVibration("heavy");
    showActionToast("✨ Auto-organized installed apps into 4 categorized folders!");
    onSystemLog("[Launcher] Auto-grouped all installed apps into 4 categorized homescreen folders", "INFO");
  };

  const handleRemoveAppFromFolder = (folderId: string, appId: AppID) => {
    setFolders((prev) =>
      prev
        .map((f) => {
          if (f.id === folderId) {
            const updated = f.appIds.filter((id) => id !== appId);
            return { ...f, appIds: updated };
          }
          return f;
        })
        .filter((f) => f.appIds.length > 0)
    );

    setHomescreenAppIds((prev) => (prev.includes(appId) ? prev : [...prev, appId]));
    playClickSound();
    triggerVibration("light");
    const app = allApps.find((a) => a.id === appId);
    showActionToast(`Unfolded ${app?.name || appId} back to main homescreen grid.`);
  };

  const handleDissolveFolder = (folderId: string) => {
    const targetFolder = folders.find((f) => f.id === folderId);
    if (!targetFolder) return;

    setHomescreenAppIds((prev) => Array.from(new Set([...prev, ...targetFolder.appIds])));
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setActiveFolderId(null);

    playClickSound();
    triggerVibration("medium");
    showActionToast(`Dissolved "${targetFolder.name}" folder and restored apps to homescreen.`);
  };

  // Dictation for App Launcher Global Search Bar
  const {
    isListening: isDrawerDictating,
    interimTranscript: drawerDictationInterim,
    micVolume: drawerMicVolume,
    toggleListening: toggleDrawerDictation,
    stopListening: stopDrawerDictation
  } = useDictation({
    onTranscriptChange: (text) => {
      setDrawerSearch(text.trim());
    }
  });

  // Long-press handling for Bluetooth Quick Settings tile
  const [btLongPressTimer, setBtLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const isBtLongPressRef = React.useRef(false);

  const handleBtPointerDown = () => {
    isBtLongPressRef.current = false;
    const timer = setTimeout(() => {
      isBtLongPressRef.current = true;
      setSettingsSubView("network");
      setQuickSettingsOpen(false);
      playAppLaunchSound();
      setActiveApp(AppID.SETTINGS);
      setRecentApps((prev) => [AppID.SETTINGS, ...prev.filter((id) => id !== AppID.SETTINGS)]);
      onSystemLog("[QuickSettings] Long-press detected on Bluetooth tile -> Opening Bluetooth Manager");
    }, 500);
    setBtLongPressTimer(timer);
  };

  const handleBtPointerUp = () => {
    if (btLongPressTimer) {
      clearTimeout(btLongPressTimer);
      setBtLongPressTimer(null);
    }
    if (!isBtLongPressRef.current) {
      // Short click: Toggle Bluetooth service
      handleSettingsStateChange("bluetooth", !settingsState.bluetooth);
    }
    isBtLongPressRef.current = false;
  };

  const handleBtPointerCancel = () => {
    if (btLongPressTimer) {
      clearTimeout(btLongPressTimer);
      setBtLongPressTimer(null);
    }
    isBtLongPressRef.current = false;
  };

  // Active App & Recents Stack
  const [activeApp, setActiveApp] = useState<AppID | null>(null);
  const [recentApps, setRecentApps] = useState<AppID[]>([
    AppID.TASK_MANAGER,
    AppID.AI_ASSISTANT,
    AppID.SETTINGS,
    AppID.BROWSER
  ]);

  // Cloud Sync Status State & Automation for Data-Heavy Apps
  const [cloudSyncState, setCloudSyncState] = useState<{
    isSyncing: boolean;
    appName: string;
    filesSynced: number;
    lastSynced: string;
  }>({
    isSyncing: false,
    appName: "",
    filesSynced: 42,
    lastSynced: "Just now"
  });

  useEffect(() => {
    const dataHeavyAppNames: Record<string, string> = {
      [AppID.DRIVE]: "Google Drive",
      [AppID.CALENDAR]: "Google Calendar",
      [AppID.SHEETS]: "Google Sheets",
      [AppID.SLIDES]: "Google Slides",
      [AppID.DOCS]: "Google Docs",
      [AppID.MEET]: "Google Meet",
      [AppID.CHATGPT]: "ChatGPT",
      [AppID.CLAUDE]: "Claude AI",
      [AppID.GEMINI]: "Gemini AI",
      [AppID.GROK]: "Grok AI",
      [AppID.LINKEDIN]: "LinkedIn",
      [AppID.BROWSER]: "Google Search"
    };

    if (activeApp && dataHeavyAppNames[activeApp]) {
      const appName = dataHeavyAppNames[activeApp];
      setCloudSyncState({
        isSyncing: true,
        appName,
        filesSynced: Math.floor(Math.random() * 15) + 18,
        lastSynced: "Syncing..."
      });

      onSystemLog(`[CloudSyncDaemon] Cloud sync triggered for ${appName}...`, "INFO");

      const timer = setTimeout(() => {
        setCloudSyncState({
          isSyncing: false,
          appName,
          filesSynced: Math.floor(Math.random() * 20) + 30,
          lastSynced: "Just now"
        });
        onSystemLog(`[CloudSyncDaemon] Storage synchronized for ${appName}. 0 pending items.`, "INFO");
      }, 2400);

      return () => clearTimeout(timer);
    } else {
      setCloudSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        appName: ""
      }));
    }
  }, [activeApp]);

  // Touch Gesture tracking for App Switcher swipe
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Multi-Touch Pinch-to-Zoom Gesture State
  const [pinchScale, setPinchScale] = useState(1.0);
  const [isPinching, setIsPinching] = useState(false);
  const [simulatedPinch, setSimulatedPinch] = useState(false);
  const initialPinchDistRef = React.useRef<number | null>(null);

  const handleMultiTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      initialPinchDistRef.current = dist;
      setIsPinching(true);
      triggerVibration("light");
    }
  };

  const handleMultiTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = currentDist / initialPinchDistRef.current;
      const clampedRatio = Math.max(0.55, Math.min(1.25, ratio));
      setPinchScale(clampedRatio);

      // Pinch-In trigger threshold (< 0.8x zoom)
      if (clampedRatio < 0.8 && !appSwitcherOpen) {
        setAppSwitcherOpen(true);
        triggerVibration("heavy");
        onSystemLog("[ActivityManager] Gesture: Multi-Touch Pinch-In detected -> Shrinking windows into Grid Overview.");
      }
    }
  };

  const handleMultiTouchEnd = () => {
    setIsPinching(false);
    setPinchScale(1.0);
    initialPinchDistRef.current = null;
  };

  // Simulated Pinch Gesture for single pointer/mouse users
  const triggerSimulatedPinchGesture = () => {
    if (simulatedPinch) return;
    setSimulatedPinch(true);
    triggerVibration("medium");
    onSystemLog("[ActivityManager] Gesture: Simulated Multi-Touch Pinch-to-Zoom triggered -> Grid Overview.");

    let current = 1.0;
    const interval = setInterval(() => {
      current -= 0.05;
      if (current <= 0.65) {
        clearInterval(interval);
        setPinchScale(0.65);
        setAppSwitcherOpen(true);
        setTimeout(() => {
          setSimulatedPinch(false);
          setPinchScale(1.0);
        }, 300);
      } else {
        setPinchScale(current);
      }
    }, 25);
  };

  const handleWheelPinch = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY > 0 && !appSwitcherOpen) {
        triggerSimulatedPinchGesture();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setTouchStartY(clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartY === null) return;
    const clientY = "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = touchStartY - clientY;

    // Swiped UP > 35px from bottom -> open App Switcher
    if (deltaY > 35) {
      setAppSwitcherOpen(true);
      onSystemLog("[ActivityManager] Gesture: Swiped Up -> App Switcher triggered.");
    } else if (deltaY < -35 && appSwitcherOpen) {
      setAppSwitcherOpen(false);
    }
    setTouchStartY(null);
  };

  // Notify parent of active app change
  useEffect(() => {
    if (onActiveAppChange) {
      onActiveAppChange(activeApp);
    }
  }, [activeApp, onActiveAppChange]);

  // System State
  const [currentWallpaperId, setCurrentWallpaperId] = useState<string>(() => {
    try {
      return localStorage.getItem("kk_os_wallpaper") || "cosmic_slate";
    } catch (e) {
      return "cosmic_slate";
    }
  });
  const [isWallpaperManagerOpen, setIsWallpaperManagerOpen] = useState(false);
  const [dynamicWpConfig, setDynamicWpConfig] = useState<DynamicWallpaperConfig>(() => getStoredDynamicConfig());

  // Listen for dynamic wallpaper config updates and auto-cycle events
  useEffect(() => {
    const unsubConfig = addDynamicWallpaperListener((newConfig) => {
      setDynamicWpConfig(newConfig);
    });

    const unsubCycle = addCycleEventListener((detail) => {
      setCurrentWallpaperId((prevId) => {
        const nextId = cycleToNextWallpaper(prevId, detail?.direction || "next");
        try {
          localStorage.setItem("kk_os_wallpaper", nextId);
        } catch (e) {}
        const wp = getWallpaperById(nextId);
        if (wp) {
          onSystemLog?.(`[DynamicWallpaper] Auto-cycled wallpaper to: ${wp.name}`, "INFO");
        }
        return nextId;
      });
    });

    return () => {
      unsubConfig();
      unsubCycle();
    };
  }, [onSystemLog]);

  const handleCycleWallpaper = () => {
    const nextId = cycleToNextWallpaper(currentWallpaperId);
    setCurrentWallpaperId(nextId);
    try {
      localStorage.setItem("kk_os_wallpaper", nextId);
    } catch (e) {}
    const wp = getWallpaperById(nextId);
    triggerVibration("light");
    showActionToast(`🎨 Switched wallpaper: ${wp?.name || nextId}`);
    onSystemLog(`[DynamicWallpaper] Manually cycled to: ${wp?.name || nextId}`, "INFO");
  };

  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [internalBatteryLevel, setInternalBatteryLevel] = useState(82);
  const batteryLevel = externalBatteryLevel !== undefined ? externalBatteryLevel : internalBatteryLevel;
  const [ramUsed, setRamUsed] = useState(3840);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [signalBars, setSignalBars] = useState<number>(4);

  // Real-time cellular signal strength fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate between 3 and 4 bars in real time based on radio reception
      const bars = Math.random() > 0.15 ? 4 : 3;
      setSignalBars(bars);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // System-Wide Dark Mode & Sunset/Sunrise Warm Light Scheduler State
  const [darkModeScheduler, setDarkModeScheduler] = useState<{
    enabled: boolean;
    mode: "sunset" | "schedule" | "always";
    warmIntensity: number; // 20 - 100
    customStartHour: number; // 19 (7 PM)
    customEndHour: number; // 6 (6 AM)
    isWarmActive: boolean;
    simulatedHour: number | null; // null = use real time, number = test hour
  }>({
    enabled: true,
    mode: "sunset",
    warmIntensity: 55,
    customStartHour: 19,
    customEndHour: 6,
    isWarmActive: true,
    simulatedHour: null
  });

  // Calculate warm light shift based on sunset/sunrise timer or schedule
  useEffect(() => {
    if (!darkModeScheduler.enabled) {
      if (darkModeScheduler.isWarmActive) {
        setDarkModeScheduler((prev) => ({ ...prev, isWarmActive: false }));
        onSystemLog("[DarkModeScheduler] Low-blue light filter disabled.", "INFO");
      }
      return;
    }

    if (darkModeScheduler.mode === "always") {
      if (!darkModeScheduler.isWarmActive) {
        setDarkModeScheduler((prev) => ({ ...prev, isWarmActive: true }));
        onSystemLog("[DarkModeScheduler] Warm low-blue filter forced ALWAYS ON.", "INFO");
      }
      return;
    }

    // Determine hour from simulated hour or current system clock
    let hour = darkModeScheduler.simulatedHour;
    if (hour === null) {
      if (currentTime) {
        const parts = currentTime.split(":");
        hour = parseInt(parts[0], 10);
      } else {
        hour = new Date().getHours();
      }
    }

    const start = darkModeScheduler.mode === "schedule" ? darkModeScheduler.customStartHour : 19; // Sunset 19:00 (7 PM)
    const end = darkModeScheduler.mode === "schedule" ? darkModeScheduler.customEndHour : 6;     // Sunrise 06:00 (6 AM)

    let shouldBeWarm = false;
    if (start > end) {
      // Crosses midnight, e.g. 19:00 to 06:00
      shouldBeWarm = hour >= start || hour < end;
    } else {
      shouldBeWarm = hour >= start && hour < end;
    }

    if (shouldBeWarm !== darkModeScheduler.isWarmActive) {
      setDarkModeScheduler((prev) => ({ ...prev, isWarmActive: shouldBeWarm }));
      onSystemLog(
        `[DarkModeScheduler] Palette shifted to ${
          shouldBeWarm ? "Warm Low-Blue Night Mode (Sunset)" : "Neutral Day Palette (Sunrise)"
        } at ${hour}:00.`,
        "INFO"
      );
    }
  }, [
    currentTime,
    darkModeScheduler.enabled,
    darkModeScheduler.mode,
    darkModeScheduler.customStartHour,
    darkModeScheduler.customEndHour,
    darkModeScheduler.simulatedHour
  ]);

  // Battery Charging Animation & Plugged State
  const [isCharging, setIsCharging] = useState(false);
  const [isChargingAnim, setIsChargingAnim] = useState(false);
  const isChargingActive = isCharging || isChargingAnim;
  const prevBatteryRef = React.useRef<number>(batteryLevel);

  useEffect(() => {
    if (batteryLevel > prevBatteryRef.current) {
      setIsChargingAnim(true);
      playChargingSound();
      onSystemLog(`[PowerHAL] Charger Connected / Power Delivery Active. Battery: ${batteryLevel}%`, "INFO");
      const timer = setTimeout(() => {
        setIsChargingAnim(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
    prevBatteryRef.current = batteryLevel;
  }, [batteryLevel, onSystemLog]);

  // Periodic battery charge increment when persistent charger is connected
  useEffect(() => {
    if (!isCharging) return;
    const interval = setInterval(() => {
      if (batteryLevel < 100) {
        onBatteryChange?.(Math.min(100, batteryLevel + 1));
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isCharging, batteryLevel, onBatteryChange]);

  const [settingsState, setSettingsState] = useState(() => {
    let saved24Hour = false;
    try {
      saved24Hour = localStorage.getItem("kk_os_use_24hour") === "true";
    } catch (e) {}
    return {
      wifi: true,
      bluetooth: true,
      mobileData: true,
      airplaneMode: false,
      selinuxEnforcing: true,
      sandboxEnabled: true,
      dnd: false,
      use24Hour: saved24Hour
    };
  });

  // Time updater (12h vs 24h)
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      if (settingsState.use24Hour) {
        setCurrentTime(
          date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
        );
      } else {
        setCurrentTime(
          date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
        );
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [settingsState.use24Hour]);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSettingsStateChange = (key: string, value: boolean) => {
    setSettingsState((prev) => ({ ...prev, [key]: value }));
    let severity: LogSeverity = "INFO";
    let message = `[PowerHAL] State changed: ${key} = ${value ? "ENABLED" : "DISABLED"}`;

    if (key === "use24Hour") {
      try {
        localStorage.setItem("kk_os_use_24hour", String(value));
      } catch (e) {}
      severity = "INFO";
      message = `[ClockDaemon] Status Bar Clock format updated to ${value ? "24-Hour" : "12-Hour"} mode with real-time sync.`;
    } else if (key === "dnd") {
      setMuted(value);
      severity = "INFO";
      message = `[SystemSettings] Do Not Disturb mode ${value ? "ENABLED (System sounds muted & non-essential notifications hidden)" : "DISABLED"}`;
    } else if (key === "selinuxEnforcing" && !value) {
      severity = "WARNING";
      message = `[SecurityFramework] [WARNING] SELinux Enforcing state disabled!`;
    } else if (key === "sandboxEnabled" && !value) {
      severity = "CRITICAL";
      message = `[SecurityFramework] [CRITICAL] Application process sandboxing disabled!`;
    }

    onSystemLog(message, severity);
  };

  const startBootCycle = (useQuantumAnim = true) => {
    if (useQuantumAnim) {
      onSystemLog("[PowerHAL] Initializing Quantum Core bootloader with synthesized chimes...", "INFO");
      setBootState("quantum_boot");
    } else {
      onSystemLog("[PowerHAL] Initializing cold boot cycle...");
      setBootState("boot_loader");
      setTimeout(() => setBootState("boot_splash"), 1000);
      setTimeout(() => setBootState("boot_anim"), 2200);
      setTimeout(() => setBootState("lockscreen"), 3800);
    }
  };

  const triggerQuantumBoot = (theme: BootTheme = "quantum_neon") => {
    setBootTheme(theme);
    setActiveApp(null);
    setBootState("off");
    onSystemLog(`[PowerHAL] Rebooting with Quantum Boot Engine [Theme: ${theme}]`, "INFO");
    setTimeout(() => {
      setBootState("quantum_boot");
    }, 450);
  };

  const triggerReboot = () => {
    onSystemLog("[PowerHAL] Soft reboot triggered.");
    setActiveApp(null);
    setBootState("off");
    setTimeout(() => startBootCycle(true), 500);
  };

  const triggerPowerOff = () => {
    onSystemLog("[PowerHAL] Shutdown sequence complete.");
    setActiveApp(null);
    setBootState("off");
  };

  const activeWallpaper = getWallpaperById(currentWallpaperId) || WALLPAPERS[0];

  // System Apps Registry for Launcher & Drawer
  const allApps = [
    // 1. Phone & Media & Comm
    { id: AppID.PHONE, name: "Phone", icon: PhoneIcon, color: "from-emerald-500 to-teal-600", category: "Media & Comm", description: "Voice Calls & Contact Dialer" },
    { id: AppID.CONTACTS, name: "Contacts", icon: PhoneIcon, color: "from-teal-600 to-emerald-700", category: "Media & Comm", description: "Address Book, Caller ID & Speed Dial" },
    { id: AppID.MESSAGES, name: "Messages", icon: MessageSquare, color: "from-teal-500 to-cyan-600", category: "Media & Comm", description: "SMS, RCS & Rich Chat Messaging" },
    { id: AppID.CAMERA, name: "Camera", icon: CameraIcon, color: "from-slate-700 to-slate-900", category: "Media & Comm", description: "4K Camera, Night Sight & Video Recorder" },
    { id: AppID.GALLERY, name: "Gallery / Photos", icon: ImageIcon, color: "from-cyan-600 to-teal-700", category: "Media & Comm", description: "Photos, Albums & Media Editor" },
    { id: AppID.VOICE_RECORDER, name: "Recorder", icon: Disc, color: "from-rose-600 to-red-800", category: "Media & Comm", description: "HD Voice & Audio Recorder with Waveform" },
    { id: AppID.FM_RADIO, name: "FM Radio", icon: Radio, color: "from-amber-600 to-rose-700", category: "Media & Comm", description: "Analog FM Tuner & Live Radio Stations" },
    { id: AppID.EMAIL, name: "Email", icon: Mail, color: "from-rose-500 to-red-700", category: "Media & Comm", description: "Unified POP3/IMAP Mailbox Client" },
    { id: AppID.GMAIL, name: "Gmail", icon: Mail, color: "from-red-600 via-rose-500 to-amber-500", category: "Media & Comm", description: "Google Mail with AI Priority Inbox" },
    { id: AppID.SKYPE, name: "Skype", icon: Video, color: "from-sky-500 to-blue-600", category: "Media & Comm", description: "Instant Messaging & HD Video Calling" },
    { id: AppID.ZOOM, name: "Zoom", icon: Video, color: "from-blue-500 to-indigo-600", category: "Media & Comm", description: "Enterprise Video Meetings & Webinars" },
    { id: AppID.MEET, name: "Google Meet", icon: Video, color: "from-teal-500 to-emerald-600", category: "Media & Comm", description: "Google Video Calling & Group Meetings" },
    { id: AppID.YOUTUBE, name: "YouTube", icon: Youtube, color: "from-red-600 to-rose-700", category: "Media & Comm", description: "Video Streaming, 4K Clips & Channels" },
    { id: AppID.YOUTUBE_MUSIC, name: "YouTube Music", icon: MusicIcon, color: "from-red-600 to-orange-600", category: "Media & Comm", description: "Music Streaming, Playlists & Charts" },
    { id: AppID.MUSIC, name: "Music Player", icon: MusicIcon, color: "from-rose-500 to-purple-600", category: "Media & Comm", description: "Local Audio Player & Equalizer" },

    // 2. System & Tools
    { id: AppID.SETTINGS, name: "Settings", icon: SettingsIcon, color: "from-slate-800 to-slate-950 border border-slate-700", category: "Tools & System", description: "OS Preferences, Display, Battery & OTA" },
    { id: AppID.FILE_MANAGER, name: "File Manager", icon: HardDrive, color: "from-indigo-500 to-blue-600", category: "Tools & System", description: "Local Filesystem & Storage Explorer" },
    { id: AppID.DOWNLOADS, name: "Downloads", icon: HardDrive, color: "from-blue-600 to-indigo-700", category: "Tools & System", description: "Downloaded Files, APK Packages & Media" },
    { id: AppID.CLOCK, name: "Clock", icon: ClockIcon, color: "from-amber-600 to-yellow-600", category: "Tools & System", description: "Alarms, Timer, Stopwatch & World Clock" },
    { id: AppID.CALCULATOR, name: "Calculator", icon: CalcIcon, color: "from-orange-500 to-amber-600", category: "Tools & System", description: "Scientific & Mathematical Calculator" },
    { id: AppID.WEATHER, name: "Weather", icon: CloudSun, color: "from-amber-500 to-orange-600", category: "Tools & System", description: "Live Forecast, Doppler Radar & Temp" },
    { id: AppID.BROWSER, name: "Browser", icon: GlobeIcon, color: "from-blue-600 via-red-500 to-yellow-500 text-white", category: "Tools & System", description: "Google Search & Web Browser" },
    { id: AppID.CHROME, name: "Chrome", icon: GlobeIcon, color: "from-red-500 via-yellow-500 to-green-600", category: "Tools & System", description: "Google Chrome Fast & Secure Browser" },
    { id: AppID.MAPS, name: "Maps", icon: MapPin, color: "from-emerald-500 via-teal-600 to-blue-600", category: "Tools & System", description: "GPS Navigation, Live Traffic & 3D Places" },
    { id: AppID.PLAY_STORE, name: "Play Store", icon: ShoppingBag, color: "from-cyan-500 via-blue-600 to-emerald-500", category: "Tools & System", description: "App Marketplace, Updates & Top Charts" },
    { id: AppID.GOOGLE_PLAY_SERVICES, name: "Google Play Services", icon: CpuIcon, color: "from-slate-700 to-slate-900", category: "Tools & System", description: "Google Android Core Framework & Sync" },
    { id: AppID.TASK_MANAGER, name: "Task Manager", icon: CpuIcon, color: "from-cyan-600 to-blue-700", category: "Tools & System", description: "Process Monitor, RAM & Battery Telemetry" },
    { id: AppID.TERMINAL, name: "Terminal", icon: TerminalIcon, color: "from-slate-900 to-black border border-emerald-800 text-emerald-400", category: "Tools & System", description: "Linux Root Shell Console" },
    { id: AppID.TRANSLATOR, name: "Translator", icon: Languages, color: "from-blue-600 to-cyan-700", category: "Tools & System", description: "Multi-Language Text & Voice Translator" },
    { id: AppID.DICTIONARY, name: "Dictionary", icon: BookOpen, color: "from-indigo-600 to-purple-800", category: "Tools & System", description: "Word Definition, Etymology & Thesaurus" },
    { id: AppID.QR_SCANNER, name: "QR Scanner", icon: QrCode, color: "from-cyan-600 to-teal-800", category: "Tools & System", description: "Camera QR & Barcode Scanner" },
    { id: AppID.EMERGENCY_SOS, name: "Emergency SOS", icon: Siren, color: "from-red-600 to-rose-900", category: "Tools & System", description: "Emergency Beacon, Siren & SOS Dialer" },
    { id: AppID.ACC_MONITOR, name: "ACC Monitor", icon: Activity, color: "from-cyan-600 via-teal-600 to-emerald-700", category: "Tools & System", description: "Hardware & Battery Power Telemetry" },

    // 3. Finance & Payment Suite
    { id: AppID.GPAY, name: "Google Pay", icon: CreditCard, color: "from-blue-500 via-emerald-500 to-amber-500", category: "Finance & Pay", description: "UPI Payments, Tap & Pay and Rewards" },
    { id: AppID.PHONEPE, name: "PhonePe", icon: CreditCard, color: "from-purple-600 to-indigo-700", category: "Finance & Pay", description: "UPI Money Transfer, Recharges & Bills" },
    { id: AppID.PAYTM, name: "Paytm", icon: CreditCard, color: "from-sky-600 to-blue-800", category: "Finance & Pay", description: "Digital Wallet, UPI & Soundbox Pay" },
    { id: AppID.BHIM, name: "BHIM UPI", icon: CreditCard, color: "from-emerald-600 to-teal-800", category: "Finance & Pay", description: "NPCI National UPI Payment Gateway" },

    // 4. Learning & Education
    { id: AppID.GOOGLE_CLASSROOM, name: "Google Classroom", icon: GraduationCap, color: "from-emerald-600 to-teal-700", category: "Learning & Edu", description: "School Assignments, Classes & Grades" },
    { id: AppID.COURSERA, name: "Coursera", icon: GraduationCap, color: "from-blue-600 to-indigo-800", category: "Learning & Edu", description: "University Online Courses & Degrees" },
    { id: AppID.UDEMY, name: "Udemy", icon: GraduationCap, color: "from-purple-600 to-pink-700", category: "Learning & Edu", description: "Coding, Business & Design Video Courses" },
    { id: AppID.DUOLINGO, name: "Duolingo", icon: Sparkles, color: "from-green-500 to-emerald-600", category: "Learning & Edu", description: "Gamified Language Learning & Daily Streaks" },

    // 5. Productivity & AI Workspace
    { id: AppID.AI_ASSISTANT, name: "KK AI Assistant", icon: Sparkles, color: "from-cyan-500 to-blue-600", category: "AI & Workspace", description: "KK OS Multimodal AI Copilot" },
    { id: AppID.CHATGPT, name: "ChatGPT", icon: Bot, color: "from-emerald-600 to-teal-800", category: "AI & Workspace", description: "OpenAI ChatGPT Conversational Intelligence" },
    { id: AppID.CLAUDE, name: "Claude", icon: Sparkles, color: "from-amber-600 to-rose-700", category: "AI & Workspace", description: "Anthropic Claude AI Reasoning" },
    { id: AppID.GEMINI, name: "Gemini", icon: Sparkles, color: "from-blue-600 via-indigo-600 to-purple-600", category: "AI & Workspace", description: "Google Gemini Multimodal AI" },
    { id: AppID.GROK, name: "Grok", icon: Radio, color: "from-slate-800 via-orange-600 to-black border border-orange-500/30", category: "AI & Workspace", description: "xAI Realtime Intelligence" },
    { id: AppID.NOTES, name: "Notes", icon: Edit3, color: "from-amber-500 to-yellow-600", category: "AI & Workspace", description: "Quick Scratchpad & Text Notes" },
    { id: AppID.KEEP, name: "Google Keep", icon: Edit3, color: "from-amber-500 to-yellow-600", category: "AI & Workspace", description: "Sticky Color Notes & Checklists" },
    { id: AppID.CALENDAR, name: "Calendar", icon: Calendar, color: "from-blue-500 to-cyan-600", category: "AI & Workspace", description: "Google Calendar & Schedules" },
    { id: AppID.DRIVE, name: "Google Drive", icon: HardDrive, color: "from-blue-500 via-emerald-500 to-amber-500", category: "AI & Workspace", description: "Google Cloud Drive Storage" },
    { id: AppID.DOCS, name: "Google Docs", icon: FileText, color: "from-blue-600 to-indigo-700", category: "AI & Workspace", description: "Google Docs Collaborative Word Editor" },
    { id: AppID.SHEETS, name: "Google Sheets", icon: FileSpreadsheet, color: "from-emerald-600 to-teal-700", category: "AI & Workspace", description: "Google Spreadsheets & Data Analytics" },
    { id: AppID.SLIDES, name: "Google Slides", icon: Presentation, color: "from-amber-500 to-orange-600", category: "AI & Workspace", description: "Google Presentation Slide Creator" },
    { id: AppID.MS_WORD, name: "Microsoft Word", icon: FileText, color: "from-blue-700 to-blue-900", category: "AI & Workspace", description: "Microsoft Word Document Editor" },
    { id: AppID.MS_EXCEL, name: "Microsoft Excel", icon: FileSpreadsheet, color: "from-emerald-700 to-green-900", category: "AI & Workspace", description: "Microsoft Excel Formulas & Workbooks" },
    { id: AppID.MS_POWERPOINT, name: "Microsoft PowerPoint", icon: Presentation, color: "from-orange-600 to-red-800", category: "AI & Workspace", description: "Microsoft PowerPoint Slide Presentations" },
    { id: AppID.MS_TEAMS, name: "Microsoft Teams", icon: Video, color: "from-indigo-600 to-purple-800", category: "AI & Workspace", description: "Workplace Collaboration, Channels & Calls" },
    { id: AppID.SLACK, name: "Slack", icon: MessageSquare, color: "from-purple-600 via-rose-500 to-amber-500", category: "AI & Workspace", description: "Workplace Team Channels & Messaging" },
    { id: AppID.NOTION, name: "Notion", icon: BookOpen, color: "from-slate-800 to-black border border-slate-700", category: "AI & Workspace", description: "Connected Workspace, Wiki & Docs" },
    { id: AppID.TRELLO, name: "Trello", icon: Grid, color: "from-blue-600 to-cyan-700", category: "AI & Workspace", description: "Kanban Board & Sprint Task Tracking" },
    { id: AppID.TODOIST, name: "Todoist", icon: Edit3, color: "from-red-500 to-rose-700", category: "AI & Workspace", description: "To-Do Lists, Reminders & Task Habits" },
    { id: AppID.ONEDRIVE, name: "OneDrive", icon: Cloud, color: "from-blue-600 to-sky-700", category: "AI & Workspace", description: "Microsoft OneDrive Cloud Storage" },
    { id: AppID.DROPBOX, name: "Dropbox", icon: HardDrive, color: "from-blue-500 to-indigo-600", category: "AI & Workspace", description: "Secure Cloud File Vault & Sync" },
    { id: AppID.PDF_READER, name: "PDF Reader", icon: FileText, color: "from-rose-700 to-pink-800", category: "AI & Workspace", description: "Document Viewer & Form Filler" },
    { id: AppID.LINKEDIN, name: "LinkedIn", icon: Briefcase, color: "from-blue-700 to-sky-800", category: "AI & Workspace", description: "Professional Network & Job Opportunities" },

    // 6. Security, Protection & Privacy
    { id: AppID.SECURITY, name: "Security", icon: ShieldCheck, color: "from-emerald-600 to-emerald-800", category: "Tools & System", description: "SELinux Firewall & Security Status" },
    { id: AppID.FIND_MY_DEVICE, name: "Find My Device", icon: MapPin, color: "from-emerald-600 to-teal-700", category: "Tools & System", description: "GPS Phone Locator & Remote Lock" },
    { id: AppID.PLAY_PROTECT, name: "Google Play Protect", icon: ShieldCheck, color: "from-green-600 to-emerald-800", category: "Tools & System", description: "App Threat Scanner & Malware Protection" },
    { id: AppID.DEVICE_MANAGER, name: "Device Manager", icon: CpuIcon, color: "from-slate-700 to-slate-900", category: "Tools & System", description: "Hardware Diagnostics & Sensor Telemetry" },
    { id: AppID.PASSWORD_MANAGER, name: "Password Manager", icon: Lock, color: "from-indigo-600 to-purple-700", category: "Tools & System", description: "Encrypted Password Vault & Passkeys" },
    { id: AppID.VPN, name: "VPN apps", icon: Shield, color: "from-cyan-600 to-blue-700", category: "Tools & System", description: "Encrypted WireGuard VPN Tunnel" },
    { id: AppID.ANTIVIRUS, name: "Antivirus apps", icon: ShieldCheck, color: "from-rose-600 to-red-800", category: "Tools & System", description: "Deep Threat Antivirus Scanner" },
    { id: AppID.BACKUP, name: "Backup apps", icon: Cloud, color: "from-teal-600 to-emerald-700", category: "Tools & System", description: "Cloud Backup & System Snapshot" },

    // 7. Games & Health
    { id: AppID.CHESS, name: "Chess", icon: Crown, color: "from-amber-600 to-yellow-800", category: "Games & Health", description: "Grandmaster AI Chess Engine" },
    { id: AppID.PUZZLE_GAME, name: "Tile Puzzle", icon: Gamepad2, color: "from-purple-600 to-indigo-800", category: "Games & Health", description: "Sliding Tile Brain Puzzle" },
    { id: AppID.BRAIN_TRAINING, name: "Brain Gym", icon: Brain, color: "from-teal-600 to-emerald-800", category: "Games & Health", description: "Memory & Cognitive Logic Exercises" }
  ];

  // Long-press Context Menu & App Cache State
  const [contextMenuApp, setContextMenuApp] = useState<(typeof allApps)[0] | null>(null);
  const [actionToast, setActionToast] = useState<{ message: string } | null>(null);
  const [appCaches, setAppCaches] = useState<Record<string, number>>({
    [AppID.CHATGPT]: 180,
    [AppID.CLAUDE]: 195,
    [AppID.GEMINI]: 210,
    [AppID.GROK]: 150,
    [AppID.DRIVE]: 320,
    [AppID.SHEETS]: 240,
    [AppID.SLIDES]: 290,
    [AppID.DOCS]: 160,
    [AppID.CALENDAR]: 95,
    [AppID.MEET]: 410,
    [AppID.LINKEDIN]: 310,
    [AppID.BROWSER]: 580,
    [AppID.AI_ASSISTANT]: 410,
    [AppID.CAMERA]: 280,
    [AppID.MUSIC]: 350,
    [AppID.MESSAGES]: 65,
    [AppID.WEATHER]: 85,
    [AppID.FILE_MANAGER]: 190,
    [AppID.GALLERY]: 620,
    [AppID.PHONE]: 25,
    [AppID.SECURITY]: 30,
    [AppID.TASK_MANAGER]: 110,
    [AppID.TERMINAL]: 45,
    [AppID.SETTINGS]: 75,
    [AppID.CLOCK]: 15,
    [AppID.CALCULATOR]: 10,
    [AppID.ACC_MONITOR]: 140,
  });

  const getAppCacheMB = (appId: string) => appCaches[appId] ?? 120;

  const showActionToast = (message: string) => {
    setActionToast({ message });
    setTimeout(() => {
      setActionToast(null);
    }, 3200);
  };

  const handleLongPressApp = (app: (typeof allApps)[0]) => {
    triggerVibration("heavy");
    setContextMenuApp(app);
    onSystemLog(`[Launcher] Long-press on ${app.name} icon -> Quick Actions Context Menu displayed`, "INFO");
  };

  const handleLaunchPrivateMode = (app: (typeof allApps)[0]) => {
    triggerVibration("heavy");
    openApp(app.id);
    showActionToast(`🕶️ Launched ${app.name} in Isolated Private Mode`);
    onSystemLog(`[ActivityManager] Sandboxed Private Mode initialized for ${app.name} (Incognito memory space).`, "INFO");
  };

  const handleClearAppCache = (app: (typeof allApps)[0]) => {
    const freedMB = getAppCacheMB(app.id);
    setAppCaches((prev) => ({ ...prev, [app.id]: 0 }));
    triggerVibration("medium");
    showActionToast(`🧹 Cleared ${freedMB} MB cache for ${app.name}`);
    onSystemLog(`[StorageManager] Cleared ${freedMB} MB temporary cache for ${app.name} (com.kkos.${app.id}).`, "INFO");
  };

  const handleOpenAppInfo = (app: (typeof allApps)[0]) => {
    triggerVibration("light");
    setSettingsSubView("about_phone");
    openApp(AppID.SETTINGS);
    showActionToast(`⚙️ Opened App Details for ${app.name}`);
    onSystemLog(`[ActivityManager] Navigated to System Settings -> Application Details for ${app.name}.`, "INFO");
  };

  const handleForceStopApp = (app: (typeof allApps)[0]) => {
    triggerVibration("heavy");
    setRecentApps((prev) => prev.filter((id) => id !== app.id));
    if (activeApp === app.id) {
      setActiveApp(null);
    }
    showActionToast(`🛑 Force stopped ${app.name} background process`);
    onSystemLog(`[ActivityManager] Force stopped process for ${app.name} (SIGKILL). Released system resources.`, "INFO");
  };

  const filteredApps = allApps.filter((a) => {
    const matchesCategory =
      drawerCategory === "All" || a.category === drawerCategory;
    const searchLower = drawerSearch.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      a.name.toLowerCase().includes(searchLower) ||
      (a.description || "").toLowerCase().includes(searchLower) ||
      (a.category || "").toLowerCase().includes(searchLower) ||
      a.id.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const openApp = (appId: AppID) => {
    playAppLaunchSound();
    if (appId === AppID.SETTINGS && settingsSubView === "network") {
      // keep network view if opened via long-press
    } else {
      setSettingsSubView("list");
    }
    setActiveApp(appId);
    setAppDrawerOpen(false);
    setAppSwitcherOpen(false);
    setContextMenuApp(null);
    setQuickSettingsOpen(false);
    setRecentApps((prev) => [appId, ...prev.filter((id) => id !== appId)]);
    onSystemLog(`[ActivityManager] Resuming App Intent: ${appId}`);
  };

  const handleCloseRecentApp = (appId: AppID) => {
    setRecentApps((prev) => prev.filter((id) => id !== appId));
    if (activeApp === appId) {
      setActiveApp(null);
    }
    onSystemLog(`[ActivityManager] Removed ${appId} from Recent Tasks.`);
  };

  const handleClearAllRecents = () => {
    setRecentApps([]);
    setActiveApp(null);
    setAppSwitcherOpen(false);
    onSystemLog("[ActivityManager] Cleared all recent task states.");
  };

  const handleSwipeBack = () => {
    if (appSwitcherOpen) {
      setAppSwitcherOpen(false);
    } else if (appDrawerOpen) {
      setAppDrawerOpen(false);
    } else if (quickSettingsOpen) {
      setQuickSettingsOpen(false);
    } else if (activeApp) {
      setActiveApp(null);
      showActionToast("👈 Swipe Back: Returned to Home Screen");
      onSystemLog("[GestureEngine] Swipe Back: App closed -> Navigated Home", "INFO");
    }
  };

  const handlePullRefresh = () => {
    setRamUsed((prev) => Math.max(2100, Math.min(4800, prev + Math.floor(Math.random() * 200 - 100))));
    showActionToast("🔄 System Refreshed: Memory & Storage Re-indexed!");
    onSystemLog("[GestureEngine] Pull-to-refresh: Cleared temporary render caches & re-indexed system state.", "INFO");
  };

  return (
    <div className="relative mx-auto flex items-center justify-center p-2 lg:p-6" id="phone-device-wrapper">
      {/* Phone chassis with haptic tactile vibration motion */}
      <motion.div
        key={vibrateTrigger}
        animate={
          vibrateTrigger > 0
            ? vibrateIntensity === "heavy"
              ? { x: [0, -5, 5, -4, 4, -2, 2, 0], y: [0, 3, -3, 2, -2, 0] }
              : vibrateIntensity === "medium"
              ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 0] }
              : { x: [0, -2, 2, -1, 1, 0], y: [0, 1, -1, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: vibrateIntensity === "heavy" ? 0.22 : 0.12, ease: "easeInOut" }}
        className="relative h-[680px] w-[340px] rounded-[48px] bg-slate-950 p-[12px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden"
      >
        
        {/* Notch / Camera camera block */}
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 h-[22px] w-[110px] bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5 border-x border-b border-slate-900">
          <span className="h-2 w-2 rounded-full bg-slate-900 border border-slate-800 animate-pulse" />
          <span className="h-1 w-10 rounded-full bg-slate-800" />
        </div>

        {/* Physical Power Button (Right) */}
        <button
          onClick={() => {
            if (bootState === "off") {
              setBootState("lockscreen");
              onSystemLog("[PowerHAL] Power key clicked: Display turned on to Lock Screen", "INFO");
            } else if (bootState === "lockscreen") {
              setBootState("off");
              onSystemLog("[PowerHAL] Power key clicked: Display turned off", "INFO");
            } else {
              setActiveApp(null);
              setBootState("lockscreen");
              onSystemLog("[PowerHAL] Power key clicked: Screen locked to Lock Screen page", "INFO");
            }
          }}
          className="absolute -right-1 top-24 w-1.5 h-12 bg-slate-700 rounded-l hover:bg-slate-400 z-50 focus:outline-none cursor-pointer transition-colors shadow-sm"
          title="Physical Power Key (Click to Lock / Turn Off / Unlock Display)"
        />

        {/* Physical Hardware Volume Controls & Alert Slider (Left) */}
        {/* 1. Alert Slider (Ring / Vibrate / Silent) */}
        <button
          onClick={toggleSoundProfile}
          className={`absolute -left-1 top-14 w-1.5 h-7 rounded-r z-50 focus:outline-none cursor-pointer transition-all shadow-sm ${
            soundProfile === "silent"
              ? "bg-rose-500 hover:bg-rose-400"
              : soundProfile === "vibrate"
              ? "bg-amber-500 hover:bg-amber-400"
              : "bg-teal-600 hover:bg-teal-400"
          }`}
          title={`Physical Alert Slider: Mode is ${soundProfile.toUpperCase()} (Click to toggle Ring / Vibrate / Silent)`}
        />

        {/* 2. Volume Up Button */}
        <button
          onClick={() => stepVolume(5)}
          className="absolute -left-1 top-24 w-1.5 h-11 bg-slate-700 hover:bg-cyan-400 rounded-r z-50 focus:outline-none cursor-pointer transition-colors active:scale-95 shadow-sm"
          title="Physical Volume Up (+5% / Shortcut: ] or Alt+Up)"
        />

        {/* 3. Volume Down Button */}
        <button
          onClick={() => stepVolume(-5)}
          className="absolute -left-1 top-38 w-1.5 h-11 bg-slate-700 hover:bg-cyan-400 rounded-r z-50 focus:outline-none cursor-pointer transition-colors active:scale-95 shadow-sm"
          title="Physical Volume Down (-5% / Shortcut: [ or Alt+Down)"
        />

        {/* Screen Canvas */}
        <div className="relative flex-1 rounded-[36px] overflow-hidden flex flex-col select-none bg-black">
          
          {/* TOAST SYSTEM */}
          <ToastNotification toasts={toasts} onDismiss={onDismissToast} onClearAll={onClearAllToasts} />

          {/* BRIGHTNESS OVERLAY */}
          <div
            className="absolute inset-0 pointer-events-none z-50 mix-blend-multiply bg-black"
            style={{ opacity: (100 - brightness) / 100 * 0.7 }}
          />

          {/* 1. STATE: OFF */}
          {bootState === "off" && (
            <div className="flex-1 bg-black flex flex-col items-center justify-center gap-4 text-slate-800">
              <Moon size={36} className="animate-pulse text-teal-800" />
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    setBootState("lockscreen");
                    onSystemLog("[PowerHAL] Screen turned on to Lock Screen", "INFO");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold uppercase tracking-wider text-teal-400 border border-teal-950 cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  <Lock size={14} className="text-teal-400" />
                  <span>Lock Screen</span>
                </button>
                <button
                  onClick={startBootCycle}
                  className="text-[9px] text-slate-600 hover:text-slate-400 underline font-mono cursor-pointer"
                >
                  Cold Boot System
                </button>
              </div>
            </div>
          )}

          {/* 2. BOOTLOADER / TERMINAL LOGS */}
          {bootState === "boot_loader" && (
            <div className="flex-1 bg-black p-6 font-mono text-[10px] text-emerald-400 space-y-2 select-text flex flex-col justify-between animate-in fade-in duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-emerald-900/60">
                  <TerminalIcon size={14} className="text-emerald-400 animate-pulse" />
                  <span>[KK Secure Boot v1.4]</span>
                </div>
                <p className="text-emerald-300 font-semibold">SECURE_BOOT_STATE: VALIDATED</p>
                <p className="opacity-80">HW_ID: ARM-V8-A64-D72</p>
                <p className="opacity-70 animate-pulse">INITIATING KERNEL CORE...</p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-emerald-500/80 text-[9px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Handing off to KK OS Graphic Subsystem...</span>
              </div>
            </div>
          )}

          {/* 3. SPLASH / KK OS LOGO FADE-IN */}
          {bootState === "boot_splash" && (
            <div className="flex-1 bg-black flex flex-col items-center justify-center gap-5 relative overflow-hidden animate-boot-logo">
              {/* Glowing Background Pulse Aura */}
              <div className="absolute h-40 w-40 rounded-full bg-teal-500/20 blur-3xl animate-glow-pulse pointer-events-none" />

              {/* Central Logo Container */}
              <div className="relative z-10 h-20 w-20 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-850 to-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-[0_0_35px_rgba(20,184,166,0.35)]">
                <Bot size={44} className="drop-shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
                <Sparkles size={16} className="absolute -top-1 -right-1 text-teal-300 animate-pulse" />
              </div>

              {/* Title & Subtitle */}
              <div className="relative z-10 text-center space-y-1">
                <h1 className="text-xl font-extrabold tracking-widest text-white uppercase bg-gradient-to-r from-teal-200 via-white to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                  KK Mobile OS
                </h1>
                <p className="text-[9px] font-mono tracking-widest text-teal-400/80 uppercase">
                  Microkernel Architecture
                </p>
              </div>
            </div>
          )}

          {/* 4. BOOT ANIMATION / SPINNER */}
          {bootState === "boot_anim" && (
            <div className="flex-1 bg-black flex flex-col items-center justify-center gap-6 relative animate-in fade-in duration-400">
              <div className="relative flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-2 border-t-teal-400 border-slate-800 animate-spin" />
                <div className="absolute h-8 w-8 rounded-full bg-teal-500/20 blur-md animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono text-teal-300 uppercase tracking-widest font-bold">
                  Loading User Session...
                </span>
                <span className="text-[8px] font-mono text-slate-500">
                  Preparing Lock Screen
                </span>
              </div>
            </div>
          )}

          {/* 4b. QUANTUM / HOLOGRAPHIC CINEMATIC BOOT ENGINE */}
          {bootState === "quantum_boot" && (
            <BootAnimation
              initialTheme={bootTheme}
              onComplete={() => {
                setBootState("lockscreen");
                onSystemLog?.("[Kernel] Quantum Boot Sequence completed. Handing over to Lock Screen.", "INFO");
              }}
              onSystemLog={onSystemLog}
            />
          )}

          {/* 5. LOCKSCREEN */}
          {bootState === "lockscreen" && (
            <LockScreen
              currentTime={currentTime}
              wallpaperClass={activeWallpaper.className}
              wallpaperImageUrl={activeWallpaper.imageUrl}
              onSystemLog={onSystemLog}
              batteryLevel={batteryLevel}
              onBatteryChange={onBatteryChange}
              onUnlock={() => {
                playUnlockSound();
                setBootState("launcher");
              }}
            />
          )}

          {/* 6. LAUNCHER / APP ENGINE */}
          {bootState === "launcher" && (
            <div
              className={`flex-1 ${activeWallpaper.className} flex flex-col relative overflow-hidden`}
              style={
                activeWallpaper.imageUrl
                  ? {
                      backgroundImage: `url(${activeWallpaper.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }
                  : undefined
              }
            >
              {/* Wallpaper Pattern Overlay Mesh Layer */}
              <div className="absolute inset-0 pointer-events-none os-wallpaper-pattern-overlay opacity-30 z-0" />

              {/* SYSTEM-WIDE DARK MODE & WARM LOW-BLUE LIGHT FILTER OVERLAY */}
              {darkModeScheduler.enabled && darkModeScheduler.isWarmActive && (
                <div
                  className="absolute inset-0 pointer-events-none z-50 transition-all duration-700 ease-in-out"
                  style={{
                    backgroundColor: `rgba(217, 119, 6, ${ (darkModeScheduler.warmIntensity / 100) * 0.18 })`,
                    backdropFilter: `sepia(${darkModeScheduler.warmIntensity * 0.35}%) hue-rotate(-12deg) saturate(90%)`
                  }}
                />
              )}

              {/* SWIPE-DOWN CONTROL CENTER OVERLAY */}
              <ControlCenterOverlay
                isOpen={quickSettingsOpen}
                onClose={() => setQuickSettingsOpen(false)}
                volume={volumeLevels.media}
                onVolumeChange={(val) => handleVolumeStreamChange("media", val)}
                isMuted={volumeLevels.media === 0 || soundProfile === "silent"}
                onToggleMute={() => {
                  const current = volumeLevels.media;
                  if (current > 0) {
                    handleVolumeStreamChange("media", 0);
                  } else {
                    handleVolumeStreamChange("media", 70);
                  }
                }}
                onOpenVolumeMixer={() => setIsVolumeHudVisible(true)}
                wifi={settingsState.wifi}
                onToggleWifi={(val) => handleSettingsStateChange("wifi", val)}
                bluetooth={settingsState.bluetooth}
                onToggleBluetooth={(val) => handleSettingsStateChange("bluetooth", val)}
                mobileData={settingsState.mobileData}
                onToggleMobileData={(val) => handleSettingsStateChange("mobileData", val)}
                airplaneMode={settingsState.airplaneMode}
                onToggleAirplaneMode={(val) => handleSettingsStateChange("airplaneMode", val)}
                signalBars={signalBars}
                brightness={brightness}
                onBrightnessChange={(val) => setBrightness(val)}
                batteryLevel={batteryLevel}
                onBatteryChange={onBatteryChange}
                isCharging={isCharging}
                onToggleCharging={(val) => setIsCharging(val)}
                isBatterySaver={isBatterySaver}
                onToggleBatterySaver={onToggleBatterySaver}
                performanceMode={performanceMode}
                onPerformanceModeChange={onPerformanceModeChange}
                darkModeScheduler={darkModeScheduler}
                onToggleWarmMode={() =>
                  setDarkModeScheduler((prev) => ({ ...prev, isWarmActive: !prev.isWarmActive }))
                }
                onToggleDarkModeScheduler={() =>
                  setDarkModeScheduler((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                onOpenApp={(appId) => openApp(appId)}
                onOpenStorageManager={() => setIsStorageManagerOpen(true)}
                onOpenNotificationCenter={() => setNotificationCenterOpen(true)}
                onSystemLog={onSystemLog}
                triggerVibration={triggerVibration}
                currentTime={currentTime}
                onShowToast={(msg) => showActionToast(msg)}
                activeAppId={activeApp}
              />

              {/* EXPANDED NOTIFICATION CENTER OVERLAY */}
              <NotificationCenterOverlay
                isOpen={notificationCenterOpen}
                onClose={() => setNotificationCenterOpen(false)}
                toasts={toasts}
                onDismiss={onDismissToast}
                onClearAll={onClearAllToasts}
                onMarkRead={onMarkReadToast}
                onMarkAllRead={onMarkAllReadToasts}
                onArchive={onArchiveToast}
                onArchiveAll={onArchiveAllToasts}
                onReply={onReplyToast}
                onOpenApp={(appId) => openApp(appId)}
                onSimulateNotification={onSimulateNotification}
                onSystemLog={onSystemLog}
                isDndActive={settingsState.dnd}
                currentTime={currentTime}
              />

              {/* APP DRAWER OVERLAY */}
              <AnimatePresence>
                {appDrawerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-40 flex flex-col p-3.5 select-none"
                  >
                    {/* Top Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-teal-950 text-teal-400 border border-teal-800">
                        <Grid size={14} />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-white">App Launcher</h2>
                        <span className="text-[9px] font-mono text-slate-400">
                          {filteredApps.length} / {allApps.length} Apps
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAppDrawerOpen(false)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  {/* GLOBAL SEARCH INPUT AT TOP OF APP LAUNCHER */}
                  <div className="my-2 space-y-2 shrink-0">
                    <div className="relative flex items-center bg-slate-900 border border-slate-750 focus-within:border-teal-400/80 rounded-2xl px-3 py-1.5 transition-all shadow-inner">
                      <Search size={14} className="text-teal-400 shrink-0 mr-2" />
                      <input
                        type="text"
                        value={drawerSearch}
                        onChange={(e) => setDrawerSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && filteredApps.length > 0) {
                            openApp(filteredApps[0].id);
                          } else if (e.key === "Escape") {
                            setDrawerSearch("");
                          }
                        }}
                        placeholder={isDrawerDictating ? "Listening... speak app name..." : "Type app name to search (e.g. Camera, Terminal)..."}
                        className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full font-medium"
                        autoFocus
                      />

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {drawerSearch && (
                          <button
                            onClick={() => setDrawerSearch("")}
                            className="p-1 text-slate-400 hover:text-white rounded-full cursor-pointer"
                            title="Clear search"
                          >
                            <X size={12} />
                          </button>
                        )}

                        <button
                          onClick={toggleDrawerDictation}
                          title={isDrawerDictating ? "Stop Voice Dictation" : "Dictate App Name"}
                          className={`p-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 ${
                            isDrawerDictating
                              ? "bg-rose-600 text-white animate-pulse shadow-md"
                              : "bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700"
                          }`}
                        >
                          {isDrawerDictating ? <MicOff size={13} /> : <Mic size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Top Result Keyboard Auto-Launch Banner */}
                    {drawerSearch.trim() && filteredApps.length > 0 && (
                      <div 
                        onClick={() => openApp(filteredApps[0].id)}
                        className="p-1.5 px-2.5 rounded-xl bg-teal-950/80 border border-teal-500/40 flex items-center justify-between text-[10px] text-teal-200 cursor-pointer hover:bg-teal-900 transition-colors shadow-sm animate-in fade-in duration-150"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="p-0.5 rounded bg-teal-500 text-slate-950 font-black text-[9px]">↵ ENTER</span>
                          <span className="font-extrabold text-white truncate">{filteredApps[0].name}</span>
                          <span className="text-[9px] text-teal-400 font-mono truncate">({filteredApps[0].category})</span>
                        </div>
                        <span className="text-[9px] font-bold text-teal-300 underline shrink-0">Open App →</span>
                      </div>
                    )}

                    {/* Voice Dictation Banner */}
                    {isDrawerDictating && (
                      <div className="bg-teal-950/90 border border-teal-500/40 p-2 rounded-xl flex items-center justify-between text-[10px] text-teal-200 font-mono animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 truncate">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                          <span className="text-white font-extrabold font-sans">Dictating:</span>
                          <span className="text-teal-300 italic truncate font-mono">
                            "{drawerDictationInterim || drawerSearch || "Speak app name..."}"
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Volume2 size={12} className="text-teal-400 animate-pulse" />
                          <div className="w-8 h-1 bg-teal-900 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-400 transition-all duration-100" style={{ width: `${Math.max(10, drawerMicVolume)}%` }} />
                          </div>
                          <button onClick={stopDrawerDictation} className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded cursor-pointer font-bold">
                            Stop
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick App Search Filter Pills */}
                    {!drawerSearch.trim() && (
                      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[9.5px]">
                        <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase tracking-wider mr-0.5">Quick:</span>
                        {["Camera", "Terminal", "Gemini", "ChatGPT", "Browser", "Settings", "Notes", "Calculator"].map((appTerm) => (
                          <button
                            key={appTerm}
                            onClick={() => {
                              setDrawerSearch(appTerm);
                              setDrawerCategory("All");
                            }}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-teal-300 font-medium transition-all cursor-pointer whitespace-nowrap shrink-0"
                          >
                            {appTerm}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* App Launcher Category Quick Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                      {[
                        { id: "All", label: "All" },
                        { id: "AI & Workspace", label: "AI & Workspace" },
                        { id: "Tools & System", label: "Tools & System" },
                        { id: "Media & Comm", label: "Media & Comm" },
                        { id: "Finance & Pay", label: "Finance & Pay" },
                        { id: "Learning & Edu", label: "Learning" },
                        { id: "Games & Health", label: "Games" }
                      ].map((cat) => {
                        const count = allApps.filter((a) => cat.id === "All" || a.category === cat.id).length;
                        const isActive = drawerCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setDrawerCategory(cat.id as any)}
                            className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 font-bold ${
                              isActive
                                ? "bg-teal-500 text-slate-950 border-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.4)]"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                            }`}
                          >
                            <span>{cat.label}</span>
                            <span className={`text-[8.5px] px-1 rounded-full font-mono ${
                              isActive ? "bg-slate-950 text-teal-300 font-extrabold" : "bg-slate-800 text-slate-500"
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* App Grid or Empty Search State */}
                  <div className="flex-1 overflow-y-auto py-1 scrollbar-none">
                    {filteredApps.length > 0 ? (
                      <div className="grid grid-cols-4 gap-y-4 gap-x-2 py-2">
                        {filteredApps.map((app) => (
                          <AppIconButton
                            key={app.id}
                            app={app}
                            onOpen={openApp}
                            onLongPress={handleLongPressApp}
                            cacheMB={getAppCacheMB(app.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 my-auto">
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                          <Search size={22} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">No applications found</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            No installed apps match <span className="text-teal-300 font-mono">"{drawerSearch}"</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                          {["Camera", "Terminal", "ChatGPT", "Settings", "Files"].map((quick) => (
                            <button
                              key={quick}
                              onClick={() => {
                                setDrawerSearch(quick);
                                setDrawerCategory("All");
                              }}
                              className="px-2 py-1 rounded-xl bg-slate-850 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 text-[10px] text-slate-300 hover:text-teal-300 font-bold transition-all cursor-pointer"
                            >
                              {quick}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setDrawerSearch("");
                            setDrawerCategory("All");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold cursor-pointer transition-all shadow"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

              {/* RECENT APPS OVERLAY COMPONENT */}
              <RecentAppsOverlay
                isOpen={appSwitcherOpen}
                recentApps={recentApps}
                activeApp={activeApp}
                allApps={allApps}
                onSelectApp={(appId) => openApp(appId)}
                onCloseApp={handleCloseRecentApp}
                onClearAll={handleClearAllRecents}
                onClose={() => setAppSwitcherOpen(false)}
                ramUsedMB={ramUsed}
                onSystemLog={onSystemLog}
              />

              {/* LONG-PRESS APP CONTEXT MENU OVERLAY */}
              {contextMenuApp && (
                <div
                  className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
                  onClick={() => setContextMenuApp(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-[280px] bg-slate-950/95 border border-slate-750/90 rounded-3xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] text-slate-100 flex flex-col gap-3 relative overflow-hidden select-none"
                  >
                    {/* Decorative top ambient bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${contextMenuApp.color}`} />

                    {/* App Header info */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-850">
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${contextMenuApp.color} text-white flex items-center justify-center shadow-lg shrink-0`}>
                        {React.createElement(contextMenuApp.icon, { size: 22 })}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <h3 className="text-sm font-extrabold text-white truncate">{contextMenuApp.name}</h3>
                        <span className="text-[9.5px] font-mono text-slate-400 truncate">com.kkos.{contextMenuApp.id}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-800/80 text-[8px] font-mono text-purple-300 font-bold">
                            Cache: {getAppCacheMB(contextMenuApp.id)} MB
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-teal-950/80 border border-teal-800/80 text-[8px] font-mono text-teal-300 font-bold">
                            v14.2
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setContextMenuApp(null)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer ml-auto transition-colors"
                        title="Close context menu"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Quick Action Buttons List */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
                        Quick Actions
                      </span>

                      {/* 1. Open App */}
                      <button
                        onClick={() => {
                          openApp(contextMenuApp.id);
                          setContextMenuApp(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-center gap-2.5 text-xs font-bold text-white transition-all cursor-pointer group active:scale-98"
                      >
                        <div className="p-1.5 rounded-lg bg-teal-950 text-teal-400 group-hover:bg-teal-900 transition-colors">
                          <Play size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span>Open Application</span>
                          <span className="text-[9px] text-slate-400 font-normal">Standard launch</span>
                        </div>
                      </button>

                      {/* 2. Launch in Private Mode */}
                      <button
                        onClick={() => {
                          handleLaunchPrivateMode(contextMenuApp);
                          setContextMenuApp(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-center gap-2.5 text-xs font-bold text-cyan-300 transition-all cursor-pointer group active:scale-98"
                      >
                        <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 group-hover:bg-cyan-900 transition-colors">
                          <EyeOff size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span>Launch in Private Mode</span>
                          <span className="text-[9px] text-slate-400 font-normal">Isolated memory & no tracking</span>
                        </div>
                      </button>

                      {/* 3. Clear App Cache */}
                      <button
                        onClick={() => {
                          handleClearAppCache(contextMenuApp);
                          setContextMenuApp(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-center gap-2.5 text-xs font-bold text-purple-300 transition-all cursor-pointer group active:scale-98"
                      >
                        <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 group-hover:bg-purple-900 transition-colors">
                          <Database size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span>Clear App Cache</span>
                          <span className="text-[9px] text-slate-400 font-normal">
                            Free up {getAppCacheMB(contextMenuApp.id)} MB storage space
                          </span>
                        </div>
                      </button>

                      {/* 4. App Info & Settings */}
                      <button
                        onClick={() => {
                          handleOpenAppInfo(contextMenuApp);
                          setContextMenuApp(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-center gap-2.5 text-xs font-bold text-amber-300 transition-all cursor-pointer group active:scale-98"
                      >
                        <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 group-hover:bg-amber-900 transition-colors">
                          <Info size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span>App Info & Permissions</span>
                          <span className="text-[9px] text-slate-400 font-normal">Manage storage & security</span>
                        </div>
                      </button>

                      {/* 5. Force Stop */}
                      <button
                        onClick={() => {
                          handleForceStopApp(contextMenuApp);
                          setContextMenuApp(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/60 text-left flex items-center gap-2.5 text-xs font-bold text-rose-300 transition-all cursor-pointer group active:scale-98"
                      >
                        <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 group-hover:bg-rose-900 transition-colors">
                          <ZapOff size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span>Force Stop Process</span>
                          <span className="text-[9px] text-rose-400/80 font-normal">Kill background task</span>
                        </div>
                      </button>
                    </div>

                    <div className="text-[8.5px] font-mono text-center text-slate-500 pt-1 border-t border-slate-850">
                      Tip: Long-press or right-click any icon for quick actions.
                    </div>
                  </motion.div>
                </div>
              )}

              {/* LOST DEVICE RECOVERY SCREEN STROBE & ACOUSTIC BEACON OVERLAY */}
              <LostDeviceBeaconOverlay
                onOpenApp={(appId) => openApp(appId)}
                onSystemLog={onSystemLog}
              />

              {/* SYSTEM TOAST NOTIFICATIONS (INTERACTIVE ALERTS: REPLY, MARK READ, ARCHIVE) */}
              <ToastNotification
                toasts={toasts}
                onDismiss={onDismissToast}
                onClearAll={onClearAllToasts}
                onMarkRead={onMarkReadToast}
                onArchive={onArchiveToast}
                onReply={onReplyToast}
                onOpenNotificationCenter={() => setNotificationCenterOpen(true)}
                onOpenApp={(appId) => openApp(appId)}
                isDndActive={settingsState.dnd}
                hiddenToastsCount={0}
              />

              {/* QUICK ACTION TOAST BANNER */}
              {actionToast && (
                <div className="absolute top-[38px] left-1/2 -translate-x-1/2 z-55 bg-slate-900/95 border border-cyan-400/80 px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 pointer-events-none">
                  <Sparkles size={12} className="text-cyan-400 animate-spin" />
                  <span className="text-[10px] font-bold text-white font-sans tracking-tight">{actionToast.message}</span>
                </div>
              )}

              {/* CHARGING STATE OVERLAY ANIMATION BANNER */}
              {isChargingAnim && (
                <div className="absolute top-[34px] left-1/2 -translate-x-1/2 z-45 bg-slate-950/95 border border-emerald-400/80 px-3.5 py-1.5 rounded-full shadow-[0_0_25px_rgba(52,211,153,0.7)] flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 pointer-events-none">
                  <div className="p-1 rounded-full bg-emerald-400 text-slate-950 animate-bounce shadow">
                    <Zap size={12} className="fill-slate-950" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-emerald-300 font-mono tracking-wider flex items-center gap-1.5">
                      ⚡ CHARGING <span className="text-white font-bold">{batteryLevel}%</span>
                    </span>
                    <span className="text-[8px] text-emerald-400/80 font-mono">Fast Charger Connected</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
                </div>
              )}

              {/* PERSISTENT SYSTEM STATUS BAR */}
              <div
                onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
                className={`h-[30px] px-3.5 pt-0.5 flex justify-between items-center text-[10px] text-white z-30 tracking-tight font-sans select-none shrink-0 transition-all duration-300 relative cursor-pointer hover:bg-white/10 ${
                  isChargingAnim
                    ? "bg-emerald-950/90 border-b border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.6)]"
                    : "bg-slate-950/60 backdrop-blur-md border-b border-white/10"
                }`}
                title="Persistent System Status Bar • Swipe down or tap to open Control Center"
              >
                {/* Charging Energy Beam Top Line */}
                {isChargingAnim && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500 animate-pulse" />
                )}

                {/* Left: System Clock & Interactive Notification Center Bell */}
                <div className="flex items-center gap-2">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      const now = new Date();
                      setActionToast({
                        message: `⏰ System Time: ${currentTime || "10:45"} • ${now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`
                      });
                    }}
                    className="flex items-center gap-1.5 font-bold hover:text-teal-300 cursor-pointer transition-colors"
                    title="System Clock • Click for date & time log"
                  >
                    <ClockIcon size={11} className={isChargingAnim ? "text-emerald-300 animate-spin" : "text-teal-400 animate-pulse"} />
                    <span className="font-mono text-[10.5px] text-slate-100 font-extrabold tracking-tight">{currentTime || "10:45"}</span>
                  </div>

                  {/* Notification Center Trigger Badge in Status Bar */}
                  {(() => {
                    const unreadCount = toasts.filter((t) => !t.isArchived && !t.isRead).length;
                    const activeCount = toasts.filter((t) => !t.isArchived).length;
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotificationCenterOpen(true);
                          triggerVibration("light");
                        }}
                        className={`flex items-center gap-1 px-1.5 py-0.2 rounded-full border text-[8px] font-mono font-bold transition-all cursor-pointer ${
                          unreadCount > 0
                            ? "bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse"
                            : activeCount > 0
                            ? "bg-teal-950/90 border-teal-500/80 text-teal-300"
                            : "bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
                        }`}
                        title="Open Notification Center (Interactive Alerts & History)"
                      >
                        <Bell size={9} className={unreadCount > 0 ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
                        <span>{unreadCount > 0 ? unreadCount : activeCount > 0 ? activeCount : 0}</span>
                      </button>
                    );
                  })()}
                </div>

                {/* Central Control Center Pull-Down Pill */}
                <div
                  className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-teal-300 px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wide uppercase transition-all shadow-sm active:scale-95 group cursor-pointer"
                  title="Swipe down or tap status bar for Control Center (Wi-Fi, Bluetooth, Brightness, Power)"
                >
                  <ChevronDown size={11} className={`transition-transform duration-300 ${quickSettingsOpen ? "rotate-180 text-teal-300" : "animate-bounce text-teal-400"}`} />
                  <span className="hidden sm:inline">Control Center</span>
                </div>

                {/* Network Connectivity, Real-Time Signal & Battery Indicators */}
                <div className="flex items-center gap-2">
                  {/* Wi-Fi Indicator */}
                  {settingsState.wifi ? (
                    <div className="flex items-center gap-0.5 text-teal-400" title="Wi-Fi 5GHz Connected">
                      <Wifi size={11} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 text-slate-600" title="Wi-Fi Disabled">
                      <Wifi size={11} className="opacity-40" />
                    </div>
                  )}

                  {/* Bluetooth Indicator */}
                  {settingsState.bluetooth ? (
                    <div className="flex items-center gap-0.5 text-cyan-400" title="Bluetooth 5.3 Active">
                      <Bluetooth size={11} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 text-slate-600" title="Bluetooth Disabled">
                      <Bluetooth size={11} className="opacity-40" />
                    </div>
                  )}

                  {/* Real-Time Cellular Signal Strength Bars */}
                  {settingsState.airplaneMode ? (
                    <div 
                      className="flex items-center gap-1 text-amber-400 font-mono text-[8.5px] font-bold cursor-pointer" 
                      title="Airplane Mode Active (Cellular Radios Off)"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionToast({ message: "✈️ Airplane Mode Active • All cellular & wireless transmitters disabled" });
                      }}
                    >
                      <Radio size={11} className="animate-pulse" />
                      <span className="text-[7.5px] uppercase font-extrabold">Flight</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
                      title={`Cellular Network: ${settingsState.mobileData ? "Connected (5G)" : "Data Off"} • Signal Strength: ${signalBars}/4 Bars (-${112 - signalBars * 8} dBm)`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionToast({
                          message: `📶 Cellular Link: ${signalBars}/4 Bars (-${112 - signalBars * 8} dBm 5G LTE) • ${settingsState.mobileData ? "5G Data Connected" : "Data Off"}`
                        });
                      }}
                    >
                      {/* 4-Bar Signal Visualizer */}
                      <div className="flex items-end gap-[1.5px] h-3 px-0.5">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`w-[2.2px] rounded-xs transition-all duration-300 ${
                              bar <= signalBars
                                ? settingsState.mobileData
                                  ? "bg-teal-400 shadow-[0_0_4px_rgba(45,212,191,0.6)]"
                                  : "bg-slate-200"
                                : "bg-slate-700/60"
                            }`}
                            style={{ height: `${bar * 2.2 + 2}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-[8px] font-mono font-black text-teal-300 tracking-tighter">5G</span>
                    </div>
                  )}

                  {/* Cloud Sync Status Indicator */}
                  {cloudSyncState.appName && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionToast({
                          message: `☁️ Cloud Sync (${cloudSyncState.appName}): ${
                            cloudSyncState.isSyncing
                              ? "Syncing user files..."
                              : `All ${cloudSyncState.filesSynced} user files synchronized!`
                          }`
                        });
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-mono font-bold transition-all select-none cursor-pointer ${
                        cloudSyncState.isSyncing
                          ? "bg-cyan-950/90 border-cyan-400/80 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                          : "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                      }`}
                      title={`Cloud Sync (${cloudSyncState.appName}): ${
                        cloudSyncState.isSyncing ? "Syncing user files..." : "Storage synchronized"
                      }`}
                    >
                      <motion.div
                        animate={cloudSyncState.isSyncing ? { rotate: 360 } : { scale: [1, 1.15, 1] }}
                        transition={
                          cloudSyncState.isSyncing
                            ? { repeat: Infinity, duration: 1, ease: "linear" }
                            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }
                        className="flex items-center justify-center shrink-0"
                      >
                        <RefreshCw size={8.5} className={cloudSyncState.isSyncing ? "text-cyan-300" : "text-emerald-300"} />
                      </motion.div>
                      <Cloud size={9.5} className={cloudSyncState.isSyncing ? "text-cyan-300" : "text-emerald-300"} />
                      <span className="hidden sm:inline-block text-[7.5px] font-extrabold tracking-tight">
                        {cloudSyncState.isSyncing ? "SYNC" : "SYNCED"}
                      </span>
                    </motion.div>
                  )}

                  {/* System-Wide Dark Mode Scheduler & Warm Light Badge */}
                  {darkModeScheduler.enabled && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionToast({
                          message: darkModeScheduler.isWarmActive
                            ? `🌅 Dark Mode Scheduler: Low-Blue Warm Tint ACTIVE (${darkModeScheduler.warmIntensity}%)`
                            : `☀️ Dark Mode Scheduler: Day Mode Neutral Palette Active`
                        });
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-mono font-bold transition-all select-none cursor-pointer ${
                        darkModeScheduler.isWarmActive
                          ? "bg-amber-950/90 border-amber-500/80 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          : "bg-slate-900/80 border-slate-700 text-slate-400"
                      }`}
                      title={`Dark Mode Scheduler: ${
                        darkModeScheduler.isWarmActive ? "Warm Light Active (Sunset/Night)" : "Day Mode (Sunrise)"
                      }`}
                    >
                      {darkModeScheduler.isWarmActive ? (
                        <Sunset size={9.5} className="text-amber-300 animate-pulse" />
                      ) : (
                        <Sun size={9.5} className="text-amber-400" />
                      )}
                      <span className="hidden sm:inline-block text-[7.5px] font-extrabold tracking-tight">
                        {darkModeScheduler.isWarmActive ? "WARM" : "DAY"}
                      </span>
                    </motion.div>
                  )}

                  {/* Battery Indicator with Framer Motion Pulsing Glow */}
                  <motion.div
                    animate={
                      isChargingActive
                        ? {
                            scale: [1, 1.08, 1],
                            boxShadow: [
                              "0 0 6px rgba(52,211,153,0.4), inset 0 0 4px rgba(52,211,153,0.2)",
                              "0 0 20px rgba(52,211,153,0.95), 0 0 30px rgba(16,185,129,0.7), inset 0 0 10px rgba(52,211,153,0.5)",
                              "0 0 6px rgba(52,211,153,0.4), inset 0 0 4px rgba(52,211,153,0.2)"
                            ],
                            borderColor: ["rgba(52,211,153,0.6)", "rgba(167,243,208,1)", "rgba(52,211,153,0.6)"],
                            backgroundColor: ["rgba(6,78,59,0.9)", "rgba(4,120,87,0.95)", "rgba(6,78,59,0.9)"]
                          }
                        : {
                            scale: 1,
                            boxShadow: "0 0 0px rgba(0,0,0,0)",
                            borderColor: "rgba(255,255,255,0.1)",
                            backgroundColor: "rgba(0,0,0,0.4)"
                          }
                    }
                    transition={
                      isChargingActive
                        ? {
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        : { duration: 0.3 }
                    }
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-colors select-none relative overflow-hidden"
                    title={`Battery: ${batteryLevel}% ${isChargingActive ? "(Charging Active - Pulsing Glow)" : ""}`}
                  >
                    {/* Background Energy Beam overlay when charging */}
                    {isChargingActive && (
                      <motion.div
                        animate={{
                          x: ["-100%", "200%"]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear"
                        }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent skew-x-12 pointer-events-none"
                      />
                    )}

                    {isChargingActive && (
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [0, 15, -15, 0]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "easeInOut"
                        }}
                      >
                        <Zap size={11} className="text-emerald-300 fill-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,1)]" />
                      </motion.div>
                    )}

                    <span
                      className={`text-[9px] font-mono font-bold tracking-tight ${
                        isChargingActive ? "text-emerald-100 font-extrabold" : "text-slate-200"
                      }`}
                    >
                      {batteryLevel}%
                    </span>

                    <motion.div
                      animate={
                        isChargingActive
                          ? {
                              scale: [1, 1.2, 1],
                              filter: [
                                "drop-shadow(0 0 2px #34d399)",
                                "drop-shadow(0 0 10px #34d399) drop-shadow(0 0 15px #10b981)",
                                "drop-shadow(0 0 2px #34d399)"
                              ]
                            }
                          : {
                              scale: 1,
                              filter: "drop-shadow(0 0 0px transparent)"
                            }
                      }
                      transition={
                        isChargingActive
                          ? {
                              repeat: Infinity,
                              duration: 0.9,
                              ease: "easeInOut"
                            }
                          : { duration: 0.2 }
                      }
                      className="flex items-center"
                    >
                      <Battery
                        size={13}
                        className={
                          isChargingActive
                            ? "text-emerald-300"
                            : batteryLevel > 50
                            ? "text-emerald-400"
                            : batteryLevel > 20
                            ? "text-amber-400"
                            : "text-rose-400 animate-pulse"
                        }
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* MAIN APP ENGINE VIEW OR HOME SCREEN WITH MULTI-TOUCH PINCH SCALING */}
              <motion.div
                animate={{
                  scale: isPinching || simulatedPinch ? pinchScale : 1,
                  borderRadius: isPinching || simulatedPinch || appSwitcherOpen ? "28px" : "0px",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                onTouchStart={handleMultiTouchStart}
                onTouchMove={handleMultiTouchMove}
                onTouchEnd={handleMultiTouchEnd}
                onWheel={handleWheelPinch}
                className="flex-1 overflow-hidden relative touch-auto"
              >
                {/* Visual HUD Overlay for Multi-Touch Pinch Gesture */}
                {(isPinching || simulatedPinch) && (
                  <div className="absolute inset-0 z-50 pointer-events-none bg-cyan-950/20 backdrop-blur-xs flex flex-col items-center justify-between p-4 border-2 border-cyan-400/80 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.4)] animate-in fade-in duration-150">
                    <div className="px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-400/80 text-cyan-300 font-mono text-[10px] font-extrabold flex items-center gap-1.5 shadow-lg">
                      <Sparkles size={11} className="text-cyan-400 animate-spin" />
                      <span>MULTI-TOUCH PINCH: {Math.round(pinchScale * 100)}%</span>
                      <span className="text-white font-bold bg-cyan-900/80 px-1.5 py-0.5 rounded text-[8px]">
                        {pinchScale < 0.8 ? "GRID OVERVIEW" : "ZOOMING"}
                      </span>
                    </div>

                    {/* Animated Simulated Touch Points with connecting laser line */}
                    <div className="relative w-48 h-24 flex items-center justify-between px-6 my-auto">
                      <motion.div
                        animate={{ x: isPinching ? 0 : [0, 45, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-8 h-8 rounded-full bg-cyan-400/40 border-2 border-cyan-300 shadow-[0_0_15px_#22d3ee] flex items-center justify-center text-slate-950 font-mono text-[9px] font-black"
                      >
                        1
                      </motion.div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 border-t border-dashed border-cyan-300 shadow-[0_0_8px_#22d3ee]" />
                      <motion.div
                        animate={{ x: isPinching ? 0 : [0, -45, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-8 h-8 rounded-full bg-cyan-400/40 border-2 border-cyan-300 shadow-[0_0_15px_#22d3ee] flex items-center justify-center text-slate-950 font-mono text-[9px] font-black"
                      >
                        2
                      </motion.div>
                    </div>

                    <div className="text-[9px] font-mono text-cyan-200 bg-slate-950/80 px-2 py-0.5 rounded">
                      Shrinking app windows into Grid Overview...
                    </div>
                  </div>
                )}

                {/* OS Gesture Engine Wrapper (Swipe-to-Back, Pull-Down-to-Refresh, Top Edge Control Center & Bottom Edge Recent Apps) */}
                <OSGestureHandler
                  activeApp={activeApp}
                  appDrawerOpen={appDrawerOpen}
                  appSwitcherOpen={appSwitcherOpen}
                  quickSettingsOpen={quickSettingsOpen}
                  onSwipeBack={handleSwipeBack}
                  onPullRefresh={handlePullRefresh}
                  onOpenControlCenter={() => setQuickSettingsOpen(true)}
                  onOpenRecents={() => {
                    setAppDrawerOpen(false);
                    setQuickSettingsOpen(false);
                    setAppSwitcherOpen(true);
                    triggerVibration("medium");
                  }}
                  onSystemLog={onSystemLog}
                >
                  <AnimatePresence mode="wait">
                    {activeApp ? (
                      <motion.div
                        key={activeApp}
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className="absolute inset-0 bg-slate-950 z-20 flex flex-col"
                      >
                      {activeApp === AppID.PHONE && <AppPhone />}
                      {activeApp === AppID.CONTACTS && <AppPhone />}
                      {activeApp === AppID.BROWSER && <AppBrowser />}
                      {activeApp === AppID.CHROME && <AppBrowser />}
                      {activeApp === AppID.MESSAGES && <AppMessages />}
                      {activeApp === AppID.CAMERA && <AppCamera />}
                      {activeApp === AppID.SECURITY && <AppSecurity />}
                      {activeApp === AppID.FILE_MANAGER && <AppFileManager />}
                      {activeApp === AppID.DOWNLOADS && <AppFileManager />}
                      {activeApp === AppID.AI_ASSISTANT && <AppAIAssistant />}
                      {activeApp === AppID.GALLERY && <AppGallery />}
                      {activeApp === AppID.MUSIC && <AppMusic />}
                      {activeApp === AppID.WEATHER && <AppWeather />}
                      {activeApp === AppID.CLOCK && <AppClock />}
                      {activeApp === AppID.FM_RADIO && <AppFMRadio />}
                      {activeApp === AppID.EMAIL && <AppEmail />}
                      {activeApp === AppID.GMAIL && <AppEmail />}
                      {activeApp === AppID.MAPS && <AppMaps />}
                      {activeApp === AppID.PLAY_STORE && <AppPlayStore />}
                      {activeApp === AppID.GOOGLE_PLAY_SERVICES && <AppPlayStore />}
                      {activeApp === AppID.YOUTUBE && <AppYouTubeSuite initialMode="youtube" />}
                      {activeApp === AppID.YOUTUBE_MUSIC && <AppYouTubeSuite initialMode="music" />}
                      {activeApp === AppID.SKYPE && <AppMeet />}
                      {activeApp === AppID.ZOOM && <AppMeet />}
                      {activeApp === AppID.GPAY && <AppPaymentSuite initialApp={AppID.GPAY} />}
                      {activeApp === AppID.PHONEPE && <AppPaymentSuite initialApp={AppID.PHONEPE} />}
                      {activeApp === AppID.PAYTM && <AppPaymentSuite initialApp={AppID.PAYTM} />}
                      {activeApp === AppID.BHIM && <AppPaymentSuite initialApp={AppID.BHIM} />}
                      {activeApp === AppID.GOOGLE_CLASSROOM && <AppLearningHub initialTab="classroom" />}
                      {activeApp === AppID.COURSERA && <AppLearningHub initialTab="coursera" />}
                      {activeApp === AppID.UDEMY && <AppLearningHub initialTab="udemy" />}
                      {activeApp === AppID.DUOLINGO && <AppLearningHub initialTab="duolingo" />}
                      {activeApp === AppID.KEEP && <AppNotes />}
                      {activeApp === AppID.MS_WORD && <AppWorkSuite initialApp={AppID.MS_WORD} />}
                      {activeApp === AppID.MS_EXCEL && <AppWorkSuite initialApp={AppID.MS_EXCEL} />}
                      {activeApp === AppID.MS_POWERPOINT && <AppWorkSuite initialApp={AppID.MS_POWERPOINT} />}
                      {activeApp === AppID.MS_TEAMS && <AppWorkSuite initialApp={AppID.MS_TEAMS} />}
                      {activeApp === AppID.SLACK && <AppWorkSuite initialApp={AppID.SLACK} />}
                      {activeApp === AppID.NOTION && <AppWorkSuite initialApp={AppID.NOTION} />}
                      {activeApp === AppID.TRELLO && <AppWorkSuite initialApp={AppID.TRELLO} />}
                      {activeApp === AppID.TODOIST && <AppWorkSuite initialApp={AppID.TODOIST} />}
                      {activeApp === AppID.ONEDRIVE && <AppWorkSuite initialApp={AppID.ONEDRIVE} />}
                      {activeApp === AppID.DROPBOX && <AppWorkSuite initialApp={AppID.DROPBOX} />}
                      {activeApp === AppID.FIND_MY_DEVICE && <AppSecurityHub initialApp={AppID.FIND_MY_DEVICE} />}
                      {activeApp === AppID.PLAY_PROTECT && <AppSecurityHub initialApp={AppID.PLAY_PROTECT} />}
                      {activeApp === AppID.DEVICE_MANAGER && <AppSecurityHub initialApp={AppID.DEVICE_MANAGER} />}
                      {activeApp === AppID.PASSWORD_MANAGER && <AppSecurityHub initialApp={AppID.PASSWORD_MANAGER} />}
                      {activeApp === AppID.VPN && <AppSecurityHub initialApp={AppID.VPN} />}
                      {activeApp === AppID.ANTIVIRUS && <AppSecurityHub initialApp={AppID.ANTIVIRUS} />}
                      {activeApp === AppID.BACKUP && <AppSecurityHub initialApp={AppID.BACKUP} />}
                      {activeApp === AppID.TERMINAL && (
                        <AppTerminal
                          onReboot={triggerReboot}
                          onPowerOff={triggerPowerOff}
                          uptimeSeconds={uptimeSeconds}
                          ramUsedMB={ramUsed}
                          onSystemLog={onSystemLog}
                          onOpenApp={(appId) => openApp(appId)}
                          onTriggerOsDownload={() => setIsOsDownloadOpen(true)}
                          onTriggerBootAnim={() => triggerQuantumBoot("quantum_neon")}
                        />
                      )}
                      {activeApp === AppID.SETTINGS && (
                        <AppSettings
                          currentWallpaperId={currentWallpaperId}
                          onWallpaperChange={(id) => {
                            setCurrentWallpaperId(id);
                            try {
                              localStorage.setItem("kk_os_wallpaper", id);
                            } catch (e) {}
                            onSystemLog(`[ActivityManager] Wallpaper updated: ${id}`);
                          }}
                          brightness={brightness}
                          onBrightnessChange={(val) => setBrightness(val)}
                          settingsState={settingsState}
                          onSettingsStateChange={handleSettingsStateChange}
                          onReboot={triggerReboot}
                          onPowerOff={triggerPowerOff}
                          uptimeSeconds={uptimeSeconds}
                          performanceMode={performanceMode}
                          onPerformanceModeChange={onPerformanceModeChange}
                          isBatterySaver={isBatterySaver}
                          onToggleBatterySaver={onToggleBatterySaver}
                          batteryLevel={batteryLevel}
                          initialSubView={settingsSubView}
                          onOpenApp={(appId) => openApp(appId)}
                          onSystemLog={onSystemLog}
                          onTriggerOsDownload={() => setIsOsDownloadOpen(true)}
                          onTriggerBootAnim={() => triggerQuantumBoot("quantum_neon")}
                        />
                      )}
                      {activeApp === AppID.CALCULATOR && <AppCalculator />}
                      {activeApp === AppID.CHATGPT && <AppChatGPT />}
                      {activeApp === AppID.CLAUDE && <AppClaude />}
                      {activeApp === AppID.GEMINI && <AppGemini />}
                      {activeApp === AppID.GROK && <AppGrok />}
                      {activeApp === AppID.DRIVE && <AppDrive />}
                      {activeApp === AppID.SHEETS && <AppSheets />}
                      {activeApp === AppID.SLIDES && <AppSlides />}
                      {activeApp === AppID.DOCS && <AppDocs />}
                      {activeApp === AppID.CALENDAR && <AppCalendar />}
                      {activeApp === AppID.MEET && <AppMeet />}
                      {activeApp === AppID.LINKEDIN && <AppLinkedIn />}
                      {activeApp === AppID.TRANSLATOR && <AppTranslator />}
                      {activeApp === AppID.VOICE_RECORDER && <AppVoiceRecorder />}
                      {activeApp === AppID.DICTIONARY && <AppDictionary />}
                      {activeApp === AppID.NOTES && <AppNotes />}
                      {activeApp === AppID.PDF_READER && <AppPdfReader />}
                      {activeApp === AppID.EMERGENCY_SOS && <AppEmergencySOS />}
                      {activeApp === AppID.QR_SCANNER && <AppQrScanner />}
                      {activeApp === AppID.CHESS && <AppChess />}
                      {activeApp === AppID.PUZZLE_GAME && <AppPuzzleGame />}
                      {activeApp === AppID.BRAIN_TRAINING && <AppBrainTraining />}
                      {activeApp === AppID.ACC_MONITOR && <AppAccMonitor />}
                      {activeApp === AppID.TASK_MANAGER && (
                        <AppTaskManager
                          ramUsedMB={ramUsed}
                          onUpdateRamUsed={(newRamMB) => setRamUsed(newRamMB)}
                          onSystemLog={onSystemLog}
                          onOpenApp={(appId) => openApp(appId)}
                          batteryLevel={batteryLevel}
                          isBatterySaver={isBatterySaver}
                          performanceMode={performanceMode}
                          onToggleBatterySaver={onToggleBatterySaver}
                        />
                      )}
                    </motion.div>
                  ) : (
                    /* HOME SCREEN WITH SEARCH WIDGET, WEATHER WIDGET & APP GRID */
                    <motion.div
                      key="launcher-home-view"
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      className="flex flex-col h-full p-3 justify-between"
                      id="launcher-home-view"
                    >
                      
                      {/* Top Global Search Widget with Gemini AI */}
                      <GlobalSearchBar
                        allApps={allApps}
                        onOpenApp={(appId) => openApp(appId)}
                        onSystemLog={onSystemLog}
                      />

                      {/* Real-time Battery & Date Home Screen Widget */}
                      <HomeScreenWidget
                        currentTime={currentTime}
                        batteryLevel={batteryLevel}
                        isChargingActive={isChargingActive}
                        isBatterySaver={isBatterySaver}
                        onToggleBatterySaver={onToggleBatterySaver}
                        onToggleCharging={() => {
                          const newLevel = isChargingActive
                            ? Math.max(15, batteryLevel - 1)
                            : Math.min(100, batteryLevel + 5);
                          onBatteryChange?.(newLevel);
                          setIsCharging(!isCharging);
                        }}
                        onOpenApp={(appId) => openApp(appId)}
                        onSystemLog={onSystemLog}
                      />

                      {/* Main Home Screen Grid (Folders + Apps with Drag and Drop) */}
                      <div className="flex flex-col my-auto gap-2">
                        {/* Drag and Drop Tip & Auto-Organize button */}
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[8px] font-mono text-slate-400">
                            💡 Drag icons onto each other to group
                          </span>
                          <button
                            type="button"
                            onClick={handleAutoOrganizeFolders}
                            className="text-[8.5px] font-mono font-bold text-teal-300 hover:text-white flex items-center gap-1 bg-teal-950/70 border border-teal-500/50 hover:border-teal-400 px-2 py-0.5 rounded-full hover:scale-105 transition-all cursor-pointer shadow-xs"
                            title="Auto-group all apps into AI, Tools, Media, and Games folders"
                          >
                            <Sparkles size={9} className="text-teal-400 animate-pulse" />
                            <span>Auto-Organize</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                          {/* Render Homescreen Categorized Folders */}
                          {folders.map((folder) => (
                            <FolderIconButton
                              key={folder.id}
                              folder={folder}
                              allApps={allApps}
                              onOpenFolder={(fId) => {
                                setActiveFolderId(fId);
                                triggerVibration("light");
                              }}
                              isDragOver={dragTargetId === folder.id}
                              onDragOver={handleDragOverItem}
                              onDragLeave={handleDragLeaveItem}
                              onDrop={handleDropOnFolder}
                            />
                          ))}

                          {/* Render Standalone Homescreen App Icons */}
                          {homescreenAppIds.map((appId) => {
                            const app = allApps.find((a) => a.id === appId);
                            if (!app) return null;
                            return (
                              <AppIconButton
                                key={app.id}
                                app={app}
                                onOpen={openApp}
                                onLongPress={handleLongPressApp}
                                cacheMB={getAppCacheMB(app.id)}
                                draggable={true}
                                isDragging={draggedAppId === app.id}
                                isDragOver={dragTargetId === app.id}
                                onDragStart={handleDragStartApp}
                                onDragOver={handleDragOverItem}
                                onDragLeave={handleDragLeaveItem}
                                onDrop={handleDropOnApp}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Folder Overlay Modal */}
                      {activeFolderId && (
                        <AnimatePresence>
                          {(() => {
                            const currentFolder = folders.find((f) => f.id === activeFolderId);
                            if (!currentFolder) return null;

                            const folderApps = currentFolder.appIds
                              .map((id) => allApps.find((a) => a.id === id))
                              .filter(Boolean) as Array<typeof allApps[0]>;

                            const isEditing = editingFolderNameId === currentFolder.id;

                            return (
                              <motion.div
                                key="folder-modal-overlay"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl z-40 flex flex-col items-center justify-center p-4"
                                onClick={() => {
                                  setActiveFolderId(null);
                                  setEditingFolderNameId(null);
                                }}
                              >
                                <div
                                  className="w-full max-w-xs bg-slate-900/95 border border-teal-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Header / Folder Name */}
                                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2 flex-1">
                                      <Folder className="text-teal-400" size={18} />
                                      {isEditing ? (
                                        <form
                                          onSubmit={(e) => {
                                            e.preventDefault();
                                            if (newFolderNameInput.trim()) {
                                              setFolders((prev) =>
                                                prev.map((f) =>
                                                  f.id === currentFolder.id
                                                    ? { ...f, name: newFolderNameInput.trim() }
                                                    : f
                                                )
                                              );
                                              showActionToast(`Renamed folder to "${newFolderNameInput.trim()}"`);
                                            }
                                            setEditingFolderNameId(null);
                                          }}
                                          className="flex items-center gap-1 flex-1"
                                        >
                                          <input
                                            type="text"
                                            value={newFolderNameInput}
                                            onChange={(e) => setNewFolderNameInput(e.target.value)}
                                            autoFocus
                                            className="bg-slate-800 text-slate-100 text-sm font-bold px-2 py-1 rounded border border-teal-400 focus:outline-none w-full"
                                          />
                                          <button
                                            type="submit"
                                            className="bg-teal-500 text-slate-950 text-xs px-2 py-1 rounded font-bold cursor-pointer"
                                          >
                                            Save
                                          </button>
                                        </form>
                                      ) : (
                                        <div
                                          className="flex items-center gap-2 group cursor-pointer"
                                          onClick={() => {
                                            setEditingFolderNameId(currentFolder.id);
                                            setNewFolderNameInput(currentFolder.name);
                                          }}
                                          title="Click to rename folder"
                                        >
                                          <h3 className="text-sm font-bold text-slate-100">
                                            {currentFolder.name}
                                          </h3>
                                          <Pencil size={12} className="text-slate-400 group-hover:text-teal-400 transition-colors" />
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveFolderId(null);
                                        setEditingFolderNameId(null);
                                      }}
                                      className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>

                                  {/* Folder App Grid */}
                                  <div className="grid grid-cols-3 gap-3 my-2 max-h-60 overflow-y-auto p-1">
                                    {folderApps.map((app) => (
                                      <div key={app.id} className="flex flex-col items-center relative group">
                                        <AppIconButton
                                          app={app}
                                          onOpen={(appId) => {
                                            setActiveFolderId(null);
                                            openApp(appId);
                                          }}
                                          onLongPress={handleLongPressApp}
                                          draggable={false}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveAppFromFolder(currentFolder.id, app.id)}
                                          className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                                          title={`Remove ${app.name} from folder`}
                                        >
                                          <X size={10} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Folder Actions Footer */}
                                  <div className="flex items-center justify-between border-t border-white/10 pt-3 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDissolveFolder(currentFolder.id)}
                                      className="text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-xl transition-all cursor-pointer font-medium"
                                    >
                                      Dissolve Folder
                                    </button>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {folderApps.length} Apps
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>
                      )}

                      {/* Simulated Multi-Touch Pinch Gesture Launcher Pill */}
                      <button
                        onClick={triggerSimulatedPinchGesture}
                        className="mx-auto my-1 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-[9.5px] font-mono font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer active:scale-95"
                        title="Simulate 2-finger pinch gesture to shrink windows into Grid Overview"
                      >
                        <Sparkles size={11} className="text-cyan-400 animate-pulse" />
                        <span>🤏 Pinch-in Gesture → Grid</span>
                      </button>

                      {/* Dock / Bottom Bar with 4 core apps + App Drawer button */}
                      <div className="bg-black/50 backdrop-blur-md rounded-3xl p-2 border border-white/10 flex items-center justify-around">
                        <button
                          onClick={() => openApp(AppID.PHONE)}
                          className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md cursor-pointer"
                        >
                          <PhoneIcon size={18} />
                        </button>

                        <button
                          onClick={() => openApp(AppID.MESSAGES)}
                          className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-md cursor-pointer"
                        >
                          <MessageSquare size={18} />
                        </button>

                        <button
                          onClick={() => openApp(AppID.CAMERA)}
                          className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md cursor-pointer"
                        >
                          <CameraIcon size={18} />
                        </button>

                        <button
                          onClick={() => setAppDrawerOpen(true)}
                          className="h-10 w-10 rounded-2xl bg-slate-900/80 border border-slate-700 text-teal-400 flex items-center justify-center shadow-md cursor-pointer"
                        >
                          <Grid size={18} />
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
                </OSGestureHandler>
              </motion.div>

              {/* MODERN GESTURE NAVIGATION BAR (Swipe-up for Recents, Tap for Home, Back key) */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                className="relative h-[34px] flex items-center justify-between px-3 bg-black/95 border-t border-slate-900/80 z-35 shrink-0 select-none text-slate-400 group"
              >
                {/* Back Key (Left) */}
                <button
                  onClick={() => {
                    if (appSwitcherOpen) {
                      setAppSwitcherOpen(false);
                    } else if (appDrawerOpen) {
                      setAppDrawerOpen(false);
                    } else if (activeApp) {
                      setActiveApp(null);
                      onSystemLog("[ActivityManager] Back gesture executed.");
                    }
                  }}
                  className="p-1 rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer active:scale-95"
                  title="Back (or swipe in from left/right edge)"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Central Interactive Gesture Navigation Handle */}
                <div
                  onClick={() => {
                    if (appSwitcherOpen) {
                      setAppSwitcherOpen(false);
                    } else {
                      setActiveApp(null);
                      setAppDrawerOpen(false);
                      onSystemLog("[ActivityManager] Home gesture: Navigated to Home.");
                    }
                  }}
                  className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group/pill"
                  title="Swipe up for Recent Apps • Tap for Home"
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-200 shadow-sm ${
                      appSwitcherOpen
                        ? "w-28 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.7)]"
                        : "w-24 bg-slate-600 group-hover/pill:bg-teal-400 group-hover/pill:w-28"
                    }`}
                  />
                  <span className="text-[7.5px] font-mono text-slate-400 group-hover/pill:text-teal-300 transition-colors mt-0.5 tracking-tight">
                    {appSwitcherOpen ? "Tap to close Recents" : "↑ Swipe up for Recents • Tap Home"}
                  </span>
                </div>

                {/* Home Indicator Icon / Quick Action (Right) */}
                <button
                  onClick={() => {
                    setActiveApp(null);
                    setAppDrawerOpen(false);
                    setAppSwitcherOpen(false);
                    onSystemLog("[ActivityManager] Home button clicked.");
                  }}
                  className="p-1 rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer active:scale-95"
                  title="Home Screen"
                >
                  <Home size={14} />
                </button>
              </div>

            </div>
          )}

          {/* OS DOWNLOAD & FIRMWARE FLASH ANIMATION MODAL */}
          <AnimatePresence>
            {isOsDownloadOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute inset-0 z-50 overflow-hidden"
              >
                <OSDownloadAnimation
                  versionName="KK Mobile OS v2.5 (Quantum Edition)"
                  totalSizeGB={3.84}
                  onRebootToNewOS={() => {
                    setIsOsDownloadOpen(false);
                    triggerQuantumBoot("quantum_neon");
                  }}
                  onClose={() => setIsOsDownloadOpen(false)}
                  onSystemLog={onSystemLog}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* FLOATING VOLUME CONTROLLER & HAPTIC MIXER HUD */}
          <FloatingVolumeSlider
            isVisible={isVolumeHudVisible}
            onClose={() => setIsVolumeHudVisible(false)}
            volumeLevels={volumeLevels}
            onVolumeChange={handleVolumeStreamChange}
            soundProfile={soundProfile}
            onSoundProfileChange={(prof) => {
              setSoundProfile(prof);
              if (prof === "silent") {
                setMuted(true);
              } else {
                setMuted(volumeLevels.media === 0);
              }
            }}
            outputDevice={audioOutputDevice}
            onOutputDeviceChange={setAudioOutputDevice}
            onSystemLog={onSystemLog}
            triggerVibration={triggerVibration}
            activeStream={activeAudioStream}
            onActiveStreamChange={setActiveAudioStream}
          />

        </div>
      </motion.div>

      {/* Storage Manager Utility Modal */}
      <StorageManagerModal
        isOpen={isStorageManagerOpen}
        onClose={() => setIsStorageManagerOpen(false)}
        onOpenApp={(appId) => {
          setActiveApp(appId);
          setRecentApps((prev) => [appId, ...prev.filter((id) => id !== appId)]);
        }}
        onSystemLog={onSystemLog}
      />
    </div>
  );
}
