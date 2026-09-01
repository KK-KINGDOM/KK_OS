/**
 * Utility to dispatch tactile vibration feedback events to the main phone container
 */
export type VibrateIntensity = "light" | "medium" | "heavy";

export function triggerHapticVibration(intensity: VibrateIntensity = "medium") {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("kk_vibrate", {
      detail: { intensity }
    });
    window.dispatchEvent(event);
  }
}
