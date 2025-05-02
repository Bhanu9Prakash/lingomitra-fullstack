import { QueryClient, QueryFunction, QueryKey } from "@tanstack/react-query";
import { apiRequest } from "./utils";

export { apiRequest };

type FetcherOptions = {
  on401?: "throw" | "returnNull";
};

/**
 * Global QueryClient instance for React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Default fetcher function for React Query
 * We don't set this as the default queryFn due to TypeScript compatibility issues,
 * but we can use it directly in useQuery calls
 */
export const getQueryFn =
  (options: FetcherOptions = {}) =>
  async ({ queryKey }: { queryKey: QueryKey }) => {
    const [url] = queryKey;
    if (typeof url !== 'string') {
      throw new Error('URL must be a string');
    }
    
    try {
      const response = await fetch(url, {
        credentials: "include", // Important for cookies/sessions
      });

      if (response.status === 401 && options.on401 === "returnNull") {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  };