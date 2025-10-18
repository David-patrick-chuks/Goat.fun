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

// WebRTC Types
export interface WebRTCOffer {
  marketId: string;
  fromWallet: string;
  toWallet: string;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswer {
  marketId: string;
  fromWallet: string;
  toWallet: string;
  answer: RTCSessionDescriptionInit;
}

export interface WebRTCIceCandidate {
  marketId: string;
  fromWallet: string;
  toWallet: string;
  candidate: RTCIceCandidateInit;
}

export interface WebRTCViewerEvent {
  marketId: string;
  viewerWallet: string;
  viewerCount: number;
}


