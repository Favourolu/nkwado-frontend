import { apiClient } from "./api-client";
import type { VendorCategory } from "./types";

export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Vendor {
  id: string;
  businessName: string;
  businessType?: string | null;
  category: VendorCategory;
  description?: string | null;
  location?: string | null;
  phoneNumber?: string | null;
  priceRange?: string | null;
  services?: string[];
  status: VendorStatus;
  cacDocument?: string | null;
  supportingDocuments?: string[];
  profilePhotos?: string[];
  rejectionReason?: string | null;
  rating?: number;
  reviewCount?: number;
  listings?: unknown[];
}

export interface OnboardPayload {
  businessName: string;
  category: VendorCategory;
  description?: string;
  location?: string;
  phoneNumber?: string;
  priceRange?: string;
  services?: string[];
  cacDocument: File;
  supportingDocuments: File[];
  profilePhotos: File[];
}

export async function onboardVendor(payload: OnboardPayload) {
  const formData = new FormData();
  formData.append("businessName", payload.businessName);
  formData.append("category", payload.category);
  if (payload.description) formData.append("description", payload.description);
  if (payload.location) formData.append("location", payload.location);
  if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
  if (payload.priceRange) formData.append("priceRange", payload.priceRange);
  if (payload.services) formData.append("services", JSON.stringify(payload.services));
  formData.append("cacDocument", payload.cacDocument);
  payload.supportingDocuments.forEach((file) => formData.append("supportingDocuments", file));
  payload.profilePhotos.forEach((file) => formData.append("profilePhotos", file));

  const { data } = await apiClient.post<{ vendor: Vendor }>("/vendors/onboard", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.vendor;
}

export async function getVendorProfile() {
  const { data } = await apiClient.get<{ vendor: Vendor }>("/vendors/profile");
  return data.vendor;
}
