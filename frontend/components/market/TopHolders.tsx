"use client";

import { Clock, TrendingDown, TrendingUp } from "lucide-react";

interface Holder {
  wallet: string;
  side: "bullish" | "fade";
  shares: number;
  price: number;
  timestamp: Date | string;
}

interface TopHoldersProps {
  holders: Holder[];
  className?: string;
}

export default function TopHolders({ holders, className = "" }: TopHoldersProps) {
  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatTime = (timestamp: Date | string) => {
    const now = new Date();
    const timestampDate = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const diff = now.getTime() - timestampDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const formatShares = (shares: number) => {
    if (shares >= 1000000) return `${(shares / 1000000).toFixed(1)}M`;
    if (shares >= 1000) return `${(shares / 1000).toFixed(1)}K`;
    return shares.toString();
  };

  return (
    <div className={`bg-black border border-white/10 rounded-lg p-4 ${className}`}>
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={16} />
        Top Holders
      </h3>
      
      {holders.length === 0 ? (
        <div className="text-white/60 text-sm text-center py-4">
          No holders yet
        </div>
      ) : (
        <div className="space-y-3">
          {holders.slice(0, 10).map((holder, index) => (
            <div key={`${holder.wallet}-${holder.timestamp.getTime()}`} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/80 text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{formatWallet(holder.wallet)}</div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Clock size={12} />
                    {formatTime(holder.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  holder.side === 'bullish' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {holder.side === 'bullish' ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {formatShares(holder.shares)} shares
                </div>
                <div className="text-xs text-white/60">
                  @ ${holder.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
