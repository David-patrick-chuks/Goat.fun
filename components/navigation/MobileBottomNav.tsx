"use client";

import React from 'react';
import Link from 'next/link';
import { mobileBottomNavItems, themeColors } from '@/lib/data/navigation';
import type { NavigationItem } from '@/lib/types/navigation';

interface MobileBottomNavProps {
  className?: string;
}

const IconMap: Record<string, string> = {
  home: '🏠',
  camera: '📹',
  chart: '📊',
  'message-circle': '💬',
  user: '👤',
  headphones: '🎧',
  'more-horizontal': '⋯',
  plus: '➕'
};

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ className = '' }) => {
  const renderNavItem = (item: NavigationItem) => (
    <Link
      key={item.id}
      href={item.href}
      className={`
        flex flex-col items-center justify-center gap-1 p-2 min-h-[60px]
        transition-colors
        ${item.active ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}
      `}
    >
      <div className="relative">
        <span className="text-xl">
          {IconMap[item.icon] || '•'}
        </span>
        {item.isNew && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 py-0.5 rounded-full font-bold">
            NEW
          </span>
        )}
        {item.badge && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 py-0.5 rounded-full font-bold">
            {item.badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium truncate">
        {item.label}
      </span>
    </Link>
  );

  return (
    <nav 
      className={`
        fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800
        flex items-center justify-around
        safe-area-pb
        z-50
        ${className}
      `}
    >
      {mobileBottomNavItems.map(renderNavItem)}
    </nav>
  );
};

export default MobileBottomNav;
