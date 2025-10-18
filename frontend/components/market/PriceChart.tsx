"use client";

import { useMemo } from "react";

interface PricePoint {
  timestamp: Date;
  bullishPrice: number;
  fadePrice: number;
  bullishSupply?: number;
  fadeSupply?: number;
  poolBalance?: number;
}

interface PriceChartProps {
  data: PricePoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Calculate market cap and volume from the data
    const processedData = data.map((point, index) => {
      // Use provided values or calculate defaults
      const bullishSupply = point.bullishSupply || 1000000;
      const fadeSupply = point.fadeSupply || 1000000;
      const poolBalance = point.poolBalance || 100000;
      
      const marketCap = poolBalance * 2; // Simplified market cap calculation
      const volume = index > 0 ? Math.abs(poolBalance - (data[index - 1].poolBalance || 100000)) : 0;
      
      return {
        ...point,
        bullishSupply,
        fadeSupply,
        poolBalance,
        marketCap,
        volume,
        price: point.bullishPrice, // Use bullish price as main price
        change: index > 0 ? ((point.bullishPrice - data[index - 1].bullishPrice) / data[index - 1].bullishPrice) * 100 : 0
      };
    });

    return processedData;
  }, [data]);

  const currentData = chartData?.[chartData.length - 1];
  const previousData = chartData?.[chartData.length - 2];
  
  const currentPrice = currentData?.price || 0;
  const priceChange = currentData?.change || 0;
  const marketCap = currentData?.marketCap || 0;
  const volume24h = chartData?.reduce((sum, point) => sum + point.volume, 0) || 0;

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-black border border-white/10 rounded-lg p-6">
        <div className="text-white mb-4">
          <h3 className="text-lg font-semibold mb-2">Price Chart</h3>
          <div className="text-white/60 text-sm">No price data available yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border border-white/10 rounded-lg p-6">
      {/* Header */}
      <div className="text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Market Cap (USD)</h3>
            <div className="text-2xl font-bold mt-1">
              ${(marketCap / 1000).toFixed(1)}K
            </div>
            <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">Price</div>
            <div className="text-lg font-semibold">${currentPrice.toFixed(6)}</div>
            <div className="text-sm text-white/60">24h Vol</div>
            <div className="text-sm">${(volume24h / 1000).toFixed(1)}K</div>
          </div>
        </div>

        {/* Timeframe buttons */}
        <div className="flex gap-2 mb-4">
          {['1h', '1D', '5D', '1M'].map((timeframe) => (
            <button
              key={timeframe}
              className={`px-3 py-1 rounded text-sm ${
                timeframe === '1h' 
                  ? 'bg-white/10 text-white' 
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 bg-black/20 rounded-lg border border-white/5 p-4">
        <div className="h-full flex items-end justify-between">
          {chartData.map((point, index) => {
            const height = Math.max(4, (point.marketCap / Math.max(...chartData.map(p => p.marketCap))) * 200);
            const isPositive = point.change >= 0;
            
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-end h-full"
                style={{ width: `${100 / chartData.length}%` }}
              >
                {/* Candlestick */}
                <div
                  className={`w-1 rounded-sm ${
                    isPositive ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  style={{ height: `${height}px` }}
                />
                
                {/* Price label for current point */}
                {index === chartData.length - 1 && (
                  <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    ${point.price.toFixed(6)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-white/40">
          <div>${(Math.max(...chartData.map(p => p.marketCap)) / 1000).toFixed(0)}K</div>
          <div>${(Math.max(...chartData.map(p => p.marketCap)) / 2000).toFixed(0)}K</div>
          <div>$0</div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-4 flex justify-between text-sm text-white/60">
        <div>Vol 24h ${(volume24h / 1000).toFixed(1)}K</div>
        <div>Price ${currentPrice.toFixed(8)}</div>
        <div className={priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </div>
      </div>

      {/* OHLC Data */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-white/60">O</div>
          <div className="text-white">${chartData[0]?.price.toFixed(6) || '0.000000'}</div>
        </div>
        <div>
          <div className="text-white/60">H</div>
          <div className="text-white">${Math.max(...chartData.map(p => p.price)).toFixed(6)}</div>
        </div>
        <div>
          <div className="text-white/60">L</div>
          <div className="text-white">${Math.min(...chartData.map(p => p.price)).toFixed(6)}</div>
        </div>
        <div>
          <div className="text-white/60">C</div>
          <div className="text-white">${currentPrice.toFixed(6)}</div>
        </div>
      </div>
    </div>
  );
}