import React, { useState } from "react";
import { Folder, FileText, Cpu, BookOpen, Terminal, Code, AlertTriangle, AlertOctagon, ShieldAlert, Zap } from "lucide-react";
import { KK_OS_FILE_TREE } from "../mockOSData";
import { OSFile, LogSeverity } from "../types";

interface ArchitectureInfoProps {
  systemLogs: string[];
  onClearLogs: () => void;
  onSystemLog?: (log: string, severity?: LogSeverity) => void;
}

export default function ArchitectureInfo({ systemLogs, onClearLogs, onSystemLog }: ArchitectureInfoProps) {
  const [selectedArchNode, setSelectedArchNode] = useState<OSFile | null>(KK_OS_FILE_TREE);

  const findDescription = (node: OSFile): string => {
    if (node.name === "KK-Mobile-OS") return "The root directory holding all operating system boot modules, core kernel subsystems, physical hardware abstractions, system applications, and testing frameworks.";
    if (node.name === "boot") return "Handles critical system initialization. Holds the grub bootloader configuration, splash images, recovery images for factory restoration, and fastboot unlock interfaces.";
    if (node.name === "kernel") return "The C-based custom microkernel. Manages buddy allocation memory algorithms, process tables, the Completely Fair Scheduler (CFS), Virtual File System (VFS), device drivers, networking protocols, and system power saving policies.";
    if (node.name === "hardware") return "The physical specifications abstraction layers including the octa-core ARM processor specifications, OLED display panels, IMX main cameras, wireless cards, and bio sensors.";
    if (node.name === "framework") return "The TypeScript/JS background manager. Exposes package managers, system notifications controllers, windows composition drivers, active activity intent registers, and runtime security sandboxes.";
    if (node.name === "system_apps") return "High-performance preloaded native systems designed to operate securely within sandbox sandboxes. Features the launcher, settings dashboard, developer shell terminal, and deep Gemini AI Assistant integrations.";
    if (node.name === "documentation") return "Human-readable guides, technical layer diagrams, and software developer kit (SDK) setup environment files.";
    
    return `Contains code modules, binary assets, and specifications mapping to the physical ${node.name} subsystems. Select file nodes in the Explorer app on the phone to view internal codes.`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800 text-slate-300 font-sans p-4 space-y-4 overflow-y-auto" id="arch-panel">
      {/* Overview Intro Card */}
      <div className="space-y-1.5 pb-3 border-b border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1.5">
          <Cpu size={14} className="text-teal-400" />
          KK-Mobile-OS Architecture
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          An interactive full-stack simulation of a modular Unix-like mobile operating system. 
          The left console displays the physical phone chassis running system apps. Below is the active kernel logging stream, interactive toast triggers, and structural design maps.
        </p>
      </div>

      {/* SYSTEM EVENT TOAST TEST TRIGGERS */}
      {onSystemLog && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-400 animate-pulse" />
              Toast Event Trigger Suite
            </h3>
            <span className="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-mono font-bold">
              Test Severity Toast
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* Warning Trigger 1 */}
            <button
              onClick={() =>
                onSystemLog(
                  "[KernelCore] Thermal throttling active on CPU Core #3 (88°C). CPU clock frequency reduced.",
                  "WARNING"
                )
              }
              className="p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/50 border border-amber-800/60 text-amber-300 text-[10px] font-bold flex flex-col items-center gap-1 text-center transition-all cursor-pointer hover:scale-102"
            >
              <AlertTriangle size={14} className="text-amber-400" />
              <span>Thermal Warning</span>
            </button>

            {/* Warning Trigger 2 */}
            <button
              onClick={() =>
                onSystemLog(
                  "[SELinux] Security policy overridden to PERMISSIVE by developer tool (PID 1042).",
                  "WARNING"
                )
              }
              className="p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/50 border border-amber-800/60 text-amber-300 text-[10px] font-bold flex flex-col items-center gap-1 text-center transition-all cursor-pointer hover:scale-102"
            >
              <ShieldAlert size={14} className="text-amber-400" />
              <span>SELinux Warning</span>
            </button>

            {/* Critical Trigger 1 */}
            <button
              onClick={() =>
                onSystemLog(
                  "[SecurityFramework] Memory isolation violation: Unauthorized address write at 0x7FFF0042!",
                  "CRITICAL"
                )
              }
              className="p-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 text-[10px] font-bold flex flex-col items-center gap-1 text-center transition-all cursor-pointer hover:scale-102"
            >
              <AlertOctagon size={14} className="text-rose-400 animate-pulse" />
              <span>Memory Fault</span>
            </button>

            {/* Critical Trigger 2 */}
            <button
              onClick={() =>
                onSystemLog(
                  "[PowerHAL] Battery voltage critically low (2%). Kernel panic shutdown imminent!",
                  "CRITICAL"
                )
              }
              className="p-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 text-[10px] font-bold flex flex-col items-center gap-1 text-center transition-all cursor-pointer hover:scale-102"
            >
              <AlertOctagon size={14} className="text-rose-400 animate-pulse" />
              <span>Low Battery Critical</span>
            </button>
          </div>
        </div>
      )}

      {/* Directory Browser Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen size={13} className="text-teal-400" />
            File Tree Overview
          </h3>
          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">
            Interactive Node Map
          </span>
        </div>

        {/* Dynamic description of selected file-tree module */}
        {selectedArchNode && (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-850/60 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white font-mono text-[11px]">
              {selectedArchNode.type === "directory" ? <Folder size={12} className="text-teal-400" /> : <FileText size={12} className="text-slate-400" />}
              <span>{selectedArchNode.name} /</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {findDescription(selectedArchNode)}
            </p>
          </div>
        )}

        {/* Tree Map selection buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
          {[
            KK_OS_FILE_TREE,
            ...KK_OS_FILE_TREE.children || []
          ].slice(0, 7).map((node, i) => (
            <button
              key={i}
              onClick={() => setSelectedArchNode(node)}
              className={`p-2 rounded-lg border text-left transition-all text-[11px] flex items-center gap-1.5 cursor-pointer hover:bg-slate-900/40 ${
                selectedArchNode?.name === node.name
                  ? "border-teal-500/50 bg-teal-950/20 text-white font-bold"
                  : "border-slate-850 bg-slate-950/60 text-slate-400"
              }`}
            >
              <Folder size={11} className={selectedArchNode?.name === node.name ? "text-teal-400" : "text-slate-600"} />
              <span className="truncate">{node.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Logger stream */}
      <div className="space-y-2 pt-2 flex-1 flex flex-col min-h-[180px]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Terminal size={13} className="text-teal-400" />
            Active dmesg / Kernel Log Stream
          </h3>
          <button
            onClick={onClearLogs}
            className="text-[9px] font-bold text-slate-500 hover:text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          >
            Clear Ring
          </button>
        </div>

        {/* Log content box */}
        <div className="flex-1 rounded-xl bg-black border border-slate-850 p-2.5 font-mono text-[10px] leading-relaxed overflow-y-auto max-h-[220px] scrollbar-thin space-y-1 select-text">
          {systemLogs.length === 0 ? (
            <span className="text-slate-600 italic">No ring buffer events queued. Interact with the phone to trigger hardware/activity logs.</span>
          ) : (
            systemLogs.map((log, index) => {
              let textClass = "text-slate-400";
              const upper = log.toUpperCase();
              if (upper.includes("CRITICAL") || upper.includes("FATAL") || upper.includes("PANIC")) {
                textClass = "text-rose-400 font-bold bg-rose-950/30 px-1 rounded";
              } else if (upper.includes("WARNING") || upper.includes("WARN") || upper.includes("ALERT")) {
                textClass = "text-amber-400 font-bold bg-amber-950/30 px-1 rounded";
              } else if (log.includes("[KernelCore]")) {
                textClass = "text-teal-400";
              } else if (log.includes("[ActivityManager]")) {
                textClass = "text-purple-400";
              } else if (log.includes("[PowerHAL]")) {
                textClass = "text-cyan-400";
              } else if (log.includes("[Bootloader]")) {
                textClass = "text-yellow-400";
              }

              return (
                <div key={index} className="break-all whitespace-pre-wrap">
                  <span className={textClass}>{log}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Suggested guidelines */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 space-y-1.5">
        <h4 className="text-[11px] font-bold text-white uppercase flex items-center gap-1">
          <Code size={12} className="text-teal-400" />
          KK Developers Guide
        </h4>
        <ul className="text-[10px] text-slate-400 space-y-1 list-disc pl-3.5 leading-relaxed">
          <li>Click the <span className="text-amber-400 font-semibold">Toast Event Triggers</span> above to simulate live WARNING and CRITICAL system toasts over the PhoneShell.</li>
          <li>Open <span className="text-slate-200 font-semibold">Settings &gt; Dev Options</span> on the phone to toggle SELinux or App Sandbox and trigger security alerts.</li>
          <li>Launch the <span className="text-slate-200 font-semibold">Terminal</span> and type <code className="text-teal-400 bg-black px-1 rounded font-mono">warn &lt;msg&gt;</code> or <code className="text-teal-400 bg-black px-1 rounded font-mono">critical &lt;msg&gt;</code> to issue customized toast alerts!</li>
        </ul>
      </div>
    </div>
  );
}

