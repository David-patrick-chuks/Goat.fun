import mongoose, { Document, Schema } from "mongoose";

export interface CommentDoc extends Document {
  marketId: string;
  wallet: string;
  message?: string;
  imageUrl?: string;
  replyTo?: string; // Reference to parent comment ID
  likes: string[]; // Array of wallet addresses who liked this comment
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<CommentDoc>({
  marketId: { type: String, required: true, index: true },
  wallet: { type: String, required: true },
  message: { type: String, maxlength: 1000 },
  imageUrl: { type: String },
  replyTo: { type: String, ref: 'Comment' }, // Reference to parent comment
  likes: [{ type: String }], // Array of wallet addresses
}, {
  timestamps: true,
});

// Ensure at least one of message or imageUrl is provided
CommentSchema.pre('validate', function(next) {
  if (!this.message && !this.imageUrl) {
    next(new Error('Comment must have either a message or an image'));
  } else {
    next();
  }
});

export const Comment = mongoose.model<CommentDoc>("Comment", CommentSchema);
