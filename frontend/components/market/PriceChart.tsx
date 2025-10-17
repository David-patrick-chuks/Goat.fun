"use client";

import React from "react";

interface PricePoint {
  timestamp: Date;
  bullishPrice: number;
  fadePrice: number;
}

interface PriceChartProps {
  data: PricePoint[];
  className?: string;
}

export default function PriceChart({ data, className = "" }: PriceChartProps) {
  if (data.length === 0) {
    return (
      <div className={`bg-black border border-white/10 rounded-lg p-4 ${className}`}>
        <h3 className="text-white font-semibold mb-4">Price Chart</h3>
        <div className="text-white/60 text-sm text-center py-8">
          No price data available yet
        </div>
      </div>
    );
  }

  // Simple mock chart - in a real app you'd use a charting library like Chart.js or Recharts
  const maxPrice = Math.max(...data.map(d => Math.max(d.bullishPrice, d.fadePrice)));
  const minPrice = Math.min(...data.map(d => Math.min(d.bullishPrice, d.fadePrice)));
  const priceRange = maxPrice - minPrice || 1;

  const getY = (price: number) => {
    return 100 - ((price - minPrice) / priceRange) * 80; // 80% height, 20% margin
  };

  return (
    <div className={`bg-black border border-white/10 rounded-lg p-4 ${className}`}>
      <h3 className="text-white font-semibold mb-4">Price Chart</h3>
      
      <div className="relative h-48 bg-white/5 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Bullish price line */}
          {data.length > 1 && (
            <polyline
              points={data.map((d, i) => `${(i / (data.length - 1)) * 100},${getY(d.bullishPrice)}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="1"
            />
          )}
          
          {/* Fade price line */}
          {data.length > 1 && (
            <polyline
              points={data.map((d, i) => `${(i / (data.length - 1)) * 100},${getY(d.fadePrice)}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1"
            />
          )}
        </svg>
        
        {/* Legend */}
        <div className="absolute top-2 right-2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-green-400"></div>
            <span className="text-white/80">Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-red-400"></div>
            <span className="text-white/80">Fade</span>
          </div>
        </div>
        
        {/* Price labels */}
        <div className="absolute left-2 top-2 text-xs text-white/60">
          ${maxPrice.toFixed(2)}
        </div>
        <div className="absolute left-2 bottom-2 text-xs text-white/60">
          ${minPrice.toFixed(2)}
        </div>
      </div>
      
      {/* Current prices */}
      <div className="flex justify-between mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-white/80">Bullish: ${data[data.length - 1]?.bullishPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span className="text-white/80">Fade: ${data[data.length - 1]?.fadePrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
