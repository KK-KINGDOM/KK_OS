import { generateAIResponse } from "../utils/ai";
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  Mic,
  Camera,
  Clock,
  BatteryCharging,
  Globe,
  Search,
  Image as ImageIcon,
  MessageSquare,
  Wand2,
  Download,
  Square,
  Maximize2,
  Check,
  Zap,
  Brain,
  Sliders,
  Volume2,
  SquareCheck,
  AlertCircle
} from "lucide-react";
import { playClickSound, playAppLaunchSound } from "../utils/sound";
import { logSearchActivity } from "../lib/firebase";
import { ChatMessage } from "../types";

const STORAGE_KEY = "kk_ai_chat_history";

type AIModel = "gemini-3.1-pro-preview" | "gemini-3.5-flash" | "gemini-3.1-flash-lite";
type ImageSize = "1K" | "2K" | "4K";
type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

export default function AppAIAssistant() {
  const [activeTab, setActiveTab] = useState<"chat" | "image" | "transcribe">("chat");
  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini-3.5-flash");
  const [enableThinking, setEnableThinking] = useState(false);
  const [useMaps, setUseMaps] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load chat history from localStorage", e);
    }
    return [
      {
        role: "assistant",
        content: "Hello, Krishna! I am KK-AI, your built-in system intelligence engine. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Image Generation & Editing State
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; prompt: string; size: string; time: string }>>([]);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [editImageBase64, setEditImageBase64] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Sync messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history to localStorage", e);
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestionChips = [
    { label: "Open Camera", icon: Camera, prompt: "Can you help me open the Camera app?" },
    { label: "Search Files", icon: Search, prompt: "Search for system files in /KK-Mobile-OS" },
    { label: "Generate Wallpaper", icon: ImageIcon, prompt: "Generate a futuristic cyberpunk city wallpaper for KK-Mobile-OS" },
    { label: "Show Battery Usage", icon: BatteryCharging, prompt: "Show me current battery health and PowerHAL metrics" },
    { label: "Explain Command", icon: Sparkles, prompt: "Explain how 'neofetch' works in KK-Mobile-OS" },
    { label: "Translate to Hindi", icon: Globe, prompt: "Translate 'Welcome to KK Mobile OS' to Hindi" }
  ];

  // Send Chat Message
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    // Check if user is requesting image generation directly in chat
    const lower = textToSend.toLowerCase();
    if (lower.startsWith("generate image") || lower.startsWith("draw") || lower.startsWith("create an image")) {
      const cleanPrompt = textToSend.replace(/^(generate image|draw|create an image|make an image of|generate an image of)\s+/i, "");
      setActiveTab("image");
      setImagePrompt(cleanPrompt);
      handleGenerateImage(cleanPrompt);
      return;
    }

    setError(null);
    const userMsg: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Log for parental controls
    const parentPhone = typeof window !== "undefined" ? localStorage.getItem("parental_phone_number") : null;
    if (parentPhone) {
      logSearchActivity(parentPhone, textToSend, "AppAIAssistant");
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const customKey = localStorage.getItem("kk_custom_gemini_api_key") || "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (customKey) {
        headers["x-gemini-api-key"] = customKey;
      }

      const replyText = await generateAIResponse(promptText);
      const data = { reply: replyText };
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not connect to KK-AI. Operating in smart local fallback mode.");
    } finally {
      setLoading(false);
    }
  };

  // Generate Image with gemini-3-pro-image-preview / gemini-3.1-flash-image
  const handleGenerateImage = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || imagePrompt;
    if (!promptToUse.trim() || generatingImage) return;

    setGeneratingImage(true);
    setError(null);

    try {
      const customKey = localStorage.getItem("kk_custom_gemini_api_key") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey) headers["x-gemini-api-key"] = customKey;

      const res = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: promptToUse,
          imageSize,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Image generation request failed.");
      }

      const data = await res.json();
      if (data.imageUrl) {
        const newImg = {
          url: data.imageUrl,
          prompt: promptToUse,
          size: imageSize,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setGeneratedImages((prev) => [newImg, ...prev]);

        // Add to Chat history as well
        const assistantImageMsg: ChatMessage = {
          role: "assistant",
          content: `🎨 **Generated Image (${imageSize} • ${aspectRatio})**\nPrompt: "${promptToUse}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantImageMsg]);
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || "Image generation failed. Please verify your GEMINI_API_KEY.");
    } finally {
      setGeneratingImage(false);
    }
  };

  // Start Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudioTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setError("Microphone access permission required for audio recording.");
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Send Audio Blob to Gemini Transcription API (gemini-3.5-flash)
  const processAudioTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const customKey = localStorage.getItem("kk_custom_gemini_api_key") || "";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (customKey) headers["x-gemini-api-key"] = customKey;

        const res = await fetch("/api/gemini/transcribe", {
          method: "POST",
          headers,
          body: JSON.stringify({
            audioData: base64Audio,
            mimeType: blob.type || "audio/webm",
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Audio transcription failed.");
        }

        const data = await res.json();
        if (data.transcript) {
          setTranscribedText(data.transcript);
          setInput(data.transcript);
        }
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error("Transcription processing error:", err);
      setError(err.message || "Failed to transcribe audio.");
      setIsTranscribing(false);
    }
  };

  const clearChat = () => {
    const defaultMessages: ChatMessage[] = [
      {
        role: "assistant",
        content: "Hello, Krishna! I am KK-AI, your built-in system intelligence engine. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(defaultMessages);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans" id="ai-assistant-app">
      {/* Top OS Assistant Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              <span>KK-AI INTELLIGENCE</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                GEMINI 2.5
              </span>
            </h2>
            <p className="text-[9.5px] text-slate-400">Multi-Turn Chat • Image Gen • Speech Transcribe</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          title="Clear chat thread"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Feature Tab Navigation */}
      <div className="flex items-center justify-around border-b border-slate-800 bg-slate-950 p-1 font-mono text-[10px]">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === "chat"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <MessageSquare size={12} />
          <span>Multi-Turn Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("image")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === "image"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <ImageIcon size={12} />
          <span>Image Gen (1K-4K)</span>
        </button>

        <button
          onClick={() => setActiveTab("transcribe")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === "transcribe"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Mic size={12} />
          <span>Audio Speech-to-Text</span>
        </button>
      </div>

      {/* TAB 1: MULTI-TURN CHAT INTERFACE */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Model Selection Bar */}
          <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-[9px] font-mono">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Brain size={11} className="text-cyan-400" /> Model:
              </span>
              <button
                onClick={() => setSelectedModel("gemini-3.5-flash")}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  selectedModel === "gemini-3.5-flash"
                    ? "bg-cyan-500 text-slate-950 font-black"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
                title="Gemini 3.5 Flash (General Intelligence & Search/Maps)"
              >
                ⚡ 3.5 Flash
              </button>

              <button
                onClick={() => {
                  setSelectedModel("gemini-3.1-pro-preview");
                  setEnableThinking(true);
                }}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  selectedModel === "gemini-3.1-pro-preview"
                    ? "bg-purple-600 text-white font-black"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
                title="Gemini 3.1 Pro (Complex Thinking & Reasoning)"
              >
                🧠 3.1 Pro
              </button>

              <button
                onClick={() => setSelectedModel("gemini-3.1-flash-lite")}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  selectedModel === "gemini-3.1-flash-lite"
                    ? "bg-cyan-500 text-slate-950 font-black"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
                title="Gemini 3.1 Flash Lite (Ultra Low Latency)"
              >
                🚀 Flash Lite
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEnableThinking(!enableThinking)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  enableThinking
                    ? "bg-purple-950 border border-purple-500 text-purple-300"
                    : "bg-slate-950 text-slate-500 border border-slate-800"
                }`}
                title="Toggle High Thinking Mode for deep analytical reasoning"
              >
                <Brain size={10} />
                <span>Thinking Mode</span>
              </button>

              <button
                onClick={() => setUseMaps(!useMaps)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  useMaps
                    ? "bg-cyan-950 border border-cyan-500 text-cyan-300"
                    : "bg-slate-950 text-slate-500 border border-slate-800"
                }`}
                title="Toggle Google Maps Grounding for locations and places"
              >
                <Globe size={10} />
                <span>Maps Grounding</span>
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin">
            {messages.length <= 1 && (
              <div className="py-4 flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-1 shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-pulse flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-slate-950/50 backdrop-blur-sm border border-cyan-300/30 flex items-center justify-center">
                      <Sparkles size={30} className="text-cyan-300 animate-spin-slow" />
                    </div>
                  </div>
                </div>

                <h2 className="text-base font-black text-white tracking-tight">Hello, Krishna!</h2>
                <p className="text-xs text-slate-400 max-w-xs">Ask anything, analyze system specs, or generate high-res images!</p>

                <div className="grid grid-cols-2 gap-2 w-full pt-2">
                  {suggestionChips.map((chip, idx) => {
                    const IconComp = chip.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip.prompt)}
                        className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-left text-[11px] font-semibold text-slate-200 flex items-center gap-2 hover:border-cyan-500/50 transition-all cursor-pointer"
                      >
                        <IconComp size={13} className="text-cyan-400 shrink-0" />
                        <span className="truncate">{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 max-w-[88%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-950"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[9.5px] font-semibold text-slate-400">
                    {msg.role === "user" ? (
                      <>
                        <span>Krishna</span>
                        <User size={10} className="text-slate-300" />
                      </>
                    ) : (
                      <>
                        <Sparkles size={10} className="text-cyan-400" />
                        <span>KK-AI Engine ({selectedModel.replace("gemini-", "")})</span>
                      </>
                    )}
                    <span className="text-[8.5px] font-mono opacity-60 ml-auto">{msg.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Grounding Sources (Google Maps / Search Links) */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-400">
                        <Globe size={10} />
                        <span>Google Grounding Data Sources:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {msg.groundingSources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9.5px] text-cyan-300 hover:text-cyan-200 underline flex items-center justify-between bg-slate-950/80 p-1.5 rounded-lg border border-slate-800 transition-colors"
                          >
                            <span className="truncate max-w-[200px]">{src.title}</span>
                            <Globe size={9} className="shrink-0 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2 mr-auto max-w-[85%]">
                <div className="p-3 rounded-2xl text-xs bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-cyan-400 font-semibold">
                    <Sparkles size={11} className="animate-spin" />
                    <span>KK-AI is processing query...</span>
                  </div>
                  <div className="flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-900/80 text-rose-200 text-xs text-center flex items-center justify-center gap-2 font-mono">
                <AlertCircle size={14} className="text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-2 border-t border-slate-800 bg-slate-900 flex items-center gap-1.5"
          >
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
              title={isRecording ? "Stop recording speech" : "Record voice input"}
            >
              <Mic size={15} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? "Recording audio... speak now" : "Message KK-AI or 'generate image of...'"}
              disabled={loading || isRecording}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading || isRecording}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-800 disabled:text-slate-600 transition-all cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: IMAGE GENERATION (gemini-3-pro-image-preview / gemini-3.1-flash-image with 1K, 2K, 4K) */}
      {activeTab === "image" && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Wand2 size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <span>Gemini Image Studio</span>
                  <span className="text-[8.5px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                    gemini-3-pro-image-preview
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Generate high-fidelity AI imagery in 1K, 2K, or 4K</p>
              </div>
            </div>

            {/* Resolution Affordance (1K, 2K, 4K) */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>Select Resolution:</span>
                <span className="text-cyan-400 font-black">{imageSize}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["1K", "2K", "4K"] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`py-1.5 rounded-xl border text-xs font-mono font-black transition-all cursor-pointer ${
                      imageSize === size
                        ? "bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-950"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {size} Resolution
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>Aspect Ratio:</span>
                <span className="text-cyan-400 font-black">{aspectRatio}</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                {(["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                      aspectRatio === ratio
                        ? "bg-cyan-950 text-cyan-300 border-cyan-600 font-black"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-300">Image Description Prompt:</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="e.g. A futuristic neon smartphone floating above a dark glowing circuit grid, cinematic 3D render..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-slate-100 outline-none transition-all"
              />
            </div>

            <button
              onClick={() => handleGenerateImage()}
              disabled={!imagePrompt.trim() || generatingImage}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-950 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {generatingImage ? (
                <>
                  <Sparkles size={14} className="animate-spin" />
                  <span>Generating {imageSize} Image...</span>
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  <span>Generate High-Quality Image ({imageSize})</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Gallery Output */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5 font-mono">
              <ImageIcon size={14} className="text-cyan-400" /> Generated Artifacts ({generatedImages.length})
            </h4>

            {generatedImages.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs font-mono bg-slate-900/50 rounded-2xl border border-slate-800">
                No generated images yet. Enter a prompt above to create high-resolution imagery.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {generatedImages.map((img, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
                    <div className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img src={img.url} alt={img.prompt} className="w-full h-auto max-h-64 object-contain mx-auto" />
                      <button
                        onClick={() => setSelectedImageModal(img.url)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-white border border-slate-700 cursor-pointer"
                        title="Fullscreen Preview"
                      >
                        <Maximize2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[200px]">"{img.prompt}"</span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        {img.size}
                      </span>
                    </div>

                    <a
                      href={img.url}
                      download={`gemini_generated_${Date.now()}.png`}
                      className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download size={12} />
                      <span>Download {img.size} PNG</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIO TRANSCRIPTION INTERFACE */}
      {activeTab === "transcribe" && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="inline-flex p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Mic size={28} />
            </div>

            <div>
              <h3 className="text-sm font-black text-white">Audio Speech Transcription</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Record your voice via microphone to transcribe speech using model <code className="text-cyan-300">gemini-3.5-flash</code>.
              </p>
            </div>

            {/* Recording Controls */}
            <div className="py-2">
              {isRecording ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-rose-400 font-mono text-sm font-bold animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span>Recording: {recordingTime}s</span>
                  </div>

                  <button
                    onClick={stopRecording}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950 cursor-pointer transition-all active:scale-95"
                  >
                    Stop & Transcribe Audio
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isTranscribing ? "Transcribing Audio..." : "Start Voice Recording"}
                </button>
              )}
            </div>

            {isTranscribing && (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 py-2">
                <Sparkles size={14} className="animate-spin" />
                <span>Processing speech audio with Gemini 3.5...</span>
              </div>
            )}

            {/* Transcript Result Box */}
            {transcribedText && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1">
                  <span className="font-bold text-cyan-400">Speech Transcript Output:</span>
                  <span className="text-emerald-400 font-bold">✓ Complete</span>
                </div>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">{transcribedText}</p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setActiveTab("chat");
                      handleSend(transcribedText);
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono transition-colors cursor-pointer"
                  >
                    Send Transcript to Chat 💬
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex flex-col items-center justify-center space-y-3">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950 text-white font-mono text-xs border border-slate-700 cursor-pointer"
            >
              Close
            </button>
            <img src={selectedImageModal} alt="Preview" className="w-full h-auto rounded-xl object-contain max-h-[70vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
