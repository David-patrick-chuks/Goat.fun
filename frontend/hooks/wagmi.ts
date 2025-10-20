"use client"

import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import type { Chain } from 'wagmi/chains';

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

const GOATTestnet3 = {
      id: '48816', // 48816 in hexadecimal
        name: 'GOAT Testnet3',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/38494.png',
  iconBackground: '#000000ff',
  nativeCurrency: {
          name: 'Bitcoin',
          symbol: 'BTC',
          decimals: 18
        },
  rpcUrls: {
    default: { http: ['https://rpc.testnet3.goat.network'] },
  },
   blockExplorers: {
    default: {
      name: 'Custom Explorer',
      url: 'https://explorer.testnet3.goat.network', // Replace with your block explorer URL
    },
  },
} as const satisfies Chain;
export const config = getDefaultConfig({
  connectors,
  appName: 'GoatFun',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  chains: [
    GOATTestnet3,
  ],
  ssr: true,
});