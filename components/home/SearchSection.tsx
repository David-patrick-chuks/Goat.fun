"use client";

import React from 'react';
import { Search } from 'lucide-react';

interface SearchSectionProps {
  className?: string;
}

const SearchSection: React.FC<SearchSectionProps> = ({ className = '' }) => {
  return (
    <div className={`
      mb-8
      ${className}
    `}>
      <div className="relative max-w-2xl">
        <input
          type="text"
          placeholder="Search coins..."
          className="
            w-full bg-black border border-white/20 rounded-lg px-4 py-3 pl-12
            text-white placeholder-white/50
            focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
            transition-colors
          "
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <button className="
          absolute right-2 top-1/2 transform -translate-y-1/2
          bg-yellow-500 text-black px-4 py-2 rounded
          font-medium hover:bg-yellow-400 transition-colors
        ">
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchSection;
