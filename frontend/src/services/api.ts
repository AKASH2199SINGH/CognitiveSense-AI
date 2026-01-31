const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true, data: await response.json() };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export const api = {
  // Manual feature-based prediction
  predict: (features: Record<string, unknown>) =>
    request("/predict", {
      method: "POST",
      body: JSON.stringify(features),
    }),

  // Single live inference (poll-based)
  predictLive: () =>
    request("/predict_live", {
      method: "POST",
    }),
};

export { API_BASE_URL };
