import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Trade, 
  Position, 
  MarketData, 
  Balance, 
  RecallApiResponse, 
  TradeExecutionRequest, 
  TradeExecutionResponse,
  AgentConfig 
} from '../types';
import { logger } from './logger';

export class RecallClient {
  private client: AxiosInstance;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Making API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`API response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Response interceptor error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Market Data Methods
  async getMarketData(chain?: string): Promise<MarketData[]> {
    try {
      const params = chain ? { chain } : {};
      const response: AxiosResponse<RecallApiResponse<MarketData[]>> = await this.client.get(
        '/api/market-data',
        { params }
      );
      
      if (response.data.success) {
        logger.info(`Fetched market data for ${chain || 'all chains'}`, { count: response.data.data.length });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch market data');
      }
    } catch (error) {
      logger.error('Error fetching market data:', error);
      throw error;
    }
  }

  async getTokenPrice(token: string, chain?: string): Promise<string> {
    try {
      const params = { token, ...(chain && { chain }) };
      const response: AxiosResponse<RecallApiResponse<{ price: string }>> = await this.client.get(
        '/api/price',
        { params }
      );
      
      if (response.data.success) {
        logger.debug(`Fetched price for token ${token}: ${response.data.data.price}`);
        return response.data.data.price;
      } else {
        throw new Error(response.data.error || 'Failed to fetch token price');
      }
    } catch (error) {
      logger.error(`Error fetching price for token ${token}:`, error);
      throw error;
    }
  }

  // Trading Methods
  async executeTrade(tradeRequest: TradeExecutionRequest): Promise<TradeExecutionResponse> {
    try {
      const payload = {
        ...tradeRequest,
        chain: tradeRequest.chain || this.config.defaultChain,
      };

      logger.trade('Executing trade', tradeRequest);
      
      const response: AxiosResponse<RecallApiResponse<TradeExecutionResponse>> = await this.client.post(
        '/api/trade/execute',
        payload
      );
      
      if (response.data.success) {
        logger.trade('Trade executed successfully', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to execute trade');
      }
    } catch (error) {
      logger.error('Error executing trade:', error);
      throw error;
    }
  }

  async getTradeHistory(limit: number = 50, chain?: string): Promise<Trade[]> {
    try {
      const params = { limit, ...(chain && { chain }) };
      const response: AxiosResponse<RecallApiResponse<Trade[]>> = await this.client.get(
        '/api/trades/history',
        { params }
      );
      
      if (response.data.success) {
        logger.info(`Fetched trade history`, { count: response.data.data.length });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch trade history');
      }
    } catch (error) {
      logger.error('Error fetching trade history:', error);
      throw error;
    }
  }

  async getTradeStatus(tradeId: string): Promise<Trade> {
    try {
      const response: AxiosResponse<RecallApiResponse<Trade>> = await this.client.get(
        `/api/trades/${tradeId}`
      );
      
      if (response.data.success) {
        logger.debug(`Fetched trade status for ${tradeId}`, response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch trade status');
      }
    } catch (error) {
      logger.error(`Error fetching trade status for ${tradeId}:`, error);
      throw error;
    }
  }

  // Balance and Position Methods
  async getBalances(chain?: string): Promise<Balance[]> {
    try {
      const params = chain ? { chain } : {};
      const response: AxiosResponse<RecallApiResponse<Balance[]>> = await this.client.get(
        '/api/balances',
        { params }
      );
      
      if (response.data.success) {
        logger.balance('Fetched balances', { count: response.data.data.length });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch balances');
      }
    } catch (error) {
      logger.error('Error fetching balances:', error);
      throw error;
    }
  }

  async getPositions(chain?: string): Promise<Position[]> {
    try {
      const params = chain ? { chain } : {};
      const response: AxiosResponse<RecallApiResponse<Position[]>> = await this.client.get(
        '/api/positions',
        { params }
      );
      
      if (response.data.success) {
        logger.info(`Fetched positions`, { count: response.data.data.length });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch positions');
      }
    } catch (error) {
      logger.error('Error fetching positions:', error);
      throw error;
    }
  }

  // Utility Methods
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      const isHealthy = response.status === 200;
      logger.info(`Health check: ${isHealthy ? 'PASSED' : 'FAILED'}`);
      return isHealthy;
    } catch (error) {
      logger.error('Health check failed:', error);
      return false;
    }
  }

  // Get supported chains
  async getSupportedChains(): Promise<string[]> {
    try {
      const response: AxiosResponse<RecallApiResponse<string[]>> = await this.client.get(
        '/api/chains'
      );
      
      if (response.data.success) {
        logger.info('Fetched supported chains', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch supported chains');
      }
    } catch (error) {
      logger.error('Error fetching supported chains:', error);
      throw error;
    }
  }
}
