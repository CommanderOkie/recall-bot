# Recall Trading Agent - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# If you get execution policy error on Windows, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then install dependencies:
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file:
copy env.example .env

# Edit .env with your Recall API key:
# RECALL_API_KEY=your_actual_api_key_here
```

### 3. Test Setup
```bash
# Test that everything is configured correctly:
npm test
```

### 4. Run the Agent
```bash
# Development mode (with hot reload):
npm run dev

# Or run the example:
npm run example
```

## 📁 Project Structure

```
recall-trading-agent/
├── src/                    # Source code
│   ├── agent.ts           # Main trading agent
│   ├── index.ts           # Application entry point
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utilities (logger, API client)
│   └── strategies/        # Trading strategies
├── examples/              # Example usage scripts
├── config/                # Configuration files
├── .env.example          # Environment template
├── package.json          # Dependencies and scripts
└── README.md             # Full documentation
```

## 🔧 Configuration

### Environment Variables (.env)
```env
RECALL_API_KEY=your_api_key_here
RECALL_BASE_URL=https://api.sandbox.competitions.recall.network
DEFAULT_CHAIN=ethereum
LOG_LEVEL=info
MAX_POSITION_SIZE=1000
```

### Strategy Configuration
Edit `config/default.json` to customize trading strategies:
- Moving Average Strategy
- Simple Trigger Strategy
- Risk management settings
- Logging configuration

## 📊 Built-in Strategies

### 1. Moving Average Strategy
- Uses short (5) and long (20) period moving averages
- Generates buy/sell signals on crossovers
- Configurable confidence thresholds

### 2. Simple Trigger Strategy
- Triggers on price percentage changes
- Buy threshold: 2% increase
- Sell threshold: 1.5% decrease
- Configurable lookback period

## 🛠️ Available Commands

```bash
npm run dev          # Start in development mode
npm run build        # Build for production
npm start           # Start production build
npm test            # Test setup and configuration
npm run example     # Run example script
```

## 📝 Logging

The agent logs to both console and `trading.log` file:
- **DEBUG**: Detailed debugging info
- **INFO**: General operations
- **WARN**: Warnings
- **ERROR**: Errors
- **TRADE**: Trade executions
- **BALANCE**: Balance updates

## 🔍 Troubleshooting

### Common Issues:

1. **PowerShell Execution Policy Error**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Missing API Key**:
   - Make sure `.env` file exists and contains `RECALL_API_KEY`

3. **Module Import Errors**:
   - Run `npm install` to ensure all dependencies are installed

4. **API Connection Issues**:
   - Check your internet connection
   - Verify the API key is correct
   - Check if the Recall API is accessible

### Debug Mode:
```bash
LOG_LEVEL=debug npm run dev
```

## 🎯 Next Steps

1. **Test the Setup**: Run `npm test` to verify everything works
2. **Configure Strategies**: Edit `config/default.json` for your needs
3. **Start Trading**: Run `npm run dev` to start the agent
4. **Monitor Logs**: Watch `trading.log` for trade executions
5. **Extend**: Add custom strategies in `src/strategies/`

## 📚 Full Documentation

See `README.md` for complete documentation including:
- API reference
- Strategy development guide
- Error handling
- Contributing guidelines

---

**Ready to trade!** 🚀
