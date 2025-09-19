#!/usr/bin/env node

import dotenv from 'dotenv';
import { logger } from './src/utils/logger';

// Load environment variables
dotenv.config();

async function testSetup() {
  logger.info('Testing Recall Trading Agent setup...');
  
  // Check environment variables
  const requiredVars = ['RECALL_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars);
    logger.info('Please create a .env file with the required variables. See env.example for reference.');
    process.exit(1);
  }
  
  logger.info('Environment variables check: PASSED');
  
  // Test imports
  try {
    const { TradingAgent } = require('./src/agent');
    const { RecallClient } = require('./src/utils/recallClient');
    const { StrategyFactory } = require('./src/strategies');
    
    logger.info('Module imports: PASSED');
    
    // Test agent creation
    const agent = new TradingAgent();
    logger.info('Agent creation: PASSED');
    
    // Test strategy factory
    const availableStrategies = StrategyFactory.getAvailableStrategies();
    logger.info('Available strategies:', availableStrategies);
    logger.info('Strategy factory: PASSED');
    
    logger.info('✅ All setup tests passed! The agent is ready to use.');
    logger.info('Run "npm run dev" to start the trading agent.');
    
  } catch (error) {
    logger.error('Setup test failed:', error);
    process.exit(1);
  }
}

testSetup();
