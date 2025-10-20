// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IMarketFactory.sol";
import "../interfaces/IMarketPair.sol";
import "./MarketPair.sol";

/**
 * @title MarketFactory
 * @notice Factory contract for creating and managing prediction markets
 * @dev Deploys individual MarketPair contracts for each market
 */
contract MarketFactory is IMarketFactory, Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    /// @notice Array of all created markets
    address[] public markets;
    
    /// @notice Mapping from market ID to market address
    mapping(bytes32 => address) public marketById;
    
    /// @notice Mapping to check if address is a valid market
    mapping(address => bool) public isValidMarket;
    
    /// @notice Default factory parameters
    uint256 public defaultCreatorFee;
    IMarketPair.SplitConfig public defaultSplitConfig;
    
    /// @notice Market counter for unique IDs
    uint256 public marketCounter;
    
    /// @notice Events
    event MarketCreated(
        address indexed market,
        address indexed creator,
        bytes32 indexed marketId,
        string title,
        string ticker
    );
    
    event FactoryParamsUpdated(
        uint256 defaultCreatorFee,
        IMarketPair.SplitConfig splitConfig
    );

    /**
     * @notice Constructor
     * @param _defaultCreatorFee Default creator fee percentage (basis points)
     * @param _defaultSplitConfig Default split configuration
     */
    constructor(
        uint256 _defaultCreatorFee,
        IMarketPair.SplitConfig memory _defaultSplitConfig
    ) {
        require(_defaultCreatorFee <= 10000, "Creator fee too high");
        require(
            _defaultSplitConfig.potShare + _defaultSplitConfig.holderDividendShare + 
            _defaultSplitConfig.reserveShare + _defaultSplitConfig.creatorFeeShare == 10000,
            "Split must sum to 100%"
        );
        
        defaultCreatorFee = _defaultCreatorFee;
        defaultSplitConfig = _defaultSplitConfig;
    }

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
    ) external override nonReentrant whenNotPaused returns (address marketAddress, bytes32 marketId) {
        // Validate inputs
        require(bytes(title).length > 0, "Title required");
        require(bytes(ticker).length > 0, "Ticker required");
        require(durationHours > 0, "Duration must be positive");
        require(durationHours <= 8760, "Duration too long"); // Max 1 year
        require(tokenAddress != address(0), "Invalid token address");
        require(creatorAddress != address(0), "Invalid creator address");
        require(creatorFeePercent <= 10000, "Creator fee too high");
        
        // Validate split configuration
        require(
            splitConfig.potShare + splitConfig.holderDividendShare + 
            splitConfig.reserveShare + splitConfig.creatorFeeShare == 10000,
            "Split must sum to 100%"
        );
        
        // Generate unique market ID
        marketId = keccak256(abi.encodePacked(
            block.timestamp,
            block.number,
            msg.sender,
            marketCounter,
            title,
            ticker
        ));
        marketCounter++;
        
        // Deploy new market contract
        marketAddress = address(new MarketPair(
            title,
            ticker,
            durationHours,
            basePriceBullish,
            incrementBullish,
            basePriceFade,
            incrementFade,
            tokenAddress,
            creatorAddress,
            creatorFeePercent,
            splitConfig
        ));
        
        // Register market
        markets.push(marketAddress);
        marketById[marketId] = marketAddress;
        isValidMarket[marketAddress] = true;
        
        emit MarketCreated(marketAddress, creatorAddress, marketId, title, ticker);
    }

    /**
     * @notice Create market with default parameters
     * @param title Market title/description
     * @param ticker Market ticker symbol
     * @param durationHours Market duration in hours
     * @param basePriceBullish Base price for bullish side
     * @param incrementBullish Price increment for bullish side
     * @param basePriceFade Base price for fade side
     * @param incrementFade Price increment for fade side
     * @param tokenAddress ERC20 token address for trading
     * @param creatorAddress Market creator address
     * @return marketAddress Address of the created market
     * @return marketId Unique market identifier
     */
    function createMarketWithDefaults(
        string memory title,
        string memory ticker,
        uint256 durationHours,
        uint256 basePriceBullish,
        uint256 incrementBullish,
        uint256 basePriceFade,
        uint256 incrementFade,
        address tokenAddress,
        address creatorAddress
    ) external nonReentrant whenNotPaused returns (address marketAddress, bytes32 marketId) {
        return createMarket(
            title,
            ticker,
            durationHours,
            basePriceBullish,
            incrementBullish,
            basePriceFade,
            incrementFade,
            tokenAddress,
            creatorAddress,
            defaultCreatorFee,
            defaultSplitConfig
        );
    }

    /**
     * @notice Set factory parameters (only owner)
     * @param _defaultCreatorFee Default creator fee percentage
     * @param _defaultSplitConfig Default split configuration
     */
    function setFactoryParams(
        uint256 _defaultCreatorFee,
        IMarketPair.SplitConfig memory _defaultSplitConfig
    ) external override onlyOwner {
        require(_defaultCreatorFee <= 10000, "Creator fee too high");
        require(
            _defaultSplitConfig.potShare + _defaultSplitConfig.holderDividendShare + 
            _defaultSplitConfig.reserveShare + _defaultSplitConfig.creatorFeeShare == 10000,
            "Split must sum to 100%"
        );
        
        defaultCreatorFee = _defaultCreatorFee;
        defaultSplitConfig = _defaultSplitConfig;
        
        emit FactoryParamsUpdated(_defaultCreatorFee, _defaultSplitConfig);
    }

    /**
     * @notice Pause factory (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause factory (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency pause all markets (only owner)
     * @dev This pauses the factory, preventing new market creation
     * Individual markets can still be paused by their owners
     */
    function emergencyPauseAll() external onlyOwner {
        _pause();
        // Note: Individual market pausing would require iterating over all markets
        // which could hit gas limits. In practice, this should be used sparingly.
    }

    // View functions

    function getAllMarkets() external view override returns (address[] memory) {
        return markets;
    }

    function getMarketCount() external view override returns (uint256) {
        return markets.length;
    }

    function getMarketById(bytes32 marketId) external view override returns (address) {
        return marketById[marketId];
    }

    /**
     * @notice Get markets created by a specific creator
     * @param creator Creator address
     * @return creatorMarkets Array of market addresses created by the creator
     */
    function getMarketsByCreator(address creator) external view returns (address[] memory creatorMarkets) {
        uint256 count = 0;
        
        // Count markets by creator
        for (uint256 i = 0; i < markets.length; i++) {
            try IMarketPair(markets[i]).getMarketInfo() returns (IMarketPair.MarketInfo memory info) {
                if (info.creator == creator) {
                    count++;
                }
            } catch {
                // Skip invalid markets
                continue;
            }
        }
        
        // Create array and populate
        creatorMarkets = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < markets.length; i++) {
            try IMarketPair(markets[i]).getMarketInfo() returns (IMarketPair.MarketInfo memory info) {
                if (info.creator == creator) {
                    creatorMarkets[index] = markets[i];
                    index++;
                }
            } catch {
                // Skip invalid markets
                continue;
            }
        }
    }

    /**
     * @notice Get markets using a specific token
     * @param token Token address
     * @return tokenMarkets Array of market addresses using the token
     */
    function getMarketsByToken(address token) external view returns (address[] memory tokenMarkets) {
        uint256 count = 0;
        
        // Count markets by token
        for (uint256 i = 0; i < markets.length; i++) {
            try IMarketPair(markets[i]).getMarketInfo() returns (IMarketPair.MarketInfo memory info) {
                if (info.token == token) {
                    count++;
                }
            } catch {
                // Skip invalid markets
                continue;
            }
        }
        
        // Create array and populate
        tokenMarkets = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < markets.length; i++) {
            try IMarketPair(markets[i]).getMarketInfo() returns (IMarketPair.MarketInfo memory info) {
                if (info.token == token) {
                    tokenMarkets[index] = markets[i];
                    index++;
                }
            } catch {
                // Skip invalid markets
                continue;
            }
        }
    }

    /**
     * @notice Get active markets (not resolved and not expired)
     * @return activeMarkets Array of active market addresses
     */
    function getActiveMarkets() external view returns (address[] memory activeMarkets) {
        uint256 count = 0;
        
        // Count active markets
        for (uint256 i = 0; i < markets.length; i++) {
            try IMarketPair(markets[i]).getMarketInfo() returns (IMarketPair.MarketInfo memory info) {
                if (!info.resolved && block.timestamp < info.endTime) {
                    count++;
                }
            } catch {
                // Skip invalid markets
                continue;
            }
        }
        
        // Create array and populate
        activeMarkets = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < markets.length; i++) {
            try IMarketPair(markets[i]).getMarketInfo() returns (IMarketPair.MarketInfo memory info) {
                if (!info.resolved && block.timestamp < info.endTime) {
                    activeMarkets[index] = markets[i];
                    index++;
                }
            } catch {
                // Skip invalid markets
                continue;
            }
        }
    }

    /**
     * @notice Get market statistics
     * @return totalMarkets Total number of markets
     * @return activeMarkets Number of active markets
     * @return resolvedMarkets Number of resolved markets
     * @return expiredMarkets Number of expired markets
     */
    function getMarketStats() external view returns (
        uint256 totalMarkets,
        uint256 activeMarkets,
        uint256 resolvedMarkets,
        uint256 expiredMarkets
    ) {
        totalMarkets = markets.length;
        
        for (uint256 i = 0; i < markets.length; i++) {
            try IMarketPair(markets[i]).getMarketInfo() returns (IMarketPair.MarketInfo memory info) {
                if (info.resolved) {
                    resolvedMarkets++;
                } else if (block.timestamp >= info.endTime) {
                    expiredMarkets++;
                } else {
                    activeMarkets++;
                }
            } catch {
                // Skip invalid markets
                continue;
            }
        }
    }
}
