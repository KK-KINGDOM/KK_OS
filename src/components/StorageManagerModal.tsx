import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HardDrive,
  Trash2,
  Sparkles,
  CheckCircle2,
  Loader2,
  Folder,
  FileCode,
  PieChart,
  X,
  RefreshCw,
  FolderOpen,
  Info,
  ShieldCheck,
  Zap,
  CheckSquare,
  Square
} from "lucide-react";
import {
  getAvailableCacheItems,
  cleanCacheItem,
  cleanAllCache,
  restoreAllCache,
  getTotalCacheSizeMB,
  addCacheUpdatedListener,
  CacheItem
} from "../utils/fileSystem";
import { triggerHapticVibration } from "../utils/haptics";

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp?: (appId: any) => void;
  onSystemLog?: (log: string, severity?: "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function StorageManagerModal({
  isOpen,
  onClose,
  onOpenApp,
  onSystemLog
}: StorageManagerModalProps) {
  const [cacheItems, setCacheItems] = useState<CacheItem[]>(getAvailableCacheItems());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const refreshCache = () => {
    const items = getAvailableCacheItems();
    setCacheItems(items);
    setSelectedIds(items.map((i) => i.id));
  };

  useEffect(() => {
    refreshCache();
    const unsubscribe = addCacheUpdatedListener(() => {
      refreshCache();
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCacheMB = cacheItems.reduce((acc, i) => acc + i.sizeMB, 0);
  const totalCacheGB = (totalCacheMB / 1000).toFixed(2);

  const totalCapacityGB = 128;
  const systemGB = 18.4;
  const appsGB = 28.6;
  const userDataGB = 32.1;
  const currentCacheGB = Number(totalCacheGB);
  const totalUsedGB = Number((systemGB + appsGB + userDataGB + currentCacheGB).toFixed(1));
  const freeGB = Number((totalCapacityGB - totalUsedGB).toFixed(1));

  const toggleSelect = (id: string) => {
    triggerHapticVibration("light");
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    triggerHapticVibration("light");
    if (selectedIds.length === cacheItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cacheItems.map((i) => i.id));
    }
  };

  const handleCleanSelected = () => {
    if (selectedIds.length === 0) return;

    triggerHapticVibration("medium");
    setIsCleaning(true);
    setCleaningProgress(15);
    setStatusMessage("Unlinking temporary cache inodes from VFS...");

    setTimeout(() => {
      setCleaningProgress(60);
      setStatusMessage("Purging cache vectors and reclaiming storage sectors...");
    }, 600);

    setTimeout(() => {
      setCleaningProgress(100);
      let freedMB = 0;
      selectedIds.forEach((id) => {
        freedMB += cleanCacheItem(id);
      });

      const freedGB = (freedMB / 1000).toFixed(2);
      triggerHapticVibration("heavy");
      setIsCleaning(false);
      setCleaningProgress(0);
      setStatusMessage(`Successfully cleaned ${freedGB} GB of cache from directory tree!`);

      if (onSystemLog) {
        onSystemLog(
          `[StorageManager] Purged ${freedGB} GB of cache files from /KK-Mobile-OS/cache/`,
          "INFO"
        );
      }

      setTimeout(() => setStatusMessage(null), 4000);
    }, 1200);
  };

  const handleCleanAll = () => {
    triggerHapticVibration("heavy");
    setIsCleaning(true);
    setCleaningProgress(20);
    setStatusMessage("Sweeping all temporary cache files across system partitions...");

    setTimeout(() => {
      setCleaningProgress(70);
      setStatusMessage("Flashing journal tables and updating directory tree...");
    }, 700);

    setTimeout(() => {
      setCleaningProgress(100);
      const freedMB = cleanAllCache();
      const freedGB = (freedMB / 1000).toFixed(2);

      triggerHapticVibration("heavy");
      setIsCleaning(false);
      setCleaningProgress(0);
      setStatusMessage(`✨ System Fully Optimized! Freed ${freedGB} GB of cache.`);

      if (onSystemLog) {
        onSystemLog(
          `[StorageManager] Full system cache cleanup executed. ${freedGB} GB reclaimed.`,
          "INFO"
        );
      }

      setTimeout(() => setStatusMessage(null), 4000);
    }, 1300);
  };

  const handleRestore = () => {
    triggerHapticVibration("medium");
    restoreAllCache();
    setStatusMessage("Restored simulated cache files into directory structure.");
    if (onSystemLog) {
      onSystemLog("[StorageManager] Simulated cache files restored to /KK-Mobile-OS/cache/", "INFO");
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[340px] max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl p-4 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-3 relative overflow-hidden"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500" />

          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-teal-950 border border-teal-800/80 text-teal-400 shadow-inner">
                <HardDrive size={18} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  Storage Manager
                  <ShieldCheck size={12} className="text-teal-400" />
                </h3>
                <p className="text-[9px] font-mono text-slate-400">
                  Simulated VFS Cache Cleanup Utility
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer transition-colors"
              title="Close Storage Manager"
            >
              <X size={13} />
            </button>
          </div>

          {/* Status Message Alert */}
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 rounded-xl bg-teal-950/90 border border-teal-500/50 text-teal-200 text-[10px] font-bold flex items-center gap-2 shadow"
            >
              <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </motion.div>
          )}

          {/* Storage Capacity Gauge */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-300">Internal Storage Meter</span>
              <span className="text-teal-400 font-mono">
                {totalUsedGB} GB / {totalCapacityGB} GB Used
              </span>
            </div>

            {/* Segmented Meter Bar */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full p-0.5 border border-slate-800 flex overflow-hidden">
              <div
                style={{ width: `${(systemGB / totalCapacityGB) * 100}%` }}
                className="h-full bg-purple-500 rounded-l-full"
                title={`System: ${systemGB} GB`}
              />
              <div
                style={{ width: `${(appsGB / totalCapacityGB) * 100}%` }}
                className="h-full bg-cyan-400"
                title={`Apps: ${appsGB} GB`}
              />
              <div
                style={{ width: `${(userDataGB / totalCapacityGB) * 100}%` }}
                className="h-full bg-emerald-400"
                title={`User Data: ${userDataGB} GB`}
              />
              <div
                style={{ width: `${(currentCacheGB / totalCapacityGB) * 100}%` }}
                className="h-full bg-rose-500 animate-pulse"
                title={`Cache Files: ${currentCacheGB} GB`}
              />
              <div
                style={{ width: `${(freeGB / totalCapacityGB) * 100}%` }}
                className="h-full bg-slate-800 rounded-r-full"
                title={`Free: ${freeGB} GB`}
              />
            </div>

            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-0.5">
              <span className="text-purple-400 font-bold">• System {systemGB}G</span>
              <span className="text-cyan-400 font-bold">• Apps {appsGB}G</span>
              <span className="text-rose-400 font-bold">
                • Cache {currentCacheGB > 0 ? `${currentCacheGB}G` : "0G"}
              </span>
              <span className="text-emerald-400 font-bold">• Free {freeGB}G</span>
            </div>
          </div>

          {/* Cleaning Progress Bar */}
          {isCleaning && (
            <div className="p-2.5 rounded-2xl bg-slate-900 border border-teal-500/40 space-y-1.5">
              <div className="flex justify-between items-center text-[9.5px] font-bold">
                <span className="text-teal-400 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Purging Cache...
                </span>
                <span className="font-mono text-teal-300">{cleaningProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transition-all duration-200"
                  style={{ width: `${cleaningProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cache Directory Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-none max-h-[220px]">
            <div className="flex items-center justify-between text-[9.5px] font-bold font-mono text-slate-400 px-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Folder size={11} className="text-teal-400" />
                <span>Path: /KK-Mobile-OS/cache/</span>
              </span>

              {cacheItems.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="text-[8.5px] text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
                >
                  {selectedIds.length === cacheItems.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {cacheItems.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-2">
                <CheckCircle2 size={24} className="text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-xs font-extrabold text-white">Cache Directories Empty!</h4>
                <p className="text-[9px] text-slate-400">
                  All temporary cache files have been purged from the directory structure.
                </p>
                <button
                  onClick={handleRestore}
                  className="mt-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-[9.5px] font-bold text-teal-300 cursor-pointer flex items-center gap-1 mx-auto transition-all"
                >
                  <RefreshCw size={11} /> Restore Demo Cache
                </button>
              </div>
            ) : (
              cacheItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-900 border-teal-500/60 shadow-sm"
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900/60 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        className="text-teal-400 shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                      >
                        {isSelected ? <CheckSquare size={15} /> : <Square size={15} className="text-slate-600" />}
                      </button>

                      <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-400 shrink-0">
                        <FileCode size={13} />
                      </div>

                      <div className="truncate">
                        <h4 className="text-[11px] font-extrabold text-white truncate">{item.name}</h4>
                        <p className="text-[8.5px] font-mono text-slate-400 truncate">{item.description}</p>
                      </div>
                    </div>

                    <span className="text-[9.5px] font-mono font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800 shrink-0 ml-1">
                      {item.sizeMB >= 1000 ? `${(item.sizeMB / 1000).toFixed(1)} GB` : `${item.sizeMB} MB`}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCleanSelected}
                disabled={isCleaning || selectedIds.length === 0}
                className="flex-1 py-2 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40"
              >
                <Trash2 size={13} />
                <span>Clean Selected ({selectedIds.length})</span>
              </button>

              <button
                onClick={handleCleanAll}
                disabled={isCleaning || cacheItems.length === 0}
                className="py-2 px-3 rounded-2xl bg-rose-950 hover:bg-rose-900 border border-rose-700/80 text-rose-200 font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-40"
                title="Purge all cache immediately"
              >
                <Sparkles size={13} className="text-rose-400" />
                <span>Clean All</span>
              </button>
            </div>

            {/* Quick Link to File Explorer */}
            {onOpenApp && (
              <button
                onClick={() => {
                  onClose();
                  onOpenApp("file_manager");
                }}
                className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-teal-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <FolderOpen size={12} className="text-teal-400" />
                <span>Open File Explorer to verify /KK-Mobile-OS/cache/</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
