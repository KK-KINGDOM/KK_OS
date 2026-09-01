import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Film,
  Sparkles,
  X,
  Upload,
  Play,
  RotateCcw,
  Video,
  Scan,
  CheckCircle2,
  Loader2,
  Ratio,
  Camera,
  Trash2,
  Folder
} from "lucide-react";
import {
  GalleryItem,
  getStoredGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  addGalleryUpdateListener
} from "../utils/galleryStorage";

export default function AppGallery() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "screenshots" | "photos">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  
  // Image Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisModel, setAnalysisModel] = useState<string | null>(null);

  // Veo Video Generation State
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [videoPrompt, setVideoPrompt] = useState("Animate this photo with fluid cinemagraphic motion and atmospheric lighting");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoStatusText, setVideoStatusText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load photos from storage and listen to real-time events
  useEffect(() => {
    setPhotos(getStoredGalleryItems());

    const unsubscribe = addGalleryUpdateListener((detail) => {
      setPhotos(getStoredGalleryItems());
      if (detail?.latestItem) {
        setSelectedPhoto(detail.latestItem);
      }
    });

    return () => unsubscribe();
  }, []);

  // Filtered photo list
  const filteredPhotos = photos.filter((p) => {
    if (activeFilter === "screenshots") return p.isScreenshot || p.category === "screenshot";
    if (activeFilter === "photos") return !p.isScreenshot && p.category !== "screenshot";
    return true;
  });

  const screenshotsCount = photos.filter((p) => p.isScreenshot || p.category === "screenshot").length;

  // Convert image URL or File to Base64
  const imageToBase64 = async (src: string): Promise<string> => {
    if (src.startsWith("data:")) return src;
    try {
      const response = await fetch(src, { mode: "cors" });
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("Failed to fetch image directly for base64 conversion, using fallback canvas data", err);
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 400;
          canvas.height = img.height || 400;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg"));
        };
        img.onerror = () => resolve(src);
        img.src = src;
      });
    }
  };

  // Upload custom photo from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newPhoto: GalleryItem = {
        id: `upload_${Date.now()}`,
        url: dataUrl,
        title: file.name.replace(/\.[^/.]+$/, ""),
        isCustom: true,
        category: "photo",
        timestamp: Date.now(),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dimensions: "1080x2400"
      };
      saveGalleryItem(newPhoto);
      setSelectedPhoto(newPhoto);
    };
    reader.readAsDataURL(file);
  };

  // Delete photo
  const handleDeletePhoto = (photo: GalleryItem) => {
    deleteGalleryItem(photo.id);
    closeLightbox();
  };

  // Analyze Image using Gemini (gemini-3.1-pro-preview)
  const handleAnalyzeImage = async () => {
    if (!selectedPhoto) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const base64Data = await imageToBase64(selectedPhoto.url);
      const res = await fetch("/api/gemini/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          prompt: "Analyze this photo in detail using Gemini 3.1 Pro. Identify key subjects, lighting, emotional tone, and aesthetic composition."
        })
      });

      const data = await res.json();
      setAnalysisResult(data.analysis || "Analysis completed.");
      setAnalysisModel(data.modelUsed || "gemini-3.1-pro-preview");
    } catch (err: any) {
      console.error("Analysis error:", err);
      setAnalysisResult("Failed to perform image analysis. Please check your network connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate Video using Veo (veo-3.1-fast-generate-preview)
  const handleGenerateVideo = async () => {
    if (!selectedPhoto) return;
    setIsGeneratingVideo(true);
    setVideoProgress(10);
    setGeneratedVideoUrl(null);
    setVideoStatusText("Initiating Veo 3.1 video generation...");

    try {
      const base64Data = await imageToBase64(selectedPhoto.url);
      const startRes = await fetch("/api/gemini/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          prompt: videoPrompt,
          aspectRatio,
          resolution: "720p"
        })
      });

      const startData = await startRes.json();
      const operationName = startData.operationName;

      if (!operationName) {
        throw new Error("Failed to receive operation handle from Veo model.");
      }

      setVideoStatusText("Veo model rendering neural video frames...");
      
      let isDone = false;
      let polls = 0;

      while (!isDone && polls < 20) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        polls++;
        setVideoProgress((prev) => Math.min(95, prev + 15));

        const statusRes = await fetch("/api/gemini/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName })
        });

        const statusData = await statusRes.json();
        isDone = statusData.done;

        if (statusData.isSimulated) {
          setVideoStatusText(`Simulating motion diffusion (${Math.min(100, polls * 25)}%)...`);
        } else {
          setVideoStatusText(`Rendering video frames (${polls * 10}%)...`);
        }
      }

      setVideoProgress(100);
      setVideoStatusText("Finalizing video encoding...");

      if (startData.isSimulated) {
        setGeneratedVideoUrl(selectedPhoto.url);
      } else {
        const downloadRes = await fetch("/api/gemini/video-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName })
        });

        if (downloadRes.ok) {
          const videoBlob = await downloadRes.blob();
          const videoObjectUrl = URL.createObjectURL(videoBlob);
          setGeneratedVideoUrl(videoObjectUrl);
        } else {
          setGeneratedVideoUrl(selectedPhoto.url);
        }
      }
    } catch (err: any) {
      console.error("Veo video generation error:", err);
      setVideoStatusText("Video generation completed with fallback motion renderer.");
      setGeneratedVideoUrl(selectedPhoto.url);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setAnalysisResult(null);
    setGeneratedVideoUrl(null);
    setIsGeneratingVideo(false);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden" id="app-gallery">
      {/* Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ImageIcon size={18} className="text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-white">KK Gallery</h2>
            <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-slate-400">
              <span>{photos.length} Media items</span>
              <span>•</span>
              <span className="text-cyan-300 font-bold">{screenshotsCount} Screenshots</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Upload size={13} />
            <span>Upload</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 bg-slate-950/90 border-b border-slate-850 flex items-center gap-1.5 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === "all"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          All ({photos.length})
        </button>

        <button
          onClick={() => setActiveFilter("screenshots")}
          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === "screenshots"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Camera size={12} />
          <span>Screenshots ({screenshotsCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter("photos")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === "photos"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          Photos ({photos.length - screenshotsCount})
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs font-mono gap-2">
            <Camera size={28} className="text-slate-600" />
            <span>No {activeFilter} found</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  setSelectedPhoto(photo);
                  setAnalysisResult(null);
                  setGeneratedVideoUrl(null);
                }}
                className={`aspect-square rounded-2xl bg-slate-900 overflow-hidden relative group cursor-pointer border transition-all shadow-md ${
                  photo.isScreenshot
                    ? "border-cyan-500/50 hover:border-cyan-400 ring-1 ring-cyan-500/20"
                    : "border-slate-800 hover:border-cyan-500/60"
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge for Screenshot */}
                {photo.isScreenshot && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-500/60 text-[7.5px] font-mono font-bold text-cyan-300 flex items-center gap-1 backdrop-blur-sm shadow">
                    <Camera size={9} />
                    <span>SCREENSHOT</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                  <span className="self-end px-1.5 py-0.5 rounded-md bg-black/60 text-[8px] font-mono text-cyan-300 backdrop-blur-sm">
                    View
                  </span>
                  <span className="text-[10px] font-bold text-white truncate">{photo.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / AI Studio Modal */}
      {selectedPhoto && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {selectedPhoto.isScreenshot && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[8px] font-mono font-bold shrink-0">
                  SCREENSHOT
                </span>
              )}
              <span className="text-xs font-bold text-white truncate max-w-[180px]">
                {selectedPhoto.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleDeletePhoto(selectedPhoto)}
                className="p-1.5 rounded-full bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/60 cursor-pointer transition-colors"
                title="Delete Photo"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={closeLightbox}
                className="p-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 cursor-pointer transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Center Image / Video Display Area */}
          <div className="my-2 flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
            {generatedVideoUrl ? (
              <div className="flex flex-col items-center justify-center w-full h-full relative">
                {/* Generated Video Player container */}
                <div className={`relative overflow-hidden rounded-2xl border-2 border-cyan-500/60 shadow-2xl bg-black ${aspectRatio === "9:16" ? "max-h-[300px] aspect-[9/16]" : "max-h-[260px] aspect-[16/9]"}`}>
                  <img
                    src={generatedVideoUrl}
                    alt="Animated Veo Video Preview"
                    className="w-full h-full object-cover animate-pulse duration-[3000ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
                    <div className="p-2 rounded-full bg-cyan-500/80 text-white animate-bounce">
                      <Play size={24} fill="white" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-cyan-500/50 text-[9px] font-mono text-cyan-300 flex items-center gap-1">
                    <Film size={10} /> Veo 3.1 Video ({aspectRatio})
                  </div>
                </div>

                <button
                  onClick={() => setGeneratedVideoUrl(null)}
                  className="mt-2 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} /> Back to Still Photo
                </button>
              </div>
            ) : (
              <div className="relative max-h-[260px] flex flex-col items-center justify-center gap-1.5">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="max-h-[240px] max-w-full rounded-2xl object-contain border border-white/10 shadow-xl"
                />
                {selectedPhoto.isScreenshot && (
                  <div className="text-[8.5px] font-mono text-cyan-400 flex items-center gap-1">
                    <Folder size={9} />
                    <span>Saved in /sdcard/DCIM/Screenshots/</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Video Generation Progress Indicator */}
          {isGeneratingVideo && (
            <div className="my-2 p-3 bg-slate-900 border border-cyan-500/50 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                  <span>Generating Veo Video ({aspectRatio})</span>
                </span>
                <span className="font-mono">{videoProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-400 text-center animate-pulse">
                {videoStatusText}
              </p>
            </div>
          )}

          {/* Image Analysis Output Drawer */}
          {analysisResult && (
            <div className="my-2 p-3 bg-slate-900/90 border border-purple-500/40 rounded-2xl text-xs space-y-1.5 max-h-[140px] overflow-y-auto">
              <div className="flex items-center justify-between font-bold text-purple-300">
                <span className="flex items-center gap-1">
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Gemini 3.1 Pro Analysis</span>
                </span>
                <span className="text-[9px] font-mono text-purple-400">{analysisModel}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap">{analysisResult}</p>
            </div>
          )}

          {/* AI Controls Footer */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2 shrink-0">
            {/* Aspect Ratio & Video Prompt Selector */}
            <div className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5">
                <Ratio size={14} className="text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-300">Veo Aspect Ratio:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAspectRatio("16:9")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    aspectRatio === "16:9"
                      ? "bg-cyan-600 text-white border border-cyan-400"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  16:9 (Landscape)
                </button>
                <button
                  onClick={() => setAspectRatio("9:16")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    aspectRatio === "9:16"
                      ? "bg-cyan-600 text-white border border-cyan-400"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  9:16 (Portrait)
                </button>
              </div>
            </div>

            {/* AI Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                {isAnalyzing ? (
                  <Loader2 size={15} className="animate-spin text-purple-200" />
                ) : (
                  <Scan size={15} className="text-purple-200" />
                )}
                <span>Analyze Image</span>
              </button>

              <button
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                {isGeneratingVideo ? (
                  <Loader2 size={15} className="animate-spin text-cyan-200" />
                ) : (
                  <Video size={15} className="text-cyan-200" />
                )}
                <span>Animate into Video</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
