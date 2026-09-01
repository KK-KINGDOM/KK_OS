import React, { useState, useRef } from "react";
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Sparkles, Wand2, Disc, Loader2, Radio } from "lucide-react";

export default function AppMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [prompt, setPrompt] = useState("Upbeat cyber-synth track with energetic bassline, futuristic melodies, and crisp hi-hats");
  const [isFullTrack, setIsFullTrack] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Midnight Synthwave",
    artist: "KK Audio Labs • Lyria 3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    audioUrl: null as string | null,
    lyrics: "AI Synthesized Melody • KK-Mobile-OS",
    modelUsed: "lyria-3-clip-preview"
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/gemini/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, isFullTrack })
      });

      const data = await res.json();
      setCurrentTrack({
        title: prompt.slice(0, 32) + (prompt.length > 32 ? "..." : ""),
        artist: `Generated via ${data.modelUsed || (isFullTrack ? "lyria-3-pro-preview" : "lyria-3-clip-preview")}`,
        coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
        audioUrl: data.audioUrl,
        lyrics: data.lyrics || "AI Music Composition",
        modelUsed: data.modelUsed || (isFullTrack ? "lyria-3-pro-preview" : "lyria-3-clip-preview")
      });

      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Music generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current && currentTrack.audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-3 justify-between overflow-y-auto" id="app-music">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Disc size={18} className="text-rose-400 animate-spin duration-[8000ms]" />
          <h2 className="text-sm font-bold text-white">KK Music AI</h2>
        </div>
        <span className="text-[9px] bg-rose-950 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-full font-mono font-bold">
          Lyria 3 Engine
        </span>
      </div>

      {/* Main Track Display */}
      <div className="my-auto text-center space-y-3 py-2">
        <div className="mx-auto h-36 w-36 rounded-3xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 p-1 shadow-2xl shadow-rose-950/60 relative group">
          <img
            src={currentTrack.coverUrl}
            alt="Album Cover"
            className="w-full h-full object-cover rounded-[22px]"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 rounded-[22px] flex items-center justify-center">
              <Radio size={32} className="text-rose-400 animate-pulse" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-white truncate px-4">{currentTrack.title}</h3>
          <p className="text-[10px] font-mono text-slate-400">{currentTrack.artist}</p>
        </div>

        {/* Audio Player Element */}
        {currentTrack.audioUrl && (
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (audioRef.current) {
                const cur = audioRef.current.currentTime;
                const dur = audioRef.current.duration || 1;
                setProgress((cur / dur) * 100);
              }
            }}
          />
        )}

        {/* Progress Bar */}
        <div className="space-y-1 max-w-xs mx-auto">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Playback Controls & Volume Trigger */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("kk_volume_change", { detail: { stream: "media", delta: -5, showHud: true } }))}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
            title="Media Volume Down (-5%)"
          >
            <Volume2 size={15} />
          </button>

          <button
            onClick={togglePlay}
            className="h-11 w-11 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 cursor-pointer transition-transform active:scale-95"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("kk_volume_change", { detail: { stream: "media", delta: 5, showHud: true } }))}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
            title="Media Volume Up (+5%)"
          >
            <Volume2 size={15} />
          </button>
        </div>
      </div>

      {/* AI Studio Generation Section */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
            <Sparkles size={14} className="text-rose-400" />
            <span>AI Music Generator</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullTrack(false)}
              className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all cursor-pointer ${
                !isFullTrack ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              Clip (Lyria-3-Clip)
            </button>
            <button
              onClick={() => setIsFullTrack(true)}
              className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all cursor-pointer ${
                isFullTrack ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              Pro Track (Lyria-3-Pro)
            </button>
          </div>
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe rhythm, genre, mood, instruments..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
        />

        <button
          onClick={handleGenerateMusic}
          disabled={isGenerating}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="animate-spin text-rose-200" />
              <span>Synthesizing Track with Lyria 3...</span>
            </>
          ) : (
            <>
              <Wand2 size={14} />
              <span>Generate Music ({isFullTrack ? "Full Track" : "Short Clip"})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
