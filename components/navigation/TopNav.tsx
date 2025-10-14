"use client";

import { navigationConfig } from "@/lib/data/navigation";
import { useSidebar } from "@/lib/contexts/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface TopNavProps {
  className?: string;
}

const TopNav: React.FC<TopNavProps> = ({ className = "" }) => {
  const { isCollapsed } = useSidebar();
  
  return (
    <header
      className={`
        fixed top-0 left-0 right-0 bg-black
        flex items-center justify-between px-4 py-3
        transition-all duration-300 z-30
        ${isCollapsed ? 'md:left-16' : 'md:left-64'}
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
        <span className="text-lg font-bold text-white">Goat</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Create Coin Button */}
        <Link
          href={navigationConfig.primaryAction.href}
          className="
            bg-yellow-500 text-sm font-medium px-2 py-2 rounded-lg
            hover:bg-yellow-400 transition-colors 
          "
        >
          <span className="text-black">Create coin</span>
        </Link>

        {/* Log In Button */}
        <Link
          href={navigationConfig.secondaryAction.href}
          className="
            bg-yellow-500 text-sm font-medium px-2 py-2 rounded-lg
            hover:bg-yellow-400 transition-colors
          "
        >
          <span className="text-black">Log in</span>
        </Link>
      </div>
    </header>
  );
};

export default TopNav;
