"use client";

import { Search } from "lucide-react";
import React from "react";

interface SearchSectionProps {
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ className = "", onSearch }) => {
  const [query, setQuery] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Real-time search - call onSearch immediately as user types
    onSearch?.(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(query);
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
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="
    w-full bg-black border border-white/20 rounded-lg px-2 py-1 pl-10 pr-4
    text-white placeholder-white/50 focus:outline-none placeholder:[font-size:9px]
  "
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
      </div>
    </div>
  );
};

export default SearchSection;
