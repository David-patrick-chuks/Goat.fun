"use client";

import { mobileBottomNavItems } from '@/lib/data/navigation';
import type { NavigationItem } from '@/lib/types/navigation';
import {
    BarChart3,
    Headphones,
    Home,
    MessageCircle,
    MoreHorizontal,
    Plus,
    User,
    Video
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface MobileBottomNavProps {
  className?: string;
}

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  camera: Video,
  chart: BarChart3,
  'message-circle': MessageCircle,
  user: User,
  headphones: Headphones,
  'more-horizontal': MoreHorizontal,
  plus: Plus
};

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ className = '' }) => {
  const renderNavItem = (item: NavigationItem) => {
    const IconComponent = IconMap[item.icon];
    
    return (
      <Link
        key={item.id}
        href={item.href}
        className={`
          flex items-center justify-center p-3 min-h-[60px] w-full
          transition-colors relative
          ${item.active ? 'text-[#ffea00]' : 'text-gray-400 hover:text-white'}
        `}
      >
        <div className="relative">
          {IconComponent && <IconComponent className="w-6 h-6" />}
          {item.isNew && (
            <span className="absolute -top-1 -right-1 bg-[#ffea00] text-black text-xs px-1 py-0.5 rounded-full font-bold">
              NEW
            </span>
          )}
          {item.badge && (
            <span className="absolute -top-1 -right-1 bg-[#ffea00] text-black text-xs px-1 py-0.5 rounded-full font-bold">
              {item.badge}
            </span>
          )}
        </div>
      </Link>
    );
  };

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
