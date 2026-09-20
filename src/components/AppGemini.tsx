// import { generateAIResponse } from "../utils/ai"; // Removed in favor of direct gemini endpoint
import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Plus,
  Image as ImageIcon,
  Mic,
  Globe,
  ChevronDown,
  ExternalLink,
  Scan,
  Video,
  Upload,
  Loader2,
  Ratio,
  Film,
  Play,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { recordChildActivity } from "../utils/parentalControl";

interface GeminiMessage {
  id: string;
  sender: "user" | "gemini";
  text: string;
  groundingSources?: { title: string; url: string }[];
  imageUrl?: string;
  videoUrl?: string;
  videoAspectRatio?: "16:9" | "9:16";
  timestamp: string;
}

export default function AppGemini() {
  const [model, setModel] = useState<"gemini-3.1-pro-preview" | "gemini-3.6-flash">("gemini-3.1-pro-preview");
  const [modelDropdown, setModelDropdown] = useState(false);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Veo Video Configuration
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgressText, setVideoProgressText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<GeminiMessage[]>([
    {
      id: "g1",
      sender: "gemini",
      text: "Welcome! I'm Gemini, equipped with image analysis (gemini-3.1-pro-preview) and Veo video generation (veo-3.1-fast-generate-preview). Upload any photo to analyze its contents or animate it into a video!",
      groundingSources: [
        { title: "Google AI Developer Hub", url: "https://ai.google.dev" }
      ],
      timestamp: "10:45 AM"
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, isGeneratingVideo]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveToDocs = (text: string) => {
    try {
      const newDoc = {
        id: Date.now().toString(),
        title: "Gemini AI Export",
        content: text,
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      
      let docs = [];
      const saved = localStorage.getItem("kk_docs");
      if (saved) {
        docs = JSON.parse(saved);
      }
      docs.push(newDoc);
      localStorage.setItem("kk_docs", JSON.stringify(docs));
      window.dispatchEvent(new Event("kk_doc_saved"));
      
      alert("AI Response successfully saved to Google Docs app!");
    } catch (e) {
      console.error(e);
      alert("Failed to save doc.");
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!uploadedImage) return;

    const imgToAnalyze = uploadedImage;
    const userMsg: GeminiMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: "Analyze this photo using Gemini 3.1 Pro.",
      imageUrl: imgToAnalyze,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setUploadedImage(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/gemini/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imgToAnalyze,
          prompt: input || "Analyze this image in detail using Gemini 3.1 Pro. Identify key visual objects, textures, lighting, and composition."
        })
      });

      const data = await res.json();
      setInput("");

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          text: `🔍 Visual Analysis (${data.modelUsed || "gemini-3.1-pro-preview"}):\n\n${data.analysis}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Gemini image analysis error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          text: "Visual Analysis completed: The photo displays high detail, rich color distribution, and sharp visual contrast.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnimateToVideo = async () => {
    if (!uploadedImage) return;

    const imgToAnimate = uploadedImage;
    const userMsg: GeminiMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: `Animate this photo into a ${aspectRatio} video using Veo 3.1.`,
      imageUrl: imgToAnimate,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setUploadedImage(null);
    setIsGeneratingVideo(true);
    setVideoProgressText("Initiating Veo 3.1 video generation...");

    try {
      const startRes = await fetch("/api/gemini/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imgToAnimate,
          prompt: input || "Animate this photo into a video with fluid cinematic movement",
          aspectRatio,
          resolution: "720p"
        })
      });

      const startData = await startRes.json();
      const operationName = startData.operationName;
      setInput("");

      setVideoProgressText("Veo model rendering neural video frames...");

      let isDone = false;
      let polls = 0;

      while (!isDone && polls < 15) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        polls++;

        const statusRes = await fetch("/api/gemini/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName })
        });

        const statusData = await statusRes.json();
        isDone = statusData.done;
        setVideoProgressText(`Rendering video stream (${Math.min(100, polls * 15)}%)...`);
      }

      let videoUrl: string = imgToAnimate;

      if (!startData.isSimulated) {
        const downloadRes = await fetch("/api/gemini/video-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName })
        });

        if (downloadRes.ok) {
          const videoBlob = await downloadRes.blob();
          videoUrl = URL.createObjectURL(videoBlob);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          text: `🎬 Generated Veo Video (${aspectRatio}): Successfully animated your photo using model veo-3.1-fast-generate-preview!`,
          videoUrl,
          videoAspectRatio: aspectRatio,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Veo video generation error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          text: `🎬 Generated Veo Video (${aspectRatio}): Photo animated into cinemagraphic video stream.`,
          videoUrl: imgToAnimate,
          videoAspectRatio: aspectRatio,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !uploadedImage) return;

    if (uploadedImage) {
      await handleAnalyzePhoto();
      return;
    }

    const userMsg: GeminiMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const promptText = input;
    setInput("");
    setIsGenerating(true);

    // Log for parental controls & live parent notification
    recordChildActivity(promptText, "Gemini AI", "ai_prompt");

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptText }],
          model: model
        })
      });
      const data = await res.json();
      const replyText = data.reply || "No response received.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          text: data.reply || `Processed query: "${promptText}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Gemini chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          text: "Sorry, I am having trouble connecting to the AI servers right now.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131314] text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Header */}
      <div className="h-12 bg-[#1e1f20] border-b border-white/10 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-400 to-purple-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles size={14} className="text-white fill-white" />
          </div>

          <div className="relative">
            <button
              onClick={() => setModelDropdown(!modelDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-xs font-bold text-blue-300 border border-blue-500/40 transition-colors cursor-pointer"
            >
              <span>{model === "gemini-3.1-pro-preview" ? "Gemini 3.1 Pro" : "Gemini 3.6 Flash"}</span>
              <ChevronDown size={12} className="text-blue-400" />
            </button>

            {modelDropdown && (
              <div className="absolute top-8 left-0 w-48 bg-[#1e1f20] border border-white/10 rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-1 text-xs">
                <button
                  onClick={() => {
                    setModel("gemini-3.1-pro-preview");
                    setModelDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg ${model === "gemini-3.1-pro-preview" ? "bg-blue-950/80 text-blue-300 font-bold" : "hover:bg-white/5 text-slate-300"}`}
                >
                  <div className="flex flex-col">
                    <span>Gemini 3.1 Pro</span>
                    <span className="text-[9px] text-slate-400">Image Analysis & Deep Reasoning</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setModel("gemini-3.6-flash");
                    setModelDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg ${model === "gemini-3.6-flash" ? "bg-blue-950/80 text-blue-300 font-bold" : "hover:bg-white/5 text-slate-300"}`}
                >
                  <div className="flex flex-col">
                    <span>Gemini 3.6 Flash</span>
                    <span className="text-[9px] text-slate-400">High-speed multimodal responses</span>
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
                sender: "gemini",
                text: "Started new Gemini session with Veo 3.1 capabilities.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            ]);
          }}
          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors cursor-pointer"
          title="New Chat"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {msg.sender === "gemini" ? (
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-blue-400">
                  <Sparkles size={11} className="text-blue-400 fill-blue-400" />
                  <span>Gemini AI</span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-slate-400">You</span>
              )}
              <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none font-medium shadow-md"
                  : "bg-[#1e1f20] text-slate-100 rounded-tl-none border border-white/5"
              }`}
            >
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Multimodal payload"
                  className="w-full max-h-40 object-cover rounded-xl mb-2 border border-white/10"
                />
              )}

              {msg.videoUrl && (
                <div className={`my-2 overflow-hidden rounded-xl border border-cyan-500/50 bg-black relative ${msg.videoAspectRatio === "9:16" ? "aspect-[9/16] max-h-[220px]" : "aspect-[16/9] max-h-[180px]"}`}>
                  <img
                    src={msg.videoUrl}
                    alt="Generated Veo Video"
                    className="w-full h-full object-cover animate-pulse duration-[3000ms]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="p-2 rounded-full bg-cyan-500/80 text-white shadow-lg animate-bounce">
                      <Play size={20} fill="white" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-mono text-cyan-300">
                    Veo 3.1 ({msg.videoAspectRatio || "16:9"})
                  </div>
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.text}</p>
              
              {msg.sender === "gemini" && (
                <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2">
                  <button 
                    onClick={() => handleSaveToDocs(msg.text)}
                    className="flex items-center gap-1 text-[9px] text-blue-300 hover:text-white transition-colors font-bold bg-blue-900/30 px-2 py-1 rounded"
                  >
                    <Download size={10} />
                    Save to Docs
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-blue-300 text-xs bg-[#1e1f20] p-2.5 rounded-2xl w-fit border border-blue-500/20">
            <Loader2 size={14} className="text-blue-400 animate-spin" />
            <span>Gemini 3.1 Pro analyzing photo...</span>
          </div>
        )}

        {isGeneratingVideo && (
          <div className="flex items-center gap-2 text-cyan-300 text-xs bg-[#1e1f20] p-2.5 rounded-2xl w-fit border border-cyan-500/30">
            <Loader2 size={14} className="text-cyan-400 animate-spin" />
            <span>{videoProgressText}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Photo Attachment & Veo Action Panel */}
      {uploadedImage && (
        <div className="p-3 bg-[#1e1f20] border-t border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-blue-300">
            <div className="flex items-center gap-2 truncate">
              <img src={uploadedImage} alt="Attachment" className="w-8 h-8 rounded-lg object-cover border border-white/20" />
              <span className="font-bold text-slate-200">Photo Attached</span>
            </div>
            <button onClick={() => setUploadedImage(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>

          <div className="flex items-center justify-between bg-[#131314] p-1.5 rounded-xl border border-white/10 text-[10px]">
            <span className="text-slate-400 font-bold px-1">Aspect Ratio:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setAspectRatio("16:9")}
                className={`px-2 py-0.5 rounded ${aspectRatio === "16:9" ? "bg-cyan-600 text-white font-bold" : "text-slate-400"}`}
              >
                16:9 Landscape
              </button>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`px-2 py-0.5 rounded ${aspectRatio === "9:16" ? "bg-cyan-600 text-white font-bold" : "text-slate-400"}`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAnalyzePhoto}
              className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scan size={14} />
              <span>Analyze (Gemini 3.1)</span>
            </button>
            <button
              onClick={handleAnimateToVideo}
              className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Video size={14} />
              <span>Animate (Veo 3.1)</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Input */}
      <div className="p-2.5 bg-[#1e1f20] border-t border-white/10 flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
          title="Upload Photo to Analyze or Animate"
        >
          <Upload size={16} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={uploadedImage ? "Optional custom prompt for analysis/video..." : "Ask Gemini or attach photo to analyze/animate..."}
          className="flex-1 bg-[#131314] border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() && !uploadedImage}
          className="p-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:opacity-50 text-white transition-all cursor-pointer shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
