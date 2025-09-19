#!/usr/bin/env node

import { TradingAgent } from './agent';
import { logger } from './utils/logger';

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function main() {
  try {
    logger.info('Starting Recall Trading Agent...');
    
    // Create and start the trading agent
    const agent = new TradingAgent();
    
    // Start the agent with 30-second intervals
    await agent.start(30000);
    
    // Log agent status
    const status = agent.getStatus();
    logger.info('Agent Status:', status);
    
    // Keep the process running
    logger.info('Trading agent is running. Press Ctrl+C to stop.');
    
    // Example: Show trade history every 5 minutes
    setInterval(async () => {
      try {
        const trades = await agent.getTradeHistory(10);
        if (trades.length > 0) {
          logger.info(`Recent trades (${trades.length}):`, trades);
        }
      } catch (error) {
        logger.error('Error fetching trade history:', error);
      }
    }, 300000); // 5 minutes
    
  } catch (error) {
    logger.error('Failed to start trading agent:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export { TradingAgent };
