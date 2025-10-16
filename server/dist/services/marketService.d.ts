import type { MarketDoc } from "../types/models";
import type { JoinMarketPayload, Side } from "../types/socket";
export declare function computePriceFromSupply(supply: number): number;
export declare function createMarket(input: {
    creator: string;
    title: string;
    ticker: string;
    description?: string;
    media?: string;
    banner?: string;
    socialLinks?: string[];
    durationHours: number;
}): Promise<MarketDoc>;
export declare function joinMarket(payload: JoinMarketPayload): Promise<MarketDoc>;
export declare function endMarket(marketId: string, finalResult?: Side | "none"): Promise<MarketDoc>;
export declare function listActiveMarkets(): Promise<(import("mongoose").FlattenMaps<MarketDoc> & Required<{
    _id: import("mongoose").FlattenMaps<unknown>;
}> & {
    __v: number;
})[]>;
export declare function getMarketDetail(marketId: string): Promise<(import("mongoose").FlattenMaps<MarketDoc> & Required<{
    _id: import("mongoose").FlattenMaps<unknown>;
}> & {
    __v: number;
}) | null>;
export declare function isExpired(market: MarketDoc): boolean;
//# sourceMappingURL=marketService.d.ts.map