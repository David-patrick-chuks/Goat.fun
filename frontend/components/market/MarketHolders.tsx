"use client";

import React from "react";
import { Users, TrendingUp } from "lucide-react";

interface MarketHoldersProps {
  holders: any[];
}

export default function MarketHolders({ holders }: MarketHoldersProps) {
  return (
    <div className="bg-gray-900 rounded-xl">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Holders</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{holders.length}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {holders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No holders yet</p>
            <p className="text-sm text-gray-400">Be the first to trade!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holders.slice(0, 10).map((holder, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {holder.wallet.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{holder.wallet.slice(0, 6)}...{holder.wallet.slice(-4)}</p>
                    <p className="text-xs text-gray-400">
                      {holder.side === 'bullish' ? 'Bullish' : 'Fade'} • {holder.shares} shares
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${(holder.shares * holder.price).toFixed(2)}</p>
                  <div className={`flex items-center gap-1 text-xs ${
                    holder.side === 'bullish' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {holder.side === 'bullish' ? '+' : '-'}{((holder.price - 0.05) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
            
            {holders.length > 10 && (
              <div className="text-center pt-3">
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  View all {holders.length} holders
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
