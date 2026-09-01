import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radio,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Bookmark,
  BookmarkCheck,
  Disc,
  Sliders,
  Sparkles,
  RefreshCw,
  Antenna,
  Headphones,
  Info,
  Layers
} from "lucide-react";
import { playClickSound } from "../utils/sound";

interface Station {
  frequency: number;
  name: string;
  genre: string;
  rds: string;
  signalStrength: number; // 1-5
  color: string;
}

const PRESET_STATIONS: Station[] = [
  { frequency: 91.1, name: "Radio City 91.1", genre: "Bollywood Hits", rds: "Currently Playing: Chaiyya Chaiyya - AR Rahman", signalStrength: 5, color: "from-rose-500 to-red-700" },
  { frequency: 92.7, name: "Big FM 92.7", genre: "Retro & Melody", rds: "Currently Playing: Roop Tera Mastana - Kishore Kumar", signalStrength: 4, color: "from-amber-500 to-orange-700" },
  { frequency: 93.5, name: "Red FM 93.5", genre: "Bajaate Raho Hot Hits", rds: "RJ Raunac: Morning Masala Live Show", signalStrength: 5, color: "from-red-600 to-rose-900" },
  { frequency: 94.3, name: "Radio One 94.3", genre: "International Pop", rds: "Currently Playing: Blinding Lights - The Weeknd", signalStrength: 4, color: "from-blue-600 to-cyan-700" },
  { frequency: 98.3, name: "Radio Mirchi 98.3", genre: "Mirchi Top 20", rds: "Currently Playing: Kesariya - Arijit Singh", signalStrength: 5, color: "from-orange-500 to-amber-600" },
  { frequency: 100.1, name: "AIR FM Rainbow", genre: "National Classic & News", rds: "AIR National News Hourly Bulletin", signalStrength: 4, color: "from-emerald-600 to-teal-800" },
  { frequency: 102.6, name: "AIR FM Gold 102.6", genre: "Golden Oldies & Ghazals", rds: "Ghazal Hour with Jagjit Singh", signalStrength: 5, color: "from-purple-600 to-indigo-800" },
  { frequency: 104.0, name: "Fever 104 FM", genre: "Youth Beats & EDM", rds: "Non-Stop High Energy Mix 2026", signalStrength: 4, color: "from-fuchsia-600 to-pink-700" },
  { frequency: 107.8, name: "Community FM 107.8", genre: "Local & Cultural", rds: "Local Weather and Farming Updates", signalStrength: 3, color: "from-teal-600 to-cyan-800" }
];

export default function AppFMRadio() {
  const [currentFreq, setCurrentFreq] = useState<number>(98.3);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<number[]>([98.3, 93.5, 91.1]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [eqPreset, setEqPreset] = useState<"Default" | "Bass Boost" | "Vocal" | "Live">("Bass Boost");
  const [activeTab, setActiveTab] = useState<"tuner" | "favorites" | "equalizer">("tuner");

  // Matched station if tuning aligns
  const currentStation = PRESET_STATIONS.find(
    (s) => Math.abs(s.frequency - currentFreq) < 0.15
  );

  // Recording counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleTune = (delta: number) => {
    playClickSound();
    setCurrentFreq((prev) => {
      let next = Math.round((prev + delta) * 10) / 10;
      if (next < 87.5) next = 108.0;
      if (next > 108.0) next = 87.5;
      return next;
    });
  };

  const handleAutoScan = () => {
    playClickSound();
    setIsScanning(true);
    let scanFreq = 87.5;
    const interval = setInterval(() => {
      scanFreq = Math.round((scanFreq + 0.5) * 10) / 10;
      setCurrentFreq(scanFreq);
      if (scanFreq >= 108.0) {
        clearInterval(interval);
        setIsScanning(false);
        setCurrentFreq(98.3);
      }
    }, 120);
  };

  const toggleFavorite = (freq: number) => {
    playClickSound();
    setFavorites((prev) =>
      prev.includes(freq) ? prev.filter((f) => f !== freq) : [...prev, freq]
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md">
            <Radio size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">FM Radio</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Antenna size={11} className={isPlaying ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
              <span>{isPlaying ? "LIVE BROADCAST (87.5 - 108.0 MHz)" : "STANDBY"}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("tuner")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "tuner" ? "bg-rose-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Tuner
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "favorites" ? "bg-rose-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Saved ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab("equalizer")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "equalizer" ? "bg-rose-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            EQ
          </button>
        </div>
      </div>

      {/* Main View Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "tuner" && (
          <>
            {/* Frequency Dial & RDS Display Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1">
                  <Headphones size={13} className="text-rose-400" />
                  <span>STEREO 96kHz</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>SIGNAL</span>
                  <div className="flex items-end gap-0.5 h-3">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`w-1 rounded-xs transition-all ${
                          lvl <= (currentStation?.signalStrength || 2)
                            ? "bg-emerald-400"
                            : "bg-slate-700"
                        }`}
                        style={{ height: `${lvl * 20}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Big Frequency Typography */}
              <div className="py-2">
                <span className="text-5xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
                  {currentFreq.toFixed(1)}
                </span>
                <span className="text-rose-400 font-mono text-lg font-bold ml-1.5">MHz</span>
              </div>

              {/* Station Name & RDS Text */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <h3 className="text-sm font-extrabold text-white truncate">
                  {currentStation ? currentStation.name : "Frequency Tuned - White Noise / Static"}
                </h3>
                <p className="text-[11px] text-amber-300 font-mono truncate">
                  {currentStation ? currentStation.rds : "RDS: Auto-scanning carrier frequency..."}
                </p>
              </div>

              {/* Visual Audio Waveform Bars */}
              <div className="flex items-center justify-center gap-1 h-8 pt-1">
                {isPlaying && currentStation ? (
                  [40, 75, 90, 50, 85, 100, 60, 95, 70, 80, 45, 90, 100, 65, 80, 55].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${h * 0.2}%`, `${h}%`, `${h * 0.4}%`] }}
                      transition={{ duration: 0.5 + (i % 3) * 0.2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-1 bg-gradient-to-t from-rose-500 via-amber-400 to-teal-400 rounded-full"
                    />
                  ))
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono">Audio stream paused</div>
                )}
              </div>
            </div>

            {/* Rotary Frequency Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>87.5 MHz</span>
                <span className="text-rose-400 font-bold">MANUAL TUNER</span>
                <span>108.0 MHz</span>
              </div>
              <input
                type="range"
                min={87.5}
                max={108.0}
                step={0.1}
                value={currentFreq}
                onChange={(e) => setCurrentFreq(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Controls Bar */}
            <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-around shadow-lg">
              <button
                onClick={() => handleTune(-0.1)}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95 transition-all"
                title="Previous Frequency (-0.1)"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setIsPlaying(!isPlaying);
                }}
                className="p-4 rounded-3xl bg-gradient-to-r from-rose-500 to-amber-500 text-white cursor-pointer shadow-lg active:scale-95 transition-all"
                title={isPlaying ? "Pause Radio" : "Play Radio"}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>

              <button
                onClick={() => handleTune(0.1)}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95 transition-all"
                title="Next Frequency (+0.1)"
              >
                <SkipForward size={18} />
              </button>

              <button
                onClick={() => toggleFavorite(currentFreq)}
                className={`p-3 rounded-2xl border cursor-pointer active:scale-95 transition-all ${
                  favorites.includes(currentFreq)
                    ? "bg-amber-400/20 border-amber-400 text-amber-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
                title="Bookmark Station"
              >
                {favorites.includes(currentFreq) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>

              <button
                onClick={handleAutoScan}
                disabled={isScanning}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-400 cursor-pointer active:scale-95 transition-all"
                title="Auto Scan Stations"
              >
                <RefreshCw size={18} className={isScanning ? "animate-spin text-rose-400" : ""} />
              </button>
            </div>

            {/* Live Broadcast Recorder */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isRecording ? "bg-rose-600 animate-pulse text-white" : "bg-slate-800 text-slate-400"}`}>
                  <Disc size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Broadcast Recorder</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {isRecording ? `RECORDING: ${recordSeconds}s (AAC 256kbps)` : "Capture audio clips to Storage"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setIsRecording(!isRecording);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                  isRecording
                    ? "bg-rose-500 hover:bg-rose-400 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                {isRecording ? "Stop & Save" : "Record Clip"}
              </button>
            </div>
          </>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
              Bookmarked FM Stations
            </h3>
            {favorites.map((freq) => {
              const station = PRESET_STATIONS.find((s) => s.frequency === freq) || {
                frequency: freq,
                name: `Custom Station ${freq} MHz`,
                genre: "FM Broadcast",
                rds: "Live Audio",
                signalStrength: 4,
                color: "from-blue-600 to-indigo-700"
              };

              return (
                <div
                  key={freq}
                  onClick={() => {
                    playClickSound();
                    setCurrentFreq(freq);
                    setIsPlaying(true);
                    setActiveTab("tuner");
                  }}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${station.color} text-white flex items-center justify-center font-mono font-black text-xs shadow-md`}>
                      {freq}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                        {station.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{station.genre}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(freq);
                      }}
                      className="p-1.5 text-amber-400 hover:text-rose-400"
                    >
                      <BookmarkCheck size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "equalizer" && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <Sliders size={16} />
              <span>Studio DSP Equalizer</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(["Default", "Bass Boost", "Vocal", "Live"] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    playClickSound();
                    setEqPreset(preset);
                  }}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                    eqPreset === preset
                      ? "bg-rose-500 text-white shadow-md"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-750"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* EQ Frequency Bands */}
            <div className="flex justify-between items-end h-32 pt-4 px-2">
              {[
                { label: "60Hz", val: eqPreset === "Bass Boost" ? 85 : 50 },
                { label: "230Hz", val: eqPreset === "Bass Boost" ? 75 : 55 },
                { label: "910Hz", val: eqPreset === "Vocal" ? 80 : 50 },
                { label: "4kHz", val: eqPreset === "Live" ? 75 : 60 },
                { label: "14kHz", val: eqPreset === "Live" ? 85 : 65 }
              ].map((band, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-2.5 bg-slate-800 rounded-full h-24 relative overflow-hidden">
                    <motion.div
                      animate={{ height: `${band.val}%` }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-gradient-to-t from-rose-500 to-amber-400 absolute bottom-0 rounded-full"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">{band.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
