import React from "react";
import { CloudSun, Sun, CloudRain, Wind, Droplets, Compass } from "lucide-react";

export default function AppWeather() {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-4 space-y-4 overflow-y-auto" id="app-weather">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
        <div className="flex items-center gap-2">
          <CloudSun size={18} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white">Weather</h2>
        </div>
        <span className="text-[10px] text-slate-400 font-bold">New Delhi, IN</span>
      </div>

      {/* Main Temperature Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/20 text-center space-y-2">
        <Sun size={48} className="mx-auto text-amber-400 animate-spin-slow" />
        <h1 className="text-4xl font-extrabold text-white">26°C</h1>
        <p className="text-xs font-semibold text-amber-300">Mostly Sunny</p>
        <p className="text-[10px] text-slate-400">High: 30°C • Low: 19°C</p>
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-850 text-center">
          <Wind size={14} className="mx-auto text-teal-400 mb-1" />
          <span className="text-[9px] text-slate-400 block">Wind</span>
          <span className="text-xs font-bold text-white">12 km/h</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-850 text-center">
          <Droplets size={14} className="mx-auto text-cyan-400 mb-1" />
          <span className="text-[9px] text-slate-400 block">Humidity</span>
          <span className="text-xs font-bold text-white">45%</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-850 text-center">
          <Compass size={14} className="mx-auto text-purple-400 mb-1" />
          <span className="text-[9px] text-slate-400 block">AQI</span>
          <span className="text-xs font-bold text-emerald-400">42 (Good)</span>
        </div>
      </div>
    </div>
  );
}
