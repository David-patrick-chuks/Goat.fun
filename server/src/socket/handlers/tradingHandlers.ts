import { Server, Socket } from "socket.io";
import { Trade } from "../../models/Trade";
import { PriceHistory } from "../../models/PriceHistory";
import type { AckResult, ClientEvents, ServerEvents } from "../../types/socket";

export function registerTradingHandlers(_io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  socket.on(
    "buy_shares",
    async (
      { marketId, wallet, side, amount }: { marketId: string; wallet: string; side: "bullish" | "fade"; amount: number },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!marketId || !wallet || !side || !amount) {
          console.error(`[socket] buy_shares error - missing required fields`, { marketId, wallet, side, amount });
          ack?.({ ok: false, error: "Missing required fields" });
          return;
        }

        const MarketModel = (await import("../../models/Market")).Market;
        const market = await MarketModel.findById(marketId);
        
        if (!market) {
          console.error(`[socket] buy_shares error - market not found`, marketId);
          ack?.({ ok: false, error: "Market not found" });
          return;
        }

        if (market.status !== "active") {
          console.error(`[socket] buy_shares error - market not active`, marketId, market.status);
          ack?.({ ok: false, error: "Market is not active" });
          return;
        }

        // Calculate shares and price
        const shares = Math.floor(amount / (side === "bullish" ? 1.2 : 0.8));
        const price = side === "bullish" ? 1.2 : 0.8;
        
        // Save trade to database
        const trade = new Trade({
          marketId,
          wallet,
          side,
          shares,
          price,
          amount
        });
        await trade.save();
        
        // Update market supply
        if (side === "bullish") {
          market.bullishSupply += shares;
        } else {
          market.fadeSupply += shares;
        }
        market.poolBalance += amount;
        
        // Save price history snapshot
        const priceSnapshot = new PriceHistory({
          marketId,
          bullishPrice: 1.2,
          fadePrice: 0.8,
          bullishSupply: market.bullishSupply,
          fadeSupply: market.fadeSupply,
          poolBalance: market.poolBalance
        });
        await priceSnapshot.save();
        
        await market.save();
        
        console.log(`[socket] buy_shares success - market: ${marketId}, wallet: ${wallet}, side: ${side}, amount: ${amount}, shares: ${shares}`);
        ack?.({ ok: true, data: { shares, price } });
        
        // Broadcast market update
        socket.to(`market-${marketId}`).emit("market_update", {
          marketId,
          bullishSupply: market.bullishSupply,
          fadeSupply: market.fadeSupply,
          bullishPrice: 1.2,
          fadePrice: 0.8,
          poolBalance: market.poolBalance,
        });
        
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] buy_shares error - market: ${marketId}, wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "get_holders",
    async (
      { marketId, limit }: { marketId: string; limit?: number },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const lim = Math.min(100, Math.max(1, limit ?? 20));
        
        // Get top holders by total amount invested
        const holders = await Trade.aggregate([
          { $match: { marketId } },
          {
            $group: {
              _id: "$wallet",
              totalShares: { $sum: "$shares" },
              totalAmount: { $sum: "$amount" },
              avgPrice: { $avg: "$price" },
              lastTrade: { $max: "$timestamp" },
              side: { $first: "$side" } // Get the most recent side
            }
          },
          { $sort: { totalAmount: -1 } },
          { $limit: lim }
        ]);
        
        const formattedHolders = holders.map(holder => ({
          wallet: holder._id,
          side: holder.side,
          shares: holder.totalShares,
          price: holder.avgPrice,
          timestamp: holder.lastTrade
        }));
        
        ack?.({ ok: true, data: formattedHolders });
        console.log(`[socket] get_holders success for marketId: ${marketId}, returned ${formattedHolders.length} holders`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_holders error for marketId: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "get_price_history",
    async (
      { marketId, limit }: { marketId: string; limit?: number },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const lim = Math.min(1000, Math.max(1, limit ?? 100));
        
        const priceHistory = await PriceHistory.find({ marketId })
          .sort({ timestamp: 1 })
          .limit(lim)
          .lean();
        
        ack?.({ ok: true, data: priceHistory });
        console.log(`[socket] get_price_history success for marketId: ${marketId}, returned ${priceHistory.length} records`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_price_history error for marketId: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );
}
