import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  AlertOctagon,
  X,
  Clock,
  Bell,
  Trash2,
  BellOff,
  CornerDownRight,
  Send,
  Check,
  Archive,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Layers,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { SystemToast, AppID } from "../types";
import { playClickSound, playAppLaunchSound } from "../utils/sound";

interface ToastNotificationProps {
  toasts: SystemToast[];
  onDismiss: (id: string) => void;
  onClearAll?: () => void;
  onMarkRead?: (id: string, isRead?: boolean) => void;
  onArchive?: (id: string, isArchived?: boolean) => void;
  onReply?: (id: string, replyText: string) => void;
  onOpenNotificationCenter?: () => void;
  onOpenApp?: (appId: AppID) => void;
  isDndActive?: boolean;
  hiddenToastsCount?: number;
}

interface ToastItemProps {
  key?: React.Key;
  toast: SystemToast;
  onDismiss: (id: string) => void;
  onMarkRead?: (id: string, isRead?: boolean) => void;
  onArchive?: (id: string, isArchived?: boolean) => void;
  onReply?: (id: string, replyText: string) => void;
  onOpenApp?: (appId: AppID) => void;
}

function ToastItem({
  toast,
  onDismiss,
  onMarkRead,
  onArchive,
  onReply,
  onOpenApp
}: ToastItemProps) {
  const isCritical = toast.severity === "CRITICAL";
  const isMessage = toast.category === "message";
  const isParental = toast.category === "parental";
  const durationMs = isCritical ? 10000 : isParental ? 8500 : 7500;

  const [progress, setProgress] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [justReplied, setJustReplied] = useState<string | null>(null);

  const quickReplies = ["Acknowledged", "On my way", "Confirmed", "Will check now"];

  useEffect(() => {
    if (isPaused || isExpanded || isReplying) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [toast.id, durationMs, onDismiss, isPaused, isExpanded, isReplying]);

  const handleSendReply = (textToSend?: string) => {
    const finalReply = textToSend || replyInput.trim();
    if (!finalReply) return;

    onReply?.(toast.id, finalReply);
    setJustReplied(finalReply);
    setReplyInput("");
    setIsReplying(false);
    playClickSound();

    // Auto dismiss after brief success display
    setTimeout(() => {
      onDismiss(toast.id);
    }, 2400);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -30, scale: 0.92, filter: "blur(4px)" }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        boxShadow: isCritical
          ? "0 10px 30px rgba(244,63,94,0.45)"
          : isParental
          ? "0 10px 30px rgba(16,185,129,0.45)"
          : isMessage
          ? "0 10px 28px rgba(45,212,191,0.35)"
          : "0 10px 25px rgba(245,158,11,0.35)"
      }}
      exit={{
        opacity: 0,
        y: -20,
        scale: 0.88,
        filter: "blur(4px)",
        transition: { duration: 0.2, ease: "easeIn" }
      }}
      transition={{ type: "spring", stiffness: 450, damping: 26 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full rounded-2xl p-2.5 shadow-2xl border backdrop-blur-xl flex flex-col gap-2 overflow-hidden select-none transition-all ${
        toast.isRead
          ? "bg-slate-950/90 border-slate-700 text-slate-300"
          : isCritical
          ? "bg-slate-950/98 border-rose-500/90 text-rose-100 ring-1 ring-rose-500/30"
          : isParental
          ? "bg-slate-950/98 border-emerald-500/90 text-emerald-100 ring-1 ring-emerald-500/30"
          : isMessage
          ? "bg-slate-950/98 border-teal-500/80 text-teal-100 ring-1 ring-teal-500/30"
          : "bg-slate-950/98 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/30"
      }`}
      role="alert"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Icon */}
          {isCritical ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="p-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-400 shrink-0"
            >
              <AlertOctagon size={13} />
            </motion.div>
          ) : isParental ? (
            <div className="p-1 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400 shrink-0">
              <Smartphone size={13} />
            </div>
          ) : isMessage ? (
            <div className="p-1 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 shrink-0">
              <MessageSquare size={13} />
            </div>
          ) : (
            <div className="p-1 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 shrink-0">
              <AlertTriangle size={13} />
            </div>
          )}

          {/* Sender / Module */}
          <span className="font-extrabold text-[10.5px] text-white truncate max-w-[120px]">
            {toast.sender || toast.module || "System Core"}
          </span>

          {/* Severity Badge */}
          <span
            className={`text-[7.5px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 tracking-wider ${
              toast.isRead
                ? "bg-slate-900 border-slate-700 text-slate-400"
                : isCritical
                ? "bg-rose-900/70 border-rose-700 text-rose-300"
                : isParental
                ? "bg-emerald-900/80 border-emerald-600 text-emerald-300"
                : isMessage
                ? "bg-teal-900/70 border-teal-700 text-teal-300"
                : "bg-amber-900/70 border-amber-700 text-amber-300"
            }`}
          >
            {toast.isRead ? "READ" : isParental ? "PARENT ALERT" : toast.severity}
          </span>
        </div>

        {/* Timestamp, Expand Toggle & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[8px] font-mono text-slate-400 flex items-center gap-0.5">
            <Clock size={8} />
            {toast.timestamp}
          </span>

          {/* Quick Expand Toggle */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              playClickSound();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isExpanded ? "Collapse actions" : "Expand actions (Reply, Mark Read, Archive)"}
          >
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Dismiss Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss toast"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Message Body */}
      <p
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-[10.5px] font-sans font-medium leading-snug text-slate-100 break-words pl-0.5 cursor-pointer"
      >
        {toast.message || toast.logText}
      </p>

      {/* Success banner if reply was sent */}
      {justReplied && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-1.5 rounded-xl bg-teal-950/90 border border-teal-500/80 text-teal-300 text-[9.5px] font-sans flex items-center gap-1.5 shadow-md"
        >
          <Check size={12} className="text-teal-400 shrink-0" />
          <span className="font-bold">Reply Sent: </span>
          <span className="truncate text-white">"{justReplied}"</span>
        </motion.div>
      )}

      {/* Action Buttons Toolbar (Always visible or expanded) */}
      <div className="flex items-center justify-between gap-1 pt-0.5 flex-wrap">
        {/* Reply Action */}
        <button
          onClick={() => {
            setIsReplying(!isReplying);
            setIsExpanded(true);
            setIsPaused(true);
            playClickSound();
          }}
          className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
            isReplying
              ? "bg-teal-500 text-slate-950 border-teal-400 font-extrabold shadow-sm"
              : "bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-teal-300 hover:border-teal-500"
          }`}
          title="Direct Quick Reply"
        >
          <CornerDownRight size={10} />
          <span>Reply</span>
        </button>

        {/* Mark Read Action */}
        <button
          onClick={() => {
            onMarkRead?.(toast.id, !toast.isRead);
            playClickSound();
          }}
          className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
            toast.isRead
              ? "bg-slate-800 border-slate-700 text-slate-400"
              : "bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-emerald-300 hover:border-emerald-500"
          }`}
          title={toast.isRead ? "Marked as read" : "Mark as read"}
        >
          <Check size={10} className={toast.isRead ? "text-emerald-400" : "text-slate-400"} />
          <span>{toast.isRead ? "Read" : "Mark Read"}</span>
        </button>

        {/* Archive Action */}
        <button
          onClick={() => {
            onArchive?.(toast.id, true);
            playClickSound();
          }}
          className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500 flex items-center gap-1 transition-all cursor-pointer"
          title="Archive notification"
        >
          <Archive size={10} />
          <span>Archive</span>
        </button>

        {/* Open App Link (if present) */}
        {toast.appId && onOpenApp && (
          <button
            onClick={() => {
              onOpenApp(toast.appId!);
              onDismiss(toast.id);
              playAppLaunchSound();
            }}
            className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:border-cyan-400 flex items-center gap-1 transition-all cursor-pointer ml-auto"
            title="Open application"
          >
            <ExternalLink size={10} />
            <span>Open</span>
          </button>
        )}
      </div>

      {/* Inline Quick Reply Drawer when Reply is active or expanded */}
      {(isReplying || isExpanded) && !justReplied && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-1.5 border-t border-slate-800/80 space-y-1.5"
        >
          {/* Quick Preset Chips */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {quickReplies.map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleSendReply(text)}
                className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 text-[8.5px] font-medium text-slate-300 hover:text-teal-200 transition-all shrink-0 cursor-pointer active:scale-95"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Custom Input Field */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              autoFocus={isReplying}
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="Type instant reply..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-all font-sans"
            />
            <button
              onClick={() => handleSendReply()}
              disabled={!replyInput.trim()}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                replyInput.trim()
                  ? "bg-teal-500 border-teal-400 text-slate-950 shadow-md font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
              }`}
              title="Send reply"
            >
              <Send size={11} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Auto-Dismiss Countdown Progress Bar (Hidden if paused or typing) */}
      {!isPaused && !isExpanded && !isReplying && (
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-0.5">
          <div
            className={`h-full transition-all duration-75 ${
              isCritical
                ? "bg-gradient-to-r from-rose-500 to-red-400"
                : isMessage
                ? "bg-gradient-to-r from-teal-400 to-cyan-300"
                : "bg-gradient-to-r from-amber-500 to-yellow-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function ToastNotification({
  toasts,
  onDismiss,
  onClearAll,
  onMarkRead,
  onArchive,
  onReply,
  onOpenNotificationCenter,
  onOpenApp,
  isDndActive,
  hiddenToastsCount = 0
}: ToastNotificationProps) {
  // Only display active non-archived toasts in the heads-up toast container
  const visibleToasts = toasts.filter((t) => !t.isArchived);

  if ((!visibleToasts || visibleToasts.length === 0) && !isDndActive) return null;

  return (
    <div
      className="absolute top-8 left-2 right-2 z-[60] flex flex-col gap-2 pointer-events-auto max-h-[340px] overflow-y-auto pr-0.5 scrollbar-none"
      id="toast-notification-container"
    >
      <AnimatePresence mode="popLayout">
        {/* Do Not Disturb Banner if DND is active */}
        {isDndActive && (visibleToasts.length > 0 || hiddenToastsCount > 0) && (
          <motion.div
            key="dnd-banner"
            layout
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-indigo-950/95 border border-indigo-500/80 text-[9px] font-mono text-indigo-200 backdrop-blur-md shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
          >
            <span className="flex items-center gap-1.5 font-bold">
              <BellOff size={11} className="text-indigo-400 animate-pulse" />
              <span>Do Not Disturb Active</span>
            </span>
            {hiddenToastsCount > 0 ? (
              <span className="text-[8px] bg-indigo-900/80 px-1.5 py-0.5 rounded text-indigo-300 border border-indigo-700/80 font-bold">
                {hiddenToastsCount} non-essential alert{hiddenToastsCount > 1 ? "s" : ""} hidden
              </span>
            ) : (
              <span className="text-[8px] text-indigo-300 font-semibold">Sounds Muted</span>
            )}
          </motion.div>
        )}

        {/* Header bar if notifications exist or button to open full Notification Center */}
        {visibleToasts.length > 0 && (
          <motion.div
            key="multi-toast-header"
            layout
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-black/90 border border-slate-800 text-[9px] font-mono text-slate-300 backdrop-blur-md shadow-md"
          >
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 font-bold text-teal-400">
                <Bell size={10} className="animate-bounce text-teal-400" />
                {visibleToasts.length} Active Alert{visibleToasts.length > 1 ? "s" : ""}
              </span>
              {onOpenNotificationCenter && (
                <button
                  onClick={onOpenNotificationCenter}
                  className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-teal-950 text-teal-300 hover:text-teal-200 border border-slate-700 text-[8px] font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  <Layers size={8} />
                  <span>Center</span>
                </button>
              )}
            </div>

            {onClearAll && (
              <button
                onClick={onClearAll}
                className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer transition-colors"
              >
                <Trash2 size={9} />
                Clear All
              </button>
            )}
          </motion.div>
        )}

        {/* Render interactive toast items with direct reply, mark read, archive */}
        {visibleToasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            onMarkRead={onMarkRead}
            onArchive={onArchive}
            onReply={onReply}
            onOpenApp={onOpenApp}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
