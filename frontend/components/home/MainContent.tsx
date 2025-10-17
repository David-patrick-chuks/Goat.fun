"use client";

import FilterSection from "@/components/home/FilterSection";
import MarketCard from "@/components/home/MarketCard";
import SearchSection from "@/components/home/SearchSection";
import TrendingSection from "@/components/home/TrendingSection";
import type { Market } from "@/lib/data/markets";
import type { Ack, BackendMarket } from "@/lib/types";
import React from "react";
import { io, Socket } from "socket.io-client";

export default function MainContent() {
  const [markets, setMarkets] = React.useState<Market[]>([]);
  const [trending, setTrending] = React.useState<Market[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [sort, setSort] = React.useState<"newest" | "trending" | "market_cap">("newest");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");

  // Debounce search query to avoid too many requests
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const socket: Socket = io(url, { transports: ["websocket"] });

    const load = (reset = true) => {
      setLoading(true);
      socket.emit("get_markets", { page, limit: 12, sort, search: debouncedSearchQuery }, (res: Ack<{ items: BackendMarket[]; total: number; page: number; limit: number }>) => {
        setLoading(false);
        if (res?.ok && res.data && Array.isArray(res.data.items)) {
        // Map backend market shape to UI Market shape minimally
          const mapped: Market[] = res.data.items.map((m) => ({
          id: String(m._id),
          name: m.title,
          ticker: m.ticker,
          image: m.banner || "/goatfun.png",
          creator: m.creator,
          createdAt: new Date(m.createdAt || Date.now()).toLocaleDateString(),
          marketCap: Math.floor((m.poolBalance ?? 0) + (m.bullishSupply ?? 0) + (m.fadeSupply ?? 0)),
          priceChange: 0,
          description: m.description,
          livestream: m.livestream ? {
            isLive: m.livestream.isLive,
            streamKey: m.livestream.streamKey,
            playbackUrl: m.livestream.playbackUrl,
            roomName: m.livestream.roomName
          } : undefined
        }));
        setMarkets((prev) => (reset ? mapped : [...prev, ...mapped]));
        setTrending((reset ? mapped.slice(0, 10) : trending));
        console.log(`Loaded ${mapped.length} markets, total: ${res.data.total}`);
      } else {
        console.error('Failed to load markets:', res?.error);
        setMarkets([]);
        setTrending([]);
      }
      });
    };
    load(true);

    socket.on("market_created", () => {
      socket.emit("get_markets", { page: 1, limit: 12, sort }, (res: Ack<{ items: BackendMarket[]; total: number; page: number; limit: number }>) => {
        if (res?.ok && res.data && Array.isArray(res.data.items)) {
          const mapped: Market[] = res.data.items.map((m) => ({
            id: String(m._id),
            name: m.title,
            ticker: m.ticker,
            image: m.banner || "/goatfun.png",
            creator: m.creator,
            createdAt: new Date(m.createdAt || Date.now()).toLocaleDateString(),
            marketCap: Math.floor((m.poolBalance ?? 0) + (m.bullishSupply ?? 0) + (m.fadeSupply ?? 0)),
            priceChange: 0,
            description: m.description,
            livestream: m.livestream ? {
              isLive: m.livestream.isLive,
              streamKey: m.livestream.streamKey,
              playbackUrl: m.livestream.playbackUrl,
              roomName: m.livestream.roomName
            } : undefined
          }));
          setMarkets(mapped);
          setTrending(mapped.slice(0, 10));
        }
      });
    });

    return () => { socket.disconnect(); };
  }, [page, sort, debouncedSearchQuery]);

  return (
    <div className="px-4 py-8">
      <SearchSection onSearch={setSearchQuery} />
      <TrendingSection markets={trending} />
      
      <FilterSection />
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-white/70 text-sm">
          {searchQuery ? `Search results for "${searchQuery}" (${markets.length} markets)` : `Sort:`}
        </div>
        <div className="flex gap-2">
          {(["newest","trending","market_cap"] as const).map((s) => (
            <button key={s} onClick={() => { setPage(1); setSort(s); }} className={`px-3 py-1 rounded border text-xs ${sort===s?"border-[#ffea00] text-white":"border-white/20 text-white/70"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      {markets.length === 0 && searchQuery && (
        <div className="text-center text-white/60 py-8">
          No markets found for "{searchQuery}"
        </div>
      )}

      {!searchQuery && (
        <div className="flex justify-center mt-6">
          <button disabled={loading} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded border border-white/20 text-white/80 disabled:opacity-50">{loading?"Loading…":"Load more"}</button>
        </div>
      )}
    </div>
  );
}
