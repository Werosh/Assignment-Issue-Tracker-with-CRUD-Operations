const base = "";

export type ApiErrorBody = { error?: string; details?: unknown };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiErrorBody
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const headers = new Headers(init.headers);
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${path}`, { ...init, headers });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const body = (typeof data === "object" && data !== null ? data : {}) as ApiErrorBody;
    const message = typeof body.error === "string" ? body.error : res.statusText || "Request failed";
    throw new ApiError(message, res.status, body);
  }

  return data as T;
}
