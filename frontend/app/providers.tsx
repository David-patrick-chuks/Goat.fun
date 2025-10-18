"use client";

import { config } from "@/hooks/wagmi";
import { emitUserConnect, getSocket, handleWalletDisconnect } from "@/lib/socket";
import {
  darkTheme,
  DisclaimerComponent,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { useEffect } from "react";
import { useAccount, WagmiProvider } from "wagmi";

function useSocketInit(): void {
  const { address, isConnected } = useAccount();
  
  // Initialize socket connection once
  useEffect(() => {
    const socket = getSocket();
    console.log(`[fe][socket] Socket initialized`);
    
    const handleConnect = () => {
      console.log(`[fe][socket] Socket connected with ID: ${socket.id}`);
      // If wallet is already connected when socket connects, emit user_connect
      if (isConnected && address) {
        emitUserConnect(address);
      }
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    return () => {
      socket.off('connect', handleConnect);
    };
  }, []); // Only run once

  // Handle wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      console.log(`[fe][socket] Wallet connected: ${address}`);
      emitUserConnect(address);
    } else if (!isConnected) {
      console.log(`[fe][socket] Wallet disconnected`);
      handleWalletDisconnect();
    }
  }, [isConnected, address]);
}
const queryClient = new QueryClient();

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{" "}
    <Link href="https://termsofservice.xyz">Terms of Service</Link> and
    acknowledge you have read and understand the protocol{" "}
    <Link href="https://disclaimer.xyz">Disclaimer</Link>
  </Text>
);
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme()}
          appInfo={{
            appName: "GoatFun",
            learnMoreUrl: "https://goatfunn.vercel.app",
            disclaimer: Disclaimer,
          }}
        >
          <SocketInit />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function SocketInit() { useSocketInit(); return null; }
