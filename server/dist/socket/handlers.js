"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const User_1 = require("../models/User");
const marketService_1 = require("../services/marketService");
const uploadService_1 = require("../services/uploadService");
const user_1 = require("../utils/user");
function registerSocketHandlers(io, socket) {
    // Identify user by wallet only
    socket.on("user_connect", async ({ wallet, username }, ack) => {
        try {
            const defaultUsername = username ?? (0, user_1.usernameFromWallet)(wallet);
            await User_1.User.updateOne({ wallet }, { $setOnInsert: { createdMarkets: [], createdAt: new Date() }, $set: { username: defaultUsername } }, { upsert: true });
            ack?.({ ok: true });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    // Upload avatar: client sends base64 or binary buffer
    socket.on("upload_avatar", async ({ wallet, data, filename }, ack) => {
        try {
            const buffer = Buffer.from(data, data.startsWith("data:") ? "base64" : "base64");
            const upload = await (0, uploadService_1.uploadAvatarFromBuffer)(buffer, filename);
            await User_1.User.updateOne({ wallet }, { $set: { avatarUrl: upload.secure_url } });
            ack?.({ ok: true, data: { url: upload.secure_url } });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("update_profile", async ({ wallet, username, bio, avatarUrl }, ack) => {
        try {
            const nextUsername = username ?? (0, user_1.usernameFromWallet)(wallet);
            await User_1.User.updateOne({ wallet }, { $set: { username: nextUsername, bio, avatarUrl } }, { upsert: true });
            ack?.({ ok: true });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("create_market", async (data, ack) => {
        try {
            const market = await (0, marketService_1.createMarket)(data);
            socket.join(String(market._id));
            io.emit("market_created", { marketId: String(market._id) });
            ack?.({ ok: true, data: { marketId: String(market._id) } });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("join_market", async (data, ack) => {
        try {
            const market = await (0, marketService_1.joinMarket)(data);
            io.to(String(market._id)).emit("market_update", {
                marketId: String(market._id),
                bullishSupply: market.bullishSupply,
                fadeSupply: market.fadeSupply,
                bullishPrice: market.bullishPrice,
                fadePrice: market.fadePrice,
                poolBalance: market.poolBalance,
            });
            ack?.({ ok: true });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("start_stream", async ({ marketId }, ack) => {
        try {
            const market = await (0, marketService_1.getMarketDetail)(marketId);
            if (!market)
                throw new Error("Market not found");
            // Minimal inline update to avoid extra service: set isLive
            const updated = await (await Promise.resolve().then(() => __importStar(require("../models/Market.js")))).Market.findByIdAndUpdate(marketId, { $set: { "livestream.isLive": true, "livestream.streamKey": cryptoRandomKey() } }, { new: true });
            io.to(marketId).emit("stream_update", { marketId, isLive: true });
            ack?.({ ok: true, data: { streamKey: updated?.livestream?.streamKey } });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("stop_stream", async ({ marketId }, ack) => {
        try {
            await (await Promise.resolve().then(() => __importStar(require("../models/Market.js")))).Market.findByIdAndUpdate(marketId, { $set: { "livestream.isLive": false, "livestream.endedAt": new Date() } });
            io.to(marketId).emit("stream_update", { marketId, isLive: false });
            ack?.({ ok: true });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("end_market", async ({ marketId, finalResult }, ack) => {
        try {
            const market = await (0, marketService_1.endMarket)(marketId, finalResult);
            io.to(String(market._id)).emit("market_update", {
                marketId: String(market._id),
                bullishSupply: market.bullishSupply,
                fadeSupply: market.fadeSupply,
                bullishPrice: market.bullishPrice,
                fadePrice: market.fadePrice,
                poolBalance: market.poolBalance,
            });
            ack?.({ ok: true });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("get_markets", async (_payload, ack) => {
        try {
            const markets = await (0, marketService_1.listActiveMarkets)();
            ack?.({ ok: true, data: markets });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("get_market_detail", async ({ marketId }, ack) => {
        try {
            const market = await (0, marketService_1.getMarketDetail)(marketId);
            ack?.({ ok: true, data: market });
        }
        catch (err) {
            const e = err;
            ack?.({ ok: false, error: e.message });
        }
    });
}
function cryptoRandomKey() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
//# sourceMappingURL=handlers.js.map