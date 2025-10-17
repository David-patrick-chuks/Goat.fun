"use client";

import { Search } from "lucide-react";
import React from "react";

interface SearchSectionProps {
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ className = "", onSearch }) => {
  const [query, setQuery] = React.useState("");

  const handleSearch = () => {
    onSearch?.(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div
      className={`
      mb-8  flex justify-center gap-2 items-center
      ${className}
    `}
    >
      <div className="relative  max-w-2xl ">
        <input
          type="text"
          placeholder="Search markets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="
    w-full bg-black border border-white/20 rounded-lg px-2 py-1 pl-10 pr-20
    text-white placeholder-white/50 focus:outline-none placeholder:[font-size:9px]
  "
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
      </div>
      <button
        onClick={handleSearch}
        className="
          bg-[#ffea00]  text-black px-2 py-1 flex items-center justify-center rounded 
          font-medium hover:bg-[#ffea00]/80 text-sm transition-colors
        "
      >
        Search
      </button>
    </div>
  );
};

export default SearchSection;
