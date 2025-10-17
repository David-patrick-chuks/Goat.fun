/**
 * Dummy data for markets and trending items
 */

export interface Market {
  id: string;
  name: string;
  ticker: string;
  image: string;
  creator: string;
  createdAt: string;
  marketCap: number;
  priceChange: number;
  description?: string;
  replies?: number;
  livestream?: {
    isLive: boolean;
    streamKey?: string;
    playbackUrl?: string;
    roomName?: string;
  };
}

export const trendingMarkets: Market[] = [
  {
    id: '1',
    name: 'The Lion',
    ticker: 'LION',
    image: '/sample-lion.png',
    creator: 'LION',
    createdAt: '2d ago',
    marketCap: 4200000,
    priceChange: 600,
    replies: 317,
    description: 'LION Jumps 600% After Solana Mention on X'
  },
  {
    id: '2',
    name: 'Cap',
    ticker: 'CAP',
    image: '/sample-cap.png',
    creator: 'CAP',
    createdAt: '1d ago',
    marketCap: 1800000,
    priceChange: 150,
    replies: 89,
    description: 'X Users Bet A Anything with'
  },
  {
    id: '3',
    name: 'Telepath8',
    ticker: 'P8BCI',
    image: '/sample-telepath.png',
    creator: 'P8BCI',
    createdAt: '3d ago',
    marketCap: 950000,
    priceChange: -25,
    replies: 156
  },
  {
    id: '4',
    name: 'PUMPCADE',
    ticker: 'PUMPC',
    image: '/sample-pumpcade.png',
    creator: 'PUMPC',
    createdAt: '4d ago',
    marketCap: 2100000,
    priceChange: 320,
    replies: 203
  }
];

export const allMarkets: Market[] = [
  ...trendingMarkets,
  {
    id: '5',
    name: 'Portland Frog Brigade',
    ticker: 'PFB',
    image: '/sample-frog.png',
    creator: 'G3wr8B',
    createdAt: '18h ago',
    marketCap: 100100,
    priceChange: 18.27,
    description: 'Frogs with helmets and peace signs'
  },
  {
    id: '6',
    name: 'Capronius, the myth, the GOAT!',
    ticker: 'Capra',
    image: '/sample-goat.png',
    creator: '9t7s26',
    createdAt: '19h ago',
    marketCap: 20100,
    priceChange: 0,
    description: "Capra's pupils dilate—*"
  },
  {
    id: '7',
    name: 'The Elephant',
    ticker: 'ELEPHANT',
    image: '/sample-elephant.png',
    creator: '2v3CRz',
    createdAt: '2h ago',
    marketCap: 5800,
    priceChange: -12.5,
    description: 'the elephant is the undisputed heavyweight champion of the animal...'
  },
  {
    id: '8',
    name: 'RAT on GREEN',
    ticker: 'RAT',
    image: '/sample-rat.png',
    creator: 'EomWtx',
    createdAt: '2d ago',
    marketCap: 54200,
    priceChange: 16.75,
    description: "I'm the ONLY RAT on GREEN!"
  },
  {
    id: '9',
    name: 'JUSTICE FOR KOSTYA KUDO',
    ticker: 'Kostya',
    image: '/sample-kostya.png',
    creator: '5zwYG7',
    createdAt: '2d ago',
    marketCap: 37300,
    priceChange: -8.3
  },
  {
    id: '10',
    name: 'The Trencher',
    ticker: 'Trencher',
    image: '/sample-trencher.png',
    creator: 'B1ZBBF',
    createdAt: '2h ago',
    marketCap: 15800,
    priceChange: -26.66
  },
  {
    id: '11',
    name: 'Agent Nigga AI',
    ticker: 'agentnigga',
    image: '/sample-agent.png',
    creator: '4cRmY3',
    createdAt: '2d ago',
    marketCap: 23700,
    priceChange: -26.12,
    description: 'a nigga could architect a new financial primitive on chain and yall would still...'
  },
  {
    id: '12',
    name: 'tariffcoin',
    ticker: 'tariffcoin',
    image: '/sample-tariff.png',
    creator: 'HYSq1K',
    createdAt: '2d ago',
    marketCap: 187100,
    priceChange: 0.69
  },
  {
    id: '13',
    name: 'AI6900',
    ticker: 'AI6900',
    image: '/sample-ai6900.png',
    creator: 'D8evp1',
    createdAt: '2h ago',
    marketCap: 468100,
    priceChange: 6.94,
    description: 'AI6900 began as a thought experiment: what happens when we train a token to...'
  },
  {
    id: '14',
    name: 'xexamai',
    ticker: 'XEXAI',
    image: '/sample-xexamai.png',
    creator: 'FJGYT2',
    createdAt: '2d ago',
    marketCap: 54200,
    priceChange: -1.67
  }
];

export const filterOptions = {
  sort: [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'trending', label: 'Trending' },
    { value: 'market_cap', label: 'Market Cap' }
  ],
  animations: true,
  includeNSFW: true
};
