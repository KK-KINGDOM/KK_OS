import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Plus,
  Code,
  Layers,
  ChevronDown,
  Copy,
  Check,
  Eye,
  Menu,
  Terminal,
  BookOpen
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "claude";
  text: string;
  thinking?: string;
  artifact?: {
    type: "code" | "html";
    title: string;
    content: string;
  };
  timestamp: string;
}

export default function AppClaude() {
  const [model, setModel] = useState<"sonnet" | "opus" | "haiku">("sonnet");
  const [modelDropdown, setModelDropdown] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<{ title: string; content: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "c1",
      sender: "claude",
      text: "Hello, I am Claude. How can I assist you today with complex reasoning, coding artifacts, or analytical writing?",
      timestamp: "10:44 AM"
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const promptText = input;
    setInput("");
    setIsThinking(true);

    try {
      const customKey = localStorage.getItem("kk_custom_gemini_api_key") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey) headers["x-gemini-api-key"] = customKey;

      const payloadMessages = newMessages.map((m) => ({
        role: m.sender === "claude" ? "assistant" : "user",
        content: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: payloadMessages,
          model: "gemini-2.5-pro",
          systemInstruction: "You are Claude 3.5 Sonnet by Anthropic. Provide exceptionally thoughtful, well-reasoned, precise answers and explanations."
        })
      });

      const data = await res.json();
      const replyText = data.reply || `Regarding "${promptText}": Claude 3.5 Sonnet analyzed your request carefully.`;

      let artifactData: Message["artifact"] = undefined;
      if (promptText.toLowerCase().includes("artifact") || promptText.toLowerCase().includes("ui") || promptText.toLowerCase().includes("component")) {
        artifactData = {
          type: "html",
          title: "Claude Reactive Component",
          content: `<div style="background:#28221f; border:1px solid #e07a5f; padding:12px; border-radius:12px; color:#f4f1de; font-family:sans-serif;">\n  <h4 style="margin:0; font-size:14px; color:#e07a5f;">Claude Interactive Artifact</h4>\n  <p style="margin:4px 0 0; font-size:11px; opacity:0.8;">High-precision UI preview rendered in sandboxed frame.</p>\n</div>`
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "claude",
          text: replyText,
          thinking: "Deconstructing query logic... Assessing edge cases and nuance... Formulating response...",
          artifact: artifactData,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Claude fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "claude",
          text: `Regarding "${promptText}": Here is Claude's analysis. Let me know if you would like to explore deeper.`,
          thinking: "Completed logical verification.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1b1917] text-[#f5f2eb] font-sans select-none overflow-hidden relative">
      {/* Header */}
      <div className="h-12 bg-[#262320] border-b border-[#3d3834] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#d97757] to-[#cc5a37] flex items-center justify-center font-serif font-black text-white text-xs">
            C
          </div>

          {/* Model Switcher */}
          <div className="relative">
            <button
              onClick={() => setModelDropdown(!modelDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#332f2b] hover:bg-[#3d3834] text-xs font-bold text-[#e07a5f] border border-[#e07a5f]/30 transition-colors cursor-pointer"
            >
              <span>Claude 3.5 {model === "sonnet" ? "Sonnet" : model === "opus" ? "Opus" : "Haiku"}</span>
              <ChevronDown size={12} className="text-[#a89f91]" />
            </button>

            {modelDropdown && (
              <div className="absolute top-8 left-0 w-48 bg-[#262320] border border-[#3d3834] rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-1 text-xs">
                <button
                  onClick={() => {
                    setModel("sonnet");
                    setModelDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${model === "sonnet" ? "bg-[#332f2b] text-[#e07a5f] font-bold" : "hover:bg-white/5 text-[#d6cebf]"}`}
                >
                  <div className="flex flex-col">
                    <span>Claude 3.5 Sonnet</span>
                    <span className="text-[9px] text-[#a89f91]">Best balance of speed & intelligence</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setModel("opus");
                    setModelDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${model === "opus" ? "bg-[#332f2b] text-[#e07a5f] font-bold" : "hover:bg-white/5 text-[#d6cebf]"}`}
                >
                  <div className="flex flex-col">
                    <span>Claude 3 Opus</span>
                    <span className="text-[9px] text-[#a89f91]">Deep reasoning & math</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: Date.now().toString(),
                sender: "claude",
                text: "Started a new conversation thread.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            ]);
            setActiveArtifact(null);
          }}
          className="p-1.5 hover:bg-[#332f2b] rounded-lg text-[#d6cebf] transition-colors"
          title="New Conversation"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {msg.sender === "claude" ? (
                <span className="text-[10px] font-extrabold text-[#e07a5f] font-serif">Claude</span>
              ) : (
                <span className="text-[10px] font-bold text-[#a89f91]">You</span>
              )}
              <span className="text-[9px] text-[#857b6d] font-mono">{msg.timestamp}</span>
            </div>

            {/* Thinking collapse if present */}
            {msg.thinking && (
              <div className="mb-1.5 p-2 bg-[#262320] rounded-xl border border-[#3d3834] text-[10px] text-[#a89f91] font-mono flex items-center gap-1.5 w-full max-w-[88%]">
                <Sparkles size={12} className="text-[#e07a5f] shrink-0" />
                <span className="truncate">{msg.thinking}</span>
              </div>
            )}

            <div
              className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#cc5a37] text-white rounded-tr-none font-medium shadow-md"
                  : "bg-[#262320] text-[#f5f2eb] rounded-tl-none border border-[#3d3834]"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.artifact && (
                <button
                  onClick={() => setActiveArtifact({ title: msg.artifact!.title, content: msg.artifact!.content })}
                  className="mt-2.5 w-full p-2 bg-[#332f2b] hover:bg-[#3d3834] border border-[#e07a5f]/40 rounded-xl text-left flex items-center justify-between text-xs text-[#e07a5f] font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={14} />
                    <span>{msg.artifact.title}</span>
                  </div>
                  <Eye size={14} className="text-[#a89f91]" />
                </button>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-[#a89f91] text-xs bg-[#262320] p-2.5 rounded-2xl w-fit border border-[#3d3834]">
            <Sparkles size={14} className="text-[#e07a5f] animate-spin" />
            <span>Claude is contemplating...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Artifact Viewer Modal */}
      {activeArtifact && (
        <div className="absolute inset-0 bg-black/80 z-40 flex flex-col p-3 animate-in fade-in duration-200">
          <div className="bg-[#262320] border border-[#3d3834] rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 bg-[#1b1917] border-b border-[#3d3834] flex items-center justify-between">
              <span className="text-xs font-bold text-[#e07a5f] flex items-center gap-2">
                <Layers size={14} /> {activeArtifact.title}
              </span>
              <button
                onClick={() => setActiveArtifact(null)}
                className="text-xs text-[#a89f91] hover:text-white px-2 py-0.5 rounded bg-[#332f2b]"
              >
                Close
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] bg-[#171513]">
              <div dangerouslySetInnerHTML={{ __html: activeArtifact.content }} />
            </div>
          </div>
        </div>
      )}

      {/* Input Footer */}
      <div className="p-2.5 bg-[#262320] border-t border-[#3d3834] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Reply to Claude..."
          className="flex-1 bg-[#1b1917] border border-[#3d3834] rounded-2xl px-3.5 py-2 text-xs text-[#f5f2eb] placeholder-[#857b6d] focus:outline-none focus:border-[#e07a5f] transition-colors"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          className="p-2 rounded-2xl bg-[#cc5a37] hover:bg-[#b84d2d] disabled:bg-[#332f2b] disabled:opacity-50 text-white transition-all cursor-pointer shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
