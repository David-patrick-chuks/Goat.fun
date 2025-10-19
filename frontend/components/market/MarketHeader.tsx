"use client";

import React from "react";
import Image from "next/image";
import { Share2, ExternalLink } from "lucide-react";

interface MarketHeaderProps {
  market: any;
  isStreamer: boolean;
  address: string | undefined;
}

export default function MarketHeader({ market, isStreamer, address }: MarketHeaderProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          {/* Market Info */}
          <div className="flex items-start gap-4">
            {/* Market Image */}
            <div className="relative">
              {market.banner ? (
                <Image
                  src={market.banner}
                  alt={market.title}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-black font-bold text-xl">
                  {market.ticker.charAt(0)}
                </div>
              )}
              
              {/* Live Indicator */}
              {market.livestream?.isLive && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              )}
            </div>
            
            {/* Market Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{market.title}</h1>
                <span className="text-gray-400 text-sm">{market.ticker}</span>
                {market.livestream?.isLive && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
                    🔴 Streaming Live
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <span>{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span>
                <span>•</span>
                <span>{formatTimeAgo(market.createdAt)}</span>
                <span>•</span>
                <span>{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span>
              </div>
              
              {market.description && (
                <p className="text-gray-300 text-sm max-w-2xl">{market.description}</p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
