import React, { useEffect, useState, useRef } from "react";
import { listenToParentalLogs } from "./lib/firebase";
import { getSocket } from "./utils/socket";
import { Battery, ShieldCheck, Activity, Smartphone, Search, MessageSquare, Monitor, Clock, Wifi } from "lucide-react";

interface TelemetryEvent {
  timestamp: string;
  type: string;
  data: any;
}

export default function ParentDashboard() {
  const [targetPhone, setTargetPhone] = useState(localStorage.getItem("parental_phone_number") || "");
  const [phoneInput, setPhoneInput] = useState("");
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [childState, setChildState] = useState({
    activeApp: "None",
    batteryLevel: "--",
    status: "Offline",
    isLocked: true
  });
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    
    // Announce parent is listening
    setChildState(prev => ({ ...prev, status: "Connected - Listening for Telemetry" }));

    socket.on("parent_update", (payload: TelemetryEvent) => {
      // Update real-time state based on event type
      if (payload.type === "APP_CHANGE") {
        setChildState(prev => ({ ...prev, activeApp: payload.data.appId || "Home Screen" }));
      } else if (payload.type === "BATTERY_UPDATE") {
        setChildState(prev => ({ ...prev, batteryLevel: payload.data.level }));
      } else if (payload.type === "SYSTEM_STATE") {
        if (payload.data.state === "UNLOCKED") setChildState(prev => ({ ...prev, isLocked: false }));
        if (payload.data.state === "LOCKED") setChildState(prev => ({ ...prev, isLocked: true }));
      } else if (payload.type === "PING") {
        setChildState(prev => ({ ...prev, status: "Online - Active" }));
      }

      // Only add meaningful activities to the visible feed
      if (payload.type !== "PING" && payload.type !== "BATTERY_UPDATE") {
        setEvents(prev => [...prev, payload]);
      }
    });

    return () => {
      socket.off("parent_update");
    };
  }, []);

  // Firebase Real-time Logs Listener
  useEffect(() => {
    if (!targetPhone) return;

    const unsubscribe = listenToParentalLogs(targetPhone, (logs) => {
      const fbEvents: TelemetryEvent[] = logs.map(log => ({
        type: "ACTIVITY_LOG",
        data: {
          query: log.query,
          appSource: log.appSource,
          category: log.category
        },
        timestamp: log.timestamp
      }));
      
      // We will merge Firebase events with socket events. 
      // To avoid duplicates, we could clear non-Firebase ACTIVITY_LOGs, 
      // but for now replacing the list or prepending might be easiest.
      setEvents(prev => {
        // Filter out old ACTIVITY_LOGs to replace with authoritative Firebase list
        const otherEvents = prev.filter(e => e.type !== "ACTIVITY_LOG");
        return [...otherEvents, ...fbEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [targetPhone]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  if (!targetPhone) {
    return (
      <div className="min-h-screen bg-[#0b1121] text-slate-200 font-sans p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl max-w-md w-full text-center space-y-6">
          <ShieldCheck className="text-teal-500 w-16 h-16 mx-auto" />
          <h1 className="text-2xl font-bold">Connect to Child Device</h1>
          <p className="text-sm text-slate-400">Enter the parent phone number that was registered on the child's device during setup to monitor it remotely via Firebase.</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. +1 555-0123" 
              className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-teal-500 text-center text-lg tracking-wider"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
            <button 
              onClick={() => {
                if (phoneInput.trim()) {
                  localStorage.setItem("parental_phone_number", phoneInput.trim());
                  setTargetPhone(phoneInput.trim());
                }
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-bold text-white transition-colors"
            >
              Connect to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1121] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <ShieldCheck className="text-teal-500 w-8 h-8" />
              Parental Command Center
            </h1>
            <p className="text-slate-400 mt-1 font-mono text-sm tracking-wider uppercase flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              Live Telemetry Stream Active
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
              <Wifi className={childState.status.includes("Online") || childState.status.includes("Connected") ? "text-emerald-400" : "text-slate-500"} size={20} />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Connection</p>
                <p className="text-sm font-medium">{childState.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Device Status Overview */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-6 flex items-center gap-2">
                <Smartphone size={16} />
                Child Device Status
              </h2>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Monitor size={20} className="text-sky-400" />
                    <span className="font-medium">Active Screen</span>
                  </div>
                  <span className="bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    {childState.activeApp}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Battery size={20} className={Number(childState.batteryLevel) < 20 ? "text-red-400" : "text-emerald-400"} />
                    <span className="font-medium">Battery</span>
                  </div>
                  <span className="font-mono font-bold text-lg">
                    {childState.batteryLevel}{childState.batteryLevel !== "--" ? "%" : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Activity size={20} className={childState.isLocked ? "text-slate-500" : "text-amber-400"} />
                    <span className="font-medium">OS Status</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${childState.isLocked ? "bg-slate-800 text-slate-400" : "bg-amber-500/20 text-amber-300"}`}>
                    {childState.isLocked ? "LOCKED" : "UNLOCKED"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
               <h2 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4 flex items-center gap-2">
                <Search size={16} />
                Quick Actions
              </h2>
              <p className="text-xs text-slate-500 mb-4">Remote control features are disabled in this demo.</p>
              <button disabled className="w-full bg-slate-800 text-slate-500 py-3 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed">
                Lock Device Remotely
              </button>
            </div>
          </div>

          {/* Right Column: Inch-by-Inch Live Feed */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
              <h2 className="text-sm uppercase tracking-widest font-bold text-slate-300 flex items-center gap-2">
                <Activity size={16} className="text-teal-400" />
                Live Activity Feed
              </h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md font-mono">{events.length} Events Logged</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 os-scrollbar font-mono text-sm">
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                  <Clock size={32} className="opacity-20" />
                  <p>Waiting for child device activity...</p>
                </div>
              ) : (
                events.map((ev, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800/50 rounded-lg p-3 flex gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="text-slate-500 text-xs mt-0.5 shrink-0 w-20">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}
                    </div>
                    <div>
                      <div className="font-bold text-teal-400 mb-1">
                        [{ev.type}]
                      </div>
                      <div className="text-slate-300 break-words whitespace-pre-wrap">
                        {typeof ev.data === "string" ? ev.data : JSON.stringify(ev.data, null, 2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
