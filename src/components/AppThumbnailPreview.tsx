import React from "react";
import {
  Globe,
  Bot,
  Sparkles,
  Terminal,
  Calculator,
  Phone,
  MessageSquare,
  Camera,
  ShieldCheck,
  HardDrive,
  Image as ImageIcon,
  Music,
  CloudSun,
  Clock,
  Cpu,
  Settings,
  Edit3,
  FileSpreadsheet,
  FileText,
  Presentation,
  Calendar,
  Video,
  Radio,
  Check,
  Search,
  Wifi,
  Folder,
  Play,
  Volume2,
  Lock,
  Activity,
  Crown,
  Gamepad2,
  Brain,
  Siren,
  QrCode,
  BookOpen,
  Languages,
  Disc
} from "lucide-react";
import { AppID } from "../types";

interface AppThumbnailPreviewProps {
  appId: AppID;
  appName: string;
  color: string;
}

export default function AppThumbnailPreview({
  appId,
  appName,
  color
}: AppThumbnailPreviewProps) {
  switch (appId) {
    case AppID.BROWSER:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col gap-1.5 select-none font-sans text-[8px] overflow-hidden">
          {/* Address Bar */}
          <div className="h-5 bg-slate-900 border border-slate-800 rounded-lg px-2 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1 truncate">
              <Globe size={10} className="text-teal-400 shrink-0" />
              <span className="font-mono text-[7.5px] text-teal-300 truncate">https://google.com/search</span>
            </div>
            <span className="text-[7px] text-slate-500 font-mono">🔒</span>
          </div>
          {/* Mini Search Bar & Content */}
          <div className="flex-1 bg-slate-900/60 rounded-lg p-1.5 flex flex-col gap-1 border border-slate-850">
            <div className="h-4 bg-slate-800 rounded flex items-center px-1.5 gap-1">
              <Search size={8} className="text-slate-400" />
              <div className="h-1.5 w-16 bg-slate-600 rounded-full" />
            </div>
            <div className="space-y-1 mt-1">
              <div className="h-2 w-20 bg-teal-500/40 rounded" />
              <div className="h-1.5 w-full bg-slate-800 rounded" />
              <div className="h-1.5 w-3/4 bg-slate-800 rounded" />
            </div>
            <div className="space-y-1 mt-1">
              <div className="h-2 w-16 bg-cyan-500/40 rounded" />
              <div className="h-1.5 w-full bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      );

    case AppID.AI_ASSISTANT:
    case AppID.CHATGPT:
    case AppID.CLAUDE:
    case AppID.GEMINI:
    case AppID.GROK:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col gap-1.5 font-sans select-none overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-850 text-slate-300">
            <Sparkles size={10} className="text-cyan-400" />
            <span className="text-[8px] font-bold truncate">{appName} AI</span>
            <span className="ml-auto text-[6.5px] bg-cyan-950 text-cyan-300 px-1 py-0.2 rounded font-mono">
              GPT-4o
            </span>
          </div>
          {/* Chat bubbles */}
          <div className="flex-1 flex flex-col gap-1.5 justify-end">
            <div className="self-end max-w-[80%] bg-teal-600/30 border border-teal-500/40 text-teal-200 rounded-lg px-2 py-1 text-[7.5px]">
              How can I optimize device performance?
            </div>
            <div className="self-start max-w-[85%] bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-[7.5px] space-y-0.5">
              <p className="font-semibold text-cyan-300">AI Assistant:</p>
              <div className="h-1 w-full bg-slate-700 rounded" />
              <div className="h-1 w-3/4 bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      );

    case AppID.TERMINAL:
      return (
        <div className="w-full h-full bg-black p-2 font-mono text-[7px] text-emerald-400 flex flex-col gap-1 select-none overflow-hidden">
          <div className="flex items-center gap-1 pb-1 border-b border-emerald-950 text-slate-500">
            <Terminal size={9} className="text-emerald-500" />
            <span>bash - kkos@kernel</span>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-slate-400">$ kkos-sys --version</p>
            <p className="text-emerald-400 font-bold">KK OS Linux 6.8.0-kkos-arm64</p>
            <p className="text-slate-400">$ systemctl status selinux</p>
            <p className="text-cyan-400">● selinux.service - Enforcing</p>
            <div className="flex items-center gap-1 text-emerald-300 animate-pulse">
              <span>kkos@root:~#</span>
              <span className="w-1.5 h-3 bg-emerald-400 inline-block" />
            </div>
          </div>
        </div>
      );

    case AppID.CALCULATOR:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col justify-between select-none font-mono">
          {/* Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-right">
            <span className="text-[7px] text-slate-500 block">3,14159 x 2</span>
            <span className="text-xs font-bold text-amber-400">6,28318</span>
          </div>
          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1">
            {["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+"].map((k, i) => (
              <div
                key={i}
                className={`h-3.5 rounded flex items-center justify-center text-[7px] font-bold ${
                  ["÷", "×", "-", "+"].includes(k)
                    ? "bg-amber-600 text-white"
                    : ["C", "±", "%"].includes(k)
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-900 text-slate-200"
                }`}
              >
                {k}
              </div>
            ))}
          </div>
        </div>
      );

    case AppID.PHONE:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col justify-between font-sans select-none">
          {/* Active Call / Number */}
          <div className="text-center pt-1">
            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center font-bold text-[8px]">
              KK
            </div>
            <p className="text-[8.5px] font-bold text-white mt-1">+1 (555) 019-2834</p>
            <span className="text-[6.5px] text-emerald-400 font-mono">Calling... 00:12</span>
          </div>
          {/* Mini Keypad */}
          <div className="grid grid-cols-3 gap-1 px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <div
                key={num}
                className="h-3 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[7px] text-slate-300 font-bold"
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      );

    case AppID.MESSAGES:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col gap-1 font-sans select-none overflow-hidden">
          <div className="flex items-center gap-1 pb-1 border-b border-slate-850">
            <MessageSquare size={10} className="text-teal-400" />
            <span className="text-[8px] font-bold text-white">Alex Morgan</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex flex-col gap-1 justify-center">
            <div className="self-start max-w-[80%] bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1 text-[7px]">
              Are you free for the project review call at 3 PM?
            </div>
            <div className="self-end max-w-[75%] bg-teal-600 text-white rounded-lg p-1 text-[7px]">
              Yes! All slides are updated.
            </div>
          </div>
        </div>
      );

    case AppID.CAMERA:
      return (
        <div className="w-full h-full bg-slate-950 relative p-1 flex flex-col justify-between font-sans select-none overflow-hidden">
          {/* Viewfinder grid lines */}
          <div className="absolute inset-2 border border-slate-800/80 rounded-lg pointer-events-none grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-slate-850/40" />
            ))}
          </div>
          {/* Top Camera Status */}
          <div className="relative z-10 flex items-center justify-between px-2 pt-1 text-[7px] text-slate-400 font-mono">
            <span className="text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              00:28
            </span>
            <span>4K 60FPS</span>
          </div>
          {/* Center Target Box */}
          <div className="relative z-10 w-8 h-8 rounded-lg border border-amber-400/80 mx-auto flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
          {/* Shutter Bar */}
          <div className="relative z-10 flex items-center justify-center pb-1">
            <div className="w-5 h-5 rounded-full border-2 border-white bg-rose-500/80" />
          </div>
        </div>
      );

    case AppID.SECURITY:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col items-center justify-center gap-1 text-center font-sans select-none">
          <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <ShieldCheck size={18} />
          </div>
          <span className="text-[8.5px] font-bold text-white mt-0.5">Security Hub</span>
          <span className="text-[6.5px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.2 rounded font-mono font-bold">
            SELinux ENFORCING
          </span>
        </div>
      );

    case AppID.FILE_MANAGER:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col gap-1 font-sans select-none overflow-hidden">
          <div className="flex items-center gap-1 pb-1 border-b border-slate-850 text-indigo-400">
            <HardDrive size={10} />
            <span className="text-[8px] font-bold text-white">KK Storage</span>
          </div>
          <div className="space-y-1 text-[7.5px] text-slate-300">
            <div className="flex items-center gap-1.5 p-1 rounded bg-slate-900 border border-slate-850">
              <Folder size={10} className="text-amber-400" />
              <span>Documents</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-slate-900 border border-slate-850">
              <Folder size={10} className="text-cyan-400" />
              <span>DCIM Photos</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-slate-900 border border-slate-850">
              <Folder size={10} className="text-rose-400" />
              <span>Audio System</span>
            </div>
          </div>
        </div>
      );

    case AppID.GALLERY:
      return (
        <div className="w-full h-full bg-slate-950 p-1.5 grid grid-cols-2 gap-1 select-none overflow-hidden">
          <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white">
            <ImageIcon size={14} />
          </div>
          <div className="rounded-lg bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white">
            <ImageIcon size={14} />
          </div>
          <div className="rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white">
            <ImageIcon size={14} />
          </div>
          <div className="rounded-lg bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center text-white">
            <ImageIcon size={14} />
          </div>
        </div>
      );

    case AppID.MUSIC:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col items-center justify-between font-sans select-none">
          <div className="flex items-center gap-1 w-full text-rose-400 text-[8px] font-bold border-b border-slate-850 pb-1">
            <Music size={10} />
            <span className="truncate">Now Playing</span>
          </div>
          {/* Vinyl Disc */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 via-rose-950 to-slate-900 border-2 border-rose-500/60 flex items-center justify-center shadow-lg my-auto">
            <div className="w-3 h-3 rounded-full bg-rose-500 border border-white" />
          </div>
          <div className="w-full text-center space-y-0.5">
            <p className="text-[8px] font-bold text-white truncate">Cosmic Horizons</p>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-2/3" />
            </div>
          </div>
        </div>
      );

    case AppID.WEATHER:
      return (
        <div className="w-full h-full bg-gradient-to-br from-sky-900 via-indigo-950 to-slate-950 p-2 flex flex-col justify-between font-sans select-none text-white">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold">San Francisco</span>
            <CloudSun size={12} className="text-amber-400" />
          </div>
          <div className="my-auto">
            <span className="text-lg font-black tracking-tight">24°C</span>
            <p className="text-[7.5px] text-sky-200">Mostly Sunny • H: 26° L: 18°</p>
          </div>
        </div>
      );

    case AppID.CLOCK:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col items-center justify-center gap-1 font-mono select-none">
          <Clock size={16} className="text-amber-400" />
          <span className="text-sm font-extrabold text-white">10:45 AM</span>
          <span className="text-[6.5px] text-amber-300/80 bg-amber-950 border border-amber-800/80 px-1.5 py-0.2 rounded">
            ALARM IN 7H 15M
          </span>
        </div>
      );

    case AppID.TASK_MANAGER:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col justify-between font-sans select-none">
          <div className="flex items-center gap-1 text-cyan-400 pb-1 border-b border-slate-850">
            <Cpu size={10} />
            <span className="text-[8px] font-bold text-white">Task Monitor</span>
          </div>
          <div className="space-y-1 my-auto">
            <div className="flex justify-between text-[7px] text-slate-300 font-mono">
              <span>RAM</span>
              <span className="text-cyan-400 font-bold">3.8 / 8.0 GB</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full w-[48%]" />
            </div>
          </div>
        </div>
      );

    case AppID.SETTINGS:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col gap-1 font-sans select-none overflow-hidden text-[7.5px]">
          <div className="flex items-center gap-1 pb-1 border-b border-slate-850 text-slate-300">
            <Settings size={10} className="text-teal-400" />
            <span className="font-bold text-white">System Settings</span>
          </div>
          <div className="space-y-1 mt-0.5">
            <div className="flex items-center justify-between p-1 bg-slate-900 rounded border border-slate-850">
              <span className="text-slate-200">Wi-Fi Network</span>
              <div className="w-4 h-2 bg-teal-500 rounded-full flex items-center justify-end px-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex items-center justify-between p-1 bg-slate-900 rounded border border-slate-850">
              <span className="text-slate-200">Bluetooth 5.3</span>
              <div className="w-4 h-2 bg-teal-500 rounded-full flex items-center justify-end px-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      );

    case AppID.NOTES:
      return (
        <div className="w-full h-full bg-amber-950/40 p-2 flex flex-col gap-1 font-sans select-none overflow-hidden">
          <div className="flex items-center gap-1 text-amber-400 pb-1 border-b border-amber-800/40">
            <Edit3 size={10} />
            <span className="text-[8px] font-bold text-amber-200">Quick Notes</span>
          </div>
          <div className="space-y-1 text-[7px] text-amber-100/80">
            <p className="font-bold text-white">• Meeting Action Items</p>
            <p className="truncate">• Review system kernel logs</p>
            <p className="truncate">• Update security certificate</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full h-full bg-slate-950 p-2 flex flex-col items-center justify-center gap-1.5 select-none font-sans text-center">
          <div className={`w-8 h-8 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-md`}>
            <Sparkles size={16} />
          </div>
          <span className="text-[8.5px] font-bold text-white">{appName}</span>
          <span className="text-[6.5px] text-teal-400 font-mono bg-teal-950 border border-teal-800/80 px-1.5 py-0.2 rounded font-bold">
            BACKGROUND ACTIVE
          </span>
        </div>
      );
  }
}
