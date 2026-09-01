import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Aperture, CheckCircle2 } from "lucide-react";
import { addScreenFlashListener, ScreenshotDetails } from "../utils/screenCapture";

export default function ScreenshotFlashOverlay() {
  const [activeCapture, setActiveCapture] = useState<ScreenshotDetails | null>(null);
  const [showShutterFlash, setShowShutterFlash] = useState(false);
  const [showThumbnailPill, setShowThumbnailPill] = useState(false);

  useEffect(() => {
    const unsubscribe = addScreenFlashListener((detail) => {
      setActiveCapture(detail.screenshot);
      setShowShutterFlash(true);
      setShowThumbnailPill(true);

      // Flash fades quickly
      const flashTimer = setTimeout(() => {
        setShowShutterFlash(false);
      }, 350);

      // Thumbnail shrinks and docks
      const pillTimer = setTimeout(() => {
        setShowThumbnailPill(false);
        setActiveCapture(null);
      }, 1200);

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(pillTimer);
      };
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[80] overflow-hidden" id="screenshot-flash-root">
      <AnimatePresence>
        {/* 1. High-Intensity White & Cyan Screen Flash Burst */}
        {showShutterFlash && (
          <motion.div
            key="flash-burst"
            initial={{ opacity: 0.98, scale: 1 }}
            animate={{ opacity: [1, 0.9, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 bg-white/95 backdrop-blur-[2px] flex items-center justify-center"
          >
            {/* Shutter Iris Aperture Graphic */}
            <motion.div
              initial={{ scale: 0.6, rotate: -45, opacity: 0.8 }}
              animate={{ scale: [0.8, 1.2, 1.4], rotate: 45, opacity: [0.8, 1, 0] }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="p-4 rounded-full bg-cyan-500/30 border-2 border-cyan-400 text-cyan-900 shadow-[0_0_50px_rgba(34,211,238,0.8)]"
            >
              <Aperture size={56} className="text-cyan-950 animate-spin" />
            </motion.div>
          </motion.div>
        )}

        {/* 2. Shrinking / Docking Floating Thumbnail Preview */}
        {showThumbnailPill && activeCapture && (
          <motion.div
            key="thumbnail-dock"
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.9, 0.7, 0.35],
              x: [0, 0, 80],
              y: [0, -80, -260]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-48 h-80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 border-cyan-400/90 bg-slate-900 flex flex-col">
              <img
                src={activeCapture.thumbnailUrl}
                alt="Captured Screen"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-md p-2 flex items-center justify-between text-white border-t border-cyan-500/40">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-[9px] font-mono font-bold text-cyan-300">Saved to Gallery</span>
                </div>
                <Camera size={11} className="text-slate-400" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
