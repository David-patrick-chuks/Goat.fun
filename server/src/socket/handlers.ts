import { Server, Socket } from "socket.io";
import { ChatMessage } from "../models/Chat";
import { User } from "../models/User";
import { createMarket, endMarket, getMarketDetail, joinMarket } from "../services/marketService";
import { createLiveKitRoom } from "../services/streamService";
import { uploadAvatarFromBuffer, uploadMarketMediaFromBuffer } from "../services/uploadService";
import type { AckResult, ClientEvents, CreateMarketPayload, JoinMarketPayload, ServerEvents } from "../types/socket";
import { usernameFromWallet } from "../utils/user";

export function registerSocketHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  console.log(`[socket] connected id=${socket.id}`);
  socket.on("disconnect", (reason) => {
    console.log(`[socket] disconnected id=${socket.id} reason=${reason}`);
  });
  // Identify user by wallet only
  socket.on(
    "user_connect",
    async (
      { wallet, username }: { wallet: string; username?: string },
      ack?: (result: AckResult) => void
    ) => {
    try {
      const defaultUsername = username ?? usernameFromWallet(wallet);
      await User.updateOne(
        { wallet },
        { $setOnInsert: { createdMarkets: [], createdAt: new Date() }, $set: { username: defaultUsername } },
        { upsert: true }
      );
      ack?.({ ok: true });
      console.log(`[socket] user_connect success for wallet: ${wallet}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] user_connect error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Fetch user by wallet
  socket.on(
    "get_user",
    async (
      { wallet }: { wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const user = await User.findOne({ wallet }).lean();
        ack?.({ ok: true, data: user ?? null });
        console.log(`[socket] get_user success for wallet: ${wallet}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_user error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Upload avatar: client sends base64 or binary buffer
  socket.on(
    "upload_avatar",
    async (
      { wallet, data, filename }: { wallet: string; data: string; filename: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const buffer = Buffer.from(data, data.startsWith("data:") ? "base64" : "base64");
        const upload = await uploadAvatarFromBuffer(buffer, filename);
        await User.updateOne({ wallet }, { $set: { avatarUrl: upload.secure_url } });
        ack?.({ ok: true, data: { url: upload.secure_url } });
        console.log(`[socket] upload_avatar success for wallet: ${wallet}, url: ${upload.secure_url}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] upload_avatar error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Upload market media (image/video) and return a URL
  socket.on(
    "upload_market_media",
    async (
      { data, filename }: { data: string; filename: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const payload = data.startsWith("data:") ? data.split(",")[1] : data;
        const buffer = Buffer.from(payload, "base64");
        const upload = await uploadMarketMediaFromBuffer(buffer, filename);
        ack?.({ ok: true, data: { url: upload.secure_url } });
        console.log(`[socket] upload_market_media success for file: ${filename}, url: ${upload.secure_url}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] upload_market_media error for file: ${filename}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "update_profile",
    async (
      { wallet, username, bio, avatarUrl }: { wallet: string; username?: string; bio?: string; avatarUrl?: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const nextUsername = username ?? usernameFromWallet(wallet);
        await User.updateOne({ wallet }, { $set: { username: nextUsername, bio, avatarUrl } }, { upsert: true });
        ack?.({ ok: true });
        console.log(`[socket] update_profile success for wallet: ${wallet}, username: ${nextUsername}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] update_profile error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on("create_market", async (data: CreateMarketPayload, ack?: (result: AckResult) => void) => {
    try {
      const market = await createMarket(data);
      socket.join(String(market._id));
      io.emit("market_created", { marketId: String(market._id) });
      ack?.({ ok: true, data: { marketId: String(market._id) } });
      console.log(`[socket] create_market success for creator: ${data.creator}, marketId: ${market._id}, title: ${data.title}`);
    } catch (err) {
      const e = err as Error;
      console.error(`[socket] create_market error for creator: ${data.creator}, title: ${data.title}`, e.message);
      ack?.({ ok: false, error: e.message });
    }
  });

  socket.on("join_market", async (data: JoinMarketPayload, ack?: (result: AckResult) => void) => {
    try {
      const market = await joinMarket(data);
      io.to(String(market._id)).emit("market_update", {
        marketId: String(market._id),
        bullishSupply: market.bullishSupply,
        fadeSupply: market.fadeSupply,
        bullishPrice: market.bullishPrice,
        fadePrice: market.fadePrice,
        poolBalance: market.poolBalance,
      });
      ack?.({ ok: true });
      console.log(`[socket] join_market success for wallet: ${data.wallet}, marketId: ${data.marketId}, side: ${data.side}, shares: ${data.shares}`);
    } catch (err) {
      const e = err as Error;
      console.error(`[socket] join_market error for wallet: ${data.wallet}, marketId: ${data.marketId}`, e.message);
      ack?.({ ok: false, error: e.message });
    }
  });

  // Simple public chat per market room
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

  socket.on(
    "start_stream",
    async (
      { marketId }: { marketId: string },
      ack?: (result: AckResult) => void
    ) => {
    try {
      const market = await getMarketDetail(marketId);
      if (!market) throw new Error("Market not found");
      
      // Create LiveKit room and access token
      const livekitRoom = await createLiveKitRoom(marketId, market.creator);
      
      await (await import("../models/Market")).Market.findByIdAndUpdate(
        marketId,
        { 
          $set: { 
            "livestream.isLive": true, 
            "livestream.streamKey": livekitRoom.accessToken,
            "livestream.playbackUrl": livekitRoom.wsUrl,
            "livestream.roomName": livekitRoom.roomName
          } 
        },
        { new: true }
      );
      
      io.to(marketId).emit("stream_update", { marketId, isLive: true });
      ack?.({ ok: true, data: { 
        accessToken: livekitRoom.accessToken,
        wsUrl: livekitRoom.wsUrl,
        roomName: livekitRoom.roomName
      } });
      console.log(`[socket] start_stream success for marketId: ${marketId}, roomName: ${livekitRoom.roomName}`);
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
      { marketId }: { marketId: string },
      ack?: (result: AckResult) => void
    ) => {
    try {
      await (await import("../models/Market")).Market.findByIdAndUpdate(marketId, { $set: { "livestream.isLive": false, "livestream.endedAt": new Date() } });
      // Purge chat for this market after ending stream
      await ChatMessage.deleteMany({ marketId });
      io.to(marketId).emit("stream_update", { marketId, isLive: false });
      ack?.({ ok: true });
      console.log(`[socket] stop_stream success for marketId: ${marketId}, chat purged`);
    } catch (err) {
      const e = err as Error;
      console.error(`[socket] stop_stream error for marketId: ${marketId}`, e.message);
      ack?.({ ok: false, error: e.message });
    }
    }
  );

  socket.on(
    "end_market",
    async (
      { marketId, finalResult }: { marketId: string; finalResult?: "bullish" | "fade" | "none" },
      ack?: (result: AckResult) => void
    ) => {
    try {
      const market = await endMarket(marketId, finalResult);
      io.to(String(market._id)).emit("market_update", {
        marketId: String(market._id),
        bullishSupply: market.bullishSupply,
        fadeSupply: market.fadeSupply,
        bullishPrice: market.bullishPrice,
        fadePrice: market.fadePrice,
        poolBalance: market.poolBalance,
      });
      ack?.({ ok: true });
      console.log(`[socket] end_market success for marketId: ${marketId}, finalResult: ${finalResult}`);
    } catch (err) {
      const e = err as Error;
      console.error(`[socket] end_market error for marketId: ${marketId}`, e.message);
      ack?.({ ok: false, error: e.message });
    }
    }
  );

  socket.on(
    "get_markets",
    async (
      payload: { status?: "active" | "ended" | "cancelled"; page?: number; limit?: number; sort?: "newest" | "trending" | "market_cap"; search?: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const page = Math.max(1, payload?.page ?? 1);
        const limit = Math.min(50, Math.max(1, payload?.limit ?? 20));
        const status = payload?.status ?? "active";
        const sortKey = payload?.sort ?? "newest";
        const searchQuery = payload?.search?.trim();

        const query: Record<string, unknown> = { status };
        
        // Add search functionality
        if (searchQuery) {
          query.$or = [
            { title: { $regex: searchQuery, $options: 'i' } },
            { ticker: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { creator: { $regex: searchQuery, $options: 'i' } }
          ];
        }

        let sort: Record<string, 1 | -1>;
        if (sortKey === "market_cap") sort = { poolBalance: -1 };
        else if (sortKey === "trending") sort = { bullishSupply: -1, fadeSupply: -1 };
        else sort = { createdAt: -1 };

        const MarketModel = (await import("../models/Market")).Market;
        const data = await MarketModel.find(query)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();
        ack?.({ ok: true, data });
        console.log(`[socket] get_markets success - page: ${page}, limit: ${limit}, status: ${status}, sort: ${sortKey}, search: "${searchQuery || 'none'}", returned: ${data.length} markets`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_markets error - page: ${payload?.page || 1}, status: ${payload?.status || 'active'}`, e.message);
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
      ack?.({ ok: true, data: market });
      console.log(`[socket] get_market_detail success for marketId: ${marketId}, title: ${market?.title || 'N/A'}`);
    } catch (err) {
      const e = err as Error;
      console.error(`[socket] get_market_detail error for marketId: ${marketId}`, e.message);
      ack?.({ ok: false, error: e.message });
    }
    }
  );
}

