"use client";

import {  livestreams } from '@/lib/data/livestreams';
import React from 'react';
import LivestreamCard from './LivestreamCard';
import LivestreamSkeleton from './LivestreamSkeleton';

export default function LivestreamsContent() {
  const [includeNSFW, setIncludeNSFW] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
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
          livestreams.map((livestream) => (
            <LivestreamCard key={livestream.id} livestream={livestream} />
          ))
        )}
      </div>

   
    </div>
  );
}
