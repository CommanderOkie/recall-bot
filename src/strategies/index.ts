export { BaseStrategy } from './baseStrategy';
export { MovingAverageStrategy, MovingAverageConfig } from './movingAverageStrategy';
export { SimpleTriggerStrategy, SimpleTriggerConfig } from './simpleTriggerStrategy';

// Strategy factory for easy instantiation
import { StrategyConfig } from '../types';
import { BaseStrategy } from './baseStrategy';
import { MovingAverageStrategy, MovingAverageConfig } from './movingAverageStrategy';
import { SimpleTriggerStrategy, SimpleTriggerConfig } from './simpleTriggerStrategy';

export class StrategyFactory {
  static createStrategy(config: StrategyConfig): BaseStrategy {
    switch (config.name.toLowerCase()) {
      case 'moving_average':
        return new MovingAverageStrategy(config as MovingAverageConfig);
      case 'simple_trigger':
        return new SimpleTriggerStrategy(config as SimpleTriggerConfig);
      default:
        throw new Error(`Unknown strategy: ${config.name}`);
    }
  }

  static getAvailableStrategies(): string[] {
    return ['moving_average', 'simple_trigger'];
  }
}
