"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">New Chat</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by username or wallet..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffea00]"
              />
              <div className="absolute right-3 top-2.5 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Chat Type Selection */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex gap-4">
              <button
                onClick={() => setIsGroupChat(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !isGroupChat 
                    ? 'bg-[#ffea00] text-black' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Direct Message
              </button>
              <button
                onClick={() => setIsGroupChat(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isGroupChat 
                    ? 'bg-[#ffea00] text-black' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Group Chat
              </button>
            </div>
          </div>

          {/* Group Chat Settings */}
          {isGroupChat && (
            <div className="p-4 border-b border-gray-700 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffea00]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Enter group description..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffea00] resize-none h-20"
                />
              </div>
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-medium mb-2">Selected Users ({selectedUsers.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.wallet}
                    className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-1"
                  >
                    <span className="text-sm">{user.username || user.wallet.slice(0, 6) + '...'}</span>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
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
              <div className="p-4">
                <h3 className="text-sm font-medium mb-3 text-gray-400">Following</h3>
                <div className="space-y-2">
                  {following.map(user => (
                    <div
                      key={user.wallet}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.find(u => u.wallet === user.wallet)
                          ? 'bg-[#ffea00] text-black'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {user.username?.charAt(0).toUpperCase() || user.wallet.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">
                            {user.username || user.wallet.slice(0, 6) + '...'}
                          </h4>
                          <p className="text-sm text-gray-400 truncate">
                            {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
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
              <div className="p-4">
                <h3 className="text-sm font-medium mb-3 text-gray-400">
                  {loading ? 'Searching...' : `Search Results (${searchResults.length})`}
                </h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No users found</div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map(user => (
                      <div
                        key={user.wallet}
                        onClick={() => handleUserSelect(user)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUsers.find(u => u.wallet === user.wallet)
                            ? 'bg-[#ffea00] text-black'
                            : 'hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {user.username?.charAt(0).toUpperCase() || user.wallet.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">
                              {user.username || user.wallet.slice(0, 6) + '...'}
                            </h4>
                            <p className="text-sm text-gray-400 truncate">
                              {user.bio || user.wallet}
                            </p>
                            <div className="flex gap-4 text-xs text-gray-400 mt-1">
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
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0 || (isGroupChat && !groupName.trim())}
              className="flex-1 px-4 py-2 bg-[#ffea00] text-black rounded-lg font-semibold hover:bg-[#ffd700] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGroupChat ? 'Create Group' : 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
