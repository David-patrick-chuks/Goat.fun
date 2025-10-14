"use client";

import { useSidebar } from '@/lib/contexts/SidebarContext';
import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div 
      className={`transition-all duration-300 ${
        isCollapsed ? 'md:ml-16 md:w-[calc(100%-4rem)]' : 'md:ml-64 md:w-[calc(100%-16rem)]'
      }`}
    >
      {children}
    </div>
  );
};

export default ResponsiveLayout;
