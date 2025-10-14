"use client";

import CoinCard from "@/components/home/CoinCard";
import FilterSection from "@/components/home/FilterSection";
import SearchSection from "@/components/home/SearchSection";
import TrendingSection from "@/components/home/TrendingSection";
import { allCoins, trendingCoins } from "@/lib/data/coins";

export default function MainContent() {
  return (
    <div className="px-4 py-8">
      <SearchSection />
      <TrendingSection coins={trendingCoins} />
      
      <FilterSection />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCoins.map((coin) => (
          <CoinCard key={coin.id} coin={coin} />
        ))}
      </div>
    </div>
  );
}
