import { apiClient } from "./api-client";
import type { BudgetRange, EventType } from "./types";

export interface QuestionnairePayload {
  eventType: EventType;
  eventDate?: string;
  guestCount?: number;
  location?: string;
  budgetRange: BudgetRange;
  specialRequirements?: string;
  questionnaire?: Record<string, string | string[]>;
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

export interface CustomizePayload {
  selectedVendorIds: string[];
  notes?: string;
}

export async function customizeRequest(requestId: string, payload: CustomizePayload) {
  const { data } = await apiClient.post<{ request: EventRequest }>(
    `/customers/customize/${requestId}`,
    payload
  );
  return data.request;
}

export interface QuoteItemizationRow {
  item: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  vendorId: string;
  vendor: {
    businessName: string;
    category: string;
    rating?: number;
    location?: string;
  };
  basePrice: number;
  itemization?: QuoteItemizationRow[] | null;
  notes?: string | null;
  status: string;
  submittedAt?: string | null;
  deadlineAt?: string | null;
}

export async function getQuotes(requestId: string) {
  const { data } = await apiClient.get<{ quotes: Quote[] }>(
    `/customers/requests/${requestId}/quotes`
  );
  return data.quotes;
}

export interface Booking {
  id: string;
  requestId?: string;
  eventType: EventType;
  eventDate?: string | null;
  totalAmount: number;
  subtotal?: number;
  serviceCharge?: number;
  status: string;
  selectedVendors: { businessName: string; category: string }[];
  billPdfUrl?: string | null;
  createdAt: string;
}

export async function createBooking(requestId: string, selectedQuoteIds: string[]) {
  const { data } = await apiClient.post<{ booking: Booking }>(
    `/customers/booking/${requestId}`,
    { selectedQuoteIds }
  );
  return data.booking;
}

export async function getBookings() {
  const { data } = await apiClient.get<{ bookings: Booking[] }>("/customers/bookings");
  return data.bookings;
}

export type ProgressStepStatus = "completed" | "in_progress" | "pending";

export interface ProgressStep {
  name: string;
  status: ProgressStepStatus;
  date: string | null;
}

export interface Progress {
  stage: string;
  completed: string[];
  pending: string[];
  steps: ProgressStep[];
}

export async function getProgress(requestId: string) {
  const { data } = await apiClient.get<{ progress: Progress }>(
    `/customers/progress/${requestId}`
  );
  return data.progress;
}
