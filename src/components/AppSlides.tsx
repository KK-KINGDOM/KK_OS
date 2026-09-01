import React, { useState } from "react";
import {
  Presentation,
  Play,
  Plus,
  Tv,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Trash2,
  Type
} from "lucide-react";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  bgGradient: string;
}

export default function AppSlides() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "s1",
      title: "KK Mobile OS Architecture",
      subtitle: "Next-Gen Web OS Client Engine",
      bullets: ["100% Client-Side React + Vite Architecture", "Sub-10ms Context Switching", "Zero Latency Kernel Simulation"],
      bgGradient: "from-blue-900 to-slate-900"
    },
    {
      id: "s2",
      title: "Integrated AI Suite",
      subtitle: "Multimodal AI Models Built-In",
      bullets: ["ChatGPT 4o + o1 Reasoning", "Claude 3.5 Sonnet Artifacts", "Google Gemini 1.5 Pro & Grok 2"],
      bgGradient: "from-purple-900 to-slate-900"
    },
    {
      id: "s3",
      title: "Google Workspace Apps",
      subtitle: "Full Productivity Ecosystem",
      bullets: ["Drive, Sheets, Slides, Docs", "Real-time Google Calendar & Meet", "LinkedIn Networking Feed"],
      bgGradient: "from-amber-900 to-slate-900"
    }
  ]);

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = slides[activeSlideIdx] || slides[0];

  const addSlide = () => {
    const newS: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      subtitle: "Click to add subtitle",
      bullets: ["Key Point 1", "Key Point 2"],
      bgGradient: "from-teal-900 to-slate-900"
    };
    setSlides([...slides, newS]);
    setActiveSlideIdx(slides.length);
  };

  const deleteCurrentSlide = () => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, idx) => idx !== activeSlideIdx));
    setActiveSlideIdx(Math.max(0, activeSlideIdx - 1));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Top Header */}
      <div className="p-2.5 bg-amber-950/90 border-b border-amber-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500 text-slate-950 shadow">
            <Presentation size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs text-white">Google Slides</span>
            <span className="text-[9px] text-amber-300 font-mono">KK_OS_Deck.pptx</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
          >
            <Play size={12} className="fill-slate-950" /> Present
          </button>
          <button
            onClick={addSlide}
            className="p-1.5 bg-amber-900 border border-amber-700 rounded-xl text-amber-300 hover:text-white"
            title="Add Slide"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Slide Canvas Editor */}
        <div className="flex-1 p-3 flex items-center justify-center bg-slate-900">
          <div className={`w-full max-w-md aspect-[16/9] rounded-2xl bg-gradient-to-br ${currentSlide.bgGradient} border border-white/10 p-5 flex flex-col justify-between shadow-2xl relative`}>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                {currentSlide.title}
              </h2>
              <p className="text-xs font-semibold text-amber-300/90 mt-1">
                {currentSlide.subtitle}
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-200">
              {currentSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pt-2 border-t border-white/10">
              <span>Google Slides Demo</span>
              <span>Slide {activeSlideIdx + 1} of {slides.length}</span>
            </div>
          </div>
        </div>

        {/* Bottom Slide Thumbnails Toolbar */}
        <div className="p-2 bg-slate-950 border-t border-slate-850 flex items-center gap-2 overflow-x-auto shrink-0">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlideIdx(idx)}
              className={`w-16 h-10 rounded-lg bg-gradient-to-br ${slide.bgGradient} border p-1 flex flex-col justify-between shrink-0 text-left transition-all ${
                activeSlideIdx === idx ? "border-amber-400 ring-2 ring-amber-400/50" : "border-slate-800 opacity-60 hover:opacity-100"
              }`}
            >
              <span className="text-[7px] font-bold text-white truncate">{slide.title}</span>
              <span className="text-[6px] text-amber-300 font-mono">#{idx + 1}</span>
            </button>
          ))}

          {slides.length > 1 && (
            <button
              onClick={deleteCurrentSlide}
              className="p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 hover:text-white shrink-0 ml-auto"
              title="Delete Current Slide"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Presentation Mode */}
      {isFullscreen && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-between p-6 animate-in fade-in duration-200">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold"
          >
            ✕ Exit
          </button>

          <div className="my-auto w-full max-w-lg aspect-[16/9] rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-black border border-amber-500/40 p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            <div>
              <h1 className="text-2xl font-black text-white">{currentSlide.title}</h1>
              <p className="text-sm text-amber-300 mt-1">{currentSlide.subtitle}</p>
            </div>

            <ul className="space-y-2 text-sm text-slate-200">
              {currentSlide.bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="text-[10px] text-amber-400/80 font-mono">
              Presentation Mode • Use buttons below to navigate
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              disabled={activeSlideIdx === 0}
              onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
              className="p-3 bg-white/10 disabled:opacity-30 text-white rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-mono text-amber-300 font-bold">
              {activeSlideIdx + 1} / {slides.length}
            </span>
            <button
              disabled={activeSlideIdx === slides.length - 1}
              onClick={() => setActiveSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
              className="p-3 bg-white/10 disabled:opacity-30 text-white rounded-full"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
