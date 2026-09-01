/**
 * Dynamic Wallpaper Engine for KK Mobile OS
 * Controls auto-cycling between abstract patterns, gradients, and custom themes with smooth transitions.
 */

import { Wallpaper } from "../types";
import { WALLPAPERS } from "../mockOSData";
import { WALLPAPER_PATTERNS } from "./theme";

export type TransitionStyle = "crossfade" | "zoom-fade" | "drift" | "blur-fade";
export type ParticleEffect = "none" | "orbs" | "sparkles" | "cyber-grid" | "aurora";

export interface CustomGradient {
  id: string;
  name: string;
  type: "linear" | "radial" | "conic";
  angle: number;
  colorStart: string;
  colorMid?: string;
  colorEnd: string;
  patternId?: string;
  createdAt: number;
}

export interface DynamicWallpaperConfig {
  enabled: boolean;
  intervalSeconds: number; // e.g. 5, 10, 30, 60, 300
  transitionStyle: TransitionStyle;
  transitionDurationSec: number; // e.g. 0.8, 1.2, 1.8
  shuffle: boolean;
  categoryFilter: "all" | "abstract" | "gradient" | "pattern" | "custom";
  activePlaylist: string[]; // List of wallpaper IDs enabled for cycling
  particleEffect: ParticleEffect;
  patternOverlayId: string;
  isPaused: boolean;
  customGradients: CustomGradient[];
}

export const ADDITIONAL_ABSTRACT_WALLPAPERS: Wallpaper[] = [
  {
    id: "abstract_quantum_flow",
    name: "Quantum Chroma Flow",
    category: "abstract",
    description: "Multi-spectral iridescent quantum fluid ripples",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-fuchsia-900 via-purple-950 to-slate-950",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "abstract_solar_geometry",
    name: "Solar Geometric Wave",
    category: "abstract",
    description: "Warm radiant geometric prism refraction",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-amber-900 via-orange-950 to-black",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "abstract_cyber_hyperwave",
    name: "Cyber Hyperwave",
    category: "abstract",
    description: "Vibrant retro-futuristic synthwave horizon grid",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-cyan-900 via-indigo-950 to-purple-950",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "abstract_deep_abyss",
    name: "Abyssal Fluid Neon",
    category: "abstract",
    description: "Bioluminescent deep-sea organic plasma currents",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-teal-950 via-blue-950 to-black",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "abstract_amethyst_mist",
    name: "Amethyst Crystal Mist",
    category: "abstract",
    description: "Shimmering gemstone mineral particle dispersion",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-purple-950 via-slate-900 to-black",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
  },
  // Extra Curated Gradients
  {
    id: "gradient_electric_twilight",
    name: "Electric Twilight",
    category: "gradient",
    description: "High-contrast electric violet & cyber sky horizon",
    className: "bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950",
    thumbnail: "from-indigo-950 via-purple-900 to-slate-950"
  },
  {
    id: "gradient_toxic_matrix",
    name: "Toxic Matrix Pulse",
    category: "gradient",
    description: "Hyper-saturated neon green & lime obsidian fade",
    className: "bg-gradient-to-br from-emerald-950 via-lime-950 to-slate-950",
    thumbnail: "from-emerald-950 via-lime-950 to-slate-950"
  },
  {
    id: "gradient_crimson_nebula",
    name: "Crimson Supernova",
    category: "gradient",
    description: "Explosive scarlet ruby & deep dark interstellar core",
    className: "bg-gradient-to-br from-rose-950 via-red-950 to-black",
    thumbnail: "from-rose-950 via-red-950 to-black"
  }
];

export const ALL_WALLPAPERS_COLLECTION: Wallpaper[] = [
  ...WALLPAPERS,
  ...ADDITIONAL_ABSTRACT_WALLPAPERS
];

export const DEFAULT_DYNAMIC_CONFIG: DynamicWallpaperConfig = {
  enabled: false,
  intervalSeconds: 10,
  transitionStyle: "crossfade",
  transitionDurationSec: 1.2,
  shuffle: false,
  categoryFilter: "all",
  activePlaylist: [
    "abstract_neon_flow",
    "midnight_neon",
    "abstract_cyan_prism",
    "aurora_borealis",
    "abstract_cosmic_dust",
    "cyber_cyan",
    "abstract_emerald_mesh",
    "sunset_amber"
  ],
  particleEffect: "none",
  patternOverlayId: "grid",
  isPaused: false,
  customGradients: [
    {
      id: "custom_cyber_synth",
      name: "Cyber Synth Pulse",
      type: "linear",
      angle: 135,
      colorStart: "#0f172a",
      colorMid: "#581c87",
      colorEnd: "#0369a1",
      patternId: "grid",
      createdAt: Date.now() - 100000
    },
    {
      id: "custom_neon_aurora",
      name: "Neon Emerald Flare",
      type: "radial",
      angle: 45,
      colorStart: "#064e3b",
      colorMid: "#022c22",
      colorEnd: "#020617",
      patternId: "dots",
      createdAt: Date.now() - 50000
    }
  ]
};

const STORAGE_KEY = "kk_dynamic_wallpaper_config";
const EVENT_CONFIG_CHANGED = "kk_dynamic_wallpaper_changed";
const EVENT_TRIGGER_CYCLE = "kk_dynamic_wallpaper_cycle_event";

export function getStoredDynamicConfig(): DynamicWallpaperConfig {
  if (typeof localStorage === "undefined") return DEFAULT_DYNAMIC_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_DYNAMIC_CONFIG,
        ...parsed,
        // Ensure activePlaylist has at least some entries
        activePlaylist: parsed.activePlaylist?.length
          ? parsed.activePlaylist
          : DEFAULT_DYNAMIC_CONFIG.activePlaylist,
        customGradients: parsed.customGradients || DEFAULT_DYNAMIC_CONFIG.customGradients
      };
    }
  } catch (e) {
    console.error("Failed to load dynamic wallpaper config", e);
  }
  return DEFAULT_DYNAMIC_CONFIG;
}

export function saveDynamicConfig(config: DynamicWallpaperConfig) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(EVENT_CONFIG_CHANGED, {
          detail: config
        })
      );
    }
  } catch (e) {
    console.error("Failed to save dynamic wallpaper config", e);
  }
}

export function getAllAvailableWallpapers(customGradients: CustomGradient[] = []): Wallpaper[] {
  const customWps: Wallpaper[] = customGradients.map((cg) => {
    let backgroundStr = "";
    if (cg.type === "radial") {
      backgroundStr = `radial-gradient(circle at center, ${cg.colorStart}, ${cg.colorMid ? `${cg.colorMid}, ` : ""}${cg.colorEnd})`;
    } else if (cg.type === "conic") {
      backgroundStr = `conic-gradient(from ${cg.angle}deg at 50% 50%, ${cg.colorStart}, ${cg.colorMid ? `${cg.colorMid}, ` : ""}${cg.colorEnd})`;
    } else {
      backgroundStr = `linear-gradient(${cg.angle}deg, ${cg.colorStart}, ${cg.colorMid ? `${cg.colorMid}, ` : ""}${cg.colorEnd})`;
    }

    return {
      id: cg.id,
      name: cg.name,
      category: "custom",
      description: `Custom ${cg.type} gradient (${cg.angle}deg)`,
      className: "bg-cover bg-center",
      thumbnail: "from-slate-900 to-black",
      customStyle: {
        background: backgroundStr
      }
    };
  });

  return [...ALL_WALLPAPERS_COLLECTION, ...customWps];
}

export function getWallpaperById(
  id: string,
  customGradients: CustomGradient[] = []
): Wallpaper {
  const all = getAllAvailableWallpapers(customGradients);
  return all.find((w) => w.id === id) || all[0];
}

/**
 * Calculates the next wallpaper in sequence or random based on active playlist
 */
export function getNextWallpaperId(
  currentId: string,
  config: DynamicWallpaperConfig,
  direction: "next" | "prev" | "random" = "next"
): string {
  const all = getAllAvailableWallpapers(config.customGradients);
  let pool = config.activePlaylist.filter((id) => all.some((w) => w.id === id));

  if (config.categoryFilter !== "all") {
    const categoryWallpapers = all.filter((w) => w.category === config.categoryFilter);
    pool = pool.filter((id) => categoryWallpapers.some((w) => w.id === id));
    if (pool.length === 0) {
      pool = categoryWallpapers.map((w) => w.id);
    }
  }

  if (pool.length === 0) {
    pool = all.map((w) => w.id);
  }

  if (pool.length === 1) return pool[0];

  if (direction === "random" || (config.shuffle && direction === "next")) {
    const choices = pool.filter((id) => id !== currentId);
    if (choices.length > 0) {
      const randomIndex = Math.floor(Math.random() * choices.length);
      return choices[randomIndex];
    }
  }

  const currentIndex = pool.indexOf(currentId);
  if (currentIndex === -1) {
    return pool[0];
  }

  if (direction === "next") {
    const nextIndex = (currentIndex + 1) % pool.length;
    return pool[nextIndex];
  } else {
    const prevIndex = (currentIndex - 1 + pool.length) % pool.length;
    return pool[prevIndex];
  }
}

/**
 * High-level helper to calculate the next wallpaper based on stored configuration
 */
export function cycleToNextWallpaper(
  currentId: string,
  direction: "next" | "prev" | "random" = "next"
): string {
  const config = getStoredDynamicConfig();
  return getNextWallpaperId(currentId, config, direction);
}

/**
 * Subscribes to dynamic wallpaper config changes
 */
export function addDynamicWallpaperListener(callback: (config: DynamicWallpaperConfig) => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<DynamicWallpaperConfig>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener(EVENT_CONFIG_CHANGED, handler);
  return () => {
    window.removeEventListener(EVENT_CONFIG_CHANGED, handler);
  };
}

/**
 * Broadcasts an explicit cycle trigger request across the OS
 */
export function broadcastCycleTrigger(direction: "next" | "prev" | "random" = "next") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(EVENT_TRIGGER_CYCLE, {
        detail: { direction }
      })
    );
  }
}

export function addCycleEventListener(callback: (detail: { direction: "next" | "prev" | "random" }) => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ direction: "next" | "prev" | "random" }>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener(EVENT_TRIGGER_CYCLE, handler);
  return () => {
    window.removeEventListener(EVENT_TRIGGER_CYCLE, handler);
  };
}
