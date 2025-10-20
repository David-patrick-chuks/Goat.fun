export type Side = "bullish" | "fade";

// WebRTC types for Node.js backend
interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string | null;
}

export interface ClientEvents {
  user_connect: (data: { wallet: string; username?: string }) => void;
  update_profile: (data: { wallet: string; username?: string; bio?: string; avatarUrl?: string }, ack?: (result: AckResult) => void) => void;
  upload_avatar: (data: { wallet: string; data: string; filename: string }, ack?: (result: AckResult) => void) => void;
  upload_market_media: (data: { data: string; filename: string; marketId?: string; mediaType?: "banner" | "media" }, ack?: (result: AckResult) => void) => void;
  create_market: (data: CreateMarketPayload, ack?: (result: AckResult) => void) => void;
  join_market: (data: JoinMarketPayload, ack?: (result: AckResult) => void) => void;
  start_stream: (data: { marketId: string; wallet: string }, ack?: (result: AckResult) => void) => void;
  stop_stream: (data: { marketId: string; wallet: string }, ack?: (result: AckResult) => void) => void;
  end_market: (data: { marketId: string; finalResult?: Side | "none" }, ack?: (result: AckResult) => void) => void;
  get_markets: (data: { status?: "active" | "ended" | "cancelled"; page?: number; limit?: number; sort?: "newest" | "trending" | "market_cap"; search?: string }, ack?: (result: AckResult) => void) => void;
  get_user: (data: { identifier: string }, ack?: (result: AckResult) => void) => void;
  get_market_detail: (data: { marketId: string }, ack?: (result: AckResult) => void) => void;
  // Portfolio
  get_user_tokens: (data: { wallet: string; page?: number; limit?: number }, ack?: (result: AckResult) => void) => void;
  chat_message: (data: { marketId: string; wallet: string; message: string }, ack?: (result: AckResult) => void) => void;
  get_chat: (data: { marketId: string; limit?: number }, ack?: (result: AckResult) => void) => void;
  buy_shares: (data: { marketId: string; wallet: string; side: Side; amount: number }, ack?: (result: AckResult) => void) => void;
  request_to_join: (data: { marketId: string; wallet: string }, ack?: (result: AckResult) => void) => void;
  accept_join_request: (data: { marketId: string; requesterWallet: string; streamerWallet: string }, ack?: (result: AckResult) => void) => void;
  get_holders: (data: { marketId: string; limit?: number }, ack?: (result: AckResult) => void) => void;
  get_price_history: (data: { marketId: string; limit?: number }, ack?: (result: AckResult) => void) => void;
  // Comment Events
  add_comment: (data: { marketId: string; wallet: string; message?: string; imageData?: string; filename?: string }, ack?: (result: AckResult) => void) => void;
  get_comments: (data: { marketId: string; limit?: number; page?: number }, ack?: (result: AckResult) => void) => void;
  get_user_comments: (data: { wallet: string; page?: number; limit?: number }, ack?: (result: AckResult) => void) => void;
  like_comment: (data: { commentId: string; wallet: string }, ack?: (result: AckResult) => void) => void;
  // Chat Events
  create_conversation: (data: { participants: string[]; type: 'direct' | 'group'; name?: string; description?: string }, ack?: (result: AckResult) => void) => void;
  get_conversations: (data: { wallet: string; limit?: number; page?: number }, ack?: (result: AckResult) => void) => void;
  send_message: (data: { conversationId: string; sender: string; type: 'text' | 'image' | 'market' | 'user' | 'gif' | 'emoji'; content?: string; imageData?: string; filename?: string; marketId?: string; userId?: string; gifUrl?: string; emoji?: string; replyTo?: string }, ack?: (result: AckResult) => void) => void;
  get_messages: (data: { conversationId: string; limit?: number; page?: number }, ack?: (result: AckResult) => void) => void;
  search_users: (data: { query: string; limit?: number }, ack?: (result: AckResult) => void) => void;
  follow_user: (data: { follower: string; following: string }, ack?: (result: AckResult) => void) => void;
  unfollow_user: (data: { follower: string; following: string }, ack?: (result: AckResult) => void) => void;
  get_following: (data: { wallet: string }, ack?: (result: AckResult) => void) => void;
  get_followers: (data: { wallet: string }, ack?: (result: AckResult) => void) => void;
  update_last_seen: (data: { wallet: string }, ack?: (result: AckResult) => void) => void;
  // WebRTC Signaling Events
  webrtc_offer: (data: { marketId: string; fromWallet: string; toWallet: string; offer: RTCSessionDescriptionInit }) => void;
  webrtc_answer: (data: { marketId: string; fromWallet: string; toWallet: string; answer: RTCSessionDescriptionInit }) => void;
  webrtc_ice_candidate: (data: { marketId: string; fromWallet: string; toWallet: string; candidate: RTCIceCandidateInit }) => void;
  webrtc_viewer_join: (data: { marketId: string; viewerWallet: string }) => void;
  webrtc_viewer_leave: (data: { marketId: string; viewerWallet: string }) => void;
}

export interface ServerEvents {
  market_update: (data: MarketUpdateEvent) => void;
  market_created: (data: { marketId: string }) => void;
  stream_update: (data: { marketId: string; isLive: boolean }) => void;
  chat_message: (data: { marketId: string; wallet: string; username?: string; message: string; at: string }) => void;
  join_request: (data: { marketId: string; wallet: string }) => void;
  join_request_accepted: (data: { marketId: string; streamerWallet: string }) => void;
  // Comment Events
  comment_added: (data: { marketId: string; wallet: string; username?: string; message?: string; imageUrl?: string; replyTo?: string; createdAt: string }) => void;
  comment_liked: (data: { commentId: string; wallet: string; isLiked: boolean; likesCount: number }) => void;
  // Chat Events
  message_sent: (data: { conversationId: string; message: { _id: string; sender: string; type: string; content?: string; imageUrl?: string; marketId?: string; userId?: string; gifUrl?: string; emoji?: string; replyTo?: string; createdAt: string } }) => void;
  conversation_created: (data: { conversation: { _id: string; participants: string[]; type: string; name?: string; description?: string; createdAt: string } }) => void;
  user_online: (data: { wallet: string; isOnline: boolean }) => void;
  user_last_seen: (data: { wallet: string; lastSeen: string }) => void;
  // WebRTC Signaling Events
  webrtc_offer: (data: { marketId: string; fromWallet: string; toWallet: string; offer: RTCSessionDescriptionInit }) => void;
  webrtc_answer: (data: { marketId: string; fromWallet: string; toWallet: string; answer: RTCSessionDescriptionInit }) => void;
  webrtc_ice_candidate: (data: { marketId: string; fromWallet: string; toWallet: string; candidate: RTCIceCandidateInit }) => void;
  webrtc_viewer_joined: (data: { marketId: string; viewerWallet: string; viewerCount: number }) => void;
  webrtc_viewer_left: (data: { marketId: string; viewerWallet: string; viewerCount: number }) => void;
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
  side?: Side;
  shares?: number;
}

export interface MarketUpdateEvent {
  marketId: string;
  bullishSupply: number;
  fadeSupply: number;
  bullishPrice: number;
  fadePrice: number;
  poolBalance: number;
}

