"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import React from "react";

interface PublicChatProps {
  chat: { wallet: string; message: string; at: string }[];
  input: string;
  setInput: (input: string) => void;
  marketId: string | null;
  address: string | undefined;
  market: { livestream?: { isLive?: boolean } } | null;
}

export default function PublicChat({
  chat,
  input,
  setInput,
  marketId,
  address,
  market
}: PublicChatProps) {
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div className="bg-black border border-white/10 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold flex items-center gap-2">
          Public Chat
          {market?.livestream?.isLive && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              LIVE
            </span>
          )}
        </div>
        <div className="text-xs text-white/60">323 members</div>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 max-h-32 overflow-y-auto space-y-2 mb-3"
      >
        {chat.length === 0 ? (
          <div className="text-white/50 text-sm text-center py-4">
            {market?.livestream?.isLive ? "Be the first to chat!" : "Chat will be available when stream starts"}
          </div>
        ) : (
          chat.map((m, i) => (
            <div key={i} className="text-white/80 text-sm">
              <span className="text-white/50">{m.wallet.slice(0,6)}..: </span>{m.message}
            </div>
          ))
        )}
      </div>
      
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-white/5 text-white/60 text-xs rounded hover:text-white">
          Join chat
        </button>
        <form onSubmit={sendMessage} className="flex-1 flex gap-2">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm" 
            placeholder={address ? "Say something" : "Connect wallet to chat"} 
            disabled={!address}
          />
          <button 
            className={`px-3 py-2 rounded text-sm ${address ? 'bg-[#ffea00] text-black' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
            disabled={!address}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
