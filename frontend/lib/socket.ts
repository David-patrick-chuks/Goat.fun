import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  console.log(`[fe][socket] Creating new socket connection to: ${url}`);
  socket = io(url, { transports: ['websocket'] });
  
  socket.on('connect', () => {
    console.log(`[fe][socket] Socket connected with ID: ${socket?.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`[fe][socket] Socket disconnected`);
  });
  
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Function to emit user_connect when wallet is available
export function emitUserConnect(wallet: string): void {
  const socket = getSocket();
  if (socket.connected) {
    console.log(`[fe][socket] Emitting user_connect for wallet: ${wallet}`);
    socket.emit(
      "user_connect",
      { wallet },
      (res: { ok?: boolean; error?: unknown }) => {
        console.log(`[fe][socket] user_connect response:`, res);
        if (!res?.ok)
          console.error("[fe][socket] user_connect error", res?.error);
      }
    );
  } else {
    console.log(`[fe][socket] Socket not connected, cannot emit user_connect`);
  }
}

// Function to handle wallet disconnection
export function handleWalletDisconnect(): void {
  const socket = getSocket();
  if (socket.connected) {
    console.log(`[fe][socket] Wallet disconnected, clearing socket data`);
    // Note: We don't emit a disconnect event since the socket stays connected
    // The backend will handle this when the socket disconnects
  }
}


