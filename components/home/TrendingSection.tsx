"use client";

import type { Coin } from '@/lib/data/coins';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import CoinCard from './CoinCard';

interface TrendingSectionProps {
  coins: Coin[];
  className?: string;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ coins, className = '' }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const amount = Math.max(container.clientWidth * 0.9, 300);
    container.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className={`
      mb-8
      ${className}
    `}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Now trending</h2>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous"
            onClick={() => scrollByAmount("left")}
            className="p-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Next"
            onClick={() => scrollByAmount("right")}
            className="p-2 text-white/50 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {coins.map((coin) => (
          <div key={coin.id} className="min-w-[260px] md:min-w-[300px] lg:min-w-[320px] snap-start">
            <CoinCard coin={coin} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;
