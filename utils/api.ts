
import { logger } from './logger';

export interface ApiConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    public message: string, 
    public status: number = 0, 
    public code: string = 'UNKNOWN_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_CONFIG: ApiConfig = {
  timeout: 15000,
  retries: 2,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, config: ApiConfig = {}): Promise<Response> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { timeout, retries, retryDelay } = finalConfig;
  
  let attempt = 0;
  
  while (true) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        ...options, 
        signal: config.signal || controller.signal,
        headers: {
          ...DEFAULT_CONFIG.headers,
          ...config.headers,
          ...options.headers
        }
      });
      clearTimeout(id);

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 429) {
           throw new ApiError('Too many requests. Please try again later.', 429, 'RATE_LIMIT');
        }
        if (response.status >= 500) {
           throw new ApiError(`Server error (${response.status}). Our team has been notified.`, response.status, 'SERVER_ERROR');
        }
        // Client errors (4xx)
        throw new ApiError(`Request failed (${response.status}): ${response.statusText}`, response.status, 'CLIENT_ERROR');
      }

      return response;
    } catch (error: any) {
      clearTimeout(id);
      attempt++;

      const isAbort = error.name === 'AbortError';
      const isNetwork = error instanceof TypeError; // fetch network errors
      const isServerError = error instanceof ApiError && error.code === 'SERVER_ERROR';
      const isRateLimit = error instanceof ApiError && error.code === 'RATE_LIMIT';

      // Decide whether to retry
      const shouldRetry = (isNetwork || isServerError || isRateLimit || isAbort) && attempt <= (retries || 0);

      if (!shouldRetry) {
        if (isAbort) throw new ApiError('Request timed out. Please try again.', 408, 'TIMEOUT');
        if (isNetwork) throw new ApiError('Connection failed. Please check your internet.', 0, 'NETWORK_ERROR');
        throw error;
      }

      logger.warn(`API attempt ${attempt} failed. Retrying in ${retryDelay}ms...`, error);
      await wait(retryDelay || 1000);
    }
  }
}

export const apiClient = {
  get: async <T>(url: string, config?: ApiConfig): Promise<T> => {
    const response = await fetchWithRetry(url, { method: 'GET' }, config);
    return response.json();
  },

  post: async <T>(url: string, data: any, config?: ApiConfig): Promise<T> => {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify(data)
    }, config);
    
    // Handle cases where response might be empty or not JSON
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {} as T;
    } catch {
        return {} as T;
    }
  }
};
