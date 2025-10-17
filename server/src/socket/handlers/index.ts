import { Server, Socket } from "socket.io";
import type { ClientEvents, ServerEvents } from "../../types/socket";
import { registerChatHandlers } from "./chatHandlers";
import { registerMarketHandlers } from "./marketHandlers";
import { registerStreamingHandlers } from "./streamingHandlers";
import { registerTradingHandlers } from "./tradingHandlers";
import { registerUserHandlers } from "./userHandlers";

export function registerSocketHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  console.log(`[socket] connected id=${socket.id}`);
  
  socket.on("disconnect", (reason) => {
    console.log(`[socket] disconnected id=${socket.id} reason=${reason}`);
  });

  // Register all handler modules
  registerMarketHandlers(io, socket);
  registerChatHandlers(io, socket);
  registerTradingHandlers(io, socket);
  registerStreamingHandlers(io, socket);
  registerUserHandlers(io, socket);
}
