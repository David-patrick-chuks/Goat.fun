"use client";

import { config } from "@/hooks/wagmi";
import { getSocket } from "@/lib/socket";
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
  useEffect(() => {
    const socket = getSocket();
    // Always connect to socket, but only emit user_connect if wallet is connected
    if (isConnected && address) {
      socket.emit(
        "user_connect",
        { wallet: address },
        (res: { ok?: boolean; error?: unknown }) => {
          if (!res?.ok)
            console.error("[fe][socket] user_connect error", res?.error);
        }
      );
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
