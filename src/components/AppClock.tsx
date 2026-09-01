import React, { useState } from "react";
import { Clock, AlarmClock, Timer, Watch, Plus } from "lucide-react";

export default function AppClock() {
  const [activeTab, setActiveTab] = useState<"alarm" | "clock" | "timer">("alarm");
  const [alarms, setAlarms] = useState([
    { id: "1", time: "07:00 AM", label: "Morning Wakeup", active: true },
    { id: "2", time: "08:30 AM", label: "Kernel Standup", active: false }
  ]);

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-3 space-y-3" id="app-clock">
      {/* Header */}
      <div className="flex items-center justify-around bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab("alarm")}
          className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === "alarm" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400"
          }`}
        >
          Alarm
        </button>
        <button
          onClick={() => setActiveTab("clock")}
          className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === "clock" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400"
          }`}
        >
          World Clock
        </button>
      </div>

      {/* Alarm List */}
      {activeTab === "alarm" && (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {alarms.map((a) => (
            <div key={a.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white font-mono">{a.time}</h3>
                <span className="text-[10px] text-slate-400">{a.label}</span>
              </div>
              <button
                onClick={() => toggleAlarm(a.id)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  a.active ? "bg-amber-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    a.active ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* World Clock View */}
      {activeTab === "clock" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
          <Clock size={48} className="text-amber-400 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-white font-mono">10:30 AM</h2>
          <p className="text-xs text-slate-400">Wednesday, 7 May 2026</p>
        </div>
      )}
    </div>
  );
}
