import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Share2,
  ListFilter,
  Check
} from "lucide-react";

interface WordDefinition {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  etymology: string;
}

const DICTIONARY_DATABASE: Record<string, WordDefinition> = {
  resilience: {
    word: "resilience",
    phonetic: "/rɪˈzɪl.jəns/",
    partOfSpeech: "noun",
    definition: "The capacity to withstand or recover quickly from difficult conditions or adversity.",
    example: "Her mental resilience helped her overcome severe challenges during the expedition.",
    synonyms: ["toughness", "adaptability", "flexibility", "tenacity"],
    antonyms: ["fragility", "vulnerability", "weakness"],
    etymology: "From Latin 'resilire' meaning 'to leap back' or 'rebound'."
  },
  algorithm: {
    word: "algorithm",
    phonetic: "/ˈæl.ɡə.rɪ.ðəm/",
    partOfSpeech: "noun",
    definition: "A step-by-step procedure or formula for solving a problem or performing a computation.",
    example: "The search engine uses a proprietary algorithm to index billions of webpages.",
    synonyms: ["procedure", "process", "formula", "protocol"],
    antonyms: ["randomness", "chaos"],
    etymology: "Derived from the name of Persian mathematician Muhammad ibn Musa al-Khwarizmi."
  },
  ephemeral: {
    word: "ephemeral",
    phonetic: "/ɪˈfem.ər.əl/",
    partOfSpeech: "adjective",
    definition: "Lasting for a very short time; fleeting or transitory.",
    example: "The cherry blossoms provided an ephemeral display of natural beauty.",
    synonyms: ["transient", "fleeting", "momentary", "evanescent"],
    antonyms: ["permanent", "eternal", "lasting"],
    etymology: "From Greek 'ephemeros' meaning 'lasting only a day'."
  },
  serendipity: {
    word: "serendipity",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    partOfSpeech: "noun",
    definition: "The occurrence and development of events by chance in a happy or beneficial way.",
    example: "Finding my dream job while on vacation was pure serendipity.",
    synonyms: ["chance", "happy accident", "fluke", "fortune"],
    antonyms: ["misfortune", "design", "intention"],
    etymology: "Coined by Horace Walpole in 1754 from the Persian fairy tale 'The Three Princes of Serendip'."
  },
  ubiquitous: {
    word: "ubiquitous",
    phonetic: "/juːˈbɪk.wə.təs/",
    partOfSpeech: "adjective",
    definition: "Present, appearing, or found everywhere at once.",
    example: "Mobile smartphones have become ubiquitous in modern society.",
    synonyms: ["omnipresent", "pervasive", "universal", "widespread"],
    antonyms: ["rare", "scarce", "infrequent"],
    etymology: "From Latin 'ubique' meaning 'everywhere'."
  },
  paradigm: {
    word: "paradigm",
    phonetic: "/ˈpær.ə.daɪm/",
    partOfSpeech: "noun",
    definition: "A typical pattern or model of something; a world view or conceptual framework.",
    example: "Artificial intelligence introduces a new paradigm in software engineering.",
    synonyms: ["archetype", "model", "pattern", "prototype"],
    antonyms: ["anomaly", "exception"],
    etymology: "From Greek 'paradeigma' meaning 'pattern' or 'example'."
  },
  solitude: {
    word: "solitude",
    phonetic: "/ˈsɒl.ɪ.tʃuːd/",
    partOfSpeech: "noun",
    definition: "The state or situation of being alone, especially when peaceful and pleasant.",
    example: "He spent the weekend in peaceful solitude writing his novel.",
    synonyms: ["seclusion", "privacy", "isolation", "peace"],
    antonyms: ["companionship", "crowd"],
    etymology: "From Latin 'solitudo' from 'solus' meaning 'alone'."
  },
  meticulous: {
    word: "meticulous",
    phonetic: "/məˈtɪk.jə.ləs/",
    partOfSpeech: "adjective",
    definition: "Showing great attention to detail; very careful and precise.",
    example: "The software engineer performed meticulous testing before publishing the update.",
    synonyms: ["thorough", "precise", "painstaking", "scrupulous"],
    antonyms: ["careless", "sloppy", "hasty"],
    etymology: "From Latin 'meticulosus' meaning 'fearful' or 'over-cautious'."
  }
};

const WORD_OF_THE_DAY: WordDefinition = {
  word: "luminous",
  phonetic: "/ˈluː.mɪ.nəs/",
  partOfSpeech: "adjective",
  definition: "Full of or shedding light; bright or shining, especially in the dark.",
  example: "The phone screen displayed a luminous OLED wallpaper with deep contrast.",
  synonyms: ["radiant", "brilliant", "glowing", "resplendent"],
  antonyms: ["dark", "dull", "gloomy"],
  etymology: "From Latin 'lumen' meaning 'light'."
};

export default function AppDictionary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWord, setActiveWord] = useState<WordDefinition>(DICTIONARY_DATABASE["resilience"]);
  const [bookmarks, setBookmarks] = useState<string[]>(["resilience", "serendipity"]);
  const [activeTab, setActiveTab] = useState<"search" | "bookmarks">("search");

  const handleSearch = (query: string) => {
    const clean = query.trim().toLowerCase();
    setSearchTerm(query);
    if (!clean) return;

    if (DICTIONARY_DATABASE[clean]) {
      setActiveWord(DICTIONARY_DATABASE[clean]);
    } else {
      // Procedural fallback definition generator
      const generated: WordDefinition = {
        word: clean,
        phonetic: `/${clean}/`,
        partOfSpeech: "noun",
        definition: `A specific term or concept inside the KK Mobile OS vocabulary index referring to '${clean}'.`,
        example: `The user looked up '${clean}' in the system dictionary.`,
        synonyms: ["concept", "term", "expression"],
        antonyms: ["opposite"],
        etymology: "Derived from standard language references."
      };
      setActiveWord(generated);
    }
  };

  const handleSpeak = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleBookmark = (word: string) => {
    setBookmarks((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const isBookmarked = bookmarks.includes(activeWord.word);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">KK Dictionary</h2>
            <p className="text-[9px] text-slate-400 font-mono">English Lexicon & Thesaurus</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "search" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Lookup
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === "bookmarks" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark size={11} />
            <span>Saved ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "search" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search dictionary..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-2xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors shadow-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Object.keys(DICTIONARY_DATABASE).map((wordKey) => (
              <button
                key={wordKey}
                onClick={() => handleSearch(wordKey)}
                className={`px-2.5 py-1 rounded-xl border text-[10px] font-semibold shrink-0 cursor-pointer transition-colors ${
                  activeWord.word === wordKey
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {wordKey}
              </button>
            ))}
          </div>

          {/* Word Card Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-xl">
            {/* Header / Pronunciation */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white capitalize">{activeWord.word}</h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/80">
                    {activeWord.partOfSpeech}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">{activeWord.phonetic}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSpeak(activeWord.word)}
                  className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow transition-all active:scale-95"
                  title="Listen pronunciation"
                >
                  <Volume2 size={16} />
                </button>

                <button
                  onClick={() => toggleBookmark(activeWord.word)}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition-all active:scale-95 ${
                    isBookmarked
                      ? "bg-amber-950 text-amber-300 border-amber-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                  title="Save word"
                >
                  {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              </div>
            </div>

            {/* Definition */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                Definition
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeWord.definition}
              </p>
            </div>

            {/* Example Usage */}
            {activeWord.example && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Example Sentence
                </span>
                <p className="text-xs text-amber-200/90 italic">"{activeWord.example}"</p>
              </div>
            )}

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {activeWord.synonyms.length > 0 && (
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Synonyms
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeWord.synonyms.map((s) => (
                      <span
                        key={s}
                        onClick={() => handleSearch(s)}
                        className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded-md border border-emerald-800/60 cursor-pointer hover:bg-emerald-900"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeWord.antonyms.length > 0 && (
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                  <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block">
                    Antonyms
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeWord.antonyms.map((a) => (
                      <span
                        key={a}
                        className="text-[10px] bg-rose-950/80 text-rose-300 px-1.5 py-0.5 rounded-md border border-rose-800/60"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Etymology / Origin */}
            {activeWord.etymology && (
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                <strong className="text-slate-300">Etymology:</strong> {activeWord.etymology}
              </div>
            )}
          </div>

          {/* Word of the Day Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between shadow-lg">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> WORD OF THE DAY
              </span>
              <h4 className="text-sm font-extrabold text-white capitalize">{WORD_OF_THE_DAY.word}</h4>
              <p className="text-[10px] text-slate-300 line-clamp-1">{WORD_OF_THE_DAY.definition}</p>
            </div>

            <button
              onClick={() => setActiveWord(WORD_OF_THE_DAY)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow active:scale-95 transition-all"
            >
              View
            </button>
          </div>
        </div>
      )}

      {activeTab === "bookmarks" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <h3 className="text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
            Bookmarked Vocabulary ({bookmarks.length})
          </h3>

          {bookmarks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No saved words yet. Tap the bookmark icon on any word to save it here.
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((w) => {
                const item = DICTIONARY_DATABASE[w] || {
                  word: w,
                  phonetic: `/${w}/`,
                  partOfSpeech: "noun",
                  definition: "Saved term in vocabulary list."
                };

                return (
                  <div
                    key={w}
                    onClick={() => {
                      setActiveWord(item as WordDefinition);
                      setActiveTab("search");
                    }}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-white capitalize">{item.word}</h4>
                        <span className="text-[9px] font-mono text-slate-400">{item.phonetic}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">{item.definition}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(w);
                      }}
                      className="p-1.5 text-amber-400 hover:text-slate-500 cursor-pointer"
                    >
                      <BookmarkCheck size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
