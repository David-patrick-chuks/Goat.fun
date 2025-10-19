"use client";

import {
    CheckCircle2,
    Clock,
    MessageCircle,
    Plus,
    Search,
    Users
} from "lucide-react";

interface Participant {
  wallet: string;
  username?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat: () => void;
  loading: boolean;
}

export default function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewChat,
  loading
}: ChatSidebarProps) {
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

  // Get conversation display name
  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group' && conversation.name) {
      return conversation.name;
    }
    
    // For direct messages, show the other participant's name
    // We'll need to pass the current user's wallet to properly identify the other participant
    const otherParticipant = conversation.participants[0]; // For now, just take the first participant
    return otherParticipant?.username || otherParticipant?.wallet.slice(0, 6) + '...';
  };

  // Get conversation avatar
  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      // For groups, show first letter of group name
      return conversation.name?.charAt(0).toUpperCase() || 'G';
    }
    
    // For direct messages, show other participant's avatar or initials
    const otherParticipant = conversation.participants[0]; // For now, just take the first participant
    if (otherParticipant?.avatarUrl) {
      return otherParticipant.avatarUrl;
    }
    return otherParticipant?.username?.charAt(0).toUpperCase() || otherParticipant?.wallet.slice(0, 2).toUpperCase() || '?';
  };

  // Get online status for direct messages
  const getOnlineStatus = (conversation: Conversation) => {
    if (conversation.type === 'group') return null;
    
    const otherParticipant = conversation.participants[0]; // For now, just take the first participant
    return otherParticipant?.isOnline;
  };

  return (
    <div className="w-80 lg:w-80 md:w-72 sm:w-64 bg-black border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffea00] rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold text-white">Messages</h1>
          </div>
          <button
            onClick={onNewChat}
            className="w-10 h-10 bg-[#ffea00] text-black rounded-xl flex items-center justify-center hover:bg-[#ffea00]/90 transition-all duration-200 shadow-lg hover:shadow-[#ffea00]/25"
            title="Start new chat"
            aria-label="Start new chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/60 focus:outline-none focus:border-[#ffea00] focus:bg-white/10 transition-all duration-200"
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-white/60" />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-white/70">
            <div className="animate-spin w-6 h-6 border-2 border-[#ffea00] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p>Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-white/70">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-lg font-medium mb-2">No conversations yet</p>
            <p className="text-sm text-white/60">Start a new chat to get started!</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {conversations.map((conversation) => {
              const isSelected = selectedConversation?._id === conversation._id;
              const isOnline = getOnlineStatus(conversation);
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-[#ffea00] text-black shadow-lg shadow-[#ffea00]/20' 
                      : 'hover:bg-white/5 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      {typeof getConversationAvatar(conversation) === 'string' && 
                       !getConversationAvatar(conversation).startsWith('http') ? (
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold ${
                          isSelected ? 'bg-white/10' : 'bg-white/5'
                        }`}>
                          {conversation.type === 'group' ? (
                            <Users className="w-6 h-6" />
                          ) : (
                            getConversationAvatar(conversation)
                          )}
                        </div>
                      ) : (
                        <img
                          src={getConversationAvatar(conversation) as string}
                          alt="Avatar"
                          className="w-14 h-14 rounded-2xl object-cover"
                        />
                      )}
                      
                      {/* Online indicator for direct messages */}
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-bold text-lg truncate ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}>
                          {getConversationName(conversation)}
                        </h3>
                        {conversation.lastMessage && (
                          <div className={`flex items-center gap-1 text-xs ${
                            isSelected ? 'text-black/60' : 'text-white/60'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {formatTime(conversation.lastMessage.timestamp)}
                          </div>
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className={`text-sm truncate ${
                          isSelected ? 'text-black/60' : 'text-white/60'
                        }`}>
                          {conversation.lastMessage.sender === 'current-user' ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/60 text-center bg-white/5 rounded-lg py-2">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
