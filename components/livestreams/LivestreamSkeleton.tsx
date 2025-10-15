"use client";

import React from 'react';

interface LivestreamSkeletonProps {
  className?: string;
}

const LivestreamSkeleton: React.FC<LivestreamSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`
      bg-black rounded-lg border border-white/10 animate-pulse
      ${className}
    `}>
      {/* Image skeleton */}
      <div className="w-full aspect-video bg-white/10 rounded-t-lg"></div>

    </div>
  );
};

export default LivestreamSkeleton;
