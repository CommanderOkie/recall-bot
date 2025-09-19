// Core trading types
export interface Trade {
  id: string;
  fromToken: string;
  toToken: string;
  amount: string;
  price: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  reason?: string;
}

export interface Position {
  token: string;
  amount: string;
  value: string;
  chain: string;
}

export interface MarketData {
  token: string;
  price: string;
  volume24h: string;
  change24h: string;
  timestamp: number;
  chain: string;
}

export interface Balance {
  token: string;
  amount: string;
  chain: string;
  value: string;
}

// API Response types
export interface RecallApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}

export interface TradeExecutionRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  reason?: string;
  chain?: string;
}

export interface TradeExecutionResponse {
  tradeId: string;
  status: string;
  transactionHash?: string;
  gasUsed?: string;
}

// Strategy types
export interface TradingSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-1
  reason: string;
  token: string;
  amount?: string;
}

export interface StrategyConfig {
  name: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

// Agent configuration
export interface AgentConfig {
  apiKey: string;
  baseUrl: string;
  defaultChain: string;
  maxPositionSize: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
