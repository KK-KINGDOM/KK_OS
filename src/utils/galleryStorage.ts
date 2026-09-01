export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  isCustom?: boolean;
  isScreenshot?: boolean;
  category?: "screenshot" | "photo" | "ai" | "camera";
  timestamp: number;
  size?: string;
  dimensions?: string;
}

const STORAGE_KEY = "kk_os_gallery_photos_v2";

export const DEFAULT_GALLERY_PHOTOS: GalleryItem[] = [
  {
    id: "default_1",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    title: "Mountain Valley Sunrise",
    category: "photo",
    timestamp: Date.now() - 86400000 * 3,
    size: "3.4 MB",
    dimensions: "1080x2400"
  },
  {
    id: "default_2",
    url: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=800&q=80",
    title: "Pine Forest Mist",
    category: "photo",
    timestamp: Date.now() - 86400000 * 2,
    size: "2.8 MB",
    dimensions: "1080x2400"
  },
  {
    id: "default_3",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    title: "Mist Lake Reflections",
    category: "photo",
    timestamp: Date.now() - 86400000,
    size: "4.1 MB",
    dimensions: "1080x2400"
  },
  {
    id: "default_4",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
    title: "Sunlit Forest Trail",
    category: "photo",
    timestamp: Date.now() - 3600000 * 12,
    size: "3.1 MB",
    dimensions: "1080x2400"
  },
  {
    id: "default_5",
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
    title: "Sunset Horizon Clouds",
    category: "photo",
    timestamp: Date.now() - 3600000 * 4,
    size: "2.9 MB",
    dimensions: "1080x2400"
  },
  {
    id: "default_6",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    title: "Alpine Mountain Ridge",
    category: "photo",
    timestamp: Date.now() - 3600000 * 2,
    size: "3.6 MB",
    dimensions: "1080x2400"
  }
];

export function getStoredGalleryItems(): GalleryItem[] {
  if (typeof window === "undefined") return DEFAULT_GALLERY_PHOTOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GALLERY_PHOTOS));
      return DEFAULT_GALLERY_PHOTOS;
    }
    const items = JSON.parse(raw);
    return Array.isArray(items) && items.length > 0 ? items : DEFAULT_GALLERY_PHOTOS;
  } catch (e) {
    return DEFAULT_GALLERY_PHOTOS;
  }
}

export function saveGalleryItem(item: GalleryItem): void {
  try {
    const current = getStoredGalleryItems();
    const updated = [item, ...current.filter((i) => i.id !== item.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyGalleryUpdated(item);
  } catch (e) {
    console.error("Failed to save gallery item:", e);
  }
}

export function deleteGalleryItem(id: string): void {
  try {
    const current = getStoredGalleryItems();
    const updated = current.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyGalleryUpdated();
  } catch (e) {
    console.error("Failed to delete gallery item:", e);
  }
}

export function notifyGalleryUpdated(latestItem?: GalleryItem): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kk_gallery_updated", {
        detail: { latestItem }
      })
    );
  }
}

export function addGalleryUpdateListener(
  callback: (detail?: { latestItem?: GalleryItem }) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    callback(custom.detail);
  };
  window.addEventListener("kk_gallery_updated", handler);
  return () => {
    window.removeEventListener("kk_gallery_updated", handler);
  };
}
