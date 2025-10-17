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
exports.Market = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BuyerSchema = new mongoose_1.Schema({
    wallet: { type: String, required: true },
    side: { type: String, enum: ["bullish", "fade"], required: true },
    shares: { type: Number, required: true },
    price: { type: Number, required: true },
}, { _id: false });
const LivestreamSchema = new mongoose_1.Schema({
    isLive: { type: Boolean, default: false },
    streamKey: String,
    playbackUrl: String,
    roomName: String,
    thumbnail: String,
    totalViews: Number,
    endedAt: Date,
}, { _id: false });
const CreatorRevenueSchema = new mongoose_1.Schema({
    totalEarned: { type: Number, default: 0 },
    revenueShare: { type: Number, default: 0.05 },
    withdrawable: { type: Number, default: 0 },
    lastWithdrawn: Date,
}, { _id: false });
const MarketSchema = new mongoose_1.Schema({
    creator: { type: String, required: true, index: true },
    title: { type: String, required: true },
    ticker: { type: String, required: true, index: true },
    description: String,
    media: String,
    banner: String,
    socialLinks: { type: [String], default: [] },
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true, index: true },
    bullishSupply: { type: Number, default: 0 },
    fadeSupply: { type: Number, default: 0 },
    bullishPrice: { type: Number, default: 1 },
    fadePrice: { type: Number, default: 1 },
    poolBalance: { type: Number, default: 0 },
    buyers: { type: [BuyerSchema], default: [] },
    livestream: { type: LivestreamSchema, default: () => ({ isLive: false }) },
    creatorRevenue: { type: CreatorRevenueSchema, default: () => ({ totalEarned: 0, revenueShare: 0.05, withdrawable: 0 }) },
    status: { type: String, enum: ["active", "ended", "cancelled"], default: "active", index: true },
    finalResult: { type: String, enum: ["bullish", "fade", "none"], default: "none" },
    createdAt: { type: Date, default: () => new Date() },
});
exports.Market = mongoose_1.default.models.Market || mongoose_1.default.model("Market", MarketSchema);
//# sourceMappingURL=Market.js.map