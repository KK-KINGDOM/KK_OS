import { logSearchActivity } from "../lib/firebase";
import emailjs from '@emailjs/browser';
import { emitToParent } from "./socket";

export const PARENTAL_PHONE_KEY = "parental_phone_number";
export const CHILD_NAME_KEY = "child_name";
export const CHILD_EMAIL_KEY = "child_email";
export const PARENTAL_LOCAL_LOGS_KEY = "parental_local_activity_logs";

export interface ChildActivityLog {
  id: string;
  parentPhone: string;
  query: string;
  appSource: string;
  category: "search" | "ai_prompt" | "app_launch" | "message" | "call" | "security" | "system";
  timestamp: string;
}

/**
 * Retrieve the registered parent phone number from local storage
 */
export function getRegisteredParentPhone(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PARENTAL_PHONE_KEY);
}

export function getChildName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CHILD_NAME_KEY);
}

export function getChildEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CHILD_EMAIL_KEY);
}

/**
 * Register or update the parent phone number and dispatch status
 */
export function setRegisteredParentPhone(phone: string, childName?: string, childEmail?: string): void {
  if (typeof window === "undefined") return;
  const cleanPhone = phone.trim();
  localStorage.setItem(PARENTAL_PHONE_KEY, cleanPhone);
  if (childName) localStorage.setItem(CHILD_NAME_KEY, childName.trim());
  if (childEmail) localStorage.setItem(CHILD_EMAIL_KEY, childEmail.trim());
}

/**
 * Clear the registered parent phone number
 */
export function removeRegisteredParentPhone(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PARENTAL_PHONE_KEY);
}

/**
 * Dispatches a real-time parent notification event to the OS window (if needed)
 */
export function dispatchParentNotificationDirect(
  title: string,
  message: string,
  severity: "INFO" | "WARNING" | "CRITICAL" = "INFO",
  sender?: string
) {
  // Silent or opt-in only
}

/**
 * Log child activity (Searches, AI Prompts, Messages, Calls, App Launches, Files)
 * Mirrors it to Firestore and local storage silently without spamming toast alerts
 */
export function recordChildActivity(
  queryOrAction: string,
  appSource: string,
  category: ChildActivityLog["category"] = "search"
): ChildActivityLog {
  const parentPhone = getRegisteredParentPhone() || "";
  const nowIso = new Date().toISOString();

  const newLog: ChildActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    parentPhone,
    query: queryOrAction,
    appSource,
    category,
    timestamp: nowIso
  };

  // 1. Save to local storage for access
  if (typeof window !== "undefined") {
    try {
      const existingRaw = localStorage.getItem(PARENTAL_LOCAL_LOGS_KEY);
      const existingLogs: ChildActivityLog[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedLogs = [newLog, ...existingLogs].slice(0, 150);
      localStorage.setItem(PARENTAL_LOCAL_LOGS_KEY, JSON.stringify(updatedLogs));
    } catch (err) {
      console.warn("Could not save log to localStorage", err);
    }
  }

  // 2. Mirror to Firestore if online
  if (parentPhone) {
    try {
      logSearchActivity(parentPhone, queryOrAction, appSource);
    } catch (err) {
      console.warn("Firestore logging failed", err);
    }
  }

  // 3. Send Email Alert via EmailJS
  const parentEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
  const childName = typeof window !== "undefined" ? (localStorage.getItem("child_name") || "Your Child") : "Your Child";

  if (parentEmail) {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
    const templateId = import.meta.env.VITE_EMAILJS_ACTIVITY_TEMPLATE_ID || "";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

    if (serviceId && templateId && publicKey && templateId !== "your_activity_template_id_here") {
      emailjs.send(
        serviceId,
        templateId,
        {
          to_email: parentEmail,
          child_name: childName,
          action: queryOrAction,
          app_name: appSource,
          timestamp: new Date().toLocaleTimeString()
        },
        publicKey
      ).catch(err => {
        console.warn("Failed to send activity email alert", err);
      });
    }
  }

  // 4. Emit to Real-time WebSockets
  emitToParent({
    type: "ACTIVITY_LOG",
    data: newLog
  });

  return newLog;
}

/**
 * Retrieve local cached activity logs
 */
export function getLocalChildActivityLogs(filterPhone?: string): ChildActivityLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PARENTAL_LOCAL_LOGS_KEY);
    if (!raw) return [];
    const logs: ChildActivityLog[] = JSON.parse(raw);
    if (filterPhone) {
      return logs.filter((l) => !l.parentPhone || l.parentPhone === filterPhone);
    }
    return logs;
  } catch (err) {
    return [];
  }
}

/**
 * Clear local activity logs
 */
export function clearLocalChildActivityLogs(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PARENTAL_LOCAL_LOGS_KEY);
}
