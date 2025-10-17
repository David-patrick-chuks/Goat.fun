export type Ack<T = unknown> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export type BackendMarket = {
  _id: string;
  title: string;
  ticker: string;
  banner?: string;
  creator: string;
  createdAt?: string;
  poolBalance?: number;
  bullishSupply?: number;
  fadeSupply?: number;
  description?: string;
  status?: "active" | "ended" | "cancelled";
  livestream?: { 
    isLive: boolean; 
    totalViews?: number;
    streamKey?: string;
    playbackUrl?: string;
    roomName?: string;
  };
  creatorRevenue?: { totalEarned?: number };
};


