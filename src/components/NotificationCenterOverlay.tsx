import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  BellOff,
  X,
  Check,
  CheckCheck,
  Archive,
  ArchiveRestore,
  Trash2,
  CornerDownRight,
  Send,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Info,
  MessageSquare,
  ShieldAlert,
  Zap,
  HardDrive,
  Clock,
  Search,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers
} from "lucide-react";
import { SystemToast, AppID, LogSeverity } from "../types";
import { playClickSound, playAppLaunchSound } from "../utils/sound";

interface NotificationCenterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  toasts: SystemToast[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onMarkRead: (id: string, isRead?: boolean) => void;
  onMarkAllRead: () => void;
  onArchive: (id: string, isArchived?: boolean) => void;
  onArchiveAll: () => void;
  onReply: (id: string, replyText: string) => void;
  onOpenApp?: (appId: AppID) => void;
  onSimulateNotification?: (sample: Partial<SystemToast>) => void;
  isDndActive?: boolean;
  onToggleDnd?: () => void;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
  currentTime?: string;
}

export default function NotificationCenterOverlay({
  isOpen,
  onClose,
  toasts,
  onDismiss,
  onClearAll,
  onMarkRead,
  onMarkAllRead,
  onArchive,
  onArchiveAll,
  onReply,
  onOpenApp,
  onSimulateNotification,
  isDndActive = false,
  onToggleDnd,
  onSystemLog
}: NotificationCenterOverlayProps) {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "messages" | "system" | "archived">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [simMenuOpen, setSimMenuOpen] = useState(false);

  // Quick reply preset phrases
  const quickReplies = [
    "Acknowledged",
    "On my way",
    "Looking into it now",
    "Confirmed, thanks!",
    "Will resolve shortly"
  ];

  // Counts
  const activeToasts = useMemo(() => toasts.filter((t) => !t.isArchived), [toasts]);
  const archivedToasts = useMemo(() => toasts.filter((t) => t.isArchived), [toasts]);
  const unreadCount = useMemo(() => activeToasts.filter((t) => !t.isRead).length, [activeToasts]);

  // Filtered toasts
  const filteredToasts = useMemo(() => {
    return toasts.filter((toast) => {
      // Tab filter
      if (activeTab === "active" && toast.isArchived) return false;
      if (activeTab === "archived" && !toast.isArchived) return false;
      if (activeTab === "messages" && (toast.isArchived || toast.category !== "message")) return false;
      if (activeTab === "system" && (toast.isArchived || (toast.category === "message"))) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          (toast.message || "").toLowerCase().includes(q) ||
          (toast.logText || "").toLowerCase().includes(q) ||
          (toast.module || "").toLowerCase().includes(q) ||
          (toast.sender || "").toLowerCase().includes(q) ||
          (toast.title || "").toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      return true;
    });
  }, [toasts, activeTab, searchQuery]);

  const handleSendReply = (toastId: string) => {
    const text = replyInputs[toastId]?.trim();
    if (!text) return;

    onReply(toastId, text);
    setReplyInputs((prev) => ({ ...prev, [toastId]: "" }));
    playClickSound();
    onSystemLog?.(`[NotificationCenter] User replied to alert ${toastId}: "${text}"`, "INFO");
  };

  const handleQuickPresetReply = (toastId: string, text: string) => {
    onReply(toastId, text);
    playClickSound();
    onSystemLog?.(`[NotificationCenter] Quick reply sent: "${text}"`, "INFO");
  };

  const sampleNotifications: Array<{ title: string; desc: string; sample: Partial<SystemToast> }> = [
    {
      title: "💬 Message from Sarah Connor",
      desc: "SMS conversation test with quick reply",
      sample: {
        category: "message",
        sender: "Sarah Connor",
        module: "Messages",
        message: "Hey! Can you verify if the neural kernel firewall is active on KK OS?",
        severity: "INFO",
        appId: AppID.MESSAGES
      }
    },
    {
      title: "🛡️ Security Firewall Alert",
      desc: "Critical SELinux port scan alert",
      sample: {
        category: "security",
        module: "SecurityCore",
        sender: "SELinux Daemon",
        message: "CRITICAL: Blocked unauthorized inbound socket request on port 8080 from subnet 10.0.0.42.",
        severity: "CRITICAL",
        appId: AppID.SECURITY
      }
    },
    {
      title: "⚡ Battery Power Alert",
      desc: "Warning: Battery level dropped to 18%",
      sample: {
        category: "battery",
        module: "PowerHAL",
        sender: "Battery Manager",
        message: "WARNING: High power draw detected. Battery capacity dropped to 18%. Switch to Power Saver mode.",
        severity: "WARNING",
        appId: AppID.SETTINGS
      }
    },
    {
      title: "🤖 AI Assistant Digest",
      desc: "Gemini daily workflow analysis",
      sample: {
        category: "app",
        module: "KK_AI",
        sender: "KK OS Assistant",
        message: "Your daily system health summary is ready. 0 memory leaks detected, 99.9% CFS scheduler efficiency.",
        severity: "INFO",
        appId: AppID.AI_ASSISTANT
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-55 bg-slate-950/85 backdrop-blur-xl flex flex-col overflow-hidden select-none text-slate-100"
        id="notification-center-overlay"
      >
        {/* Top Control Bar / Drag Handle */}
        <div className="pt-2 pb-1 px-4 flex flex-col items-center border-b border-slate-800/80 bg-slate-900/60 shrink-0">
          <div
            onClick={onClose}
            className="w-12 h-1.5 bg-slate-700 hover:bg-teal-400 rounded-full cursor-pointer transition-colors mb-2"
            title="Swipe up or tap to dismiss Notification Center"
          />

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-teal-950 border border-teal-800/80 text-teal-400 shadow-sm">
                <Bell size={16} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white tracking-tight">Notification Center</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-teal-500 text-slate-950 font-black text-[9px] shadow-[0_0_8px_rgba(45,212,191,0.8)]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <span className="text-[9.5px] font-mono text-slate-400">
                  {toasts.length} total alerts • Real-time interactive actions
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* DND Toggle */}
              {onToggleDnd && (
                <button
                  onClick={onToggleDnd}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isDndActive
                      ? "bg-indigo-950 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                  title={isDndActive ? "Do Not Disturb is ON" : "Turn ON Do Not Disturb"}
                >
                  <BellOff size={14} />
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & Test Simulator Trigger */}
        <div className="px-3.5 pt-2.5 pb-2 flex items-center gap-2 border-b border-slate-800/60 bg-slate-950/40 shrink-0">
          <div className="flex-1 relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications & logs..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Simulate New Alert Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setSimMenuOpen(!simMenuOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-teal-950/90 hover:bg-teal-900 border border-teal-700/80 text-teal-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
              title="Simulate incoming interactive notification"
            >
              <Plus size={12} />
              <span>Simulate</span>
            </button>

            {/* Simulation Dropdown */}
            {simMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 backdrop-blur-xl"
              >
                <div className="px-2 py-1 text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider border-b border-slate-800">
                  Trigger Test Notification
                </div>
                {sampleNotifications.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSimulateNotification?.(sample.sample);
                      setSimMenuOpen(false);
                      playClickSound();
                    }}
                    className="text-left px-2 py-1.5 rounded-xl hover:bg-slate-800 transition-colors flex flex-col cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-teal-300">
                      {sample.title}
                    </span>
                    <span className="text-[9px] text-slate-400 leading-tight">{sample.desc}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Tab Filters & Batch Actions */}
        <div className="px-3.5 py-2 flex items-center justify-between gap-1 border-b border-slate-800/80 bg-slate-900/40 shrink-0 overflow-x-auto scrollbar-none">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {[
              { key: "active", label: "Active", count: activeToasts.length },
              { key: "messages", label: "Messages", count: toasts.filter((t) => !t.isArchived && t.category === "message").length },
              { key: "system", label: "System", count: toasts.filter((t) => !t.isArchived && t.category !== "message").length },
              { key: "archived", label: "Archived", count: archivedToasts.length },
              { key: "all", label: "All", count: toasts.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  playClickSound();
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-teal-950 border border-teal-500 text-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.3)]"
                    : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[8.5px] px-1 py-0.2 rounded-full ${
                    activeTab === tab.key ? "bg-teal-400/20 text-teal-300" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-1 pl-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  onMarkAllRead();
                  playClickSound();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={12} />
                <span className="hidden sm:inline">Read All</span>
              </button>
            )}

            {activeToasts.length > 0 && (
              <button
                onClick={() => {
                  onArchiveAll();
                  playClickSound();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Archive all active notifications"
              >
                <Archive size={12} />
              </button>
            )}

            {toasts.length > 0 && (
              <button
                onClick={() => {
                  onClearAll();
                  playClickSound();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Clear all alerts"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 scrollbar-thin">
          {filteredToasts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-inner">
                {activeTab === "archived" ? <Archive size={26} /> : <CheckCheck size={26} className="text-teal-500" />}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-300">
                  {activeTab === "archived"
                    ? "No archived notifications"
                    : searchQuery
                    ? "No matching notifications found"
                    : "You're all caught up!"}
                </h4>
                <p className="text-[10px] text-slate-500 max-w-[220px]">
                  {activeTab === "archived"
                    ? "Notifications archived from the active tab will be saved here."
                    : "No new system alerts or messages pending. Tap 'Simulate' above to test interactive toasts."}
                </p>
              </div>

              {/* Quick test buttons */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => {
                    onSimulateNotification?.(sampleNotifications[0].sample);
                    playClickSound();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-teal-950 border border-teal-800/80 text-teal-300 text-[9.5px] font-mono font-bold hover:bg-teal-900 transition-colors cursor-pointer"
                >
                  + Test SMS Reply
                </button>
                <button
                  onClick={() => {
                    onSimulateNotification?.(sampleNotifications[1].sample);
                    playClickSound();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-rose-950 border border-rose-800/80 text-rose-300 text-[9.5px] font-mono font-bold hover:bg-rose-900 transition-colors cursor-pointer"
                >
                  + Test Security Alert
                </button>
              </div>
            </div>
          ) : (
            filteredToasts.map((toast) => {
              const isExpanded = expandedId === toast.id;
              const isCritical = toast.severity === "CRITICAL";
              const isWarning = toast.severity === "WARNING";
              const isMessage = toast.category === "message";

              return (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-2xl border transition-all shadow-lg overflow-hidden ${
                    toast.isArchived
                      ? "bg-slate-900/60 border-slate-800 opacity-75"
                      : isCritical
                      ? "bg-gradient-to-b from-rose-950/70 to-slate-950/90 border-rose-500/60 shadow-[0_4px_20px_rgba(244,63,94,0.2)]"
                      : isWarning
                      ? "bg-gradient-to-b from-amber-950/70 to-slate-950/90 border-amber-500/60 shadow-[0_4px_18px_rgba(245,158,11,0.2)]"
                      : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Card Header & Summary */}
                  <div
                    onClick={() => {
                      setExpandedId(isExpanded ? null : toast.id);
                      if (!toast.isRead) {
                        onMarkRead(toast.id, true);
                      }
                      playClickSound();
                    }}
                    className="p-3 cursor-pointer select-none space-y-2"
                  >
                    {/* Top Row: Category Icon, Sender/Module, Unread indicator, Severity, Timestamp */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Unread blue dot */}
                        {!toast.isRead && (
                          <span
                            className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_6px_#2dd4bf] shrink-0"
                            title="Unread notification"
                          />
                        )}

                        {/* Category Icon */}
                        <div
                          className={`p-1.5 rounded-xl border shrink-0 ${
                            isCritical
                              ? "bg-rose-950 border-rose-800 text-rose-400"
                              : isWarning
                              ? "bg-amber-950 border-amber-800 text-amber-400"
                              : isMessage
                              ? "bg-teal-950 border-teal-800 text-teal-400"
                              : "bg-slate-800 border-slate-700 text-slate-300"
                          }`}
                        >
                          {isCritical ? (
                            <AlertOctagon size={13} />
                          ) : isWarning ? (
                            <AlertTriangle size={13} />
                          ) : isMessage ? (
                            <MessageSquare size={13} />
                          ) : (
                            <Info size={13} />
                          )}
                        </div>

                        {/* Sender or Module */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-[11px] text-white truncate max-w-[130px]">
                              {toast.sender || toast.module || "System Core"}
                            </span>
                            {toast.module && toast.sender && (
                              <span className="text-[8px] font-mono text-slate-400 bg-slate-800/80 px-1 py-0.2 rounded border border-slate-700">
                                {toast.module}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Meta: Severity Pill & Timestamp */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider ${
                            isCritical
                              ? "bg-rose-900/60 border-rose-700 text-rose-300"
                              : isWarning
                              ? "bg-amber-900/60 border-amber-700 text-amber-300"
                              : "bg-teal-900/40 border-teal-800 text-teal-300"
                          }`}
                        >
                          {toast.severity}
                        </span>

                        <span className="text-[8.5px] font-mono text-slate-400 flex items-center gap-0.5">
                          <Clock size={9} />
                          {toast.timestamp}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(isExpanded ? null : toast.id);
                          }}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-[11px] text-slate-200 font-sans leading-snug pl-0.5 break-words">
                      {toast.message || toast.logText}
                    </p>

                    {/* If a reply was sent previously, display it inline */}
                    {toast.replyText && (
                      <div className="p-2 rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-200 text-[10px] font-sans flex items-start gap-1.5 mt-1.5">
                        <CornerDownRight size={12} className="text-teal-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-teal-300">You replied: </span>
                          <span className="text-slate-200">{toast.replyText}</span>
                          {toast.replySentAt && (
                            <span className="text-[8px] font-mono text-teal-400/80 ml-1.5">
                              ({toast.replySentAt})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Interactive Action Controls */}
                  <div className="border-t border-slate-800/80 bg-slate-950/60 p-2.5 space-y-2">
                    {/* Quick Actions Row */}
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      {/* Mark Read / Unread */}
                      <button
                        onClick={() => {
                          onMarkRead(toast.id, !toast.isRead);
                          playClickSound();
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                          toast.isRead
                            ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "bg-teal-950/90 border-teal-600 text-teal-300 hover:bg-teal-900 shadow-sm"
                        }`}
                      >
                        <Check size={11} className={toast.isRead ? "text-slate-400" : "text-teal-400"} />
                        <span>{toast.isRead ? "Mark Unread" : "Mark Read"}</span>
                      </button>

                      {/* Archive / Unarchive */}
                      <button
                        onClick={() => {
                          onArchive(toast.id, !toast.isArchived);
                          playClickSound();
                        }}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {toast.isArchived ? (
                          <>
                            <ArchiveRestore size={11} className="text-amber-400" />
                            <span>Unarchive</span>
                          </>
                        ) : (
                          <>
                            <Archive size={11} className="text-slate-400" />
                            <span>Archive</span>
                          </>
                        )}
                      </button>

                      {/* Open Associated App if available */}
                      {toast.appId && onOpenApp && (
                        <button
                          onClick={() => {
                            onOpenApp(toast.appId!);
                            onClose();
                            playAppLaunchSound();
                          }}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={11} />
                          <span>Open App</span>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => {
                          onDismiss(toast.id);
                          playClickSound();
                        }}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer ml-auto"
                        title="Delete notification"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* Inline Quick Reply Input for messages or interactive alerts */}
                    <div className="space-y-1.5 pt-1">
                      {/* Preset Chips */}
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                        <span className="text-[8.5px] font-mono text-slate-500 shrink-0">Quick reply:</span>
                        {quickReplies.map((reply, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => handleQuickPresetReply(toast.id, reply)}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-teal-950 border border-slate-700 hover:border-teal-600 text-[9px] font-medium text-slate-300 hover:text-teal-200 transition-all shrink-0 active:scale-95 cursor-pointer"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>

                      {/* Custom Input Field */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={replyInputs[toast.id] || ""}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({
                              ...prev,
                              [toast.id]: e.target.value
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSendReply(toast.id);
                            }
                          }}
                          placeholder={isMessage ? "Type direct reply..." : "Send response or command..."}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-all font-sans"
                        />
                        <button
                          onClick={() => handleSendReply(toast.id)}
                          disabled={!replyInputs[toast.id]?.trim()}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            replyInputs[toast.id]?.trim()
                              ? "bg-teal-500 border-teal-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(45,212,191,0.6)] active:scale-95"
                              : "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                          }`}
                          title="Send Reply"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer info & close */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[9.5px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-teal-400" />
            <span>KK Mobile OS Notification Engine v2.4</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-bold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
