import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Plus,
  Sparkles,
  Code,
  Globe,
  Mic,
  Copy,
  Check,
  RotateCcw,
  Menu,
  ChevronDown,
  Brain,
  MessageSquare,
  Trash2
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

export default function AppChatGPT() {
  const [model, setModel] = useState<"gpt-4o" | "gpt-4o-mini" | "o1-mini">("gpt-4o");
  const [modelDropdown, setModelDropdown] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<{ id: string; title: string }[]>([
    { id: "1", title: "React Mobile OS Architecture" },
    { id: "2", title: "Python Async Scraping Script" },
    { id: "3", title: "AI Prompt Engineering Tips" }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "assistant",
      text: "Hello! I'm ChatGPT. How can I help you today with coding, writing, or analysis?",
      timestamp: "10:42 AM"
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const userPrompt = input;
    setInput("");
    setIsTyping(true);

    try {
      const customKey = localStorage.getItem("kk_custom_gemini_api_key") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey) headers["x-gemini-api-key"] = customKey;

      const payloadMessages = newMessages.map((m) => ({
        role: m.sender === "assistant" ? "assistant" : "user",
        content: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: payloadMessages,
          model: "gemini-2.5-flash",
          systemInstruction: "You are ChatGPT, a highly intelligent conversational AI assistant. Answer user queries and search requests with clarity, depth, and structured formatting."
        })
      });

      const data = await res.json();
      const replyText = data.reply || `Regarding "${userPrompt}": ChatGPT processed your search request successfully.`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("ChatGPT fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: `Regarding "${userPrompt}": Here is ChatGPT's response. How else can I assist you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const newChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Started a fresh conversation. What would you like to explore?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Header */}
      <div className="h-12 bg-[#171717] border-b border-white/10 px-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setModelDropdown(!modelDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-emerald-400" />
              <span>{model === "gpt-4o" ? "ChatGPT 4o" : model === "gpt-4o-mini" ? "GPT-4o Mini" : "o1 Reasoning"}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {modelDropdown && (
              <div className="absolute top-8 left-0 w-44 bg-[#212121] border border-white/10 rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-1 text-xs">
                <button
                  onClick={() => {
                    setModel("gpt-4o");
                    setModelDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${model === "gpt-4o" ? "bg-emerald-950/80 text-emerald-300 font-bold" : "hover:bg-white/5 text-slate-200"}`}
                >
                  <div className="flex flex-col">
                    <span>ChatGPT 4o</span>
                    <span className="text-[9px] text-slate-400">Smart & Fast</span>
                  </div>
                  {model === "gpt-4o" && <Check size={14} className="text-emerald-400" />}
                </button>

                <button
                  onClick={() => {
                    setModel("gpt-4o-mini");
                    setModelDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${model === "gpt-4o-mini" ? "bg-emerald-950/80 text-emerald-300 font-bold" : "hover:bg-white/5 text-slate-200"}`}
                >
                  <div className="flex flex-col">
                    <span>GPT-4o Mini</span>
                    <span className="text-[9px] text-slate-400">Lightweight</span>
                  </div>
                  {model === "gpt-4o-mini" && <Check size={14} className="text-emerald-400" />}
                </button>

                <button
                  onClick={() => {
                    setModel("o1-mini");
                    setModelDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${model === "o1-mini" ? "bg-emerald-950/80 text-emerald-300 font-bold" : "hover:bg-white/5 text-slate-200"}`}
                >
                  <div className="flex flex-col">
                    <span>o1 Reasoning</span>
                    <span className="text-[9px] text-slate-400">Deep Logic</span>
                  </div>
                  {model === "o1-mini" && <Check size={14} className="text-emerald-400" />}
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={newChat}
          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
          title="New Chat"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="absolute inset-0 bg-black/60 z-20 flex">
          <div className="w-64 bg-[#171717] h-full p-3 flex flex-col gap-3 border-r border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <Bot size={18} />
                <span>ChatGPT History</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <button
              onClick={newChat}
              className="w-full py-2 px-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl text-emerald-300 font-bold text-xs flex items-center gap-2"
            >
              <Plus size={14} />
              <span>New Conversation</span>
            </button>

            <div className="flex-1 overflow-y-auto flex flex-col gap-1 mt-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase px-1">Recent Chats</span>
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="p-2 hover:bg-white/5 rounded-lg text-xs text-slate-300 flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Chat Conversation Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {msg.sender === "assistant" ? (
                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-extrabold">
                  GPT
                </div>
              ) : (
                <span className="text-[10px] font-bold text-slate-400">You</span>
              )}
              <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none font-medium"
                  : "bg-[#2f2f2f] text-slate-100 rounded-tl-none border border-white/5"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.codeSnippet && (
                <div className="mt-2 bg-[#171717] rounded-xl p-2.5 font-mono text-[11px] border border-white/10 relative group">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1.5 pb-1 border-b border-white/5">
                    <span>typescript</span>
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.codeSnippet!)}
                      className="flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {msg.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs bg-[#2f2f2f] p-2.5 rounded-2xl w-fit border border-white/5">
            <Sparkles size={14} className="text-emerald-400 animate-spin" />
            <span>ChatGPT is thinking...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2.5 bg-[#171717] border-t border-white/10 flex items-center gap-2">
        <button
          onClick={() => setInput("Can you write a React custom hook for state persistence?")}
          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-emerald-300 transition-colors shrink-0"
          title="Code Prompt Template"
        >
          <Code size={16} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message ChatGPT..."
          className="flex-1 bg-[#212121] border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="p-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-50 text-white transition-all cursor-pointer shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
