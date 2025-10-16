import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { env } from "./config/env";
import { EXPIRY_SWEEP_INTERVAL_MS } from "./constants/index";
import { connectMongo } from "./db/mongo";
import { Market } from "./models/Market";
import { endMarket as endMarketSvc, isExpired } from "./services/marketService";
import { registerSocketHandlers } from "./socket/handlers";
import type { ClientEvents, ServerEvents } from "./types/socket";

async function bootstrap() {
  await connectMongo();
  console.log("[db] ready");

  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  // Health route
  app.get("/health", (_req, res) => {
    res.json({ ok: true, db: (require("mongoose") as typeof import("mongoose")).connection.readyState === 1 ? "connected" : "disconnected" });
  });

  const server = http.createServer(app);
  const io: Server<ClientEvents, ServerEvents> = new Server(server, {
    cors: { origin: env.CORS_ORIGIN },
  });

  io.on("connection", (socket: Socket<ClientEvents, ServerEvents>) => {
    registerSocketHandlers(io, socket);
  });

  // Expiry job: check every 10 seconds
  setInterval(async () => {
    const actives = await Market.find({ status: "active" });
    for (const m of actives) {
      if (isExpired(m)) {
        const ended = await endMarketSvc(String(m._id));
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
  }, EXPIRY_SWEEP_INTERVAL_MS);

  server.listen(env.PORT, () => {
    console.log(`[http] GoatFun backend running on :${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});


