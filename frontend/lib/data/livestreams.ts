/**
 * Dummy data for livestreams
 */

export interface Livestream {
  id: string;
  name: string;
  creator: string;
  image: string;
  isLive: boolean;
  platform: string;
  marketCap: number;
  ath: number;
  viewers?: number;
}

export const livestreams: Livestream[] = [
  {
    id: '1',
    name: 'IRLTINDER',
    creator: '4Bumjexn',
    image: '/sample-irltinder.png',
    isLive: true,
    platform: 'PRISM Live',
    marketCap: 11300,
    ath: 41500,
    viewers: 42
  },
  {
    id: '2',
    name: 'LOLA',
    creator: 'D8JCoSKz',
    image: '/sample-lola.png',
    isLive: true,
    platform: 'PRISM Live',
    marketCap: 45500,
    ath: 50100,
    viewers: 28
  },
  {
    id: '3',
    name: 'dex paid',
    creator: 'FM1YCKED',
    image: '/sample-dexpaid.png',
    isLive: true,
    platform: 'PRISM Live',
    marketCap: 8000,
    ath: 19000,
    viewers: 15
  }
];

