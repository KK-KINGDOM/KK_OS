import React, { useState, useRef, useEffect } from "react";
import {
  QrCode,
  Scan,
  Camera,
  Upload,
  Link as LinkIcon,
  Wifi,
  Copy,
  Check,
  Download,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function AppQrScanner() {
  const [activeTab, setActiveTab] = useState<"scan" | "generator">("scan");
  const [isScanning, setIsScanning] = useState(true);
  const [scannedResult, setScannedResult] = useState<{
    type: "url" | "wifi" | "text";
    content: string;
    label: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // QR Generator State
  const [qrType, setQrType] = useState<"url" | "text" | "wifi">("url");
  const [inputUrl, setInputUrl] = useState("https://ai.studio");
  const [inputText, setInputText] = useState("KK Mobile OS - Security Verified");
  const [wifiSsid, setWifiSsid] = useState("KK_Guest_5G");
  const [wifiPass, setWifiPass] = useState("SecurePass2026");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate QR Canvas Drawing
  useEffect(() => {
    if (activeTab === "generator" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 200;
      canvas.width = size;
      canvas.height = size;

      // Draw dark background & light border
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = "#38bdf8";
      const moduleCount = 21;
      const cellSize = size / moduleCount;

      // Seeded pattern generation
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          // Corner position detection patterns
          const isTopLeft = r < 7 && c < 7;
          const isTopRight = r < 7 && c >= moduleCount - 7;
          const isBottomLeft = r >= moduleCount - 7 && c < 7;

          if (isTopLeft || isTopRight || isBottomLeft) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6 || r === moduleCount - 7 || r === moduleCount - 1 || c === moduleCount - 7 || c === moduleCount - 1;
            const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4) || (r >= 2 && r <= 4 && c >= moduleCount - 5 && c <= moduleCount - 3) || (r >= moduleCount - 5 && r >= moduleCount - 3 && c >= 2 && c <= 4);
            if (isBorder || isCenter) {
              ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
          } else {
            // Random module filler based on text
            const hash = (r * 31 + c * 17 + (inputUrl.length || 5)) % 5;
            if (hash > 2) {
              ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
          }
        }
      }
    }
  }, [activeTab, qrType, inputUrl, inputText, wifiSsid, wifiPass]);

  const handleSimulateScan = (resultType: "url" | "wifi" | "text") => {
    setIsScanning(false);
    if (resultType === "url") {
      setScannedResult({
        type: "url",
        content: "https://ai.studio/build",
        label: "Google AI Studio Platform"
      });
    } else if (resultType === "wifi") {
      setScannedResult({
        type: "wifi",
        content: "WIFI:S:KK_5G_Network;P:SuperSecretPass;T:WPA;;",
        label: "Wi-Fi: KK_5G_Network"
      });
    } else {
      setScannedResult({
        type: "text",
        content: "KK Mobile OS - RSA 4096 Authenticated Security Pass",
        label: "System Security Credentials"
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <QrCode size={18} />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">QR & Barcode Scanner</h2>
            <p className="text-[9px] text-slate-400 font-mono">Camera & Generator</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
          <button
            onClick={() => setActiveTab("scan")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "scan" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "generator" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Generator
          </button>
        </div>
      </div>

      {activeTab === "scan" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
          {/* Scanner Viewfinder Box */}
          <div className="relative h-64 w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
            {/* Animated Laser Scanning Bar */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce z-10" />

            {/* Viewfinder Corners */}
            <div className="w-48 h-48 border-2 border-dashed border-cyan-400/70 rounded-2xl relative flex items-center justify-center p-2">
              <Camera size={32} className="text-cyan-400/40 animate-pulse" />
            </div>

            <p className="text-[10px] font-mono text-cyan-300 mt-3 z-10 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-800">
              Align QR Code inside frame to scan
            </p>
          </div>

          {/* Quick Preset Test Scan Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Simulate Scan Input
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSimulateScan("url")}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-xs font-bold text-cyan-300 flex flex-col items-center gap-1 cursor-pointer"
              >
                <LinkIcon size={14} />
                <span>URL Link</span>
              </button>

              <button
                onClick={() => handleSimulateScan("wifi")}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-xs font-bold text-teal-300 flex flex-col items-center gap-1 cursor-pointer"
              >
                <Wifi size={14} />
                <span>Wi-Fi Network</span>
              </button>

              <button
                onClick={() => handleSimulateScan("text")}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-xs font-bold text-amber-300 flex flex-col items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={14} />
                <span>Text / Pass</span>
              </button>
            </div>
          </div>

          {/* Scanned Result Drawer */}
          {scannedResult && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/40 space-y-2.5 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1">
                  <ShieldCheck size={12} /> SCAN SUCCESS
                </span>
                <span className="text-xs font-extrabold text-white">{scannedResult.label}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 font-mono text-xs text-slate-200 break-all">
                {scannedResult.content}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => handleCopy(scannedResult.content)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                {scannedResult.type === "url" && (
                  <a
                    href={scannedResult.content}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 cursor-pointer shadow"
                  >
                    <ExternalLink size={13} /> Open Link
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "generator" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* QR Code Canvas Box */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center space-y-3 shadow-xl">
            <canvas ref={canvasRef} className="rounded-2xl border-2 border-cyan-500/40 shadow-md" />
            <span className="text-[10px] font-mono text-slate-400">Generated QR Vector Preview</span>
          </div>

          {/* Form Inputs */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>QR Code Payload</span>
              <select
                value={qrType}
                onChange={(e) => setQrType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-cyan-400 rounded-lg px-2 py-0.5 text-xs outline-none"
              >
                <option value="url">URL</option>
                <option value="text">Plain Text</option>
                <option value="wifi">Wi-Fi</option>
              </select>
            </div>

            {qrType === "url" && (
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
              />
            )}

            {qrType === "text" && (
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Text to encode..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none resize-none"
              />
            )}

            {qrType === "wifi" && (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="SSID Network Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
                <input
                  type="password"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
