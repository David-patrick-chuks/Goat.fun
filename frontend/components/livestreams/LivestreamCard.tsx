"use client";

import type { Livestream } from '@/lib/data/livestreams';
import Image from 'next/image';
import React from 'react';

interface LivestreamCardProps {
  livestream: Livestream;
  className?: string;
}

const LivestreamCard: React.FC<LivestreamCardProps> = ({ livestream, className = '' }) => {
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    }
    return `$${marketCap}`;
  };

  const formatATH = (ath: number) => {
    if (ath >= 1000000) {
      return `$${(ath / 1000000).toFixed(1)}M`;
    } else if (ath >= 1000) {
      return `$${(ath / 1000).toFixed(1)}K`;
    }
    return `$${ath}`;
  };

  return (
    <div className={`
      bg-black rounded-lg border border-white/10
      hover:border-white/30 transition-colors cursor-pointer
      ${className}
    `}>
      {/* Livestream Image with LIVE badge */}
      <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
        <Image
          src={livestream.image}
          alt={livestream.name}
          fill
          className="object-cover"
        />
        
        {/* LIVE Badge */}
        {livestream.isLive && (
          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            LIVE
          </div>
        )}
        
        {/* Platform Overlay */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
          {livestream.platform}
        </div>
      </div>

      {/* Livestream Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-white font-semibold text-lg">{livestream.name}</h3>
          <p className="text-white/70 text-sm">{livestream.creator}</p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-white/70 text-sm">mcap</span>
            <span className="text-[#ffea00] font-bold text-sm">{formatMarketCap(livestream.marketCap)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70 text-sm">ATH</span>
            <span className="text-[#ffea00] font-bold text-sm">{formatATH(livestream.ath)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivestreamCard;
