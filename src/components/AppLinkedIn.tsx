import React, { useState } from "react";
import {
  Share2,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Briefcase,
  Bell,
  Search,
  Plus,
  Heart,
  Award,
  Sparkles,
  Check
} from "lucide-react";

interface Post {
  id: string;
  author: string;
  title: string;
  avatarBg: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  userLiked: boolean;
}

export default function AppLinkedIn() {
  const [activeTab, setActiveTab] = useState<"feed" | "jobs" | "notifications">("feed");
  const [postInput, setPostInput] = useState("");
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "p1",
      author: "Krishna Kumar",
      title: "Lead Mobile Kernel Architect @ KK OS",
      avatarBg: "bg-blue-600",
      timeAgo: "2h • 🌐",
      content: "🚀 Thrilled to announce the launch of KK OS v14.2! Packed with multi-model AI tools (ChatGPT, Claude, Gemini, Grok) and a full Google Workspace suite built directly into client-side React. Built for extreme speed and security! #KKOS #TechInnovation #React #AI",
      likes: 142,
      comments: 18,
      userLiked: false
    },
    {
      id: "p2",
      author: "Sarah Jenkins",
      title: "Senior AI Researcher @ Anthropic",
      avatarBg: "bg-purple-600",
      timeAgo: "5h • 🌐",
      content: "Evaluating Claude 3.5 Sonnet's reactive artifact generation in mobile sandbox environments. Results show a 40% reduction in execution overhead. Exciting times for on-device intelligent UX!",
      likes: 98,
      comments: 12,
      userLiked: false
    }
  ]);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            userLiked: !p.userLiked,
            likes: p.userLiked ? p.likes - 1 : p.likes + 1
          };
        }
        return p;
      })
    );
  };

  const createPost = () => {
    if (!postInput.trim()) return;
    const newP: Post = {
      id: Date.now().toString(),
      author: "You",
      title: "Software Engineer & Architect",
      avatarBg: "bg-emerald-600",
      timeAgo: "Just now • 🌐",
      content: postInput,
      likes: 1,
      comments: 0,
      userLiked: true
    };
    setPosts([newP, ...posts]);
    setPostInput("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Header */}
      <div className="p-3 bg-[#0a66c2] text-white flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white text-[#0a66c2] font-black flex items-center justify-center text-sm">
            in
          </div>
          <span className="font-extrabold text-sm tracking-tight">LinkedIn</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("notifications")}
            className="p-1.5 hover:bg-white/10 rounded-full relative"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 text-xs font-bold text-slate-400 shrink-0">
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            activeTab === "feed" ? "border-[#0a66c2] text-blue-400" : "border-transparent"
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            activeTab === "jobs" ? "border-[#0a66c2] text-blue-400" : "border-transparent"
          }`}
        >
          Jobs
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            activeTab === "notifications" ? "border-[#0a66c2] text-blue-400" : "border-transparent"
          }`}
        >
          Notifications
        </button>
      </div>

      {activeTab === "feed" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Create Post Box */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                Y
              </div>
              <input
                type="text"
                value={postInput}
                onChange={(e) => setPostInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createPost()}
                placeholder="Start a post about your work or ideas..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            {postInput.trim() && (
              <button
                onClick={createPost}
                className="self-end px-3 py-1 bg-[#0a66c2] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all"
              >
                Post
              </button>
            )}
          </div>

          {/* Posts List */}
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-2.5 shadow-md"
            >
              {/* Author Header */}
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full ${post.avatarBg} flex items-center justify-center font-bold text-white text-xs shrink-0`}>
                  {post.author[0]}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-extrabold text-white truncate">{post.author}</span>
                  <span className="text-[10px] text-slate-400 truncate">{post.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{post.timeAgo}</span>
                </div>
              </div>

              {/* Body Content */}
              <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

              {/* Counts */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-850 font-mono">
                <span className="flex items-center gap-1 text-blue-400">
                  <ThumbsUp size={11} /> {post.likes} reactions
                </span>
                <span>{post.comments} comments</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-850 text-xs font-bold">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors ${
                    post.userLiked ? "text-blue-400 bg-blue-950/60" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ThumbsUp size={14} /> Like
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-white py-1 px-2">
                  <MessageSquare size={14} /> Comment
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-white py-1 px-2">
                  <Repeat2 size={14} /> Repost
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <span className="text-xs font-bold text-slate-300">Recommended Jobs For You</span>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-950 text-blue-400 rounded-xl">
                <Briefcase size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Senior Web OS Architect</span>
                <span className="text-[10px] text-slate-400">Google • San Francisco, CA (Hybrid)</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">$190,000 - $240,000 / year</span>
            <button className="w-full py-1.5 bg-[#0a66c2] hover:bg-blue-600 text-white font-bold rounded-xl text-xs mt-1">
              Easy Apply
            </button>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-950 text-purple-400 rounded-xl">
                <Briefcase size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Staff AI Systems Engineer</span>
                <span className="text-[10px] text-slate-400">Anthropic • Remote</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">$210,000 - $280,000 / year</span>
            <button className="w-full py-1.5 bg-[#0a66c2] hover:bg-blue-600 text-white font-bold rounded-xl text-xs mt-1">
              Easy Apply
            </button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <span className="text-xs font-bold text-slate-300">Recent Notifications</span>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400 shrink-0" />
            <span>50 people viewed your profile this week.</span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center gap-2">
            <ThumbsUp size={16} className="text-emerald-400 shrink-0" />
            <span>Sarah Jenkins reacted to your post about KK OS v14.2.</span>
          </div>
        </div>
      )}
    </div>
  );
}
