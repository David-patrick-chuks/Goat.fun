"use client";

import {
  Camera,
  MessageCircle,
  MoreVertical,
  Phone,
  Send,
  Smile,
  TrendingUp,
  User,
  Users,
  Video,
  X
} from "lucide-react";
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
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#ffea00] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-12 h-12 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Welcome to Chat</h2>
          <p className="text-white/70 text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {conversation.type === 'group' ? (
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-lg font-bold">
                <Users className="w-6 h-6 text-[#ffea00]" />
              </div>
            ) : (
                (() => {
                  const otherParticipant = conversation.participants[0]; // For now, just take the first participant
                  const avatar = otherParticipant?.avatarUrl;
                  return avatar ? (
                    <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-lg font-bold">
                      {otherParticipant?.username?.charAt(0).toUpperCase() || otherParticipant?.wallet.slice(0, 2).toUpperCase() || '?'}
                    </div>
                  );
                })()
            )}
            
            {/* Online indicator */}
            {conversation.type === 'direct' && (() => {
              const otherParticipant = conversation.participants[0]; // For now, just take the first participant
              return otherParticipant?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
              );
            })()}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="font-bold text-xl text-white">
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
                <p className="text-sm text-white/70">
                  {otherParticipant?.isOnline ? 'Online' : `Last seen ${formatTime(otherParticipant?.lastSeen || '')}`}
                </p>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
              title="Voice call"
              aria-label="Start voice call"
            >
              <Phone className="w-5 h-5 text-white/70" />
            </button>
            <button 
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
              title="Video call"
              aria-label="Start video call"
            >
              <Video className="w-5 h-5 text-white/70" />
            </button>
            <button 
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/5 text-white/70 text-sm px-4 py-2 rounded-full border border-white/10">
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
                <div key={message._id} className={`flex gap-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  {/* Avatar (only for other users) */}
                  {!isCurrentUser && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-sm font-bold">
                          {participant?.avatarUrl ? (
                            <img src={participant.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-2xl object-cover" />
                          ) : (
                            participant?.username?.charAt(0).toUpperCase() || participant?.wallet.slice(0, 2).toUpperCase() || '?'
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10"></div>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  <div className={`max-w-xs sm:max-w-sm lg:max-w-lg ${isCurrentUser ? 'order-first' : ''}`}>
                    {/* Sender name (only for other users) */}
                    {!isCurrentUser && showAvatar && (
                      <p className="text-sm text-white/70 mb-2 font-medium">
                        {participant?.username || participant?.wallet.slice(0, 6) + '...'}
                      </p>
                    )}

                    {/* Message bubble */}
                    <div className={`rounded-2xl p-4 shadow-lg ${
                      isCurrentUser 
                        ? 'bg-[#ffea00] text-black' 
                        : 'bg-white/5 text-white border border-white/10'
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
                        <div className={`rounded-xl p-3 ${
                          isCurrentUser ? 'bg-white/10' : 'bg-white/10'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <p className="text-sm font-semibold">Market Shared</p>
                          </div>
                          <p className="text-xs opacity-70">Market ID: {message.marketId}</p>
                        </div>
                      )}

                      {message.type === 'user' && (
                        <div className={`rounded-xl p-3 ${
                          isCurrentUser ? 'bg-white/10' : 'bg-white/10'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            <p className="text-sm font-semibold">User Shared</p>
                          </div>
                          <p className="text-xs opacity-70">User ID: {message.userId}</p>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p className={`text-xs text-white/60 mt-1 ${
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
      <div className="p-6 border-t border-white/10 bg-white/5">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4 relative">
            <img src={imagePreview} alt="Preview" className="max-w-xs max-h-32 rounded-xl object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Remove image"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex flex-wrap gap-3">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendMessage({ type: 'emoji', emoji });
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl hover:bg-white/10 rounded-lg p-2 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3">
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
          <div className="flex gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
              title="Upload image"
              aria-label="Upload image"
            >
              <Camera className="w-5 h-5 text-white/70" />
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
              title="Add emoji"
              aria-label="Add emoji"
            >
              <Smile className="w-5 h-5 text-white/70" />
            </button>
            <button
              type="button"
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
              title="Share market"
              aria-label="Share market"
            >
              <TrendingUp className="w-5 h-5 text-white/70" />
            </button>
            <button
              type="button"
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
              title="Share user"
              aria-label="Share user"
            >
              <User className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-[#ffea00] focus:bg-white/10 transition-all duration-200"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!messageInput.trim() && !imageFile}
            className="px-6 py-3 bg-[#ffea00] text-black rounded-xl font-bold hover:bg-[#ffea00]/90 disabled:bg-white/10 disabled:text-white/50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-[#ffea00]/25 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
