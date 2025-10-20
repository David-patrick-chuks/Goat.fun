// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMarketOracle
 * @notice Interface for market resolution oracle
 * @dev Oracle determines the winning side of a market
 */
interface IMarketOracle {
    enum MarketResult {
        None,    // 0 - Not resolved
        Bullish, // 1 - Bullish side wins
        Fade     // 2 - Fade side wins
    }

    /**
     * @notice Resolve a market with the oracle's result
     * @param market The market contract address
     * @param result The oracle's determination of the winner
     */
    function resolveMarket(address market, MarketResult result) external;

    /**
     * @notice Check if oracle is authorized to resolve a market
     * @param market The market contract address
     * @param oracle The oracle address to check
     * @return True if oracle is authorized
     */
    function isAuthorizedOracle(address market, address oracle) external view returns (bool);
}
