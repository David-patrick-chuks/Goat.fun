"use client";

import { navigationConfig } from '@/lib/data/navigation';
import type { NavigationGroup, NavigationItem } from '@/lib/types/navigation';
import {
  BarChart3,
  ChevronRight,
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

interface DesktopSidebarProps {
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

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className = '' }) => {
  const renderNavigationItem = (item: NavigationItem) => {
    const IconComponent = IconMap[item.icon];
    
    return (
      <Link
        key={item.id}
        href={item.href}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
          hover:bg-gray-800
          ${item.active ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white'}
          ${item.isNew ? 'relative' : ''}
        `}
      >
        {IconComponent && <IconComponent className="w-5 h-5" />}
        <span className="font-medium">{item.label}</span>
        {item.isNew && (
          <span className="ml-auto bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
            NEW
          </span>
        )}
        {item.badge && (
          <span className="ml-auto bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderNavigationGroup = (group: NavigationGroup) => (
    <div key={group.id} className="mb-2">
      <nav className="space-y-1">
        {group.items.map(renderNavigationItem)}
      </nav>
    </div>
  );

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800
        flex flex-col z-40
        ${className}
      `}
    >
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black text-sm font-bold">G</span>
            </div>
            <span className="text-xl font-bold text-white">
              Goat
            </span>
          </Link>
          {/* Collapse Icon */}
          <button className="text-gray-400 hover:text-white p-1">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 overflow-y-auto">
        {navigationConfig.navigation.map(renderNavigationGroup)}
      </div>

      {/* Primary Action Button - Circular */}
      <div className="p-6 flex justify-center">
        <Link
          href={navigationConfig.primaryAction.href}
          className="
            w-12 h-12 bg-yellow-500 text-black font-bold rounded-full
            flex items-center justify-center
            hover:bg-yellow-400 transition-colors
          "
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
