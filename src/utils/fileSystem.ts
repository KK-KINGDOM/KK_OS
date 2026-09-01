import { OSFile } from "../types";
import { KK_OS_FILE_TREE } from "../mockOSData";

export interface CacheItem {
  id: string;
  name: string;
  path: string;
  sizeMB: number;
  category: "app_runtime" | "browser" | "system_logs" | "gallery" | "ai_cache" | "boot";
  description: string;
}

export const INITIAL_CACHE_ITEMS: CacheItem[] = [
  {
    id: "cache_dalvik",
    name: "dalvik_runtime.dex",
    path: "/KK-Mobile-OS/cache/dalvik_runtime.dex",
    sizeMB: 1420,
    category: "app_runtime",
    description: "Compiled application bytecode runtime cache"
  },
  {
    id: "cache_browser",
    name: "browser_tiles.tmp",
    path: "/KK-Mobile-OS/cache/browser_tiles.tmp",
    sizeMB: 850,
    category: "browser",
    description: "Web browser page render cache and favicons"
  },
  {
    id: "cache_logs",
    name: "system_logs.log",
    path: "/KK-Mobile-OS/cache/system_logs.log",
    sizeMB: 520,
    category: "system_logs",
    description: "Kernel crash dumps and logcat history"
  },
  {
    id: "cache_thumbs",
    name: "thumbnail_index.idx",
    path: "/KK-Mobile-OS/cache/thumbnail_index.idx",
    sizeMB: 680,
    category: "gallery",
    description: "Gallery video and high-res image preview thumbs"
  },
  {
    id: "cache_ai",
    name: "ai_weights_temp.bin",
    path: "/KK-Mobile-OS/cache/ai_weights_temp.bin",
    sizeMB: 950,
    category: "ai_cache",
    description: "Temporary Gemini assistant response buffer"
  },
  {
    id: "cache_splash",
    name: "logo_4k_cache.tmp",
    path: "/KK-Mobile-OS/boot/splash/logo_4k_cache.tmp",
    sizeMB: 240,
    category: "boot",
    description: "Boot animation frame buffer cache"
  }
];

const STORAGE_KEY = "kk_cleaned_cache_ids";

export function getCleanedCacheIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCleanedCacheIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {}
}

export function isCacheCleaned(id: string): boolean {
  return getCleanedCacheIds().includes(id);
}

export function getAvailableCacheItems(): CacheItem[] {
  const cleaned = getCleanedCacheIds();
  return INITIAL_CACHE_ITEMS.filter((item) => !cleaned.includes(item.id));
}

export function getTotalCacheSizeMB(): number {
  return getAvailableCacheItems().reduce((acc, item) => acc + item.sizeMB, 0);
}

export function cleanCacheItem(id: string): number {
  const item = INITIAL_CACHE_ITEMS.find((i) => i.id === id);
  if (!item || isCacheCleaned(id)) return 0;

  const current = getCleanedCacheIds();
  const updated = [...current, id];
  saveCleanedCacheIds(updated);

  notifyFileSystemUpdated();
  return item.sizeMB;
}

export function cleanAllCache(): number {
  const available = getAvailableCacheItems();
  const freedMB = available.reduce((acc, item) => acc + item.sizeMB, 0);

  const allIds = INITIAL_CACHE_ITEMS.map((item) => item.id);
  saveCleanedCacheIds(allIds);

  notifyFileSystemUpdated();
  return freedMB;
}

export function restoreAllCache() {
  saveCleanedCacheIds([]);
  notifyFileSystemUpdated();
}

export function notifyFileSystemUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kk_file_tree_updated"));
  }
}

export function addCacheUpdatedListener(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("kk_file_tree_updated", callback);
  return () => {
    window.removeEventListener("kk_file_tree_updated", callback);
  };
}

/**
 * Returns a clone of KK_OS_FILE_TREE dynamically injected with the /KK-Mobile-OS/cache folder
 * and filtered according to cleaned cache files.
 */
export function getDynamicFileTree(): OSFile {
  const treeCopy: OSFile = JSON.parse(JSON.stringify(KK_OS_FILE_TREE));
  const availableCache = getAvailableCacheItems();

  // Find or create the /KK-Mobile-OS/cache directory
  if (!treeCopy.children) {
    treeCopy.children = [];
  }

  let cacheDir = treeCopy.children.find((child) => child.name === "cache");
  if (!cacheDir) {
    cacheDir = {
      name: "cache",
      type: "directory",
      path: "/KK-Mobile-OS/cache",
      children: []
    };
    // Insert cache directory after boot/kernel
    treeCopy.children.unshift(cacheDir);
  }

  // Populate cacheDir with available (uncleaned) cache files whose path is in /KK-Mobile-OS/cache/
  const cacheFilesForDir = availableCache.filter((item) => item.path.startsWith("/KK-Mobile-OS/cache/"));
  
  cacheDir.children = cacheFilesForDir.map((item) => ({
    name: item.name,
    type: "file",
    path: item.path,
    size: item.sizeMB >= 1000 ? `${(item.sizeMB / 1000).toFixed(1)} GB` : `${item.sizeMB} MB`,
    content: `// [TEMP CACHE FILE - ${item.description}]\n// Path: ${item.path}\n// Size: ${item.sizeMB} MB\n// Category: ${item.category}\n// Status: ACTIVE_CACHE (Can be purged from Storage Manager)`
  }));

  // Handle splash logo cache under /KK-Mobile-OS/boot/splash/ if boot/splash exists
  const bootDir = treeCopy.children.find((c) => c.name === "boot");
  if (bootDir && bootDir.children) {
    const splashDir = bootDir.children.find((c) => c.name === "splash");
    if (splashDir && splashDir.children) {
      const splashCacheItem = availableCache.find((i) => i.id === "cache_splash");
      if (splashCacheItem) {
        if (!splashDir.children.some((f) => f.name === splashCacheItem.name)) {
          splashDir.children.push({
            name: splashCacheItem.name,
            type: "file",
            path: splashCacheItem.path,
            size: `${splashCacheItem.sizeMB} MB`,
            content: `// [BOOT FRAME BUFFER CACHE]\n// Size: ${splashCacheItem.sizeMB} MB`
          });
        }
      } else {
        // Remove splash cache file if cleaned
        splashDir.children = splashDir.children.filter((f) => f.name !== "logo_4k_cache.tmp");
      }
    }
  }

  return treeCopy;
}
