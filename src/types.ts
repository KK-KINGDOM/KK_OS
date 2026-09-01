import type { CSSProperties } from "react";

export enum AppID {
  LAUNCHER = "launcher",
  SETTINGS = "settings",
  TERMINAL = "terminal",
  CALCULATOR = "calculator",
  FILE_MANAGER = "file_manager",
  AI_ASSISTANT = "ai_assistant",
  PHONE = "phone",
  CONTACTS = "contacts",
  MESSAGES = "messages",
  CAMERA = "camera",
  SECURITY = "security",
  GALLERY = "gallery",
  MUSIC = "music",
  WEATHER = "weather",
  CLOCK = "clock",
  BROWSER = "browser",
  CHROME = "chrome",
  TASK_MANAGER = "task_manager",
  APP_DRAWER = "app_drawer",
  CHATGPT = "chatgpt",
  CLAUDE = "claude",
  GEMINI = "gemini",
  GROK = "grok",
  DRIVE = "drive",
  SHEETS = "sheets",
  SLIDES = "slides",
  DOCS = "docs",
  CALENDAR = "calendar",
  MEET = "meet",
  LINKEDIN = "linkedin",
  TRANSLATOR = "translator",
  VOICE_RECORDER = "voice_recorder",
  DICTIONARY = "dictionary",
  NOTES = "notes",
  PDF_READER = "pdf_reader",
  EMERGENCY_SOS = "emergency_sos",
  QR_SCANNER = "qr_scanner",
  CHESS = "chess",
  PUZZLE_GAME = "puzzle_game",
  BRAIN_TRAINING = "brain_training",
  ACC_MONITOR = "acc_monitor",
  // New comprehensive apps
  FM_RADIO = "fm_radio",
  EMAIL = "email",
  GMAIL = "gmail",
  MAPS = "maps",
  PLAY_STORE = "play_store",
  PLAY_SERVICES = "play_services",
  GOOGLE_PLAY_SERVICES = "play_services",
  YOUTUBE = "youtube",
  YOUTUBE_MUSIC = "youtube_music",
  PAYMENTS = "payments",
  GPAY = "gpay",
  PHONEPE = "phonepe",
  PAYTM = "paytm",
  BHIM = "bhim",
  LEARNING_HUB = "learning_hub",
  COURSERA = "coursera",
  UDEMY = "udemy",
  DUOLINGO = "duolingo",
  CLASSROOM = "classroom",
  GOOGLE_CLASSROOM = "classroom",
  WORK_SUITE = "work_suite",
  WORD = "word",
  MS_WORD = "word",
  EXCEL = "excel",
  MS_EXCEL = "excel",
  POWERPOINT = "powerpoint",
  MS_POWERPOINT = "powerpoint",
  TEAMS = "teams",
  MS_TEAMS = "teams",
  SLACK = "slack",
  NOTION = "notion",
  TRELLO = "trello",
  TODOIST = "todoist",
  ONEDRIVE = "onedrive",
  DROPBOX = "dropbox",
  KEEP = "keep",
  SECURITY_HUB = "security_hub",
  FIND_MY_DEVICE = "find_my_device",
  PLAY_PROTECT = "play_protect",
  DEVICE_MANAGER = "device_manager",
  PASSWORD_MANAGER = "password_manager",
  VPN = "vpn",
  ANTIVIRUS = "antivirus",
  BACKUP = "backup",
  SKYPE = "skype",
  ZOOM = "zoom",
  DOWNLOADS = "downloads"
}

export interface AppConfig {
  id: AppID;
  name: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class
  description: string;
}

export interface OSFile {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: OSFile[];
  content?: string;
  size?: string;
}

export interface TerminalLog {
  text: string;
  type: "input" | "output" | "error" | "system" | "success";
  timestamp: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  groundingSources?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
}

export interface Wallpaper {
  id: string;
  name: string;
  className: string; // tailwind gradient classes
  thumbnail: string;
  imageUrl?: string;
  category?: "gradient" | "pattern" | "abstract" | "custom";
  description?: string;
  customStyle?: CSSProperties;
}

export type LogSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface NotificationAction {
  id: string;
  label: string;
  type?: "reply" | "mark_read" | "archive" | "open_app" | "custom";
  appId?: AppID;
  primary?: boolean;
}

export interface SystemToast {
  id: string;
  logText: string;
  severity: "WARNING" | "CRITICAL" | "INFO";
  timestamp: string;
  module?: string;
  title?: string;
  message?: string;
  sender?: string;
  senderAvatar?: string;
  category?: "system" | "message" | "security" | "battery" | "app";
  isRead?: boolean;
  isArchived?: boolean;
  replyText?: string;
  replySentAt?: string;
  actions?: NotificationAction[];
  appId?: AppID;
}

export interface SystemMetrics {
  cpuUsage: number;
  ramUsage: number;
  batteryLevel: number;
  temperature: number;
}
