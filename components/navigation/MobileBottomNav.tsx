"use client";

import { mobileBottomNavItems } from '@/lib/data/navigation';
import type { NavigationItem } from '@/lib/types/navigation';
import Link from 'next/link';
import React from 'react';

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
        flex items-center justify-center p-3 min-h-[60px] w-full
        transition-colors relative
        ${item.active ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}
      `}
    >
      <div className="relative">
        <span className="text-2xl">
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
    </Link>
  );

  return (
    <nav 
      className={`
        fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800
        flex items-center
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
