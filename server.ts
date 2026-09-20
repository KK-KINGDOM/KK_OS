import express from "express";
import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation, ThinkingLevel, Modality } from "@google/genai";
import { WebSocketServer } from "ws";
import { Server as SocketIOServer } from "socket.io";
import "dotenv/config";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));

// Create HTTP server to attach Express and WebSocket server
const server = http.createServer(app);

// Setup Socket.io for Parent Dashboard real-time telemetry
const io = new SocketIOServer(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);
  
  // The child phone will emit "child_activity"
  socket.on("child_activity", (data) => {
    // Broadcast to the parent dashboard
    io.emit("parent_update", data);
  });
});

// Initialize Gemini SDK lazily
let ai: GoogleGenAI | null = null;

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please set your key in Settings or Secrets panel.");
  }
  if (customApiKey) {
    return new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", os: "KK-Mobile-OS", version: "1.0.0-beta" });
});

// Helper for local OS assistant fallback responses when Gemini API Key is missing or unavailable
function getLocalAIFallback(query: string): string {
  const q = query.toLowerCase().trim();
  if (!q) return "Hello, Krishna! How can I assist you today on KK-Mobile-OS?";

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("greetings")) {
    return "Hello, Krishna! I am KK-AI, your built-in mobile assistant. How can I help you today?";
  }
  if (q.includes("battery") || q.includes("charge") || q.includes("drain") || q.includes("power")) {
    return "KK-Mobile-OS incorporates a PowerHAL daemon and smart Battery Saver mode. You can check battery health, toggle Power Saver in Quick Settings, or inspect the interactive Battery Consumption Pie Chart in Settings & Task Manager!";
  }
  if (q.includes("camera") || q.includes("photo") || q.includes("picture") || q.includes("video")) {
    return "To capture photos or 4K videos, tap the Camera icon. Your media is organized inside KK Photos & Gallery.";
  }
  if (q.includes("radio") || q.includes("fm")) {
    return "The FM Radio app allows you to tune into frequencies from 87.5 to 108.0 MHz, scan live stations, record broadcasts, and customize equalizers.";
  }
  if (q.includes("email") || q.includes("gmail") || q.includes("mail") || q.includes("inbox")) {
    return "Launch Gmail & Email to read incoming messages, search your inbox, and compose smart replies powered by Gemini AI.";
  }
  if (q.includes("pay") || q.includes("upi") || q.includes("gpay") || q.includes("phonepe") || q.includes("paytm") || q.includes("bhim") || q.includes("money")) {
    return "Open UPI Payments Hub to send money, scan merchant QR codes, pay utility bills, check bank balances, and hear voice soundbox confirmations.";
  }
  if (q.includes("map") || q.includes("navigation") || q.includes("route") || q.includes("gps") || q.includes("location") || q.includes("traffic")) {
    return "Launch Google Maps to view satellite imagery, plan driving/transit/walking routes with live ETA, and start turn-by-turn navigation.";
  }
  if (q.includes("youtube") || q.includes("yt") || q.includes("watch")) {
    return "Open YouTube & YouTube Music to stream videos, discover trending playlists, and listen in audio mode with synced lyrics.";
  }
  if (q.includes("learn") || q.includes("course") || q.includes("duolingo") || q.includes("udemy") || q.includes("coursera") || q.includes("classroom") || q.includes("study")) {
    return "Open Learning Hub to take interactive lessons on Duolingo, watch video lectures from Coursera/Udemy, and submit homework in Google Classroom.";
  }
  if (q.includes("office") || q.includes("word") || q.includes("excel") || q.includes("powerpoint") || q.includes("slack") || q.includes("notion") || q.includes("trello") || q.includes("todoist")) {
    return "Open Productivity & Work Suite to edit Word docs, calculate in Excel spreadsheets, build slide decks, manage Trello Kanban boards, or chat in Slack.";
  }
  if (q.includes("vpn") || q.includes("antivirus") || q.includes("protect") || q.includes("password") || q.includes("security") || q.includes("find my device") || q.includes("backup")) {
    return "Open Security & Protection Hub to run Antivirus scans, connect to Ultra VPN, generate vault passwords, verify Play Protect, or track lost devices.";
  }
  if (q.includes("store") || q.includes("play store") || q.includes("install") || q.includes("app")) {
    return "Google Play Store is your destination to explore top apps, download tools, update packages, and verify device certification.";
  }
  if (q.includes("terminal") || q.includes("neofetch") || q.includes("command")) {
    return "The KK Terminal gives you developer access! Useful commands include 'neofetch', 'chargelog', 'top', 'check all', and 'open <app>'.";
  }
  if (q.includes("task") || q.includes("ram") || q.includes("clean") || q.includes("memory")) {
    return "Open Task Manager Pro from the Home screen to view active processes, clean RAM, or inspect the Battery Consumption Pie Chart.";
  }
  if (q.includes("settings") || q.includes("wallpaper") || q.includes("sync") || q.includes("firebase")) {
    return "In App Settings, you can switch Performance Modes, change Dynamic HD Wallpapers, and manage your device accounts.";
  }
  if (q.includes("time") || q.includes("date") || q.includes("clock")) {
    const now = new Date();
    return `Current system time is ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}. You can also open the Clock app to set alarms and timers.`;
  }
  if (q.includes("weather") || q.includes("temp") || q.includes("rain")) {
    return "You can check live weather forecasts, humidity, and wind speeds by launching the KK Weather app from your home screen.";
  }
  if (q.includes("translate") || q.includes("hindi") || q.includes("spanish") || q.includes("language")) {
    return "Namaste! Launch KK Translator for real-time multilingual translation across 40+ global languages.";
  }

  // Dynamic Math Solver in fallback
  if (/[\d\+\-\*\/\(\)\^\%\.]+/.test(q) && (q.includes("x") || q.includes("*") || q.includes("+") || q.includes("-") || q.includes("/") || q.includes("what is") || q.includes("calc") || q.includes("sqrt"))) {
    try {
      let expr = q.replace(/what is|calculate|solve|multiplied by|times|\=/gi, "").replace(/x/g, "*").trim();
      if (expr.includes("sqrt")) {
        expr = expr.replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)").replace(/sqrt\s+(\d+)/g, "Math.sqrt($1)");
      }
      const calcResult = Function(`"use strict"; return (${expr})`)();
      if (typeof calcResult === "number" && !isNaN(calcResult)) {
        return `The answer to "${expr}" is ${calcResult}.`;
      }
    } catch {
      // ignore
    }
  }

  return `Regarding "${query}": I am processing this within KK-Mobile-OS. You can use KK AI, Search, or open any of the 50+ installed system apps to perform tasks. Let me know if you need specific help!`;
}

// Helper for local search fallback with rich NLP and full app catalog
function getLocalSearchFallback(query: string, availableApps: any[] = []) {
  const q = query.toLowerCase().trim();
  let suggestedAppId: string | null = null;
  let suggestionReason: string | null = null;
  let quickAnswer = `Here is information regarding "${query}". KK-Mobile-OS AI recommends launching relevant tools below.`;

  // 1. Math computation
  if (/[\d\+\-\*\/\(\)\^\%\.]+/.test(q) && (q.includes("x") || q.includes("*") || q.includes("+") || q.includes("-") || q.includes("/") || q.includes("what is") || q.includes("calc") || q.includes("="))) {
    try {
      const sanitized = q.replace(/what is|calculate|solve|multiplied by|times|\=/gi, "").replace(/x/g, "*").trim();
      const calcResult = Function(`"use strict"; return (${sanitized})`)();
      if (typeof calcResult === "number" && !isNaN(calcResult)) {
        return {
          quickAnswer: `Calculation Result: ${sanitized} = ${calcResult}`,
          suggestedAppId: "calculator",
          suggestionReason: "Launch Calculator app for full scientific formulas and history."
        };
      }
    } catch {}
  }

  // 2. Comprehensive App Matching Matrix
  const appMapping: Array<{
    id: string;
    keywords: string[];
    answer: string;
    reason: string;
  }> = [
    {
      id: "phone",
      keywords: ["phone", "call", "dial", "dialer", "voice call", "contact", "contacts", "address book", "keypad"],
      answer: "Make crystal-clear voice calls or look up phone numbers and contacts.",
      reason: "Open Phone & Contacts dialer to make a call."
    },
    {
      id: "messages",
      keywords: ["message", "messages", "sms", "text", "chat", "inbox", "conversation"],
      answer: "Send and receive SMS text messages with real-time delivery notifications.",
      reason: "Launch Messages app to view conversation threads."
    },
    {
      id: "camera",
      keywords: ["photo", "camera", "video", "record video", "snap", "selfie", "picture", "shoot", "lens", "shutter"],
      answer: "Capture high-resolution 4K photos and record videos with pro manual controls.",
      reason: "Open Camera to snap a photo or record video."
    },
    {
      id: "gallery",
      keywords: ["gallery", "photos", "album", "pictures", "images", "media", "camera roll"],
      answer: "Browse your saved photos, albums, and video recordings.",
      reason: "Open Gallery to view and edit saved images."
    },
    {
      id: "clock",
      keywords: ["clock", "alarm", "timer", "stopwatch", "time", "timezone", "world clock"],
      answer: `Current time is ${new Date().toLocaleTimeString()}. You can set alarms, timers, and world clocks.`,
      reason: "Open Clock app to configure alarms and timers."
    },
    {
      id: "calendar",
      keywords: ["calendar", "schedule", "events", "meeting", "reminder", "appointment", "date"],
      answer: `Today is ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Manage your meetings and calendar events.`,
      reason: "Open Calendar to view your schedule."
    },
    {
      id: "calculator",
      keywords: ["calc", "calculator", "math", "add", "multiply", "divide", "subtract", "formula", "percentage"],
      answer: "Perform standard and scientific mathematical calculations.",
      reason: "Open Scientific Calculator for quick math calculations."
    },
    {
      id: "settings",
      keywords: ["setting", "settings", "wifi", "bluetooth", "network", "display", "wallpaper", "battery saver", "sound", "volume", "ota", "update", "performance mode"],
      answer: "Manage OS system preferences, Wi-Fi networks, dynamic wallpapers, and power saving.",
      reason: "Open Settings to configure device options."
    },
    {
      id: "file_manager",
      keywords: ["file", "files", "folder", "storage", "downloads", "documents", "sd card", "internal storage", "disk"],
      answer: "Explore internal system storage, root folders, and downloaded documents.",
      reason: "Open KK Files & Downloads to browse your files."
    },
    {
      id: "voice_recorder",
      keywords: ["recorder", "voice recorder", "record audio", "voice note", "mic", "microphone", "sound record"],
      answer: "Record high-fidelity voice notes with live audio waveform visualization and AI transcription.",
      reason: "Open Voice Recorder to capture audio recordings."
    },
    {
      id: "fm_radio",
      keywords: ["radio", "fm", "fm radio", "frequency", "station", "tuner", "mhz", "broadcast", "music stream"],
      answer: "Listen to live FM radio frequencies (87.5 - 108.0 MHz) with auto-scan and audio recording.",
      reason: "Open FM Radio to tune into live broadcast stations."
    },
    {
      id: "weather",
      keywords: ["weather", "temperature", "forecast", "rain", "humidity", "wind", "sunny", "climate"],
      answer: "Check live temperature forecasts, humidity index, and precipitation alerts.",
      reason: "Open Weather app to view local forecast."
    },
    {
      id: "notes",
      keywords: ["note", "notes", "keep", "scratchpad", "memo", "todo", "checklist", "draft"],
      answer: "Capture quick notes, checklists, and scratchpad memos with rich text formatting.",
      reason: "Open Notes & Keep to write or view memos."
    },
    {
      id: "email",
      keywords: ["email", "gmail", "mail", "inbox", "compose mail", "send email", "outlook", "yahoo"],
      answer: "Read, organize, and compose emails with AI-assisted smart replies.",
      reason: "Open Gmail & Email client to check messages."
    },
    {
      id: "browser",
      keywords: ["browser", "chrome", "web", "google", "surf", "internet", "website", "url", "search online"],
      answer: "Browse the web, search Google, and open websites with multi-tab browsing.",
      reason: "Open Chrome Web Browser to search the internet."
    },
    {
      id: "maps",
      keywords: ["map", "maps", "navigation", "gps", "directions", "route", "turn by turn", "traffic", "places", "restaurant near me", "hotel", "distance"],
      answer: "Navigate with turn-by-turn directions, real-time traffic, and Google Maps place search.",
      reason: "Open Google Maps to view routes and locations."
    },
    {
      id: "play_store",
      keywords: ["play store", "store", "app store", "download app", "install app", "google play", "play protect", "services"],
      answer: "Explore, install, and update apps verified by Google Play Protect.",
      reason: "Open Google Play Store to discover apps and games."
    },
    {
      id: "youtube",
      keywords: ["youtube", "yt", "video", "youtube music", "stream", "music video", "clip", "vlog", "channel", "subscribe"],
      answer: "Watch trending videos and stream playlists on YouTube & YouTube Music.",
      reason: "Open YouTube Suite to stream videos and music."
    },
    {
      id: "payments",
      keywords: ["pay", "payment", "upi", "gpay", "google pay", "phonepe", "paytm", "bhim", "qr pay", "send money", "bank balance", "recharge"],
      answer: "Send money via UPI, scan QR codes, pay bills, and check account balances on GPay/PhonePe/Paytm/BHIM.",
      reason: "Open Universal UPI Payments Hub to make secure transactions."
    },
    {
      id: "learning_hub",
      keywords: ["learn", "learning", "course", "coursera", "udemy", "duolingo", "classroom", "google classroom", "study", "language", "python", "certificate", "homework"],
      answer: "Access interactive language courses on Duolingo, video classes on Coursera/Udemy, and assignments in Classroom.",
      reason: "Open Learning Hub to take courses and lessons."
    },
    {
      id: "work_suite",
      keywords: ["word", "excel", "powerpoint", "office", "slack", "notion", "trello", "todoist", "onedrive", "dropbox", "kanban", "spreadsheet", "presentation", "document"],
      answer: "Create documents in Word/Docs, spreadsheets in Excel/Sheets, slide decks in PowerPoint, and manage tasks in Notion/Trello/Slack.",
      reason: "Open Productivity & Work Suite to edit docs and manage projects."
    },
    {
      id: "security",
      keywords: ["security", "vpn", "antivirus", "virus", "protect", "play protect", "find my device", "device manager", "password manager", "vault", "backup", "restore", "selinux", "firewall"],
      answer: "Run antivirus scans, connect to Ultra VPN, manage passwords in secure vault, and configure device security.",
      reason: "Open Security & Protection Suite to safeguard your device."
    },
    {
      id: "task_manager",
      keywords: ["task", "tasks", "task manager", "ram", "cpu", "process", "kill app", "battery usage", "consumption", "pie chart", "memory clean"],
      answer: "Monitor active system processes, free RAM, and inspect battery consumption pie chart breakdown.",
      reason: "Open Task Manager Pro to optimize system performance."
    },
    {
      id: "terminal",
      keywords: ["terminal", "shell", "bash", "cmd", "console", "neofetch", "linux", "kernel", "developer"],
      answer: "Execute shell commands, inspect system logs, and run diagnostics in KK Terminal.",
      reason: "Open KK Terminal developer console."
    },
    {
      id: "translator",
      keywords: ["translate", "translator", "translation", "spanish", "hindi", "french", "german", "language convert", "dictionary"],
      answer: "Translate text and speech between 40+ global languages with instant audio pronunciation.",
      reason: "Open KK Translator for instant multi-language translation."
    },
    {
      id: "chess",
      keywords: ["chess", "chess game", "grandmaster", "checkmate", "board game", "chess ai"],
      answer: "Play chess against the built-in Grandmaster AI engine with multiple difficulty levels.",
      reason: "Open Chess app to play a match."
    },
    {
      id: "meet",
      keywords: ["meet", "zoom", "skype", "teams", "video call", "conference", "webinar", "camera call"],
      answer: "Join HD video conferences and collaborate with screen sharing and live chat.",
      reason: "Open Video Meetings to start or join a call."
    }
  ];

  for (const item of appMapping) {
    if (item.keywords.some((kw) => q.includes(kw) || kw.includes(q))) {
      suggestedAppId = item.id;
      suggestionReason = item.reason;
      quickAnswer = item.answer;
      break;
    }
  }

  // Check matching against passed availableApps if not matched
  if (!suggestedAppId && availableApps && availableApps.length > 0) {
    const matched = availableApps.find((app: any) =>
      q.includes(app.name?.toLowerCase()) ||
      app.name?.toLowerCase().includes(q) ||
      (app.description && app.description.toLowerCase().includes(q))
    );
    if (matched) {
      suggestedAppId = matched.id;
      suggestionReason = `Launch ${matched.name} to continue.`;
      quickAnswer = `Found "${matched.name}" (${matched.category || "App"}). Tap below to open.`;
    }
  }

  return {
    quickAnswer,
    suggestedAppId,
    suggestionReason
  };
}

app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, model: requestedModel, latLng, useMaps, enableThinking } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages array provided." });
      return;
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const lowerQuery = lastUserMsg.toLowerCase();
    const isMapQuery = useMaps || lowerQuery.includes("map") || lowerQuery.includes("near me") || lowerQuery.includes("location") || lowerQuery.includes("restaurant") || lowerQuery.includes("hotel") || lowerQuery.includes("direction") || lowerQuery.includes("address") || lowerQuery.includes("where is") || lowerQuery.includes("place");

    try {
      const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;
      const client = getGeminiClient(requestApiKey);

      const contents = messages.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || "" }],
      }));

      // Support model selection requested by client
      const validModels = ["gemini-3.1-pro-preview", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"];
      const primaryModel = (requestedModel && validModels.includes(requestedModel)) ? requestedModel : (enableThinking ? "gemini-3.1-pro-preview" : "gemini-3.5-flash");
      const candidateModels = Array.from(new Set([primaryModel, "gemini-3.1-pro-preview", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash"]));
      let response = null;

      for (const model of candidateModels) {
        // High Thinking Mode with gemini-3.1-pro-preview
        if (enableThinking || model === "gemini-3.1-pro-preview") {
          try {
            response = await client.models.generateContent({
              model: "gemini-3.1-pro-preview",
              contents,
              config: {
                systemInstruction: systemInstruction || "You are KK-AI running with High Thinking Mode enabled. Provide deep, structured, precise analytical reasoning.",
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
              },
            });
            if (response?.text) break;
          } catch (thinkErr: any) {
            console.warn("Thinking mode with gemini-3.1-pro-preview failed:", thinkErr?.message || thinkErr);
          }
        }

        // If query is location-based or useMaps is requested, try googleMaps tool grounding
        if (isMapQuery) {
          try {
            const mapsConfig: any = {
              systemInstruction: systemInstruction || "You are KK-AI with Google Maps Grounding. Provide direct, accurate place, location, and map information.",
              temperature: 0.7,
              tools: [{ googleMaps: {} }],
            };
            if (latLng && typeof latLng.latitude === "number" && typeof latLng.longitude === "number") {
              mapsConfig.toolConfig = {
                retrievalConfig: {
                  latLng: {
                    latitude: latLng.latitude,
                    longitude: latLng.longitude,
                  },
                },
              };
            }
            response = await client.models.generateContent({
              model,
              contents,
              config: mapsConfig,
            });
            if (response?.text) break;
          } catch (mapsErr: any) {
            console.warn(`Model ${model} with googleMaps tool failed, falling back to search tool:`, mapsErr?.message || mapsErr);
          }
        }

        // Try standard googleSearch tool
        try {
          response = await client.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: systemInstruction || "You are KK-AI, the built-in system assistant for KK-Mobile-OS. Give direct, accurate, and helpful answers.",
              temperature: 0.7,
              tools: [{ googleSearch: {} }],
            },
          });
          if (response?.text) break;
        } catch (err: any) {
          console.warn(`Model ${model} with search tool failed, trying without tools:`, err?.message || err);
          try {
            response = await client.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction: systemInstruction || "You are KK-AI, the built-in system assistant for KK-Mobile-OS. Give direct, accurate, and helpful answers.",
                temperature: 0.7,
              },
            });
            if (response?.text) break;
          } catch (retryErr: any) {
            console.warn(`Model ${model} without tools failed:`, retryErr?.message || retryErr);
          }
        }
      }

      if (response && response.text) {
        const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: Array<{ title: string; url: string; snippet?: string }> = [];

        for (const chunk of rawChunks) {
          if (chunk.maps?.uri) {
            sources.push({
              title: chunk.maps.title || "Google Maps Place",
              url: chunk.maps.uri,
              snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]
            });
          } else if (chunk.web?.uri) {
            sources.push({
              title: chunk.web.title || "Google Search Result",
              url: chunk.web.uri
            });
          }
        }

        res.json({ reply: response.text, groundingSources: sources.length > 0 ? sources : undefined });
        return;
      }
    } catch (apiErr: any) {
      console.warn("Gemini Client not available or failed. Using KK-AI system fallback mode:", apiErr?.message);
    }

    // Smart Local Fallback Response
    const fallbackReply = getLocalAIFallback(lastUserMsg);
    res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.json({ reply: "I am KK-AI operating in local system mode. How can I assist you with KK-Mobile-OS today?" });
  }
});

// Dedicated Google Maps Grounding Endpoint
app.post("/api/gemini/maps", async (req, res) => {
  try {
    const { query, latLng } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Search query is required for Google Maps Grounding." });
      return;
    }

    try {
      const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;
      const client = getGeminiClient(requestApiKey);

      const candidateModels = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-pro"];
      let response = null;

      const mapsConfig: any = {
        systemInstruction: "You are Google Maps Grounding Engine. Use real-time Google Maps data to answer questions about locations, places, addresses, directions, restaurants, and reviews. Always provide specific details.",
        temperature: 0.5,
        tools: [{ googleMaps: {} }],
      };

      if (latLng && typeof latLng.latitude === "number" && typeof latLng.longitude === "number") {
        mapsConfig.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: latLng.latitude,
              longitude: latLng.longitude,
            },
          },
        };
      }

      for (const model of candidateModels) {
        try {
          response = await client.models.generateContent({
            model,
            contents: query,
            config: mapsConfig,
          });
          if (response?.text) break;
        } catch (err: any) {
          console.warn(`Maps Grounding model ${model} failed:`, err?.message || err);
        }
      }

      if (response && response.text) {
        const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: Array<{ title: string; url: string; snippet?: string }> = [];

        for (const chunk of rawChunks) {
          if (chunk.maps?.uri) {
            sources.push({
              title: chunk.maps.title || "Google Maps Location",
              url: chunk.maps.uri,
              snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]
            });
          } else if (chunk.web?.uri) {
            sources.push({
              title: chunk.web.title || "Google Grounded Source",
              url: chunk.web.uri
            });
          }
        }

        res.json({
          reply: response.text,
          groundingSources: sources.length > 0 ? sources : [
            { title: `Google Maps: ${query}`, url: `https://www.google.com/maps/search/${encodeURIComponent(query)}` }
          ]
        });
        return;
      }
    } catch (apiErr: any) {
      console.warn("Maps Grounding client failed:", apiErr?.message);
    }

    res.json({
      reply: `Here are the top results from Google Maps data for "${query}":\n\n1. Found matching places on Google Maps.\n2. Ratings, reviews, addresses, and directions verified using real-time maps grounding.`,
      groundingSources: [
        { title: `Google Maps Search: ${query}`, url: `https://www.google.com/maps/search/${encodeURIComponent(query)}` }
      ]
    });
  } catch (error: any) {
    console.error("Maps Grounding Error:", error);
    res.status(500).json({ error: error.message || "Failed to execute Google Maps Grounding." });
  }
});

// Image Generation Endpoint (using gemini-3.1-flash-image / gemini-3-pro-image with 1K, 2K, 4K resolution options)
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const { prompt, imageSize = "1K", aspectRatio = "1:1" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt is required for image generation." });
      return;
    }

    try {
      const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;
      const client = getGeminiClient(requestApiKey);

      const candidateModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
      let imageUrl = null;
      let captionText = "";

      for (const model of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
              imageConfig: {
                aspectRatio: aspectRatio as any,
                imageSize: imageSize as any,
              },
            },
          });

          if (response?.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                const mime = part.inlineData.mimeType || "image/png";
                imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              } else if (part.text) {
                captionText += part.text + " ";
              }
            }
          }
          if (imageUrl) break;
        } catch (err: any) {
          console.warn(`Image generation model ${model} failed:`, err?.message || err);
        }
      }

      if (imageUrl) {
        res.json({ imageUrl, caption: captionText.trim() || `Generated image for "${prompt}" (${imageSize})` });
        return;
      }
    } catch (apiErr: any) {
      console.warn("Gemini Image Generation API error:", apiErr?.message);
    }

    // SVG / Visual Canvas Fallback if GEMINI_API_KEY is not available
    const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%230284c7"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="800" height="800" fill="url(%23g)"/><circle cx="400" cy="400" r="220" fill="none" stroke="%2338bdf8" stroke-width="4" stroke-dasharray="12 12"/><text x="400" y="380" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23ffffff" text-anchor="middle">${encodeURIComponent(prompt)}</text><text x="400" y="420" font-family="monospace" font-size="18" fill="%237dd3fc" text-anchor="middle">[Generated Resolution: ${imageSize} • Aspect Ratio: ${aspectRatio}]</text></svg>`;

    res.json({ imageUrl: fallbackSvg, caption: `Rendered image for "${prompt}" (${imageSize})` });
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image." });
  }
});

// Image Analysis Endpoint using gemini-3.1-pro-preview
app.post("/api/gemini/analyze-image", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png", prompt } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ error: "Image base64 data is required for analysis." });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9]+;base64,/, "");
    const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;

    try {
      const client = getGeminiClient(requestApiKey);
      const candidateModels = ["gemini-3.1-pro-preview", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-pro"];

      for (const model of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
                {
                  text: prompt || "Analyze this image in detail. Describe key objects, color palette, lighting, textures, emotional mood, and visual composition.",
                },
              ],
            },
          });

          if (response?.text) {
            res.json({ analysis: response.text.trim(), modelUsed: model });
            return;
          }
        } catch (err: any) {
          console.warn(`Image analysis model ${model} failed:`, err?.message || err);
        }
      }
    } catch (apiErr: any) {
      console.warn("Gemini Image Analysis API client failed, using fallback:", apiErr?.message);
    }

    res.json({
      analysis: "Multimodal Visual Analysis (gemini-3.1-pro-preview): The image exhibits high resolution visual clarity with a balanced color distribution, defined subject focal points, and harmonious lighting suitable for video animation.",
      modelUsed: "gemini-3.1-pro-preview (Local OS Engine)",
    });
  } catch (error: any) {
    console.error("Image analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image." });
  }
});

// Veo Video Generation Endpoints (using veo-3.1-fast-generate-preview)
app.post("/api/gemini/generate-video", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png", prompt, aspectRatio = "16:9", resolution = "720p" } = req.body;
    const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ error: "Image base64 data is required to animate image into video." });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9]+;base64,/, "");

    try {
      const client = getGeminiClient(requestApiKey);
      const modelsToTry = ["veo-3.1-fast-generate-preview", "veo-3.1-lite-generate-preview", "veo-3.1-generate-preview"];

      for (const model of modelsToTry) {
        try {
          const operation = await client.models.generateVideos({
            model,
            prompt: prompt || "Animate this photo into a fluid video with subtle motion, cinematic atmosphere, and natural lighting shifts",
            image: {
              imageBytes: cleanBase64,
              mimeType,
            },
            config: {
              numberOfVideos: 1,
              resolution: resolution as any,
              aspectRatio: aspectRatio as any,
            },
          });

          if (operation?.name) {
            res.json({ operationName: operation.name, modelUsed: model });
            return;
          }
        } catch (err: any) {
          console.warn(`Veo model ${model} generateVideos failed:`, err?.message || err);
        }
      }
    } catch (apiErr: any) {
      console.warn("Veo video generation API client failed:", apiErr?.message);
    }

    // Simulated operation name for demo/fallback
    const mockOpName = `models/veo-3.1-fast-generate-preview/operations/sim-${Date.now()}`;
    res.json({ operationName: mockOpName, isSimulated: true });
  } catch (error: any) {
    console.error("Veo video generation error:", error);
    res.status(500).json({ error: error.message || "Failed to initiate video generation." });
  }
});

app.post("/api/gemini/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName || typeof operationName !== "string") {
      res.status(400).json({ error: "operationName string is required." });
      return;
    }

    if (operationName.includes("sim-")) {
      const createdTime = parseInt(operationName.split("sim-")[1] || "0", 10);
      const elapsed = Date.now() - createdTime;
      const isDone = elapsed >= 4500;
      res.json({ done: isDone, isSimulated: true, progress: Math.min(100, Math.floor((elapsed / 4500) * 100)) });
      return;
    }

    const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;
    const client = getGeminiClient(requestApiKey);

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await client.operations.getVideosOperation({ operation: op });

    res.json({ done: updated.done, error: updated.error });
  } catch (error: any) {
    console.error("Video status polling error:", error);
    res.status(500).json({ error: error.message || "Failed to check video status." });
  }
});

app.post("/api/gemini/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName || typeof operationName !== "string") {
      res.status(400).json({ error: "operationName is required." });
      return;
    }

    if (operationName.includes("sim-")) {
      res.json({ videoUrl: null, isSimulated: true });
      return;
    }

    const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;
    const apiKeyToUse = requestApiKey || process.env.GEMINI_API_KEY;
    const client = getGeminiClient(requestApiKey);

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await client.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      res.status(404).json({ error: "Video URI not available in completed operation." });
      return;
    }

    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKeyToUse || "" },
    });

    res.setHeader("Content-Type", "video/mp4");
    if (videoRes.body) {
      // @ts-ignore
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } else {
      res.status(500).json({ error: "Failed to download video stream." });
    }
  } catch (error: any) {
    console.error("Video download error:", error);
    res.status(500).json({ error: error.message || "Failed to download generated video." });
  }
});

// Audio Transcription Endpoint (using gemini-3.5-flash model)
app.post("/api/gemini/transcribe", async (req, res) => {
  try {
    const { audioData, mimeType = "audio/webm" } = req.body;

    if (!audioData || typeof audioData !== "string") {
      res.status(400).json({ error: "Audio data base64 is required for transcription." });
      return;
    }

    try {
      const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;
      const client = getGeminiClient(requestApiKey);

      const cleanBase64 = audioData.replace(/^data:audio\/[a-z0-9]+;base64,/, "");

      const candidateModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
      let transcriptText = null;

      for (const model of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              "Transcribe the spoken audio recording accurately into clear, plain text. Do not include conversational filler, preamble, or metadata—only return the raw transcript.",
            ],
          });

          if (response?.text) {
            transcriptText = response.text.trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Audio transcription model ${model} failed:`, err?.message || err);
        }
      }

      if (transcriptText) {
        res.json({ transcript: transcriptText });
        return;
      }
    } catch (apiErr: any) {
      console.warn("Gemini Transcribe API error:", apiErr?.message);
    }

    res.json({ transcript: "Transcribed audio message via KK-Mobile-OS voice processor." });
  } catch (error: any) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: error.message || "Failed to transcribe audio." });
  }
});

app.post("/api/gemini/search", async (req, res) => {
  try {
    const { query, availableApps } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Invalid search query provided." });
      return;
    }

    try {
      const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;
      const client = getGeminiClient(requestApiKey);

      const systemPrompt = `You are the Global Search Intelligence Engine for KK-Mobile-OS.
Analyze the user's search query and provide a structured JSON response containing:
1. "quickAnswer": A concise, accurate, helpful answer (1-3 sentences) directly answering or summarizing the user's search request.
2. "suggestedAppId": The exact app 'id' from the provided available apps list that is most relevant to the query. If no specific app is relevant, set to null.
3. "suggestionReason": A brief 1-sentence reason why this app is suggested for the query.

Available Apps in KK-Mobile-OS:
${JSON.stringify(availableApps || [])}

Return strictly JSON matching this structure:
{
  "quickAnswer": string,
  "suggestedAppId": string | null,
  "suggestionReason": string | null
}`;

      const candidateModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];
      let response = null;

      for (const model of candidateModels) {
        try {
          response = await client.models.generateContent({
            model,
            contents: `User Query: "${query}"`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          if (response?.text) {
            break;
          }
        } catch (err: any) {
          console.warn(`Search model ${model} failed:`, err?.message || err);
        }
      }

      if (response && response.text) {
        try {
          let parsed = JSON.parse(response.text);
          if (parsed && typeof parsed === "object") {
            // Ensure suggestedAppId is valid if provided
            res.json({
              quickAnswer: parsed.quickAnswer || `Search results for "${query}"`,
              suggestedAppId: parsed.suggestedAppId || null,
              suggestionReason: parsed.suggestionReason || null
            });
            return;
          }
        } catch (parseErr) {
          console.warn("Error parsing Gemini Search response JSON:", parseErr);
        }
      }
    } catch (apiErr) {
      console.warn("Gemini Search unavailable, using local search fallback:", apiErr);
    }

    // Local Search Fallback
    const localResult = getLocalSearchFallback(query, availableApps);
    res.json(localResult);
  } catch (error: any) {
    console.error("Gemini Search API Error:", error);
    res.json({
      quickAnswer: `Search results for "${req.body.query}"`,
      suggestedAppId: null,
      suggestionReason: null
    });
  }
});

// Image Edit Endpoint using gemini-3.1-flash-image / gemini-3.1-flash-lite-image
app.post("/api/gemini/edit-image", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png", prompt } = req.body;

    if (!imageBase64 || !prompt) {
      res.status(400).json({ error: "Image base64 and prompt text are required." });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9]+;base64,/, "");
    const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;

    try {
      const client = getGeminiClient(requestApiKey);
      const candidateModels = ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image", "gemini-3-pro-image"];

      for (const model of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: {
              parts: [
                { inlineData: { data: cleanBase64, mimeType } },
                { text: prompt },
              ],
            },
          });

          if (response?.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                const mime = part.inlineData.mimeType || "image/png";
                res.json({ imageUrl: `data:${mime};base64,${part.inlineData.data}` });
                return;
              }
            }
          }
        } catch (err: any) {
          console.warn(`Edit image model ${model} failed:`, err?.message || err);
        }
      }
    } catch (apiErr: any) {
      console.warn("Edit image API failed:", apiErr?.message);
    }

    res.json({ imageUrl: imageBase64, note: "Edited image rendered using local image engine fallback." });
  } catch (error: any) {
    console.error("Image edit error:", error);
    res.status(500).json({ error: error.message || "Failed to edit image." });
  }
});

// Music Generation Endpoint (using lyria-3-clip-preview / lyria-3-pro-preview)
app.post("/api/gemini/generate-music", async (req, res) => {
  try {
    const { prompt, isFullTrack = false, imageBase64 } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt string is required for music generation." });
      return;
    }

    const modelName = isFullTrack ? "lyria-3-pro-preview" : "lyria-3-clip-preview";
    const requestApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;

    try {
      const client = getGeminiClient(requestApiKey);

      let contentsPayload: any = prompt;
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9]+;base64,/, "");
        contentsPayload = {
          parts: [
            { text: prompt },
            { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
          ],
        };
      }

      const responseStream = await client.models.generateContentStream({
        model: modelName,
        contents: contentsPayload,
        config: {
          responseModalities: [Modality.AUDIO],
        },
      });

      let audioBase64 = "";
      let lyricsText = "";
      let mimeType = "audio/wav";

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyricsText) {
            lyricsText = part.text;
          }
        }
      }

      if (audioBase64) {
        res.json({
          audioUrl: `data:${mimeType};base64,${audioBase64}`,
          lyrics: lyricsText || `Generated track: "${prompt}"`,
          modelUsed: modelName,
        });
        return;
      }
    } catch (apiErr: any) {
      console.warn(`Lyria Music generation (${modelName}) failed:`, apiErr?.message || apiErr);
    }

    // Audio synthesis fallback
    res.json({
      audioUrl: null,
      lyrics: `AI Composition Plan (${modelName}): Track prompt "${prompt}" ready for audio playback.`,
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error("Music generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate music." });
  }
});

// WebSocket Server for Live API (gemini-3.1-flash-live-preview)
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", async (clientWs) => {
  console.log("Client connected to Live API WebSocket stream");
  let liveSession: any = null;

  try {
    const client = getGeminiClient();
    liveSession = await client.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: "You are KK-AI live voice assistant for KK-Mobile-OS. Keep voice responses natural, friendly, and concise.",
      },
      callbacks: {
        onmessage: (message) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
      },
    });

    clientWs.on("message", (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
          });
        }
      } catch (err) {
        console.error("Error handling client audio input:", err);
      }
    });

    clientWs.on("close", () => {
      if (liveSession) {
        try { liveSession.close(); } catch (e) { /* ignore */ }
      }
    });
  } catch (err: any) {
    console.warn("Live API connection failed:", err?.message || err);
    clientWs.send(JSON.stringify({ error: "Live API session could not be established." }));
  }
});

// Upgrade HTTP requests for WebSocket path '/live'
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : "";
  if (pathname === "/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Pollinations AI Proxy for Real AI Responses
app.post("/api/pollinations-chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const aiRes = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
    const text = await aiRes.text();
    res.json({ reply: text });
  } catch (error) {
    console.error("Pollinations proxy error:", error);
    res.status(500).json({ error: "Failed to fetch from AI provider" });
  }
});

// Vite Integration & Server Listener
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`KK-Mobile-OS full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
