export type RetryOptions = {
  timeoutMs: number;
  maxRetries: number;
  baseDelayMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

export async function fetchWithRetry(
  input: string,
  init: RequestInit,
  options: RetryOptions
): Promise<Response> {
  const { timeoutMs, maxRetries, baseDelayMs = 250 } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!isRetryableStatus(response.status) || attempt === maxRetries) {
        return response;
      }

      await sleep(baseDelayMs * 2 ** attempt);
      continue;
    } catch (error) {
      clearTimeout(timer);
      lastError = error instanceof Error ? error : new Error('Unknown network error');

      if (attempt === maxRetries) {
        throw lastError;
      }

      await sleep(baseDelayMs * 2 ** attempt);
    }
  }

  throw lastError ?? new Error('Retry loop failed unexpectedly');
}
