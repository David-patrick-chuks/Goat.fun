"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import {
    CheckCircle2,
    Clock,
    MessageCircle,
    Search,
    Users,
    X
} from "lucide-react";
import React from "react";

interface User {
  wallet: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  followers: Array<{ wallet: string; username?: string }>;
  following: Array<{ wallet: string; username?: string }>;
  createdMarkets: string[];
  isOnline: boolean;
  lastSeen: string;
}

interface UserSearchModalProps {
  following: User[];
  onClose: () => void;
  onCreateConversation: (participants: string[], type: 'direct' | 'group', name?: string, description?: string) => void;
}

export default function UserSearchModal({ following, onClose, onCreateConversation }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [isGroupChat, setIsGroupChat] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const [groupDescription, setGroupDescription] = React.useState("");

  // Search users
  const searchUsers = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const socket = getSocket();
    
    socket.emit('search_users', { query: query.trim(), limit: 20 }, (res: Ack<User[]>) => {
      setLoading(false);
      if (res?.ok && Array.isArray(res.data)) {
        setSearchResults(res.data);
      }
    });
  }, []);

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  // Handle user selection
  const handleUserSelect = (user: User) => {
    if (selectedUsers.find(u => u.wallet === user.wallet)) {
      setSelectedUsers(prev => prev.filter(u => u.wallet !== user.wallet));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  // Create conversation
  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return;

    const participants = selectedUsers.map(u => u.wallet);
    
    if (isGroupChat) {
      onCreateConversation(participants, 'group', groupName || undefined, groupDescription || undefined);
    } else {
      onCreateConversation(participants, 'direct');
    }
  };

  // Format last seen
  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl shadow-[#ffea00]/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ffea00] rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white">New Chat</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors border border-white/10"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-6 border-b border-white/10">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by username or wallet..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/60 focus:outline-none focus:border-[#ffea00] focus:bg-white/10 transition-all duration-200"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/60" />
            </div>
          </div>

          {/* Chat Type Selection */}
          <div className="p-6 border-b border-white/10">
            <div className="flex gap-3">
              <button
                onClick={() => setIsGroupChat(false)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  !isGroupChat 
                    ? 'bg-[#ffea00] text-black shadow-lg shadow-[#ffea00]/25' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Direct Message
              </button>
              <button
                onClick={() => setIsGroupChat(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isGroupChat 
                    ? 'bg-[#ffea00] text-black shadow-lg shadow-[#ffea00]/25' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                Group Chat
              </button>
            </div>
          </div>

          {/* Group Chat Settings */}
          {isGroupChat && (
            <div className="p-6 border-b border-white/10 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-[#ffea00] focus:bg-white/10 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Description (Optional)</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Enter group description..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-[#ffea00] focus:bg-white/10 resize-none h-24 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="p-6 border-b border-yellow-500/20">
              <h3 className="text-sm font-semibold mb-3 text-white">Selected Users ({selectedUsers.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.wallet}
                    className="flex items-center gap-2 bg-yellow-400 text-black rounded-xl px-3 py-2 font-medium"
                  >
                    <span className="text-sm">{user.username || user.wallet.slice(0, 6) + '...'}</span>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="text-gray-600 hover:text-black transition-colors"
                      title="Remove user"
                      aria-label="Remove user"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {/* Following Section */}
            {!searchQuery && following.length > 0 && (
              <div className="p-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Following
                </h3>
                <div className="space-y-3">
                  {following.map(user => (
                    <div
                      key={user.wallet}
                      onClick={() => handleUserSelect(user)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedUsers.find(u => u.wallet === user.wallet)
                          ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                          : 'hover:bg-gray-900/50 hover:shadow-md border border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-lg font-bold">
                              {user.username?.charAt(0).toUpperCase() || user.wallet.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg truncate">
                            {user.username || user.wallet.slice(0, 6) + '...'}
                          </h4>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3 h-3" />
                            <span className="opacity-70">
                              {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs opacity-70">
                          {user.followers.length} followers
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && (
              <div className="p-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-300 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  {loading ? 'Searching...' : `Search Results (${searchResults.length})`}
                </h3>
                {loading ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p>Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-lg font-medium mb-2">No users found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map(user => (
                      <div
                        key={user.wallet}
                        onClick={() => handleUserSelect(user)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedUsers.find(u => u.wallet === user.wallet)
                            ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                            : 'hover:bg-gray-900/50 hover:shadow-md border border-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-lg font-bold">
                                {user.username?.charAt(0).toUpperCase() || user.wallet.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate">
                              {user.username || user.wallet.slice(0, 6) + '...'}
                            </h4>
                            <p className="text-sm opacity-70 truncate mb-2">
                              {user.bio || user.wallet}
                            </p>
                            <div className="flex gap-4 text-xs opacity-70">
                              <span>{user.followers.length} followers</span>
                              <span>{user.createdMarkets.length} markets</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all duration-200 border border-white/10 text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0 || (isGroupChat && !groupName.trim())}
              className="flex-1 px-6 py-3 bg-[#ffea00] text-black rounded-xl font-bold hover:bg-[#ffea00]/90 disabled:bg-white/10 disabled:text-white/50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-[#ffea00]/25 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {isGroupChat ? 'Create Group' : 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
