import { apiRequest } from "./http";
import type { UserPublic } from "../types/issue";

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

export async function register(body: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    token: null,
  });
}

export async function login(body: { email: string; password: string }): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    token: null,
  });
}

export async function fetchMe(): Promise<{ user: UserPublic }> {
  return apiRequest("/api/auth/me");
}
