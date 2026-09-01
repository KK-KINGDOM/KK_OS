import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wallpaper } from "../types";
import {
  DynamicWallpaperConfig,
  getWallpaperById,
  TransitionStyle,
  ParticleEffect
} from "../utils/dynamicWallpaperEngine";
import { WALLPAPER_PATTERNS } from "../utils/theme";

interface DynamicWallpaperCanvasProps {
  currentWallpaperId: string;
  config?: DynamicWallpaperConfig;
  patternOverlayId?: string;
  className?: string;
  children?: React.ReactNode;
  dimmingOpacity?: number; // 0 to 1
  blurAmount?: string; // e.g. "0px", "4px"
  showParticles?: boolean;
}

export default function DynamicWallpaperCanvas({
  currentWallpaperId,
  config,
  patternOverlayId,
  className = "",
  children,
  dimmingOpacity = 0,
  blurAmount = "0px",
  showParticles = true
}: DynamicWallpaperCanvasProps) {
  // Resolve current wallpaper object
  const activeWallpaper: Wallpaper = useMemo(() => {
    return getWallpaperById(currentWallpaperId, config?.customGradients);
  }, [currentWallpaperId, config?.customGradients]);

  const transitionDuration = config?.transitionDurationSec ?? 1.2;
  const transitionStyle: TransitionStyle = config?.transitionStyle ?? "crossfade";
  const particleEffect: ParticleEffect = config?.particleEffect ?? "none";
  const activePatternId = patternOverlayId ?? config?.patternOverlayId ?? "grid";

  // Find pattern overlay CSS
  const selectedPattern = useMemo(() => {
    return WALLPAPER_PATTERNS.find((p) => p.id === activePatternId) || WALLPAPER_PATTERNS[0];
  }, [activePatternId]);

  // Framer motion variants based on selected transition style
  const getVariants = (style: TransitionStyle) => {
    switch (style) {
      case "zoom-fade":
        return {
          initial: { opacity: 0, scale: 1.08 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 }
        };
      case "drift":
        return {
          initial: { opacity: 0, scale: 1.05, x: 12 },
          animate: { opacity: 1, scale: 1, x: 0 },
          exit: { opacity: 0, scale: 0.98, x: -12 }
        };
      case "blur-fade":
        return {
          initial: { opacity: 0, filter: "blur(12px)", scale: 1.04 },
          animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
          exit: { opacity: 0, filter: "blur(8px)", scale: 0.96 }
        };
      case "crossfade":
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const variants = getVariants(transitionStyle);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-slate-950 select-none ${className}`}
      style={{ filter: blurAmount !== "0px" ? `blur(${blurAmount})` : undefined }}
    >
      {/* ANIMATED WALLPAPER BACKGROUND LAYER STACK */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={activeWallpaper.id}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: transitionDuration,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className={`absolute inset-0 w-full h-full ${activeWallpaper.className}`}
          style={{
            ...(activeWallpaper.imageUrl
              ? {
                  backgroundImage: `url(${activeWallpaper.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
              : activeWallpaper.customStyle || {})
          }}
        >
          {/* Subtle Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* PATTERN OVERLAY MESH (Grid, Dots, Hexagon Honeycomb, Circuit Traces) */}
      {selectedPattern && selectedPattern.id !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none opacity-25 z-1 transition-all duration-500"
          style={{
            backgroundImage: selectedPattern.cssPattern,
            backgroundSize:
              selectedPattern.id === "dots"
                ? "16px 16px"
                : selectedPattern.id === "grid" || selectedPattern.id === "cybergrid"
                ? "20px 20px"
                : "auto"
          }}
        />
      )}

      {/* AMBIENT FLOATING PARTICLE EFFECT OVERLAY */}
      {showParticles && particleEffect !== "none" && (
        <div className="absolute inset-0 pointer-events-none z-2 overflow-hidden">
          {particleEffect === "orbs" && (
            <>
              <motion.div
                animate={{
                  x: [0, 40, -30, 0],
                  y: [0, -60, 20, 0],
                  scale: [1, 1.25, 0.9, 1],
                  opacity: [0.25, 0.45, 0.25]
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl"
              />
              <motion.div
                animate={{
                  x: [0, -50, 30, 0],
                  y: [0, 50, -40, 0],
                  scale: [1, 0.85, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-purple-500/20 blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [0.9, 1.3, 0.9],
                  opacity: [0.15, 0.35, 0.15]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/3 w-36 h-36 rounded-full bg-emerald-500/15 blur-2xl"
              />
            </>
          )}

          {particleEffect === "sparkles" && (
            <div className="absolute inset-0">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.1, 0.8, 0.1],
                    scale: [0.6, 1.4, 0.6],
                    y: [0, -15, 0]
                  }}
                  transition={{
                    duration: 3 + (i % 4),
                    repeat: Infinity,
                    delay: i * 0.45,
                    ease: "easeInOut"
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                  style={{
                    top: `${(i * 12 + 10) % 85}%`,
                    left: `${(i * 23 + 15) % 90}%`
                  }}
                />
              ))}
            </div>
          )}

          {particleEffect === "cyber-grid" && (
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent opacity-60">
              <motion.div
                animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-full"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)`,
                  backgroundSize: "100% 20px"
                }}
              />
            </div>
          )}

          {particleEffect === "aurora" && (
            <motion.div
              animate={{
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 8, -8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/20 blur-3xl pointer-events-none"
            />
          )}
        </div>
      )}

      {/* DIMMING LAYER (Used for LockScreen/Settings/AppDrawer/Modals) */}
      {dimmingOpacity > 0 && (
        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 z-3"
          style={{ opacity: dimmingOpacity }}
        />
      )}

      {/* FOREGROUND CONTENT LAYER */}
      <div className="relative w-full h-full z-10">{children}</div>
    </div>
  );
}
