"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveVendor,
  getPendingVendors,
  rejectVendor,
  type PendingVendor,
} from "@/lib/admin-api";
import { VENDOR_CATEGORY_LABELS } from "@/lib/types";

export default function AdminVendorVettingPage() {
  const queryClient = useQueryClient();
  const [reviewing, setReviewing] = useState<PendingVendor | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: vendors, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-pending-vendors"],
    queryFn: getPendingVendors,
  });

  const closeDialog = () => {
    setReviewing(null);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  // Document links expire after 15 minutes, so always fetch a fresh copy of
  // the vendor's record right before showing them instead of trusting
  // whatever was in the list when it last loaded.
  const openReview = async (vendorId: string) => {
    const result = await refetch();
    const fresh = result.data?.find((v) => v.id === vendorId);
    setReviewing(fresh ?? vendors?.find((v) => v.id === vendorId) ?? null);
  };

  const approveMutation = useMutation({
    mutationFn: (vendorId: string) => approveVendor(vendorId),
    onSuccess: () => {
      toast.success("Vendor approved");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-vendors"] });
      closeDialog();
    },
    onError: () => toast.error("Couldn't approve vendor. Please try again."),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason: string }) =>
      rejectVendor(vendorId, reason),
    onSuccess: () => {
      toast.success("Vendor rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-vendors"] });
      closeDialog();
    },
    onError: () => toast.error("Couldn't reject vendor. Please try again."),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Vendor vetting</h1>
        <p className="text-muted-foreground">Review and approve pending vendor applications.</p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load pending vendors.</p>}
      {!isLoading && vendors && vendors.length === 0 && (
        <p className="text-muted-foreground">No vendors awaiting review.</p>
      )}

      {!isLoading && vendors && vendors.length > 0 && (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{vendor.businessName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category} · Submitted{" "}
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openReview(vendor.id)}>
                  Review
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(reviewing)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewing?.businessName}</DialogTitle>
          </DialogHeader>
          {reviewing && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {VENDOR_CATEGORY_LABELS[reviewing.category] ?? reviewing.category}
              </p>

              {reviewing.cacDocument && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">CAC document</p>
                  <a
                    href={reviewing.cacDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline underline-offset-4"
                  >
                    View document
                  </a>
                </div>
              )}

              {reviewing.supportingDocuments && reviewing.supportingDocuments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Supporting documents</p>
                  <ul className="space-y-1">
                    {reviewing.supportingDocuments.map((url, i) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline underline-offset-4"
                        >
                          Document {i + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reviewing.profilePhotos && reviewing.profilePhotos.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Profile photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {reviewing.profilePhotos.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={url}
                        src={url}
                        alt={reviewing.businessName}
                        className="aspect-square rounded-md object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {showRejectForm ? (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection reason</Label>
                  <Input
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Missing valid CAC document"
                  />
                </div>
              ) : null}

              <DialogFooter>
                {showRejectForm ? (
                  <>
                    <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={!rejectionReason.trim() || rejectMutation.isPending}
                      onClick={() =>
                        rejectMutation.mutate({ vendorId: reviewing.id, reason: rejectionReason })
                      }
                    >
                      {rejectMutation.isPending ? "Rejecting..." : "Confirm rejection"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="destructive" onClick={() => setShowRejectForm(true)}>
                      Reject
                    </Button>
                    <Button
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(reviewing.id)}
                    >
                      {approveMutation.isPending ? "Approving..." : "Approve"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
