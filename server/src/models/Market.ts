import mongoose, { Model, Schema } from "mongoose";
import type { BuyerInfo, CreatorRevenueInfo, LivestreamInfo, MarketDoc } from "../types/models";

const BuyerSchema = new Schema<BuyerInfo>({
  wallet: { type: String, required: true },
  side: { type: String, enum: ["bullish", "fade"], required: true },
  shares: { type: Number, required: true },
  price: { type: Number, required: true },
}, { _id: false });

const LivestreamSchema = new Schema<LivestreamInfo>({
  isLive: { type: Boolean, default: false },
  streamKey: String,
  playbackUrl: String,
  thumbnail: String,
  totalViews: Number,
  endedAt: Date,
}, { _id: false });

const CreatorRevenueSchema = new Schema<CreatorRevenueInfo>({
  totalEarned: { type: Number, default: 0 },
  revenueShare: { type: Number, default: 0.05 },
  withdrawable: { type: Number, default: 0 },
  lastWithdrawn: Date,
}, { _id: false });

const MarketSchema = new Schema<MarketDoc>({
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

export const Market: Model<MarketDoc> = mongoose.models.Market || mongoose.model<MarketDoc>("Market", MarketSchema);

