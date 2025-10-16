import mongoose, { Schema, Model } from "mongoose";
import type { FollowInfo, UserDoc } from "../types/models";

const FollowSchema = new Schema<FollowInfo>({
  wallet: { type: String, required: true, index: true },
  username: { type: String },
}, { _id: false });

const UserSchema = new Schema<UserDoc>({
  wallet: { type: String, required: true, unique: true, index: true },
  username: { type: String },
  bio: { type: String },
  avatarUrl: { type: String, default: () => process.env.DEFAULT_AVATAR_URL || undefined },
  followers: { type: [FollowSchema], default: [] },
  following: { type: [FollowSchema], default: [] },
  createdMarkets: { type: [String], default: [] },
  createdAt: { type: Date, default: () => new Date() },
});

export const User: Model<UserDoc> = mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);

