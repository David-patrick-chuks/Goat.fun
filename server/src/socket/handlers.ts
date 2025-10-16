import { Server, Socket } from "socket.io";
import { ChatMessage } from "../models/Chat";
import { User } from "../models/User";
import { createMarket, endMarket, getMarketDetail, joinMarket } from "../services/marketService";
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
      } catch (err) {
        const e = err as Error;
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
      } catch (err) {
        const e = err as Error;
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
      } catch (err) {
        const e = err as Error;
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
      } catch (err) {
        const e = err as Error;
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
      } catch (err) {
        const e = err as Error;
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
    } catch (err) {
      const e = err as Error;
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
    } catch (err) {
      const e = err as Error;
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
      } catch (err) {
        const e = err as Error;
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
      } catch (err) {
        const e = err as Error;
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
      
      const updated = await (await import("../models/Market.js")).Market.findByIdAndUpdate(
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
    } catch (err) {
      const e = err as Error;
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
      await (await import("../models/Market.js")).Market.findByIdAndUpdate(marketId, { $set: { "livestream.isLive": false, "livestream.endedAt": new Date() } });
      // Purge chat for this market after ending stream
      await ChatMessage.deleteMany({ marketId });
      io.to(marketId).emit("stream_update", { marketId, isLive: false });
      ack?.({ ok: true });
    } catch (err) {
      const e = err as Error;
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
    } catch (err) {
      const e = err as Error;
      ack?.({ ok: false, error: e.message });
    }
    }
  );

  socket.on(
    "get_markets",
    async (
      payload: { status?: "active" | "ended" | "cancelled"; page?: number; limit?: number; sort?: "newest" | "trending" | "market_cap" },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const page = Math.max(1, payload?.page ?? 1);
        const limit = Math.min(50, Math.max(1, payload?.limit ?? 20));
        const status = payload?.status ?? "active";
        const sortKey = payload?.sort ?? "newest";

        const query: Record<string, unknown> = { status };
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
      } catch (err) {
        const e = err as Error;
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
    } catch (err) {
      const e = err as Error;
      ack?.({ ok: false, error: e.message });
    }
    }
  );
}

function cryptoRandomKey(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

