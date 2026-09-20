import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { playCinematicBootChime } from "../utils/sound";

export type BootTheme = "quantum_neon" | "cyber_matrix" | "cosmic_aurora" | "hyper_titanium" | "solar_flare";

interface BootAnimationProps {
  onComplete: () => void;
  onSystemLog?: (msg: string, level?: "INFO" | "WARNING" | "CRITICAL") => void;
  initialTheme?: BootTheme;
  autoPlaySound?: boolean;
}

export default function BootAnimation({
  onComplete,
  onSystemLog,
  initialTheme = "quantum_neon",
  autoPlaySound = true
}: BootAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  // Play sound on mount if enabled
  useEffect(() => {
    if (autoPlaySound) {
      playCinematicBootChime();
    }
    onSystemLog?.("[BootEngine] OS Boot Sequence Initiated", "INFO");
    
    // Delay showing the progress bar to mimic real OS boot sequence
    const timer = setTimeout(() => {
      setShowProgressBar(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [autoPlaySound, onSystemLog]);

  // Smooth progress animation
  useEffect(() => {
    let startTime = performance.now();
    const DURATION = 3000; // 3 seconds smooth boot sequence

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      let p = Math.min((elapsed / DURATION) * 100, 100);
      
      setProgress(p);

      if (elapsed < DURATION) {
        requestAnimationFrame(updateProgress);
      } else {
        onSystemLog?.("[BootEngine] System core loaded.", "INFO");
        setTimeout(onComplete, 400); // Pause briefly at 100%
      }
    };

    requestAnimationFrame(updateProgress);
  }, [onComplete, onSystemLog]);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center"
      >
        <img 
          src="/OS LOGO.png" 
          alt="KK OS Logo" 
          className="w-20 h-20 object-contain mb-8 shadow-black drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
        />
        
        {/* Progress Bar Container */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: showProgressBar ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-6"
        >
          <motion.div
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
