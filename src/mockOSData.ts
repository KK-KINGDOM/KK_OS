import { OSFile, Wallpaper } from "./types";

// Wallpapers list for custom theme support
export const WALLPAPERS: Wallpaper[] = [
  // ABSTRACT AI / ARTWORK WALLPAPERS
  {
    id: "abstract_neon_flow",
    name: "Neon Fluid Flow",
    category: "abstract",
    description: "Vibrant liquid fluid synthwave flow texture",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-purple-900 via-indigo-900 to-black",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "abstract_cyan_prism",
    name: "Cyber Cyan Prism",
    category: "abstract",
    description: "Refractive geometric cyber prism refraction",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-cyan-900 via-blue-900 to-black",
    imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "abstract_cosmic_dust",
    name: "Cosmic Nebula",
    category: "abstract",
    description: "Deep space interstellar star cluster nebula",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-rose-900 via-purple-900 to-black",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "abstract_emerald_mesh",
    name: "Emerald Matrix Mesh",
    category: "abstract",
    description: "Quantum encrypted emerald matrix node mesh",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-emerald-900 via-teal-900 to-black",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "abstract_minimal_waves",
    name: "Minimal Pastel Waves",
    category: "abstract",
    description: "Calming pastel horizon dunes & waves",
    className: "bg-cover bg-center bg-no-repeat",
    thumbnail: "from-amber-900 via-rose-900 to-black",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  },

  // SYSTEM PRESET GRADIENTS
  {
    id: "cosmic_slate",
    name: "Cosmic Slate",
    category: "gradient",
    description: "Deep slate purple atmospheric dark gradient",
    className: "bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950",
    thumbnail: "from-slate-900 via-purple-950 to-slate-950",
  },
  {
    id: "midnight_neon",
    name: "Midnight Neon",
    category: "gradient",
    description: "Electric cyan & deep teal midnight ocean gradient",
    className: "bg-gradient-to-br from-blue-950 via-teal-950 to-black",
    thumbnail: "from-blue-950 via-teal-950 to-black",
  },
  {
    id: "cyber_cyan",
    name: "Cyber Cyan",
    category: "gradient",
    description: "Cyberpunk neon blue & sky glow gradient",
    className: "bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950",
    thumbnail: "from-cyan-950 via-slate-900 to-blue-950",
  },
  {
    id: "aurora_borealis",
    name: "Aurora Borealis",
    category: "gradient",
    description: "Northern lights emerald to indigo gradient",
    className: "bg-gradient-to-br from-emerald-950 via-teal-900 to-indigo-950",
    thumbnail: "from-emerald-950 via-teal-900 to-indigo-950",
  },
  {
    id: "dark_nebula",
    name: "Dark Nebula",
    category: "gradient",
    description: "Cosmic violet and fuchsia deep galaxy gradient",
    className: "bg-gradient-to-br from-violet-950 via-fuchsia-950 to-slate-950",
    thumbnail: "from-violet-950 via-fuchsia-950 to-slate-950",
  },
  {
    id: "sunset_amber",
    name: "Sunset Amber",
    category: "gradient",
    description: "Warm twilight amber & crimson horizon glow",
    className: "bg-gradient-to-br from-amber-950 via-rose-950 to-slate-950",
    thumbnail: "from-amber-950 via-rose-950 to-slate-950",
  },
  {
    id: "emerald_matrix",
    name: "Emerald Matrix",
    category: "gradient",
    description: "Deep matrix green and obsidian dark gradient",
    className: "bg-gradient-to-br from-emerald-950 via-green-950 to-black",
    thumbnail: "from-emerald-950 via-green-950 to-black",
  },
  {
    id: "solar_flare",
    name: "Solar Flare",
    category: "gradient",
    description: "Vibrant solar orange & warm gold radiance",
    className: "bg-gradient-to-br from-orange-950 via-amber-900 to-slate-950",
    thumbnail: "from-orange-950 via-amber-900 to-slate-950",
  },
  {
    id: "deep_violet",
    name: "Deep Violet",
    category: "gradient",
    description: "Ultraviolet neon aura and deep space darkness",
    className: "bg-gradient-to-br from-purple-950 via-indigo-950 to-black",
    thumbnail: "from-purple-950 via-indigo-950 to-black",
  },
  {
    id: "rose_cyber",
    name: "Rose Cyber",
    category: "gradient",
    description: "Neon magenta and soft rose night gradient",
    className: "bg-gradient-to-br from-rose-950 via-pink-950 to-slate-950",
    thumbnail: "from-rose-950 via-pink-950 to-slate-950",
  },
  {
    id: "obsidian_pulse",
    name: "Obsidian Pulse",
    category: "gradient",
    description: "Minimalist stealth dark zinc monochrome gradient",
    className: "bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950",
    thumbnail: "from-slate-950 via-zinc-900 to-slate-950",
  },
  {
    id: "northern_lights",
    name: "Northern Lights",
    category: "gradient",
    description: "Calming sea-teal & arctic sky blue gradient",
    className: "bg-gradient-to-br from-teal-950 via-sky-950 to-indigo-950",
    thumbnail: "from-teal-950 via-sky-950 to-indigo-950",
  }
];

// ASCII art for neofetch command
export const NEOFETCH_ASCII = `
   /\\_/\\      [1;35mKK-Mobile-OS 1.0.0-beta[0m
  ( o.o )     [1;36m------------------------[0m
   > ^ <      [1;32mOS:[0m KK-Mobile-OS for Web
  /     \\     [1;32mKernel:[0m KK-Core v4.19.12-ts
 /       \\    [1;32mUptime:[0m %UPTIME%
 \\_|_|_|_/    [1;32mShell:[0m kk-sh v2.1
              [1;32mCPU:[0m ARM Cortex-A78 (Simulated 8-Core)
              [1;32mGPU:[0m KK-Adreno v9.2
              [1;32mMemory:[0m %RAM_USED%MB / 8192MB (45%)
              [1;32mStorage:[0m 34.2GB / 128GB (26%)
              [1;32mHost:[0m Antigravity Safe-Container
`;

// Kernel boot messages (dmesg)
export const DMESG_LOGS = [
  "[    0.000000] Booting Linux on physical CPU 0x0000000000 [0x410fd034]",
  "[    0.000000] Linux version 4.19.12-ts-kk-mobile (compiler: gcc v8.3)",
  "[    0.000000] Machine model: KK-Mobile Developer-Kit Prototype-A",
  "[    0.001024] Reserved memory: created DMA memory pool at 0x40000000",
  "[    0.012541] CPU0: Spectre v2 mitigation: Branch predictor hardening enabled",
  "[    0.041021] devtmpfs: initialized",
  "[    0.104102] clocksource: Switched to clocksource arch_sys_counter",
  "[    0.210404] KK-Secure-Boot: Verification succeeded. Cert hash matches SHA256.",
  "[    0.340212] pinctrl-kk: configured 128 GPIO pins",
  "[    0.410294] kk-battery-manager: initializing charger hardware...",
  "[    0.450102] kk-battery-manager: Battery state Li-Po 4500mAh, temp 28.4C, health EXCELLENT",
  "[    0.510940] serial-kk: ttyKK0 at MMIO 0x09000000 (irq = 33, base_baud = 115200) is a KK-UART",
  "[    0.602141] kk-storage-controller: detected 128GB UFS flash storage",
  "[    0.720112] kk-touchscreen-driver: initialized FocalTech FT5406, resolution 1080x2400",
  "[    0.850401] kk-camera-sensor: Found IMX586 Main (48MP) & IMX355 Ultra-Wide (8MP)",
  "[    0.910240] kk-fingerprint: FPC1020 driver bound successfully",
  "[    1.004192] kk-wifi: Qualcomm WCN3990 initialized, driver version KK-WLAN-4.2",
  "[    1.120401] EXT4-fs (sda1): mounted filesystem with ordered data mode. Opts: (null)",
  "[    1.240210] KK-OS-Framework: Starting system services (ActivityManager, WindowManager, Power)...",
  "[    1.410204] KK-OS-Framework: PackageDatabase scanned 24 system packages, 0 user packages.",
  "[    1.502040] KK-OS-Framework: SurfaceFlinger started successfully.",
  "[    1.640211] KK-OS-Security: Application Sandbox Mode initialized. SELinux: Enforcing.",
  "[    1.750401] KK-OS-Launcher: system launcher service registered.",
  "[    1.902041] Boot completed in 1.902s. Welcome to KK-Mobile-OS!"
];

// Reconstruct the full directory tree matching the user's prompt
export const KK_OS_FILE_TREE: OSFile = {
  name: "KK-Mobile-OS",
  type: "directory",
  path: "/KK-Mobile-OS",
  children: [
    {
      name: "boot",
      type: "directory",
      path: "/KK-Mobile-OS/boot",
      children: [
        {
          name: "bootloader",
          type: "directory",
          path: "/KK-Mobile-OS/boot/bootloader",
          children: [
            {
              name: "grub.cfg",
              type: "file",
              path: "/KK-Mobile-OS/boot/bootloader/grub.cfg",
              size: "1.2 KB",
              content: `# KK-Mobile-OS Bootloader Configuration
set timeout=2
set default=0

menuentry "KK-Mobile-OS (Normal Boot)" {
    set root=(hd0,msdos1)
    linux /boot/vmlinuz-kk quiet loglevel=3 androidboot.hardware=kk-v1
    initrd /boot/initramfs-kk.img
}

menuentry "KK-Mobile-OS (Recovery System)" {
    set root=(hd0,msdos1)
    linux /boot/vmlinuz-kk quiet loglevel=5 recovery=1
    initrd /boot/recovery.img
}`
            },
            {
              name: "config.cfg",
              type: "file",
              path: "/KK-Mobile-OS/boot/bootloader/config.cfg",
              size: "420 B",
              content: `# Secure boot configurations
SECURE_BOOT_ENABLED=true
SIGNATURE_VERIFICATION=SHA256
DECOMPRESS_ALGO=lz4
DEBUG_SHELL=false`
            }
          ]
        },
        {
          name: "splash",
          type: "directory",
          path: "/KK-Mobile-OS/boot/splash",
          children: [
            {
              name: "logo_4k.raw",
              type: "file",
              path: "/KK-Mobile-OS/boot/splash/logo_4k.raw",
              size: "2.4 MB",
              content: "[Binary Data] KK-Mobile-OS bootsplash logo image (RAW framebuffer format)"
            }
          ]
        },
        {
          name: "bootanimation",
          type: "directory",
          path: "/KK-Mobile-OS/boot/bootanimation",
          children: [
            {
              name: "desc.txt",
              type: "file",
              path: "/KK-Mobile-OS/boot/bootanimation/desc.txt",
              size: "128 B",
              content: `1080 2400 30
p 1 0 part0
p 0 0 part1`
            }
          ]
        },
        {
          name: "recovery",
          type: "directory",
          path: "/KK-Mobile-OS/boot/recovery",
          children: [
            {
              name: "recovery.img",
              type: "file",
              path: "/KK-Mobile-OS/boot/recovery/recovery.img",
              size: "16.4 MB",
              content: "[Binary File] KK Recovery subsystem image with flash and factory reset capabilities"
            }
          ]
        },
        {
          name: "fastboot",
          type: "directory",
          path: "/KK-Mobile-OS/boot/fastboot",
          children: [
            {
              name: "unlock.key",
              type: "file",
              path: "/KK-Mobile-OS/boot/fastboot/unlock.key",
              size: "256 B",
              content: "0x8F9AA21400BCFEA4321A8DDF770CBEAA"
            }
          ]
        }
      ]
    },
    {
      name: "kernel",
      type: "directory",
      path: "/KK-Mobile-OS/kernel",
      children: [
        {
          name: "memory",
          type: "directory",
          path: "/KK-Mobile-OS/kernel/memory",
          children: [
            {
              name: "allocator.c",
              type: "file",
              path: "/KK-Mobile-OS/kernel/memory/allocator.c",
              size: "4.8 KB",
              content: `/* KK-Core Memory Allocator (Slab/Buddy Allocator Hybrid) */
#include <kk_memory.h>
#include <kk_kernel.h>

void* kk_malloc(size_t size) {
    if (size == 0) return NULL;
    
    // Check if slab allocator has free slot
    void* block = get_free_slab_slot(size);
    if (block) {
        kk_log(LOG_DEBUG, "MemAlloc: Slab allocated %zu bytes at %p", size, block);
        return block;
    }
    
    // Fall back to buddy allocator for larger blocks
    block = allocate_buddy_pages(size);
    kk_log(LOG_DEBUG, "MemAlloc: Buddy allocated large block %zu bytes at %p", size, block);
    return block;
}

void kk_free(void* ptr) {
    if (!ptr) return;
    if (is_slab_pointer(ptr)) {
        free_slab_slot(ptr);
    } else {
        free_buddy_pages(ptr);
    }
}`
            }
          ]
        },
        {
          name: "process",
          type: "directory",
          path: "/KK-Mobile-OS/kernel/process",
          children: [
            {
              name: "pid.c",
              type: "file",
              path: "/KK-Mobile-OS/kernel/process/pid.c",
              size: "1.5 KB",
              content: `/* PID allocator and manager */
#define MAX_PROCESSES 1024
static struct task_struct* task_table[MAX_PROCESSES];

int allocate_pid() {
    for (int i = 1; i < MAX_PROCESSES; i++) {
        if (task_table[i] == NULL) {
            return i;
        }
    }
    return -1; // Out of PIDs!
}`
            }
          ]
        },
        {
          name: "scheduler",
          type: "directory",
          path: "/KK-Mobile-OS/kernel/scheduler",
          children: [
            {
              name: "fair.c",
              type: "file",
              path: "/KK-Mobile-OS/kernel/scheduler/fair.c",
              size: "3.2 KB",
              content: `/* Completely Fair Scheduler (CFS) for KK-Core */
void schedule() {
    struct task_struct* next = get_next_runnable_task();
    if (next) {
        switch_context_to(next);
    }
}`
            }
          ]
        },
        {
          name: "filesystem",
          type: "directory",
          path: "/KK-Mobile-OS/kernel/filesystem",
          children: [
            {
              name: "vfs.c",
              type: "file",
              path: "/KK-Mobile-OS/kernel/filesystem/vfs.c",
              size: "2.1 KB",
              content: "/* Virtual File System layer mapping EXT4 and devtmpfs */"
            }
          ]
        },
        {
          name: "drivers",
          type: "directory",
          path: "/KK-Mobile-OS/kernel/drivers",
          children: [
            {
              name: "touchscreen.ko",
              type: "file",
              path: "/KK-Mobile-OS/kernel/drivers/touchscreen.ko",
              size: "820 KB",
              content: "[Kernel Module] FocalTech capacitive touchscreen driver compiled object"
            },
            {
              name: "display_panel.ko",
              type: "file",
              path: "/KK-Mobile-OS/kernel/drivers/display_panel.ko",
              size: "1.4 MB",
              content: "[Kernel Module] OLED dynamic-refresh rate panel driver (support up to 120Hz)"
            }
          ]
        },
        {
          name: "networking",
          type: "directory",
          path: "/KK-Mobile-OS/kernel/networking",
          children: [
            {
              name: "wifi_driver.ko",
              type: "file",
              path: "/KK-Mobile-OS/kernel/networking/wifi_driver.ko",
              size: "3.1 MB",
              content: "[Kernel Module] WiFi controller device driver module"
            }
          ]
        },
        {
          name: "security",
          type: "directory",
          path: "/KK-Mobile-OS/kernel/security",
          children: [
            {
              name: "sandbox.c",
              type: "file",
              path: "/KK-Mobile-OS/kernel/security/sandbox.c",
              size: "3.1 KB",
              content: `/* App Sandbox isolation policy enforcer */
int verify_sandbox_permissions(int pid, const char* filepath, int access_type) {
    if (is_system_app(pid)) return 1; // System app has full path access
    
    // Sandbox restriction check
    if (strncmp(filepath, "/data/user/sandbox/", 19) != 0) {
        return 0; // Access Denied to outside sandbox!
    }
    return 1;
}`
            }
          ]
        },
        {
          name: "power",
          type: "directory",
          path: "/KK-Mobile-OS/kernel/power",
          children: [
            {
              name: "battery_saver.c",
              type: "file",
              path: "/KK-Mobile-OS/kernel/power/battery_saver.c",
              size: "1.9 KB",
              content: `/* Battery consumption algorithms */
void enter_deep_sleep() {
    reduce_cpu_clock_freq(300); // Set CPU cores to 300MHz idle
    disable_non_essential_gpus();
    turn_off_wifi_scanning();
}`
            }
          ]
        }
      ]
    },
    {
      name: "hardware",
      type: "directory",
      path: "/KK-Mobile-OS/hardware",
      children: [
        {
          name: "cpu",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/cpu",
          children: [
            {
              name: "cpuinfo.json",
              type: "file",
              path: "/KK-Mobile-OS/hardware/cpu/cpuinfo.json",
              size: "410 B",
              content: `{
  "cores": 8,
  "architecture": "ARMv8-A64",
  "cores_config": {
    "super_cores": 1,
    "performance_cores": 3,
    "efficiency_cores": 4
  },
  "max_frequency_mhz": 2840,
  "l3_cache_mb": 8
}`
            }
          ]
        },
        {
          name: "gpu",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/gpu",
          children: [
            {
              name: "gpu_spec.json",
              type: "file",
              path: "/KK-Mobile-OS/hardware/gpu/gpu_spec.json",
              size: "190 B",
              content: `{
  "vendor": "KK-Silicons",
  "architecture": "KK-Vulkan-Core-9",
  "clock_speed_mhz": 850,
  "vram_allocated_mb": 2048
}`
            }
          ]
        },
        {
          name: "display",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/display",
          children: [
            {
              name: "specs.json",
              type: "file",
              path: "/KK-Mobile-OS/hardware/display/specs.json",
              size: "210 B",
              content: `{
  "panel_type": "AMOLED",
  "resolution": "1080x2400",
  "aspect_ratio": "20:9",
  "refresh_rate_hz": 120,
  "hdr_support": "HDR10+"
}`
            }
          ]
        },
        {
          name: "touchscreen",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/touchscreen"
        },
        {
          name: "camera",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/camera"
        },
        {
          name: "battery",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/battery"
        },
        {
          name: "fingerprint",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/fingerprint"
        },
        {
          name: "faceunlock",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/faceunlock"
        },
        {
          name: "wifi",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/wifi"
        },
        {
          name: "bluetooth",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/bluetooth"
        },
        {
          name: "sensors",
          type: "directory",
          path: "/KK-Mobile-OS/hardware/sensors"
        }
      ]
    },
    {
      name: "framework",
      type: "directory",
      path: "/KK-Mobile-OS/framework",
      children: [
        {
          name: "activity",
          type: "directory",
          path: "/KK-Mobile-OS/framework/activity",
          children: [
            {
              name: "ActivityManager.ts",
              type: "file",
              path: "/KK-Mobile-OS/framework/activity/ActivityManager.ts",
              size: "2.4 KB",
              content: `export class ActivityManager {
  private activeActivities: Map<string, any> = new Map();

  startActivity(appId: string) {
    console.log("[ActivityManager] Starting app intent: " + appId);
    this.activeActivities.set(appId, { state: "RESUMED", startTime: Date.now() });
  }

  terminateActivity(appId: string) {
    console.log("[ActivityManager] Destroying app: " + appId);
    this.activeActivities.delete(appId);
  }
}`
            }
          ]
        },
        {
          name: "services",
          type: "directory",
          path: "/KK-Mobile-OS/framework/services"
        },
        {
          name: "permissions",
          type: "directory",
          path: "/KK-Mobile-OS/framework/permissions",
          children: [
            {
              name: "manifest.json",
              type: "file",
              path: "/KK-Mobile-OS/framework/permissions/manifest.json",
              size: "310 B",
              content: `{
  "SYSTEM_APP_PERMISSIONS": [
    "READ_SYSTEM_FILES",
    "EXECUTE_SHELL",
    "USE_BIOMETRIC",
    "ACCESS_HARDWARE_DRIVERS"
  ],
  "USER_APP_PERMISSIONS": [
    "INTERNET",
    "CAMERA",
    "MICROPHONE",
    "GEOLOCATION",
    "NOTIFICATION"
  ]
}`
            }
          ]
        },
        {
          name: "package_manager",
          type: "directory",
          path: "/KK-Mobile-OS/framework/package_manager"
        },
        {
          name: "notification",
          type: "directory",
          path: "/KK-Mobile-OS/framework/notification"
        }
      ]
    },
    {
      name: "system_apps",
      type: "directory",
      path: "/KK-Mobile-OS/system_apps",
      children: [
        {
          name: "launcher",
          type: "directory",
          path: "/KK-Mobile-OS/system_apps/launcher",
          children: [
            {
              name: "config.json",
              type: "file",
              path: "/KK-Mobile-OS/system_apps/launcher/config.json",
              size: "180 B",
              content: `{
  "gridSize": "4x6",
  "showWeatherWidget": true,
  "defaultWallpaper": "cosmic_slate",
  "enableLauncherGestures": true
}`
            }
          ]
        },
        {
          name: "settings",
          type: "directory",
          path: "/KK-Mobile-OS/system_apps/settings"
        },
        {
          name: "terminal",
          type: "directory",
          path: "/KK-Mobile-OS/system_apps/terminal",
          children: [
            {
              name: "aliases.sh",
              type: "file",
              path: "/KK-Mobile-OS/system_apps/terminal/aliases.sh",
              size: "150 B",
              content: `alias ll="ls -la"
alias sysinfo="neofetch"
alias reboot_sys="reboot"
alias files="cd /KK-Mobile-OS"`
            }
          ]
        },
        {
          name: "ai_assistant",
          type: "directory",
          path: "/KK-Mobile-OS/system_apps/ai_assistant",
          children: [
            {
              name: "instruction.md",
              type: "file",
              path: "/KK-Mobile-OS/system_apps/ai_assistant/instruction.md",
              size: "650 B",
              content: `# KK-Mobile-OS AI Assistant System Directives
- You are KK-AI, the built-in system assistant for KK-Mobile-OS.
- Maintain professional, secure, and helpful interactions.
- Help developers and power-users browse system directories and run simulated diagnostics.
- Address questions about the underlying kernel modules (Slab memory, CFS scheduler) and framework apps.
- Speak in high-tech terminal jargon when appropriate but keep responses readable.`
            }
          ]
        }
      ]
    },
    {
      name: "documentation",
      type: "directory",
      path: "/KK-Mobile-OS/documentation",
      children: [
        {
          name: "architecture",
          type: "directory",
          path: "/KK-Mobile-OS/documentation/architecture",
          children: [
            {
              name: "layer_cake.md",
              type: "file",
              path: "/KK-Mobile-OS/documentation/architecture/layer_cake.md",
              size: "1.4 KB",
              content: `# KK-Mobile-OS Layered Architecture
This system is organized into decoupled layers:

## 1. Hardware abstraction Layer (HAL)
Interfaces directly with devices (Display panel driver, touch sensors, IMX camera, fast charging SoC, fingerprint biometrics).

## 2. KK Kernel Core (C-based)
- **Slab Mem Allocator**: Keeps heap fragmentations low.
- **CFS scheduler**: Balancing CPU cores dynamically.
- **Virtual File System**: Transparent disk accesses.
- **Power policies**: Low sleep frequencies, standby limits.

## 3. OS Framework (TS/JS based)
Bridges high-level system applications to low-level drivers. Provides Activity manager for launching and swiping apps, standard permissions, notifications systems.

## 4. Native Apps (System Apps)
Custom high-efficiency apps designed to load instantly and persist on local memory.`
            }
          ]
        },
        {
          name: "developer_guide",
          type: "directory",
          path: "/KK-Mobile-OS/documentation/developer_guide",
          children: [
            {
              name: "setup_env.md",
              type: "file",
              path: "/KK-Mobile-OS/documentation/developer_guide/setup_env.md",
              size: "820 B",
              content: `# Setting up KK Developer Environment
1. Ensure you have the KK-Mobile-OS Software Development Kit (SDK) installed.
2. Enable "Developer Options" under Settings on your prototype device.
3. Establish connection via Android Debug Bridge (ADB):
   \`adb connect 192.168.1.100:5555\`
4. Deploy compiled packages (*.kkp) to system storage:
   \`kk-sdk deploy --pkg system_apps/launcher\`
5. Live debugger streaming:
   \`kk-logcat -f kernel\`
`
            }
          ]
        }
      ]
    }
  ]
};
