"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const index_1 = require("./constants/index");
const mongo_1 = require("./db/mongo");
const Market_1 = require("./models/Market");
const marketService_1 = require("./services/marketService");
const handlers_1 = require("./socket/handlers");
async function bootstrap() {
    await (0, mongo_1.connectMongo)();
    console.log("[db] ready");
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN }));
    app.get("/health", (_req, res) => {
        res.json({ ok: true, db: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected" });
    });
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        cors: { origin: env_1.env.CORS_ORIGIN },
    });
    io.on("connection", (socket) => {
        (0, handlers_1.registerSocketHandlers)(io, socket);
    });
    setInterval(async () => {
        const actives = await Market_1.Market.find({ status: "active" });
        for (const m of actives) {
            if ((0, marketService_1.isExpired)(m)) {
                const ended = await (0, marketService_1.endMarket)(String(m._id));
                io.to(String(ended._id)).emit("market_update", {
                    marketId: String(ended._id),
                    bullishSupply: ended.bullishSupply,
                    fadeSupply: ended.fadeSupply,
                    bullishPrice: ended.bullishPrice,
                    fadePrice: ended.fadePrice,
                    poolBalance: ended.poolBalance,
                });
            }
        }
    }, index_1.EXPIRY_SWEEP_INTERVAL_MS);
    server.listen(env_1.env.PORT, () => {
        console.log(`[http] GoatFun backend running on :${env_1.env.PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map