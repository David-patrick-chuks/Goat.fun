import mongoose, { Document, Schema } from "mongoose";

export interface UserFollowDoc extends Document {
  follower: string; // Wallet address of the follower
  following: string; // Wallet address of the user being followed
  createdAt: Date;
}

const UserFollowSchema = new Schema<UserFollowDoc>({
  follower: { type: String, required: true },
  following: { type: String, required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Ensure unique follow relationships
UserFollowSchema.index({ follower: 1, following: 1 }, { unique: true });
UserFollowSchema.index({ follower: 1 });
UserFollowSchema.index({ following: 1 });

export const UserFollow = mongoose.model<UserFollowDoc>("UserFollow", UserFollowSchema);
