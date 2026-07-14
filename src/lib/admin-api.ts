import { apiClient } from "./api-client";
import type { VendorCategory } from "./types";
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
