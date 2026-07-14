import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (error.code === "ECONNABORTED") {
      return "This is taking longer than expected. Please try again in a moment.";
    }
    if (error.code === "ERR_NETWORK") {
      return "Couldn't reach the server. Please check your connection and try again.";
    }
  }
  return fallback;
}
