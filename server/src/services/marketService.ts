import { BASE_PRICE, BONDING_COEFFICIENT_K, CREATOR_FEE_RATE } from "../constants/index";
import { Market } from "../models/Market";
import { User } from "../models/User";
import type { MarketDoc } from "../types/models";
import type { JoinMarketPayload, Side } from "../types/socket";

// Simple bonding curve: price = base + k * sqrt(supply)

export function computePriceFromSupply(supply: number): number {
  return parseFloat((BASE_PRICE + BONDING_COEFFICIENT_K * Math.sqrt(Math.max(0, supply))).toFixed(6));
}

export async function createMarket(input: {
  creator: string; title: string; ticker: string; description?: string; media?: string; banner?: string; socialLinks?: string[]; durationHours: number;
}): Promise<MarketDoc> {
  const now = new Date();
  const end = new Date(now.getTime() + input.durationHours * 60 * 60 * 1000);
  const market = await Market.create({
    creator: input.creator,
    title: input.title,
    ticker: input.ticker.toUpperCase(),
    description: input.description,
    media: input.media,
    banner: input.banner,
    socialLinks: input.socialLinks ?? [],
    duration: input.durationHours,
    startTime: now,
    endTime: end,
    bullishSupply: 0,
    fadeSupply: 0,
    bullishPrice: computePriceFromSupply(0),
    fadePrice: computePriceFromSupply(0),
    poolBalance: 0,
  });

  await User.updateOne(
    { wallet: input.creator },
    { $addToSet: { createdMarkets: String(market._id) } },
    { upsert: true }
  );

  return market;
}

export async function joinMarket(payload: JoinMarketPayload): Promise<MarketDoc> {
  const market = await Market.findById(payload.marketId);
  if (!market) throw new Error("Market not found");
  if (market.status !== "active") throw new Error("Market not active");

  // Calculate current price based on side supply
  const currentSupply = payload.side === "bullish" ? market.bullishSupply : market.fadeSupply;
  const price = computePriceFromSupply(currentSupply);
  const cost = price * payload.shares;

  // Update supplies and pool
  if (payload.side === "bullish") {
    market.bullishSupply += payload.shares;
    market.bullishPrice = computePriceFromSupply(market.bullishSupply);
  } else {
    market.fadeSupply += payload.shares;
    market.fadePrice = computePriceFromSupply(market.fadeSupply);
  }

  const fee = cost * CREATOR_FEE_RATE;
  market.poolBalance += cost - fee;
  market.creatorRevenue.totalEarned += fee;
  market.creatorRevenue.withdrawable += fee;

  market.buyers.push({
    wallet: payload.wallet,
    side: payload.side,
    shares: payload.shares,
    price,
  });

  await market.save();
  return market;
}

export async function endMarket(marketId: string, finalResult: Side | "none" = "none"): Promise<MarketDoc> {
  const market = await Market.findById(marketId);
  if (!market) throw new Error("Market not found");
  market.status = "ended";
  market.finalResult = finalResult;
  await market.save();
  return market;
}

export async function listActiveMarkets() {
  return Market.find({ status: "active" }).sort({ createdAt: -1 }).lean();
}

export async function getMarketDetail(marketId: string) {
  return Market.findById(marketId).lean();
}

export function isExpired(market: MarketDoc): boolean {
  return new Date() >= new Date(market.endTime);
}

