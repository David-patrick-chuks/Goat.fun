// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "src/interfaces/IMarketOracle.sol";
import "src/interfaces/IMarketPair.sol";

/**
 * @title SimpleOracle
 * @notice Simple oracle implementation for testing purposes
 * @dev In production, this should be replaced with a decentralized oracle system
 */
contract SimpleOracle is IMarketOracle, Ownable {
    /// @notice Mapping of authorized oracles for each market
    mapping(address => mapping(address => bool)) public authorizedOracles;
    
    /// @notice Mapping of market results
    mapping(address => MarketResult) public marketResults;
    
    /// @notice Events
    event OracleAuthorized(address indexed market, address indexed oracle);
    event OracleRevoked(address indexed market, address indexed oracle);
    event MarketResolved(address indexed market, MarketResult result);

    /// @notice Initialize owner
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Authorize an oracle for a specific market
     * @param market Market contract address
     * @param oracle Oracle address to authorize
     */
    function authorizeOracle(address market, address oracle) external onlyOwner {
        require(market != address(0), "Invalid market address");
        require(oracle != address(0), "Invalid oracle address");
        
        authorizedOracles[market][oracle] = true;
        emit OracleAuthorized(market, oracle);
    }

    /**
     * @notice Revoke oracle authorization for a specific market
     * @param market Market contract address
     * @param oracle Oracle address to revoke
     */
    function revokeOracle(address market, address oracle) external onlyOwner {
        authorizedOracles[market][oracle] = false;
        emit OracleRevoked(market, oracle);
    }

    /**
     * @notice Resolve a market with the oracle's result
     * @param market The market contract address
     * @param result The oracle's determination of the winner
     */
    function resolveMarket(address market, MarketResult result) external override {
        require(isAuthorizedOracle(market, msg.sender), "Not authorized oracle");
        require(result != MarketResult.None, "Invalid result");
        require(marketResults[market] == MarketResult.None, "Already resolved");
        
        marketResults[market] = result;
        
        // Call the market's resolve function
        try IMarketPair(market).resolve(result) {
            emit MarketResolved(market, result);
        } catch {
            revert("Failed to resolve market");
        }
    }

    /**
     * @notice Check if oracle is authorized to resolve a market
     * @param market The market contract address
     * @param oracle The oracle address to check
     * @return True if oracle is authorized
     */
    function isAuthorizedOracle(address market, address oracle) public view override returns (bool) {
        return authorizedOracles[market][oracle] || oracle == owner();
    }

    /**
     * @notice Get the result for a market
     * @param market Market contract address
     * @return result The market result
     */
    function getMarketResult(address market) external view returns (MarketResult result) {
        return marketResults[market];
    }
}
