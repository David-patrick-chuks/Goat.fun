"use client";

import FilterSection from "@/components/home/FilterSection";
import MarketCard from "@/components/home/MarketCard";
import SearchSection from "@/components/home/SearchSection";
import TrendingSection from "@/components/home/TrendingSection";
import { allMarkets, trendingMarkets } from "@/lib/data/markets";

export default function MainContent() {
  return (
    <div className="px-4 py-8">
      <SearchSection />
      <TrendingSection markets={trendingMarkets} />
      
      <FilterSection />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allMarkets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
}
