import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  
  // Prevent multiple connection attempts
  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    console.warn(`[fe][socket] Max connection attempts reached (${MAX_CONNECTION_ATTEMPTS}), reusing existing socket`);
    return socket || createNewSocket();
  }
  
  return createNewSocket();
}

function createNewSocket(): Socket {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  console.log(`[fe][socket] Creating new socket connection to: ${url} (attempt ${connectionAttempts + 1})`);
  
  connectionAttempts++;
  socket = io(url, { 
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
  });
  
  socket.on('connect', () => {
    console.log(`[fe][socket] Socket connected with ID: ${socket?.id}`);
    connectionAttempts = 0; // Reset on successful connection
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`[fe][socket] Socket disconnected: ${reason}`);
  });
  
  socket.on('connect_error', (error) => {
    console.error(`[fe][socket] Connection error:`, error);
  });
  
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    console.log(`[fe][socket] Disconnecting socket: ${socket.id}`);
    socket.disconnect();
    socket = null;
    connectionAttempts = 0;
  }
}

// Cleanup function to be called on page unload
export function cleanupSocket(): void {
  if (socket) {
    console.log(`[fe][socket] Cleaning up socket: ${socket.id}`);
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectionAttempts = 0;
  }
}

// Initialize cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupSocket);
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


