"use client";

import { useMarketData } from "@/hooks/useMarketData";
import { useAccount } from "wagmi";
import CommentsSection from "./CommentsSection";
import MarketHeader from "./MarketHeader";
import MarketHolders from "./MarketHolders";
import MarketLivestream from "./MarketLivestream";
import MarketTrading from "./MarketTrading";

interface MarketPageProps {
  marketId: string;
}

export default function MarketPage({ marketId }: MarketPageProps) {
  const { address } = useAccount();
  const { market, isStreamer, holders, priceHistory } = useMarketData(marketId, address);

  if (!market) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading market...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <MarketHeader market={market} isStreamer={isStreamer} address={address} />
      
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trading & Livestream */}
          <div className="lg:col-span-2 space-y-6">
            {/* Livestream Section */}
            <MarketLivestream 
              market={market} 
              marketId={marketId} 
              address={address} 
              isStreamer={isStreamer} 
            />
            
            {/* Trading Section */}
            <MarketTrading 
              market={market} 
              marketId={marketId} 
              address={address} 
              holders={holders}
              priceHistory={priceHistory}
            />
          </div>
          
          {/* Right Column - Comments & Holders */}
          <div className="space-y-6">
            {/* Comments Section */}
            <div className="bg-gray-900 rounded-xl">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold">Comments</h3>
              </div>
              <div className="p-4">
                <CommentsSection marketId={marketId} address={address} />
              </div>
            </div>
            
            {/* Holders Section */}
            <MarketHolders holders={holders} />
          </div>
        </div>
      </div>
    </div>
  );
}
