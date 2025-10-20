# GoatFun Test Contracts - GOAT Testnet3 Deployment

This directory contains the test contracts for GoatFun, specifically the tGOATED ERC20 test token.

## Contract Details

- **Contract Name**: tGOATED (Goated Test Token)
- **Symbol**: tGOATED
- **Total Supply**: 1,000,000 tokens (minted to deployer)
- **Network**: GOAT Testnet3
- **Chain ID**: 48816 (0xBEB0)
- **RPC URL**: https://rpc.testnet3.goat.network
- **Block Explorer**: https://explorer.testnet3.goat.network

## Prerequisites

1. **Install Foundry**: Follow the [Foundry installation guide](https://book.getfoundry.sh/getting-started/installation)
2. **Get Test BTC**: Use the [GOAT Network Faucet](https://faucet.goat.network) to get test BTC
3. **Set up Wallet**: Configure MetaMask with GOAT Testnet3:
   - Network Name: GOAT Testnet3
   - RPC URL: https://rpc.testnet3.goat.network
   - Chain ID: 48816
   - Currency Symbol: BTC
   - Block Explorer: https://explorer.testnet3.goat.network

## Deployment Instructions

### 1. Set Environment Variables

```bash
export PRIVATE_KEY="your_private_key_here"
```

### 2. Deploy to GOAT Testnet3

```bash
# Navigate to the contracts directory
cd goated-test

# Deploy the tGOATED token to GOAT Testnet3
forge script script/DeployTGOATEDToGoatTestnet3.s.sol:DeployTGOATEDToGoatTestnet3 \
  --broadcast \
  --rpc-url goat_testnet3 \
  --private-key $PRIVATE_KEY
```

### 3. Verify Deployment

After deployment, you can:
- Check the transaction on the [GOAT Testnet3 Explorer](https://explorer.testnet3.goat.network)
- Add the token to MetaMask using the contract address
- Use the token in your dApp development

## Contract Functions

### Public Functions
- `name()`: Returns "Goated Test Token"
- `symbol()`: Returns "tGOATED"
- `decimals()`: Returns 18
- `totalSupply()`: Returns total supply
- `balanceOf(address)`: Returns balance of an address
- `transfer(address, uint256)`: Transfer tokens
- `approve(address, uint256)`: Approve spending
- `allowance(address, address)`: Check allowance

### Owner Functions
- `mint(address, uint256)`: Mint new tokens (owner only)

## Testing

Run the test suite:

```bash
forge test
```

## Integration with Frontend

The deployed contract address should be added to your frontend configuration:

1. Update `frontend/hooks/wagmi.ts` with the deployed contract address
2. Add the token to your dApp's token list
3. Configure trading pairs and liquidity pools

## Network Configuration

The frontend is already configured to use GOAT Testnet3:
- Chain ID: 48816
- RPC URL: https://rpc.testnet3.goat.network
- Currency: BTC
- Block Explorer: https://explorer.testnet3.goat.network

## Support

- [GOAT Network Documentation](https://docs.goat.network)
- [GOAT Network Discord](https://discord.gg/goatnetwork)
- [Foundry Documentation](https://book.getfoundry.sh)
