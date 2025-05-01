import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface QueryFnOptions {
  on401?: "returnNull" | "throw";
}

/**
 * Creates a query function for TanStack Query that fetches from an API endpoint.
 * Handles common error cases.
 */
export function getQueryFn<T = any>({ on401 = "throw" }: QueryFnOptions = {}): QueryFunction<T> {
  return async ({ queryKey, signal }) => {
    const [url] = queryKey as [string, ...any[]];
    
    try {
      const response = await fetch(url, { signal });
      
      if (response.status === 401) {
        if (on401 === "returnNull") {
          return null as T;
        } else {
          throw new Error("Unauthorized");
        }
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Query was cancelled, don't rethrow
        throw new Error("Query was cancelled");
      }
      throw error;
    }
  };
}

/**
 * Helper function to make API requests with proper error handling
 */
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", 
  url: string, 
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data !== undefined) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  return response;
}