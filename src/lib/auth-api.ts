import { apiClient } from "./api-client";
import type { Role, User } from "./types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}
