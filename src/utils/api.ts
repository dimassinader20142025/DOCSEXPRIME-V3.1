/**
 * Robust fetch utility with automatic retries and exponential backoff.
 * Prevents transient "Failed to fetch" errors during cold-starts or server compilation.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 5,
  delay = 1000
): Promise<Response> {
  let lastError: any = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      // Return response if it is successful (status in the range 200-299)
      if (response.ok) {
        return response;
      }
      // If server returned a 5xx error, we might want to retry as well
      if (response.status >= 500) {
        lastError = new Error(`Server returned status ${response.status}`);
      } else {
        // For 4xx errors, don't retry as they are client-side errors
        return response;
      }
    } catch (err: any) {
      lastError = err;
    }

    // Wait before retrying (exponential backoff)
    const backoffDelay = delay * Math.pow(1.5, i);
    await new Promise((resolve) => setTimeout(resolve, backoffDelay));
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts`);
}
