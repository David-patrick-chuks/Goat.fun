"use client";

import type { Market } from '@/lib/data/markets';
import { Play, TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useAccount } from 'wagmi';

interface MarketCardProps {
  market: Market;
  className?: string;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, className = '' }) => {
  const { isConnected } = useAccount();
  
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

  const handleBuyClick = (e: React.MouseEvent, side: 'bullish' | 'fade') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isConnected) {
      // Trigger wallet connection
      const connectButton = document.querySelector('[data-testid="rk-connect-button"]') as HTMLButtonElement;
      if (connectButton) {
        connectButton.click();
      }
      return;
    }
    
    // TODO: Implement buy functionality
    console.log(`Buy ${side} shares for market ${market.id}`);
  };

  return (
    <Link href={`/market/${market.id}`} className={`
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
        {/* Live streaming indicator */}
        {(market as any).livestream?.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <Play size={12} fill="currentColor" />
            LIVE
          </div>
        )}
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

        {/* Buy/Sell Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={(e) => handleBuyClick(e, 'bullish')}
            className="flex-1 flex items-center justify-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <TrendingUp size={14} />
            Bullish
          </button>
          <button
            onClick={(e) => handleBuyClick(e, 'fade')}
            className="flex-1 flex items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <TrendingDown size={14} />
            Fade
          </button>
        </div>

        {/* Replies count for trending markets */}
        {market.replies && (
          <div className="pt-3 border-t border-white/10">
            <span className="text-white/50 text-xs">replies: {market.replies}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default MarketCard;
