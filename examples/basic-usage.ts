import { TradingAgent } from '../src/agent';
import { logger } from '../src/utils/logger';

async function basicExample() {
  try {
    logger.info('Starting basic trading agent example...');
    
    // Create the trading agent
    const agent = new TradingAgent();
    
    // Initialize the agent
    await agent.initialize();
    
    // Add a custom strategy
    agent.addStrategy({
      name: 'moving_average',
      enabled: true,
      parameters: {
        shortPeriod: 5,
        longPeriod: 15,
        minConfidence: 0.6,
        maxPositionSize: 50,
        tokens: ['USDC', 'WETH']
      }
    });
    
    // Start the agent (runs every 30 seconds)
    await agent.start(30000);
    
    // Log agent status
    const status = agent.getStatus();
    logger.info('Agent Status:', status);
    
    // Run for 5 minutes then stop
    setTimeout(async () => {
      logger.info('Stopping agent after 5 minutes...');
      agent.stop();
      
      // Show final trade history
      const trades = await agent.getTradeHistory(10);
      logger.info('Final trade history:', trades);
      
      process.exit(0);
    }, 300000); // 5 minutes
    
  } catch (error) {
    logger.error('Example failed:', error);
    process.exit(1);
  }
}

// Run the example
basicExample();
