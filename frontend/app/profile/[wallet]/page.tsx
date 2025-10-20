"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";

interface User {
  wallet: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  followers: Array<{ wallet: string; username?: string }>;
  following: Array<{ wallet: string; username?: string }>;
  createdMarkets: string[];
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

interface Market {
  _id: string;
  creator: string;
  title: string;
  ticker: string;
  description?: string;
  media?: string;
  banner?: string;
  status: 'active' | 'ended' | 'cancelled';
  createdAt: string;
}

interface FollowRelation {
  follower: User;
  following: User;
}

export default function ProfilePage() {
  const params = useParams();
  const identifier = params.wallet as string; // This could be wallet or username
  const { address } = useAccount();

  // State
  const [user, setUser] = React.useState<User | null>(null);
  const [markets, setMarkets] = React.useState<Market[]>([]);
  const [followers, setFollowers] = React.useState<User[]>([]);
  const [following, setFollowing] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'markets' | 'followers' | 'following'>('markets');

  // Load user data
  const loadUserData = React.useCallback(() => {
    if (!identifier) return;

    setLoading(true);
    const socket = getSocket();

    // Load user profile
    socket.emit('get_user', { identifier }, (res: Ack<User>) => {
      if (res?.ok && res.data) {
        setUser(res.data);
      }
      setLoading(false);
    });

    // Load user's markets
    socket.emit('get_markets', { 
      status: 'active', 
      limit: 50, 
      sort: 'newest',
      search: identifier // This will need to be updated to search by creator
    }, (res: Ack<{ items: Market[]; total: number }>) => {
      if (res?.ok && res.data) {
        // Filter markets by creator (since we don't have creator search yet)
        const userMarkets = res.data.items.filter(market => market.creator === identifier);
        setMarkets(userMarkets);
      }
    });

    // Load followers
    socket.emit('get_followers', { wallet: identifier }, (res: Ack<FollowRelation[]>) => {
      if (res?.ok && Array.isArray(res.data)) {
        setFollowers(res.data.map(f => f.follower));
      }
    });

    // Load following
    socket.emit('get_following', { wallet: identifier }, (res: Ack<FollowRelation[]>) => {
      if (res?.ok && Array.isArray(res.data)) {
        setFollowing(res.data.map(f => f.following));
      }
    });

    // Check if current user is following this user
    if (address && address !== identifier) {
      socket.emit('get_following', { wallet: address }, (res: Ack<FollowRelation[]>) => {
        if (res?.ok && Array.isArray(res.data)) {
          const isFollowingUser = res.data.some(f => f.following.wallet === identifier);
          setIsFollowing(isFollowingUser);
        }
      });
    }
  }, [identifier, address]);

  // Load data on mount
  React.useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle follow/unfollow
  const handleFollowToggle = () => {
    if (!address || !user) return;

    const socket = getSocket();
    
    if (isFollowing) {
      socket.emit('unfollow_user', { follower: address, following: identifier }, (res: Ack) => {
        if (res?.ok) {
          setIsFollowing(false);
          setUser(prev => prev ? {
            ...prev,
            followers: prev.followers.filter(f => f.wallet !== address)
          } : null);
        }
      });
    } else {
      socket.emit('follow_user', { follower: address, following: identifier }, (res: Ack) => {
        if (res?.ok) {
          setIsFollowing(true);
          setUser(prev => prev ? {
            ...prev,
            followers: [...prev.followers, { wallet: address }]
          } : null);
        }
      });
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffea00] mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-gray-400">This user doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = address === identifier;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {user.avatarUrl ? (
                <Image 
                  src={user.avatarUrl} 
                  alt="Profile" 
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/20">
                  {user.username?.charAt(0).toUpperCase() || user.wallet.slice(0, 2).toUpperCase()}
                </div>
              )}
              
              {/* Online indicator */}
              {user.isOnline && (
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full"></div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold">
                  {user.username || user.wallet.slice(0, 6) + '...'}
                </h1>
                
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-[#ffea00] hover:bg-[#ffd700] text-black'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              <p className="text-gray-300 mb-4">
                {user.bio || 'No bio available'}
              </p>

              <div className="flex gap-6 text-sm text-gray-400">
                <div>
                  <span className="font-semibold text-white">{user.followers.length}</span> followers
                </div>
                <div>
                  <span className="font-semibold text-white">{user.following.length}</span> following
                </div>
                <div>
                  <span className="font-semibold text-white">{user.createdMarkets.length}</span> markets
                </div>
                <div>
                  Joined {formatDate(user.createdAt)}
                </div>
              </div>

              {!user.isOnline && (
                <div className="mt-2 text-sm text-gray-400">
                  Last seen {formatTime(user.lastSeen)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('markets')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'markets'
                ? 'text-[#ffea00] border-b-2 border-[#ffea00]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Markets ({markets.length})
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'followers'
                ? 'text-[#ffea00] border-b-2 border-[#ffea00]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'following'
                ? 'text-[#ffea00] border-b-2 border-[#ffea00]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Following ({following.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'markets' && (
          <div className="space-y-4">
            {markets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-2">No Markets Yet</h3>
                <p className="text-gray-400">This user hasn't created any markets.</p>
              </div>
            ) : (
              markets.map(market => (
                <div key={market._id} className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
                  <div className="flex items-start gap-4">
                    {market.banner && (
                      <Image 
                        src={market.banner} 
                        alt="Market Banner" 
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{market.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{market.ticker}</p>
                      {market.description && (
                        <p className="text-gray-300 text-sm mb-3">{market.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Created {formatDate(market.createdAt)}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          market.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          market.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {market.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-3">
            {followers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">No Followers Yet</h3>
                <p className="text-gray-400">This user doesn't have any followers.</p>
              </div>
            ) : (
              followers.map(follower => (
                <div key={follower.wallet} className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-3">
                    {follower.avatarUrl ? (
                      <Image src={follower.avatarUrl} alt="Avatar" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {follower.username?.charAt(0).toUpperCase() || follower.wallet.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {follower.username || follower.wallet.slice(0, 6) + '...'}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {follower.isOnline ? 'Online' : `Last seen ${formatTime(follower.lastSeen)}`}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {follower.createdMarkets.length} markets
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-3">
            {following.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-xl font-semibold mb-2">Not Following Anyone</h3>
                <p className="text-gray-400">This user isn't following anyone yet.</p>
              </div>
            ) : (
              following.map(followingUser => (
                <div key={followingUser.wallet} className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-3">
                    {followingUser.avatarUrl ? (
                      <Image src={followingUser.avatarUrl} alt="Avatar" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {followingUser.username?.charAt(0).toUpperCase() || followingUser.wallet.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {followingUser.username || followingUser.wallet.slice(0, 6) + '...'}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {followingUser.isOnline ? 'Online' : `Last seen ${formatTime(followingUser.lastSeen)}`}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {followingUser.createdMarkets.length} markets
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
