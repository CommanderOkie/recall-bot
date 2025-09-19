import { BaseStrategy } from './baseStrategy';
import { TradingSignal, MarketData, StrategyConfig } from '../types';
import { logger } from '../utils/logger';

export interface SimpleTriggerConfig extends StrategyConfig {
  parameters: {
    buyThreshold: number; // Price increase percentage to trigger buy
    sellThreshold: number; // Price decrease percentage to trigger sell
    minConfidence: number;
    maxPositionSize: number;
    tokens: string[];
    lookbackPeriod: number; // Number of previous prices to compare against
  };
}

export class SimpleTriggerStrategy extends BaseStrategy {
  private priceHistory: Map<string, number[]> = new Map();

  constructor(config: SimpleTriggerConfig) {
    super(config);
  }

  getName(): string {
    return 'Simple Trigger Strategy';
  }

  getDescription(): string {
    return 'Triggers buy/sell based on price percentage changes from recent average';
  }

  async analyze(marketData: MarketData[]): Promise<TradingSignal[]> {
    const signals: TradingSignal[] = [];
    const config = this.config as SimpleTriggerConfig;

    for (const data of marketData) {
      // Only analyze configured tokens
      if (!config.parameters.tokens.includes(data.token)) {
        continue;
      }

      const price = parseFloat(data.price);
      if (isNaN(price)) continue;

      // Update price history
      if (!this.priceHistory.has(data.token)) {
        this.priceHistory.set(data.token, []);
      }
      
      const history = this.priceHistory.get(data.token)!;
      history.push(price);
      
      // Keep only recent history
      if (history.length > config.parameters.lookbackPeriod * 2) {
        history.shift();
      }

      // Need enough data for comparison
      if (history.length < config.parameters.lookbackPeriod) {
        continue;
      }

      const signal = this.generateSignal(data.token, price, history, config);
      if (signal) {
        signals.push(signal);
        logger.debug(`Generated signal for ${data.token}:`, signal);
      }
    }

    return signals;
  }

  private generateSignal(
    token: string, 
    currentPrice: number, 
    history: number[], 
    config: SimpleTriggerConfig
  ): TradingSignal | null {
    // Calculate average price over lookback period
    const recentPrices = history.slice(-config.parameters.lookbackPeriod);
    const avgPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    
    // Calculate price change percentage
    const priceChange = this.calculatePriceChange(currentPrice, avgPrice);
    
    // Calculate confidence based on how much the threshold is exceeded
    let confidence = 0;
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let reason = '';

    if (priceChange >= config.parameters.buyThreshold) {
      action = 'buy';
      confidence = this.normalizeConfidence(
        Math.min(priceChange / config.parameters.buyThreshold, 2.0)
      );
      reason = `Price increased ${priceChange.toFixed(2)}% above threshold (${config.parameters.buyThreshold}%)`;
    } else if (priceChange <= -config.parameters.sellThreshold) {
      action = 'sell';
      confidence = this.normalizeConfidence(
        Math.min(Math.abs(priceChange) / config.parameters.sellThreshold, 2.0)
      );
      reason = `Price decreased ${Math.abs(priceChange).toFixed(2)}% below threshold (${config.parameters.sellThreshold}%)`;
    }

    // Check minimum confidence threshold
    if (confidence < config.parameters.minConfidence) {
      return null;
    }

    // Calculate position size based on confidence
    const positionSize = Math.min(
      config.parameters.maxPositionSize * confidence,
      config.parameters.maxPositionSize
    );

    return {
      action,
      confidence,
      reason,
      token,
      amount: positionSize.toString()
    };
  }

  // Reset price history
  resetHistory(): void {
    this.priceHistory.clear();
    logger.info('Price history reset for Simple Trigger Strategy');
  }

  // Get current price history for a token
  getPriceHistory(token: string): number[] {
    return this.priceHistory.get(token) || [];
  }
}
