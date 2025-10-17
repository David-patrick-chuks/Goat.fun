"use client";

import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";

interface TradingSectionProps {
  marketId: string | null;
  address: string | undefined;
  buyAmount: string;
  setBuyAmount: (amount: string) => void;
  selectedSide: 'bullish' | 'fade' | null;
  setSelectedSide: (side: 'bullish' | 'fade' | null) => void;
  isBuying: boolean;
  setIsBuying: (buying: boolean) => void;
  holders: { wallet: string; side: 'bullish' | 'fade'; shares: number; price: number; timestamp: Date }[];
  setHolders: (holders: { wallet: string; side: 'bullish' | 'fade'; shares: number; price: number; timestamp: Date }[]) => void;
  priceHistory: { timestamp: Date; bullishPrice: number; fadePrice: number }[];
  setPriceHistory: (history: { timestamp: Date; bullishPrice: number; fadePrice: number }[]) => void;
}

export default function TradingSection({
  marketId,
  address,
  buyAmount,
  setBuyAmount,
  selectedSide,
  setSelectedSide,
  isBuying,
  setIsBuying,
  holders,
  setHolders,
  priceHistory,
  setPriceHistory
}: TradingSectionProps) {
  const handleBuyShares = async () => {
    if (!marketId || !address || !selectedSide || !buyAmount || isBuying) return;
    
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsBuying(true);
    const socket = getSocket();
    
    socket.emit('buy_shares', { 
      marketId, 
      wallet: address, 
      side: selectedSide, 
      amount 
    }, (res: Ack<{ shares: number; price: number }>) => {
      setIsBuying(false);
      if (res?.ok && res.data) {
        console.log('Shares purchased:', res.data);
        
        // Refresh holders and price history
        socket.emit('get_holders', { marketId, limit: 20 }, (res: Ack<{ wallet: string; side: 'bullish' | 'fade'; shares: number; price: number; timestamp: Date }[]>) => {
          if (res?.ok && Array.isArray(res.data)) {
            setHolders(res.data);
          }
        });
        
        socket.emit('get_price_history', { marketId, limit: 100 }, (res: Ack<{ timestamp: Date; bullishPrice: number; fadePrice: number }[]>) => {
          if (res?.ok && Array.isArray(res.data)) {
            setPriceHistory(res.data);
          }
        });
        
        setBuyAmount('');
        setSelectedSide(null);
      } else {
        console.error('Failed to buy shares:', res?.error);
        alert(`Failed to buy shares: ${res?.error}`);
      }
    });
  };

  return (
    <div className="bg-black border border-white/10 rounded-lg p-4">
      <div className="text-white mb-4">
        <div className="text-lg font-semibold mb-2">Choose Side</div>
        <div className="text-sm text-white/70 mb-4">Select Bullish or Fade</div>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSelectedSide('bullish')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              selectedSide === 'bullish' 
                ? 'border-green-400 bg-green-400/10 text-green-300' 
                : 'border-white/20 bg-white/5 text-white/70 hover:border-green-400/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <div>
                <div className="font-medium">Bullish</div>
                <div className="text-sm">$1.20</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedSide('fade')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              selectedSide === 'fade' 
                ? 'border-red-400 bg-red-400/10 text-red-300' 
                : 'border-white/20 bg-white/5 text-white/70 hover:border-red-400/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              <div>
                <div className="font-medium">Fade</div>
                <div className="text-sm">$0.80</div>
              </div>
            </div>
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Amount (USD)</label>
            <input
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>
          
          <button
            onClick={handleBuyShares}
            disabled={!selectedSide || !buyAmount || isBuying || !address}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              selectedSide && buyAmount && address && !isBuying
                ? selectedSide === 'bullish'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isBuying ? 'Processing...' : `Buy ${selectedSide || 'Shares'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
