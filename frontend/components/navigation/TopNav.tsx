"use client";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useSidebar } from "@/lib/contexts/SidebarContext";
import { navigationConfig } from "@/lib/data/navigation";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from '@rainbow-me/rainbowkit';
import { disconnect } from '@wagmi/core'
import { config } from '@/hooks/wagmi';
interface TopNavProps {
  className?: string;
}

const TopNav: React.FC<TopNavProps> = ({ className = "" }) => {
  const { isCollapsed } = useSidebar();
   const { isConnected } = useAccount();
   
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  const handledisconnect = async () => {
    await disconnect(config)
  }
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
       {openConnectModal && (
        <h1 onClick={openConnectModal} >
          Open Connect Modal
        </h1>
      )}

{openChainModal && (
  <h1 onClick={openChainModal} >
    Open Chain Modal
  </h1>
)}
      {openAccountModal && (
        <h1 onClick={openAccountModal} >
          Open Account Modal
        </h1>
      )}

        <h1 onClick={() => handledisconnect()} >
          disconnect
        </h1>
             <ConnectButton 
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
            chainStatus="icon"
          />
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
        {/* Create Market Button */}
        <Link
          href={navigationConfig.primaryAction.href}
          className="
            bg-[#ffea00] text-sm font-medium px-2 py-1 rounded-lg
            hover:bg-[#ffea00] transition-colors 
          "
        >
          <span className="text-black">Create market</span>
        </Link>

        {/* Log In Button */}
        <Link
          href={navigationConfig.secondaryAction.href}
          className="
            bg-[#ffea00] text-sm font-medium px-2 py-1 rounded-lg
            hover:bg-[#ffea00] transition-colors
          "
        >
          <span className="text-black">Log in</span>
        </Link>
      </div>
    </header>
  );
};

export default TopNav;
