import { TradingSignal, MarketData, StrategyConfig } from '../types';

export abstract class BaseStrategy {
  protected config: StrategyConfig;
  protected name: string;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.name = config.name;
  }

  abstract analyze(marketData: MarketData[]): Promise<TradingSignal[]>;

  abstract getName(): string;

  abstract getDescription(): string;

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getConfig(): StrategyConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<StrategyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Helper method to calculate moving average
  protected calculateMovingAverage(prices: number[], period: number): number {
    if (prices.length < period) return NaN;
    const sum = prices.slice(-period).reduce((acc, val) => acc + val, 0);
    return sum / period;
  }

  // Helper method to calculate price change percentage
  protected calculatePriceChange(currentPrice: number, previousPrice: number): number {
    if (previousPrice === 0) return 0;
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  }

  // Helper method to normalize confidence score
  protected normalizeConfidence(score: number): number {
    return Math.max(0, Math.min(1, score));
  }
}
