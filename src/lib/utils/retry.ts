function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    attempts?: number;
    backoffMs?: number;
    onRetry?: (error: unknown, attempt: number) => void;
  } = {}
) {
  const attempts = options.attempts ?? 3;
  const backoffMs = options.backoffMs ?? 400;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) {
        break;
      }

      options.onRetry?.(error, attempt);
      await sleep(backoffMs * attempt);
    }
  }

  throw lastError;
}
