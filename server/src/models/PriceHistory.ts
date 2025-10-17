import mongoose, { Schema, Document } from "mongoose";

export interface PriceHistoryDoc extends Document {
  marketId: string;
  timestamp: Date;
  bullishPrice: number;
  fadePrice: number;
  bullishSupply: number;
  fadeSupply: number;
  poolBalance: number;
}

const PriceHistorySchema = new Schema<PriceHistoryDoc>({
  marketId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  bullishPrice: { type: Number, required: true },
  fadePrice: { type: Number, required: true },
  bullishSupply: { type: Number, required: true },
  fadeSupply: { type: Number, required: true },
  poolBalance: { type: Number, required: true }
});

export const PriceHistory = mongoose.model<PriceHistoryDoc>("PriceHistory", PriceHistorySchema);
