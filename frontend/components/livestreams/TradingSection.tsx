"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import { TrendingDown, TrendingUp } from "lucide-react";

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
    <div className="bg-black border border-white/10 rounded-lg p-6">
      <div className="text-white">
        {/* Buy/Sell Toggle */}
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg font-medium">
            Buy
          </button>
          <button className="px-4 py-2 bg-white/5 text-white/60 rounded-lg font-medium hover:text-white">
            Sell
          </button>
        </div>

        {/* Side Selection */}
        <div className="mb-6">
          <div className="text-sm text-white/60 mb-3">Choose Side</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedSide('bullish')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedSide === 'bullish' 
                  ? 'border-green-400 bg-green-400/10 text-green-300' 
                  : 'border-white/20 bg-white/5 text-white/70 hover:border-green-400/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Bullish</div>
                  <div className="text-sm opacity-80">$1.20</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedSide('fade')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedSide === 'fade' 
                  ? 'border-red-400 bg-red-400/10 text-red-300' 
                  : 'border-white/20 bg-white/5 text-white/70 hover:border-red-400/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingDown className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Fade</div>
                  <div className="text-sm opacity-80">$0.80</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Amount Input */}
        <div className="mb-6">
          <div className="text-sm text-white/60 mb-2">Amount</div>
          <div className="relative">
            <input
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-lg"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
              SOL
            </div>
          </div>
        </div>
        
        {/* Buy Button */}
        <button
          onClick={handleBuyShares}
          disabled={!selectedSide || !buyAmount || isBuying || !address}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
            selectedSide && buyAmount && address && !isBuying
              ? selectedSide === 'bullish'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isBuying ? 'Processing...' : address ? `Buy ${selectedSide || 'Shares'}` : 'Log in to buy'}
        </button>

        {/* Position Info */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-sm text-white/60 mb-2">Position</div>
          <div className="text-white font-semibold">$0.00 0 Shares</div>
          <div className="flex justify-between text-sm text-white/60 mt-2">
            <span>Trades</span>
            <span>Profit/Loss</span>
          </div>
          <div className="flex justify-between text-sm text-white mt-1">
            <span>0</span>
            <span>$0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
