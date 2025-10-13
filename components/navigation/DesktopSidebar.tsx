"use client";

import { navigationConfig } from '@/lib/data/navigation';
import type { NavigationGroup, NavigationItem } from '@/lib/types/navigation';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Home,
  MessageCircle,
  MoreHorizontal,
  User,
  Video
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

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
  'more-horizontal': MoreHorizontal
};

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          ${isCollapsed ? 'justify-center' : ''}
        `}
        title={isCollapsed ? item.label : undefined}
      >
        {IconComponent && <IconComponent className="w-5 h-5" />}
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
        {item.isNew && !isCollapsed && (
          <span className="ml-auto bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
            NEW
          </span>
        )}
        {item.badge && !isCollapsed && (
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
        fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800
        flex flex-col z-40 transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
    >
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/goatfun.png"
              alt="Goat Fun Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            {!isCollapsed && (
              <span className="text-xl font-bold text-white">
                Goat.fun
              </span>
            )}
          </Link>
          {/* Collapse Icon */}
          <button 
            className="text-gray-400 hover:text-white p-1"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 overflow-y-auto">
        {navigationConfig.navigation.map(renderNavigationGroup)}
      </div>

      {/* Primary Action Button */}
      <div className="p-6 flex justify-center">
        <Link
          href={navigationConfig.primaryAction.href}
          className="
            bg-yellow-500 text-black font-bold rounded-lg
            flex items-center justify-center
            hover:bg-yellow-400 transition-colors
            ${isCollapsed ? 'w-10 h-10 rounded-full' : 'px-4 py-2'}
          "
          title={isCollapsed ? 'Create coin' : undefined}
        >
          {isCollapsed ? (
            <span className="text-lg">+</span>
          ) : (
            <span>Create coin</span>
          )}
        </Link>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
