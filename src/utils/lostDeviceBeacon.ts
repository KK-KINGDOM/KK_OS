/**
 * Lost Device Recovery Acoustic Beacon & Screen Strobe Engine
 * Synthesizes high-decibel acoustic siren pulses and synchronizes screen strobe flashes.
 */

import { recordSecurityLog } from "./securityLogs";

let audioCtx: AudioContext | null = null;
let sirenInterval: ReturnType<typeof setInterval> | null = null;
let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let isBeaconActive = false;
let remainingSeconds = 30;

const EVENT_BEACON_CHANGE = "kk_lost_device_beacon_change";

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a high-intensity dual-frequency sonar siren chirp pulse
 */
export function playBeaconChirp() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // High-pitch dual chirps for maximum acoustic clarity (sonar beacon)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "sine";

    // Modulated sweep: 1200 Hz -> 2400 Hz -> 1600 Hz
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(2600, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.28);

    // Harmonic overlay
    osc2.frequency.setValueAtTime(1800, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(1900, now + 0.32);

    // Volume envelope
    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.linearRampToValueAtTime(0.28, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.debug("Lost device audio play error:", e);
  }
}

/**
 * Starts the continuous acoustic siren loop and screen strobe beacon
 */
export function startLostDeviceBeacon(durationSec = 30) {
  if (isBeaconActive) {
    // If already active, refresh duration
    remainingSeconds = durationSec;
    dispatchBeaconEvent();
    return;
  }

  isBeaconActive = true;
  remainingSeconds = durationSec;

  // Immediately play first pulse
  playBeaconChirp();

  // Setup repeating acoustic siren pulses every 450ms
  if (sirenInterval) clearInterval(sirenInterval);
  sirenInterval = setInterval(() => {
    playBeaconChirp();
  }, 450);

  // Setup 1-second countdown tick
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    remainingSeconds -= 1;
    if (remainingSeconds <= 0) {
      stopLostDeviceBeacon();
    } else {
      dispatchBeaconEvent();
    }
  }, 1000);

  // Auto-silence safety timeout
  if (timeoutTimer) clearTimeout(timeoutTimer);
  timeoutTimer = setTimeout(() => {
    stopLostDeviceBeacon();
  }, durationSec * 1000);

  dispatchBeaconEvent();
}

/**
 * Silences the acoustic siren and deactivates the screen strobe
 */
export function stopLostDeviceBeacon() {
  if (!isBeaconActive) return;

  isBeaconActive = false;
  remainingSeconds = 0;

  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
  }

  dispatchBeaconEvent();
}

export function getIsLostDeviceBeaconActive(): boolean {
  return isBeaconActive;
}

export function getLostDeviceBeaconRemainingSec(): number {
  return remainingSeconds;
}

function dispatchBeaconEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(EVENT_BEACON_CHANGE, {
        detail: {
          active: isBeaconActive,
          remainingSeconds
        }
      })
    );
  }
}

export function addLostDeviceBeaconListener(
  callback: (detail: { active: boolean; remainingSeconds: number }) => void
) {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ active: boolean; remainingSeconds: number }>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener(EVENT_BEACON_CHANGE, handler);
  return () => {
    window.removeEventListener(EVENT_BEACON_CHANGE, handler);
  };
}
