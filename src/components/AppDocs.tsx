import React, { useState } from "react";
import {
  FileText,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  Share2,
  Check,
  Plus,
  BookOpen
} from "lucide-react";

interface DocItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function AppDocs() {
  const loadDocs = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kk_docs");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [
      {
        id: "d1",
        title: "KK OS System Specification",
        content: "KK OS is a modular, high-performance web-based mobile operating system.\n\nKey Highlights:\n- Full Client-Side React 18 Engine\n- Multi-Model AI Ecosystem (ChatGPT, Claude, Gemini, Grok)\n- Real-Time Google Workspace Applications\n- Isolated Sandboxed Security Kernel",
        updatedAt: "Today, 10:30 AM"
      },
      {
        id: "d2",
        title: "Q3 Product Strategy",
        content: "Objectives for Q3:\n1. Expand cloud file synchronization across Google Drive.\n2. Enhance real-time video calls in Google Meet.\n3. Integrate live calendar reminders into LockScreen widgets.",
        updatedAt: "Yesterday"
      }
    ];
  };

  const [docs, setDocs] = React.useState<DocItem[]>(loadDocs);
  const [activeDocIdx, setActiveDocIdx] = React.useState(0);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const activeDoc = docs[activeDocIdx] || docs[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kk_docs", JSON.stringify(docs));
    }
  }, [docs]);

  React.useEffect(() => {
    const handleDocSaved = () => {
      const newDocs = loadDocs();
      setDocs(newDocs);
      setActiveDocIdx(newDocs.length - 1);
      showToast("Document synced from AI!");
    };
    window.addEventListener("kk_doc_saved", handleDocSaved);
    return () => window.removeEventListener("kk_doc_saved", handleDocSaved);
  }, []);

  const updateDocContent = (val: string) => {
    setDocs((prev) => {
      const next = [...prev];
      if (next[activeDocIdx]) {
        next[activeDocIdx] = { ...next[activeDocIdx], content: val };
      }
      return next;
    });
  };

  const createNewDoc = () => {
    const newD: DocItem = {
      id: Date.now().toString(),
      title: `Untitled Document ${docs.length + 1}`,
      content: "Start typing your document here...",
      updatedAt: "Just now"
    };
    setDocs([...docs, newD]);
    setActiveDocIdx(docs.length);
    showToast("Created new document");
  };

  const wordCount = activeDoc.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Header */}
      <div className="p-2.5 bg-blue-950/90 border-b border-blue-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow">
            <FileText size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs text-white">Google Docs</span>
            <span className="text-[9px] text-blue-300 font-mono">{activeDoc.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={createNewDoc}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={12} /> New Doc
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="p-1.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-slate-300 overflow-x-auto shrink-0">
        <button onClick={() => showToast("Applied Bold")} className="p-1 hover:bg-slate-800 rounded">
          <Bold size={14} />
        </button>
        <button onClick={() => showToast("Applied Italic")} className="p-1 hover:bg-slate-800 rounded">
          <Italic size={14} />
        </button>
        <button onClick={() => showToast("Applied Underline")} className="p-1 hover:bg-slate-800 rounded">
          <Underline size={14} />
        </button>
        <div className="w-px h-4 bg-slate-800" />
        <button onClick={() => showToast("Left Aligned")} className="p-1 hover:bg-slate-800 rounded">
          <AlignLeft size={14} />
        </button>
        <button onClick={() => showToast("Center Aligned")} className="p-1 hover:bg-slate-800 rounded">
          <AlignCenter size={14} />
        </button>
        <button onClick={() => showToast("Right Aligned")} className="p-1 hover:bg-slate-800 rounded">
          <AlignRight size={14} />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg z-30">
          {toastMsg}
        </div>
      )}

      {/* Document Selector Header Pills */}
      <div className="p-2 bg-slate-900/60 border-b border-slate-850 flex items-center gap-2 overflow-x-auto shrink-0">
        {docs.map((doc, idx) => (
          <button
            key={doc.id}
            onClick={() => setActiveDocIdx(idx)}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
              activeDocIdx === idx
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {doc.title}
          </button>
        ))}
      </div>

      {/* Editor Document Area */}
      <div className="flex-1 p-3 bg-slate-900 overflow-y-auto flex justify-center">
        <textarea
          value={activeDoc.content}
          onChange={(e) => updateDocContent(e.target.value)}
          placeholder="Start typing your document..."
          className="w-full max-w-md h-full bg-slate-950 text-slate-100 p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-blue-500 font-sans text-xs leading-relaxed resize-none shadow-xl"
        />
      </div>

      {/* Footer Word Count */}
      <div className="p-1.5 bg-slate-950 border-t border-slate-850 flex items-center justify-between text-[9px] font-mono text-slate-400 shrink-0">
        <span>Google Docs Document Reader</span>
        <span>{wordCount} words • Saved to Cloud</span>
      </div>
    </div>
  );
}
