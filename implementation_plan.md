# Make All 72 Apps Fully Functional

The goal is to transition the 72 apps from visual mockups to fully functional, interactive applications that behave exactly like a real smartphone operating system. This requires significant architectural updates, persistent state management, and real web API integrations.

> [!CAUTION]
> Implementing full functionality for all 72 apps simultaneously is an incredibly massive undertaking. I propose executing this in **phases**, starting with core system apps, moving to communication, then media, and finally third-party/productivity apps.

## User Review Required
Please review the proposed phased rollout. Do you agree with starting with Phase 1 (Core System Apps)? Or is there a specific app you want fully functional first?

## Proposed Architecture

1. **Global State Management (Zustand/Context)**
   - Create a central data store (e.g., `FileSystem`, `Contacts`, `GalleryStorage`, `SettingsStore`).
   - Apps will read/write from this global state so that actions in one app affect others (e.g., saving a photo in the Camera app makes it immediately available in the Gallery app).
   - Sync this state with the browser's `IndexedDB` or `localStorage` so data persists across reloads.

2. **Hardware Integrations via Web APIs**
   - **Camera / QR Scanner**: Use `navigator.mediaDevices.getUserMedia()` to access the real webcam/device camera.
   - **Voice Recorder / Phone calls**: Use the Microphone API to record real audio.
   - **Maps / Weather**: Use the browser's Geolocation API to fetch real coordinates, and query free APIs (like Open-Meteo) for actual weather data.
   - **File Manager**: Use the File System Access API or simulated IndexedDB file tree to allow real file uploads, downloads, and management.

3. **External Real-World APIs**
   - We will use free, no-key public APIs (like the Wikipedia integration recently added to the AI apps, Open-Meteo for weather, etc.) to ensure apps provide real-world data without requiring you to set up API keys.

## Phased Implementation Plan

### Phase 1: Core System & Hardware Apps
- **Camera & Gallery**: Implement real webcam capture, save images to IndexedDB, and build a functioning gallery grid with full-screen viewing and deletion.
- **Settings & Terminal**: Fully wire all settings to the OS context (brightness, volume, themes).
- **Clock, Calculator, Calendar**: Implement real alarms, functional math logic, and a localized date/time scheduler.
- **File Manager**: Implement a real virtual file system (VFS) to browse, create, delete, and move simulated files and photos.

### Phase 2: Communication & Networking
- **Phone, Contacts, Messages**: Build a functional address book. Taking an action in the Phone app will log it in a central call history.
- **Browser**: Build a functional iframe-based mini-browser (with a simulated search engine using Wikipedia/DuckDuckGo proxies).
- **Email**: Create a functional inbox that simulates receiving emails and sending outgoing mail (potentially using EmailJS).

### Phase 3: Media & Productivity
- **Music & Video**: Integrate real royalty-free audio/video streams or allow uploading local media files to play.
- **Notes & Docs**: Build rich-text editors that save documents persistently to the virtual File Manager.

### Phase 4: Third-Party Ecosystem (Mocked Realism)
- Provide functional clones for apps like **WhatsApp, LinkedIn, Play Store, Udemy**, simulating data fetching and interactive user flows (e.g., a real scrolling feed of mock posts in LinkedIn, a functional cart in Play Store).

## Verification Plan
After each phase, we will manually verify:
- Data persistence (refreshing the page does not lose data).
- Cross-app synchronization (e.g., Camera -> Gallery).
- Error handling (handling denied camera/microphone permissions gracefully).
