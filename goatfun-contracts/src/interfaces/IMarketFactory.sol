// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IMarketPair.sol";

/**
 * @title IMarketFactory
 * @notice Interface for the market factory contract
 * @dev Factory creates and manages individual market contracts
 */
interface IMarketFactory {
    /**
     * @notice Create a new market
     * @param title Market title/description
     * @param ticker Market ticker symbol
     * @param durationHours Market duration in hours
     * @param basePriceBullish Base price for bullish side
     * @param incrementBullish Price increment for bullish side
     * @param basePriceFade Base price for fade side
     * @param incrementFade Price increment for fade side
     * @param tokenAddress ERC20 token address for trading
     * @param creatorAddress Market creator address
     * @param creatorFeePercent Creator fee percentage (basis points)
     * @param splitConfig Revenue split configuration
     * @return marketAddress Address of the created market
     * @return marketId Unique market identifier
     */
    function createMarket(
        string memory title,
        string memory ticker,
        uint256 durationHours,
        uint256 basePriceBullish,
        uint256 incrementBullish,
        uint256 basePriceFade,
        uint256 incrementFade,
        address tokenAddress,
        address creatorAddress,
        uint256 creatorFeePercent,
        IMarketPair.SplitConfig memory splitConfig
    ) external returns (address marketAddress, bytes32 marketId);

    /**
     * @notice Get all created markets
     * @return markets Array of market addresses
     */
    function getAllMarkets() external view returns (address[] memory markets);

    /**
     * @notice Get market count
     * @return count Total number of markets created
     */
    function getMarketCount() external view returns (uint256 count);

    /**
     * @notice Check if an address is a valid market
     * @param market Address to check
     * @return isValid True if address is a valid market
     */
    function isValidMarket(address market) external view returns (bool isValid);

    /**
     * @notice Get market by ID
     * @param marketId Market identifier
     * @return marketAddress Address of the market
     */
    function getMarketById(bytes32 marketId) external view returns (address marketAddress);

    /**
     * @notice Set factory parameters (only owner)
     * @param defaultCreatorFee Default creator fee percentage
     * @param defaultSplitConfig Default split configuration
     */
    function setFactoryParams(
        uint256 defaultCreatorFee,
        IMarketPair.SplitConfig memory defaultSplitConfig
    ) external;
}
