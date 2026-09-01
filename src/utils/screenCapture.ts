import { AppID } from "../types";
import { playShutterSound } from "./sound";
import { triggerHapticVibration } from "./haptics";
import { saveGalleryItem, GalleryItem } from "./galleryStorage";
import { recordSecurityLog } from "./securityLogs";

export interface ScreenshotDetails {
  id: string;
  title: string;
  filename: string;
  filePath: string;
  url: string;
  thumbnailUrl: string;
  timestamp: string;
  timestampMs: number;
  size: string;
  dimensions: string;
  folder: string;
  activeAppId?: AppID | null;
  activeAppName?: string;
}

export interface CaptureOptions {
  title?: string;
  activeAppId?: AppID | null;
  activeAppName?: string;
  batteryLevel?: number;
  currentTime?: string;
  wallpaperName?: string;
  openToastImmediately?: boolean;
  onSystemLog?: (text: string, severity?: "INFO" | "WARNING" | "CRITICAL") => void;
}

/**
 * Programmatically generates a high-fidelity visual screenshot of the KK Mobile OS screen
 * capturing the active app state, status bar, wallpaper theme, and system UI.
 */
export function generateScreenCanvas(options: CaptureOptions): string {
  if (typeof document === "undefined") return "";

  const width = 360;
  const height = 740;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  const now = new Date();
  const timeStr = options.currentTime || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const battery = options.batteryLevel !== undefined ? options.batteryLevel : 85;
  const isAppActive = Boolean(options.activeAppId);
  const appName = options.activeAppName || (options.activeAppId ? options.activeAppId.toUpperCase() : "Home Screen");

  // 1. Draw Wallpaper / Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (isAppActive) {
    bgGrad.addColorStop(0, "#030712");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
  } else {
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(0.35, "#1e1035");
    bgGrad.addColorStop(0.7, "#0c1e30");
    bgGrad.addColorStop(1, "#020617");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Background ambient circles
  const circleGrad = ctx.createRadialGradient(width * 0.7, height * 0.3, 10, width * 0.7, height * 0.3, 180);
  circleGrad.addColorStop(0, "rgba(56, 189, 248, 0.18)");
  circleGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
  ctx.fillStyle = circleGrad;
  ctx.fillRect(0, 0, width, height);

  const circleGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.7, 10, width * 0.2, height * 0.7, 160);
  circleGrad2.addColorStop(0, "rgba(168, 85, 247, 0.15)");
  circleGrad2.addColorStop(1, "rgba(168, 85, 247, 0)");
  ctx.fillStyle = circleGrad2;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Status Bar
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, width, 32);

  // Status Bar Clock
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 12px monospace";
  ctx.fillText(timeStr, 16, 20);

  // Status Bar Camera Notch Pill
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect(width / 2 - 50, 0, 100, 18, [0, 0, 12, 12]);
  ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(width / 2, 8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Status Bar Icons (5G, WiFi, Battery)
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 9px monospace";
  ctx.fillText("5G", width - 82, 20);

  // Battery bar
  ctx.fillStyle = "#475569";
  ctx.fillRect(width - 45, 12, 28, 11);
  ctx.fillStyle = battery > 20 ? "#10b981" : "#f43f5e";
  ctx.fillRect(width - 43, 14, Math.max(2, (24 * battery) / 100), 7);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 8px monospace";
  ctx.fillText(`${battery}%`, width - 42, 20);

  // 3. Draw Body Content (Active App or Launcher Grid)
  if (isAppActive) {
    // App Header Bar
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 32, width, 44);
    ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 76);
    ctx.lineTo(width, 76);
    ctx.stroke();

    // App Title
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(appName, 20, 58);

    ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
    ctx.beginPath();
    ctx.roundRect(width - 90, 42, 75, 22, 11);
    ctx.fill();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px monospace";
    ctx.fillText("RUNNING", width - 78, 56);

    // App Content Cards
    const cardYStart = 90;
    for (let i = 0; i < 4; i++) {
      const cardY = cardYStart + i * 130;
      if (cardY + 110 > height - 60) break;

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, cardY, width - 32, 115, 14);
      ctx.fill();
      ctx.stroke();

      // Card Header
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`${appName} Module #${i + 1}`, 30, cardY + 26);

      // Card lines
      ctx.fillStyle = "rgba(226, 232, 240, 0.7)";
      ctx.fillRect(30, cardY + 42, width - 60, 6);
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.fillRect(30, cardY + 56, width - 110, 6);
      ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
      ctx.fillRect(30, cardY + 70, width - 80, 6);

      // Card metric tag
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.beginPath();
      ctx.roundRect(30, cardY + 86, 80, 18, 6);
      ctx.fill();
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 8px monospace";
      ctx.fillText("STATUS: OK", 38, cardY + 98);
    }
  } else {
    // Launcher Widget
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(16, 50, width - 32, 95, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 32px monospace";
    ctx.fillText(timeStr, 32, 96);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("KK Mobile OS • Microkernel v1.4", 32, 126);

    // Launcher 4x4 App Grid Mock
    const gridCols = 4;
    const gridRows = 4;
    const cellW = (width - 40) / gridCols;
    const startY = 165;

    const appColors = [
      ["#0284c7", "#0369a1"],
      ["#10b981", "#047857"],
      ["#8b5cf6", "#6d28d9"],
      ["#f59e0b", "#d97706"],
      ["#ec4899", "#be185d"],
      ["#06b6d4", "#0891b2"],
      ["#6366f1", "#4338ca"],
      ["#14b8a6", "#0f766e"],
      ["#ef4444", "#b91c1c"],
      ["#84cc16", "#4d7c0f"],
      ["#3b82f6", "#1d4ed8"],
      ["#eab308", "#ca8a04"]
    ];

    const appNames = [
      "Phone", "Messages", "Camera", "Gallery",
      "Terminal", "Files", "AI Assistant", "Security",
      "Settings", "Browser", "Music", "Weather"
    ];

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const idx = r * gridCols + c;
        if (idx >= appNames.length) break;

        const iconX = 20 + c * cellW + cellW / 2 - 22;
        const iconY = startY + r * 78;

        // App Icon
        const [c1, c2] = appColors[idx % appColors.length];
        const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + 44, iconY + 44);
        iconGrad.addColorStop(0, c1);
        iconGrad.addColorStop(1, c2);

        ctx.fillStyle = iconGrad;
        ctx.beginPath();
        ctx.roundRect(iconX, iconY, 44, 44, 14);
        ctx.fill();

        // Inner icon shine
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Icon label
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "500 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(appNames[idx], iconX + 22, iconY + 56);
        ctx.textAlign = "start";
      }
    }

    // Dock
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(16, height - 90, width - 32, 54, 24);
    ctx.fill();
    ctx.stroke();

    // 4 Dock Icons
    const dockCols = ["#10b981", "#06b6d4", "#64748b", "#0284c7"];
    for (let d = 0; d < 4; d++) {
      const dx = 32 + d * 75;
      ctx.fillStyle = dockCols[d];
      ctx.beginPath();
      ctx.roundRect(dx, height - 83, 40, 40, 14);
      ctx.fill();
    }
  }

  // 4. Virtual Navigation Bar
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, height - 28, width, 28);
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.roundRect(width / 2 - 25, height - 16, 50, 4, 2);
  ctx.fill();

  // Watermark / Tag
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "8px monospace";
  ctx.fillText("KK-MOBILE-OS SCREENSHOT", 12, height - 10);

  return canvas.toDataURL("image/png");
}

/**
 * Executes a full screen capture action:
 * - Creates visual snapshot
 * - Triggers screen flash animation
 * - Plays camera shutter sound
 * - Triggers tactile vibration
 * - Saves thumbnail into Gallery store
 * - Displays persistent screenshot toast
 */
export function captureScreen(options: CaptureOptions = {}): ScreenshotDetails {
  const timestampMs = Date.now();
  const now = new Date(timestampMs);

  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const filename = `Screenshot_${dateStr}_${timeStr}.png`;
  const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // 1. Generate full-resolution snapshot data URL
  const dataUrl = generateScreenCanvas(options);

  const screenshotItem: ScreenshotDetails = {
    id: `screenshot_${timestampMs}`,
    title: options.title || `Screenshot ${dateStr}_${timeStr}`,
    filename,
    filePath: `/KK-Mobile-OS/sdcard/DCIM/Screenshots/${filename}`,
    url: dataUrl,
    thumbnailUrl: dataUrl,
    timestamp: formattedTime,
    timestampMs,
    size: "1.8 MB",
    dimensions: "1080x2400",
    folder: "/KK-Mobile-OS/sdcard/DCIM/Screenshots",
    activeAppId: options.activeAppId,
    activeAppName: options.activeAppName
  };

  // 2. Save into Gallery Store
  const galleryPhoto: GalleryItem = {
    id: screenshotItem.id,
    url: dataUrl,
    title: screenshotItem.title,
    isCustom: true,
    isScreenshot: true,
    category: "screenshot",
    timestamp: timestampMs,
    size: screenshotItem.size,
    dimensions: screenshotItem.dimensions
  };
  saveGalleryItem(galleryPhoto);

  // 3. Audio & Haptic Feedback
  playShutterSound();
  triggerHapticVibration("medium");

  // 4. Log to Security Daemon & System Kernel
  recordSecurityLog(
    "Screen Capture",
    "ACCEPTED",
    `Framebuffer captured -> ${filename} saved to Gallery / Screenshots`,
    "INFO",
    "100.0%"
  );

  options.onSystemLog?.(
    `[ScreenCaptureHAL] Framebuffer snapshot captured (1080x2400) -> Saved to /sdcard/DCIM/Screenshots/${filename}`,
    "INFO"
  );

  // 5. Emit Screen Flash event
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kk_screen_flash", {
        detail: {
          screenshot: screenshotItem
        }
      })
    );

    // 6. Emit Persistent Screenshot Toast event
    window.dispatchEvent(
      new CustomEvent("kk_persistent_screenshot_toast", {
        detail: {
          screenshot: screenshotItem
        }
      })
    );
  }

  return screenshotItem;
}

/**
 * Subscribes to screen flash animation events
 */
export function addScreenFlashListener(
  callback: (detail: { screenshot: ScreenshotDetails }) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail);
    }
  };
  window.addEventListener("kk_screen_flash", handler);
  return () => {
    window.removeEventListener("kk_screen_flash", handler);
  };
}

/**
 * Subscribes to persistent screenshot toast events
 */
export function addScreenshotToastListener(
  callback: (detail: { screenshot: ScreenshotDetails }) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail);
    }
  };
  window.addEventListener("kk_persistent_screenshot_toast", handler);
  return () => {
    window.removeEventListener("kk_persistent_screenshot_toast", handler);
  };
}
