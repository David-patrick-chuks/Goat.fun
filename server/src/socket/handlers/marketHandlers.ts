import { Server, Socket } from "socket.io";
import { createMarket, getMarketDetail, joinMarket } from "../../services/marketService";
import { uploadMarketMediaFromBuffer } from "../../services/uploadService";
import type { AckResult, ClientEvents, CreateMarketPayload, JoinMarketPayload, ServerEvents } from "../../types/socket";

export function registerMarketHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  socket.on(
    "get_markets",
    async (
      { status, page, limit, sort, search }: { status?: "active" | "ended" | "cancelled"; page?: number; limit?: number; sort?: "newest" | "trending" | "market_cap"; search?: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const p = Math.max(1, page ?? 1);
        const l = Math.min(50, Math.max(1, limit ?? 20));
        const s = sort ?? "newest";
        const st = status ?? "active";
        
        let query: any = { status: st };
        
        // Add search functionality
        if (search && search.trim()) {
          const searchRegex = new RegExp(search.trim(), 'i');
          query.$or = [
            { title: searchRegex },
            { ticker: searchRegex },
            { description: searchRegex },
            { creator: searchRegex }
          ];
        }
        
        let sortQuery: any = {};
        switch (s) {
          case "newest":
            sortQuery = { createdAt: -1 };
            break;
          case "trending":
            sortQuery = { poolBalance: -1 };
            break;
          case "market_cap":
            sortQuery = { poolBalance: -1 };
            break;
        }
        
        const MarketModel = (await import("../../models/Market")).Market;
        const items = await MarketModel.find(query).sort(sortQuery).skip((p - 1) * l).limit(l).lean();
        const total = await MarketModel.countDocuments(query);
        
        ack?.({ ok: true, data: { items, total, page: p, limit: l } });
        console.log(`[socket] get_markets success - page: ${p}, limit: ${l}, sort: ${s}, status: ${st}, search: ${search || 'none'}, returned ${items.length} markets`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_markets error - page: ${page || 1}, status: ${status || 'active'}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "get_market_detail",
    async (
      { marketId }: { marketId: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const market = await getMarketDetail(marketId);
        if (!market) throw new Error("Market not found");
        ack?.({ ok: true, data: market });
        console.log(`[socket] get_market_detail success for marketId: ${marketId}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_market_detail error for marketId: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on("create_market", async (data: CreateMarketPayload, ack?: (result: AckResult) => void) => {
    try {
      const market = await createMarket(data);
      io.emit("market_created", { marketId: (market._id as any).toString() });
      ack?.({ ok: true, data: market });
      console.log(`[socket] create_market success for wallet: ${data.creator}, title: ${data.title}`);
    } catch (err) {
      const e = err as Error;
      console.error(`[socket] create_market error for wallet: ${data.creator}`, e.message);
      ack?.({ ok: false, error: e.message });
    }
  });

  socket.on("join_market", async (data: JoinMarketPayload, ack?: (result: AckResult) => void) => {
    try {
      // Validate wallet authentication
      if (!socket.data.wallet) {
        throw new Error("User not authenticated");
      }
      
      // Use socket wallet if not provided in data
      const wallet = data.wallet || socket.data.wallet;
      
      // Check if this is a trading operation (has side and shares) or just joining for chat
      if (data.side && data.shares) {
        // This is a trading operation - validate required fields
        if (!data.marketId) {
          throw new Error("Missing required field: marketId");
        }
        
        // Validate shares is a valid number
        if (isNaN(data.shares) || data.shares <= 0) {
          throw new Error("Shares must be a valid positive number");
        }
        
        const result = await joinMarket({
          ...data,
          wallet
        });
        
        ack?.({ ok: true, data: result });
        console.log(`[socket] join_market (trading) success for wallet: ${wallet}, marketId: ${data.marketId}, side: ${data.side}, shares: ${data.shares}`);
      } else {
        // This is just joining the market room for chat - no trading
        if (!data.marketId) {
          throw new Error("Missing required field: marketId");
        }
        
        // Just acknowledge the join - no actual trading operation
        ack?.({ ok: true, data: { message: "Joined market room for chat" } });
        console.log(`[socket] join_market (chat) success for wallet: ${wallet}, marketId: ${data.marketId}`);
      }
    } catch (err) {
      const e = err as Error;
      console.error(`[socket] join_market error for wallet: ${data.wallet || socket.data.wallet}, marketId: ${data.marketId}`, e.message);
      ack?.({ ok: false, error: e.message });
    }
  });

  socket.on(
    "upload_market_media",
    async (
      { data, filename, marketId, mediaType }: { data: string; filename: string; marketId?: string; mediaType?: "banner" | "media" },
      ack?: (result: AckResult) => void
    ) => {
      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(data.split(',')[1], 'base64');
        
        // Generate filename with timestamp if no marketId (for new markets)
        const fileId = marketId ? `${marketId}-${mediaType}` : `temp-${Date.now()}-${filename}`;
        
        const url = await uploadMarketMediaFromBuffer(buffer, fileId);
        ack?.({ ok: true, data: { url: url.secure_url } });
        console.log(`[socket] upload_market_media success for marketId: ${marketId || 'temp'}, type: ${mediaType || 'unknown'}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] upload_market_media error for marketId: ${marketId || 'temp'}, type: ${mediaType || 'unknown'}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );
}
