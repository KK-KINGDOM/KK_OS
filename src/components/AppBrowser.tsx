import React, { useState } from "react";
import {
  Search,
  Globe,
  ArrowLeft,
  RotateCcw,
  Home,
  Star,
  Share2,
  ExternalLink,
  Mic,
  Bookmark,
  ChevronRight,
  Sparkles,
  Newspaper,
  Layers,
  Compass,
  ShieldCheck,
  ShieldAlert,
  Lock
} from "lucide-react";

interface AppBrowserProps {
  initialQuery?: string;
}

const UNSAFE_KEYWORDS = ["adult", "gambling", "malware", "explicit", "nsfw", "casino", "porn", "hack"];

export default function AppBrowser({ initialQuery = "" }: AppBrowserProps) {
  const [urlInput, setUrlInput] = useState(initialQuery || "https://www.google.com");
  const [activeTab, setActiveTab] = useState<"home" | "search" | "page">("home");
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState("");
  
  // SafeSearch state (Default strictly TRUE as requested)
  const [safeSearchStrict, setSafeSearchStrict] = useState(true);
  const [isBlockedBySafeSearch, setIsBlockedBySafeSearch] = useState(false);
  const [showSafeSearchModal, setShowSafeSearchModal] = useState(false);

  const [bookmarks, setBookmarks] = useState([
    { title: "Google", url: "https://www.google.com", icon: "G" },
    { title: "YouTube", url: "https://www.youtube.com", icon: "YT" },
    { title: "Wikipedia", url: "https://www.wikipedia.org", icon: "W" },
    { title: "Google News", url: "https://news.google.com", icon: "N" },
    { title: "Weather", url: "https://weather.com", icon: "☀" }
  ]);

  const checkSafeSearchBlock = (query: string) => {
    if (!safeSearchStrict) return false;
    const lower = query.toLowerCase();
    return UNSAFE_KEYWORDS.some((kw) => lower.includes(kw));
  };

  const handleNavigate = (targetUrl: string) => {
    let formatted = targetUrl.trim();
    if (!formatted) return;

    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      if (formatted.includes(".") && !formatted.includes(" ")) {
        formatted = "https://" + formatted;
      } else {
        // Search query
        handleSearchSubmitText(formatted);
        return;
      }
    }

    setUrlInput(formatted);
    setLoadedUrl(formatted);
    setActiveTab("page");
  };

  const handleSearchSubmitText = (query: string) => {
    if (!query.trim()) return;

    const blocked = checkSafeSearchBlock(query);
    setIsBlockedBySafeSearch(blocked);

    setIsSearching(true);
    setCurrentQuery(query);
    setSearchQuery(query);
    setUrlInput(`https://www.google.com/search?q=${encodeURIComponent(query)}&safe=active`);
    setActiveTab("search");
    setTimeout(() => setIsSearching(false), 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmitText(searchQuery);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans select-none relative">
      {/* SafeSearch Settings Modal */}
      {showSafeSearchModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-teal-400 font-extrabold text-sm">
              <ShieldCheck size={20} />
              <span>SafeSearch Protection</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              SafeSearch is <strong className="text-teal-300">Strictly Enforced by System Policy</strong> in default settings. Adult, explicit, and unsafe search queries are filtered automatically.
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Strict Filter</span>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Filters explicit web results, images, and malicious URLs.</p>
            </div>

            <button
              onClick={() => setShowSafeSearchModal(false)}
              className="w-full py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs cursor-pointer shadow"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Chrome Top Address Bar */}
      <div className="bg-slate-950 border-b border-slate-800 p-2 flex items-center gap-1.5 shrink-0 z-20">
        <button
          onClick={() => {
            setActiveTab("home");
            setUrlInput("https://www.google.com");
            setSearchQuery("");
            setIsBlockedBySafeSearch(false);
          }}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Home"
        >
          <Home size={14} />
        </button>

        <button
          onClick={() => {
            if (activeTab === "search") setIsSearching(true);
            setTimeout(() => setIsSearching(false), 300);
          }}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh"
        >
          <RotateCcw size={13} />
        </button>

        {/* Address & Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/50 transition-all">
          <Globe size={12} className="text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery || urlInput}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setUrlInput(e.target.value);
            }}
            placeholder="Search Google or type a URL"
            className="w-full bg-transparent text-white placeholder-slate-500 outline-none text-[11px]"
          />
          <button type="submit" className="text-teal-400 hover:text-teal-300 ml-1">
            <Search size={12} />
          </button>
        </form>

        {/* SafeSearch Status Badge */}
        <button
          onClick={() => setShowSafeSearchModal(true)}
          className="p-1.5 rounded-xl bg-teal-950 border border-teal-800/80 text-teal-300 hover:bg-teal-900 cursor-pointer flex items-center gap-1 shrink-0"
          title="SafeSearch Active (Strict)"
        >
          <ShieldCheck size={14} className="text-teal-400" />
          <span className="text-[9px] font-mono font-bold hidden sm:inline">SafeSearch: ON</span>
        </button>
      </div>

      {/* Main Browser Canvas */}
      <div className="flex-1 overflow-y-auto relative bg-slate-950">
        
        {/* 1. HOME SCREEN (Google Search Style) */}
        {activeTab === "home" && (
          <div className="flex flex-col items-center justify-center min-h-full p-4 space-y-6">
            
            {/* Google Logo */}
            <div className="flex items-center gap-1 text-3xl font-extrabold tracking-tighter mt-2 select-none">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </div>

            {/* SafeSearch Banner Indicator */}
            <div
              onClick={() => setShowSafeSearchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold cursor-pointer hover:bg-teal-900/80 transition-all shadow-sm"
            >
              <ShieldCheck size={12} className="text-teal-400" />
              <span>🛡️ SafeSearch: Strict Active (Default)</span>
            </div>

            {/* Main Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xs space-y-2">
              <div className="relative flex items-center bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full px-4 py-2.5 shadow-lg transition-all">
                <Search size={15} className="text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or type web address"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                />
                <button type="button" className="text-slate-400 hover:text-teal-400 p-1">
                  <Mic size={14} />
                </button>
              </div>

              <div className="flex justify-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-[10px] font-medium text-slate-300 cursor-pointer"
                >
                  Google Search
                </button>
              </div>
            </form>

            {/* Quick Shortcuts / Bookmarks */}
            <div className="w-full max-w-xs space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Top Shortcuts</span>
              <div className="grid grid-cols-4 gap-3 text-center">
                {bookmarks.map((bm, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (bm.title === "Google") {
                        setActiveTab("home");
                      } else {
                        handleSearchSubmitText(bm.title);
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 text-teal-400 font-extrabold text-xs flex items-center justify-center shadow-md group-hover:scale-105 group-hover:border-teal-500 transition-all">
                      {bm.icon}
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-[50px]">{bm.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Google Discover Feed Simulation */}
            <div className="w-full max-w-xs space-y-2 pt-3 border-t border-slate-900">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <Compass size={12} className="text-teal-400" /> Discover Feed
                </span>
                <span className="text-slate-500">Safe Filtered</span>
              </div>

              <div className="space-y-2">
                <div
                  onClick={() => handleSearchSubmitText("Latest Technology News")}
                  className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 space-y-1 hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Tech & AI</span>
                  <p className="text-[11px] font-semibold text-slate-100 leading-tight">
                    Next-Gen Mobile OS Architectures Shift Towards Microkernel Sandboxing
                  </p>
                  <p className="text-[9px] text-slate-400">TechCrunch • 2h ago</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. SEARCH RESULTS VIEW */}
        {activeTab === "search" && (
          <div className="p-3 space-y-3">
            
            {/* Loading Spinner */}
            {isSearching ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="h-6 w-6 rounded-full border-2 border-t-teal-400 border-slate-800 animate-spin" />
                <span className="text-xs font-mono">Fetching filtered SafeSearch results...</span>
              </div>
            ) : isBlockedBySafeSearch ? (
              /* Blocked Unsafe Query Screen */
              <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/40 text-center space-y-3 shadow-2xl my-6">
                <ShieldAlert size={40} className="text-rose-400 mx-auto" />
                <h2 className="text-sm font-extrabold text-white">SafeSearch Blocked Unsafe Content</h2>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Your query <strong className="text-rose-300 font-mono">"{currentQuery}"</strong> was filtered because default <strong className="text-teal-300">Strict SafeSearch</strong> is active on KK Mobile OS.
                </p>
                <button
                  onClick={() => setActiveTab("home")}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
                >
                  Return to Safe Home
                </button>
              </div>
            ) : (
              <>
                {/* Search Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px]">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-teal-400 font-bold border-b border-teal-400 pb-0.5">All</span>
                    <span>Images</span>
                    <span>News</span>
                    <span>Videos</span>
                  </div>

                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                    <ShieldCheck size={10} /> SafeSearch Strict
                  </span>
                </div>

                {/* AI Overview Box */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/50 rounded-2xl p-3 space-y-1.5 shadow-md">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[10px]">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span>AI Overview for "{currentQuery}"</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    SafeSearch filtered results for <strong className="text-teal-300">{currentQuery}</strong>. All explicit, adult, and malicious URLs have been scrubbed from output.
                  </p>
                </div>

                {/* Result 1 */}
                <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 space-y-1 hover:border-slate-700 transition-colors">
                  <span className="text-[9px] font-mono text-slate-400 block truncate">https://wikipedia.org › wiki › {encodeURIComponent(currentQuery)}</span>
                  <h3
                    onClick={() => handleNavigate(`https://wikipedia.org/wiki/${encodeURIComponent(currentQuery)}`)}
                    className="text-xs font-bold text-teal-400 hover:underline cursor-pointer flex items-center justify-between"
                  >
                    <span>{currentQuery} - Wikipedia, the free encyclopedia</span>
                    <ExternalLink size={10} className="text-slate-500" />
                  </h3>
                  <p className="text-[10px] text-slate-300 leading-normal">
                    Comprehensive documentation and historical overview regarding {currentQuery}. Explore origins, architecture, key milestones, and ongoing development.
                  </p>
                </div>

                {/* Result 2 */}
                <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 space-y-1 hover:border-slate-700 transition-colors">
                  <span className="text-[9px] font-mono text-slate-400 block truncate">https://news.google.com › stories › {encodeURIComponent(currentQuery)}</span>
                  <h3
                    onClick={() => handleNavigate("https://news.google.com")}
                    className="text-xs font-bold text-teal-400 hover:underline cursor-pointer flex items-center justify-between"
                  >
                    <span>Top News & Verified Stories: {currentQuery}</span>
                    <ExternalLink size={10} className="text-slate-500" />
                  </h3>
                  <p className="text-[10px] text-slate-300 leading-normal">
                    Breaking coverage and analytical reports regarding recent developments in {currentQuery}. Updated 10 minutes ago across major tech publications.
                  </p>
                </div>
              </>
            )}

          </div>
        )}

        {/* 3. SIMULATED / REAL WEB PAGE VIEW */}
        {activeTab === "page" && (
          <div className="h-full flex flex-col bg-slate-900 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">{loadedUrl}</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck size={10} /> SafeSearch Filtered
              </span>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 overflow-y-auto">
              <div className="flex items-center gap-2 text-teal-400">
                <Globe size={18} />
                <h2 className="text-sm font-bold capitalize">{loadedUrl.replace("https://", "").replace("http://", "").split("/")[0]}</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Welcome to the simulated webpage environment for <strong className="text-white">{loadedUrl}</strong>.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-200">Page Details & Network Summary</h4>
                <ul className="text-[10px] text-slate-400 space-y-1 font-mono">
                  <li>• SafeSearch Policy: Strict Enabled</li>
                  <li>• Protocol: HTTP/2 TLS 1.3</li>
                  <li>• Status: 200 OK Verified</li>
                  <li>• Content-Type: text/html; charset=utf-8</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setActiveTab("home")}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Return to Google Home
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
