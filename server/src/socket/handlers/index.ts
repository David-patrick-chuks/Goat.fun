import { Server, Socket } from "socket.io";
import type { ClientEvents, ServerEvents } from "../../types/socket";
import { registerChatHandlers } from "./chatHandlers";
import { registerCommentHandlers } from "./commentHandlers";
import { registerMarketHandlers } from "./marketHandlers";
import { registerStreamingHandlers } from "./streamingHandlers";
import { registerTradingHandlers } from "./tradingHandlers";
import { registerUserHandlers } from "./userHandlers";
import { registerWebRTCHandlers } from "./webrtcHandlers";

export function registerSocketHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  // Reduced logging - only log important events
  console.log(`[socket] New connection: ${socket.id}`);
  
  socket.on("disconnect", (reason) => {
    console.log(`[socket] Disconnected: ${socket.id} (${reason})`);
  });

  // Register all handler modules
  registerMarketHandlers(io, socket);
  registerChatHandlers(io, socket);
  registerCommentHandlers(io, socket);
  registerTradingHandlers(io, socket);
  registerStreamingHandlers(io, socket);
  registerUserHandlers(io, socket);
  registerWebRTCHandlers(io, socket);
}
