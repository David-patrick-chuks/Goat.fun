"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import React from "react";
import { useAccount } from "wagmi";
import EditProfileModal from "./EditProfileModal";

interface Market {
  _id: string;
  title: string;
  ticker: string;
  description?: string;
  status: "active" | "ended" | "cancelled";
  bullishSupply: number;
  fadeSupply: number;
  bullishPrice: number;
  fadePrice: number;
  poolBalance: number;
  createdAt: string;
  creator: string;
}

interface Token {
  _id: string;
  marketId: string;
  marketTitle: string;
  ticker: string;
  amount: number;
  side: "bullish" | "fade";
  price: number;
  value: number;
  createdAt: string;
}

interface User {
  wallet: string;
  username: string;
  avatarUrl?: string;
  followers: number;
  following: number;
}

interface Notification {
  _id: string;
  type: "follow" | "market_update" | "comment";
  fromUser: User;
  message: string;
  createdAt: string;
  read: boolean;
}

interface Comment {
  _id: string;
  marketId: string;
  marketTitle: string;
  message?: string;
  imageUrl?: string;
  createdAt: string;
}

export default function ProfileContent() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [username, setUsername] = React.useState<string>("");
  const [bio, setBio] = React.useState<string>("");
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");
  const [followers, setFollowers] = React.useState<number>(0);
  const [following, setFollowing] = React.useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"balance" | "markets" | "comments" | "notification" | "followers" | "following">("balance");
  
  // Balance tab state
  const [walletTokens, setWalletTokens] = React.useState<Token[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = React.useState(false);
  const [balancePage, setBalancePage] = React.useState(1);
  
  // Markets tab state
  const [createdMarkets, setCreatedMarkets] = React.useState<Market[]>([]);
  const [creatorRevenue, setCreatorRevenue] = React.useState(0);
  const [isLoadingMarkets, setIsLoadingMarkets] = React.useState(false);
  const [marketsPage, setMarketsPage] = React.useState(1);
  
  // Comments tab state
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = React.useState(false);
  const [commentsPage, setCommentsPage] = React.useState(1);
  
  // Notifications tab state
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);
  const [notificationsPage, setNotificationsPage] = React.useState(1);
  
  // Followers/Following tab state
  const [followersList, setFollowersList] = React.useState<User[]>([]);
  const [followingList, setFollowingList] = React.useState<User[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = React.useState(false);
  const [followersPage, setFollowersPage] = React.useState(1);
  const [followingPage, setFollowingPage] = React.useState(1);

  // Authentication check - show login prompt if not connected
  if (!isConnected || !address) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Logo */}
          <div className="mb-8">
            <img src="/goatfun.png" alt="GoatFun" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">GoatFun</h1>
            <p className="text-white/60">Connect your wallet to view your profile</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 rounded-lg p-8 border border-white/10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-white/70 text-sm">
                You need to connect your wallet to access your profile, view your tokens, and manage your markets.
              </p>
            </div>

            {/* Connect Button */}
            <button
              onClick={openConnectModal}
              className="w-full bg-[#ffea00] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#ffea00]/80 transition-colors mb-4"
            >
              Connect Wallet
            </button>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-white/50 text-xs">
                By connecting your wallet, you agree to our{" "}
                <a href="/terms-of-service" className="text-[#ffea00] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="text-[#ffea00] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-2 h-2 bg-[#ffea00] rounded-full"></div>
              <span className="text-sm">View your token portfolio</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-2 h-2 bg-[#ffea00] rounded-full"></div>
              <span className="text-sm">Track your created markets</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-2 h-2 bg-[#ffea00] rounded-full"></div>
              <span className="text-sm">Manage your profile settings</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-2 h-2 bg-[#ffea00] rounded-full"></div>
              <span className="text-sm">Follow other traders</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Copy wallet address functionality
  const copyWalletAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // You could add a toast notification here
    }
  };

  // Load user profile data
  React.useEffect(() => {
    if (!isConnected || !address) return;
    const socket = getSocket();
    // Server expects { identifier } which can be wallet or username
    socket.emit('get_user', { identifier: address }, (res: Ack<{
      username?: string;
      bio?: string;
      avatarUrl?: string;
      followers?: unknown[];
      following?: unknown[];
    }>) => {
      if (res?.ok && res.data) {
        const u = res.data;
        setUsername(u.username || address.slice(0, 6));
        setBio(u.bio || "");
        setAvatarUrl(u.avatarUrl || "/goatfun.png");
        setFollowers((u.followers || []).length);
        setFollowing((u.following || []).length);
      }
    });
  }, [isConnected, address]);

  // Load balance data from server
  React.useEffect(() => {
    if (!isConnected || !address || activeTab !== "balance") return;
    setIsLoadingBalance(true);
    const socket = getSocket();
    socket.emit('get_user_tokens', {
      wallet: address,
      page: balancePage,
      limit: 20
    }, (res: Ack<{ tokens: Token[] }>) => {
      setIsLoadingBalance(false);
      if (res?.ok && res.data) {
        setWalletTokens(res.data.tokens);
      } else {
        setWalletTokens([]);
      }
    });
  }, [isConnected, address, activeTab, balancePage]);

  // Load markets data using supported endpoint
  React.useEffect(() => {
    if (!isConnected || !address || activeTab !== "markets") return;
    setIsLoadingMarkets(true);
    const socket = getSocket();
    
    socket.emit('get_markets', { status: 'active', page: marketsPage, limit: 20, sort: 'newest', search: address }, (res: Ack<{ items: Market[]; total: number }>) => {
      setIsLoadingMarkets(false);
      if (res?.ok && res.data) {
        const items = res.data.items || [];
        setCreatedMarkets(items.filter(m => m.creator === address));
        setCreatorRevenue(0);
      }
    });
  }, [isConnected, address, activeTab, marketsPage]);

  // Load user's comments across markets
  React.useEffect(() => {
    if (!isConnected || !address || activeTab !== "comments") return;
    setIsLoadingComments(true);
    const socket = getSocket();
    socket.emit('get_user_comments', {
      wallet: address,
      page: commentsPage,
      limit: 20
    }, (res: Ack<{ comments: Comment[] }>) => {
      setIsLoadingComments(false);
      if (res?.ok && res.data) {
        setComments(res.data.comments);
      } else {
        setComments([]);
      }
    });
  }, [isConnected, address, activeTab, commentsPage]);

  // Load notifications data (not available) -> safe empty state
  React.useEffect(() => {
    if (!isConnected || !address || activeTab !== "notification") return;
    setIsLoadingNotifications(false);
    setNotifications([]);
  }, [isConnected, address, activeTab, notificationsPage]);

  // Load followers data
  React.useEffect(() => {
    if (!isConnected || !address || activeTab !== "followers") return;
    setIsLoadingFollowers(true);
    const socket = getSocket();
    
    socket.emit('get_followers', { 
      wallet: address
    }, (res: Ack<any[]>) => {
      setIsLoadingFollowers(false);
      if (res?.ok && Array.isArray(res.data)) {
        setFollowersList(res.data.map((r: any) => r.follower));
      }
    });
  }, [isConnected, address, activeTab, followersPage]);

  // Load following data
  React.useEffect(() => {
    if (!isConnected || !address || activeTab !== "following") return;
    setIsLoadingFollowers(true);
    const socket = getSocket();
    
    socket.emit('get_following', { 
      wallet: address
    }, (res: Ack<any[]>) => {
      setIsLoadingFollowers(false);
      if (res?.ok && Array.isArray(res.data)) {
        setFollowingList(res.data.map((r: any) => r.following));
      }
    });
  }, [isConnected, address, activeTab, followingPage]);

  const handleFollow = (targetWallet: string) => {
    if (!address) return;
    const socket = getSocket();
    
    socket.emit('follow_user', { 
      follower: address,
      following: targetWallet 
    }, (res: Ack) => {
      if (res?.ok) {
        // Refresh followers/following data
        if (activeTab === "followers") {
          setFollowersPage(1);
        } else if (activeTab === "following") {
          setFollowingPage(1);
        }
      }
    });
  };

  const handleUnfollow = (targetWallet: string) => {
    if (!address) return;
    const socket = getSocket();
    
    socket.emit('unfollow_user', { 
      follower: address,
      following: targetWallet 
    }, (res: Ack) => {
      if (res?.ok) {
        // Refresh followers/following data
        if (activeTab === "followers") {
          setFollowersPage(1);
        } else if (activeTab === "following") {
          setFollowingPage(1);
        }
      }
    });
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderBalanceTab = () => (
    <div className="overflow-x-auto">
      {isLoadingBalance ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffea00]"></div>
        </div>
      ) : walletTokens.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60 mb-4">No tokens in wallet</p>
          <p className="text-white/40 text-sm">Buy shares in markets to see tokens here</p>
      </div>
      ) : (
        <>
        <table className="min-w-full text-left text-sm">
          <thead className="text-white/60">
            <tr>
              <th className="py-3 pr-4">Coins</th>
              <th className="py-3 pr-4">MCap</th>
              <th className="py-3 pr-4">Value</th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            <tr className="border-t border-white/10">
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400" />
                  <div>
                    <div className="text-white">Solana balance</div>
                    <div className="text-white/50 text-[11px]">0.0000 SOL</div>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4 text-white/60">—</td>
              <td className="py-4 pr-4 font-semibold">$0</td>
            </tr>
              {walletTokens.map((token) => (
                <tr key={token._id} className="border-t border-white/10">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffea00] to-[#ff6b35]" />
                      <div>
                        <div className="text-white">{token.marketTitle}</div>
                        <div className="text-white/50 text-[11px]">{token.ticker}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-white/60">—</td>
                  <td className="py-4 pr-4 font-semibold">{formatPrice(token.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button 
              onClick={() => setBalancePage(Math.max(1, balancePage - 1))}
              disabled={balancePage === 1}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-white/60 px-2">{balancePage}</span>
            <button 
              onClick={() => setBalancePage(balancePage + 1)}
              disabled={walletTokens.length < 20}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderMarketsTab = () => (
    <div>
      {/* Creator Revenue */}
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Creator Revenue</h3>
          <span className="text-[#ffea00] text-lg font-bold">{formatPrice(creatorRevenue)}</span>
        </div>
        <div className="h-32 bg-white/5 rounded flex items-center justify-center">
          <p className="text-white/60">Revenue chart coming soon</p>
        </div>
      </div>

      {/* Markets List */}
      <div className="overflow-x-auto">
        {isLoadingMarkets ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffea00]"></div>
          </div>
        ) : createdMarkets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 mb-4">No markets created yet</p>
            <a href="/create" className="bg-[#ffea00] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#ffea00]/80">
              Create Your First Market
            </a>
          </div>
        ) : (
          <>
            <table className="min-w-full text-left text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="py-3 pr-4">Market</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Bullish Price</th>
                  <th className="py-3 pr-4">Fade Price</th>
                  <th className="py-3 pr-4">Pool Balance</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                {createdMarkets.map((market) => (
                  <tr key={market._id} className="border-t border-white/10">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffea00] to-[#ff6b35]" />
                        <div>
                          <div className="text-white">{market.title}</div>
                          <div className="text-white/50 text-[11px]">{market.ticker}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        market.status === "active" ? "bg-green-500/20 text-green-400" :
                        market.status === "ended" ? "bg-gray-500/20 text-gray-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {market.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-semibold text-green-400">{formatPrice(market.bullishPrice)}</td>
                    <td className="py-4 pr-4 font-semibold text-red-400">{formatPrice(market.fadePrice)}</td>
                    <td className="py-4 pr-4 font-semibold">{formatPrice(market.poolBalance)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button 
                onClick={() => setMarketsPage(Math.max(1, marketsPage - 1))}
                disabled={marketsPage === 1}
                className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
              >
                ←
              </button>
              <span className="text-white/60 px-2">{marketsPage}</span>
              <button 
                onClick={() => setMarketsPage(marketsPage + 1)}
                disabled={createdMarkets.length < 20}
                className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderCommentsTab = () => (
    <div className="overflow-x-auto">
      {isLoadingComments ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffea00]"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No comments yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <a href={`/market/${comment.marketId}`} className="text-[#ffea00] hover:underline text-sm">{comment.marketTitle}</a>
                      <span className="text-white/50 text-sm">{formatDate(comment.createdAt)}</span>
                    </div>
                    {comment.message && (
                      <p className="text-white/80 mb-2">{comment.message}</p>
                    )}
                    {comment.imageUrl && (
                      <img src={comment.imageUrl} alt="comment media" className="rounded-lg max-h-64 object-cover" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button 
              onClick={() => setCommentsPage(Math.max(1, commentsPage - 1))}
              disabled={commentsPage === 1}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-white/60 px-2">{commentsPage}</span>
            <button 
              onClick={() => setCommentsPage(commentsPage + 1)}
              disabled={comments.length < 20}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="overflow-x-auto">
      {isLoadingNotifications ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffea00]"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No notifications yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification._id} className={`flex items-center gap-3 p-3 rounded-lg ${notification.read ? 'bg-white/5' : 'bg-[#ffea00]/10'}`}>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <img src={notification.fromUser.avatarUrl || "/goatfun.png"} alt="avatar" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex-1">
                  <p className="text-white/80">
                    <span className="text-white font-medium">{notification.fromUser.username}</span> {notification.message}
                  </p>
                  <p className="text-white/50 text-sm">{formatDate(notification.createdAt)}</p>
                </div>
                {notification.type === "follow" && (
                  <button 
                    onClick={() => handleFollow(notification.fromUser.wallet)}
                    className="px-3 py-1 bg-[#ffea00] text-black rounded text-sm font-medium hover:bg-[#ffea00]/80"
                  >
                    Follow
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button 
              onClick={() => setNotificationsPage(Math.max(1, notificationsPage - 1))}
              disabled={notificationsPage === 1}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-white/60 px-2">{notificationsPage}</span>
            <button 
              onClick={() => setNotificationsPage(notificationsPage + 1)}
              disabled={notifications.length < 20}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderFollowersTab = () => (
    <div className="overflow-x-auto">
      {isLoadingFollowers ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffea00]"></div>
        </div>
      ) : followersList.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No followers yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {followersList.map((user) => (
              <div key={user.wallet} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <img src={user.avatarUrl || "/goatfun.png"} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-white/50 text-sm">{user.followers} followers</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollow(user.wallet)}
                  className="px-4 py-2 bg-[#ffea00] text-black rounded font-medium hover:bg-[#ffea00]/80"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button 
              onClick={() => setFollowersPage(Math.max(1, followersPage - 1))}
              disabled={followersPage === 1}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-white/60 px-2">{followersPage}</span>
            <button 
              onClick={() => setFollowersPage(followersPage + 1)}
              disabled={followersList.length < 20}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderFollowingTab = () => (
    <div className="overflow-x-auto">
      {isLoadingFollowers ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffea00]"></div>
        </div>
      ) : followingList.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">Not following anyone yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {followingList.map((user) => (
              <div key={user.wallet} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <img src={user.avatarUrl || "/goatfun.png"} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-white/50 text-sm">{user.followers} followers</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUnfollow(user.wallet)}
                  className="px-4 py-2 bg-white/10 text-white rounded font-medium hover:bg-white/20"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button 
              onClick={() => setFollowingPage(Math.max(1, followingPage - 1))}
              disabled={followingPage === 1}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-white/60 px-2">{followingPage}</span>
            <button 
              onClick={() => setFollowingPage(followingPage + 1)}
              disabled={followingList.length < 20}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black">
      {/* Main Content Area */}
      <div className="flex-1 px-4 py-8">
        {/* Header */}
        <div className="mb-4">
          <button className="text-white/70 hover:text-white">←</button>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 md:w-20 md:h-20 bg-white/10 rounded-full overflow-hidden flex items-center justify-center">
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-2xl font-semibold text-white">{username || (address ? address.slice(0, 6) : "-")}</h1>
                {address && (
                  <div className="flex items-center gap-1">
                    <span className="bg-white/10 text-white/80 text-[11px] px-2 py-0.5 rounded">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                    <button 
                      onClick={copyWalletAddress}
                      className="text-white/60 hover:text-white text-xs"
                      title="Copy wallet address"
                    >
                      📋
                    </button>
                  </div>
                )}
                <a href="#" className="text-white/60 text-xs flex items-center gap-1 hover:text-white">
                  <span>View on explorer</span>
                </a>
              </div>
              <p className="text-white/70 text-sm mt-2">{bio}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-[#2f3a4d] hover:bg-[#38475f] text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            edit
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-10 mb-6">
          <div>
            <p className="text-white text-lg font-semibold">{followers}</p>
            <p className="text-white/60 text-sm">Followers</p>
          </div>
          <div>
            <p className="text-white text-lg font-semibold">{following}</p>
            <p className="text-white/60 text-sm">Following</p>
          </div>
          <div>
            <p className="text-white text-lg font-semibold">{createdMarkets.length}</p>
            <p className="text-white/60 text-sm">Created Markets</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-4">
          <div className="flex items-center gap-6 relative overflow-x-auto">
            {[
              { key: "balance", label: "Balance" },
              { key: "markets", label: "Markets" },
              { key: "comments", label: "Comments" },
              { key: "notification", label: "Notification" },
              { key: "followers", label: "Followers" },
              { key: "following", label: "Following" }
            ].map((tab, index) => (
              <button 
                key={tab.key}
                className={`pb-3 whitespace-nowrap ${activeTab === tab.key ? "text-white" : "text-white/60 hover:text-white"}`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={`h-0.5 w-16 bg-[#ffea00] transition-transform duration-300 ${
            activeTab === "balance" ? "translate-x-0" :
            activeTab === "markets" ? "translate-x-20" :
            activeTab === "comments" ? "translate-x-40" :
            activeTab === "notification" ? "translate-x-60" :
            activeTab === "followers" ? "translate-x-80" :
            "translate-x-96"
          }`}></div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl">
          {activeTab === "balance" && renderBalanceTab()}
          {activeTab === "markets" && renderMarketsTab()}
          {activeTab === "comments" && renderCommentsTab()}
          {activeTab === "notification" && renderNotificationsTab()}
          {activeTab === "followers" && renderFollowersTab()}
          {activeTab === "following" && renderFollowingTab()}
      </div>

      {/* Footer */}
      <div className="mt-10 text-white/50 text-sm flex items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
            <span>© goat.fun 2025</span>
            <a href="/privacy-policy" className="hover:text-white">Privacy policy</a>
          <span>|</span>
            <a href="/terms-of-service" className="hover:text-white">Terms of service</a>
          <span>|</span>
            <a href="/support" className="hover:text-white">Support</a>
          </div>
          <a href="/report" className="hover:text-white">Report</a>
        </div>
      </div>

      {/* Right Sidebar - Created Markets */}
      <div className="w-80 bg-black border-l border-white/10 p-6">
        <div className="space-y-6">
          {/* Created Markets Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Created Markets ({createdMarkets.length})</h3>
            {createdMarkets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-sm">No markets created yet</p>
                <a href="/create" className="inline-block mt-4 bg-[#ffea00] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#ffea00]/80 text-sm">
                  Create Your First Market
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {createdMarkets.map((market) => (
                  <div key={market._id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffea00] to-[#ff6b35]" />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{market.title}</div>
                        <div className="text-white/50 text-xs">{market.ticker}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-white/60">Pool: {formatPrice(market.poolBalance)}</span>
                      <span className={`px-2 py-1 rounded ${
                        market.status === "active" ? "bg-green-500/20 text-green-400" :
                        market.status === "ended" ? "bg-gray-500/20 text-gray-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {market.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400">Bull: {formatPrice(market.bullishPrice)}</span>
                      <span className="text-red-400">Fade: {formatPrice(market.fadePrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Tokens Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Wallet Tokens</h3>
            {walletTokens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-sm">No tokens in wallet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {walletTokens.map((token) => (
                  <div key={token._id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffea00] to-[#ff6b35]" />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{token.marketTitle}</div>
                        <div className="text-white/50 text-xs">{token.ticker}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Amount: {token.amount}</span>
                      <span className="text-white/60">Value: {formatPrice(token.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUsername={username}
        currentBio={bio}
        currentAvatarUrl={avatarUrl}
        onUpdate={(newUsername, newBio, newAvatarUrl) => {
          setUsername(newUsername);
          setBio(newBio);
          setAvatarUrl(newAvatarUrl);
        }}
      />
    </div>
  );
}
