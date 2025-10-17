"use client";


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

  const latestData = data[data.length - 1];
  const priceChange = data.length > 1 ? {
    bullish: latestData.bullishPrice - data[data.length - 2].bullishPrice,
    fade: latestData.fadePrice - data[data.length - 2].fadePrice
  } : { bullish: 0, fade: 0 };

  return (
    <div className={`bg-black border border-white/10 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <h3 className="text-white font-semibold">Price Chart</h3>
        </div>
        <div className="text-xs text-white/60">
          {data.length} data points
        </div>
      </div>
      
      {/* Current prices with change indicators */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="text-green-300 text-sm font-medium">Bullish</div>
          <div className="text-white text-lg font-bold">${latestData.bullishPrice.toFixed(3)}</div>
          <div className={`text-xs ${priceChange.bullish >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange.bullish >= 0 ? '+' : ''}{priceChange.bullish.toFixed(3)}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="text-red-300 text-sm font-medium">Fade</div>
          <div className="text-white text-lg font-bold">${latestData.fadePrice.toFixed(3)}</div>
          <div className={`text-xs ${priceChange.fade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange.fade >= 0 ? '+' : ''}{priceChange.fade.toFixed(3)}
          </div>
        </div>
      </div>
      
      {/* Enhanced chart */}
      <div className="relative h-48 bg-gradient-to-b from-white/5 to-transparent rounded-lg p-4 border border-white/5">
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
          
          {/* Vertical grid lines */}
          {[0, 25, 50, 75, 100].map(x => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="100"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.3"
            />
          ))}
          
          {/* Bullish area fill */}
          {data.length > 1 && (
            <polygon
              points={`0,100 ${data.map((d, i) => `${(i / (data.length - 1)) * 100},${getY(d.bullishPrice)}`).join(' ')} 100,100`}
              fill="url(#bullishGradient)"
            />
          )}
          
          {/* Fade area fill */}
          {data.length > 1 && (
            <polygon
              points={`0,100 ${data.map((d, i) => `${(i / (data.length - 1)) * 100},${getY(d.fadePrice)}`).join(' ')} 100,100`}
              fill="url(#fadeGradient)"
            />
          )}
          
          {/* Bullish price line */}
          {data.length > 1 && (
            <polyline
              points={data.map((d, i) => `${(i / (data.length - 1)) * 100},${getY(d.bullishPrice)}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
            />
          )}
          
          {/* Fade price line */}
          {data.length > 1 && (
            <polyline
              points={data.map((d, i) => `${(i / (data.length - 1)) * 100},${getY(d.fadePrice)}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
          )}
          
          {/* Data points */}
          {data.map((d, i) => {
            const xPos = data.length === 1 ? 50 : (i / (data.length - 1)) * 100;
            return (
              <g key={i}>
                <circle cx={xPos} cy={getY(d.bullishPrice)} r="0.8" fill="#10b981" />
                <circle cx={xPos} cy={getY(d.fadePrice)} r="0.8" fill="#ef4444" />
              </g>
            );
          })}
          
          {/* Gradients */}
          <defs>
            <linearGradient id="bullishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
            </linearGradient>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.05)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Price labels */}
        <div className="absolute left-2 top-2 text-xs text-white/60 font-mono">
          ${maxPrice.toFixed(3)}
        </div>
        <div className="absolute left-2 bottom-2 text-xs text-white/60 font-mono">
          ${minPrice.toFixed(3)}
        </div>
      </div>
      
      {/* Enhanced legend and stats */}
      <div className="flex justify-between items-center mt-4 text-xs">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-400"></div>
            <span className="text-white/80">Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-400"></div>
            <span className="text-white/80">Fade</span>
          </div>
        </div>
        {latestData.poolBalance && (
          <div className="text-white/60 font-mono">
            Pool: ${latestData.poolBalance.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
