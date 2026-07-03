export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export class ApiError extends Error {}

export async function apiFetch<T = void>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new ApiError(message || "Something went wrong. Please try again.");
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
