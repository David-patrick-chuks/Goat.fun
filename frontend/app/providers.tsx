'use client';

import type React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { darkTheme, DisclaimerComponent, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from "@/hooks/wagmi";
const queryClient = new QueryClient();


const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{' '}
    <Link href="https://termsofservice.xyz">Terms of Service</Link> and
    acknowledge you have read and understand the protocol{' '}
    <Link href="https://disclaimer.xyz">Disclaimer</Link>
  </Text>
);
export function Providers({ children }: { children: React.ReactNode }) {


  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={darkTheme()}  
        appInfo={{
        appName: 'GoatFun',
        learnMoreUrl: 'https://goatfunn.vercel.app',
        disclaimer: Disclaimer,
      }}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
