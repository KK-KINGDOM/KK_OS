import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Download,
  Share2,
  Volume2,
  Clock,
  Radio,
  FileAudio,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface VoiceNote {
  id: string;
  title: string;
  durationSeconds: number;
  date: string;
  sizeMb: string;
  audioUrl?: string;
}

export default function AppVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordQuality, setRecordQuality] = useState<"high" | "voice">("high");
  const [audioLevelBars, setAudioLevelBars] = useState<number[]>(Array(24).fill(15));
  
  const [recordings, setRecordings] = useState<VoiceNote[]>([
    {
      id: "vn-1",
      title: "KK OS System Architecture Ideas",
      durationSeconds: 42,
      date: "Today, 09:30 AM",
      sizeMb: "1.2 MB"
    },
    {
      id: "vn-2",
      title: "Meeting Summary & Action Items",
      durationSeconds: 125,
      date: "Yesterday, 04:15 PM",
      sizeMb: "3.4 MB"
    },
    {
      id: "vn-3",
      title: "Voice Memo - Emergency SOS Ideas",
      durationSeconds: 18,
      date: "22 Jul 2026",
      sizeMb: "0.5 MB"
    }
  ]);

  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Timer for active recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordSeconds((s) => s + 1);
        // Animate simulated audio waveform bars
        setAudioLevelBars(
          Array(24)
            .fill(0)
            .map(() => Math.floor(Math.random() * 80) + 10)
        );
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Timer for active playback simulation
  useEffect(() => {
    let playbackInterval: any = null;
    if (activePlaybackId) {
      const activeNote = recordings.find((r) => r.id === activePlaybackId);
      playbackInterval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (activeNote && prev >= activeNote.durationSeconds) {
            setActivePlaybackId(null);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(playbackInterval);
      setPlaybackSeconds(0);
    }
    return () => clearInterval(playbackInterval);
  }, [activePlaybackId, recordings]);

  const handleStartRecording = async () => {
    setRecordSeconds(0);
    setIsRecording(true);
    setIsPaused(false);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.start();
        setMediaRecorder(recorder);
      }
    } catch (err) {
      // Fallback to simulated audio recording if permission not granted
      console.log("Using simulated voice recording stream.");
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsPaused(false);

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }

    // Save note
    const duration = recordSeconds || 5;
    const newNote: VoiceNote = {
      id: `vn-${Date.now()}`,
      title: `Voice Recording #${recordings.length + 1}`,
      durationSeconds: duration,
      date: "Just Now",
      sizeMb: `${(duration * 0.03).toFixed(1)} MB`
    };

    setRecordings([newNote, ...recordings]);
    setRecordSeconds(0);
    setAudioLevelBars(Array(24).fill(15));
  };

  const handleDeleteNote = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    if (activePlaybackId === id) setActivePlaybackId(null);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
            <Mic size={18} />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">Voice Recorder</h2>
            <p className="text-[9px] text-slate-400 font-mono">HD Audio Dictaphone</p>
          </div>
        </div>

        {/* Quality Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
          <button
            onClick={() => setRecordQuality("high")}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              recordQuality === "high" ? "bg-rose-500 text-white" : "text-slate-400"
            }`}
          >
            320k MP3
          </button>
          <button
            onClick={() => setRecordQuality("voice")}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              recordQuality === "voice" ? "bg-rose-500 text-white" : "text-slate-400"
            }`}
          >
            128k AAC
          </button>
        </div>
      </div>

      {/* RECORDING DASHBOARD / STUDIO CANVAS */}
      <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 space-y-4 shrink-0 shadow-xl">
        {/* Animated Audio Waveform Display */}
        <div className="h-24 bg-slate-950 rounded-2xl border border-slate-850 p-3 flex items-end justify-center gap-1 relative overflow-hidden shadow-inner">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Waveform Bars */}
          {audioLevelBars.map((height, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isRecording
                  ? "bg-gradient-to-t from-rose-600 via-rose-400 to-amber-300 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                  : "bg-slate-800"
              }`}
              style={{ height: isRecording ? `${Math.max(12, height)}%` : "15%" }}
            />
          ))}

          {/* Recording Badge */}
          {isRecording && (
            <div className="absolute top-2.5 left-3 flex items-center gap-1.5 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[9px] font-mono font-bold text-rose-300 uppercase">REC LIVE</span>
            </div>
          )}
        </div>

        {/* Recording Digital Clock & Main Action Button */}
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Duration</span>
            <span className="text-2xl font-mono font-black text-white">{formatTime(recordSeconds)}</span>
          </div>

          <div className="flex items-center gap-3">
            {isRecording ? (
              <>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-all active:scale-95"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>

                <button
                  onClick={handleStopRecording}
                  className="p-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 flex items-center gap-2"
                >
                  <Square size={18} className="fill-white" />
                  <span className="text-xs">SAVE RECORDING</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleStartRecording}
                className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 flex items-center gap-2"
              >
                <Mic size={18} className="animate-pulse" />
                <span className="text-xs">START RECORDING</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SAVED RECORDINGS LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FileAudio size={14} className="text-rose-400" />
            Voice Memos ({recordings.length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Auto-saved to Storage</span>
        </div>

        {recordings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-1">
            <p>No voice recordings found.</p>
            <p className="text-[10px]">Tap "Start Recording" to capture audio.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recordings.map((note) => {
              const isPlaying = activePlaybackId === note.id;

              return (
                <div
                  key={note.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isPlaying
                      ? "bg-slate-900 border-rose-500/50 shadow-lg ring-1 ring-rose-500/20"
                      : "bg-slate-900/60 border-slate-850 hover:border-slate-750"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            setActivePlaybackId(null);
                          } else {
                            setActivePlaybackId(note.id);
                            setPlaybackSeconds(0);
                          }
                        }}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                          isPlaying
                            ? "bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                            : "bg-slate-950 text-rose-400 hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>

                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-white truncate">{note.title}</h4>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 mt-0.5">
                          <span>{note.date}</span>
                          <span>•</span>
                          <span>{note.sizeMb}</span>
                          <span>•</span>
                          <span className="text-rose-300">{formatTime(note.durationSeconds)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Delete recording"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Playback Progress Bar */}
                  {isPlaying && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1">
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (playbackSeconds / note.durationSeconds) * 100)}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>{formatTime(playbackSeconds)}</span>
                        <span>{formatTime(note.durationSeconds)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
