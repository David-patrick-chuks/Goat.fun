"use client";

import { ChevronDown, Flame } from 'lucide-react';
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
      <div className="flex items-center gap-8">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort markets by"
            className="
              bg-black border border-white/20 rounded-lg px-3 py-2 pr-8 pl-8
              text-white appearance-none cursor-pointer text-sm
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
             className="flex items-center gap-2 text-white hover:text-[#ffea00] transition-colors"
           >
             <span className={`text-sm ${showAnimations ? 'text-[#ffea00]' : 'text-white/50'}`}>on</span>
             <span className={`text-sm ${!showAnimations ? 'text-[#ffea00]' : 'text-white/50'}`}>off</span>
           </button>
         </div>

         {/* Include NSFW Toggle */}
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
    </div>
  );
};

export default FilterSection;
