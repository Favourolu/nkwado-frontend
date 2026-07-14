import { apiClient } from "./api-client";
import type { BudgetRange, EventType } from "./types";

export interface QuestionnairePayload {
  eventType: EventType;
  eventDate?: string;
  guestCount?: number;
  location?: string;
  budgetRange: BudgetRange;
  specialRequirements?: string;
  questionnaire?: Record<string, string>;
}

export interface MatchedVendor {
  vendorId: string;
  category: string;
  businessName: string;
  basePrice: number;
  reason: string;
}

export interface EventRequest {
  id: string;
  eventType: EventType;
  eventDate?: string | null;
  guestCount?: number | null;
  location?: string | null;
  budgetRange: BudgetRange;
  specialRequirements?: string | null;
  status: string;
  aiMatchedVendors?: MatchedVendor[] | null;
  createdAt: string;
}

export async function submitQuestionnaire(payload: QuestionnairePayload) {
  const { data } = await apiClient.post<{ request: EventRequest }>(
    "/customers/questionnaire",
    payload
  );
  return data.request;
}

export async function getRequest(requestId: string) {
  const { data } = await apiClient.get<{ request: EventRequest }>(
    `/customers/requests/${requestId}`
  );
  return data.request;
}
