"use client";

import React from "react";
import { getSocket } from "@/lib/socket";
import type { Ack, BackendMarket } from "@/lib/types";

export function useMarketData(marketId: string | null, address: string | undefined) {
  const [market, setMarket] = React.useState<BackendMarket | null>(null);
  const [isStreamer, setIsStreamer] = React.useState<boolean>(false);
  const [holders, setHolders] = React.useState<{ wallet: string; side: 'bullish' | 'fade'; shares: number; price: number; timestamp: Date }[]>([]);
  const [priceHistory, setPriceHistory] = React.useState<{ timestamp: Date; bullishPrice: number; fadePrice: number }[]>([]);
  const marketCreatorRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!marketId) return;
    const socket = getSocket();
    
    const fetchMarketDetails = () => {
      socket.emit("get_market_detail", { marketId }, (res: Ack<BackendMarket>) => {
        if (res?.ok && res.data) {
          setMarket(res.data);
          marketCreatorRef.current = res.data.creator;
          // Check if current user is the streamer
          setIsStreamer(res.data.creator === address);
        }
      });
    };

    fetchMarketDetails();

    // Load holders data from server
    socket.emit('get_holders', { marketId, limit: 20 }, (res: Ack<{ wallet: string; side: 'bullish' | 'fade'; shares: number; price: number; timestamp: Date }[]>) => {
      if (res?.ok && Array.isArray(res.data)) {
        setHolders(res.data);
      }
    });

    // Load price history from server
    socket.emit('get_price_history', { marketId, limit: 100 }, (res: Ack<{ timestamp: Date; bullishPrice: number; fadePrice: number }[]>) => {
      if (res?.ok && Array.isArray(res.data)) {
        setPriceHistory(res.data);
      }
    });

    socket.on("stream_update", (data: { marketId: string; isLive: boolean }) => {
      if (data.marketId === marketId) {
        // Only refresh market details, don't call fetchMarketDetails to avoid infinite loop
        socket.emit("get_market_detail", { marketId }, (res: Ack<BackendMarket>) => {
          if (res?.ok && res.data) {
            setMarket(res.data);
          }
        });
      }
    });

    return () => {
      socket.off("stream_update");
    };
  }, [marketId, address]);

  return {
    market,
    isStreamer,
    holders,
    setHolders,
    priceHistory,
    setPriceHistory,
    marketCreatorRef
  };
}
