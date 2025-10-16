import { Server, Socket } from "socket.io";
import { User } from "../models/User";
import { createMarket, endMarket, getMarketDetail, joinMarket, listActiveMarkets } from "../services/marketService";
import { uploadAvatarFromBuffer } from "../services/uploadService";
import type { AckResult, ClientEvents, CreateMarketPayload, JoinMarketPayload, ServerEvents } from "../types/socket";
import { usernameFromWallet } from "../utils/user";

export function registerSocketHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
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

  socket.on(
    "start_stream",
    async (
      { marketId }: { marketId: string },
      ack?: (result: AckResult) => void
    ) => {
    try {
      const market = await getMarketDetail(marketId);
      if (!market) throw new Error("Market not found");
      // Minimal inline update to avoid extra service: set isLive
      const updated = await (await import("../models/Market.js")).Market.findByIdAndUpdate(marketId, { $set: { "livestream.isLive": true, "livestream.streamKey": cryptoRandomKey() } }, { new: true });
      io.to(marketId).emit("stream_update", { marketId, isLive: true });
      ack?.({ ok: true, data: { streamKey: updated?.livestream?.streamKey } });
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
      { status }: { status?: "active" | "ended" | "cancelled" },
      ack?: (result: AckResult) => void
    ) => {
    try {
      const markets = await listActiveMarkets();
      ack?.({ ok: true, data: markets });
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

