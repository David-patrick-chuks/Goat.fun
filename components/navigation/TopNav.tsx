"use client";

import { navigationConfig } from '@/lib/data/navigation';
import Image from 'next/image';
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
      {/* Mobile Logo - only show on mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <Image
          src="/goatfun.png"
          alt="Goat Fun Logo"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span className="text-lg font-bold text-white">
          Goat
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Create Coin Button */}
        <Link
          href={navigationConfig.primaryAction.href}
          className="
            bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg
            hover:bg-yellow-400 transition-colors
          "
        >
          Create coin
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
      </div>
    </header>
  );
};

export default TopNav;
