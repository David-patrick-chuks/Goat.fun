import type { Document } from "mongoose";
export type Side = "bullish" | "fade";
export interface FollowInfo {
    wallet: string;
    username?: string;
}
export interface UserDoc extends Document {
    wallet: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
    followers: FollowInfo[];
    following: FollowInfo[];
    createdMarkets: string[];
    createdAt: Date;
}
export interface BuyerInfo {
    wallet: string;
    side: Side;
    shares: number;
    price: number;
}
export interface LivestreamInfo {
    isLive: boolean;
    streamKey?: string;
    playbackUrl?: string;
    thumbnail?: string;
    totalViews?: number;
    endedAt?: Date;
}
export interface CreatorRevenueInfo {
    totalEarned: number;
    revenueShare: number;
    withdrawable: number;
    lastWithdrawn?: Date;
}
export interface MarketDoc extends Document {
    creator: string;
    title: string;
    ticker: string;
    description?: string;
    media?: string;
    banner?: string;
    socialLinks?: string[];
    duration: number;
    startTime: Date;
    endTime: Date;
    bullishSupply: number;
    fadeSupply: number;
    bullishPrice: number;
    fadePrice: number;
    poolBalance: number;
    buyers: BuyerInfo[];
    livestream?: LivestreamInfo;
    creatorRevenue: CreatorRevenueInfo;
    status: "active" | "ended" | "cancelled";
    finalResult?: Side | "none";
    createdAt: Date;
}
//# sourceMappingURL=models.d.ts.map