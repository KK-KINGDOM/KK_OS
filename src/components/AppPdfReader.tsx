import React, { useState } from "react";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Download,
  Share2,
  List,
  BookOpen,
  Printer,
  Sparkles,
  Check
} from "lucide-react";

interface PdfDoc {
  id: string;
  title: string;
  author: string;
  sizeMb: string;
  totalPages: number;
  updatedDate: string;
  toc: { title: string; page: number }[];
  pages: { pageNum: number; heading: string; body: string; codeSnippet?: string; callout?: string }[];
}

const PDF_LIBRARY: PdfDoc[] = [
  {
    id: "pdf-1",
    title: "KK-OS Architecture & Kernel Manual.pdf",
    author: "KK Core Engineering",
    sizeMb: "4.2 MB",
    totalPages: 4,
    updatedDate: "July 2026",
    toc: [
      { title: "1. Executive System Overview", page: 1 },
      { title: "2. PowerHAL & Battery Governor", page: 2 },
      { title: "3. Multi-App Lifecycle Engine", page: 3 },
      { title: "4. Dark Mode Scheduler", page: 4 }
    ],
    pages: [
      {
        pageNum: 1,
        heading: "1. Executive System Overview",
        body: "KK Mobile OS is a high-performance web-native containerized operating system. It features low-latency rendering, simulated PowerHAL frequency scaling, full-screen background app caching, and built-in system tools.",
        callout: "System Goal: To provide a secure, responsive desktop and mobile operating system experience directly inside modern browsers."
      },
      {
        pageNum: 2,
        heading: "2. PowerHAL & Battery Governor",
        body: "The PowerHAL module regulates CPU clock intervals and background thread scheduling. In High Performance Mode, execution is prioritized for 60 FPS animations with active battery drain of 1% every 30-60s.",
        codeSnippet: "enum PowerMode { HIGH_PERFORMANCE, POWER_EFFICIENT }\nfunction applyPowerGovernor(mode: PowerMode) {\n  systemClock.setSpeed(mode === PowerMode.HIGH_PERFORMANCE ? 3200 : 1800);\n}"
      },
      {
        pageNum: 3,
        heading: "3. Multi-App Lifecycle Engine",
        body: "Apps run as isolated React components mapped via `AppID`. The system tracks app memory footprint and app cache sizes, allowing users to clear unused cache directly from the Task Manager.",
        callout: "Cache Clearing: Frees up system storage without altering saved user preferences."
      },
      {
        pageNum: 4,
        heading: "4. System-Wide Dark Mode Scheduler",
        body: "The Dark Mode Scheduler applies warm, low-blue light CSS filters across the entire system. Color temperature adjusts dynamically according to sunrise/sunset schedules or custom time overrides.",
        codeSnippet: "// Filter formula\nconst warmFilter = `sepia(${intensity * 0.4}%) hue-rotate(-20deg) brightness(${brightness}%)`;"
      }
    ]
  },
  {
    id: "pdf-2",
    title: "Emergency SOS & Safety Guidelines.pdf",
    author: "National Public Safety Board",
    sizeMb: "1.8 MB",
    totalPages: 3,
    updatedDate: "June 2026",
    toc: [
      { title: "1. Emergency Numbers Catalog", page: 1 },
      { title: "2. SOS Alarm Dispatch System", page: 2 },
      { title: "3. Medical ID Profile", page: 3 }
    ],
    pages: [
      {
        pageNum: 1,
        heading: "1. Emergency Numbers Catalog",
        body: "National Emergency Helpline: 112\nPolice: 100 | Fire: 101 | Ambulance: 102\nWomen Helpline: 1091 | Cyber Crime: 1930 | Disaster Helpline: 1078\nPoison Control: 1066 | Child Helpline: 1098 | Senior Citizen: 14567",
        callout: "Important: All emergency helplines are available 24/7 toll-free."
      },
      {
        pageNum: 2,
        heading: "2. SOS Alarm Dispatch System",
        body: "Pressing the SOS Trigger button initiates a 5-second countdown. Upon completion, high-decibel siren sounds play, flashlight strobe effects simulate, and emergency SMS messages are dispatched with live GPS location coordinates.",
        codeSnippet: "function triggerSOSDispatch(coords: GPSLocation) {\n  smsService.sendAllContacts(`EMERGENCY SOS! I need help. My location: ${coords.lat}, ${coords.lng}`);\n  sirenAudio.playLoop();\n}"
      },
      {
        pageNum: 3,
        heading: "3. Medical ID Profile",
        body: "Store crucial medical records including Blood Group (e.g. O+), Allergies (e.g. Penicillin, Peanuts), Existing Medical Conditions, and Primary Physician Contact Details on the Lockscreen.",
        callout: "Lockscreen Access: First responders can access Emergency Medical ID without unlocking the device."
      }
    ]
  }
];

export default function AppPdfReader() {
  const [selectedDoc, setSelectedDoc] = useState<PdfDoc | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  const activePageData = selectedDoc?.pages.find((p) => p.pageNum === currentPage) || selectedDoc?.pages[0];

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {selectedDoc && (
            <button
              onClick={() => setSelectedDoc(null)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer mr-1"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="p-1.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
            <FileText size={18} />
          </div>
          <div className="min-w-0 max-w-[180px]">
            <h2 className="text-xs font-extrabold text-white truncate">
              {selectedDoc ? selectedDoc.title : "PDF Reader"}
            </h2>
            <p className="text-[9px] text-slate-400 font-mono">
              {selectedDoc ? `Page ${currentPage} of ${selectedDoc.totalPages}` : "Document Viewer"}
            </p>
          </div>
        </div>

        {selectedDoc && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              title="Toggle Night Reader Mode"
            >
              {isNightMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
            </button>

            <button
              onClick={() => setShowToc(!showToc)}
              className={`p-1.5 rounded-lg border cursor-pointer ${
                showToc ? "bg-rose-950 text-rose-300 border-rose-800" : "bg-slate-950 text-slate-300 border-slate-800"
              }`}
              title="Table of Contents"
            >
              <List size={14} />
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold cursor-pointer"
              title="Download PDF"
            >
              {downloaded ? <Check size={14} /> : <Download size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* DOCUMENT SELECTION LIBRARY VIEW */}
      {!selectedDoc ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/30 space-y-1">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen size={15} className="text-rose-400" />
              Document Vault
            </h3>
            <p className="text-[10px] text-slate-300">
              Select a system specification document or user guide to open in reader.
            </p>
          </div>

          <div className="space-y-2">
            {PDF_LIBRARY.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  setCurrentPage(1);
                  setZoomLevel(100);
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all flex items-center justify-between shadow-md group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-white truncate group-hover:text-rose-300 transition-colors">
                      {doc.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {doc.author} • {doc.sizeMb} • {doc.totalPages} Pages
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2.5 py-1 rounded-xl border border-rose-800 shrink-0">
                  Open PDF
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* PDF READER CANVAS VIEW */
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Reader Toolbar */}
          <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-400 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-200">
                {currentPage} / {selectedDoc.totalPages}
              </span>
              <button
                disabled={currentPage >= selectedDoc.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Table of Contents Drawer */}
          {showToc && (
            <div className="absolute top-10 left-0 right-0 z-20 bg-slate-900 border-b border-slate-800 p-3 shadow-2xl space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Table of Contents</h4>
              <div className="space-y-1">
                {selectedDoc.toc.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => {
                      setCurrentPage(item.page);
                      setShowToc(false);
                    }}
                    className={`w-full text-left p-1.5 rounded-lg text-xs flex justify-between cursor-pointer ${
                      currentPage === item.page ? "bg-rose-950 text-rose-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.title}</span>
                    <span className="font-mono text-slate-500">Page {item.page}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actual PDF Page Canvas */}
          <div className={`flex-1 overflow-auto p-4 flex justify-center ${isNightMode ? "bg-slate-950" : "bg-slate-200"}`}>
            <div
              className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl transition-all space-y-4 ${
                isNightMode
                  ? "bg-slate-900 text-slate-100 border border-slate-800"
                  : "bg-white text-slate-900 border border-slate-300"
              }`}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            >
              {/* Document Header */}
              <div className="border-b pb-3 flex justify-between items-center text-[10px] font-mono opacity-60">
                <span>{selectedDoc.title}</span>
                <span>Page {currentPage}</span>
              </div>

              {/* Page Content */}
              {activePageData ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold">{activePageData.heading}</h2>
                  <p className="text-xs leading-relaxed opacity-90 whitespace-pre-line">{activePageData.body}</p>

                  {activePageData.callout && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-xs font-medium">
                      {activePageData.callout}
                    </div>
                  )}

                  {activePageData.codeSnippet && (
                    <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto border border-slate-800">
                      <code>{activePageData.codeSnippet}</code>
                    </pre>
                  )}
                </div>
              ) : (
                <p className="text-xs italic opacity-50">Page content loading...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
