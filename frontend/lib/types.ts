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
  livestream?: { isLive: boolean; totalViews?: number };
  creatorRevenue?: { totalEarned?: number };
};


