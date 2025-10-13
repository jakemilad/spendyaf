
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry
  } = options;

  let lastError: Error;
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;
    
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }
      
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError!,
    attempts
  };
}


export async function retryFetch(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<RetryResult<Response>> {
  return withRetry(async () => {
    const response = await fetch(url, init);
    
    if (!response.ok) {
      const responseClone = response.clone();
      const errorData = await responseClone.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      if (response.status === 503 || response.status >= 500) {
        throw new Error(`Server/Service error (${response.status}): ${errorMessage}`);
      }
      
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error (${response.status}): ${errorMessage}`);
      }
      
      throw new Error(`HTTP error (${response.status}): ${errorMessage}`);
    }
    
    return response;
  }, options);
}
