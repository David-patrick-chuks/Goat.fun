"use client";

import React from "react";
import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";

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
    socket.emit('chat_message', { marketId, wallet: address, message: input.trim() }, (res: Ack) => {
      if (res?.ok) setInput("");
    });
  };

  return (
    <div className="bg-black border border-white/10 rounded-lg p-3 flex flex-col">
      <div className="text-white mb-2 flex items-center gap-2">
        Public Chat
        {market?.livestream?.isLive && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            LIVE
          </span>
        )}
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 max-h-32 overflow-y-auto space-y-1 mb-2"
      >
        {chat.length === 0 ? (
          <div className="text-white/50 text-sm">
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
      
      <form onSubmit={sendMessage} className="mt-2 flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" 
          placeholder={address ? "Say something" : "Connect wallet to chat"} 
          disabled={!address}
        />
        <button 
          className={`px-3 py-1 rounded text-sm ${address ? 'bg-[#ffea00] text-black' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
          disabled={!address}
        >
          Send
        </button>
      </form>
    </div>
  );
}
