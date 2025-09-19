import { BaseStrategy } from './baseStrategy';
import { TradingSignal, MarketData, StrategyConfig } from '../types';
import { logger } from '../utils/logger';

export interface MovingAverageConfig extends StrategyConfig {
  parameters: {
    shortPeriod: number;
    longPeriod: number;
    minConfidence: number;
    maxPositionSize: number;
    tokens: string[];
  };
}

export class MovingAverageStrategy extends BaseStrategy {
  private priceHistory: Map<string, number[]> = new Map();

  constructor(config: MovingAverageConfig) {
    super(config);
  }

  getName(): string {
    return 'Moving Average Strategy';
  }

  getDescription(): string {
    return 'Uses short and long-term moving averages to generate buy/sell signals';
  }

  async analyze(marketData: MarketData[]): Promise<TradingSignal[]> {
    const signals: TradingSignal[] = [];
    const config = this.config as MovingAverageConfig;

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
      
      // Keep only recent history (last 100 prices)
      if (history.length > 100) {
        history.shift();
      }

      // Need enough data for both moving averages
      if (history.length < config.parameters.longPeriod) {
        continue;
      }

      const shortMA = this.calculateMovingAverage(history, config.parameters.shortPeriod);
      const longMA = this.calculateMovingAverage(history, config.parameters.longPeriod);

      if (isNaN(shortMA) || isNaN(longMA)) {
        continue;
      }

      const signal = this.generateSignal(data.token, price, shortMA, longMA, config);
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
    shortMA: number, 
    longMA: number, 
    config: MovingAverageConfig
  ): TradingSignal | null {
    const priceDiff = Math.abs(shortMA - longMA);
    const avgPrice = (shortMA + longMA) / 2;
    const relativeDiff = priceDiff / avgPrice;

    // Calculate confidence based on the strength of the crossover
    let confidence = this.normalizeConfidence(relativeDiff * 10);
    
    // Minimum confidence threshold
    if (confidence < config.parameters.minConfidence) {
      return null;
    }

    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let reason = '';

    if (shortMA > longMA) {
      // Golden cross - buy signal
      action = 'buy';
      reason = `Short MA (${shortMA.toFixed(4)}) > Long MA (${longMA.toFixed(4)})`;
    } else if (shortMA < longMA) {
      // Death cross - sell signal
      action = 'sell';
      reason = `Short MA (${shortMA.toFixed(4)}) < Long MA (${longMA.toFixed(4)})`;
    } else {
      return null; // No clear signal
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

  // Reset price history (useful for testing or strategy restart)
  resetHistory(): void {
    this.priceHistory.clear();
    logger.info('Price history reset for Moving Average Strategy');
  }

  // Get current price history for a token
  getPriceHistory(token: string): number[] {
    return this.priceHistory.get(token) || [];
  }
}
