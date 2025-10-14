"use client";

import { useSidebar } from '@/lib/contexts/SidebarContext';
import { navigationConfig } from '@/lib/data/navigation';
import type { NavigationGroup, NavigationItem } from '@/lib/types/navigation';
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Headphones,
    Home,
    MessageCircle,
    MoreVertical,
    User,
    Video
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface DesktopSidebarProps {
  className?: string;
}

const IconMap: Record<string, React.ComponentType<{ className?: string; fill?: string }>> = {
  home: Home,
  camera: Video,
  chart: BarChart3,
  'message-circle': MessageCircle,
  user: User,
  headphones: Headphones,
  'more-horizontal': MoreVertical
};

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className = '' }) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const moreMenuRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const renderNavigationItem = (item: NavigationItem) => {
    const IconComponent = IconMap[item.icon];
    const isMoreItem = item.id === 'more';
    const isActive = pathname === item.href;
    
    if (isMoreItem) {
      return (
        <div key={item.id} className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`
              w-full flex items-center rounded-lg transition-colors
              hover:bg-white/5
              ${isActive ? 'bg-black text-[#ffea00]' : 'text-white/70 hover:text-white'}
              ${item.isNew ? 'relative' : ''}
              ${isCollapsed ? 'flex-col justify-center px-2 py-1' : 'gap-3 px-4 py-3'}
            `}
            title={isCollapsed ? undefined : item.label}
          >
            <div className="relative">
              {IconComponent && <IconComponent className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />}
              {item.isNew && isCollapsed && (
                <span className="absolute -top-1 -right-1 bg-[#ffea00] text-black text-[8px] px-1 py-0.5 rounded-full font-bold">
                  NEW
                </span>
              )}
              {item.badge && isCollapsed && (
                <span className="absolute -top-1 -right-1 bg-[#ffea00] text-black text-xs px-1 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            {isCollapsed && (
              <span className={`text-xs mt-1 text-center leading-tight ${isActive ? 'text-[#ffea00]' : 'text-white/70'}`}>
                {item.label}
              </span>
            )}
            {!isCollapsed && <span className={`${isActive ? 'text-[#ffea00]' : 'text-white/70'}`}>{item.label}</span>}
            {item.isNew && !isCollapsed && (
              <span className="ml-auto bg-[#ffea00] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                NEW
              </span>
            )}
            {item.badge && !isCollapsed && (
              <span className="ml-auto bg-[#ffea00] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </button>
          
          {/* More Menu Popup */}
          {showMoreMenu && (
            <div className="fixed left-16 bottom-8 w-64 bg-black border border-white/20 rounded-lg shadow-xl z-[60]">
              <div className="p-2">
                <Link href="/livestream-policy" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors">
                  Livestream policy
                </Link>
                <Link href="/dmca-policy" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors">
                  DMCA policy
                </Link>
                <Link href="/trademark-guidelines" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors">
                  Trademark guidelines
                </Link>
                <Link href="/how-it-works" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors">
                  How it works
                </Link>
                <div className="border-t border-white/10 my-2"></div>
                <div className="flex items-center justify-center gap-4 px-4 py-2">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <Link
        key={item.id}
        href={item.href}
        className={`
          flex items-center rounded-lg transition-colors
          hover:bg-white/5
          ${isActive ? 'bg-black' : ''}
          ${item.isNew ? 'relative' : ''}
          ${isCollapsed ? 'flex-col justify-center px-2 py-1' : 'gap-3 px-4 py-3'}
        `}
        title={isCollapsed ? undefined : item.label}
      >
        <div className="relative">
          {IconComponent && (
            <IconComponent 
              className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"} ${isActive ? 'text-[#ffea00] fill-[#ffea00]' : 'text-white/70'}`}
              fill={isActive ? 'currentColor' : 'none'}
            />
          )}
          {item.isNew && isCollapsed && (
            <span className="absolute -top-1 -right-1 bg-[#ffea00] text-black text-[8px] px-1 py-0.5 rounded-full font-bold">
              NEW
            </span>
          )}
          {item.badge && isCollapsed && (
            <span className="absolute -top-1 -right-1 bg-[#ffea00] text-black text-xs px-1 py-0.5 rounded-full font-bold">
              {item.badge}
            </span>
          )}
        </div>
        {isCollapsed && (
          <span className={`text-xs mt-1 text-center leading-tight ${isActive ? 'text-[#ffea00]' : 'text-white/70'}`}>
            {item.label}
          </span>
        )}
        {!isCollapsed && (
          <span className={`${isActive ? 'text-[#ffea00]' : 'text-white/70'}`}>
            {item.label}
          </span>
        )}
        {item.isNew && !isCollapsed && (
          <span className="ml-auto bg-[#ffea00] text-black text-xs px-2 py-0.5 rounded-full font-bold">
            NEW
          </span>
        )}
        {item.badge && !isCollapsed && (
          <span className="ml-auto bg-[#ffea00] text-black text-xs px-2 py-0.5 rounded-full font-bold">
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
        fixed left-0 top-0 h-screen bg-black border-r border-white/10
        flex flex-col z-50 transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
    >
      {/* Logo */}
      <div className={`${isCollapsed ? "p-4" : "p-6"}`}>
        <div className={`flex items-center justify-between ${isCollapsed ? "flex-col" : "flex-row" }`}>
          <Link href="/" className="flex items-center gap-3">
            <img
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
          {/* Collapse Button */}
          <button 
            className="text-white/50 hover:text-white p-1 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
      <div className={`flex-1 ${isCollapsed ? "px-2" : "px-4" } overflow-y-auto`}>
        {navigationConfig.navigation.map(renderNavigationGroup)}
      </div>

      {/* Primary Action Button */}
      <div className={`${isCollapsed ? "p-4" : "p-6"} flex justify-center`}>
        <Link
          href={navigationConfig.primaryAction.href}
          className="
            bg-[#ffea00] text-black font-bold rounded-lg
            flex items-center justify-center
            hover:bg-[#ffea00] transition-colors
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
