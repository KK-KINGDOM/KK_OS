/**
 * Theme & Personalization Manager for KK Mobile OS
 * Dynamically updates CSS variables across the OS shell.
 */

export interface AccentColorOption {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  hoverHex: string;
}

export const ACCENT_COLOR_PRESETS: AccentColorOption[] = [
  {
    id: "cyber_teal",
    name: "Cyber Teal",
    hex: "#06b6d4",
    rgb: "6, 182, 212",
    hoverHex: "#0891b2",
  },
  {
    id: "electric_indigo",
    name: "Electric Indigo",
    hex: "#6366f1",
    rgb: "99, 102, 241",
    hoverHex: "#4f46e5",
  },
  {
    id: "emerald_matrix",
    name: "Emerald Matrix",
    hex: "#10b981",
    rgb: "16, 185, 129",
    hoverHex: "#059669",
  },
  {
    id: "sunset_gold",
    name: "Sunset Amber",
    hex: "#f59e0b",
    rgb: "245, 158, 11",
    hoverHex: "#d97706",
  },
  {
    id: "neon_rose",
    name: "Neon Rose",
    hex: "#f43f5e",
    rgb: "244, 63, 94",
    hoverHex: "#e11d48",
  },
  {
    id: "cyber_purple",
    name: "Cyber Purple",
    hex: "#a855f7",
    rgb: "168, 85, 247",
    hoverHex: "#9333ea",
  },
];

export interface WallpaperPatternOption {
  id: string;
  name: string;
  description: string;
  cssPattern: string;
}

export const WALLPAPER_PATTERNS: WallpaperPatternOption[] = [
  {
    id: "none",
    name: "Solid / Clean",
    description: "Pure wallpaper background without overlay mesh",
    cssPattern: "none",
  },
  {
    id: "grid",
    name: "Grid Matrix",
    description: "Futuristic 20px grid line coordinates",
    cssPattern: `linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)`,
  },
  {
    id: "dots",
    name: "Dot Mesh",
    description: "Subtle 16px developer dot matrix",
    cssPattern: `radial-gradient(rgba(255, 255, 255, 0.14) 1.5px, transparent 1.5px)`,
  },
  {
    id: "slats",
    name: "Diagonal Stripes",
    description: "Dynamic angled Carbon Fibre slat texture",
    cssPattern: `repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 10px, transparent 10px, transparent 20px)`,
  },
  {
    id: "hex",
    name: "Hexagon Honeycomb",
    description: "Honeycomb geometric tech mesh",
    cssPattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v13.2l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h2v7.5L28 15v1.5l-1 1.732L14 10.732 1 18.232 0 16.5V15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  {
    id: "circuit",
    name: "Circuit Traces",
    description: "Printed circuit board node paths",
    cssPattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.07'%3E%3Cpath d='M0 38.59l28.36-28.36 1.41 1.41L1.41 40H0v-1.41zM0 1.41l38.59 38.59h-1.41L0 2.83V1.41zm20 0l20 20v1.41L18.59 1.41H20zm-20 20l20 20h-1.41L0 22.83v-1.42z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  {
    id: "topography",
    name: "Topographic Contours",
    description: "Elevation contour terrain map vector",
    cssPattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M0,20 Q20,5 40,20 T80,20 M0,40 Q20,25 40,40 T80,40 M0,60 Q20,45 40,60 T80,60' fill='none' stroke='%23ffffff' stroke-opacity='0.08' stroke-width='1.5'/%3E%3C/svg%3E")`,
  },
  {
    id: "cybergrid",
    name: "Retro Synthwave Grid",
    description: "Perspective cyber grid lines with horizon glow",
    cssPattern: `linear-gradient(0deg, rgba(34, 211, 238, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.12) 1px, transparent 1px)`,
  },
];

export interface OSThemeConfig {
  accentHex: string;
  accentRgb: string;
  patternId: string;
  themeMode: "dark" | "cyber" | "midnight";
}

export function hexToRgb(hex: string): string {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return "6, 182, 212";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

export const DEFAULT_THEME: OSThemeConfig = {
  accentHex: "#06b6d4",
  accentRgb: "6, 182, 212",
  patternId: "grid",
  themeMode: "dark",
};

export function getStoredThemeConfig(): OSThemeConfig {
  if (typeof localStorage === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem("kk_os_theme_config");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return DEFAULT_THEME;
}

export function applyThemeConfig(config: OSThemeConfig) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const rgb = config.accentRgb || hexToRgb(config.accentHex);

  // Set CSS Custom Properties
  root.style.setProperty("--os-accent", config.accentHex);
  root.style.setProperty("--os-accent-rgb", rgb);

  // Find pattern
  const pattern = WALLPAPER_PATTERNS.find((p) => p.id === config.patternId) || WALLPAPER_PATTERNS[1];
  root.style.setProperty("--os-pattern-style", pattern.cssPattern);
  root.style.setProperty(
    "--os-pattern-size",
    config.patternId === "dots"
      ? "16px 16px"
      : config.patternId === "grid"
      ? "20px 20px"
      : "auto"
  );

  // Save to localStorage
  try {
    localStorage.setItem("kk_os_theme_config", JSON.stringify(config));
  } catch (e) {}

  // Dispatch event for reactive components
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kk_theme_changed", {
        detail: config,
      })
    );
  }
}
