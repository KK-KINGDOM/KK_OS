import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Pin,
  CheckSquare,
  Tag,
  Copy,
  Check,
  Folder,
  ChevronLeft,
  Share2,
  Edit2,
  Cloud,
  CloudCheck,
  UserCheck,
  Loader2
} from "lucide-react";
import { auth, onAuthStateChanged, getUserNotes, saveUserNote, signInWithGoogle, User } from "../lib/firebase";

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: "Personal" | "Work" | "Ideas" | "Checklist";
  pinned: boolean;
  colorHex: string;
  checklist?: ChecklistItem[];
  updatedAt: string;
}

const NOTE_COLORS = [
  { name: "Teal", hex: "#0f766e" },
  { name: "Purple", hex: "#6b21a8" },
  { name: "Amber", hex: "#b45309" },
  { name: "Rose", hex: "#be123c" },
  { name: "Blue", hex: "#1d4ed8" }
];

const INITIAL_NOTES: Note[] = [
  {
    id: "note-1",
    title: "KK OS System Roadmap & Core Requirements",
    content: "1. Add dark mode light filter scheduler.\n2. Add App Cache cleaner in Task Manager.\n3. Integrate Translator, Voice Recorder, Dictionary, Notes, PDF Reader, Emergency SOS, QR Scanner, Chess, Puzzle Game, and Brain Training apps.\n4. Force SafeSearch as browser default.",
    category: "Work",
    pinned: true,
    colorHex: "#0f766e",
    updatedAt: "Today, 10:20 AM"
  },
  {
    id: "note-2",
    title: "Weekend Grocery List",
    content: "",
    category: "Checklist",
    pinned: false,
    colorHex: "#b45309",
    checklist: [
      { id: "c1", text: "Fresh Organic Vegetables", done: true },
      { id: "c2", text: "Almond Milk & Coffee Beans", done: true },
      { id: "c3", text: "Whole Grain Bread", done: false },
      { id: "c4", text: "Greek Yogurt", done: false }
    ],
    updatedAt: "Yesterday"
  },
  {
    id: "note-3",
    title: "App Idea: AI Brain Training Exercises",
    content: "Build a cognitive exercise app with 3 minigames: Memory Matrix, Mental Math Sprint, and Stroop Color Test. Keep track of daily focus streaks!",
    category: "Ideas",
    pinned: false,
    colorHex: "#6b21a8",
    updatedAt: "21 Jul 2026"
  }
];

export default function AppNotes() {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem("kk_os_notes");
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch (e) {
      return INITIAL_NOTES;
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [copied, setCopied] = useState(false);

  // New Note State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"Personal" | "Work" | "Ideas" | "Checklist">("Personal");
  const [colorHex, setColorHex] = useState("#0f766e");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");

  // Sync with Auth State & Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          setIsSyncing(true);
          const firestoreNotes = await getUserNotes(currentUser.uid);
          if (firestoreNotes && firestoreNotes.length > 0) {
            const mapped: Note[] = firestoreNotes.map((fn) => ({
              id: fn.id || `note-${Date.now()}`,
              title: fn.title || "Untitled Note",
              content: fn.content || "",
              category: fn.category || "Personal",
              pinned: fn.pinned || false,
              colorHex: fn.colorHex || "#0f766e",
              checklist: fn.checklist || undefined,
              updatedAt: fn.updatedAt
                ? new Date(fn.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Cloud Synced"
            }));
            setNotes(mapped);
          }
        } catch (e) {
          console.error("Error fetching Firestore notes:", e);
        } finally {
          setIsSyncing(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kk_os_notes", JSON.stringify(notes));
    } catch (e) {}
  }, [notes]);

  const handleOpenEditor = (noteToEdit?: Note) => {
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setCategory(noteToEdit.category);
      setColorHex(noteToEdit.colorHex);
      setChecklistItems(noteToEdit.checklist || []);
    } else {
      setEditingNote({
        id: `note-${Date.now()}`,
        title: "",
        content: "",
        category: "Personal",
        pinned: false,
        colorHex: "#0f766e",
        updatedAt: "Just Now"
      });
      setTitle("");
      setContent("");
      setCategory("Personal");
      setColorHex("#0f766e");
      setChecklistItems([]);
    }
  };

  const handleSaveNote = async () => {
    if (!editingNote || (!title.trim() && !content.trim() && checklistItems.length === 0)) return;

    const updatedNote: Note = {
      ...editingNote,
      title: title.trim() || "Untitled Note",
      content: content,
      category: category,
      colorHex: colorHex,
      checklist: category === "Checklist" ? checklistItems : undefined,
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setNotes((prev) => {
      const exists = prev.some((n) => n.id === updatedNote.id);
      if (exists) {
        return prev.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      }
      return [updatedNote, ...prev];
    });

    if (user) {
      try {
        setIsSyncing(true);
        const notePayload = `${updatedNote.content}${
          updatedNote.checklist ? "\n" + updatedNote.checklist.map((c) => `- [${c.done ? "x" : " "}] ${c.text}`).join("\n") : ""
        }`;
        await saveUserNote(user.uid, updatedNote.title, notePayload);
      } catch (err) {
        console.error("Firestore note save failed:", err);
      } finally {
        setIsSyncing(false);
      }
    }

    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingNote?.id === id) setEditingNote(null);
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleToggleChecklistItem = (noteId: string, itemId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId && n.checklist) {
          return {
            ...n,
            checklist: n.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c))
          };
        }
        return n;
      })
    );
  };

  const handleAddChecklistItemToEditor = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, text: newChecklistText.trim(), done: false }
    ]);
    setNewChecklistText("");
  };

  const handleCopyNoteText = (note: Note) => {
    const fullText = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesCategory = activeCategory === "All" || n.category === activeCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      n.title.toLowerCase().includes(term) ||
      n.content.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {editingNote ? (
            <button
              onClick={() => setEditingNote(null)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer mr-1"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div className="p-1.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
              <FileText size={18} />
            </div>
          )}
          <div>
            <h2 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>{editingNote ? "Note Editor" : "KK Notes"}</span>
              {user ? (
                <span className="text-[8.5px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800 flex items-center gap-1 font-bold">
                  {isSyncing ? <Loader2 size={10} className="animate-spin" /> : <CloudCheck size={10} />}
                  <span>Firestore Active</span>
                </span>
              ) : (
                <button
                  onClick={() => signInWithGoogle().catch(() => {})}
                  className="text-[8.5px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800 flex items-center gap-1 font-bold cursor-pointer hover:bg-amber-900"
                  title="Sign in with Google to enable Firestore cloud note persistence"
                >
                  <UserCheck size={10} />
                  <span>Google Sign In</span>
                </button>
              )}
            </h2>
            <p className="text-[9px] text-slate-400 font-mono">
              {editingNote ? "Rich Markdown & Checklist" : `${notes.length} Notes • ${user ? user.email : "Local Cache Mode"}`}
            </p>
          </div>
        </div>

        {!editingNote && (
          <button
            onClick={() => handleOpenEditor()}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>New Note</span>
          </button>
        )}
      </div>

      {/* EDITOR VIEW */}
      {editingNote ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950">
          {/* Note Title & Color Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title..."
                className="w-full bg-transparent text-lg font-black text-white placeholder-slate-500 outline-none"
              />

              {/* Category Dropdown */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400 px-2.5 py-1 rounded-xl outline-none cursor-pointer"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Ideas">Ideas</option>
                <option value="Checklist">Checklist</option>
              </select>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">Tag Color:</span>
              <div className="flex gap-1.5">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColorHex(c.hex)}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-transform ${
                      colorHex === c.hex ? "scale-125 ring-2 ring-white" : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex, borderColor: "rgba(255,255,255,0.2)" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Checklist Mode */}
          {category === "Checklist" ? (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Interactive Checklist Items
              </span>

              {/* Add Item Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddChecklistItemToEditor()}
                  placeholder="Add item..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddChecklistItemToEditor}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 pt-1">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-850">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() =>
                          setChecklistItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i))
                          )
                        }
                        className="accent-amber-500 rounded"
                      />
                      <span className={item.done ? "line-through text-slate-500" : ""}>{item.text}</span>
                    </label>

                    <button
                      onClick={() => setChecklistItems((prev) => prev.filter((i) => i.id !== item.id))}
                      className="text-slate-500 hover:text-rose-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Regular Body Text Area */
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-2xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none leading-relaxed"
            />
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => handleDeleteNote(editingNote.id)}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Delete
            </button>

            <button
              onClick={handleSaveNote}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* MAIN NOTES LIST VIEW */
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes & checklists..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["All", "Personal", "Work", "Ideas", "Checklist"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl border text-[10px] font-bold shrink-0 cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notes Grid / Cards */}
          {sortedNotes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <p>No notes found in this category.</p>
              <p className="text-[10px]">Tap "New Note" above to write one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {sortedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleOpenEditor(note)}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-2 relative shadow-md group"
                >
                  {/* Category Accent Stripe */}
                  <div
                    className="absolute top-0 left-3 right-3 h-1 rounded-t-full"
                    style={{ backgroundColor: note.colorHex }}
                  />

                  {/* Note Header */}
                  <div className="flex items-start justify-between pt-1">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-extrabold text-white truncate">{note.title}</h3>
                        <span
                          className="text-[8px] font-mono px-1.5 py-0.2 rounded text-white font-bold"
                          style={{ backgroundColor: note.colorHex }}
                        >
                          {note.category}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{note.updatedAt}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(note.id);
                        }}
                        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                          note.pinned ? "text-amber-400 bg-amber-950" : "text-slate-600 hover:text-slate-400"
                        }`}
                        title={note.pinned ? "Unpin Note" : "Pin Note to Top"}
                      >
                        <Pin size={13} className={note.pinned ? "fill-amber-400" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Content Preview / Checklist Preview */}
                  {note.category === "Checklist" && note.checklist ? (
                    <div className="space-y-1 pt-1">
                      {note.checklist.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-[11px]">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleChecklistItem(note.id, item.id);
                            }}
                            className="accent-amber-500 rounded cursor-pointer"
                          />
                          <span className={item.done ? "line-through text-slate-500" : "text-slate-300"}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                      {note.checklist.length > 3 && (
                        <p className="text-[9px] text-amber-400 font-mono">
                          +{note.checklist.length - 3} more items...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {note.content || "Empty note content."}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
