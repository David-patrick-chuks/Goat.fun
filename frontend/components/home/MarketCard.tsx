"use client";

import type { Market } from '@/lib/data/markets';
import Image from 'next/image';
import React from 'react';

interface MarketCardProps {
  market: Market;
  className?: string;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, className = '' }) => {
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    }
    return `$${marketCap}`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-[#ffea00]';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  return (
    <div className={`
      bg-black rounded-lg border border-white/10
      hover:border-white/30 transition-colors cursor-pointer
      ${className}
    `}>
      {/* Market Image - Full width, square aspect */}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={market.image}
          alt={market.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Market Info */}
      <div className="p-4">
        {/* Market Name and Ticker */}
        <div className="mb-3">
          <h3 className="text-white font-semibold text-lg leading-tight mb-1">{market.name}</h3>
          <p className="text-white/70 text-sm">({market.ticker})</p>
        </div>

        {/* Market Cap and Price Change */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm">market cap: {formatMarketCap(market.marketCap)}</span>
          <span className={`text-sm font-medium ${getPriceChangeColor(market.priceChange)}`}>
            {getPriceChangeIcon(market.priceChange)}{Math.abs(market.priceChange).toFixed(2)}%
          </span>
        </div>

        {/* Description */}
        {market.description && (
          <p className="text-white/70 text-sm leading-relaxed mb-3">{market.description}</p>
        )}

        {/* Replies count for trending markets */}
        {market.replies && (
          <div className="pt-3 border-t border-white/10">
            <span className="text-white/50 text-xs">replies: {market.replies}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketCard;
