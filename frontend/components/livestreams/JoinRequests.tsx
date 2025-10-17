"use client";

import React from "react";
import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";

interface JoinRequestsProps {
  joinRequests: { wallet: string; timestamp: Date }[];
  setJoinRequests: (requests: { wallet: string; timestamp: Date }[]) => void;
  marketId: string | null;
  address: string | undefined;
}

export default function JoinRequests({
  joinRequests,
  setJoinRequests,
  marketId,
  address
}: JoinRequestsProps) {
  const acceptJoinRequest = (requesterWallet: string) => {
    if (!marketId || !address) return;
    const socket = getSocket();
    socket.emit('accept_join_request', { marketId, requesterWallet, streamerWallet: address }, (res: Ack) => {
      if (res?.ok) {
        console.log('Join request accepted');
        setJoinRequests(prev => prev.filter(req => req.wallet !== requesterWallet));
      } else {
        console.error('Failed to accept join request:', res?.error);
      }
    });
  };

  const rejectJoinRequest = (requesterWallet: string) => {
    setJoinRequests(prev => prev.filter(req => req.wallet !== requesterWallet));
  };

  if (joinRequests.length === 0) return null;

  return (
    <div className="bg-black border border-white/10 rounded-lg p-3">
      <div className="text-white mb-2">Join Requests</div>
      <div className="space-y-2">
        {joinRequests.map((request, index) => (
          <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
            <div className="text-white/80 text-sm">
              {request.wallet.slice(0, 6)}...{request.wallet.slice(-4)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => acceptJoinRequest(request.wallet)}
                className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded hover:bg-green-500/30"
              >
                Accept
              </button>
              <button
                onClick={() => rejectJoinRequest(request.wallet)}
                className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded hover:bg-red-500/30"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
