import React, { useState } from "react";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  Share2,
  Plus,
  Sparkles,
  Send,
  Check
} from "lucide-react";

export default function AppMeet() {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "Alex (Host)", text: "Welcome to the KK OS Sync!" },
    { sender: "Sarah", text: "Can everyone hear me clearly?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const startMeeting = () => {
    setInCall(true);
  };

  const leaveCall = () => {
    setInCall(false);
    setShowChat(false);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { sender: "You", text: chatInput }]);
    setChatInput("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Header */}
      <div className="p-3 bg-teal-950/90 border-b border-teal-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-600 text-white shadow">
            <Video size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs text-white">Google Meet</span>
            <span className="text-[9px] text-teal-300 font-mono">
              {inCall ? "Room: kkos-sync-2026" : "Video Calls & Meetings"}
            </span>
          </div>
        </div>

        {inCall && (
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 bg-teal-900 border border-teal-700 rounded-xl text-teal-300 hover:text-white relative"
          >
            <MessageSquare size={16} />
            {chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            )}
          </button>
        )}
      </div>

      {!inCall ? (
        /* Meeting Launcher Lobby */
        <div className="flex-1 p-4 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-2xl shadow-teal-500/30">
            <Video size={36} />
          </div>

          <div>
            <h2 className="text-base font-black text-white">Premium Video Meetings</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Connect, collaborate, and share screens securely with Google Meet on KK OS.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2 mt-2">
            <button
              onClick={startMeeting}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} /> Start Instant Meeting
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Enter meeting code..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={startMeeting}
                disabled={!meetingCode.trim()}
                className="px-4 py-2 bg-slate-800 disabled:opacity-50 hover:bg-slate-700 text-teal-300 rounded-xl font-bold text-xs"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Video Call Screen */
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-900">
          {/* Main Video Stream Simulator */}
          <div className="flex-1 p-2 grid grid-cols-2 gap-2 relative">
            {/* Participant 1 Feed */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 flex flex-col justify-between relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-slate-950 to-slate-950" />
              <div className="z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-teal-300 bg-black/60 px-2 py-0.5 rounded">
                  Alex (Host)
                </span>
                <Mic size={12} className="text-teal-400" />
              </div>
              <div className="z-10 my-auto self-center w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-lg font-black text-white shadow-xl">
                A
              </div>
            </div>

            {/* User Self Video Feed */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 flex flex-col justify-between relative overflow-hidden shadow-lg">
              {videoOn ? (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-950 to-slate-950 animate-pulse" />
              ) : (
                <div className="absolute inset-0 bg-black flex items-center justify-center text-xs text-slate-600">
                  Camera Off
                </div>
              )}
              <div className="z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                  You
                </span>
                {micOn ? <Mic size={12} className="text-emerald-400" /> : <MicOff size={12} className="text-rose-400" />}
              </div>
              <div className="z-10 my-auto self-center w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-lg font-black text-white shadow-xl">
                Y
              </div>
            </div>
          </div>

          {/* In-call Chat Drawer Overlay */}
          {showChat && (
            <div className="absolute top-0 right-0 bottom-16 w-64 bg-slate-950/95 border-l border-slate-800 p-3 flex flex-col gap-2 z-20 shadow-2xl">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-teal-300">In-Call Messages</span>
                <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-slate-900 p-2 rounded-xl text-xs">
                    <span className="text-[10px] font-bold text-teal-400 block">{msg.sender}</span>
                    <p className="text-slate-200 mt-0.5">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Send a message..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                />
                <button onClick={sendChatMessage} className="p-1.5 bg-teal-600 rounded-xl text-white">
                  <Send size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Call Controls Footer */}
          <div className="h-16 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-around shrink-0 z-10">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-full transition-all ${
                micOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-rose-600 text-white"
              }`}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-full transition-all ${
                videoOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-rose-600 text-white"
              }`}
            >
              {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              onClick={leaveCall}
              className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg shadow-rose-600/40 active:scale-95 transition-all"
              title="Leave Call"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
