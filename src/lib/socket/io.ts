/**
 * Global Socket.io server reference.
 * Set by `server.ts` so API routes can emit real-time events in the same process.
 */
import type { Server as SocketServer } from "socket.io";

const globalForIo = globalThis as unknown as {
  socketIo: SocketServer | undefined;
};

export function setSocketServer(io: SocketServer) {
  globalForIo.socketIo = io;
}

export function getSocketServer(): SocketServer | undefined {
  return globalForIo.socketIo;
}
