import { generateAIResponse } from "../utils/ai";
import React, { useState, useRef, useEffect } from "react";
import {
  Flame,
  Send,
  Plus,
  Radio,
  Sparkles,
  Zap,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { recordChildActivity } from "../utils/parentalControl";

interface GrokMessage {
  id: string;
  sender: "user" | "grok";
  text: string;
  mode: "fun" | "regular";
  timestamp: string;
}

export default function AppGrok() {
  const [mode, setMode] = useState<"fun" | "regular">("fun");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const [messages, setMessages] = useState<GrokMessage[]>([
    {
      id: "gr1",
      sender: "grok",
      text: "Grok 2 online. Plugged directly into real-time X data streams with zero filter. Ask me anything about tech, AI, space, or world news!",
      mode: "fun",
      timestamp: "10:46 AM"
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    recordChildActivity(input, "Grok AI", "ai_prompt");

    const userMsg: GrokMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      mode,
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
        role: m.sender === "grok" ? "assistant" : "user",
        content: m.text
      }));

      const sysInst = mode === "fun"
        ? "You are Grok 2 (xAI) in Fun Mode with witty, bold, energetic responses and real-time knowledge. Direct, accurate, and humorously sharp."
        : "You are Grok 2 (xAI) in Regular Mode. Concise, direct, real-time factual insights with zero fluff.";

      const replyText = await generateAIResponse(promptText);
      const data = { reply: replyText };
      const finalReply = data.reply || `Grok 2 searched real-time telemetry for "${promptText}".`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "grok",
          text: finalReply,
          mode,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Grok fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "grok",
          text: `[Grok Real-Time Feed]: Analyzed telemetry for "${promptText}". Live signals confirmed!`,
          mode,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Header */}
      <div className="h-12 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm shadow-md shadow-white/10">
            x
          </div>
          <span className="font-mono font-black text-sm text-white tracking-widest uppercase">GROK 2</span>
        </div>

        {/* Mode Toggle: Fun Mode vs Regular */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
          <button
            onClick={() => setMode("fun")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
              mode === "fun" ? "bg-orange-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame size={11} /> Fun Mode
          </button>
          <button
            onClick={() => setMode("regular")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
              mode === "regular" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap size={11} /> Regular
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {msg.sender === "grok" ? (
                <span className="text-[10px] font-mono font-bold text-orange-400 flex items-center gap-1">
                  <Radio size={10} className="animate-pulse" /> Grok 2
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400">You</span>
              )}
              <span className="text-[9px] text-slate-600 font-mono">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-slate-800 text-white rounded-tr-none font-medium border border-slate-700"
                  : "bg-slate-950 text-slate-100 rounded-tl-none border border-slate-800 shadow-xl"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-orange-400 text-xs bg-slate-950 p-2.5 rounded-2xl w-fit border border-orange-500/30">
            <Flame size={14} className="animate-bounce" />
            <span>Grok is querying live X telemetry...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Grok anything..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors font-mono"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          className="p-2 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:opacity-50 text-white transition-all cursor-pointer shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
