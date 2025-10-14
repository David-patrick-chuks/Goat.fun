"use client";

import React from 'react';
import Image from 'next/image';
import type { Coin } from '@/lib/data/coins';

interface CoinCardProps {
  coin: Coin;
  className?: string;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, className = '' }) => {
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    }
    return `$${marketCap}`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-yellow-500';
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
      bg-black rounded-lg p-4 border border-white/10
      hover:border-white/30 transition-colors
      ${className}
    `}>
      {/* Coin Image and Basic Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
          <Image
            src={coin.image}
            alt={coin.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-lg object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{coin.name}</h3>
          <p className="text-white/70 text-sm">{coin.ticker}</p>
          <p className="text-white/50 text-xs">{coin.creator} {coin.createdAt}</p>
        </div>
      </div>

      {/* Market Cap and Price Change */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm">MC {formatMarketCap(coin.marketCap)}</span>
        <span className={`text-sm font-medium ${getPriceChangeColor(coin.priceChange)}`}>
          {getPriceChangeIcon(coin.priceChange)}{Math.abs(coin.priceChange).toFixed(2)}%
        </span>
      </div>

      {/* Description */}
      {coin.description && (
        <p className="text-white/70 text-sm line-clamp-2">{coin.description}</p>
      )}

      {/* Replies count for trending coins */}
      {coin.replies && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <span className="text-white/50 text-xs">replies: {coin.replies}</span>
        </div>
      )}
    </div>
  );
};

export default CoinCard;
