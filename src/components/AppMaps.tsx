import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Navigation,
  Search,
  Compass,
  Layers,
  Car,
  Bike,
  Footprints,
  Train,
  Sparkles,
  Coffee,
  Fuel,
  Hospital,
  DollarSign,
  Utensils,
  Volume2,
  X,
  ChevronRight,
  Route,
  Clock,
  ShieldAlert
} from "lucide-react";
import { playClickSound } from "../utils/sound";

interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  eta: string;
  address: string;
  icon: any;
  color: string;
  lat: number;
  lng: number;
}

const NEARBY_PLACES: Place[] = [
  { id: "p1", name: "Google Bay View Campus", category: "Technology Center", rating: 4.9, distance: "1.2 km", eta: "4 mins", address: "2000 Charleston Rd, Mountain View", icon: Navigation, color: "bg-blue-600", lat: 37.422, lng: -122.084 },
  { id: "p2", name: "Blue Bottle Coffee & Bakery", category: "Cafe & Roastery", rating: 4.8, distance: "0.6 km", eta: "2 mins", address: "456 Castro St, Mountain View", icon: Coffee, color: "bg-amber-600", lat: 37.386, lng: -122.083 },
  { id: "p3", name: "Shell SuperCharge Gas & EV", category: "Fuel & EV Station", rating: 4.6, distance: "1.8 km", eta: "6 mins", address: "789 El Camino Real", icon: Fuel, color: "bg-red-600", lat: 37.391, lng: -122.078 },
  { id: "p4", name: "Stanford Healthcare Hospital", category: "Emergency Care", rating: 4.9, distance: "4.5 km", eta: "11 mins", address: "300 Pasteur Dr, Stanford", icon: Hospital, color: "bg-emerald-600", lat: 37.434, lng: -122.175 },
  { id: "p5", name: "Trattoria Bella Italian Bistro", category: "Fine Dining & Pizza", rating: 4.7, distance: "2.1 km", eta: "7 mins", address: "123 Main St, Suite 4", icon: Utensils, color: "bg-orange-600", lat: 37.401, lng: -122.112 }
];

export default function AppMaps() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [travelMode, setTravelMode] = useState<"car" | "bike" | "transit" | "walk">("car");
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapType, setMapType] = useState<"default" | "satellite" | "terrain">("default");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { label: "Coffee", icon: Coffee, query: "Cafe" },
    { label: "Gas / EV", icon: Fuel, query: "Fuel" },
    { label: "Hospitals", icon: Hospital, query: "Emergency" },
    { label: "Food", icon: Utensils, query: "Dining" },
    { label: "ATMs", icon: DollarSign, query: "Bank" }
  ];

  const handleStartNav = (place: Place) => {
    playClickSound();
    setSelectedPlace(place);
    setIsNavigating(true);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden relative">
      {/* Interactive Simulated Map Canvas */}
      <div className="absolute inset-0 bg-slate-900 overflow-hidden">
        {/* Background Grid Texture */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            mapType === "satellite"
              ? "bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 opacity-90"
              : mapType === "terrain"
              ? "bg-emerald-950/40 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:24px_24px]"
              : "bg-slate-900 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]"
          }`}
        />

        {/* Map Vector Roads / Highways simulation */}
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          <path d="M 0 100 Q 150 200 400 180 T 800 300" stroke="#38bdf8" strokeWidth="6" fill="none" strokeDasharray={isNavigating ? "8,4" : "none"} />
          <path d="M 50 0 Q 100 250 220 500 T 350 800" stroke="#94a3b8" strokeWidth="4" fill="none" />
          <path d="M 0 350 L 400 350" stroke="#475569" strokeWidth="3" fill="none" />
          <path d="M 180 0 L 180 800" stroke="#475569" strokeWidth="3" fill="none" />
          {isNavigating && (
            <path
              d="M 180 350 Q 220 280 280 220"
              stroke="#22c55e"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Current User Location Marker */}
        <div className="absolute top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 border-2 border-blue-400 animate-ping absolute inset-0" />
            <div className="h-7 w-7 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_#3b82f6] flex items-center justify-center text-white text-[10px] font-bold">
              <Navigation size={13} className="rotate-45" />
            </div>
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-blue-500/50 text-[9px] font-bold text-blue-300 backdrop-blur-xs">
            You (Mountain View)
          </span>
        </div>

        {/* Points of Interest on Map */}
        {NEARBY_PLACES.map((place, idx) => {
          const topPercent = 25 + idx * 14;
          const leftPercent = 20 + (idx % 3) * 28;
          const isSelected = selectedPlace?.id === place.id;

          return (
            <div
              key={place.id}
              onClick={() => {
                playClickSound();
                setSelectedPlace(place);
              }}
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`p-2 rounded-2xl ${place.color} text-white shadow-xl transition-transform group-hover:scale-125 ${
                    isSelected ? "ring-4 ring-amber-400 scale-110" : ""
                  }`}
                >
                  <place.icon size={15} />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-700 text-[9px] font-bold text-slate-200 backdrop-blur-xs truncate max-w-[110px] shadow">
                  {place.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Top Search Bar */}
      <div className="p-3 z-30 space-y-2">
        <div className="relative flex items-center shadow-2xl">
          <Search size={15} className="absolute left-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places, gas, restaurants..."
            className="w-full bg-slate-900/95 backdrop-blur-md border border-slate-750 focus:border-blue-400 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-400 outline-none shadow-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  playClickSound();
                  setActiveCategory(activeCategory === cat.label ? null : cat.label);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shrink-0 cursor-pointer shadow ${
                  activeCategory === cat.label
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                <Icon size={12} className="text-amber-400" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Controls (Right Side Floating) */}
      <div className="absolute right-3 top-28 z-20 flex flex-col gap-2">
        <button
          onClick={() => {
            playClickSound();
            setMapType((prev) => (prev === "default" ? "satellite" : prev === "satellite" ? "terrain" : "default"));
          }}
          className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white shadow-xl hover:bg-slate-800 cursor-pointer"
          title="Switch Map Layers"
        >
          <Layers size={16} className="text-cyan-400" />
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedPlace(null);
          }}
          className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white shadow-xl hover:bg-slate-800 cursor-pointer"
          title="Recenter Map"
        >
          <Compass size={16} className="text-rose-400" />
        </button>
      </div>

      {/* Turn-by-Turn Navigation HUD Overlay */}
      <AnimatePresence>
        {isNavigating && selectedPlace && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-3 inset-x-3 z-40 p-4 rounded-3xl bg-emerald-950/95 backdrop-blur-xl border border-emerald-500/60 shadow-2xl space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
                <Navigation size={16} className="text-emerald-400 animate-pulse" />
                <span>LIVE NAVIGATION HUD</span>
              </div>
              <button
                onClick={() => setIsNavigating(false)}
                className="px-2.5 py-1 rounded-xl bg-emerald-900 text-xs font-bold text-white cursor-pointer"
              >
                End Route
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950 font-black">
                <Navigation size={22} className="rotate-45" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">In 200m, Turn Right onto Shoreline Blvd</h3>
                <p className="text-[11px] text-emerald-200 font-mono">
                  Destination: {selectedPlace.name} ({selectedPlace.eta})
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Place Bottom Sheet */}
      <div className="mt-auto z-30 p-3">
        {selectedPlace ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                  {selectedPlace.category} • ★ {selectedPlace.rating}
                </span>
                <h3 className="text-sm font-black text-white">{selectedPlace.name}</h3>
                <p className="text-[11px] text-slate-400">{selectedPlace.address}</p>
              </div>
              <button
                onClick={() => setSelectedPlace(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Travel Mode Selector */}
            <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
              {[
                { id: "car", icon: Car, time: selectedPlace.eta },
                { id: "bike", icon: Bike, time: "8m" },
                { id: "transit", icon: Train, time: "14m" },
                { id: "walk", icon: Footprints, time: "22m" }
              ].map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      playClickSound();
                      setTravelMode(mode.id as any);
                    }}
                    className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      travelMode === mode.id
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{mode.time}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStartNav(selectedPlace)}
                className="flex-1 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Navigation size={15} />
                <span>Start Navigation ({selectedPlace.eta})</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Default Nearby Discovery Carousel */
          <div className="p-3.5 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-400" />
                <span>Explore Nearby Places</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">5 Available</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto scrollbar-none py-1">
              {NEARBY_PLACES.map((place) => (
                <div
                  key={place.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedPlace(place);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 min-w-[180px] cursor-pointer group transition-all shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${place.color} text-white`}>
                      <place.icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-300">
                        {place.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">{place.distance} • {place.eta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
