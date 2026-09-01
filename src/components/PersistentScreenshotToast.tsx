import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Image as ImageIcon, ExternalLink, Share2, Trash2, X, Check, Folder } from "lucide-react";
import { addScreenshotToastListener, ScreenshotDetails } from "../utils/screenCapture";
import { deleteGalleryItem } from "../utils/galleryStorage";
import { AppID } from "../types";

interface PersistentScreenshotToastProps {
  onOpenApp?: (appId: AppID) => void;
  onSystemLog?: (text: string, severity?: "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function PersistentScreenshotToast({
  onOpenApp,
  onSystemLog
}: PersistentScreenshotToastProps) {
  const [activeToasts, setActiveToasts] = useState<ScreenshotDetails[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = addScreenshotToastListener((detail) => {
      setActiveToasts((prev) => [detail.screenshot, ...prev.filter((t) => t.id !== detail.screenshot.id)]);
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenGallery = (toast: ScreenshotDetails) => {
    handleDismiss(toast.id);
    onSystemLog?.(`[ScreenCaptureHAL] User opened screenshot ${toast.filename} in Gallery.`, "INFO");
    onOpenApp?.(AppID.GALLERY);
  };

  const handleShare = (toast: ScreenshotDetails) => {
    setCopiedId(toast.id);
    onSystemLog?.(`[ScreenCaptureHAL] Screenshot ${toast.filename} shared to system clipboard.`, "INFO");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleDelete = (toast: ScreenshotDetails) => {
    deleteGalleryItem(toast.id);
    handleDismiss(toast.id);
    onSystemLog?.(`[ScreenCaptureHAL] Screenshot ${toast.filename} deleted from Gallery.`, "WARNING");
  };

  if (activeToasts.length === 0) return null;

  return (
    <div
      className="absolute top-9 left-2 right-2 z-[70] flex flex-col gap-2 pointer-events-auto"
      id="persistent-screenshot-toast-container"
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full rounded-2xl bg-slate-950/95 border border-cyan-500/80 p-2.5 shadow-[0_10px_30px_rgba(6,182,212,0.35)] backdrop-blur-xl flex flex-col gap-2 select-none"
          >
            {/* Top Bar: Icon, Header, Timestamp, Dismiss */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-700/80 shadow-sm shrink-0">
                  <Camera size={13} className="animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-bold text-white tracking-tight truncate">
                      Screenshot Captured
                    </span>
                    <span className="text-[7.5px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                      SAVED
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-slate-400 font-mono truncate">
                    <Folder size={9} className="text-cyan-400 shrink-0" />
                    <span className="text-slate-300 font-semibold truncate">Gallery / Screenshots</span>
                    <span>•</span>
                    <span className="text-slate-400 shrink-0">{toast.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => handleDismiss(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Dismiss Notification"
              >
                <X size={13} />
              </button>
            </div>

            {/* Middle Content: Thumbnail & Metadata */}
            <div
              onClick={() => handleOpenGallery(toast)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 transition-colors cursor-pointer group"
              title="Click to view in Gallery"
            >
              {/* Thumbnail Container */}
              <div className="relative w-11 h-14 rounded-lg overflow-hidden border border-cyan-500/40 bg-black shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <img
                  src={toast.thumbnailUrl}
                  alt={toast.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <span className="text-[9.5px] font-mono font-bold text-cyan-200 truncate group-hover:text-cyan-300">
                  {toast.filename}
                </span>
                <span className="text-[8px] text-slate-400 font-mono">
                  {toast.dimensions} • {toast.size} • PNG
                </span>
                <span className="text-[8px] text-teal-400 font-semibold flex items-center gap-1 group-hover:underline">
                  <ExternalLink size={9} />
                  <span>Tap to view high-res image</span>
                </span>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5 border-t border-slate-850">
              <button
                onClick={() => handleOpenGallery(toast)}
                className="flex-1 py-1 px-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[9.5px] font-black tracking-tight flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                <ImageIcon size={11} />
                <span>Open in Gallery</span>
              </button>

              <button
                onClick={() => handleShare(toast)}
                className="py-1 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Copy screenshot / Share"
              >
                {copiedId === toast.id ? (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={11} />
                    <span>Share</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDelete(toast)}
                className="p-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-400 hover:text-rose-300 cursor-pointer transition-colors"
                title="Delete screenshot"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
