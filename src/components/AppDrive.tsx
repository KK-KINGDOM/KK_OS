import React, { useState } from "react";
import {
  HardDrive,
  Folder,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Plus,
  Search,
  Star,
  MoreVertical,
  UploadCloud,
  Download,
  Share2,
  Trash2,
  Check,
  X
} from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  type: "folder" | "doc" | "sheet" | "slide" | "image" | "pdf";
  size: string;
  updatedAt: string;
  starred: boolean;
}

export default function AppDrive() {
  const [activeTab, setActiveTab] = useState<"my_drive" | "shared" | "starred">("my_drive");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [files, setFiles] = useState<DriveFile[]>([
    { id: "f1", name: "Q3 System Architecture.pdf", type: "pdf", size: "2.4 MB", updatedAt: "Today, 10:15 AM", starred: true },
    { id: "f2", name: "KK OS Financial Plan.xlsx", type: "sheet", size: "1.1 MB", updatedAt: "Yesterday", starred: true },
    { id: "f3", name: "Product Roadmap Deck.pptx", type: "slide", size: "8.5 MB", updatedAt: "Jul 22", starred: false },
    { id: "f4", name: "Project Specifications.docx", type: "doc", size: "450 KB", updatedAt: "Jul 20", starred: false },
    { id: "f5", name: "Kernel Wallpapers", type: "folder", size: "12 items", updatedAt: "Jul 18", starred: false },
    { id: "f6", name: "System_Architecture_Diagram.png", type: "image", size: "3.2 MB", updatedAt: "Jul 15", starred: false }
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f))
    );
    showToast("Updated starred item");
  };

  const addNewFile = () => {
    const newF: DriveFile = {
      id: Date.now().toString(),
      name: `New Document ${files.length + 1}.docx`,
      type: "doc",
      size: "120 KB",
      updatedAt: "Just now",
      starred: false
    };
    setFiles([newF, ...files]);
    showToast("Uploaded 1 file to Google Drive");
  };

  const deleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showToast("Moved file to Trash");
  };

  const getFileIcon = (type: DriveFile["type"]) => {
    switch (type) {
      case "folder": return <Folder size={20} className="text-amber-400 fill-amber-400/20" />;
      case "doc": return <FileText size={20} className="text-blue-400" />;
      case "sheet": return <FileSpreadsheet size={20} className="text-emerald-400" />;
      case "slide": return <Presentation size={20} className="text-amber-500" />;
      case "image": return <ImageIcon size={20} className="text-purple-400" />;
      case "pdf": return <FileText size={20} className="text-rose-400" />;
    }
  };

  const filteredFiles = files.filter((f) => {
    if (activeTab === "starred" && !f.starred) return false;
    return f.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Top Header & Search */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-500 via-emerald-500 to-amber-500 text-white shadow-md">
              <HardDrive size={18} />
            </div>
            <span className="font-extrabold text-sm text-white">Google Drive</span>
          </div>

          <button
            onClick={addNewFile}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} /> New
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Drive files..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 text-xs font-bold text-slate-400 shrink-0">
        <button
          onClick={() => setActiveTab("my_drive")}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === "my_drive" ? "border-blue-500 text-blue-400" : "border-transparent"
          }`}
        >
          My Drive
        </button>
        <button
          onClick={() => setActiveTab("shared")}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === "shared" ? "border-blue-500 text-blue-400" : "border-transparent"
          }`}
        >
          Shared
        </button>
        <button
          onClick={() => setActiveTab("starred")}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === "starred" ? "border-blue-500 text-blue-400" : "border-transparent"
          }`}
        >
          Starred
        </button>
      </div>

      {/* Storage usage bar */}
      <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Storage: 8.2 GB of 15 GB used</span>
        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-[54%]" />
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-lg z-30 animate-in fade-in duration-150">
          {toastMsg}
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => setPreviewFile(file)}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between transition-colors cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                {getFileIcon(file.type)}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white truncate">{file.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {file.size} • {file.updatedAt}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => toggleStar(file.id, e)}
                className="p-1.5 text-slate-400 hover:text-amber-400"
              >
                <Star
                  size={14}
                  className={file.starred ? "text-amber-400 fill-amber-400" : ""}
                />
              </button>
              <button
                onClick={(e) => deleteFile(file.id, e)}
                className="p-1.5 text-slate-400 hover:text-rose-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="absolute inset-0 bg-black/80 z-40 p-4 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {getFileIcon(previewFile.type)}
                <span className="text-xs font-extrabold text-white truncate max-w-[200px]">
                  {previewFile.name}
                </span>
              </div>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center flex flex-col items-center gap-2">
              <span className="text-xs font-mono text-slate-300">File Type: {previewFile.type.toUpperCase()}</span>
              <span className="text-xs font-mono text-slate-400">Size: {previewFile.size}</span>
              <p className="text-[11px] text-slate-400 italic mt-2">
                "Previewing file contents in Google Drive sandboxed reader."
              </p>
            </div>

            <button
              onClick={() => {
                showToast(`Downloaded ${previewFile.name}`);
                setPreviewFile(null);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <Download size={14} /> Download File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
