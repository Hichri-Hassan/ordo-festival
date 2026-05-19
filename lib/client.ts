const PROFILE_KEY = "ordo_profile_id";

export function getStoredProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PROFILE_KEY);
}

export function setStoredProfileId(id: string): void {
  localStorage.setItem(PROFILE_KEY, id);
}

export function clearStoredProfileId(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Request failed", body.error);
  }
  return body as T;
}

export function isProfileNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.code === "PROFILE_NOT_FOUND";
}
