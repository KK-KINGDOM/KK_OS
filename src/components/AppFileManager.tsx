import React, { useState, useEffect } from "react";
import {
  Folder,
  FileCode,
  ArrowLeft,
  HardDrive,
  FileText,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Music,
  FileCheck,
  Download,
  Box,
  Archive,
  Star,
  Search,
  CloudUpload,
  CloudCheck,
  Cloud,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Loader2,
  Database,
  ExternalLink,
  UserCheck,
  PieChart,
  Layers,
  Cpu,
  Smartphone,
  Sparkles,
  Info,
  Sliders,
  BaggageClaim,
  Mic,
  MicOff,
  Volume2,
  X
} from "lucide-react";
import { OSFile } from "../types";
import { KK_OS_FILE_TREE } from "../mockOSData";
import {
  getDynamicFileTree,
  getTotalCacheSizeMB,
  cleanAllCache,
  addCacheUpdatedListener
} from "../utils/fileSystem";
import StorageManagerModal from "./StorageManagerModal";
import {
  auth,
  onAuthStateChanged,
  syncFileToCloud,
  getBackedUpFiles,
  deleteBackedUpFileFromCloud,
  signInWithGoogle,
  User
} from "../lib/firebase";
import { triggerHapticVibration } from "../utils/haptics";
import { useDictation } from "../hooks/useDictation";

export default function AppFileManager() {
  const [viewMode, setViewMode] = useState<"categories" | "tree" | "cloud">("categories");
  const [currentPath, setCurrentPath] = useState<string>("/KK-Mobile-OS");
  const [selectedFile, setSelectedFile] = useState<OSFile | null>(null);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState<boolean>(false);

  // Search & Voice Dictation State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    isListening: isSearchDictating,
    interimTranscript: searchInterim,
    micVolume: searchMicVolume,
    error: searchDictationError,
    toggleListening: toggleSearchDictation,
    stopListening: stopSearchDictation
  } = useDictation({
    onTranscriptChange: (text) => {
      setSearchQuery(text.trim());
    }
  });

  // Dynamic File System & Cache State
  const [activeFileTree, setActiveFileTree] = useState<OSFile>(() => getDynamicFileTree());
  const [totalCacheMB, setTotalCacheMB] = useState<number>(() => getTotalCacheSizeMB());

  // Helper to recursively collect all files in active tree
  const getAllFilesFromTree = (node: OSFile, pathAcc = ""): { file: OSFile; path: string }[] => {
    let result: { file: OSFile; path: string }[] = [];
    const fullPath = `${pathAcc}/${node.name}`.replace(/\/+/g, "/");

    if (node.type === "file") {
      result.push({ file: node, path: fullPath });
    } else if (node.children) {
      for (const child of node.children) {
        result = result.concat(getAllFilesFromTree(child, fullPath));
      }
    }
    return result;
  };

  const allSystemFiles = getAllFilesFromTree(activeFileTree);
  const matchingSearchResults = searchQuery.trim()
    ? allSystemFiles.filter(({ file, path }) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.content && file.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  useEffect(() => {
    const updateTree = () => {
      setActiveFileTree(getDynamicFileTree());
      const remainingMB = getTotalCacheSizeMB();
      setTotalCacheMB(remainingMB);
    };
    updateTree();
    const unsubscribe = addCacheUpdatedListener(updateTree);
    return () => unsubscribe();
  }, []);

  // Firebase Cloud Storage & Sync States
  const [user, setUser] = useState<User | null>(null);
  const [cloudFiles, setCloudFiles] = useState<any[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const [syncingFileName, setSyncingFileName] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncToast, setSyncToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Disk Usage Visualization State
  const [selectedStorageCategory, setSelectedStorageCategory] = useState<"system" | "apps" | "userData" | "free" | null>(null);
  const [isCleaningDisk, setIsCleaningDisk] = useState<boolean>(false);

  // Storage Stats (in GB)
  const totalCapacityGB = 128;
  const systemSizeGB = 18.4;
  const appsSizeGB = 28.6;
  const cacheGB = Number((totalCacheMB / 1000).toFixed(1));
  const userDataSizeGB = 32.1 + cacheGB;
  const usedStorageGB = systemSizeGB + appsSizeGB + userDataSizeGB;
  const freeStorageGB = totalCapacityGB - usedStorageGB;

  const systemPct = (systemSizeGB / totalCapacityGB) * 100;
  const appsPct = (appsSizeGB / totalCapacityGB) * 100;
  const userDataPct = (userDataSizeGB / totalCapacityGB) * 100;
  const freePct = (freeStorageGB / totalCapacityGB) * 100;

  const handleCleanDiskCache = () => {
    triggerHapticVibration("medium");
    setIsCleaningDisk(true);
    setTimeout(() => {
      setIsCleaningDisk(false);
      const freedMB = cleanAllCache();
      triggerHapticVibration("heavy");
      showToast(`Cleaned ${(freedMB / 1000).toFixed(1)} GB of cache files from /KK-Mobile-OS/cache/!`, "success");
    }, 1200);
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchCloudVault(currentUser.uid);
      } else {
        // Load fallback local demo synced files
        loadLocalCloudFiles();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadLocalCloudFiles = () => {
    try {
      const local = localStorage.getItem("kk_cloud_backed_files");
      if (local) {
        setCloudFiles(JSON.parse(local));
      } else {
        // Initial sample
        const initial = [
          {
            id: "local_demo_1",
            fileName: "System_Config.json",
            filePath: "/KK-Mobile-OS/System/Config.json",
            fileSize: "1.2 KB",
            fileType: "JSON",
            backedUpAt: new Date(Date.now() - 3600000).toISOString(),
            content: `{\n  "os": "KK-Mobile-OS",\n  "version": "1.0.4",\n  "status": "backed_up"\n}`
          }
        ];
        setCloudFiles(initial);
      }
    } catch (e) {}
  };

  const fetchCloudVault = async (uid: string) => {
    setIsLoadingCloud(true);
    try {
      const docs = await getBackedUpFiles(uid);
      setCloudFiles(docs);
    } catch (err) {
      console.error("Cloud vault fetch error:", err);
      loadLocalCloudFiles();
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setSyncToast({ message, type });
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Sync a single file to Firestore Cloud Storage
  const handleSyncFileToCloud = async (file: {
    fileName: string;
    filePath: string;
    fileSize: string;
    fileType: string;
    content?: string;
  }) => {
    triggerHapticVibration("medium");
    setSyncingFileName(file.fileName);

    try {
      const uid = user ? user.uid : "guest_user";
      if (user) {
        await syncFileToCloud(uid, file);
        await fetchCloudVault(user.uid);
      } else {
        // Guest mode fallback persistence
        const newDoc = {
          id: `cloud_file_${Date.now()}`,
          uid: "guest_user",
          fileName: file.fileName,
          filePath: file.filePath,
          fileSize: file.fileSize,
          fileType: file.fileType,
          content: file.content || "// Backed up file data",
          backedUpAt: new Date().toISOString()
        };
        const updated = [newDoc, ...cloudFiles.filter((f) => f.filePath !== file.filePath)];
        setCloudFiles(updated);
        try {
          localStorage.setItem("kk_cloud_backed_files", JSON.stringify(updated));
        } catch (e) {}
      }

      triggerHapticVibration("heavy");
      showToast(`Synced '${file.fileName}' to Firestore Cloud Storage!`, "success");
    } catch (err) {
      console.error("File cloud sync failed:", err);
      showToast(`Failed to sync '${file.fileName}' to Firestore.`, "error");
    } finally {
      setSyncingFileName(null);
    }
  };

  // Bulk Sync All Files to Cloud
  const handleSyncAllFiles = async () => {
    triggerHapticVibration("heavy");
    setIsSyncingAll(true);
    setSyncProgress(10);

    const filesToSync = [
      {
        fileName: "IMG_20240507.jpg",
        filePath: "/KK-Mobile-OS/Gallery/IMG_20240507.jpg",
        fileSize: "2.4 MB",
        fileType: "Image",
        content: "// Binary Image Data Stream"
      },
      {
        fileName: "Project_Report.pdf",
        filePath: "/KK-Mobile-OS/Documents/Project_Report.pdf",
        fileSize: "1.8 MB",
        fileType: "Document",
        content: "# KK OS Development Specification\nStatus: Finalized\nSecurity: Encrypted"
      },
      {
        fileName: "Notes.txt",
        filePath: "/KK-Mobile-OS/Notes.txt",
        fileSize: "924 B",
        fileType: "Text",
        content: "Reminders: Backup system logs to Firestore regularly."
      },
      {
        fileName: "Kernel.sys",
        filePath: "/KK-Mobile-OS/System/Kernel.sys",
        fileSize: "12.8 MB",
        fileType: "System",
        content: "// KK Mobile OS Kernel Boot Vector"
      }
    ];

    const uid = user ? user.uid : "guest_user";

    for (let i = 0; i < filesToSync.length; i++) {
      const file = filesToSync[i];
      setSyncProgress(25 + Math.round(((i + 1) / filesToSync.length) * 70));
      try {
        if (user) {
          await syncFileToCloud(uid, file);
        } else {
          const newDoc = {
            id: `cloud_file_${Date.now()}_${i}`,
            uid: "guest_user",
            ...file,
            backedUpAt: new Date().toISOString()
          };
          setCloudFiles((prev) => [newDoc, ...prev.filter((f) => f.filePath !== file.filePath)]);
        }
      } catch (err) {
        console.error("Bulk sync error:", err);
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (user) {
      await fetchCloudVault(user.uid);
    } else {
      try {
        localStorage.setItem("kk_cloud_backed_files", JSON.stringify(cloudFiles));
      } catch (e) {}
    }

    setSyncProgress(100);
    setTimeout(() => {
      setIsSyncingAll(false);
      setSyncProgress(0);
      showToast(`Cloud Backup Complete: ${filesToSync.length} files secured in Firestore!`, "success");
    }, 400);
  };

  // Delete backed up file
  const handleDeleteCloudFile = async (docId: string, fileName: string) => {
    triggerHapticVibration("medium");
    try {
      if (user) {
        await deleteBackedUpFileFromCloud(docId);
        await fetchCloudVault(user.uid);
      } else {
        const updated = cloudFiles.filter((f) => f.id !== docId);
        setCloudFiles(updated);
        localStorage.setItem("kk_cloud_backed_files", JSON.stringify(updated));
      }
      showToast(`Deleted '${fileName}' from Cloud Vault.`, "info");
    } catch (err) {
      console.error("Delete cloud backup error:", err);
      showToast(`Failed to delete '${fileName}'.`, "error");
    }
  };

  const categories = [
    { name: "Images", icon: ImageIcon, color: "bg-cyan-900/40 text-cyan-400 border-cyan-800/40" },
    { name: "Videos", icon: Video, color: "bg-indigo-900/40 text-indigo-400 border-indigo-800/40" },
    { name: "Audio", icon: Music, color: "bg-rose-900/40 text-rose-400 border-rose-800/40" },
    { name: "Documents", icon: FileCheck, color: "bg-emerald-900/40 text-emerald-400 border-emerald-800/40" },
    { name: "Downloads", icon: Download, color: "bg-amber-900/40 text-amber-400 border-amber-800/40" },
    { name: "APK", icon: Box, color: "bg-teal-900/40 text-teal-400 border-teal-800/40" },
    { name: "Compressed", icon: Archive, color: "bg-purple-900/40 text-purple-400 border-purple-800/40" },
    { name: "Favorites", icon: Star, color: "bg-yellow-900/40 text-yellow-400 border-yellow-800/40" }
  ];

  const recentFiles = [
    {
      fileName: "IMG_20240507.jpg",
      filePath: "/KK-Mobile-OS/Gallery/IMG_20240507.jpg",
      fileSize: "2.4 MB",
      fileType: "Image",
      icon: ImageIcon,
      content: "// Binary Image Stream Payload"
    },
    {
      fileName: "Project_Report.pdf",
      filePath: "/KK-Mobile-OS/Documents/Project_Report.pdf",
      fileSize: "1.8 MB",
      fileType: "Document",
      icon: FileCheck,
      content: "KK Mobile OS Architecture and Cloud Firestore Integration"
    },
    {
      fileName: "Notes.txt",
      filePath: "/KK-Mobile-OS/Notes.txt",
      fileSize: "924 B",
      fileType: "Text",
      icon: FileText,
      content: "System credentials and Firestore backup configuration notes."
    }
  ];

  // Helper to find tree node
  const findNodeByPath = (path: string): OSFile | null => {
    if (path === "/KK-Mobile-OS") return activeFileTree;
    const parts = path.split("/").filter(Boolean);
    if (parts[0] !== "KK-Mobile-OS") return null;

    let currentNode = activeFileTree;
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!currentNode.children) return null;
      const found = currentNode.children.find((child) => child.name === part);
      if (!found) return null;
      currentNode = found;
    }
    return currentNode;
  };

  const currentNode = findNodeByPath(currentPath) || activeFileTree;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden" id="file-manager-app">
      {/* Toast Notification Banner */}
      {syncToast && (
        <div className="absolute top-12 left-3 right-3 z-50 animate-fadeIn">
          <div
            className={`p-2.5 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center justify-between text-xs font-bold ${
              syncToast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                : syncToast.type === "error"
                ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
                : "bg-slate-900/90 border-cyan-500/50 text-cyan-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {syncToast.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              ) : syncToast.type === "error" ? (
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
              ) : (
                <Cloud size={16} className="text-cyan-400 shrink-0" />
              )}
              <span className="truncate">{syncToast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <HardDrive size={18} className="text-teal-400" />
          <div>
            <h2 className="text-sm font-bold text-white leading-none">KK Files</h2>
            <span className="text-[9px] font-mono text-slate-400">
              {user ? user.email : "Guest Mode (Local Cloud Vault)"}
            </span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode("categories")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
              viewMode === "categories" ? "bg-slate-800 text-teal-400" : "text-slate-400 hover:text-white"
            }`}
          >
            Storage
          </button>
          <button
            onClick={() => setViewMode("tree")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
              viewMode === "tree" ? "bg-slate-800 text-teal-400" : "text-slate-400 hover:text-white"
            }`}
          >
            Explorer
          </button>
          <button
            onClick={() => setViewMode("cloud")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
              viewMode === "cloud" ? "bg-teal-950 border border-teal-500/40 text-teal-300" : "text-slate-400 hover:text-white"
            }`}
          >
            <Cloud size={12} />
            <span>Vault ({cloudFiles.length})</span>
          </button>
        </div>
      </div>

      {/* Voice Search & Dictation Toolbar */}
      <div className="p-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 shrink-0">
        <div className="relative flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-2.5 py-1.5 focus-within:border-teal-500 transition-all">
          <Search size={14} className="text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isSearchDictating ? "Listening... dictate file name..." : "Search files or dictate with voice..."}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] text-slate-400 hover:text-white px-1 ml-1 cursor-pointer"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          onClick={toggleSearchDictation}
          title={isSearchDictating ? "Stop Voice Search Dictation" : "Dictate Search Terms"}
          className={`px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 transition-all cursor-pointer text-xs font-bold ${
            isSearchDictating
              ? "bg-rose-600 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-900/50"
              : "bg-slate-800 border-slate-700 text-teal-400 hover:bg-slate-750"
          }`}
        >
          {isSearchDictating ? <MicOff size={14} /> : <Mic size={14} />}
          <span className="hidden sm:inline">{isSearchDictating ? "Listening..." : "Dictate"}</span>
        </button>
      </div>

      {/* Search Dictation Active Banner */}
      {isSearchDictating && (
        <div className="bg-teal-950/90 border-b border-teal-500/40 p-2 px-3 flex items-center justify-between text-xs text-teal-200 shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2 truncate">
            <div className="relative flex items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
              <Mic size={14} className="text-rose-400 relative z-10" />
            </div>
            <span className="font-extrabold text-white">Voice Dictation:</span>
            <span className="text-teal-300 italic truncate font-mono">
              "{searchInterim || searchQuery || "Speak file name..."}"
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0 ml-2">
            <Volume2 size={12} className="text-teal-400" />
            <div className="w-10 h-1.5 bg-teal-900/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-100"
                style={{ width: `${Math.max(10, searchMicVolume)}%` }}
              />
            </div>
            <button
              onClick={stopSearchDictation}
              className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded cursor-pointer font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {searchDictationError && (
        <div className="bg-rose-950/90 border-b border-rose-800 p-2 px-3 text-xs text-rose-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} className="text-rose-400 shrink-0" />
            <span>{searchDictationError}</span>
          </div>
          <button
            onClick={() => toggleSearchDictation()}
            className="text-[10px] text-teal-300 underline font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Voice Search Results View or Tab View */}
      {searchQuery.trim().length > 0 ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Search size={14} className="text-teal-400" />
              <h3 className="text-xs font-bold text-white">
                Voice Search Results for <span className="text-teal-300 font-mono">"{searchQuery}"</span>
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {matchingSearchResults.length} matches found
            </span>
          </div>

          {matchingSearchResults.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
              <Search size={28} className="text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-400">No files found matching "{searchQuery}"</p>
              <p className="text-[10px] text-slate-500">Try dictating words like "System", "Report", "Image", "PDF", "Notes", "Cache", "Config"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {matchingSearchResults.map(({ file, path }, idx) => {
                const isSynced = cloudFiles.some((cf) => cf.filePath === path || cf.fileName === file.name);

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-950 text-teal-400 border border-slate-800">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{file.name}</h4>
                        <p className="text-[9.5px] font-mono text-slate-400 truncate max-w-[200px]">{path}</p>
                        <p className="text-[9px] text-slate-500">{file.size || "1.2 KB"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleSyncFileToCloud({
                            fileName: file.name,
                            filePath: path,
                            fileSize: file.size || "1.2 KB",
                            fileType: "File",
                            content: file.content
                          })
                        }
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all ${
                          isSynced
                            ? "bg-teal-950 text-teal-300 border border-teal-800"
                            : "bg-slate-800 hover:bg-teal-600 hover:text-slate-950 text-slate-300"
                        }`}
                      >
                        {isSynced ? <CloudCheck size={12} /> : <CloudUpload size={12} />}
                        <span>{isSynced ? "Synced" : "Sync"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : viewMode === "categories" ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {/* Cloud Sync Hero Banner */}
          <div className="p-3.5 rounded-3xl bg-slate-900 border border-teal-500/30 space-y-3 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-teal-950 border border-teal-500/30 text-teal-400 shadow-inner">
                  <CloudUpload size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    Firestore Cloud Backup
                    <ShieldCheck size={12} className="text-teal-400" />
                  </h3>
                  <p className="text-[9.5px] text-slate-400">
                    {user ? "Authenticated to persistent storage" : "Sync local files securely to cloud collection"}
                  </p>
                </div>
              </div>

              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800">
                {cloudFiles.length} Synced
              </span>
            </div>

            {/* Sync Progress Bar */}
            {isSyncingAll && (
              <div className="space-y-1 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-teal-400 flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Uploading to Firestore...
                  </span>
                  <span className="text-slate-300 font-mono">{syncProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Sync Action Buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={handleSyncAllFiles}
                disabled={isSyncingAll}
                className="flex-1 py-2 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSyncingAll ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                <span>Sync All Files to Cloud</span>
              </button>

              {!user && (
                <button
                  onClick={() => signInWithGoogle().catch(() => {})}
                  className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-[10px] cursor-pointer border border-slate-700 flex items-center gap-1 active:scale-95"
                  title="Sign in with Google to sync files to your account"
                >
                  <UserCheck size={12} className="text-cyan-400" />
                  <span>Google Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</h3>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setViewMode("tree")}
                    className={`p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-transform hover:scale-102 cursor-pointer ${cat.color}`}
                  >
                    <IconComponent size={18} />
                    <span className="text-[9px] font-bold text-slate-200 truncate max-w-full">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disk Usage Visualization Component */}
          <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                  <PieChart size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    Internal Storage Breakdown
                    <Info size={11} className="text-slate-500 cursor-pointer" title="Calculated from OS partitions & user files" />
                  </h3>
                  <p className="text-[9.5px] text-slate-400">
                    {usedStorageGB.toFixed(1)} GB used of {totalCapacityGB} GB ({((usedStorageGB / totalCapacityGB) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsStorageModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Launch Storage Manager Utility"
                >
                  <HardDrive size={12} className="text-teal-400" />
                  <span>Storage Manager</span>
                </button>

                <button
                  onClick={handleCleanDiskCache}
                  disabled={isCleaningDisk || cacheGB === 0}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                    cacheGB === 0
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-95 shadow"
                  }`}
                >
                  {isCleaningDisk ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : cacheGB === 0 ? (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>{isCleaningDisk ? "Cleaning..." : cacheGB === 0 ? "Optimized" : "Clean Temp Cache"}</span>
                </button>
              </div>
            </div>

            {/* Segmented Multi-Color Disk Meter Bar */}
            <div className="space-y-1">
              <div className="w-full h-3 bg-slate-950 rounded-full p-0.5 border border-slate-800/80 flex overflow-hidden shadow-inner">
                {/* System Segment */}
                <div
                  onClick={() => setSelectedStorageCategory(selectedStorageCategory === "system" ? null : "system")}
                  style={{ width: `${systemPct}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-l-full cursor-pointer hover:brightness-125 transition-all relative group"
                  title={`System: ${systemSizeGB} GB (${systemPct.toFixed(1)}%)`}
                />
                {/* Apps Segment */}
                <div
                  onClick={() => setSelectedStorageCategory(selectedStorageCategory === "apps" ? null : "apps")}
                  style={{ width: `${appsPct}%` }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 cursor-pointer hover:brightness-125 transition-all relative group"
                  title={`Apps: ${appsSizeGB} GB (${appsPct.toFixed(1)}%)`}
                />
                {/* User Data Segment */}
                <div
                  onClick={() => setSelectedStorageCategory(selectedStorageCategory === "userData" ? null : "userData")}
                  style={{ width: `${userDataPct}%` }}
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 cursor-pointer hover:brightness-125 transition-all relative group"
                  title={`User Data: ${userDataSizeGB.toFixed(1)} GB (${userDataPct.toFixed(1)}%)`}
                />
                {/* Free Space Segment */}
                <div
                  onClick={() => setSelectedStorageCategory(selectedStorageCategory === "free" ? null : "free")}
                  style={{ width: `${freePct}%` }}
                  className="h-full bg-slate-800 rounded-r-full cursor-pointer hover:bg-slate-700 transition-all relative group"
                  title={`Free Space: ${freeStorageGB.toFixed(1)} GB (${freePct.toFixed(1)}%)`}
                />
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 px-0.5">
                <span>0 GB</span>
                <span className="text-slate-300 font-bold">{freeStorageGB.toFixed(1)} GB Free ({freePct.toFixed(1)}%)</span>
                <span>{totalCapacityGB} GB</span>
              </div>
            </div>

            {/* Storage Distribution Category Cards */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* System Category */}
              <button
                onClick={() => setSelectedStorageCategory(selectedStorageCategory === "system" ? null : "system")}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedStorageCategory === "system"
                    ? "bg-purple-950/80 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-purple-500/40 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
                    <span className="text-xs font-bold text-white">System</span>
                  </div>
                  <Cpu size={12} className="text-purple-400" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-mono font-extrabold text-white">{systemSizeGB} GB</span>
                  <span className="text-[9px] font-mono text-purple-300 font-bold">{systemPct.toFixed(1)}%</span>
                </div>
                <p className="text-[8.5px] text-slate-400 mt-0.5 truncate">Kernel, OS Libraries, Recovery</p>
              </button>

              {/* Apps Category */}
              <button
                onClick={() => setSelectedStorageCategory(selectedStorageCategory === "apps" ? null : "apps")}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedStorageCategory === "apps"
                    ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
                    <span className="text-xs font-bold text-white">Apps</span>
                  </div>
                  <Smartphone size={12} className="text-cyan-400" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-mono font-extrabold text-white">{appsSizeGB} GB</span>
                  <span className="text-[9px] font-mono text-cyan-300 font-bold">{appsPct.toFixed(1)}%</span>
                </div>
                <p className="text-[8.5px] text-slate-400 mt-0.5 truncate">KK Mobile Apps, Web Runtimes</p>
              </button>

              {/* User Data Category */}
              <button
                onClick={() => setSelectedStorageCategory(selectedStorageCategory === "userData" ? null : "userData")}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedStorageCategory === "userData"
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                    <span className="text-xs font-bold text-white">User Data</span>
                  </div>
                  <Layers size={12} className="text-emerald-400" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-mono font-extrabold text-white">{userDataSizeGB.toFixed(1)} GB</span>
                  <span className="text-[9px] font-mono text-emerald-300 font-bold">{userDataPct.toFixed(1)}%</span>
                </div>
                <p className="text-[8.5px] text-slate-400 mt-0.5 truncate">Photos, Documents, Downloads</p>
              </button>

              {/* Free Space Category */}
              <button
                onClick={() => setSelectedStorageCategory(selectedStorageCategory === "free" ? null : "free")}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedStorageCategory === "free"
                    ? "bg-slate-800/80 border-slate-600 text-slate-200 shadow-md ring-1 ring-slate-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600 shadow-sm" />
                    <span className="text-xs font-bold text-white">Free Space</span>
                  </div>
                  <HardDrive size={12} className="text-slate-400" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-mono font-extrabold text-white">{freeStorageGB.toFixed(1)} GB</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{freePct.toFixed(1)}%</span>
                </div>
                <p className="text-[8.5px] text-slate-400 mt-0.5 truncate">Unallocated Free Storage</p>
              </button>
            </div>

            {/* Interactive Sub-Breakdown Modal/Accordion when category is clicked */}
            {selectedStorageCategory && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 animate-fadeIn space-y-2">
                <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                  <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    {selectedStorageCategory === "system" && <Cpu size={13} className="text-purple-400" />}
                    {selectedStorageCategory === "apps" && <Smartphone size={13} className="text-cyan-400" />}
                    {selectedStorageCategory === "userData" && <Layers size={13} className="text-emerald-400" />}
                    {selectedStorageCategory === "free" && <HardDrive size={13} className="text-slate-400" />}
                    <span>
                      {selectedStorageCategory === "system" && "System Storage Details"}
                      {selectedStorageCategory === "apps" && "App Allocation & Runtime"}
                      {selectedStorageCategory === "userData" && "User Media & Cloud Sync breakdown"}
                      {selectedStorageCategory === "free" && "Available Capacity Breakdown"}
                    </span>
                  </h4>

                  <button
                    onClick={() => setSelectedStorageCategory(null)}
                    className="text-[9px] text-slate-400 hover:text-white px-1.5 py-0.5 bg-slate-900 rounded-md font-mono cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-1.5 text-[10px] font-mono">
                  {selectedStorageCategory === "system" && (
                    <>
                      <div className="flex justify-between text-slate-300">
                        <span>• KK OS Core Kernel & System Daemons</span>
                        <span className="text-purple-300 font-bold">12.8 GB</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>• System Recovery Partition & Firmware</span>
                        <span className="text-purple-300 font-bold">3.4 GB</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>• Virtual Memory Pagefile & Shared Libraries</span>
                        <span className="text-purple-300 font-bold">2.2 GB</span>
                      </div>
                    </>
                  )}

                  {selectedStorageCategory === "apps" && (
                    <>
                      <div className="flex justify-between text-slate-300">
                        <span>• AI Assistant Suites (Gemini, ChatGPT, Claude, Grok)</span>
                        <span className="text-cyan-300 font-bold">10.2 GB</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>• Media, Games & System Utility Apps</span>
                        <span className="text-cyan-300 font-bold">11.8 GB</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>• Web App Engine & Service Worker Storage</span>
                        <span className="text-cyan-300 font-bold">6.6 GB</span>
                      </div>
                    </>
                  )}

                  {selectedStorageCategory === "userData" && (
                    <>
                      <div className="flex justify-between text-slate-300">
                        <span>• Photos & Gallery Videos</span>
                        <span className="text-emerald-300 font-bold">14.2 GB</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>• Documents, PDFs & Text Notes</span>
                        <span className="text-emerald-300 font-bold">8.8 GB</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>• Firestore Cloud Vault Backups</span>
                        <span className="text-emerald-300 font-bold">5.1 GB</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>• Downloads & Saved Archives</span>
                        <span className="text-emerald-300 font-bold">
                          {cacheGB === 0 ? "4.0 GB" : `${(4.0 + cacheGB).toFixed(1)} GB (Includes Temp Cache)`}
                        </span>
                      </div>
                    </>
                  )}

                  {selectedStorageCategory === "free" && (
                    <>
                      <div className="flex justify-between text-slate-300">
                        <span>• Unallocated NVMe Flash Space</span>
                        <span className="text-slate-200 font-bold">{freeStorageGB.toFixed(1)} GB</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[9px]">
                        <span>• Ready for high-speed read/write, apps & media download.</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent Files List with Per-File Sync Action */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local Recent Files</h3>
              <span className="text-[9px] text-slate-500 font-mono">Tap icon to backup to cloud</span>
            </div>

            <div className="space-y-1.5">
              {recentFiles.map((rf, idx) => {
                const IconComponent = rf.icon;
                const isSynced = cloudFiles.some((cf) => cf.filePath === rf.filePath || cf.fileName === rf.fileName);
                const isSyncingThis = syncingFileName === rf.fileName;

                return (
                  <div key={idx} className="p-2.5 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-950 text-teal-400 border border-slate-800">
                        <IconComponent size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{rf.fileName}</h4>
                        <p className="text-[9px] text-slate-400">{rf.fileType} • {rf.fileSize}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSynced ? (
                        <span className="px-2 py-0.5 rounded-full bg-teal-950 border border-teal-500/40 text-teal-300 text-[9px] font-mono font-bold flex items-center gap-1">
                          <CloudCheck size={11} /> Synced
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSyncFileToCloud(rf)}
                          disabled={isSyncingThis}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-teal-600 hover:text-slate-950 text-slate-300 text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                          title="Sync to Cloud Firestore"
                        >
                          {isSyncingThis ? (
                            <Loader2 size={12} className="animate-spin text-teal-400" />
                          ) : (
                            <CloudUpload size={12} />
                          )}
                          <span>Sync</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : viewMode === "tree" ? (
        /* RAW SYSTEM TREE EXPLORER VIEW WITH CLOUD BACKUP ACTION */
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-none">
          <div className="flex items-center justify-between text-[10px] font-mono text-teal-400 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="truncate">{currentPath}</span>
            {currentPath !== "/KK-Mobile-OS" && (
              <button
                onClick={() => {
                  const parts = currentPath.split("/").filter(Boolean);
                  parts.pop();
                  setCurrentPath("/" + parts.join("/"));
                }}
                className="text-[9px] text-slate-400 hover:text-white cursor-pointer px-1.5 py-0.5 bg-slate-800 rounded"
              >
                Up
              </button>
            )}
          </div>

          {selectedFile ? (
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-teal-400" />
                  <span className="text-xs font-bold text-white">{selectedFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleSyncFileToCloud({
                        fileName: selectedFile.name,
                        filePath: `${currentPath}/${selectedFile.name}`,
                        fileSize: "1.5 KB",
                        fileType: "Source",
                        content: selectedFile.content || "// System payload"
                      })
                    }
                    className="px-2.5 py-1 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-extrabold cursor-pointer flex items-center gap-1 shadow"
                  >
                    <CloudUpload size={12} /> Sync to Cloud
                  </button>

                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-[9px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg text-white font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              <pre className="text-[10px] font-mono bg-black p-3 rounded-xl text-slate-300 max-h-56 overflow-auto whitespace-pre border border-slate-900">
                {selectedFile.content || "// Binary/System data"}
              </pre>
            </div>
          ) : (
            <div className="space-y-1.5">
              {currentNode.children?.map((item, idx) => {
                const isSynced = cloudFiles.some((cf) => cf.fileName === item.name);

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between hover:bg-slate-850 transition-colors"
                  >
                    <button
                      onClick={() => {
                        if (item.type === "directory") {
                          setCurrentPath(`${currentPath}/${item.name}`);
                        } else {
                          setSelectedFile(item);
                        }
                      }}
                      className="flex-1 flex items-center gap-2.5 text-left cursor-pointer mr-2"
                    >
                      {item.type === "directory" ? (
                        <Folder size={16} className="text-teal-400 shrink-0" />
                      ) : (
                        <FileText size={16} className="text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-white truncate">{item.name}</span>
                    </button>

                    {item.type !== "directory" && (
                      <button
                        onClick={() =>
                          handleSyncFileToCloud({
                            fileName: item.name,
                            filePath: `${currentPath}/${item.name}`,
                            fileSize: "1.2 KB",
                            fileType: "File",
                            content: item.content
                          })
                        }
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isSynced
                            ? "bg-teal-950 text-teal-400 border border-teal-800"
                            : "bg-slate-800 hover:bg-teal-600 hover:text-slate-950 text-slate-300"
                        }`}
                        title="Sync File to Cloud Firestore"
                      >
                        {isSynced ? <CloudCheck size={13} /> : <CloudUpload size={13} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* CLOUD VAULT VIEW - PERSISTENT FIRESTORE STORAGE */
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-none">
          <div className="p-3 rounded-2xl bg-slate-900 border border-teal-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud size={16} className="text-teal-400" />
              <div>
                <h3 className="text-xs font-extrabold text-white">Firestore Cloud Vault</h3>
                <p className="text-[9px] text-slate-400">Persistent storage collection: 'backed_up_files'</p>
              </div>
            </div>

            <button
              onClick={() => user && fetchCloudVault(user.uid)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 cursor-pointer"
              title="Refresh Vault"
            >
              <RefreshCw size={12} className={isLoadingCloud ? "animate-spin" : ""} />
            </button>
          </div>

          {isLoadingCloud ? (
            <div className="p-8 text-center space-y-2">
              <Loader2 size={24} className="animate-spin text-teal-400 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Querying Firestore database...</p>
            </div>
          ) : cloudFiles.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-3">
              <CloudUpload size={32} className="text-slate-600 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-slate-300">No Cloud Backups Yet</h4>
                <p className="text-[10px] text-slate-500">Tap 'Sync to Cloud' on any file to secure it to Firestore.</p>
              </div>
              <button
                onClick={handleSyncAllFiles}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold cursor-pointer inline-flex items-center gap-1 shadow"
              >
                <UploadCloud size={12} /> Sync Default Files Now
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {cloudFiles.map((cf) => (
                <div
                  key={cf.id}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/50">
                        <FileCheck size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{cf.fileName}</h4>
                        <p className="text-[9px] font-mono text-slate-400 truncate max-w-[160px]">{cf.filePath}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCloudFile(cf.id, cf.fileName)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                      title="Remove from Cloud Vault"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-850/60 text-[9px] font-mono text-slate-400">
                    <span>Size: {cf.fileSize || "1.5 KB"}</span>
                    <span className="text-teal-400 font-bold">
                      {cf.backedUpAt ? new Date(cf.backedUpAt).toLocaleTimeString() : "Recent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Storage Manager Utility Modal */}
      <StorageManagerModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
      />
    </div>
  );
}
