"use client"

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  base,
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'GoatFun',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    // customChain, // Add your custom chain
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),

    // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [customChain] : []),
  ],
  ssr: true,
});