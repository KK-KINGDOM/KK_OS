import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Check,
  X
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: number; // day of month e.g. 24
  time: string;
  color: string;
  location?: string;
}

export default function AppCalendar() {
  const [selectedDay, setSelectedDay] = useState(24);
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("02:00 PM");

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "e1", title: "KK OS System Architecture Demo", date: 24, time: "10:00 AM - 11:30 AM", color: "bg-blue-600", location: "Google Meet Room 1" },
    { id: "e2", title: "AI Models Performance Review", date: 24, time: "02:00 PM - 03:00 PM", color: "bg-purple-600", location: "Virtual Hub" },
    { id: "e3", title: "Q3 Workspace Integration Sync", date: 25, time: "11:00 AM - 12:00 PM", color: "bg-emerald-600" },
    { id: "e4", title: "Kernel Security Audit", date: 28, time: "04:00 PM - 05:00 PM", color: "bg-rose-600" }
  ]);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;
    const newEv: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: selectedDay,
      time: newEventTime,
      color: "bg-teal-600",
      location: "Google Meet"
    };
    setEvents([...events, newEv]);
    setNewEventTitle("");
    setShowAddModal(false);
  };

  const dayEvents = events.filter((e) => e.date === selectedDay);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Header */}
      <div className="p-3 bg-blue-950/90 border-b border-blue-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow">
            <CalendarIcon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs text-white">Google Calendar</span>
            <span className="text-[10px] text-blue-300 font-mono">July 2026</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
        >
          <Plus size={14} /> Add Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-400 font-bold mb-1">
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day) => {
            const hasEvent = events.some((e) => e.date === day);
            const isSelected = selectedDay === day;
            const isToday = day === 24;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`h-7 rounded-xl text-xs font-bold font-mono flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                    : isToday
                    ? "bg-blue-950 text-blue-300 border border-blue-500"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <span>{day}</span>
                {hasEvent && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-blue-400"} absolute bottom-1`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List for Selected Day */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-850">
          <span className="text-xs font-bold text-slate-300">
            Events for July {selectedDay}, 2026
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {dayEvents.length} scheduled
          </span>
        </div>

        {dayEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 italic">
            No events scheduled for July {selectedDay}.
          </div>
        ) : (
          dayEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-1 shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${evt.color}`} />
                <span className="text-xs font-bold text-white">{evt.title}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pl-4">
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-slate-500" /> {evt.time}
                </span>
                {evt.location && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <MapPin size={11} /> {evt.location}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/80 z-40 p-4 flex items-center justify-center">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-3xl p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">New Calendar Event</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-400 font-mono">Event Title</label>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="e.g. KK OS Team Standup"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />

              <label className="text-[10px] text-slate-400 font-mono mt-1">Time</label>
              <input
                type="text"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleAddEvent}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs mt-2"
            >
              Save Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
