import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Youtube,
  Music2,
  Search,
  ThumbsUp,
  Share2,
  Bookmark,
  Sparkles,
  Flame,
  Radio,
  Sliders,
  Volume2,
  Maximize2,
  SkipForward,
  SkipBack,
  Heart,
  ListMusic
} from "lucide-react";
import { playClickSound } from "../utils/sound";

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  views: string;
  timeAgo: string;
  thumbnailGradient: string;
  duration: string;
  likes: string;
  category: "Trending" | "Music" | "Tech" | "Gaming";
  lyrics?: string[];
}

const VIDEOS: VideoItem[] = [
  {
    id: "v1",
    title: "Building KK-Mobile-OS: Next-Gen Web Architecture with Gemini AI",
    channel: "Google AI Studio Engineering",
    views: "1.4M views",
    timeAgo: "2 days ago",
    thumbnailGradient: "from-blue-600 via-indigo-700 to-purple-800",
    duration: "14:20",
    likes: "84K",
    category: "Tech"
  },
  {
    id: "v2",
    title: "Kesariya & Chaiyya Chaiyya - Bollywood Live Acoustic Medley 2026",
    channel: "T-Series Acoustic",
    views: "28M views",
    timeAgo: "1 week ago",
    thumbnailGradient: "from-orange-500 via-rose-600 to-amber-600",
    duration: "4:32",
    likes: "1.2M",
    category: "Music",
    lyrics: [
      "Kesariya tera ishq hai piya...",
      "Rang jaaun jo main haath lagaun...",
      "Din beete saare teri fikr mein...",
      "Rain saari teri khair manaun..."
    ]
  },
  {
    id: "v3",
    title: "Quantum Computing Explained in 10 Minutes (Simulated in Browser)",
    channel: "Veritasium Tech",
    views: "3.2M views",
    timeAgo: "3 weeks ago",
    thumbnailGradient: "from-teal-600 via-emerald-700 to-slate-900",
    duration: "10:15",
    likes: "210K",
    category: "Tech"
  },
  {
    id: "v4",
    title: "Grandmaster Chess AI Speedrun: Stockfish Level 8 vs KK Chess",
    channel: "Chess Royale",
    views: "890K views",
    timeAgo: "5 days ago",
    thumbnailGradient: "from-amber-600 via-yellow-700 to-stone-900",
    duration: "18:45",
    likes: "45K",
    category: "Gaming"
  }
];

export default function AppYouTubeSuite() {
  const [suiteMode, setSuiteMode] = useState<"youtube" | "music">("youtube");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(0);

  const filteredVideos = VIDEOS.filter((v) => {
    const matchesCat = activeCategory === "All" || v.category === activeCategory;
    const matchesQuery = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden">
      {/* Top Suite Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {suiteMode === "youtube" ? (
            <div className="p-1.5 rounded-xl bg-red-600 text-white">
              <Youtube size={18} />
            </div>
          ) : (
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white">
              <Music2 size={18} />
            </div>
          )}
          <h2 className="text-sm font-black tracking-tight">
            {suiteMode === "youtube" ? "YouTube" : "YouTube Music"}
          </h2>
        </div>

        {/* Switcher YouTube vs YouTube Music */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => {
              playClickSound();
              setSuiteMode("youtube");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              suiteMode === "youtube" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => {
              playClickSound();
              setSuiteMode("music");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              suiteMode === "music" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Music & Lyrics
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Active Player Viewport */}
        {selectedVideo && (
          <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-3">
            {suiteMode === "youtube" ? (
              /* Video Canvas Simulation */
              <div className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${selectedVideo.thumbnailGradient} relative overflow-hidden flex flex-col justify-between p-3 shadow-2xl`}>
                <div className="flex items-center justify-between text-xs font-mono text-white/90">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs">1080p 60fps HDR</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs">{selectedVideo.duration}</span>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsPlaying(!isPlaying);
                    }}
                    className="p-4 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white cursor-pointer active:scale-95 transition-all shadow-xl"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: isPlaying ? ["20%", "75%", "90%"] : "45%" }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="h-full bg-red-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* YouTube Music Audio Mode & Synced Lyrics */
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-purple-950/40 to-slate-900 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${selectedVideo.thumbnailGradient} text-white flex items-center justify-center shadow-lg`}>
                    <Music2 size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-white truncate">{selectedVideo.title}</h3>
                    <p className="text-[11px] text-rose-400 font-medium">{selectedVideo.channel}</p>
                  </div>
                </div>

                {/* Lyrics Box */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-center">
                  <span className="text-[9px] font-mono text-rose-400 uppercase font-bold tracking-wider">
                    Synced Lyrics
                  </span>
                  <p className="text-xs font-bold text-white italic">
                    "{selectedVideo.lyrics ? selectedVideo.lyrics[currentLyricIndex] : "Instrumental Studio Track..."}"
                  </p>
                </div>
              </div>
            )}

            {/* Video Metadata & Action Buttons */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-white leading-snug">{selectedVideo.title}</h3>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{selectedVideo.channel} • {selectedVideo.views}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    playClickSound();
                    setIsLiked(!isLiked);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isLiked
                      ? "bg-red-600/20 border-red-500 text-red-400"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <ThumbsUp size={13} className={isLiked ? "fill-red-400" : ""} />
                  <span>{selectedVideo.likes}</span>
                </button>

                <button
                  onClick={playClickSound}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video List & Categories */}
        <div className="p-3 space-y-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {["All", "Music", "Tech", "Gaming"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playClickSound();
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all shrink-0 ${
                  activeCategory === cat
                    ? "bg-white text-slate-950 font-black"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  playClickSound();
                  setSelectedVideo(video);
                  setIsPlaying(true);
                }}
                className="flex gap-3 cursor-pointer group"
              >
                <div className={`w-32 aspect-video rounded-xl bg-gradient-to-br ${video.thumbnailGradient} flex items-center justify-center shrink-0 shadow-md relative overflow-hidden`}>
                  <Play size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[8px] font-mono text-white font-bold">
                    {video.duration}
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                    {video.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">{video.channel}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{video.views} • {video.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
