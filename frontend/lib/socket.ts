import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  socket = io(url, { transports: ['websocket'] });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}


