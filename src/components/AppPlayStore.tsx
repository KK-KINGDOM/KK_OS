import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Search,
  Download,
  CheckCircle,
  ShieldCheck,
  Star,
  Sparkles,
  TrendingUp,
  Grid,
  Info,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sliders
} from "lucide-react";
import { playClickSound, playAppLaunchSound } from "../utils/sound";

interface PlayApp {
  id: string;
  name: string;
  developer: string;
  category: "Productivity" | "Games" | "Communication" | "Social" | "Tools";
  rating: number;
  reviews: string;
  size: string;
  downloads: string;
  iconBg: string;
  iconLetter: string;
  description: string;
  isInstalled: boolean;
}

const STORE_APPS: PlayApp[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Messenger",
    developer: "Meta Platforms Inc.",
    category: "Communication",
    rating: 4.6,
    reviews: "180M",
    size: "42 MB",
    downloads: "5B+",
    iconBg: "from-emerald-500 to-green-700",
    iconLetter: "W",
    description: "Simple. Reliable. Private. Messaging and voice calls with end-to-end encryption.",
    isInstalled: true
  },
  {
    id: "spotify",
    name: "Spotify: Music and Podcasts",
    developer: "Spotify AB",
    category: "Communication",
    rating: 4.7,
    reviews: "35M",
    size: "38 MB",
    downloads: "1B+",
    iconBg: "from-green-500 to-emerald-800",
    iconLetter: "S",
    description: "Stream millions of songs and podcasts on demand with personalized daily mixes.",
    isInstalled: true
  },
  {
    id: "instagram",
    name: "Instagram",
    developer: "Instagram",
    category: "Social",
    rating: 4.5,
    reviews: "150M",
    size: "54 MB",
    downloads: "5B+",
    iconBg: "from-purple-600 via-pink-600 to-amber-500",
    iconLetter: "IG",
    description: "Create and share photos, stories, and reels with the friends and creators you care about.",
    isInstalled: false
  },
  {
    id: "netflix",
    name: "Netflix",
    developer: "Netflix, Inc.",
    category: "Communication",
    rating: 4.4,
    reviews: "14M",
    size: "62 MB",
    downloads: "1B+",
    iconBg: "from-red-600 to-black",
    iconLetter: "N",
    description: "Watch award-winning movies, TV shows, anime, and original documentaries anywhere.",
    isInstalled: false
  },
  {
    id: "subway_surfers",
    name: "Subway Surfers",
    developer: "SYBO Games",
    category: "Games",
    rating: 4.8,
    reviews: "40M",
    size: "95 MB",
    downloads: "1B+",
    iconBg: "from-amber-500 via-rose-500 to-purple-600",
    iconLetter: "SS",
    description: "Dodge trains, dash through world tour cities, and surf hoverboards at breakneck speed.",
    isInstalled: true
  },
  {
    id: "zoom_cloud",
    name: "Zoom Workplace",
    developer: "zoom.us",
    category: "Productivity",
    rating: 4.5,
    reviews: "4M",
    size: "48 MB",
    downloads: "500M+",
    iconBg: "from-blue-600 to-sky-700",
    iconLetter: "Z",
    description: "AI-powered workspace for team chat, video meetings, and whiteboard collaboration.",
    isInstalled: true
  }
];

export default function AppPlayStore() {
  const [apps, setApps] = useState<PlayApp[]>(STORE_APPS);
  const [activeTab, setActiveTab] = useState<"for_you" | "top_charts" | "protect">("for_you");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<PlayApp | null>(null);
  const [isScanningProtect, setIsScanningProtect] = useState(false);
  const [protectStatus, setProtectStatus] = useState<string>("All 52 apps verified clean by Play Protect.");

  const filteredApps = apps.filter(
    (a) =>
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleInstall = (id: string) => {
    playClickSound();
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isInstalled: !app.isInstalled } : app))
    );
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp((prev) => (prev ? { ...prev, isInstalled: !prev.isInstalled } : null));
    }
  };

  const handleScanProtect = () => {
    playClickSound();
    setIsScanningProtect(true);
    setTimeout(() => {
      setIsScanningProtect(false);
      setProtectStatus("Scan completed. No harmful apps detected across device storage.");
    }, 1800);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden">
      {/* Top Play Store Bar */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-500 text-white shadow-md">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">Google Play</h2>
            <span className="text-[10px] text-slate-400 font-mono">Play Services v26.04.14</span>
          </div>
        </div>

        {/* Tab Pill Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("for_you")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "for_you" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("top_charts")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "top_charts" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Top Charts
          </button>
          <button
            onClick={() => setActiveTab("protect")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "protect" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Protect
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Search Header */}
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, games, tools..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none"
          />
        </div>

        {activeTab === "for_you" && (
          <>
            {/* Featured Banner Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-indigo-500/30 shadow-xl space-y-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono text-[9px] font-extrabold uppercase">
                Featured App Choice
              </span>
              <h3 className="text-sm font-black text-white">WhatsApp & Spotify Pro</h3>
              <p className="text-xs text-slate-300">
                Experience high-bitrate audio and encrypted messaging tailored for KK-Mobile-OS.
              </p>
            </div>

            {/* Popular App Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
                Recommended For You
              </h3>

              <div className="space-y-2.5">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedApp(app);
                    }}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${app.iconBg} text-white font-extrabold text-sm flex items-center justify-center shadow-md`}>
                        {app.iconLetter}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {app.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">{app.category} • ★ {app.rating}</p>
                        <span className="text-[9px] text-slate-500 font-mono">{app.size}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleInstall(app.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                        app.isInstalled
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-750"
                          : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md"
                      }`}
                    >
                      {app.isInstalled ? "Open" : "Install"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "top_charts" && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
              Top Free Charts
            </h3>
            {apps.map((app, index) => (
              <div
                key={app.id}
                onClick={() => {
                  playClickSound();
                  setSelectedApp(app);
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 cursor-pointer group hover:bg-slate-850 transition-all"
              >
                <span className="text-base font-mono font-black text-slate-500 w-4 text-center">
                  {index + 1}
                </span>
                <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${app.iconBg} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}>
                  {app.iconLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{app.name}</h4>
                  <p className="text-[10px] text-slate-400">{app.developer}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleInstall(app.id);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-cyan-600 text-white font-bold text-xs shrink-0"
                >
                  {app.isInstalled ? "Open" : "Get"}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "protect" && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Google Play Protect</h3>
                <p className="text-xs text-emerald-400 font-mono">Real-Time Threat Scanner Active</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{protectStatus}</p>
              <span className="text-[10px] text-slate-500 font-mono block">Last scan: Just now</span>
            </div>

            <button
              onClick={handleScanProtect}
              disabled={isScanningProtect}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <RefreshCw size={14} className={isScanningProtect ? "animate-spin" : ""} />
              <span>{isScanningProtect ? "Scanning App Packages..." : "Scan Device Now"}</span>
            </button>
          </div>
        )}
      </div>

      {/* App Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-4 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold">App Specification</span>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-3xl bg-gradient-to-br ${selectedApp.iconBg} text-white font-black text-2xl flex items-center justify-center shadow-xl`}>
                {selectedApp.iconLetter}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-white leading-tight">{selectedApp.name}</h3>
                <p className="text-xs text-cyan-400 font-medium">{selectedApp.developer}</p>
                <span className="text-[10px] text-slate-500 font-mono">{selectedApp.category}</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-xs font-black text-white">★ {selectedApp.rating}</span>
                <p className="text-[9px] text-slate-400">{selectedApp.reviews} reviews</p>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-xs font-black text-white">{selectedApp.size}</span>
                <p className="text-[9px] text-slate-400">Package Size</p>
              </div>
              <div>
                <span className="text-xs font-black text-white">{selectedApp.downloads}</span>
                <p className="text-[9px] text-slate-400">Downloads</p>
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs text-slate-300 leading-relaxed">
              <h4 className="font-bold text-white">About this app</h4>
              <p>{selectedApp.description}</p>
            </div>

            {/* Install / Open Action */}
            <div className="mt-auto pt-2">
              <button
                onClick={() => toggleInstall(selectedApp.id)}
                className={`w-full py-3 rounded-2xl font-black text-xs cursor-pointer shadow-xl active:scale-95 transition-all ${
                  selectedApp.isInstalled
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-cyan-600 hover:bg-cyan-500 text-white"
                }`}
              >
                {selectedApp.isInstalled ? "Uninstall / Reinstall" : "Install App"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
