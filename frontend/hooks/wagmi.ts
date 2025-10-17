"use client"

import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

import {
  bsc,
  bscTestnet,
} from 'wagmi/chains';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, metaMaskWallet],
    },
    {
      groupName: 'Others',
      wallets: [coinbaseWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'GoatFun',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  }
);
export const config = getDefaultConfig({
  connectors,
  appName: 'GoatFun',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  chains: [
    bsc, // Mainnet BSC as primary
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [bscTestnet] : []),
  ],
  ssr: true,
});