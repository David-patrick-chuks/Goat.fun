"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CoinCard from './CoinCard';
import type { Coin } from '@/lib/data/coins';

interface TrendingSectionProps {
  coins: Coin[];
  className?: string;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ coins, className = '' }) => {
  return (
    <div className={`
      mb-8
      ${className}
    `}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Now trending</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 text-white/50 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coins.map((coin) => (
          <CoinCard key={coin.id} coin={coin} />
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;
