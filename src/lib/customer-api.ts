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

export interface VendorDetails {
  id: string;
  businessName: string;
  category: string;
  description?: string | null;
  location?: string | null;
  priceRange?: string | null;
  services?: string[];
  rating?: number | null;
  reviewCount?: number | null;
  // Photo URLs are short-lived (expire ~15 min) — fetch fresh via this
  // endpoint whenever they need to be shown, never cache/persist them.
  photos?: string[];
}

export async function getVendorDetails(vendorId: string) {
  const { data } = await apiClient.get<{ vendor: VendorDetails }>(
    `/customers/vendors/${vendorId}`
  );
  return data.vendor;
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
  // AI vendor matching can take much longer than the default request timeout.
  const { data } = await apiClient.post<{ request: EventRequest }>(
    "/customers/questionnaire",
    payload,
    { timeout: 60000 }
  );
  return data.request;
}

export async function getRequest(requestId: string) {
  const { data } = await apiClient.get<{ request: EventRequest }>(
    `/customers/requests/${requestId}`
  );
  return data.request;
}

export async function getRequests() {
  const { data } = await apiClient.get<{ requests: EventRequest[] }>("/customers/requests");
  return data.requests;
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

export type PaymentMethod = "FULL_PAYMENT" | "FINANCED";

export type LoanStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DISBURSED";

export interface LoanApplication {
  id: string;
  bookingId?: string | null;
  planId: string;
  amount: number;
  monthlyPayment?: number;
  totalRepayable?: number;
  tenorMonths?: number;
  status: LoanStatus;
  createdAt: string;
  updatedAt?: string | null;
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
  paymentMethod?: PaymentMethod;
  loanApplication?: LoanApplication | null;
  selectedVendors: { businessName: string; category: string }[];
  billPdfUrl?: string | null;
  createdAt: string;
}

export interface CreateBookingPayload {
  selectedQuoteIds: string[];
  paymentMethod: PaymentMethod;
  planId?: string;
}

export async function createBooking(requestId: string, payload: CreateBookingPayload) {
  const { data } = await apiClient.post<{ booking: Booking }>(
    `/customers/booking/${requestId}`,
    payload
  );
  return data.booking;
}

export async function getBookings() {
  const { data } = await apiClient.get<{ bookings: Booking[] }>("/customers/bookings");
  return data.bookings;
}

export interface FinancingPlan {
  id: string;
  tenorMonths: number;
  monthlyPayment: number;
  totalRepayable: number;
  interestRate?: number;
}

export async function getFinancingOptions(amount: number) {
  const { data } = await apiClient.get<{ plans: FinancingPlan[] }>(
    "/customers/financing-options",
    { params: { amount } }
  );
  return data.plans;
}

export async function getLoans() {
  const { data } = await apiClient.get<{ loans: LoanApplication[] }>("/customers/loans");
  return data.loans;
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
