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
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
const marketService_1 = require("../services/marketService");
const streamService_1 = require("../services/streamService");
const uploadService_1 = require("../services/uploadService");
const user_1 = require("../utils/user");
function registerSocketHandlers(io, socket) {
    console.log(`[socket] connected id=${socket.id}`);
    socket.on("disconnect", (reason) => {
        console.log(`[socket] disconnected id=${socket.id} reason=${reason}`);
    });
    // Identify user by wallet only
    socket.on("user_connect", async ({ wallet, username }, ack) => {
        try {
            const defaultUsername = username ?? (0, user_1.usernameFromWallet)(wallet);
            await User_1.User.updateOne({ wallet }, { $setOnInsert: { createdMarkets: [], createdAt: new Date() }, $set: { username: defaultUsername } }, { upsert: true });
            ack?.({ ok: true });
            console.log(`[socket] user_connect success for wallet: ${wallet}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] user_connect error for wallet: ${wallet}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    // Fetch user by wallet
    socket.on("get_user", async ({ wallet }, ack) => {
        try {
            const user = await User_1.User.findOne({ wallet }).lean();
            ack?.({ ok: true, data: user ?? null });
            console.log(`[socket] get_user success for wallet: ${wallet}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] get_user error for wallet: ${wallet}`, e.message);
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
            console.log(`[socket] upload_avatar success for wallet: ${wallet}, url: ${upload.secure_url}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] upload_avatar error for wallet: ${wallet}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    // Upload market media (image/video) and return a URL
    socket.on("upload_market_media", async ({ data, filename }, ack) => {
        try {
            const payload = data.startsWith("data:") ? data.split(",")[1] : data;
            const buffer = Buffer.from(payload, "base64");
            const upload = await (0, uploadService_1.uploadMarketMediaFromBuffer)(buffer, filename);
            ack?.({ ok: true, data: { url: upload.secure_url } });
            console.log(`[socket] upload_market_media success for file: ${filename}, url: ${upload.secure_url}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] upload_market_media error for file: ${filename}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("update_profile", async ({ wallet, username, bio, avatarUrl }, ack) => {
        try {
            const nextUsername = username ?? (0, user_1.usernameFromWallet)(wallet);
            await User_1.User.updateOne({ wallet }, { $set: { username: nextUsername, bio, avatarUrl } }, { upsert: true });
            ack?.({ ok: true });
            console.log(`[socket] update_profile success for wallet: ${wallet}, username: ${nextUsername}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] update_profile error for wallet: ${wallet}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("create_market", async (data, ack) => {
        try {
            const market = await (0, marketService_1.createMarket)(data);
            socket.join(String(market._id));
            io.emit("market_created", { marketId: String(market._id) });
            ack?.({ ok: true, data: { marketId: String(market._id) } });
            console.log(`[socket] create_market success for creator: ${data.creator}, marketId: ${market._id}, title: ${data.title}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] create_market error for creator: ${data.creator}, title: ${data.title}`, e.message);
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
            console.log(`[socket] join_market success for wallet: ${data.wallet}, marketId: ${data.marketId}, side: ${data.side}, shares: ${data.shares}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] join_market error for wallet: ${data.wallet}, marketId: ${data.marketId}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    // Simple public chat per market room
    socket.on("chat_message", async ({ marketId, wallet, message }, ack) => {
        try {
            if (!message || !message.trim())
                throw new Error("Empty message");
            const saved = await Chat_1.ChatMessage.create({ marketId, wallet, message, at: new Date() });
            io.to(marketId).emit("chat_message", { marketId, wallet, message, at: saved.at.toISOString() });
            ack?.({ ok: true });
            console.log(`[socket] chat_message success for marketId: ${marketId}, wallet: ${wallet}, message: ${message.substring(0, 50)}...`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] chat_message error for marketId: ${marketId}, wallet: ${wallet}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("get_chat", async ({ marketId, limit }, ack) => {
        try {
            const lim = Math.min(200, Math.max(1, limit ?? 50));
            const items = await Chat_1.ChatMessage.find({ marketId }).sort({ at: -1 }).limit(lim).lean();
            ack?.({ ok: true, data: items.reverse() });
            console.log(`[socket] get_chat success for marketId: ${marketId}, returned ${items.length} messages`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] get_chat error for marketId: ${marketId}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("start_stream", async ({ marketId }, ack) => {
        try {
            const market = await (0, marketService_1.getMarketDetail)(marketId);
            if (!market)
                throw new Error("Market not found");
            // Create LiveKit room and access token
            const livekitRoom = await (0, streamService_1.createLiveKitRoom)(marketId, market.creator);
            await (await Promise.resolve().then(() => __importStar(require("../models/Market")))).Market.findByIdAndUpdate(marketId, {
                $set: {
                    "livestream.isLive": true,
                    "livestream.streamKey": livekitRoom.accessToken,
                    "livestream.playbackUrl": livekitRoom.wsUrl,
                    "livestream.roomName": livekitRoom.roomName
                }
            }, { new: true });
            io.to(marketId).emit("stream_update", { marketId, isLive: true });
            ack?.({ ok: true, data: {
                    accessToken: livekitRoom.accessToken,
                    wsUrl: livekitRoom.wsUrl,
                    roomName: livekitRoom.roomName
                } });
            console.log(`[socket] start_stream success for marketId: ${marketId}, roomName: ${livekitRoom.roomName}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] start_stream error for marketId: ${marketId}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("stop_stream", async ({ marketId }, ack) => {
        try {
            await (await Promise.resolve().then(() => __importStar(require("../models/Market")))).Market.findByIdAndUpdate(marketId, { $set: { "livestream.isLive": false, "livestream.endedAt": new Date() } });
            // Purge chat for this market after ending stream
            await Chat_1.ChatMessage.deleteMany({ marketId });
            io.to(marketId).emit("stream_update", { marketId, isLive: false });
            ack?.({ ok: true });
            console.log(`[socket] stop_stream success for marketId: ${marketId}, chat purged`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] stop_stream error for marketId: ${marketId}`, e.message);
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
            console.log(`[socket] end_market success for marketId: ${marketId}, finalResult: ${finalResult}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] end_market error for marketId: ${marketId}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("get_markets", async (payload, ack) => {
        try {
            const page = Math.max(1, payload?.page ?? 1);
            const limit = Math.min(50, Math.max(1, payload?.limit ?? 20));
            const status = payload?.status ?? "active";
            const sortKey = payload?.sort ?? "newest";
            const searchQuery = payload?.search?.trim();
            const query = { status };
            // Add search functionality
            if (searchQuery) {
                query.$or = [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { ticker: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { creator: { $regex: searchQuery, $options: 'i' } }
                ];
            }
            let sort;
            if (sortKey === "market_cap")
                sort = { poolBalance: -1 };
            else if (sortKey === "trending")
                sort = { bullishSupply: -1, fadeSupply: -1 };
            else
                sort = { createdAt: -1 };
            const MarketModel = (await Promise.resolve().then(() => __importStar(require("../models/Market")))).Market;
            const data = await MarketModel.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            ack?.({ ok: true, data });
            console.log(`[socket] get_markets success - page: ${page}, limit: ${limit}, status: ${status}, sort: ${sortKey}, search: "${searchQuery || 'none'}", returned: ${data.length} markets`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] get_markets error - page: ${payload?.page || 1}, status: ${payload?.status || 'active'}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
    socket.on("get_market_detail", async ({ marketId }, ack) => {
        try {
            const market = await (0, marketService_1.getMarketDetail)(marketId);
            ack?.({ ok: true, data: market });
            console.log(`[socket] get_market_detail success for marketId: ${marketId}, title: ${market?.title || 'N/A'}`);
        }
        catch (err) {
            const e = err;
            console.error(`[socket] get_market_detail error for marketId: ${marketId}`, e.message);
            ack?.({ ok: false, error: e.message });
        }
    });
}
//# sourceMappingURL=handlers.js.map