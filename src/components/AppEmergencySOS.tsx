import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  PhoneCall,
  Siren,
  AlertTriangle,
  User,
  HeartPulse,
  Plus,
  Trash2,
  MapPin,
  CheckCircle2,
  Volume2,
  VolumeX,
  Radio,
  Send
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

const OFFICIAL_EMERGENCY_NUMBERS = [
  { code: "112", title: "National Emergency Helpline", dept: "All Emergencies", icon: ShieldAlert, color: "text-rose-400" },
  { code: "100", title: "Police Control Room", dept: "Law & Safety", icon: PhoneCall, color: "text-blue-400" },
  { code: "101", title: "Fire Brigade Station", dept: "Fire & Rescue", icon: AlertTriangle, color: "text-amber-400" },
  { code: "102", title: "Ambulance & Trauma", dept: "Medical Emergency", icon: HeartPulse, color: "text-emerald-400" },
  { code: "1091", title: "Women Safety Helpline", dept: "Women Protection", icon: User, color: "text-purple-400" },
  { code: "1930", title: "Cyber Crime Helpline", dept: "Financial Fraud", icon: ShieldAlert, color: "text-cyan-400" },
  { code: "1078", title: "Disaster Management", dept: "Natural Calamities", icon: Radio, color: "text-orange-400" },
  { code: "1066", title: "Poison Control Center", dept: "Toxicology", icon: HeartPulse, color: "text-rose-300" },
  { code: "1098", title: "Child Helpline", dept: "Child Protection", icon: User, color: "text-teal-400" },
  { code: "14567", title: "Senior Citizen Line", dept: "Elderly Assistance", icon: User, color: "text-indigo-400" }
];

export default function AppEmergencySOS() {
  const [activeTab, setActiveTab] = useState<"panic" | "numbers" | "medical" | "contacts">("panic");
  
  // Panic Countdown State
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownSec, setCountdownSec] = useState(5);
  const [sosActive, setSosActive] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  
  // Trusted Contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: "ec-1", name: "Mom", relationship: "Parent", phone: "+1 (555) 019-2834" },
    { id: "ec-2", name: "David Miller", relationship: "Spouse", phone: "+1 (555) 014-9982" }
  ]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("Family");

  // Medical ID Profile
  const [bloodType, setBloodType] = useState("O Positive (O+)");
  const [allergies, setAllergies] = useState("Penicillin, Peanuts");
  const [medicalConditions, setMedicalConditions] = useState("Asthma (Mild)");
  const [organDonor, setOrganDonor] = useState(true);

  // Audio Siren Synth
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const oscRef = React.useRef<OscillatorNode | null>(null);

  const startSirenSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      setSirenPlaying(true);
    } catch (e) {
      console.log("Audio siren synth unavailable.");
    }
  };

  const stopSirenSound = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    setSirenPlaying(false);
  };

  // SOS Countdown Timer Logic
  useEffect(() => {
    let timer: any = null;
    if (isCountingDown && countdownSec > 0) {
      timer = setInterval(() => {
        setCountdownSec((c) => c - 1);
      }, 1000);
    } else if (isCountingDown && countdownSec === 0) {
      setIsCountingDown(false);
      setSosActive(true);
      startSirenSound();
    }
    return () => clearInterval(timer);
  }, [isCountingDown, countdownSec]);

  const handleStartPanic = () => {
    setCountdownSec(5);
    setIsCountingDown(true);
    setSosActive(false);
  };

  const handleCancelPanic = () => {
    setIsCountingDown(false);
    setSosActive(false);
    setCountdownSec(5);
    stopSirenSound();
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setContacts([
      ...contacts,
      {
        id: `ec-${Date.now()}`,
        name: newContactName.trim(),
        relationship: newContactRelation,
        phone: newContactPhone.trim()
      }
    ]);
    setNewContactName("");
    setNewContactPhone("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
            <Siren size={18} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">Emergency SOS</h2>
            <p className="text-[9px] text-slate-400 font-mono">Public Safety & Medical ID</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
          <button
            onClick={() => setActiveTab("panic")}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "panic" ? "bg-rose-500 text-white" : "text-slate-400"
            }`}
          >
            SOS Button
          </button>
          <button
            onClick={() => setActiveTab("numbers")}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "numbers" ? "bg-rose-500 text-white" : "text-slate-400"
            }`}
          >
            Numbers ({OFFICIAL_EMERGENCY_NUMBERS.length})
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "contacts" ? "bg-rose-500 text-white" : "text-slate-400"
            }`}
          >
            Contacts
          </button>
        </div>
      </div>

      {/* PANIC BUTTON TAB */}
      {activeTab === "panic" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between">
          {/* Status Notification */}
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center space-y-1 shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-rose-400 font-mono font-bold text-xs uppercase">
              <ShieldAlert size={15} />
              <span>Emergency Preparedness Mode</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Pressing the emergency trigger will alert emergency contacts with your live GPS location:
              <strong className="text-white block font-mono text-[10px] mt-0.5">
                Lat: 37.7749° N, Lng: -122.4194° W (Precision 4m)
              </strong>
            </p>
          </div>

          {/* SOS Trigger Button / Countdown Screen */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-2">
            {isCountingDown ? (
              <div className="flex flex-col items-center space-y-3 animate-pulse">
                <div className="w-36 h-36 rounded-full bg-rose-600 border-4 border-rose-400 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.8)]">
                  <span className="text-6xl font-black text-white font-mono">{countdownSec}</span>
                </div>
                <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-widest">
                  DISPATCHING SOS ALARM...
                </h3>
                <button
                  onClick={handleCancelPanic}
                  className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer shadow-xl"
                >
                  CANCEL DISPATCH
                </button>
              </div>
            ) : sosActive ? (
              <div className="p-6 rounded-3xl bg-rose-950 border-2 border-rose-500 text-center space-y-3 shadow-2xl animate-pulse">
                <Siren size={48} className="text-rose-400 mx-auto animate-bounce" />
                <h2 className="text-lg font-black text-white uppercase">SOS ALARM ACTIVE!</h2>
                <p className="text-xs text-rose-200">
                  Emergency SMS sent to {contacts.length} trusted contacts. High-decibel siren active.
                </p>

                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={stopSirenSound}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-rose-300 text-xs font-bold border border-rose-800"
                  >
                    {sirenPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />} Toggle Siren
                  </button>

                  <button
                    onClick={handleCancelPanic}
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow"
                  >
                    DISARM ALARM
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartPanic}
                className="w-44 h-44 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-500 border-8 border-rose-400/40 text-white font-black text-3xl cursor-pointer shadow-[0_0_60px_rgba(244,63,94,0.6)] hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
              >
                <Siren size={36} className="group-hover:rotate-12 transition-transform" />
                <span>HOLD SOS</span>
              </button>
            )}
          </div>

          {/* Quick Dial Top Numbers */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:112"
              className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800/80 hover:bg-rose-900 flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-extrabold text-white">Call 112</span>
                <p className="text-[9px] text-rose-300 font-mono">National Emergency</p>
              </div>
              <PhoneCall size={16} className="text-rose-400" />
            </a>

            <a
              href="tel:100"
              className="p-3 rounded-2xl bg-blue-950/80 border border-blue-800/80 hover:bg-blue-900 flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-extrabold text-white">Call 100</span>
                <p className="text-[9px] text-blue-300 font-mono">Police Help Line</p>
              </div>
              <PhoneCall size={16} className="text-blue-400" />
            </a>
          </div>
        </div>
      )}

      {/* EMERGENCY NUMBERS TAB */}
      {activeTab === "numbers" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
            Toll-free 24/7 National Emergency Helplines catalog pre-programmed in system memory.
          </div>

          <div className="space-y-1.5">
            {OFFICIAL_EMERGENCY_NUMBERS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.code}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-rose-400">
                      <Icon size={16} className={item.color} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{item.title}</h4>
                      <p className="text-[10px] text-slate-400">{item.dept}</p>
                    </div>
                  </div>

                  <a
                    href={`tel:${item.code}`}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <PhoneCall size={12} />
                    <span>{item.code}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTACTS TAB */}
      {activeTab === "contacts" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Add Contact Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-md">
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Plus size={14} className="text-rose-400" /> Add Trusted Emergency Contact
            </h3>

            <div className="space-y-2">
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Contact Full Name..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 font-mono"
                />

                <select
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs font-bold text-rose-300 px-2 rounded-xl outline-none"
                >
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <button
                onClick={handleAddContact}
                className="w-full py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer shadow"
              >
                Save Contact
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Trusted SOS SMS Recipients ({contacts.length})
            </span>

            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-rose-950 text-rose-300 font-bold flex items-center justify-center text-xs border border-rose-800">
                    {c.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      {c.phone} • <span className="text-rose-300">{c.relationship}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setContacts((prev) => prev.filter((item) => item.id !== c.id))}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
