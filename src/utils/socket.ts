import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Get or initialize the singleton Socket.io client.
 */
export function getSocket(): Socket {
  if (!socket && typeof window !== "undefined") {
    // Connect to the same host that serves the page
    socket = io(window.location.origin);

    socket.on("connect", () => {
      console.log("[Socket] Connected to backend telemetry server");
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected from telemetry server");
    });
  }
  return socket as Socket;
}

/**
 * Emit a live event to the parent dashboard.
 */
export function emitToParent(eventPayload: any) {
  if (typeof window === "undefined") return;
  const s = getSocket();
  s.emit("child_activity", {
    timestamp: new Date().toISOString(),
    ...eventPayload
  });
}
