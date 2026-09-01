import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Zap,
  ZapOff,
  Sparkles,
  FlipHorizontal,
  Video,
  Image as ImageIcon,
  Aperture,
  RotateCcw,
  ShieldAlert,
  Check,
  VideoOff,
  Maximize2,
  Grid,
  Sun,
  Layers,
  Circle
} from "lucide-react";
import { playShutterSound, playClickSound } from "../utils/sound";

export default function AppCamera() {
  const [cameraState, setCameraState] = useState<"prompt" | "requesting" | "active" | "denied" | "simulated">("prompt");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const [activeMode, setActiveMode] = useState<"night" | "video" | "photo" | "portrait" | "more">("photo");
  const [flashOn, setFlashOn] = useState(false);
  const [hdrOn, setHdrOn] = useState(true);
  const [aiOn, setAiOn] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<"0.5x" | "1x" | "2x">("1x");

  const [isCapturing, setIsCapturing] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Timer for video recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Request camera stream using MediaDevices API
  const startCameraStream = async (mode: "user" | "environment" = facingMode) => {
    setCameraState("requesting");
    setErrorMessage(null);

    // Stop existing stream if any
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices API not supported by this browser runtime.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setCameraState("active");
    } catch (err: any) {
      console.warn("Camera permission or hardware error:", err);
      setErrorMessage(err?.message || "Camera access was denied or device was not found.");
      setCameraState("denied");
    }
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Flip camera (front/rear)
  const toggleFacingMode = () => {
    playClickSound();
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    if (cameraState === "active") {
      startCameraStream(newMode);
    }
  };

  // Trigger Shutter Action with visual overlay animation and sound
  const handleShutter = () => {
    if (activeMode === "video") {
      setIsRecording(!isRecording);
      playClickSound();
      return;
    }

    // Sound effect
    playShutterSound();

    // Visual Shutter Overlay Animation
    setIsCapturing(true);
    setShutterFlash(true);

    setTimeout(() => {
      setShutterFlash(false);
    }, 180);

    setTimeout(() => {
      setIsCapturing(false);
    }, 350);

    // Capture snapshot frame from live video feed onto canvas
    let capturedDataUrl: string | null = null;

    if (cameraState === "active" && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      }
    }

    // Fallback if video capture not available or simulated mode
    if (!capturedDataUrl) {
      // Use fallback stylish high-res sample
      capturedDataUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
    }

    setLastPhoto(capturedDataUrl);
    setGalleryPhotos((prev) => [capturedDataUrl!, ...prev]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white font-sans relative overflow-hidden select-none" id="app-camera-view">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* FULLSCREEN PHOTO GALLERY MODAL PREVIEW */}
      {showPhotoPreview ? (
        <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pt-2 border-b border-white/10 pb-3">
            <button
              onClick={() => {
                playClickSound();
                setShowPhotoPreview(false);
              }}
              className="text-xs font-bold text-teal-400 flex items-center gap-1.5 cursor-pointer hover:text-teal-300 transition-colors"
            >
              <RotateCcw size={14} /> Back to Viewfinder
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                {galleryPhotos.length} Shots Saved
              </span>
            </div>
          </div>

          {/* Image Display */}
          <div className="flex-1 my-3 bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-800 flex items-center justify-center p-2">
            {galleryPhotos.length > 0 ? (
              <img
                src={galleryPhotos[selectedPhotoIndex] || galleryPhotos[0]}
                alt="Captured Snapshot"
                className="w-full h-full object-contain rounded-2xl"
              />
            ) : (
              <div className="text-center p-6 space-y-2 text-slate-500">
                <ImageIcon size={32} className="mx-auto text-slate-600" />
                <p className="text-xs font-bold">No photos captured yet</p>
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10 shadow-lg">
              <Sparkles size={11} className="text-amber-400" /> 48MP AI Ultra-HDR Shot
            </div>
          </div>

          {/* Gallery Filmstrip */}
          {galleryPhotos.length > 0 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none">
              {galleryPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`h-12 w-12 rounded-xl overflow-hidden border-2 shrink-0 transition-transform cursor-pointer ${
                    selectedPhotoIndex === idx ? "border-amber-400 scale-105" : "border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={photo} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* CAMERA TOP BAR CONTROLS */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/90 backdrop-blur-md z-30 border-b border-white/5 shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setFlashOn(!flashOn);
              }}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                flashOn ? "text-amber-400 bg-amber-400/20 ring-1 ring-amber-400/50" : "text-slate-400 hover:text-white"
              }`}
              title="Toggle Flash"
            >
              {flashOn ? <Zap size={16} /> : <ZapOff size={16} />}
            </button>

            <button
              onClick={() => {
                playClickSound();
                setHdrOn(!hdrOn);
              }}
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border cursor-pointer transition-all ${
                hdrOn
                  ? "bg-teal-500/20 border-teal-500 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                  : "border-slate-800 text-slate-500"
              }`}
            >
              HDR AUTO
            </button>

            <button
              onClick={() => {
                playClickSound();
                setAiOn(!aiOn);
              }}
              className={`p-1.5 px-2.5 rounded-full flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors ${
                aiOn ? "text-purple-300 bg-purple-900/40 border border-purple-500/40" : "text-slate-500 border border-slate-800"
              }`}
            >
              <Sparkles size={12} className={aiOn ? "text-purple-400" : "text-slate-500"} /> AI SCENE
            </button>

            <span className="text-[10px] font-mono font-bold text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md bg-slate-900">
              4:3 HD
            </span>
          </div>

          {/* VIEWFINDER CONTAINER */}
          <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
            {/* LIVE WEBCAM VIDEO STREAM */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                cameraState === "active" ? "opacity-100" : "opacity-0 absolute"
              } ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />

            {/* SIMULATED STREAM FEED BACKGROUND (If in Simulated mode or Denied) */}
            {(cameraState === "simulated" || cameraState === "prompt" || cameraState === "denied") && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                  alt="Simulated Camera Viewfinder"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-mono text-slate-300 border border-white/10 flex items-center gap-1.5">
                  <Aperture size={12} className="text-amber-400 animate-spin" /> Virtual Camera Sensor Stream
                </div>
              </div>
            )}

            {/* PERMISSION PROMPT OVERLAY */}
            {cameraState === "prompt" && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
                <div className="p-3.5 rounded-2xl bg-teal-950/80 border border-teal-800 text-teal-400 shadow-xl shadow-teal-900/20">
                  <Camera size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Camera Permission Required</h3>
                  <p className="text-[11px] text-slate-300 max-w-[240px] mt-1 leading-relaxed">
                    Allow KK-Mobile-OS to access your camera for real-time viewfinder streaming and photo captures.
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <button
                    onClick={() => startCameraStream()}
                    className="w-full py-2 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Camera size={14} /> Grant Camera Access
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      setCameraState("simulated");
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] cursor-pointer transition-all"
                  >
                    Use Virtual Sensor
                  </button>
                </div>
              </div>
            )}

            {/* REQUESTING / LOADING OVERLAY */}
            {cameraState === "requesting" && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
                <Aperture size={36} className="text-teal-400 animate-spin" />
                <span className="text-xs font-bold text-slate-200 font-mono">Initializing Camera Hardware...</span>
              </div>
            )}

            {/* PERMISSION DENIED OVERLAY */}
            {cameraState === "denied" && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-200">Camera Access Unavailable</h4>
                  <p className="text-[10px] text-slate-400 max-w-[220px] mt-1">
                    {errorMessage || "Browser blocked camera access or no hardware camera was found."}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playClickSound();
                    setCameraState("simulated");
                  }}
                  className="py-1.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-md mt-2"
                >
                  Switch to Virtual Viewfinder
                </button>
              </div>
            )}

            {/* VIEWFINDER CROSSHAIR & FOCUS RETICLE */}
            <div className="absolute inset-10 border border-white/15 rounded-3xl pointer-events-none flex items-center justify-center">
              <div className="relative w-16 h-16 border border-amber-400/80 rounded-2xl flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
            </div>

            {/* ZOOM TOGGLE PILLS */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full">
              {(["0.5x", "1x", "2x"] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => {
                    playClickSound();
                    setZoomLevel(z);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    zoomLevel === z
                      ? "bg-amber-400 text-slate-950 shadow-md scale-105"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* VIDEO RECORDING INDICATOR */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 border border-rose-600 px-3 py-1 rounded-full text-rose-200 text-[11px] font-mono font-bold flex items-center gap-2 shadow-lg animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>REC {formatTime(recordSeconds)}</span>
              </div>
            )}

            {/* VISUAL SHUTTER FLASH OVERLAY ANIMATION */}
            {shutterFlash && (
              <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
            )}

            {/* VISUAL APERTURE SHUTTER CLOSING ANIMATION */}
            {isCapturing && (
              <div className="absolute inset-0 z-35 flex items-center justify-center bg-black/40 pointer-events-none">
                <Aperture size={96} className="text-amber-400 animate-spin duration-300" />
              </div>
            )}
          </div>

          {/* BOTTOM CAMERA CONTROLS & SHUTTER DOCK */}
          <div className="bg-slate-950 p-4 space-y-3 z-30 border-t border-white/5 shrink-0">
            {/* Camera Modes Selector */}
            <div className="flex items-center justify-center gap-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {(["night", "video", "photo", "portrait", "more"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    playClickSound();
                    setActiveMode(mode);
                  }}
                  className={`transition-all cursor-pointer ${
                    activeMode === mode
                      ? "text-amber-400 border-b-2 border-amber-400 pb-0.5 scale-105 font-extrabold"
                      : "hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Main Shutter Controls Row */}
            <div className="flex items-center justify-between px-6 pt-1">
              {/* Gallery Thumbnail Preview */}
              <button
                onClick={() => {
                  playClickSound();
                  setShowPhotoPreview(true);
                }}
                className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center relative cursor-pointer hover:border-slate-700 transition-all shadow-md group"
                title="View Gallery"
              >
                {lastPhoto ? (
                  <img src={lastPhoto} alt="Last shot" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={18} className="text-slate-400 group-hover:text-white" />
                )}
                {galleryPhotos.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-500 text-slate-950 text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-slate-950">
                    {galleryPhotos.length}
                  </span>
                )}
              </button>

              {/* Big Circular White Shutter Button */}
              <button
                onClick={handleShutter}
                className="h-16 w-16 rounded-full border-4 border-white/90 p-1 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-xl shadow-white/10 hover:border-white"
                title={activeMode === "video" ? "Record Video" : "Take Photo"}
              >
                <div
                  className={`w-full h-full rounded-full transition-all flex items-center justify-center ${
                    activeMode === "video"
                      ? isRecording
                        ? "bg-rose-600 rounded-lg scale-75"
                        : "bg-rose-600"
                      : "bg-white active:bg-slate-200"
                  }`}
                >
                  {activeMode === "photo" && <Aperture size={20} className="text-slate-950 opacity-40" />}
                </div>
              </button>

              {/* Front/Rear Camera Flip Button */}
              <button
                onClick={toggleFacingMode}
                className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 hover:text-white cursor-pointer transition-colors shadow-md"
                title="Flip Camera"
              >
                <FlipHorizontal size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
