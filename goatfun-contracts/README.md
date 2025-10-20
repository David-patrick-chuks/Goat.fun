# GoatFun Contracts

A comprehensive Solidity contract system for prediction markets with continuous bonding curves, implemented for the GOAT Network blockchain.

## Overview

GoatFun implements a prediction market system where each market has two sides (Bullish and Fade) with independent bonding curves. Users can buy shares on either side, and the system distributes revenue through a configurable split mechanism including pot rewards, holder dividends, reserves, and creator fees.

## Key Features

- **Dual-Side Markets**: Each market has Bullish and Fade tokens with independent bonding curves
- **Continuous Bonding Curves**: Linear marginal pricing with configurable base prices and increments
- **Gas-Efficient Dividends**: Cumulative dividend-per-share system for holder rewards
- **Flexible Revenue Splits**: Configurable distribution between pot, holders, reserve, and creator
- **Safe Resolution**: Pro-rata payout mode ensures solvency
- **Oracle Integration**: Support for decentralized oracle resolution
- **Security Features**: Reentrancy guards, access controls, and pausable functionality

## How the Dual-Token System Works

### Overview

Each prediction market creates **TWO separate tokens** that users can buy and sell:

1. **Bullish Token** - For users who believe the prediction will be TRUE
2. **Fade Token** - For users who believe the prediction will be FALSE

### Example: "Bitcoin will reach $100k by end of 2024"

When this market is created, it launches:
- **BTCWIN-Bullish** token (for believers)
- **BTCWIN-Fade** token (for doubters)

### User Experience

**Buying Shares:**
```solidity
// User thinks Bitcoin WILL reach $100k
market.buy(Side.Bullish, 100 tokens); // Gets Bullish shares

// User thinks Bitcoin WON'T reach $100k  
market.buy(Side.Fade, 100 tokens); // Gets Fade shares
```

**Price Dynamics:**
- **More people buy Bullish** → Bullish token price goes UP
- **More people buy Fade** → Fade token price goes UP
- **People sell Bullish** → Bullish token price goes DOWN
- **People sell Fade** → Fade token price goes DOWN

### Bonding Curve Pricing

Each side has its own independent bonding curve:

```solidity
Bullish Price = basePrice + increment × (number of bullish shares sold)
Fade Price = basePrice + increment × (number of fade shares sold)
```

**Example:**
- Base price: 1 token per share
- Increment: 0.001 tokens per share
- If 1000 Bullish shares sold → Bullish price = 1 + (0.001 × 1000) = 2 tokens per share
- If 500 Fade shares sold → Fade price = 1 + (0.001 × 500) = 1.5 tokens per share

### Market Resolution & Payouts

**When the market resolves:**

1. **Oracle determines winner** (e.g., Bitcoin DID reach $100k)
2. **Bullish holders WIN** → They get payout from the pot
3. **Fade holders LOSE** → Their tokens become worthless

**Payout Example:**
- Total pot: 10,000 tokens
- Bullish holders own 60% of total shares
- Each Bullish share gets: (10,000 × 0.6) ÷ total_bullish_shares

### Revenue Distribution

**Every buy transaction splits the money:**
- 60% → Pot (for winners)
- 30% → Dividends to existing holders
- 10% → Reserve (for sells)
- 0-2% → Creator fee

### Real Example Flow

1. **Market Created**: "Ethereum will outperform Bitcoin this month"
2. **User A buys 100 Bullish shares** for 150 tokens
3. **User B buys 50 Fade shares** for 75 tokens  
4. **User C buys 200 Bullish shares** for 400 tokens
5. **Market resolves**: Ethereum DID outperform Bitcoin
6. **Winners (Bullish holders)** claim payout from pot
7. **Losers (Fade holders)** get nothing

### Key Benefits

✅ **Two-sided betting** - Users can bet FOR or AGAINST
✅ **Independent pricing** - Each side has its own supply/demand
✅ **Real-time value** - Token prices reflect market sentiment
✅ **Liquidity** - Users can sell anytime before resolution
✅ **Dividends** - Holders earn from new buyers

This creates a dynamic prediction market where the token prices reflect the collective wisdom of the crowd!

## Contract Architecture

### Core Contracts

1. **MarketFactory.sol** - Factory contract for creating and managing markets
2. **MarketPair.sol** - Individual market contract managing Bullish/Fade tokens
3. **SimpleOracle.sol** - Basic oracle implementation for testing
4. **PriceMath.sol** - Fixed-point arithmetic utilities for bonding curves

### Interfaces

- **IMarketFactory.sol** - Factory contract interface
- **IMarketPair.sol** - Market contract interface  
- **IMarketOracle.sol** - Oracle interface for market resolution

## Bonding Curve Mathematics

The system uses linear marginal pricing where the price for the n-th share is:

```solidity
p(n) = basePrice + increment * n
```

For buying Δ shares from current position s, the total cost is:

```solidity
cost = basePrice * Δ + increment * (s * Δ + Δ * (Δ-1) / 2)
```

This uses the arithmetic series formula to calculate the integral under the marginal price curve.

### Fixed-Point Arithmetic

All calculations use 1e18 scaling for precision:
- Prices are represented as scaled integers
- The `PriceMath` library provides safe arithmetic operations
- Binary search is used for finding maximum buyable shares

## Revenue Distribution

Each buy transaction is split into four components:

1. **Pot Share** (default 60%) - Main reward pool for winners
2. **Holder Dividend Share** (default 30%) - Distributed to existing holders
3. **Reserve Share** (default 10%) - Solvency buffer for sells
4. **Creator Fee Share** (configurable) - Revenue for market creator

### Dividend Distribution

The system uses a gas-efficient cumulative dividend approach:
- Dividends are added to `cumulativeDividendPerShare`
- Each holder tracks their last credited dividend
- Holders can claim accumulated dividends anytime
- No loops over holders - pull-based distribution

## Market Lifecycle

1. **Creation**: Factory deploys new MarketPair contract
2. **Trading**: Users buy/sell shares on Bullish/Fade sides
3. **Resolution**: Oracle determines winning side
4. **Payouts**: Winners claim pro-rata pot distribution
5. **Creator Withdrawal**: Creator claims accumulated fees

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for critical functions
- **Pausable**: Emergency stop functionality
- **SafeERC20**: Safe token transfer operations
- **Input Validation**: Comprehensive parameter validation
- **Solvency Checks**: Ensures contract remains solvent

## Deployment

### Prerequisites

- Foundry installed
- GOAT Testnet3 RPC access
- Private key with testnet funds

### Environment Variables

```bash
export PRIVATE_KEY="your_private_key_here"
export GOAT_RPC_URL="https://rpc.testnet3.goat.network"
export TOKEN_ADDRESS="0xa1FB4a8CEd8f916F4403ABFE65fD34Db564eEC9D" # tGOATED token
```

### Deploy Contracts

```bash
# Deploy factory and oracle
forge script script/DeployGoatFun.s.sol:DeployGoatFun --broadcast --rpc-url goat_testnet3 --private-key $PRIVATE_KEY

# Create a test market
forge script script/CreateTestMarket.s.sol:CreateTestMarket --broadcast --rpc-url goat_testnet3 --private-key $PRIVATE_KEY
```

### Test Contracts

```bash
# Run all tests
forge test

# Run specific test
forge test --match-test testBuyShares

# Run with gas reporting
forge test --gas-report
```

## Usage Examples

### Creating a Market

```solidity
// Deploy through factory
MarketFactory factory = MarketFactory(factoryAddress);

IMarketPair.SplitConfig memory splitConfig = IMarketPair.SplitConfig({
    potShare: 6000,           // 60%
    holderDividendShare: 3000, // 30%
    reserveShare: 1000,        // 10%
    creatorFeeShare: 0         // 0%
});

(address marketAddress, bytes32 marketId) = factory.createMarket(
    "Bitcoin Price Prediction",
    "BTCWIN",
    24, // 24 hours
    1e18, // Base price
    1e15, // Increment
    1e18, // Base price (fade)
    1e15, // Increment (fade)
    tokenAddress,
    creatorAddress,
    200, // 2% creator fee
    splitConfig
);
```

### Buying Shares

```solidity
MarketPair market = MarketPair(marketAddress);

// Approve tokens
IERC20(tokenAddress).approve(marketAddress, buyAmount);

// Buy bullish shares
(uint256 sharesBought, uint256 actualSpent) = market.buy(
    IMarketPair.Side.Bullish,
    maxSpent
);
```

### Selling Shares

```solidity
// Sell shares back to contract
uint256 refundAmount = market.sell(
    IMarketPair.Side.Bullish,
    sharesToSell
);
```

### Claiming Dividends

```solidity
// Claim accumulated dividends
uint256 dividendAmount = market.claimDividend(IMarketPair.Side.Bullish);
```

### Resolving Market

```solidity
// Oracle resolves market
oracle.resolveMarket(marketAddress, IMarketOracle.MarketResult.Bullish);

// Winners claim payouts
uint256 payoutAmount = market.claimPayout(IMarketPair.Side.Bullish);
```

## Frontend Integration

### Event Listening

The frontend should listen for these key events:

- `MarketCreated` - New market deployed
- `Buy` - Share purchase
- `Sell` - Share sale
- `DividendPaid` - Dividend claimed
- `MarketResolved` - Market resolution
- `PayoutClaimed` - Winner payout

### Key Functions for Frontend

```solidity
// Get current market price
uint256 price = market.getCurrentPrice(IMarketPair.Side.Bullish);

// Calculate cost for specific shares
uint256 cost = market.getCostForShares(IMarketPair.Side.Bullish, shares);

// Get maximum buyable shares
uint256 maxShares = market.getMaxSharesBuyable(IMarketPair.Side.Bullish, budget);

// Get user's share balance
uint256 balance = market.getBalance(userAddress, IMarketPair.Side.Bullish);

// Get accumulated dividends
uint256 dividend = market.getAccumulatedDividend(userAddress, IMarketPair.Side.Bullish);
```

## Gas Considerations

- **No Holder Loops**: Dividend distribution uses pull-based system
- **Efficient Math**: Fixed-point arithmetic with optimized operations
- **Batch Operations**: Consider batching multiple operations
- **Gas Limits**: Large markets may hit gas limits for resolution

## Testing

The test suite covers:

- Market creation and initialization
- Share buying and selling
- Dividend distribution
- Market resolution and payouts
- Creator revenue withdrawal
- Edge cases and error conditions
- Security features (pause, access control)

Run tests with:

```bash
forge test --match-contract GoatFunTest
```

## Production Considerations

### Oracle Integration

For production, replace `SimpleOracle` with a decentralized oracle system:

- Chainlink price feeds
- Custom oracle network
- Multi-signature resolution
- Time-locked resolution

### Security Audits

Before mainnet deployment:

- Professional security audit
- Formal verification of critical functions
- Bug bounty program
- Extensive testing on testnets

### Gas Optimization

- Consider using CREATE2 for deterministic addresses
- Optimize storage layout
- Use assembly for critical calculations
- Implement gas-efficient data structures

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

For questions and support:

- GitHub Issues
- Discord Community
- Documentation Wiki

---

**Note**: This is a testnet implementation. For mainnet deployment, additional security measures and audits are required.