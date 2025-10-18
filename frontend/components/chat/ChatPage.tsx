"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";

// Import components
import ChatMain from "./ChatMain";
import ChatSidebar from "./ChatSidebar";
import UserSearchModal from "./UserSearchModal";

interface Conversation {
  _id: string;
  participants: Array<{
    wallet: string;
    username?: string;
    avatarUrl?: string;
    isOnline: boolean;
    lastSeen: string;
  }>;
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

export default function ChatPage() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  // State
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showUserSearch, setShowUserSearch] = React.useState(false);
  const [following, setFollowing] = React.useState<any[]>([]);

  // Load conversations
  const loadConversations = React.useCallback(() => {
    if (!address) return;
    
    setLoading(true);
    const socket = getSocket();
    
    socket.emit('get_conversations', { wallet: address, limit: 50 }, (res: Ack<Conversation[]>) => {
      setLoading(false);
      if (res?.ok && Array.isArray(res.data)) {
        setConversations(res.data);
        
        // If URL has conversationId, select that conversation
        if (conversationId) {
          const conv = res.data.find(c => c._id === conversationId);
          if (conv) {
            setSelectedConversation(conv);
          }
        }
      }
    });
  }, [address, conversationId]);

  // Load following users
  const loadFollowing = React.useCallback(() => {
    if (!address) return;
    
    const socket = getSocket();
    socket.emit('get_following', { wallet: address }, (res: Ack<any[]>) => {
      if (res?.ok && Array.isArray(res.data)) {
        setFollowing(res.data);
      }
    });
  }, [address]);

  // Load messages for selected conversation
  const loadMessages = React.useCallback((convId: string) => {
    const socket = getSocket();
    
    socket.emit('get_messages', { conversationId: convId, limit: 100 }, (res: Ack<{ messages: Message[]; hasMore: boolean }>) => {
      if (res?.ok && res.data) {
        setMessages(res.data.messages);
      }
    });
  }, []);

  // Socket event listeners
  React.useEffect(() => {
    if (!address) return;
    
    const socket = getSocket();

    // Listen for new messages
    socket.on("message_sent", (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === selectedConversation?._id) {
        setMessages(prev => [...prev, data.message]);
      }
      
      // Update conversation list with new message
      setConversations(prev => 
        prev.map(conv => 
          conv._id === data.conversationId 
            ? {
                ...conv,
                lastMessage: {
                  content: data.message.content || `Sent ${data.message.type}`,
                  sender: data.message.sender,
                  timestamp: data.message.createdAt,
                  type: data.message.type
                },
                updatedAt: new Date().toISOString()
              }
            : conv
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    });

    // Listen for new conversations
    socket.on("conversation_created", (data: { conversation: Conversation }) => {
      setConversations(prev => [data.conversation, ...prev]);
    });

    // Listen for user online status
    socket.on("user_online", (data: { wallet: string; isOnline: boolean }) => {
      setConversations(prev => 
        prev.map(conv => ({
          ...conv,
          participants: conv.participants.map(p => 
            p.wallet === data.wallet ? { ...p, isOnline: data.isOnline } : p
          )
        }))
      );
    });

    // Listen for user last seen updates
    socket.on("user_last_seen", (data: { wallet: string; lastSeen: string }) => {
      setConversations(prev => 
        prev.map(conv => ({
          ...conv,
          participants: conv.participants.map(p => 
            p.wallet === data.wallet ? { ...p, lastSeen: data.lastSeen } : p
          )
        }))
      );
    });

    return () => {
      socket.off("message_sent");
      socket.off("conversation_created");
      socket.off("user_online");
      socket.off("user_last_seen");
    };
  }, [address, selectedConversation]);

  // Load data on mount
  React.useEffect(() => {
    loadConversations();
    loadFollowing();
  }, [loadConversations, loadFollowing]);

  // Load messages when conversation is selected
  React.useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
    }
  }, [selectedConversation, loadMessages]);

  // Update last seen periodically
  React.useEffect(() => {
    if (!address) return;
    
    const interval = setInterval(() => {
      const socket = getSocket();
      socket.emit('update_last_seen', { wallet: address });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [address]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('conversationId', conversation._id);
    window.history.pushState({}, '', url.toString());
  };

  // Handle creating new conversation
  const handleCreateConversation = (participants: string[], type: 'direct' | 'group', name?: string, description?: string) => {
    if (!address) return;
    
    const socket = getSocket();
    socket.emit('create_conversation', {
      participants: [address, ...participants],
      type,
      name,
      description
    }, (res: Ack<Conversation>) => {
      if (res?.ok && res.data) {
        setSelectedConversation(res.data);
        setShowUserSearch(false);
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('conversationId', res.data._id);
        window.history.pushState({}, '', url.toString());
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onNewChat={() => setShowUserSearch(true)}
          loading={loading}
        />

        {/* Main Chat Area */}
        <ChatMain
          conversation={selectedConversation}
          messages={messages}
          currentUserWallet={address}
          onSendMessage={(messageData) => {
            if (!selectedConversation || !address) return;
            
            const socket = getSocket();
            socket.emit('send_message', {
              conversationId: selectedConversation._id,
              sender: address,
              ...messageData
            });
          }}
        />

        {/* User Search Modal */}
        {showUserSearch && (
          <UserSearchModal
            following={following}
            onClose={() => setShowUserSearch(false)}
            onCreateConversation={handleCreateConversation}
          />
        )}
      </div>
    </div>
  );
}
