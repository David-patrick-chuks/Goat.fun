import mongoose, { Document, Schema } from "mongoose";

export interface MessageDoc extends Document {
  conversationId: string;
  sender: string; // Wallet address
  type: 'text' | 'image' | 'market' | 'user' | 'gif' | 'emoji';
  content?: string; // Text content
  imageUrl?: string; // For image messages
  marketId?: string; // For market messages
  userId?: string; // For user messages
  gifUrl?: string; // For gif messages
  emoji?: string; // For emoji messages
  replyTo?: string; // Message ID being replied to
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDoc>({
  conversationId: { type: String, required: true, index: true },
  sender: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'image', 'market', 'user', 'gif', 'emoji'], 
    required: true 
  },
  content: { type: String, maxlength: 2000 },
  imageUrl: { type: String },
  marketId: { type: String },
  userId: { type: String },
  gifUrl: { type: String },
  emoji: { type: String },
  replyTo: { type: String },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date }
}, {
  timestamps: true,
});

// Index for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

export const Message = mongoose.model<MessageDoc>("Message", MessageSchema);
