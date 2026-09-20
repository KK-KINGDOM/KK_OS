import React, { useState } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Search,
  User,
  Star,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Grid,
  ChevronLeft,
  Clock,
  MoreVertical
} from "lucide-react";

interface CallLog {
  id: string;
  name: string;
  number: string;
  type: "incoming" | "outgoing" | "missed";
  time: string;
  avatarColor: string;
}

const RECENT_CALLS: CallLog[] = [
  { id: "1", name: "Mom", number: "+1 (555) 019-2831", type: "incoming", time: "10:20 AM", avatarColor: "bg-rose-500" },
  { id: "2", name: "Home", number: "+1 (555) 014-9920", type: "outgoing", time: "Yesterday", avatarColor: "bg-indigo-500" },
  { id: "3", name: "Rahul", number: "+1 (555) 018-4422", type: "incoming", time: "Yesterday", avatarColor: "bg-emerald-500" },
  { id: "4", name: "Bank Alert", number: "1800-200-1111", type: "missed", time: "Mon", avatarColor: "bg-amber-500" },
  { id: "5", name: "KK Promotions", number: "+1 (800) 555-0100", type: "outgoing", time: "Sun", avatarColor: "bg-teal-500" }
];

export default function AppPhone({ onOpenApp }: { onOpenApp?: (appId: string) => void }) {
  const [activeTab, setActiveTab] = useState<"phone" | "contacts" | "favorites">("phone");
  const [dialedNumber, setDialedNumber] = useState("");
  const [showKeypad, setShowKeypad] = useState(true);
  const [activeCall, setActiveCall] = useState<{ name: string; number: string; avatarColor: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Keypad keys definitions
  const keys = [
    { num: "1", sub: "" },
    { num: "2", sub: "ABC" },
    { num: "3", sub: "DEF" },
    { num: "4", sub: "GHI" },
    { num: "5", sub: "JKL" },
    { num: "6", sub: "MNO" },
    { num: "7", sub: "PQRS" },
    { num: "8", sub: "TUV" },
    { num: "9", sub: "WXYZ" },
    { num: "*", sub: "" },
    { num: "0", sub: "+" },
    { num: "#", sub: "" }
  ];

  const handleKeyPress = (num: string) => {
    setDialedNumber((prev) => prev + num);
  };

  const handleBackspace = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const startCall = (name: string, number: string, avatarColor: string = "bg-teal-600") => {
    setActiveCall({ name, number, avatarColor });
    setCallDuration(0);
  };

  const endCall = () => {
    setActiveCall(null);
    setIsMuted(false);
    setIsSpeaker(false);
  };

  // Format seconds to mm:ss
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Call timer simulation
  React.useEffect(() => {
    let timer: any;
    if (activeCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden" id="app-phone">
      {/* 1. ACTIVE CALL SCREEN OVERLAY */}
      {activeCall ? (
        <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col justify-between p-6 text-center animate-in fade-in duration-200">
          <div className="mt-8 space-y-3">
            <div className={`mx-auto h-24 w-24 rounded-full ${activeCall.avatarColor} flex items-center justify-center text-white text-3xl font-bold shadow-2xl animate-pulse`}>
              {activeCall.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{activeCall.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{activeCall.number}</p>
              <p className="text-xs font-mono text-teal-400 mt-2 font-semibold">
                {callDuration === 0 ? "Calling..." : formatDuration(callDuration)}
              </p>
            </div>
          </div>

          {/* Call Controls Grid */}
          <div className="space-y-6 mb-6">
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full flex flex-col items-center justify-center gap-1 transition-all ${
                  isMuted ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                <span className="text-[9px] font-bold">Mute</span>
              </button>

              <button
                onClick={() => setShowKeypad(!showKeypad)}
                className="p-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex flex-col items-center justify-center gap-1"
              >
                <Grid size={20} />
                <span className="text-[9px] font-bold">Keypad</span>
              </button>

              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`p-3.5 rounded-full flex flex-col items-center justify-center gap-1 transition-all ${
                  isSpeaker ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                {isSpeaker ? <Volume2 size={20} /> : <VolumeX size={20} />}
                <span className="text-[9px] font-bold">Speaker</span>
              </button>
            </div>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="mx-auto h-16 w-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-transform active:scale-95 cursor-pointer"
            >
              <PhoneOff size={28} />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header Tabs */}
          <div className="flex items-center justify-around bg-slate-900 border-b border-slate-800 px-2 py-3">
            <button
              onClick={() => setActiveTab("phone")}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === "phone" ? "bg-teal-600/30 text-teal-400 border border-teal-500/40" : "text-slate-400 hover:text-white"
              }`}
            >
              Phone
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === "contacts" ? "bg-teal-600/30 text-teal-400 border border-teal-500/40" : "text-slate-400 hover:text-white"
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === "favorites" ? "bg-teal-600/30 text-teal-400 border border-teal-500/40" : "text-slate-400 hover:text-white"
              }`}
            >
              Favorites
            </button>
          </div>

          {/* MAIN CONTENT BASED ON TAB */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* TAB: PHONE / RECENTS */}
            {activeTab === "phone" && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock size={11} /> Recent Calls
                </div>
                {RECENT_CALLS.map((call) => (
                  <div
                    key={call.id}
                    onClick={() => startCall(call.name, call.number, call.avatarColor)}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-850 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full ${call.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                        {call.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {call.name}
                          {call.type === "incoming" && <PhoneIncoming size={10} className="text-emerald-400" />}
                          {call.type === "outgoing" && <PhoneOutgoing size={10} className="text-cyan-400" />}
                          {call.type === "missed" && <PhoneMissed size={10} className="text-rose-400" />}
                        </h4>
                        <p className="text-[10px] text-slate-400">{call.number}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[9px] text-slate-500">{call.time}</span>
                      <button className="p-1.5 rounded-full bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors">
                        <Phone size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: CONTACTS */}
            {activeTab === "contacts" && (
              <div className="space-y-2">
                <div className="relative mb-2">
                  <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
                {["Ananya", "Bank Alert", "Home", "KK Promotions", "Mom", "Rahul", "Vijay"].map((contact, i) => (
                  <div
                    key={i}
                    onClick={() => startCall(contact, `+1 (555) 010-${100 + i}`)}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-850 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                        {contact.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-white">{contact}</span>
                    </div>
                    <Phone size={12} className="text-teal-400" />
                  </div>
                ))}
              </div>
            )}

            {/* TAB: FAVORITES */}
            {activeTab === "favorites" && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Mom", color: "bg-rose-500" },
                  { name: "Rahul", color: "bg-emerald-500" },
                  { name: "Home", color: "bg-indigo-500" }
                ].map((fav, i) => (
                  <button
                    key={i}
                    onClick={() => startCall(fav.name, "+1 (555) 019-0000", fav.color)}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-2 hover:bg-slate-850 transition-colors"
                  >
                    <div className={`h-12 w-12 rounded-full ${fav.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {fav.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-white">{fav.name}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DIALPAD SECTION AT BOTTOM */}
          <div className="bg-slate-900 border-t border-slate-800 p-3 space-y-2">
            {/* Display dialed number */}
            {dialedNumber && (
              <div className="flex items-center justify-between px-4 py-1">
                <span className="text-lg font-mono font-bold text-teal-400 tracking-wider truncate max-w-[200px]">
                  {dialedNumber}
                </span>
                <button
                  onClick={handleBackspace}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-900/50"
                >
                  DEL
                </button>
              </div>
            )}

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto">
              {keys.map((k) => (
                <button
                  key={k.num}
                  onClick={() => handleKeyPress(k.num)}
                  className="h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer"
                >
                  <span className="text-xs font-bold text-white">{k.num}</span>
                  {k.sub && <span className="text-[7px] font-semibold text-slate-500 leading-none">{k.sub}</span>}
                </button>
              ))}
            </div>

            {/* Call button */}
            <div className="pt-1 flex justify-center">
              <button
                onClick={() => startCall(dialedNumber || "Mom", dialedNumber || "+1 (555) 019-2831")}
                className="h-11 w-full max-w-[240px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
              >
                <Phone size={16} />
                Call {dialedNumber ? dialedNumber : "Mom"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
