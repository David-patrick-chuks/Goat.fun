import mongoose, { Model, Schema } from "mongoose";
import type { BuyerInfo, CreatorRevenueInfo, LivestreamInfo, MarketDoc } from "../types/models";

const BuyerSchema = new Schema<BuyerInfo>({
  wallet: { type: String, required: true },
  side: { type: String, enum: ["bullish", "fade"], required: true },
  shares: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v) && v > 0;
      },
      message: 'shares must be a valid positive number'
    }
  },
  price: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v) && v > 0;
      },
      message: 'price must be a valid positive number'
    }
  },
}, { _id: false });

const LivestreamSchema = new Schema<LivestreamInfo>({
  isLive: { type: Boolean, default: false },
  streamKey: String,
  playbackUrl: String,
  roomName: String,
  thumbnail: String,
  totalViews: Number,
  endedAt: Date,
}, { _id: false });

const CreatorRevenueSchema = new Schema<CreatorRevenueInfo>({
  totalEarned: { 
    type: Number, 
    default: 0,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v);
      },
      message: 'totalEarned must be a valid number'
    }
  },
  revenueShare: { 
    type: Number, 
    default: 0.05,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v);
      },
      message: 'revenueShare must be a valid number'
    }
  },
  withdrawable: { 
    type: Number, 
    default: 0,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v);
      },
      message: 'withdrawable must be a valid number'
    }
  },
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
  bullishSupply: { 
    type: Number, 
    default: 0,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v);
      },
      message: 'bullishSupply must be a valid number'
    }
  },
  fadeSupply: { 
    type: Number, 
    default: 0,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v);
      },
      message: 'fadeSupply must be a valid number'
    }
  },
  bullishPrice: { 
    type: Number, 
    default: 1,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v);
      },
      message: 'bullishPrice must be a valid number'
    }
  },
  fadePrice: { 
    type: Number, 
    default: 1,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v);
      },
      message: 'fadePrice must be a valid number'
    }
  },
  poolBalance: { 
    type: Number, 
    default: 0,
    validate: {
      validator: function(v: number) {
        return !isNaN(v) && isFinite(v);
      },
      message: 'poolBalance must be a valid number'
    }
  },
  buyers: { type: [BuyerSchema], default: [] },
  livestream: { type: LivestreamSchema, default: () => ({ isLive: false }) },
  creatorRevenue: { type: CreatorRevenueSchema, default: () => ({ totalEarned: 0, revenueShare: 0.05, withdrawable: 0 }) },
  status: { type: String, enum: ["active", "ended", "cancelled"], default: "active", index: true },
  finalResult: { type: String, enum: ["bullish", "fade", "none"], default: "none" },
  createdAt: { type: Date, default: () => new Date() },
});

// Pre-save middleware to ensure all numeric fields are valid
MarketSchema.pre('save', function(next) {
  // Ensure all numeric fields are valid numbers
  const numericFields = ['bullishSupply', 'fadeSupply', 'bullishPrice', 'fadePrice', 'poolBalance'];
  
  numericFields.forEach(field => {
    if (isNaN(this[field]) || !isFinite(this[field])) {
      this[field] = 0;
    }
  });
  
  // Ensure creatorRevenue fields are valid
  if (this.creatorRevenue) {
    if (isNaN(this.creatorRevenue.totalEarned) || !isFinite(this.creatorRevenue.totalEarned)) {
      this.creatorRevenue.totalEarned = 0;
    }
    if (isNaN(this.creatorRevenue.withdrawable) || !isFinite(this.creatorRevenue.withdrawable)) {
      this.creatorRevenue.withdrawable = 0;
    }
    if (isNaN(this.creatorRevenue.revenueShare) || !isFinite(this.creatorRevenue.revenueShare)) {
      this.creatorRevenue.revenueShare = 0.05;
    }
  }
  
  // Ensure buyers have valid numeric fields
  if (this.buyers && Array.isArray(this.buyers)) {
    this.buyers = this.buyers.filter(buyer => {
      return buyer.wallet && 
             buyer.side && 
             !isNaN(buyer.shares) && 
             isFinite(buyer.shares) && 
             buyer.shares > 0 &&
             !isNaN(buyer.price) && 
             isFinite(buyer.price) && 
             buyer.price > 0;
    });
  }
  
  next();
});

export const Market: Model<MarketDoc> = mongoose.models.Market || mongoose.model<MarketDoc>("Market", MarketSchema);

