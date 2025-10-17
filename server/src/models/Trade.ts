import mongoose, { Document, Schema } from "mongoose";

export interface TradeDoc extends Document {
  marketId: string;
  wallet: string;
  side: "bullish" | "fade";
  shares: number;
  price: number;
  amount: number;
  timestamp: Date;
}

const TradeSchema = new Schema<TradeDoc>({
  marketId: { type: String, required: true, index: true },
  wallet: { type: String, required: true },
  side: { type: String, enum: ["bullish", "fade"], required: true },
  shares: { type: Number, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

export const Trade = mongoose.model<TradeDoc>("Trade", TradeSchema);
