import React, { useState } from "react";
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  History,
  Mic,
  Star,
  Trash2,
  Globe
} from "lucide-react";

interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: string;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "zh", name: "Chinese (Mandarin)", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ko", name: "Korean", flag: "🇰🇷" }
];

const QUICK_PHRASES = [
  {
    category: "Greetings",
    phrases: [
      { en: "Hello, how are you?", es: "Hola, ¿cómo estás?", fr: "Bonjour, comment allez-vous?", hi: "नमस्ते, आप कैसे हैं?", ja: "こんにちは、お元気ですか？" },
      { en: "Nice to meet you", es: "Mucho gusto", fr: "Ravi de vous rencontrer", hi: "आपसे मिलकर खुशी हुई", ja: "はじめまして" }
    ]
  },
  {
    category: "Travel & Taxi",
    phrases: [
      { en: "Where is the train station?", es: "¿Dónde está la estación de trenes?", fr: "Où est la gare?", hi: "रेलवे स्टेशन कहाँ है?", ja: "駅はどこですか？" },
      { en: "How much does this cost?", es: "¿Cuánto cuesta esto?", fr: "Combien ça coûte?", hi: "इसकी कीमत कितनी है?", ja: "これはいくらですか？" }
    ]
  },
  {
    category: "Emergency",
    phrases: [
      { en: "I need help urgently!", es: "¡Necesito ayuda urgentemente!", fr: "J'ai besoin d'aide de toute urgence!", hi: "मुझे तुरंत मदद चाहिए!", ja: "至急助けてください！" },
      { en: "Where is the hospital?", es: "¿Dónde está el hospital?", fr: "Où est l'hôpital?", hi: "अस्पताल कहाँ है?", ja: "病院はどこですか？" }
    ]
  }
];

// Offline translation lookup table
const MOCK_TRANSLATION_DB: Record<string, Record<string, string>> = {
  "hello": { es: "Hola", fr: "Bonjour", de: "Hallo", hi: "नमस्ते", ja: "こんにちは", zh: "你好", ar: "مرحبا", ru: "Здравствуйте", pt: "Olá", it: "Ciao", ko: "안녕하세요" },
  "thank you": { es: "Gracias", fr: "Merci", de: "Danke", hi: "धन्यवाद", ja: "ありがとう", zh: "谢谢", ar: "شكرا لك", ru: "Спасибо", pt: "Obrigado", it: "Grazie", ko: "감사합니다" },
  "where is the hotel?": { es: "¿Dónde está el hotel?", fr: "Où est l'hôtel?", de: "Wo ist das Hotel?", hi: "होटल कहाँ है?", ja: "ホテルはどこですか？", zh: "酒店在哪里？", ar: "أين الفندق؟", ru: "Где отель?", pt: "Onde fica o hotel?", it: "Dov'è l'hotel?", ko: "호텔은 어디에 있나요?" },
  "good morning": { es: "Buenos días", fr: "Bonjour", de: "Guten Morgen", hi: "सुप्रभात", ja: "おはようございます", zh: "早上好", ar: "صباح الخير", ru: "Доброе утро", pt: "Bom dia", it: "Buongiorno", ko: "좋은 아침입니다" }
};

export default function AppTranslator() {
  const [activeTab, setActiveTab] = useState<"translate" | "phrasebook" | "history">("translate");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [fromLang, setFromLang] = useState("en");
  const [toLang, setToLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<TranslationHistoryItem[]>([
    {
      id: "h-1",
      sourceText: "Hello, welcome to KK Mobile OS!",
      translatedText: "¡Hola, bienvenido a KK Mobile OS!",
      fromLang: "en",
      toLang: "es",
      timestamp: "10:15 AM"
    },
    {
      id: "h-2",
      sourceText: "Where is the nearest subway station?",
      translatedText: "Où se trouve la station de métro la plus proche?",
      fromLang: "en",
      toLang: "fr",
      timestamp: "Yesterday"
    }
  ]);

  const handleSwapLanguages = () => {
    const temp = fromLang;
    setFromLang(toLang);
    setToLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = (textToTranslate?: string) => {
    const query = (textToTranslate !== undefined ? textToTranslate : sourceText).trim();
    if (!query) {
      setTranslatedText("");
      return;
    }

    setIsTranslating(true);
    setTimeout(() => {
      let output = "";
      const lower = query.toLowerCase();

      if (MOCK_TRANSLATION_DB[lower] && MOCK_TRANSLATION_DB[lower][toLang]) {
        output = MOCK_TRANSLATION_DB[lower][toLang];
      } else {
        // Smart procedural translation generator
        const targetLangObj = LANGUAGES.find((l) => l.code === toLang);
        if (toLang === "es") {
          output = query.replace(/hello/gi, "Hola").replace(/thank you/gi, "Gracias").replace(/welcome/gi, "bienvenido") + " (traducido)";
        } else if (toLang === "fr") {
          output = query.replace(/hello/gi, "Bonjour").replace(/thank you/gi, "Merci") + " (traduit)";
        } else if (toLang === "de") {
          output = query.replace(/hello/gi, "Hallo").replace(/thank you/gi, "Danke") + " (übersetzt)";
        } else if (toLang === "hi") {
          output = "नमस्ते! " + query + " (हिंदी में अनुवादित)";
        } else if (toLang === "ja") {
          output = query + " (日本語訳)";
        } else {
          output = `[${targetLangObj?.name || toLang}] ${query}`;
        }
      }

      setTranslatedText(output);
      setIsTranslating(false);

      // Add to history
      const newItem: TranslationHistoryItem = {
        id: `th-${Date.now()}`,
        sourceText: query,
        translatedText: output,
        fromLang,
        toLang,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
    }, 300);
  };

  const handleSpeak = (text: string, langCode: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLangName = (code: string) => LANGUAGES.find((l) => l.code === code)?.name || code;
  const getLangFlag = (code: string) => LANGUAGES.find((l) => l.code === code)?.flag || "🌐";

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
            <Languages size={18} />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">KK Translator</h2>
            <p className="text-[9px] text-slate-400 font-mono">Neural Translation Engine</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("translate")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "translate" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Translate
          </button>
          <button
            onClick={() => setActiveTab("phrasebook")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "phrasebook" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Phrases
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "history" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* MAIN VIEW: TRANSLATE */}
      {activeTab === "translate" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Language Selector Bar */}
          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-2xl border border-slate-800 shadow-md">
            {/* From Lang */}
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono text-slate-500 block uppercase">From</span>
              <select
                value={fromLang}
                onChange={(e) => {
                  setFromLang(e.target.value);
                  handleTranslate();
                }}
                className="w-full bg-transparent text-xs font-bold text-teal-400 outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLanguages}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-teal-400 border border-slate-800 mx-2 cursor-pointer transition-transform active:scale-90"
              title="Swap Languages"
            >
              <ArrowRightLeft size={14} />
            </button>

            {/* To Lang */}
            <div className="flex-1 min-w-0 text-right">
              <span className="text-[9px] font-mono text-slate-500 block uppercase">To</span>
              <select
                value={toLang}
                onChange={(e) => {
                  setToLang(e.target.value);
                  handleTranslate();
                }}
                className="w-full bg-transparent text-xs font-bold text-teal-400 outline-none cursor-pointer text-right"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Text Input Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 shadow-lg relative">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1">
                <span>{getLangFlag(fromLang)}</span> {getLangName(fromLang)}
              </span>
              {sourceText && (
                <button
                  onClick={() => {
                    setSourceText("");
                    setTranslatedText("");
                  }}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={`Enter text in ${getLangName(fromLang)}...`}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <div className="flex items-center gap-1">
                {sourceText && (
                  <button
                    onClick={() => handleSpeak(sourceText, fromLang)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    title="Listen pronunciation"
                  >
                    <Volume2 size={13} />
                  </button>
                )}
              </div>

              <button
                onClick={() => handleTranslate()}
                disabled={!sourceText.trim() || isTranslating}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow active:scale-95 transition-all"
              >
                <Sparkles size={13} />
                <span>{isTranslating ? "Translating..." : "Translate"}</span>
              </button>
            </div>
          </div>

          {/* Translation Result Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/30 border border-teal-500/30 rounded-2xl p-3 space-y-2 shadow-xl min-h-[110px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-teal-400 border-b border-teal-500/20 pb-1.5">
              <span className="flex items-center gap-1">
                <span>{getLangFlag(toLang)}</span> {getLangName(toLang)} (Neural Result)
              </span>
              <span className="text-[9px] font-mono bg-teal-950 px-1.5 py-0.2 rounded text-teal-300 border border-teal-800">
                OFFLINE ENGINE
              </span>
            </div>

            <div className="flex-1 py-1">
              {isTranslating ? (
                <div className="flex items-center gap-2 text-xs text-teal-400 font-mono animate-pulse">
                  <div className="w-3 h-3 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                  Generating neural translation...
                </div>
              ) : translatedText ? (
                <p className="text-sm font-semibold text-white leading-relaxed">{translatedText}</p>
              ) : (
                <p className="text-xs text-slate-500 italic">Translation will appear here after entering text above.</p>
              )}
            </div>

            {translatedText && (
              <div className="flex items-center justify-between pt-1.5 border-t border-teal-500/20">
                <button
                  onClick={() => handleSpeak(translatedText, toLang)}
                  className="p-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800 text-xs flex items-center gap-1 cursor-pointer"
                  title="Listen translated text"
                >
                  <Volume2 size={13} />
                  <span className="text-[10px] font-bold">Pronounce</span>
                </button>

                <button
                  onClick={() => handleCopy(translatedText)}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span className="text-[10px] font-bold">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Preset Phrases Bar */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Test Input
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {["Hello", "Thank you", "Where is the hotel?", "Good morning"].map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => {
                    setSourceText(phrase);
                    handleTranslate(phrase);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-medium text-teal-300 shrink-0 cursor-pointer transition-colors"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHRASEBOOK */}
      {activeTab === "phrasebook" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen size={14} className="text-teal-400" />
              Essential Travel Phrasebook
            </h3>
            <p className="text-[10px] text-slate-400">
              Instant offline phrases translated to <strong className="text-teal-300">{getLangName(toLang)}</strong>
            </p>
          </div>

          <div className="space-y-3">
            {QUICK_PHRASES.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono">
                  {cat.category}
                </span>

                <div className="space-y-1.5">
                  {cat.phrases.map((phrase, pIdx) => {
                    const trans = (phrase as any)[toLang] || phrase.es;
                    return (
                      <div
                        key={pIdx}
                        onClick={() => {
                          setSourceText(phrase.en);
                          setTranslatedText(trans);
                          setActiveTab("translate");
                        }}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-white truncate">{phrase.en}</p>
                          <p className="text-[11px] text-teal-300 truncate font-sans">{trans}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(trans, toLang);
                          }}
                          className="p-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <History size={14} className="text-teal-400" />
              Translation History
            </span>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-[10px] text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={11} /> Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <p>No translation history yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSourceText(item.sourceText);
                    setTranslatedText(item.translatedText);
                    setFromLang(item.fromLang);
                    setToLang(item.toLang);
                    setActiveTab("translate");
                  }}
                  className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer space-y-1 transition-colors"
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span>
                      {getLangFlag(item.fromLang)} {item.fromLang.toUpperCase()} → {getLangFlag(item.toLang)} {item.toLang.toUpperCase()}
                    </span>
                    <span>{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-1">{item.sourceText}</p>
                  <p className="text-xs font-bold text-teal-300 line-clamp-1">{item.translatedText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
