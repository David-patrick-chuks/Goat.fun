"use client";

import type { Livestream } from '@/lib/data/livestreams';
import React from 'react';
import LivestreamCard from './LivestreamCard';
import LivestreamSkeleton from './LivestreamSkeleton';
import { io, Socket } from 'socket.io-client';
import type { Ack, BackendMarket } from '@/lib/types';

export default function LivestreamsContent() {
  const [includeNSFW, setIncludeNSFW] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [streams, setStreams] = React.useState<Livestream[]>([]);

  React.useEffect(() => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    const socket: Socket = io(url, { transports: ['websocket'] });
    setIsLoading(true);
    socket.emit('get_markets', {}, (res: Ack<BackendMarket[]>) => {
      setIsLoading(false);
      if (res?.ok && Array.isArray(res.data)) {
        const live = (res.data as BackendMarket[]).filter((m) => m.livestream?.isLive);
        const mapped: Livestream[] = live.map((m) => ({
          id: String(m._id),
          name: m.title,
          creator: m.creator,
          image: m.banner || '/goatfun.png',
          isLive: true,
          platform: 'GoatFun',
          marketCap: Math.floor((m.poolBalance ?? 0) + (m.bullishSupply ?? 0) + (m.fadeSupply ?? 0)),
          ath: m.creatorRevenue?.totalEarned ?? 0,
          viewers: m.livestream?.totalViews ?? undefined,
        }));
        setStreams(mapped);
      }
    });
    socket.on('stream_update', () => {
      socket.emit('get_markets', {}, (res: Ack<BackendMarket[]>) => {
        if (res?.ok && Array.isArray(res.data)) {
          const live = (res.data as BackendMarket[]).filter((m) => m.livestream?.isLive);
          const mapped: Livestream[] = live.map((m) => ({
            id: String(m._id),
            name: m.title,
            creator: m.creator,
            image: m.banner || '/goatfun.png',
            isLive: true,
            platform: 'GoatFun',
            marketCap: Math.floor((m.poolBalance ?? 0) + (m.bullishSupply ?? 0) + (m.fadeSupply ?? 0)),
            ath: m.creatorRevenue?.totalEarned ?? 0,
            viewers: m.livestream?.totalViews ?? undefined,
          }));
          setStreams(mapped);
        }
      });
    });
    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="px-4 py-8">
      {/* Header with NSFW Toggle */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Livestreams</h1>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Include nsfw:</span>
          <button
            onClick={() => setIncludeNSFW(!includeNSFW)}
            className="flex items-center gap-2 text-white hover:text-[#ffea00] transition-colors"
          >
            <span className={`text-sm ${includeNSFW ? 'text-[#ffea00]' : 'text-white/50'}`}>on</span>
            <span className={`text-sm ${!includeNSFW ? 'text-[#ffea00]' : 'text-white/50'}`}>off</span>
          </button>
        </div>
      </div>

      {/* Active Livestreams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          // Show skeleton loading
          Array.from({ length: 6 }).map((_, index) => (
            <LivestreamSkeleton key={index} />
          ))
        ) : (
          // Show actual livestreams
          streams.map((livestream) => (
            <LivestreamCard key={livestream.id} livestream={livestream} />
          ))
        )}
      </div>

   
    </div>
  );
}
