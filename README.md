# Recall Trading Agent

A simple but functional AI trading agent built for Recall Network competitions. This agent can trade on multiple chains using the Recall API, with built-in strategies and comprehensive logging.

## Features

- 🤖 **AI Trading Agent**: Automated trading with multiple strategies
- 🔗 **Multi-Chain Support**: Trade on Ethereum and other supported chains
- 📊 **Built-in Strategies**: Moving Average and Simple Trigger strategies
- 📝 **Comprehensive Logging**: Detailed logs for trades, balances, and errors
- ⚙️ **Configurable**: Easy to customize and extend with new strategies
- 🛡️ **Error Handling**: Robust error handling and graceful shutdowns

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit `.env` with your Recall API credentials:

```env
# Recall Network API Configuration
RECALL_API_KEY=your_recall_api_key_here
RECALL_BASE_URL=https://api.sandbox.competitions.recall.network

# Trading Configuration
DEFAULT_CHAIN=ethereum
LOG_LEVEL=info
MAX_POSITION_SIZE=1000
```

### 3. Run the Agent

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## Project Structure

```
recall-trading-agent/
├── src/
│   ├── agent.ts              # Main trading agent
│   ├── index.ts              # Application entry point
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── utils/
│   │   ├── recallClient.ts   # Recall API client
│   │   └── logger.ts         # Logging utilities
│   └── strategies/
│       ├── baseStrategy.ts   # Base strategy class
│       ├── movingAverageStrategy.ts
│       ├── simpleTriggerStrategy.ts
│       └── index.ts          # Strategy factory
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Trading Strategies

### 1. Moving Average Strategy

Uses short and long-term moving averages to generate buy/sell signals.

**Configuration:**
- `shortPeriod`: Short-term moving average period (default: 5)
- `longPeriod`: Long-term moving average period (default: 20)
- `minConfidence`: Minimum confidence threshold (default: 0.6)
- `maxPositionSize`: Maximum position size (default: 100)
- `tokens`: List of tokens to trade (default: ['USDC', 'WETH'])

### 2. Simple Trigger Strategy

Triggers buy/sell based on price percentage changes from recent average.

**Configuration:**
- `buyThreshold`: Price increase percentage to trigger buy (default: 2.0%)
- `sellThreshold`: Price decrease percentage to trigger sell (default: 1.5%)
- `minConfidence`: Minimum confidence threshold (default: 0.5)
- `maxPositionSize`: Maximum position size (default: 50)
- `tokens`: List of tokens to trade (default: ['USDC', 'WETH'])
- `lookbackPeriod`: Number of previous prices to compare (default: 10)

## API Reference

### TradingAgent Class

#### Methods

- `initialize()`: Initialize the agent and check API health
- `start(intervalMs)`: Start the trading agent with specified interval
- `stop()`: Stop the trading agent
- `addStrategy(strategyConfig)`: Add a new trading strategy
- `removeStrategy(strategyName)`: Remove a trading strategy
- `getStatus()`: Get current agent status
- `getTradeHistory(limit)`: Get recent trade history
- `getPositions()`: Get current positions

#### Example Usage

```typescript
import { TradingAgent } from './src/agent';

const agent = new TradingAgent();
await agent.initialize();
await agent.start(30000); // Run every 30 seconds

// Add custom strategy
agent.addStrategy({
  name: 'moving_average',
  enabled: true,
  parameters: {
    shortPeriod: 10,
    longPeriod: 30,
    minConfidence: 0.7,
    maxPositionSize: 200,
    tokens: ['USDC', 'WETH', 'DAI']
  }
});
```

### RecallClient Class

#### Methods

- `getMarketData(chain?)`: Fetch market data for all or specific chain
- `getTokenPrice(token, chain?)`: Get current price for a token
- `executeTrade(tradeRequest)`: Execute a trade
- `getTradeHistory(limit, chain?)`: Get trade history
- `getBalances(chain?)`: Get current balances
- `getPositions(chain?)`: Get current positions
- `healthCheck()`: Check API health
- `getSupportedChains()`: Get list of supported chains

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RECALL_API_KEY` | Your Recall API key | Required |
| `RECALL_BASE_URL` | Recall API base URL | `https://api.sandbox.competitions.recall.network` |
| `DEFAULT_CHAIN` | Default blockchain to trade on | `ethereum` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `MAX_POSITION_SIZE` | Maximum position size for trades | `1000` |

### Strategy Configuration

Strategies can be configured by modifying the `loadDefaultStrategies()` method in `src/agent.ts` or by adding strategies dynamically using the `addStrategy()` method.

## Logging

The agent provides comprehensive logging with different levels:

- **DEBUG**: Detailed debugging information
- **INFO**: General information about agent operations
- **WARN**: Warning messages for non-critical issues
- **ERROR**: Error messages for failures
- **TRADE**: Special logging for trade executions
- **BALANCE**: Special logging for balance updates

Logs are written to both console and `trading.log` file.

## Error Handling

The agent includes robust error handling:

- API connection failures are logged and retried
- Individual strategy failures don't stop the entire agent
- Graceful shutdown on SIGINT/SIGTERM signals
- Uncaught exceptions are logged and the process exits cleanly

## Extending the Agent

### Adding New Strategies

1. Create a new strategy class extending `BaseStrategy`:

```typescript
import { BaseStrategy } from './baseStrategy';
import { TradingSignal, MarketData, StrategyConfig } from '../types';

export class MyCustomStrategy extends BaseStrategy {
  async analyze(marketData: MarketData[]): Promise<TradingSignal[]> {
    // Your strategy logic here
    return signals;
  }

  getName(): string {
    return 'My Custom Strategy';
  }

  getDescription(): string {
    return 'Description of my strategy';
  }
}
```

2. Add it to the `StrategyFactory` in `src/strategies/index.ts`

3. Use it in your agent:

```typescript
agent.addStrategy({
  name: 'my_custom',
  enabled: true,
  parameters: { /* your parameters */ }
});
```

### Custom Trading Logic

You can override the `executeSignal()` method in the `TradingAgent` class to implement custom trade execution logic.

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your `RECALL_API_KEY` is set correctly in the `.env` file
2. **Connection Issues**: Check your internet connection and the Recall API status
3. **Strategy Errors**: Check the strategy configuration and ensure all required parameters are provided
4. **Permission Errors**: Ensure the agent has write permissions for log files

### Debug Mode

Run with debug logging to get more detailed information:

```bash
LOG_LEVEL=debug npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Open an issue on GitHub with detailed information

---

**Note**: This is a demo trading agent for Recall competitions. Always test thoroughly in sandbox mode before using with real funds.
