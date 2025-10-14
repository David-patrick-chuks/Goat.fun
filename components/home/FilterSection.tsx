"use client";

import { ChevronDown, Flame, ToggleLeft, ToggleRight } from 'lucide-react';
import React from 'react';

interface FilterSectionProps {
  className?: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({ className = '' }) => {
  const [sortBy, setSortBy] = React.useState('featured');
  const [showAnimations, setShowAnimations] = React.useState(true);
  const [includeNSFW, setIncludeNSFW] = React.useState(true);

  return (
    <div className={`
      mb-8
      ${className}
    `}>
      <div className="flex items-center gap-6">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="
              bg-black border border-white/20 rounded-lg px-4 py-2 pr-8
              text-white appearance-none cursor-pointer
              focus:outline-none focus:border-[#ffea00]
            "
          >
            <option value="featured">sort: featured</option>
            <option value="newest">sort: newest</option>
            <option value="trending">sort: trending</option>
            <option value="market_cap">sort: market cap</option>
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-white/50" />
          </div>
          <Flame className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ffea00]" />
        </div>

        {/* Show Animations Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Show animations:</span>
          <button
            onClick={() => setShowAnimations(!showAnimations)}
            className="flex items-center gap-1 text-white hover:text-[#ffea00] transition-colors"
          >
            {showAnimations ? (
              <>
                <span className="text-[#ffea00]">on</span>
                <ToggleRight className="w-4 h-4 text-[#ffea00]" />
              </>
            ) : (
              <>
                <span className="text-white/50">off</span>
                <ToggleLeft className="w-4 h-4 text-white/50" />
              </>
            )}
          </button>
        </div>

        {/* Include NSFW Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Include nsfw:</span>
          <button
            onClick={() => setIncludeNSFW(!includeNSFW)}
            className="flex items-center gap-1 text-white hover:text-[#ffea00] transition-colors"
          >
            {includeNSFW ? (
              <>
                <span className="text-[#ffea00]">on</span>
                <ToggleRight className="w-4 h-4 text-[#ffea00]" />
              </>
            ) : (
              <>
                <span className="text-white/50">off</span>
                <ToggleLeft className="w-4 h-4 text-white/50" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
