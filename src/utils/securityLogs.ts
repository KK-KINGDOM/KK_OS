import { playLogSound } from "./sound";

export interface SecurityLog {
  id: string;
  timestamp: string;
  category: "Security";
  eventType: "Face Unlock" | "PIN Entry" | "Biometric Enrollment" | "System Scan" | "Pattern Unlock" | "Pattern Configuration" | "Lost Device Recovery" | "Screen Capture";
  status: "ACCEPTED" | "REJECTED";
  details: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  confidence?: string;
}

const STORAGE_KEY = "kk_security_logs";

export const getSecurityLogs = (): SecurityLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const now = new Date();
      const defaultLogs: SecurityLog[] = [
        {
          id: "sec-init-1",
          timestamp: new Date(now.getTime() - 3600000 * 2).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          category: "Security",
          eventType: "Face Unlock",
          status: "ACCEPTED",
          details: "Biometric facial match verified with stored template (99.4% confidence)",
          severity: "INFO",
          confidence: "99.4%"
        },
        {
          id: "sec-init-2",
          timestamp: new Date(now.getTime() - 3600000 * 5).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          category: "Security",
          eventType: "Face Unlock",
          status: "REJECTED",
          details: "Unrecognized facial structure - distance matrix delta > 0.88. Access denied.",
          severity: "CRITICAL",
          confidence: "11.2%"
        },
        {
          id: "sec-init-3",
          timestamp: new Date(now.getTime() - 3600000 * 12).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          category: "Security",
          eventType: "Biometric Enrollment",
          status: "ACCEPTED",
          details: "Facial 3D feature mesh template captured and enrolled in secure hardware vault.",
          severity: "INFO",
          confidence: "100.0%"
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLogs));
      return defaultLogs;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const recordSecurityLog = (
  eventType: "Face Unlock" | "PIN Entry" | "Biometric Enrollment" | "System Scan" | "Pattern Unlock" | "Pattern Configuration" | "Lost Device Recovery" | "Screen Capture",
  status: "ACCEPTED" | "REJECTED",
  details: string,
  severity: "INFO" | "WARNING" | "CRITICAL" = status === "ACCEPTED" ? "INFO" : "CRITICAL",
  confidence?: string
): SecurityLog => {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + `, ${new Date().toLocaleDateString([], { month: "short", day: "numeric" })}`;
  const newLog: SecurityLog = {
    id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    category: "Security",
    eventType,
    status,
    details,
    severity,
    confidence
  };

  try {
    playLogSound(severity);
    const existing = getSecurityLogs();
    const updated = [newLog, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("kk_security_log_added", { detail: newLog }));
  } catch (e) {}

  return newLog;
};

export const clearSecurityLogs = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("kk_security_logs_cleared"));
  } catch (e) {}
};
