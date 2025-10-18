import mongoose, { Document, Schema } from "mongoose";

export interface ConversationDoc extends Document {
  participants: string[]; // Array of wallet addresses
  type: 'direct' | 'group';
  name?: string; // For group chats
  description?: string; // For group chats
  createdBy: string; // Wallet address of creator
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: Date;
    type: 'text' | 'image' | 'market' | 'user' | 'gif' | 'emoji';
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<ConversationDoc>({
  participants: [{ type: String, required: true }],
  type: { type: String, enum: ['direct', 'group'], required: true },
  name: { type: String },
  description: { type: String },
  createdBy: { type: String, required: true },
  lastMessage: {
    content: { type: String },
    sender: { type: String },
    timestamp: { type: Date },
    type: { type: String, enum: ['text', 'image', 'market', 'user', 'gif', 'emoji'] }
  }
}, {
  timestamps: true,
});

// Index for efficient queries
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ type: 1 });
ConversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model<ConversationDoc>("Conversation", ConversationSchema);
