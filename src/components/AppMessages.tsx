import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Plus,
  ArrowLeft,
  MoreVertical,
  CheckCheck,
  User,
  Sparkles
} from "lucide-react";

interface MessageThread {
  id: string;
  name: string;
  avatarColor: string;
  unread: boolean;
  time: string;
  lastMessage: string;
  messages: { sender: "user" | "contact"; text: string; time: string }[];
}

const INITIAL_THREADS: MessageThread[] = [
  {
    id: "1",
    name: "Rahul",
    avatarColor: "bg-emerald-600",
    unread: true,
    time: "10:25 AM",
    lastMessage: "Let's meet tomorrow for the OS architecture demo.",
    messages: [
      { sender: "contact", text: "Hey! Did you test the KK-Core CFS scheduler?", time: "10:20 AM" },
      { sender: "user", text: "Yes, running smooth on 8 cores!", time: "10:22 AM" },
      { sender: "contact", text: "Let's meet tomorrow for the OS architecture demo.", time: "10:25 AM" }
    ]
  },
  {
    id: "2",
    name: "Mom",
    avatarColor: "bg-rose-500",
    unread: false,
    time: "Yesterday",
    lastMessage: "Take care beta. Don't work too late!",
    messages: [
      { sender: "contact", text: "Take care beta. Don't work too late!", time: "8:30 PM" },
      { sender: "user", text: "Love you Mom, going to sleep now!", time: "8:35 PM" }
    ]
  },
  {
    id: "3",
    name: "Ananya",
    avatarColor: "bg-indigo-500",
    unread: false,
    time: "Yesterday",
    lastMessage: "Happy Birthday! 🎉",
    messages: [
      { sender: "contact", text: "Happy Birthday! 🎉 Have a great day!", time: "12:01 AM" }
    ]
  },
  {
    id: "4",
    name: "Bank Alert",
    avatarColor: "bg-amber-600",
    unread: false,
    time: "Mon",
    lastMessage: "Your account balance: $4,580.00 processed successfully.",
    messages: [
      { sender: "contact", text: "Your account balance: $4,580.00 processed successfully.", time: "2:15 PM" }
    ]
  },
  {
    id: "5",
    name: "KK Promotions",
    avatarColor: "bg-teal-600",
    unread: false,
    time: "Mon",
    lastMessage: "Big sale is live now! Upgrade your device storage.",
    messages: [
      { sender: "contact", text: "Big sale is live now! Upgrade your device storage.", time: "10:00 AM" }
    ]
  },
  {
    id: "6",
    name: "Vijay",
    avatarColor: "bg-purple-600",
    unread: false,
    time: "Sun",
    lastMessage: "Call me when free.",
    messages: [
      { sender: "contact", text: "Call me when free.", time: "5:45 PM" }
    ]
  }
];

export default function AppMessages() {
  const [threads, setThreads] = useState<MessageThread[]>(() => {
    let initial = [...INITIAL_THREADS];
    if (typeof window !== "undefined") {
      const parentPhone = localStorage.getItem("user_phone_number") || localStorage.getItem("parental_phone_number");
      const childName = localStorage.getItem("child_name") || "there";
      if (parentPhone) {
        initial.unshift({
          id: "parental_link_sms",
          name: `Parent (${parentPhone})`,
          avatarColor: "bg-teal-500",
          unread: true,
          time: "Just now",
          lastMessage: `Hi ${childName}! Your device setup is complete.`,
          messages: [
            { sender: "contact", text: `Hi ${childName}! Your device setup is complete and linked to ${parentPhone}. All activities and searches are monitored.`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          ]
        });
      }
    }
    return initial;
  });
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Real-time SMS Receiver Listener
  React.useEffect(() => {
    const handleNewSms = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.sender && detail.message) {
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setThreads((prev) => {
          const existing = prev.find((t) => t.id === detail.threadId || t.name === detail.sender);
          if (existing) {
            return prev.map((t) =>
              t.id === existing.id
                ? {
                    ...t,
                    unread: true,
                    time: "Just now",
                    lastMessage: detail.message,
                    messages: [...t.messages, { sender: "contact", text: detail.message, time: timeStr }]
                  }
                : t
            );
          } else {
            return [
              {
                id: detail.threadId || `thread-${Date.now()}`,
                name: detail.sender,
                avatarColor: "bg-teal-500",
                unread: true,
                time: "Just now",
                lastMessage: detail.message,
                messages: [{ sender: "contact", text: detail.message, time: timeStr }]
              },
              ...prev
            ];
          }
        });
      }
    };

    window.addEventListener("kk_new_sms_received", handleNewSms);
    return () => window.removeEventListener("kk_new_sms_received", handleNewSms);
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeThreadId) return;

    const newMsg = {
      sender: "user" as const,
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              lastMessage: inputMsg,
              time: "Just now",
              messages: [...t.messages, newMsg]
            }
          : t
      )
    );

    setInputMsg("");
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative" id="app-messages">
      {/* 1. THREAD DETAIL VIEW */}
      {activeThread ? (
        <div className="flex flex-col h-full bg-slate-950">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveThreadId(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div className={`h-8 w-8 rounded-full ${activeThread.avatarColor} flex items-center justify-center text-white font-bold text-xs`}>
                {activeThread.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{activeThread.name}</h3>
                <span className="text-[9px] text-teal-400">Online</span>
              </div>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-white">
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {activeThread.messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[8px] text-slate-500 mt-1 flex items-center gap-0.5 px-1">
                  {m.time}
                  {m.sender === "user" && <CheckCheck size={10} className="text-teal-400" />}
                </span>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-900 flex items-center gap-1.5">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Send SMS message..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500 text-white text-xs rounded-xl py-2 px-3 outline-none"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      ) : (
        /* 2. THREADS LIST VIEW */
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-teal-400" />
              <h2 className="text-sm font-bold text-white">Messages</h2>
            </div>
            <span className="text-[10px] bg-teal-950 border border-teal-800 text-teal-400 px-2 py-0.5 rounded-full font-mono font-bold">
              SMS Mode
            </span>
          </div>

          {/* Search Bar */}
          <div className="p-2 bg-slate-900/50 border-b border-slate-850">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          {/* List of Conversations */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setThreads((prev) =>
                    prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
                  );
                }}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  thread.unread
                    ? "bg-slate-900 border-teal-500/50 shadow-md"
                    : "bg-slate-950/80 border-slate-850 hover:bg-slate-900"
                }`}
              >
                <div className={`h-10 w-10 rounded-full ${thread.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 relative`}>
                  {thread.name.charAt(0)}
                  {thread.unread && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-teal-400 rounded-full border-2 border-slate-950" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-xs font-bold truncate ${thread.unread ? "text-teal-300" : "text-white"}`}>
                      {thread.name}
                    </h4>
                    <span className="text-[9px] text-slate-500 shrink-0">{thread.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{thread.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Action Button */}
          <button className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-600/40 cursor-pointer transition-transform active:scale-95">
            <Plus size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
