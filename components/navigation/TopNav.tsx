"use client";

import { navigationConfig } from '@/lib/data/navigation';
import Link from 'next/link';
import React from 'react';

interface TopNavProps {
  className?: string;
}

const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 bg-black border-b border-gray-800
        flex items-center justify-between px-4 py-3
        z-30
        ${className}
      `}
    >
      {/* Logo - only show on mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-black text-sm font-bold">G</span>
        </div>
        <span className="text-lg font-bold text-white">
          Goat
        </span>
      </div>

      {/* Search Bar - center on desktop, full width on mobile */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search coins..."
            className="
              w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pr-20
              text-white placeholder-gray-400
              focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
              transition-colors
            "
          />
          <button className="
            absolute right-2 top-1/2 transform -translate-y-1/2
            bg-yellow-500 text-black px-4 py-1 rounded
            font-medium hover:bg-yellow-400 transition-colors
          ">
            Search
          </button>
        </div>
      </div>

      {/* Action Buttons - right side */}
      <div className="flex items-center gap-3">
        {/* Create Coin Button */}
        <Link
          href={navigationConfig.primaryAction.href}
          className="
            bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg
            hover:bg-yellow-400 transition-colors
            hidden sm:inline-flex items-center gap-2
          "
        >
          <span className="text-lg">➕</span>
          <span className="hidden md:inline">Create coin</span>
        </Link>

        {/* Log In Button */}
        <Link
          href={navigationConfig.secondaryAction.href}
          className="
            bg-transparent border border-gray-600 text-white px-4 py-2 rounded-lg
            hover:bg-gray-800 hover:border-gray-500 transition-colors
            font-medium
          "
        >
          Log in
        </Link>

        {/* Mobile Menu Button */}
        <button className="
          md:hidden text-gray-400 hover:text-white
          p-2
        ">
          <span className="text-xl">☰</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
