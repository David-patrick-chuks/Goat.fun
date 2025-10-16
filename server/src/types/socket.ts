export type Side = "bullish" | "fade";

export interface ClientEvents {
  user_connect: (data: { wallet: string; username?: string }) => void;
  update_profile: (data: { wallet: string; username?: string; bio?: string; avatarUrl?: string }, ack?: (result: AckResult) => void) => void;
  upload_avatar: (data: { wallet: string; data: string; filename: string }, ack?: (result: AckResult) => void) => void;
  create_market: (data: CreateMarketPayload, ack?: (result: AckResult) => void) => void;
  join_market: (data: JoinMarketPayload, ack?: (result: AckResult) => void) => void;
  start_stream: (data: { marketId: string }, ack?: (result: AckResult) => void) => void;
  stop_stream: (data: { marketId: string }, ack?: (result: AckResult) => void) => void;
  end_market: (data: { marketId: string; finalResult?: Side | "none" }, ack?: (result: AckResult) => void) => void;
  get_markets: (data: { status?: "active" | "ended" | "cancelled" }, ack?: (result: AckResult) => void) => void;
  get_market_detail: (data: { marketId: string }, ack?: (result: AckResult) => void) => void;
}

export interface ServerEvents {
  market_update: (data: MarketUpdateEvent) => void;
  market_created: (data: { marketId: string }) => void;
  stream_update: (data: { marketId: string; isLive: boolean }) => void;
}

export interface AckResult {
  ok: boolean;
  error?: string;
  data?: unknown;
}

export interface CreateMarketPayload {
  creator: string;
  title: string;
  ticker: string;
  description?: string;
  media?: string;
  banner?: string;
  socialLinks?: string[];
  durationHours: number;
}

export interface JoinMarketPayload {
  marketId: string;
  wallet: string;
  side: Side;
  shares: number;
}

export interface MarketUpdateEvent {
  marketId: string;
  bullishSupply: number;
  fadeSupply: number;
  bullishPrice: number;
  fadePrice: number;
  poolBalance: number;
}

