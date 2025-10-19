"use client";

import React from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface MarketTradingProps {
  market: any;
  marketId: string;
  address: string | undefined;
  holders: any[];
  priceHistory: any[];
}

export default function MarketTrading({ market, marketId, address, holders, priceHistory }: MarketTradingProps) {
  const [activeTab, setActiveTab] = React.useState<'buy' | 'sell'>('buy');
  const [selectedSide, setSelectedSide] = React.useState<'bullish' | 'fade' | null>(null);
  const [amount, setAmount] = React.useState('');

  const bullishPrice = market.bullishPrice || 0;
  const fadePrice = market.fadePrice || 0;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Trade {market.ticker}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <BarChart3 className="w-4 h-4" />
          <span>Advanced View</span>
        </div>
      </div>

      {/* Price Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Bullish</span>
          </div>
          <div className="text-2xl font-bold text-green-400">${bullishPrice.toFixed(3)}</div>
          <div className="text-xs text-gray-500">Supply: {market.bullishSupply || 0}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-400">Fade</span>
          </div>
          <div className="text-2xl font-bold text-red-400">${fadePrice.toFixed(3)}</div>
          <div className="text-xs text-gray-500">Supply: {market.fadeSupply || 0}</div>
        </div>
      </div>

      {/* Trading Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('buy')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'buy' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'sell' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Side Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Choose Side</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedSide('bullish')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedSide === 'bullish'
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Bullish</div>
                <div className="text-sm text-gray-400">${bullishPrice.toFixed(3)}</div>
              </div>
              <TrendingUp className="w-5 h-5" />
            </div>
          </button>
          <button
            onClick={() => setSelectedSide('fade')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedSide === 'fade'
                ? 'border-red-500 bg-red-500/10 text-red-400'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Fade</div>
                <div className="text-sm text-gray-400">${fadePrice.toFixed(3)}</div>
              </div>
              <TrendingDown className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
            SOL
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {['0.1', '0.5', '1', 'Max'].map((value) => (
            <button
              key={value}
              onClick={() => setAmount(value === 'Max' ? '100' : value)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Button */}
      <button
        disabled={!address || !selectedSide || !amount || parseFloat(amount) <= 0}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          address && selectedSide && amount && parseFloat(amount) > 0
            ? activeTab === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {!address ? 'Connect Wallet to Trade' : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${selectedSide} Shares`}
      </button>

      {/* Position Info */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Your Position</span>
          <span className="text-sm text-gray-400">Trades</span>
        </div>
        <div className="text-center text-gray-500 text-sm">
          No position yet
        </div>
      </div>
    </div>
  );
}

