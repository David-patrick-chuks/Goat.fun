import { Server, Socket } from "socket.io";
import { ChatMessage } from "../../models/Chat";
import type { AckResult, ClientEvents, ServerEvents } from "../../types/socket";

export function registerChatHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  socket.on(
    "chat_message",
    async (
      { marketId, wallet, message }: { marketId: string; wallet: string; message: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!message || !message.trim()) throw new Error("Empty message");
        const saved = await ChatMessage.create({ marketId, wallet, message, at: new Date() });
        io.to(marketId).emit("chat_message", { marketId, wallet, message, at: saved.at.toISOString() });
        ack?.({ ok: true });
        console.log(`[socket] chat_message success for marketId: ${marketId}, wallet: ${wallet}, message: ${message.substring(0, 50)}...`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] chat_message error for marketId: ${marketId}, wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "get_chat",
    async (
      { marketId, limit }: { marketId: string; limit?: number },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const lim = Math.min(200, Math.max(1, limit ?? 50));
        const items = await ChatMessage.find({ marketId }).sort({ at: -1 }).limit(lim).lean();
        ack?.({ ok: true, data: items.reverse() });
        console.log(`[socket] get_chat success for marketId: ${marketId}, returned ${items.length} messages`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_chat error for marketId: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );
}
