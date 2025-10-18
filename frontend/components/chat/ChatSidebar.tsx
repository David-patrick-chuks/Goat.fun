"use client";


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
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <button
            onClick={onNewChat}
            className="w-8 h-8 bg-[#ffea00] text-black rounded-full flex items-center justify-center hover:bg-[#ffd700] transition-colors"
          >
            +
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffea00]"
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <div className="mb-4">💬</div>
            <p>No conversations yet</p>
            <p className="text-sm">Start a new chat to get started!</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => {
              const isSelected = selectedConversation?._id === conversation._id;
              const isOnline = getOnlineStatus(conversation);
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-[#ffea00] text-black' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      {typeof getConversationAvatar(conversation) === 'string' && 
                       !getConversationAvatar(conversation).startsWith('http') ? (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                          isSelected ? 'bg-gray-700' : 'bg-gray-600'
                        }`}>
                          {getConversationAvatar(conversation)}
                        </div>
                      ) : (
                        <img
                          src={getConversationAvatar(conversation) as string}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      
                      {/* Online indicator for direct messages */}
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}>
                          {getConversationName(conversation)}
                        </h3>
                        {conversation.lastMessage && (
                          <span className={`text-xs ${
                            isSelected ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className={`text-sm truncate ${
                          isSelected ? 'text-gray-700' : 'text-gray-400'
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
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
