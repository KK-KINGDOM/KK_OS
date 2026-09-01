import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Inbox,
  Send,
  Star,
  Trash2,
  Edit3,
  Search,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Archive,
  Tag,
  Clock,
  ArrowLeft,
  Reply,
  MoreVertical,
  ShieldCheck,
  User
} from "lucide-react";
import { playClickSound } from "../utils/sound";

interface EmailItem {
  id: string;
  sender: string;
  senderEmail: string;
  avatarColor: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
  category: "Primary" | "Social" | "Promotions" | "Updates";
  hasAttachment?: boolean;
}

const SAMPLE_EMAILS: EmailItem[] = [
  {
    id: "email-1",
    sender: "Google Cloud Platform",
    senderEmail: "cloud-noreply@google.com",
    avatarColor: "bg-blue-600",
    subject: "Google Cloud Build: Build Succeeded for KK-Mobile-OS",
    preview: "Your container deployment to Google Cloud Run completed successfully with 0 errors.",
    body: "Hi Krishna,\n\nYour automated deployment pipeline for KK-Mobile-OS (Artifact: kk-os-v1.0.0) has finished building.\n\nStatus: SUCCESS\nRuntime: Node 20 LTS / React 18 / Vite 6\nIngress: 0.0.0.0:3000\n\nAll healthchecks and PowerHAL services are verified and healthy.\n\nBest,\nThe Google Cloud Build Team",
    time: "10:42 AM",
    isRead: false,
    isStarred: true,
    category: "Primary",
    hasAttachment: true
  },
  {
    id: "email-2",
    sender: "Gemini Intelligence Team",
    senderEmail: "ai-studio@google.com",
    avatarColor: "bg-purple-600",
    subject: "Gemini 2.5 Flash API Key Provisioned & Active",
    preview: "Your high-throughput multimodal intelligence endpoint is ready for Global Search and System Assistant queries.",
    body: "Hello Krishna,\n\nYour developer API token for the Gemini Multimodal SDK is verified. You have full access to real-time search, voice transcription, and live assistant capabilities within KK-Mobile-OS.\n\nRate Limits: 1,500 RPM\nThinking Mode: Enabled (2.5 Pro / Flash)\n\nThank you for innovating on Google AI Studio!",
    time: "Yesterday",
    isRead: true,
    isStarred: true,
    category: "Updates"
  },
  {
    id: "email-3",
    sender: "GitHub Notifications",
    senderEmail: "notifications@github.com",
    avatarColor: "bg-slate-800",
    subject: "Pull Request #42 Merged: Added Battery Consumption Pie Chart",
    preview: "Merged branch 'feature/battery-pie-chart' into 'main'. Verified by Automated CI/CD.",
    body: "Hi Krishna,\n\nPull Request #42 [Battery Consumption Pie Chart] was successfully approved and merged by the repository maintainers.\n\nChanges Included:\n- Interactive D3/SVG Recharts power visualization\n- Integration with AppSettings, Task Manager, and Control Center\n- PowerHAL battery status sync\n\nView details on GitHub.",
    time: "Yesterday",
    isRead: true,
    isStarred: false,
    category: "Primary"
  },
  {
    id: "email-4",
    sender: "Google Pay Security",
    senderEmail: "alerts@googlepay.com",
    avatarColor: "bg-emerald-600",
    subject: "UPI Transaction Successful: ₹500 sent to Metro Transit",
    preview: "Transaction ID: UPI/2026/894109. Account Balance Updated.",
    body: "Hi Krishna,\n\nYour payment of ₹500.00 to Metro Rail Transit has been debited from your primary bank account via UPI.\n\nTxn Reference: 89410928731\nStatus: COMPLETED\nPayment Mode: Instant UPI QR\n\nIf you did not authorize this, please open the KK Security Hub immediately.",
    time: "2 days ago",
    isRead: true,
    isStarred: false,
    category: "Updates"
  },
  {
    id: "email-5",
    sender: "LinkedIn Network",
    senderEmail: "updates@linkedin.com",
    avatarColor: "bg-sky-700",
    subject: "Sundar Pichai and 8 others viewed your latest OS architecture post",
    preview: "Your engineering breakdown of mobile operating system design is gaining traction in Silicon Valley.",
    body: "Hi Krishna,\n\nYour post on 'Building a Next-Generation Web-First Mobile OS with Gemini Multimodal AI' has received 450+ reactions and 32 reposts from tech leaders across the globe.\n\nKeep building great software!",
    time: "3 days ago",
    isRead: true,
    isStarred: false,
    category: "Social"
  }
];

export default function AppEmail() {
  const [emails, setEmails] = useState<EmailItem[]>(SAMPLE_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<"All" | "Primary" | "Social" | "Updates">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [replyText, setReplyText] = useState("");

  const filteredEmails = emails.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  const handleOpenEmail = (email: EmailItem) => {
    playClickSound();
    setEmails((prev) =>
      prev.map((m) => (m.id === email.id ? { ...m, isRead: true } : m))
    );
    setSelectedEmail(email);
  };

  const handleDeleteEmail = (id: string) => {
    playClickSound();
    setEmails((prev) => prev.filter((m) => m.id !== id));
    setSelectedEmail(null);
  };

  const handleSendEmail = () => {
    playClickSound();
    if (!composeTo || !composeSubject) return;

    const newEmail: EmailItem = {
      id: `email-${Date.now()}`,
      sender: "Me (krishna@kkos.dev)",
      senderEmail: "krishna@kkos.dev",
      avatarColor: "bg-teal-600",
      subject: composeSubject,
      preview: composeBody.slice(0, 80) + "...",
      body: composeBody,
      time: "Just now",
      isRead: true,
      isStarred: false,
      category: "Primary"
    };

    setEmails([newEmail, ...emails]);
    setIsComposing(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
  };

  const handleAiDraft = () => {
    playClickSound();
    setIsAiDrafting(true);
    setTimeout(() => {
      setComposeSubject("Status Update: KK-Mobile-OS Enterprise Architecture Review");
      setComposeBody(
        "Hi Team,\n\nI wanted to share a quick update regarding our KK-Mobile-OS deployment. All core services—including the PowerHAL daemon, Gemini AI Search engine, and UPI payment rails—are performing with 99.9% uptime and zero latency regressions.\n\nLet's coordinate on tomorrow's release sync.\n\nBest regards,\nKrishna"
      );
      setIsAiDrafting(false);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden">
      {/* Top Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-md">
            <Mail size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">Gmail & Email</h2>
            <span className="text-[10px] text-slate-400 font-mono">krishna@kkos.dev</span>
          </div>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setIsComposing(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Edit3 size={14} />
          <span>Compose</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!selectedEmail ? (
          <>
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-800/80 bg-slate-950">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in emails and attachments..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-red-500/80 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-none">
                {(["All", "Primary", "Social", "Updates"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playClickSound();
                      setActiveCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all shrink-0 ${
                      activeCategory === cat
                        ? "bg-red-600 text-white shadow"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
              {filteredEmails.length > 0 ? (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleOpenEmail(email)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-900/80 cursor-pointer transition-all group ${
                      !email.isRead ? "bg-slate-900/40" : ""
                    }`}
                  >
                    {/* Sender Avatar */}
                    <div className={`h-9 w-9 rounded-xl ${email.avatarColor} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                      {email.sender.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs truncate ${!email.isRead ? "font-extrabold text-white" : "font-medium text-slate-300"}`}>
                          {email.sender}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {email.time}
                        </span>
                      </div>

                      <h5 className={`text-xs truncate ${!email.isRead ? "font-bold text-slate-200" : "font-normal text-slate-400"}`}>
                        {email.subject}
                      </h5>

                      <p className="text-[11px] text-slate-500 truncate leading-relaxed">
                        {email.preview}
                      </p>
                    </div>

                    {/* Star toggle */}
                    <button
                      onClick={(e) => toggleStar(email.id, e)}
                      className="p-1 text-slate-500 hover:text-amber-400 shrink-0"
                    >
                      <Star
                        size={15}
                        className={email.isStarred ? "text-amber-400 fill-amber-400" : ""}
                      />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                  <Inbox size={28} className="mx-auto text-slate-600" />
                  <p>No emails found for this search filter.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Email Detail View */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <button
                onClick={() => setSelectedEmail(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Inbox</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteEmail(selectedEmail.id)}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                  title="Delete Email"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Email Subject Title */}
            <div>
              <h3 className="text-base font-black text-white leading-snug">
                {selectedEmail.subject}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300">
                  {selectedEmail.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedEmail.time}</span>
              </div>
            </div>

            {/* Sender Info Bar */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`h-9 w-9 rounded-xl ${selectedEmail.avatarColor} text-white font-extrabold text-xs flex items-center justify-center shadow`}>
                  {selectedEmail.sender.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedEmail.sender}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedEmail.senderEmail}</p>
                </div>
              </div>
              <ShieldCheck size={16} className="text-emerald-400" title="SPF & DKIM Verified" />
            </div>

            {/* Email Full Body */}
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 whitespace-pre-line text-xs text-slate-200 leading-relaxed font-sans shadow-inner">
              {selectedEmail.body}
            </div>

            {/* Smart Reply Action Bar */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Smart Reply & Actions
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Thanks for the update!",
                  "Looks great, approved!",
                  "Will review this shortly."
                ].map((quick, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      setReplyText(quick);
                    }}
                    className="py-1.5 px-3 rounded-full bg-slate-900 border border-slate-800 hover:border-red-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    {quick}
                  </button>
                ))}
              </div>

              {/* Reply box */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a quick reply..."
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none"
                />
                <button
                  onClick={() => {
                    playClickSound();
                    setReplyText("");
                    setSelectedEmail(null);
                  }}
                  disabled={!replyText.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposing && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-4 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Mail size={16} className="text-red-500" />
                <span>New Message</span>
              </h3>
              <button
                onClick={() => setIsComposing(false)}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="To: recipient@domain.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-red-500"
              />
              <input
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Subject"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-red-500"
              />
            </div>

            <div className="flex-1 relative">
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Compose your email here..."
                className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-400 outline-none resize-none focus:border-red-500 leading-relaxed font-sans"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleAiDraft}
                disabled={isAiDrafting}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles size={13} className={isAiDrafting ? "animate-spin" : ""} />
                <span>{isAiDrafting ? "Drafting with Gemini..." : "Draft with Gemini"}</span>
              </button>

              <button
                onClick={handleSendEmail}
                disabled={!composeTo || !composeSubject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
