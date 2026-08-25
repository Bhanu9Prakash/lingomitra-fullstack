export class ProviderRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

function getStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { status?: unknown; statusCode?: unknown };
  const status = candidate.status ?? candidate.statusCode;
  return typeof status === "number" ? status : undefined;
}

function isRetryable(error: unknown): boolean {
  const status = getStatus(error);
  return status === 429 || (typeof status === "number" && status >= 500 && status < 600);
}

export async function withProviderRetry<T>(
  operation: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === attempts - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 350 * 2 ** attempt));
    }
  }

  throw lastError;
}

export function toSafeProviderError(
  error: unknown,
  fallback = "The coach is temporarily unavailable. Please try again.",
): ProviderRequestError {
  const status = getStatus(error);
  const name = error instanceof Error ? error.name : "";

  if (name === "AbortError" || name === "TimeoutError") {
    return new ProviderRequestError("The request took too long. Please try again.", status);
  }
  if (status === 429) {
    return new ProviderRequestError("The coach is busy right now. Please try again in a moment.", status);
  }
  if (status && status >= 500) {
    return new ProviderRequestError("The coach is temporarily unavailable. Please try again.", status);
  }
  return new ProviderRequestError(fallback, status);
}