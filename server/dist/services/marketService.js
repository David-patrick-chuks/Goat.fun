"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePriceFromSupply = computePriceFromSupply;
exports.createMarket = createMarket;
exports.joinMarket = joinMarket;
exports.endMarket = endMarket;
exports.listActiveMarkets = listActiveMarkets;
exports.getMarketDetail = getMarketDetail;
exports.isExpired = isExpired;
const index_1 = require("../constants/index");
const Market_1 = require("../models/Market");
const User_1 = require("../models/User");
// Simple bonding curve: price = base + k * sqrt(supply)
function computePriceFromSupply(supply) {
    return parseFloat((index_1.BASE_PRICE + index_1.BONDING_COEFFICIENT_K * Math.sqrt(Math.max(0, supply))).toFixed(6));
}
async function createMarket(input) {
    const now = new Date();
    const end = new Date(now.getTime() + input.durationHours * 60 * 60 * 1000);
    const market = await Market_1.Market.create({
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
    await User_1.User.updateOne({ wallet: input.creator }, { $addToSet: { createdMarkets: String(market._id) } }, { upsert: true });
    return market;
}
async function joinMarket(payload) {
    const market = await Market_1.Market.findById(payload.marketId);
    if (!market)
        throw new Error("Market not found");
    if (market.status !== "active")
        throw new Error("Market not active");
    // Calculate current price based on side supply
    const currentSupply = payload.side === "bullish" ? market.bullishSupply : market.fadeSupply;
    const price = computePriceFromSupply(currentSupply);
    const cost = price * payload.shares;
    // Update supplies and pool
    if (payload.side === "bullish") {
        market.bullishSupply += payload.shares;
        market.bullishPrice = computePriceFromSupply(market.bullishSupply);
    }
    else {
        market.fadeSupply += payload.shares;
        market.fadePrice = computePriceFromSupply(market.fadeSupply);
    }
    const fee = cost * index_1.CREATOR_FEE_RATE;
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
async function endMarket(marketId, finalResult = "none") {
    const market = await Market_1.Market.findById(marketId);
    if (!market)
        throw new Error("Market not found");
    market.status = "ended";
    market.finalResult = finalResult;
    await market.save();
    return market;
}
async function listActiveMarkets() {
    return Market_1.Market.find({ status: "active" }).sort({ createdAt: -1 }).lean();
}
async function getMarketDetail(marketId) {
    return Market_1.Market.findById(marketId).lean();
}
function isExpired(market) {
    return new Date() >= new Date(market.endTime);
}
//# sourceMappingURL=marketService.js.map