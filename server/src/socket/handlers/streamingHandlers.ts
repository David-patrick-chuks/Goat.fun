import { Server, Socket } from "socket.io";
import { getMarketDetail } from "../../services/marketService";
import type { AckResult, ClientEvents, ServerEvents } from "../../types/socket";

export function registerStreamingHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  socket.on(
    "start_stream",
    async (
      { marketId, wallet }: { marketId: string; wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const market = await getMarketDetail(marketId);
        if (!market) throw new Error("Market not found");
        
        // Verify only the market creator can start the stream
        if (market.creator !== wallet) {
          console.error(`[socket] start_stream error - unauthorized user`, { marketId, wallet, creator: market.creator });
          ack?.({ ok: false, error: "Only the market creator can start streaming" });
          return;
        }
        
        // Update market to show it's live
        await (await import("../../models/Market")).Market.findByIdAndUpdate(
          marketId,
          { 
            $set: { 
              "livestream.isLive": true,
              "livestream.streamKey": `stream-${marketId}-${Date.now()}`,
              "livestream.playbackUrl": `webrtc://localhost:8080/stream/${marketId}`,
              "livestream.roomName": `room-${marketId}`
            } 
          },
          { new: true }
        );
        
        // Join the market room for real-time updates
        socket.join(`market-${marketId}`);
        
        io.to(`market-${marketId}`).emit("stream_update", { marketId, isLive: true });
        ack?.({ ok: true, data: { 
          streamKey: `stream-${marketId}-${Date.now()}`,
          playbackUrl: `webrtc://localhost:8080/stream/${marketId}`,
          roomName: `room-${marketId}`
        } });
        console.log(`[socket] start_stream success for marketId: ${marketId}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] start_stream error for marketId: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "stop_stream",
    async (
      { marketId, wallet }: { marketId: string; wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const market = await getMarketDetail(marketId);
        if (!market) throw new Error("Market not found");
        
        // Verify only the market creator can stop the stream
        if (market.creator !== wallet) {
          console.error(`[socket] stop_stream error - unauthorized user`, { marketId, wallet, creator: market.creator });
          ack?.({ ok: false, error: "Only the market creator can stop streaming" });
          return;
        }
        
        // Update market to show it's not live
        await (await import("../../models/Market")).Market.findByIdAndUpdate(
          marketId,
          { 
            $set: { 
              "livestream.isLive": false,
              "livestream.streamKey": null,
              "livestream.playbackUrl": null,
              "livestream.roomName": null
            } 
          },
          { new: true }
        );
        
        // Purge chat messages for this market
        await (await import("../../models/Chat")).ChatMessage.deleteMany({ marketId });
        
        io.to(`market-${marketId}`).emit("stream_update", { marketId, isLive: false });
        ack?.({ ok: true });
        console.log(`[socket] stop_stream success for marketId: ${marketId}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] stop_stream error for marketId: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "request_to_join",
    async (
      { marketId, wallet }: { marketId: string; wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const market = await getMarketDetail(marketId);
        if (!market) {
          console.error(`[socket] request_to_join error - market not found`, marketId);
          ack?.({ ok: false, error: "Market not found" });
          return;
        }

        if (!market.livestream?.isLive) {
          console.error(`[socket] request_to_join error - stream not live`, marketId);
          ack?.({ ok: false, error: "Stream is not live" });
          return;
        }

        // Notify the streamer about the join request
        io.to(`market-${marketId}`).emit("join_request", { marketId, wallet });
        
        console.log(`[socket] request_to_join success - market: ${marketId}, wallet: ${wallet}`);
        ack?.({ ok: true });
        
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] request_to_join error - market: ${marketId}, wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "accept_join_request",
    async (
      { marketId, requesterWallet, streamerWallet }: { marketId: string; requesterWallet: string; streamerWallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        // Verify the streamer is the one accepting
        const market = await getMarketDetail(marketId);
        if (!market || market.creator !== streamerWallet) {
          console.error(`[socket] accept_join_request error - unauthorized`, { marketId, requesterWallet, streamerWallet });
          ack?.({ ok: false, error: "Unauthorized" });
          return;
        }

        // Notify the requester that their request was accepted
        io.to(`market-${marketId}`).emit("join_request_accepted", { marketId, streamerWallet });
        
        console.log(`[socket] accept_join_request success - market: ${marketId}, requester: ${requesterWallet}, streamer: ${streamerWallet}`);
        ack?.({ ok: true });
        
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] accept_join_request error - market: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );
}
