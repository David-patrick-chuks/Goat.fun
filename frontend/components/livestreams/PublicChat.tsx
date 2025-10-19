"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import { MessageCircle, Send, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface PublicChatProps {
  chat: { wallet: string; message: string; at: string; username?: string }[];
  input: string;
  setInput: (input: string) => void;
  marketId: string | null;
  address: string | undefined;
  market: { livestream?: { isLive?: boolean } } | null;
  viewerCount?: number;
}

export default function PublicChat({
  chat,
  input,
  setInput,
  marketId,
  address,
  market,
  viewerCount = 0
}: PublicChatProps) {
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll chat to bottom when new messages arrive
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !marketId || !address) return;
    
    const socket = getSocket();
    console.log('Sending chat message:', { marketId, wallet: address, message: input.trim() });
    socket.emit('chat_message', { marketId, wallet: address, message: input.trim() }, (res: Ack) => {
      console.log('Chat message response:', res);
      if (res?.ok) setInput("");
    });
  };

  const handleUserClick = (wallet: string, username?: string) => {
    // Navigate to profile page using username if available, otherwise wallet
    const profilePath = username ? `/u/${username}` : `/profile/${wallet}`;
    router.push(profilePath);
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Live Chat</h3>
            {market?.livestream?.isLive && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{viewerCount > 0 ? `${viewerCount}` : '0'}</span>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="h-64 overflow-y-auto p-4 space-y-3"
      >
        {chat.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs text-gray-400">Be the first to chat!</p>
          </div>
        ) : (
          chat.map((m, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(m.username || m.wallet).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => handleUserClick(m.wallet, m.username)}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    {m.username || `${m.wallet.slice(0,6)}...${m.wallet.slice(-4)}`}
                  </button>
                  <span className="text-xs text-gray-400">
                    {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 break-words">{m.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={sendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none" 
              placeholder={address ? "Type a message..." : "Connect wallet to chat"} 
              disabled={!address || !market?.livestream?.isLive}
            />
          </div>
          <button 
            type="submit"
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              address && market?.livestream?.isLive && input.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!address || !market?.livestream?.isLive || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        
        {!address && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Connect your wallet to participate in the chat
          </p>
        )}
      </div>
    </div>
  );
}