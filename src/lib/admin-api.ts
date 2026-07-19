import { apiClient } from "./api-client";
import type { BudgetRange, EventType, VendorCategory } from "./types";
import type { VendorStatus } from "./vendor-api";

export interface PendingVendor {
  id: string;
  userId: string;
  businessName: string;
  category: VendorCategory;
  status: VendorStatus;
  cacDocument?: string | null;
  supportingDocuments?: string[];
  profilePhotos?: string[];
  createdAt: string;
}

export async function getPendingVendors() {
  const { data } = await apiClient.get<{ vendors: PendingVendor[] }>("/admin/vendors/pending");
  return data.vendors;
}

export interface AdminVendor {
  id: string;
  businessName: string;
  businessType?: string | null;
  category: VendorCategory;
  status: VendorStatus;
  location?: string | null;
  phoneNumber?: string | null;
  priceRange?: string | null;
  contactName: string;
  contactEmail: string;
  rating: number | null;
  reviewCount: number;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface AdminVendorsPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AdminVendorFilters {
  status?: VendorStatus;
  category?: VendorCategory;
  limit?: number;
  offset?: number;
}

/** Every vendor on the app regardless of vetting status - not just the pending-review queue. */
export async function getAllVendors(filters: AdminVendorFilters = {}) {
  const { data } = await apiClient.get<{ vendors: AdminVendor[]; pagination: AdminVendorsPagination }>(
    "/admin/vendors",
    { params: filters }
  );
  return data;
}

export async function approveVendor(vendorId: string) {
  const { data } = await apiClient.post<{ vendor: PendingVendor }>(
    `/admin/vendors/${vendorId}/approve`
  );
  return data.vendor;
}

export async function rejectVendor(vendorId: string, rejectionReason: string) {
  const { data } = await apiClient.post<{ vendor: PendingVendor }>(
    `/admin/vendors/${vendorId}/reject`,
    { rejectionReason }
  );
  return data.vendor;
}

export interface DashboardMetrics {
  totalVendors: number;
  pendingVendors: number;
  approvedVendors: number;
  totalCustomers: number;
  activeRequests: number;
  completedBookings: number;
  totalRevenue: number;
  averageEventValue: number;
}

export async function getDashboardMetrics() {
  const { data } = await apiClient.get<{ metrics: DashboardMetrics }>("/admin/dashboard");
  return data.metrics;
}

export interface AdminRequest {
  id: string;
  customerId: string;
  customer: { firstName: string; lastName: string };
  eventType: EventType;
  eventDate?: string | null;
  budgetRange: BudgetRange;
  status: string;
  quoteCount: number;
  bookingStatus?: string | null;
  createdAt: string;
}

export interface AdminRequestFilters {
  status?: string;
  eventType?: string;
}

export async function getAdminRequests(filters: AdminRequestFilters = {}) {
  const { data } = await apiClient.get<{ requests: AdminRequest[] }>("/admin/requests", {
    params: filters,
  });
  return data.requests;
}

export interface AdminBookingVendor {
  businessName: string;
  category: VendorCategory;
}

export interface AdminBooking {
  id: string;
  customer: { firstName: string; lastName: string; email: string };
  eventType: EventType;
  eventDate?: string | null;
  selectedVendors: AdminBookingVendor[];
  subtotal: number;
  serviceCharge: number;
  totalAmount: number;
  status: string;
  paymentStatus?: string | null;
  createdAt: string;
}

export interface AdminBookingFilters {
  status?: string;
  startDate?: string;
}

export async function getAdminBookings(filters: AdminBookingFilters = {}) {
  const { data } = await apiClient.get<{ bookings: AdminBooking[] }>("/admin/bookings", {
    params: filters,
  });
  return data.bookings;
}
