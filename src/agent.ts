import dotenv from 'dotenv';
import { RecallClient } from './utils/recallClient';
import { StrategyFactory } from './strategies';
import { 
  AgentConfig, 
  TradingSignal, 
  MarketData, 
  TradeExecutionRequest,
  StrategyConfig 
} from './types';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

export class TradingAgent {
  private client: RecallClient;
  private strategies: any[] = [];
  private config: AgentConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    // Validate required environment variables
    const apiKey = process.env.RECALL_API_KEY;
    if (!apiKey) {
      throw new Error('RECALL_API_KEY is required in environment variables');
    }

    this.config = {
      apiKey,
      baseUrl: process.env.RECALL_BASE_URL || 'https://api.sandbox.competitions.recall.network',
      defaultChain: process.env.DEFAULT_CHAIN || 'ethereum',
      maxPositionSize: parseInt(process.env.MAX_POSITION_SIZE || '1000'),
      logLevel: (process.env.LOG_LEVEL as any) || 'info'
    };

    this.client = new RecallClient(this.config);
    logger.info('Trading Agent initialized', { config: this.config });
  }

  // Initialize the agent with strategies
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Trading Agent...');

      // Check API health
      const isHealthy = await this.client.healthCheck();
      if (!isHealthy) {
        throw new Error('Recall API is not healthy');
      }

      // Get supported chains
      const chains = await this.client.getSupportedChains();
      logger.info('Supported chains:', chains);

      // Load default strategies
      await this.loadDefaultStrategies();

      // Get initial balances
      const balances = await this.client.getBalances();
      logger.balance('Initial balances:', balances);

      logger.info('Trading Agent initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Trading Agent:', error);
      throw error;
    }
  }

  // Load default trading strategies
  private async loadDefaultStrategies(): Promise<void> {
    const defaultStrategies: StrategyConfig[] = [
      {
        name: 'moving_average',
        enabled: true,
        parameters: {
          shortPeriod: 5,
          longPeriod: 20,
          minConfidence: 0.6,
          maxPositionSize: 100,
          tokens: ['USDC', 'WETH'] // Default tokens to trade
        }
      },
      {
        name: 'simple_trigger',
        enabled: true,
        parameters: {
          buyThreshold: 2.0, // 2% price increase
          sellThreshold: 1.5, // 1.5% price decrease
          minConfidence: 0.5,
          maxPositionSize: 50,
          tokens: ['USDC', 'WETH'],
          lookbackPeriod: 10
        }
      }
    ];

    for (const strategyConfig of defaultStrategies) {
      try {
        const strategy = StrategyFactory.createStrategy(strategyConfig);
        this.strategies.push(strategy);
        logger.info(`Loaded strategy: ${strategy.getName()}`);
      } catch (error) {
        logger.error(`Failed to load strategy ${strategyConfig.name}:`, error);
      }
    }
  }

  // Start the trading agent
  async start(intervalMs: number = 30000): Promise<void> {
    if (this.isRunning) {
      logger.warn('Trading agent is already running');
      return;
    }

    try {
      await this.initialize();
      
      this.isRunning = true;
      logger.info(`Starting trading agent with ${intervalMs}ms interval`);

      // Run immediately once
      await this.runTradingCycle();

      // Then run on interval
      this.intervalId = setInterval(async () => {
        try {
          await this.runTradingCycle();
        } catch (error) {
          logger.error('Error in trading cycle:', error);
        }
      }, intervalMs);

    } catch (error) {
      logger.error('Failed to start trading agent:', error);
      throw error;
    }
  }

  // Stop the trading agent
  stop(): void {
    if (!this.isRunning) {
      logger.warn('Trading agent is not running');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.info('Trading agent stopped');
  }

  // Main trading cycle
  private async runTradingCycle(): Promise<void> {
    try {
      logger.info('Starting trading cycle...');

      // Fetch market data
      const marketData = await this.client.getMarketData(this.config.defaultChain);
      if (marketData.length === 0) {
        logger.warn('No market data available');
        return;
      }

      // Get current balances
      const balances = await this.client.getBalances(this.config.defaultChain);
      logger.balance('Current balances:', balances);

      // Run all enabled strategies
      const allSignals: TradingSignal[] = [];
      for (const strategy of this.strategies) {
        if (strategy.isEnabled()) {
          try {
            const signals = await strategy.analyze(marketData);
            allSignals.push(...signals);
            logger.debug(`Strategy ${strategy.getName()} generated ${signals.length} signals`);
          } catch (error) {
            logger.error(`Error in strategy ${strategy.getName()}:`, error);
          }
        }
      }

      // Process signals and execute trades
      await this.processSignals(allSignals);

      logger.info('Trading cycle completed');
    } catch (error) {
      logger.error('Error in trading cycle:', error);
    }
  }

  // Process trading signals and execute trades
  private async processSignals(signals: TradingSignal[]): Promise<void> {
    if (signals.length === 0) {
      logger.info('No trading signals generated');
      return;
    }

    logger.info(`Processing ${signals.length} trading signals`);

    for (const signal of signals) {
      try {
        // Filter signals by confidence and available balance
        if (signal.confidence < 0.5) {
          logger.debug(`Skipping low confidence signal: ${signal.confidence}`);
          continue;
        }

        // Execute trade based on signal
        await this.executeSignal(signal);
      } catch (error) {
        logger.error(`Error processing signal for ${signal.token}:`, error);
      }
    }
  }

  // Execute a trading signal
  private async executeSignal(signal: TradingSignal): Promise<void> {
    try {
      // For demo purposes, we'll use USDC and WETH as trading pairs
      const fromToken = signal.action === 'buy' ? 'USDC' : 'WETH';
      const toToken = signal.action === 'buy' ? 'WETH' : 'USDC';

      const tradeRequest: TradeExecutionRequest = {
        fromToken,
        toToken,
        amount: signal.amount || '10', // Default amount
        reason: `${signal.action} signal: ${signal.reason}`,
        chain: this.config.defaultChain
      };

      logger.trade(`Executing ${signal.action} signal for ${signal.token}`, {
        signal,
        tradeRequest
      });

      const result = await this.client.executeTrade(tradeRequest);
      logger.trade(`Trade executed successfully`, result);

    } catch (error) {
      logger.error(`Failed to execute signal for ${signal.token}:`, error);
    }
  }

  // Add a new strategy
  addStrategy(strategyConfig: StrategyConfig): void {
    try {
      const strategy = StrategyFactory.createStrategy(strategyConfig);
      this.strategies.push(strategy);
      logger.info(`Added strategy: ${strategy.getName()}`);
    } catch (error) {
      logger.error(`Failed to add strategy ${strategyConfig.name}:`, error);
    }
  }

  // Remove a strategy
  removeStrategy(strategyName: string): void {
    const index = this.strategies.findIndex(s => s.getName().toLowerCase() === strategyName.toLowerCase());
    if (index !== -1) {
      const strategy = this.strategies.splice(index, 1)[0];
      logger.info(`Removed strategy: ${strategy.getName()}`);
    } else {
      logger.warn(`Strategy ${strategyName} not found`);
    }
  }

  // Get agent status
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      strategies: this.strategies.map(s => ({
        name: s.getName(),
        enabled: s.isEnabled(),
        description: s.getDescription()
      })),
      config: this.config
    };
  }

  // Get trade history
  async getTradeHistory(limit: number = 50): Promise<any[]> {
    return await this.client.getTradeHistory(limit, this.config.defaultChain);
  }

  // Get current positions
  async getPositions(): Promise<any[]> {
    return await this.client.getPositions(this.config.defaultChain);
  }
}
