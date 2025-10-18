"use client";

import React from "react";

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

interface Message {
  _id: string;
  sender: string;
  type: 'text' | 'image' | 'market' | 'user' | 'gif' | 'emoji';
  content?: string;
  imageUrl?: string;
  marketId?: string;
  userId?: string;
  gifUrl?: string;
  emoji?: string;
  replyTo?: string;
  createdAt: string;
}

interface ChatMainProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserWallet: string | undefined;
  onSendMessage: (messageData: {
    type: 'text' | 'image' | 'market' | 'user' | 'gif' | 'emoji';
    content?: string;
    imageData?: string;
    filename?: string;
    marketId?: string;
    userId?: string;
    gifUrl?: string;
    emoji?: string;
    replyTo?: string;
  }) => void;
}

export default function ChatMain({ conversation, messages, currentUserWallet, onSendMessage }: ChatMainProps) {
  const [messageInput, setMessageInput] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || (!messageInput.trim() && !imageFile)) return;

    if (imageFile) {
      // Send image message
      onSendMessage({
        type: 'image',
        content: messageInput.trim() || undefined,
        imageData: imagePreview!,
        filename: imageFile.name
      });
      removeImage();
    } else {
      // Send text message
      onSendMessage({
        type: 'text',
        content: messageInput.trim()
      });
    }
    
    setMessageInput("");
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  }, [messages]);

  // Get participant info
  const getParticipantInfo = (wallet: string) => {
    return conversation?.participants.find(p => p.wallet === wallet);
  };

  // Common emojis
  const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉'];

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Chat</h2>
          <p className="text-gray-400">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {conversation.type === 'group' ? (
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg font-semibold">
                {conversation.name?.charAt(0).toUpperCase() || 'G'}
              </div>
            ) : (
                (() => {
                  const otherParticipant = conversation.participants[0]; // For now, just take the first participant
                  const avatar = otherParticipant?.avatarUrl;
                  return avatar ? (
                    <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg font-semibold">
                      {otherParticipant?.username?.charAt(0).toUpperCase() || otherParticipant?.wallet.slice(0, 2).toUpperCase() || '?'}
                    </div>
                  );
                })()
            )}
            
            {/* Online indicator */}
            {conversation.type === 'direct' && (() => {
              const otherParticipant = conversation.participants[0]; // For now, just take the first participant
              return otherParticipant?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
              );
            })()}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="font-semibold text-lg">
              {conversation.type === 'group' 
                ? conversation.name || 'Group Chat'
                : (() => {
                    const otherParticipant = conversation.participants[0]; // For now, just take the first participant
                    return otherParticipant?.username || otherParticipant?.wallet.slice(0, 6) + '...';
                  })()
              }
            </h2>
            {conversation.type === 'direct' && (() => {
              const otherParticipant = conversation.participants[0]; // For now, just take the first participant
              return (
                <p className="text-sm text-gray-400">
                  {otherParticipant?.isOnline ? 'Online' : `Last seen ${formatTime(otherParticipant?.lastSeen || '')}`}
                </p>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              📞
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              📹
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              ⋮
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const participant = getParticipantInfo(message.sender);
              const isCurrentUser = message.sender === currentUserWallet;
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.sender !== message.sender;

              return (
                <div key={message._id} className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  {/* Avatar (only for other users) */}
                  {!isCurrentUser && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {participant?.avatarUrl ? (
                            <img src={participant.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            participant?.username?.charAt(0).toUpperCase() || participant?.wallet.slice(0, 2).toUpperCase() || '?'
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-first' : ''}`}>
                    {/* Sender name (only for other users) */}
                    {!isCurrentUser && showAvatar && (
                      <p className="text-xs text-gray-400 mb-1">
                        {participant?.username || participant?.wallet.slice(0, 6) + '...'}
                      </p>
                    )}

                    {/* Message bubble */}
                    <div className={`rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-[#ffea00] text-black' 
                        : 'bg-gray-700 text-white'
                    }`}>
                      {message.type === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      {message.type === 'image' && (
                        <div>
                          {message.imageUrl && (
                            <img src={message.imageUrl} alt="Message" className="max-w-full max-h-64 rounded-lg mb-2" />
                          )}
                          {message.content && (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                      )}

                      {message.type === 'emoji' && (
                        <div className="text-2xl">{message.emoji}</div>
                      )}

                      {message.type === 'gif' && message.gifUrl && (
                        <img src={message.gifUrl} alt="GIF" className="max-w-full max-h-64 rounded-lg" />
                      )}

                      {message.type === 'market' && (
                        <div className="bg-gray-600 rounded-lg p-2">
                          <p className="text-sm font-semibold">📈 Market Shared</p>
                          <p className="text-xs text-gray-300">Market ID: {message.marketId}</p>
                        </div>
                      )}

                      {message.type === 'user' && (
                        <div className="bg-gray-600 rounded-lg p-2">
                          <p className="text-sm font-semibold">👤 User Shared</p>
                          <p className="text-xs text-gray-300">User ID: {message.userId}</p>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p className={`text-xs text-gray-400 mt-1 ${
                      isCurrentUser ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative">
            <img src={imagePreview} alt="Preview" className="max-w-xs max-h-32 rounded-lg object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-gray-700 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendMessage({ type: 'emoji', emoji });
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl hover:bg-gray-600 rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-2">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            aria-label="Upload image"
          />

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              📷
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              😀
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              📈
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              👤
            </button>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffea00]"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!messageInput.trim() && !imageFile}
            className="px-4 py-2 bg-[#ffea00] text-black rounded-lg font-semibold hover:bg-[#ffd700] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
