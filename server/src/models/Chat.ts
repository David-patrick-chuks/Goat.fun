import mongoose, { Model, Schema } from "mongoose";

export interface ChatMessageDoc {
  marketId: string;
  wallet: string;
  message: string;
  at: Date;
}

const ChatSchema = new Schema<ChatMessageDoc>({
  marketId: { type: String, index: true, required: true },
  wallet: { type: String, required: true },
  message: { type: String, required: true },
  at: { type: Date, default: () => new Date(), index: true },
});

export const ChatMessage: Model<ChatMessageDoc> = mongoose.models.ChatMessage || mongoose.model<ChatMessageDoc>("ChatMessage", ChatSchema);


