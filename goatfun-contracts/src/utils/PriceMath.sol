// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PriceMath
 * @notice Fixed-point arithmetic utilities for bonding curve pricing
 * @dev All prices use 1e18 scaling for precision
 */
library PriceMath {
    // We operate in raw token wei units (no implicit scaling)
    // Dividends in MarketPair still use 1e18 scale for per-share accounting.
    uint256 public constant MAX_SAFE_INTEGER = type(uint128).max;

    /**
     * @notice Calculate cost to buy Δ shares from current position s
     * @dev Uses arithmetic series formula: cost = base*Δ + increment*(s*Δ + Δ*(Δ-1)/2)
     * @param currentShares Current net shares sold (s)
     * @param sharesToBuy Number of shares to buy (Δ)
     * @param basePrice Base price per share
     * @param increment Price increment per share
     * @return totalCost Total cost for the shares
     */
    function costToBuyFrom(
        uint256 currentShares,
        uint256 sharesToBuy,
        uint256 basePrice,
        uint256 increment
    ) internal pure returns (uint256 totalCost) {
        if (sharesToBuy == 0) return 0;
        
        // Calculate base cost: basePrice * sharesToBuy
        uint256 baseCost = basePrice * sharesToBuy;
        
        // Calculate increment cost: increment * (currentShares * sharesToBuy + sharesToBuy * (sharesToBuy - 1) / 2)
        // This is the sum of increments for each share: increment * Σ(i = 1 to Δ) (s + i - 1)
        uint256 incrementCost = increment * currentShares * sharesToBuy;
        incrementCost += (increment * sharesToBuy * (sharesToBuy - 1)) / 2;
        
        totalCost = baseCost + incrementCost;
    }

    /**
     * @notice Calculate refund for selling Δ shares from current position s
     * @dev Uses reverse of buy formula, selling from the top of the curve
     * @param currentShares Current net shares sold (s)
     * @param sharesToSell Number of shares to sell (Δ)
     * @param basePrice Base price per share
     * @param increment Price increment per share
     * @return totalRefund Total refund for the shares
     */
    function refundOnSell(
        uint256 currentShares,
        uint256 sharesToSell,
        uint256 basePrice,
        uint256 increment
    ) internal pure returns (uint256 totalRefund) {
        if (sharesToSell == 0 || sharesToSell > currentShares) return 0;
        
        // Calculate refund by selling from the top of the curve
        // Start from position (currentShares - sharesToSell) and sell sharesToSell shares
        uint256 startPosition = currentShares - sharesToSell;
        
        // Calculate base refund: basePrice * sharesToSell
        uint256 baseRefund = basePrice * sharesToSell;
        
        // Calculate increment refund: increment * (startPosition * sharesToSell + sharesToSell * (sharesToSell - 1) / 2)
        uint256 incrementRefund = increment * startPosition * sharesToSell;
        incrementRefund += (increment * sharesToSell * (sharesToSell - 1)) / 2;
        
        totalRefund = baseRefund + incrementRefund;
    }

    /**
     * @notice Find maximum shares buyable with given budget using binary search
     * @param currentShares Current net shares sold
     * @param budget Maximum tokens to spend
     * @param basePrice Base price per share
     * @param increment Price increment per share
     * @return maxShares Maximum shares that can be bought
     */
    function maxSharesBuyable(
        uint256 currentShares,
        uint256 budget,
        uint256 basePrice,
        uint256 increment
    ) internal pure returns (uint256 maxShares) {
        if (budget == 0) return 0;
        
        // Binary search for maximum shares
        uint256 low = 0;
        uint256 high = MAX_SAFE_INTEGER;
        
        // Cap high to prevent overflow in calculations
        if (basePrice == 0) return 0;
        uint256 maxPossibleShares = budget / basePrice;
        if (maxPossibleShares < high) {
            high = maxPossibleShares;
        }
        
        while (low < high) {
            uint256 mid = (low + high + 1) / 2;
            uint256 cost = costToBuyFrom(currentShares, mid, basePrice, increment);
            
            if (cost <= budget) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }
        
        return low;
    }

    /**
     * @notice Calculate current marginal price for the next share
     * @param currentShares Current net shares sold
     * @param basePrice Base price per share
     * @param increment Price increment per share
     * @return marginalPrice Price for the next share
     */
    function getMarginalPrice(
        uint256 currentShares,
        uint256 basePrice,
        uint256 increment
    ) internal pure returns (uint256 marginalPrice) {
        return basePrice + (increment * currentShares);
    }

    /**
     * @notice Calculate average price for buying shares
     * @param currentShares Current net shares sold
     * @param sharesToBuy Number of shares to buy
     * @param basePrice Base price per share
     * @param increment Price increment per share
     * @return averagePrice Average price per share
     */
    function getAveragePrice(
        uint256 currentShares,
        uint256 sharesToBuy,
        uint256 basePrice,
        uint256 increment
    ) internal pure returns (uint256 averagePrice) {
        if (sharesToBuy == 0) return 0;
        
        uint256 totalCost = costToBuyFrom(currentShares, sharesToBuy, basePrice, increment);
        return totalCost / sharesToBuy;
    }

    /**
     * @notice Validate price parameters
     * @param basePrice Base price per share
     * @param increment Price increment per share
     * @return isValid True if parameters are valid
     */
    function validatePriceParams(
        uint256 basePrice,
        uint256 increment
    ) internal pure returns (bool isValid) {
        return basePrice > 0 && increment <= MAX_SAFE_INTEGER;
    }
}
