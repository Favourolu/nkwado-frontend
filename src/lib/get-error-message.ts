import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    // Prefer specific messaging for known status codes over the caller's
    // fallback, since a generic fallback like "Invalid email or password"
    // would be actively misleading for a rate limit or a booking conflict.
    if (error.response?.status === 429) {
      return "You've tried too many times. Please wait a bit and try again.";
    }
    if (error.response?.status === 409) {
      return "Someone else just booked this. Please refresh and try again.";
    }
    if (error.code === "ECONNABORTED") {
      return "This is taking longer than expected. Please try again in a moment.";
    }
    if (error.code === "ERR_NETWORK") {
      return "Couldn't reach the server. Please check your connection and try again.";
    }
  }
  return fallback;
}
