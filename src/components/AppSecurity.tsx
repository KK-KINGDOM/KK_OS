import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  Lock,
  Eye,
  Smartphone,
  CheckCircle,
  ChevronRight,
  Zap,
  Activity,
  Award,
  ScanFace,
  Camera,
  VideoOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Filter,
  Clock,
  XCircle,
  FileText
} from "lucide-react";
import {
  getSecurityLogs,
  recordSecurityLog,
  clearSecurityLogs,
  SecurityLog
} from "../utils/securityLogs";

interface AppSecurityProps {
  isEmbedded?: boolean;
}

export default function AppSecurity({ isEmbedded = false }: AppSecurityProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState("Today, 10:15 AM");
  const [scanProgress, setScanProgress] = useState(0);

  // PIN settings state
  const [currentPin, setCurrentPin] = useState(() => {
    try {
      return localStorage.getItem("kk_device_pin") || "1234";
    } catch (e) {
      return "1234";
    }
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");
  const [pinSuccessMsg, setPinSuccessMsg] = useState("");

  // Pattern settings state
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [patternSuccessMsg, setPatternSuccessMsg] = useState("");

  const saveNewPattern = (patternToSave: number[]) => {
    if (patternToSave.length >= 3) {
      try {
        localStorage.setItem("kk_device_pattern", JSON.stringify(patternToSave));
      } catch (e) {}
      setPatternSuccessMsg(`Pattern sequence [${patternToSave.join("→")}] updated!`);
      recordSecurityLog(
        "Pattern Configuration",
        "ACCEPTED",
        `New 3x3 gesture pattern configured: [${patternToSave.join("→")}]`,
        "INFO"
      );
      setTimeout(() => {
        setPatternSuccessMsg("");
        setShowPatternModal(false);
        setNewPattern([]);
      }, 1500);
    }
  };

  // Face ID Biometric Auth State
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceScanState, setFaceScanState] = useState<"idle" | "scanning" | "success" | "failed">("idle");
  const [faceProgress, setFaceProgress] = useState(0);
  const [cameraErrMessage, setCameraErrMessage] = useState<string | null>(null);
  const [faceEnrolled, setFaceEnrolled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("kk_face_enrolled") === "true";
    } catch (e) {
      return true;
    }
  });

  // System Security Logs Category state & filter
  const [secLogs, setSecLogs] = useState<SecurityLog[]>(() => getSecurityLogs());
  const [logFilter, setLogFilter] = useState<"ALL" | "FACE_UNLOCK" | "ACCEPTED" | "REJECTED">("ALL");

  useEffect(() => {
    const handleLogUpdate = () => {
      setSecLogs(getSecurityLogs());
    };
    window.addEventListener("kk_security_log_added", handleLogUpdate);
    window.addEventListener("kk_security_logs_cleared", handleLogUpdate);
    return () => {
      window.removeEventListener("kk_security_log_added", handleLogUpdate);
      window.removeEventListener("kk_security_logs_cleared", handleLogUpdate);
    };
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopFaceCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopFaceCamera();
    };
  }, []);

  const [capturedFaceSnapshot, setCapturedFaceSnapshot] = useState<string | null>(() => {
    try {
      return localStorage.getItem("kk_face_snapshot") || null;
    } catch (e) {
      return null;
    }
  });

  const captureFaceFrame = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 200, 200);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setCapturedFaceSnapshot(dataUrl);
          localStorage.setItem("kk_face_snapshot", dataUrl);
        }
      } catch (err) {
        console.warn("Snapshot capture warning:", err);
      }
    }
  };

  const simulateFaceScanInSecurity = () => {
    stopFaceCamera();
    setShowFaceModal(true);
    setFaceScanState("scanning");
    setFaceProgress(0);
    setCameraErrMessage(null);

    // Create avatar snapshot on canvas
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, 200, 200);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(100, 90, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(100, 180, 60, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = "#10b981";
      [[100, 75], [85, 90], [115, 90], [100, 105], [90, 118], [110, 118]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      const dataUrl = canvas.toDataURL("image/png");
      setCapturedFaceSnapshot(dataUrl);
      try {
        localStorage.setItem("kk_face_snapshot", dataUrl);
      } catch (e) {}
    }

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      if (prog >= 100) {
        clearInterval(interval);
        setFaceProgress(100);
        setFaceScanState("success");
        setFaceEnrolled(true);
        try {
          localStorage.setItem("kk_face_enrolled", "true");
          localStorage.setItem("kk_face_enrolled_at", new Date().toLocaleString());
        } catch (e) {}
      } else {
        setFaceProgress(prog);
      }
    }, 200);
  };

  const startFaceScanInSecurity = async () => {
    stopFaceCamera();
    setShowFaceModal(true);
    setFaceScanState("scanning");
    setFaceProgress(0);
    setCameraErrMessage(null);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }

      let prog = 0;
      const interval = setInterval(() => {
        prog += 15;
        if (prog === 60) {
          captureFaceFrame();
        }
        if (prog >= 100) {
          clearInterval(interval);
          captureFaceFrame();
          setFaceProgress(100);
          setFaceScanState("success");
          setFaceEnrolled(true);
          recordSecurityLog(
            "Biometric Enrollment",
            "ACCEPTED",
            "3D facial feature mesh captured & enrolled in hardware key store",
            "INFO",
            "99.8%"
          );
          try {
            localStorage.setItem("kk_face_enrolled", "true");
            localStorage.setItem("kk_face_enrolled_at", new Date().toLocaleString());
          } catch (e) {}
        } else {
          setFaceProgress(prog);
        }
      }, 200);
    } catch (err: any) {
      console.warn("Face Scan Camera Error:", err);
      setFaceScanState("failed");
      setCameraErrMessage(err?.message || "Unable to open laptop or phone camera feed");
    }
  };

  const startVirusScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setLastScanned("Just now");
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length >= 4) {
      setCurrentPin(newPinInput);
      try {
        localStorage.setItem("kk_device_pin", newPinInput);
      } catch (e) {}
      setPinSuccessMsg("Device PIN successfully updated!");
      setTimeout(() => {
        setPinSuccessMsg("");
        setShowPinModal(false);
        setNewPinInput("");
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-y-auto relative" id="app-security">
      {/* Header (Only show if not embedded inside Settings view) */}
      {!isEmbedded && (
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Security Center</h2>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
            PROTECTED
          </span>
        </div>
      )}

      {/* Main Status Shield Hero */}
      <div className="p-6 bg-gradient-to-b from-emerald-950/40 via-slate-900/60 to-slate-950 border-b border-slate-850 text-center flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <ShieldCheck size={44} />
          </div>
          {isScanning && (
            <div className="absolute inset-0 border-4 border-emerald-400 rounded-3xl animate-ping opacity-30" />
          )}
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white">Your device is safe</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Last scanned: {lastScanned}</p>
        </div>

        {/* Scan Button */}
        <button
          onClick={startVirusScan}
          disabled={isScanning}
          className="mt-1 px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCw size={14} className={isScanning ? "animate-spin" : ""} />
          {isScanning ? `Scanning System (${scanProgress}%)...` : "Quick Scan Device"}
        </button>
      </div>

      {/* Security Actions List */}
      <div className="p-3 space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Protection Suite
        </h4>

        {/* Virus Scan item */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Virus Scan</h5>
              <p className="text-[10px] text-slate-400">No threats found on internal storage</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </div>

        {/* Permission Manager */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
              <Activity size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Permission Manager</h5>
              <p className="text-[10px] text-slate-400">Manage camera, mic & location permissions</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </div>

        {/* Privacy Dashboard */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <Eye size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Privacy Dashboard</h5>
              <p className="text-[10px] text-slate-400">Monitor app background access</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </div>

        {/* App Lock */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
              <Lock size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">App Lock</h5>
              <p className="text-[10px] text-slate-400">Biometric protection for private apps</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </div>

        {/* Face ID Biometric Scanner (Laptop & Phone Camera) */}
        <div
          onClick={startFaceScanInSecurity}
          className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            {capturedFaceSnapshot ? (
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-400/80 shadow-md flex-shrink-0">
                <img src={capturedFaceSnapshot} alt="Face Snapshot" className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400 shadow-inner flex-shrink-0">
                <ScanFace size={16} />
              </div>
            )}
            <div>
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Biometric Face ID Scan</span>
                <span className="text-[9px] bg-amber-950 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-800 font-bold">
                  {faceEnrolled ? "ENROLLED" : "SETUP NEEDED"}
                </span>
              </h5>
              <p className="text-[10px] text-slate-400">
                {capturedFaceSnapshot ? "Face profile registered from camera" : "Scan face using laptop or phone camera feed"}
              </p>
            </div>
          </div>
          <ChevronRight size={14} className="text-amber-400" />
        </div>

        {/* Change Device PIN */}
        <div
          onClick={() => setShowPinModal(true)}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between cursor-pointer hover:border-teal-500/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-950 border border-teal-800 text-teal-400">
              <Lock size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Change Device PIN</span>
                <span className="text-[9px] bg-teal-950 text-teal-300 font-mono px-1.5 py-0.5 rounded border border-teal-800">
                  Current: ****
                </span>
              </h5>
              <p className="text-[10px] text-slate-400">Configure numeric lock code (Default: 1234)</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </div>

        {/* Configure 3x3 Pattern Lock */}
        <div
          onClick={() => setShowPatternModal(true)}
          className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 border border-teal-500/30 flex items-center justify-between cursor-pointer hover:border-teal-400 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-950 border border-teal-500/40 text-teal-300 shadow-inner flex-shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Configure 3x3 Pattern Lock</span>
                <span className="text-[9px] bg-teal-950 text-teal-300 font-mono px-1.5 py-0.5 rounded border border-teal-800 font-bold">
                  ACTIVE
                </span>
              </h5>
              <p className="text-[10px] text-slate-400">Set gesture dot sequence for lock screen</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-teal-400" />
        </div>

        {/* Find My Device */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Smartphone size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Find My Device</h5>
              <p className="text-[10px] text-slate-400">Location tracking active</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </div>

        {/* SECURITY LOGS CATEGORY & BIOMETRIC AUDIT TRAIL */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <FileText size={16} />
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-white flex items-center gap-2">
                  <span>Security Audit Logs</span>
                  <span className="text-[8px] bg-amber-950 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-800/80 font-bold">
                    CATEGORY: SECURITY
                  </span>
                </h5>
                <p className="text-[9.5px] text-slate-400">
                  Records Face Unlock & biometric auth attempts with timestamp & result
                </p>
              </div>
            </div>

            <button
              onClick={() => clearSecurityLogs()}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 cursor-pointer transition-colors"
              title="Clear Security Logs"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Test Simulation Quick Controls */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] font-mono text-slate-400 font-bold">Test Log Trigger:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  recordSecurityLog(
                    "Face Unlock",
                    "ACCEPTED",
                    "Test biometric facial match verified with owner profile (99.2% score)",
                    "INFO",
                    "99.2%"
                  );
                }}
                className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[9px] font-mono font-bold cursor-pointer transition-all active:scale-95"
              >
                + Accept Test
              </button>
              <button
                onClick={() => {
                  recordSecurityLog(
                    "Face Unlock",
                    "REJECTED",
                    "Test biometric facial mismatch detected - unrecognized user (12.1% score)",
                    "CRITICAL",
                    "12.1%"
                  );
                }}
                className="px-2 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[9px] font-mono font-bold cursor-pointer transition-all active:scale-95"
              >
                + Reject Test
              </button>
            </div>
          </div>

          {/* Log Filters */}
          <div className="flex items-center justify-between gap-1 text-[9px] font-mono">
            <span className="text-slate-500 flex items-center gap-1 font-semibold">
              <Filter size={10} className="text-amber-400" /> Filter Log:
            </span>
            <div className="flex items-center gap-1">
              {(["ALL", "FACE_UNLOCK", "ACCEPTED", "REJECTED"] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setLogFilter(filterKey)}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                    logFilter === filterKey
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {filterKey.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Security Log Entries List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {secLogs
              .filter((log) => {
                if (logFilter === "FACE_UNLOCK") return log.eventType === "Face Unlock";
                if (logFilter === "ACCEPTED") return log.status === "ACCEPTED";
                if (logFilter === "REJECTED") return log.status === "REJECTED";
                return true;
              })
              .length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-[10px] font-mono bg-slate-950/60 rounded-xl border border-slate-800/60">
                No security log records found for selected filter.
              </div>
            ) : (
              secLogs
                .filter((log) => {
                  if (logFilter === "FACE_UNLOCK") return log.eventType === "Face Unlock";
                  if (logFilter === "ACCEPTED") return log.status === "ACCEPTED";
                  if (logFilter === "REJECTED") return log.status === "REJECTED";
                  return true;
                })
                .map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-xl border text-[10px] font-mono transition-all ${
                      log.status === "ACCEPTED"
                        ? "bg-slate-950/90 border-emerald-900/60 hover:border-emerald-700/80"
                        : "bg-slate-950/90 border-rose-900/60 hover:border-rose-700/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-[8px] text-amber-300">
                          {log.category}
                        </span>
                        <span className="font-bold text-slate-200">{log.eventType}</span>
                        {log.confidence && (
                          <span className="text-[8px] text-slate-400">({log.confidence})</span>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase border ${
                          log.status === "ACCEPTED"
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                            : "bg-rose-950 text-rose-400 border-rose-800"
                        }`}
                      >
                        {log.status === "ACCEPTED" ? "✓ ACCEPTED" : "✕ REJECTED"}
                      </span>
                    </div>

                    <p className="text-[9px] text-slate-300 leading-tight mb-1">{log.details}</p>

                    <div className="flex items-center justify-between text-[8px] text-slate-500 pt-1 border-t border-slate-900">
                      <span className="flex items-center gap-1">
                        <Clock size={9} className="text-slate-400" />
                        <span>{log.timestamp}</span>
                      </span>
                      <span
                        className={
                          log.severity === "CRITICAL"
                            ? "text-rose-400 font-bold"
                            : log.severity === "WARNING"
                            ? "text-amber-400 font-bold"
                            : "text-emerald-400"
                        }
                      >
                        SEVERITY: {log.severity}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Change PIN Modal Overlay */}
      {showPinModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md p-5 flex flex-col justify-center items-center z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <Lock size={16} />
                <span>Security PIN Settings</span>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="text-slate-500 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300">
              Set a new 4-digit PIN code for system security authorization.
            </p>

            <form onSubmit={handleSavePin} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 4 digits (e.g. 5678)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 outline-none focus:border-teal-500 tracking-widest text-center"
                />
              </div>

              {pinSuccessMsg && (
                <p className="text-[10px] text-emerald-400 font-bold text-center animate-pulse">
                  ✓ {pinSuccessMsg}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPinInput.length < 4}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3x3 Gesture Pattern Modal */}
      {showPatternModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl p-4 flex flex-col justify-between items-center z-50 animate-in fade-in zoom-in-95 duration-200 text-white">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-teal-400" />
              <div>
                <h3 className="text-xs font-bold text-white">3x3 Pattern Lock Setup</h3>
                <p className="text-[9px] text-slate-400">Record a new unlock gesture sequence</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPatternModal(false);
                setNewPattern([]);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Interactive Pattern Recorder Grid */}
          <div className="flex flex-col items-center gap-3 my-auto w-full max-w-xs">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-teal-300">
                {newPattern.length === 0
                  ? "Tap or drag across dots (at least 3)"
                  : `Sequence Selected: [${newPattern.join(" → ")}]`}
              </p>
              {patternSuccessMsg && (
                <p className="text-[10px] text-emerald-400 font-extrabold animate-pulse">
                  ✓ {patternSuccessMsg}
                </p>
              )}
            </div>

            <div className="relative w-56 h-56 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 touch-none select-none shadow-2xl flex items-center justify-center cursor-pointer overflow-hidden">
              {/* Connected Lines SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {newPattern.map((nodeIdx, i) => {
                  if (i === 0) return null;
                  const prevIdx = newPattern[i - 1];
                  const p1 = { x: ((prevIdx % 3) + 0.5) * (224 / 3), y: (Math.floor(prevIdx / 3) + 0.5) * (224 / 3) };
                  const p2 = { x: ((nodeIdx % 3) + 0.5) * (224 / 3), y: (Math.floor(nodeIdx / 3) + 0.5) * (224 / 3) };
                  return (
                    <line
                      key={`line-${i}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#2dd4bf"
                      strokeWidth="5"
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 8px rgba(45,212,191,0.8))" }}
                    />
                  );
                })}
              </svg>

              {/* 3x3 Nodes */}
              <div className="grid grid-cols-3 grid-rows-3 gap-5 w-full h-full relative z-20">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                  const isSelected = newPattern.includes(index);
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (!newPattern.includes(index)) {
                          setNewPattern((prev) => [...prev, index]);
                        }
                      }}
                      className="flex items-center justify-center relative cursor-pointer"
                    >
                      <div
                        className={`w-11 h-11 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected
                            ? "bg-teal-500/30 border-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.8)] scale-110"
                            : "bg-slate-950 border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full transition-all ${
                            isSelected ? "bg-teal-300 shadow" : "bg-slate-600"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={() => setNewPattern([])}
                className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => saveNewPattern(newPattern)}
                disabled={newPattern.length < 3}
                className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-slate-950 font-bold text-xs cursor-pointer shadow"
              >
                Save Pattern
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Face ID Biometric Camera Scanner Modal */}
      {showFaceModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl p-4 flex flex-col justify-between items-center z-50 animate-in fade-in zoom-in-95 duration-200 text-white">
          {/* Header */}
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ScanFace size={18} className="text-amber-400" />
              <div>
                <h3 className="text-xs font-bold text-white">Biometric Face Registration</h3>
                <p className="text-[9px] text-slate-400">Laptop / Phone Camera Stream</p>
              </div>
            </div>

            <button
              onClick={() => {
                stopFaceCamera();
                setShowFaceModal(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Viewfinder Circle with live video stream & Framer Motion smooth scaling animation */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{
              scale: faceScanState === "scanning" ? [0.98, 1.05, 0.98] : faceScanState === "success" ? [1, 1.08, 1] : 1,
              opacity: 1,
              boxShadow:
                faceScanState === "scanning"
                  ? [
                      "0 0 20px rgba(251,191,36,0.25)",
                      "0 0 45px rgba(251,191,36,0.6)",
                      "0 0 20px rgba(251,191,36,0.25)"
                    ]
                  : faceScanState === "success"
                  ? "0 0 40px rgba(16,185,129,0.5)"
                  : "0 0 25px rgba(244,63,94,0.4)"
            }}
            transition={{
              scale:
                faceScanState === "scanning"
                  ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.4, ease: "easeOut" },
              boxShadow:
                faceScanState === "scanning"
                  ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.4 }
            }}
            className={`relative w-52 h-52 rounded-full overflow-hidden border-2 my-auto flex items-center justify-center transition-colors duration-300 ${
              faceScanState === "success"
                ? "border-emerald-400 bg-emerald-950/40"
                : faceScanState === "failed"
                ? "border-rose-500 bg-rose-950/40"
                : "border-amber-400/90 bg-black"
            }`}
          >
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Scanning Laser Beam Grid & Motion target overlay */}
            {faceScanState === "scanning" && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                <motion.div
                  animate={{ y: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] my-auto"
                />
                <div className="absolute inset-4 border border-dashed border-amber-300/40 rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-24 w-20 border-2 border-amber-400/80 rounded-[50%]"
                  />
                </div>
              </div>
            )}

            {faceScanState === "success" && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "backOut" }}
                className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3 z-10"
              >
                <CheckCircle2 size={42} className="text-emerald-400 animate-bounce" />
                <p className="text-xs font-extrabold text-emerald-200 mt-1">Face Enrolled!</p>
                <p className="text-[9px] text-emerald-300/80 font-mono">Biometric Mesh Verified (99.8%)</p>
              </motion.div>
            )}

            {faceScanState === "failed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/90 p-4 flex flex-col items-center justify-center text-center space-y-1.5 z-10"
              >
                <VideoOff size={32} className="text-rose-400 animate-pulse" />
                <p className="text-[10px] font-bold text-rose-300">Camera Feed Blocked</p>
                <p className="text-[8px] text-slate-400">{cameraErrMessage || "Check laptop camera permissions."}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Progress & Controls */}
          <div className="w-full max-w-xs space-y-2 text-center">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-200">
                {faceScanState === "scanning" && "Scanning Face Geometry..."}
                {faceScanState === "success" && "Face Mesh Stored in Security Vault"}
                {faceScanState === "failed" && "Camera Access Error"}
              </h4>
              <p className="text-[9.5px] text-slate-400">
                {faceScanState === "scanning"
                  ? "Align your face in the center of your laptop/phone camera."
                  : faceScanState === "success"
                  ? "You can now unlock KK OS using your camera."
                  : "Please allow camera access in your browser."}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  faceScanState === "success"
                    ? "bg-emerald-400"
                    : faceScanState === "failed"
                    ? "bg-rose-500"
                    : "bg-gradient-to-r from-amber-400 to-teal-400"
                }`}
                style={{ width: `${faceProgress}%` }}
              />
            </div>

            <div className="flex justify-center gap-2 pt-1">
              {faceScanState === "failed" ? (
                <>
                  <button
                    onClick={startFaceScanInSecurity}
                    className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[10px] cursor-pointer shadow"
                  >
                    Retry Camera
                  </button>
                  <button
                    onClick={simulateFaceScanInSecurity}
                    className="py-1.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-[10px] cursor-pointer shadow"
                  >
                    Simulate Biometric
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    stopFaceCamera();
                    setShowFaceModal(false);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
