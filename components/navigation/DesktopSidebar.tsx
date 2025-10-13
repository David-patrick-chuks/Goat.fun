"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { navigationConfig, themeColors } from '@/lib/data/navigation';
import type { NavigationItem, NavigationGroup } from '@/lib/types/navigation';

interface DesktopSidebarProps {
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

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className = '' }) => {
  const renderNavigationItem = (item: NavigationItem) => (
    <Link
      key={item.id}
      href={item.href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        hover:bg-gray-800
        ${item.active ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'}
        ${item.isNew ? 'relative' : ''}
      `}
    >
      <span className="text-xl">{IconMap[item.icon] || '•'}</span>
      <span className="font-medium">{item.label}</span>
      {item.isNew && (
        <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
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

  const renderNavigationGroup = (group: NavigationGroup) => (
    <div key={group.id} className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
        {group.title}
      </h3>
      <nav className="space-y-1">
        {group.items.map(renderNavigationItem)}
      </nav>
    </div>
  );

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800
        flex flex-col z-40
        ${className}
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={navigationConfig.logo.src}
            alt={navigationConfig.logo.alt}
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-white">
            {navigationConfig.logo.text}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        {navigationConfig.navigation.map(renderNavigationGroup)}
      </div>

      {/* Primary Action Button */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href={navigationConfig.primaryAction.href}
          className="
            w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg
            flex items-center justify-center gap-2
            hover:bg-yellow-400 transition-colors
            text-center
          "
        >
          {navigationConfig.primaryAction.icon && (
            <span className="text-lg">
              {IconMap[navigationConfig.primaryAction.icon]}
            </span>
          )}
          {navigationConfig.primaryAction.label}
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <Image
            src={navigationConfig.user.avatar}
            alt={navigationConfig.user.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {navigationConfig.user.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              @{navigationConfig.user.username}
            </p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <span className="text-lg">⋯</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
